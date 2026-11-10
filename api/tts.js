/* api/tts.js - Suara cadangan untuk "Dengarkan" jawaban Fadz AI (fungsi Vercel, runtime edge).
   Dipakai bila mesin suara HP tidak ada atau tidak bersuara (sering di aplikasi Android). GET ?t=<teks> (maks. 900 huruf)
   → audio/mpeg berbahasa Indonesia. Teks dipecah per ±180 huruf (batas layanan suara) lalu potongan MP3 digabung. */
export const config = { runtime: 'edge' };

const ASAL =
  /^https:\/\/([a-z0-9-]+\.)*vercel\.app$|^https:\/\/fadzkuruuni\.xianzing\.my\.id$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const MAKS = 900,
  POTONG = 180;

/* Pecah di batas kalimat/koma/spasi agar tidak memotong kata */
function pecah(t) {
  const L = [];
  let s = t.trim();
  while (s.length > POTONG) {
    let i = Math.max(s.lastIndexOf('. ', POTONG), s.lastIndexOf(', ', POTONG), s.lastIndexOf('; ', POTONG));
    if (i < 60) i = s.lastIndexOf(' ', POTONG);
    if (i < 1) i = POTONG;
    L.push(s.slice(0, i + 1).trim());
    s = s.slice(i + 1).trim();
  }
  if (s) L.push(s);
  return L;
}

export default async function handler(req) {
  const asal = req.headers.get('origin') || '';
  if (asal && !ASAL.test(asal)) return new Response('Asal permintaan tidak diizinkan', { status: 403 });
  const t = (new URL(req.url).searchParams.get('t') || '').replace(/\s+/g, ' ').trim().slice(0, MAKS);
  if (!t) return new Response('Teks kosong', { status: 400 });
  try {
    const bag = await Promise.all(
      pecah(t).map(async (q) => {
        const r = await fetch(
          'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=id&q=' + encodeURIComponent(q),
          {
            headers: {
              'user-agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36',
            },
          }
        );
        if (!r.ok) throw new Error('suara ' + r.status);
        return new Uint8Array(await r.arrayBuffer());
      })
    );
    const all = new Uint8Array(bag.reduce((n, b) => n + b.length, 0));
    let o = 0;
    for (const b of bag) {
      all.set(b, o);
      o += b.length;
    }
    return new Response(all, { headers: { 'content-type': 'audio/mpeg', 'cache-control': 'public, max-age=86400' } });
  } catch (e) {
    return new Response('Suara tidak tersedia', { status: 502 });
  }
}
