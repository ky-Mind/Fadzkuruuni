/* api/ai.js - Server AI online untuk halaman Tanya AI (fungsi Vercel, runtime edge).
   Meneruskan percakapan ke Groq (gratis, cepat) dan mengalirkan jawabannya kembali ke aplikasi.
   API key disimpan di Vercel sebagai variabel lingkungan GROQ_API_KEY, tidak pernah dikirim ke HP pengguna.
   Lihat PANDUAN-AI.md untuk cara memasang key. */
export const config = { runtime: 'edge' };

const MODEL = 'llama-3.3-70b-versatile';
const ASAL = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const SISTEM = `Kamu adalah "Asisten Fadzkuruuni", asisten tanya-jawab di aplikasi ibadah Fadzkuruuni milik Pondok Pesantren Fadzkuruuni.
Jawab dalam bahasa Indonesia yang santun, ringkas, dan mudah dipahami santri maupun masyarakat umum.
Pegang manhaj Ahlussunnah wal Jama'ah; untuk fikih utamakan mazhab Syafi'i dan sebutkan bila ada perbedaan pendapat.
Bila menyebut ayat, tulis nama surah dan nomor ayatnya; bila menyebut hadis, sebutkan perawinya. Jangan mengarang dalil, nomor hadis, atau kutipan kitab; bila tidak yakin, katakan terus terang.
Bila ada "Isi aplikasi yang terkait", utamakan isi itu dan sarankan pengguna membukanya di aplikasi.
Untuk masalah hukum yang rumit atau pribadi (waris, nikah, talak, dsb.), sarankan bertanya langsung kepada ustadz atau kiai.
Tolak dengan sopan pertanyaan yang tidak pantas atau di luar etika Islam.`;

const json = (o, s) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });

export default async function handler(req) {
  if (req.method !== 'POST') return json({ galat: 'Gunakan POST' }, 405);
  const asal = req.headers.get('origin') || '';
  if (asal && !ASAL.test(asal)) return json({ galat: 'Asal permintaan tidak diizinkan' }, 403);
  const key = process.env.GROQ_API_KEY;
  if (!key) return json({ galat: 'belum-dipasang' }, 503);

  let b;
  try { b = await req.json(); } catch (e) { return json({ galat: 'Data tidak valid' }, 400); }
  /* Batasi panjang percakapan agar hemat kuota gratis */
  const pesan = (Array.isArray(b.pesan) ? b.pesan : [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-10).map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!pesan.length || pesan[pesan.length - 1].role !== 'user') return json({ galat: 'Tidak ada pertanyaan' }, 400);
  const konteks = typeof b.konteks === 'string' && b.konteks ? '\n\nIsi aplikasi yang terkait:\n' + b.konteks.slice(0, 4000) : '';

  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + key, 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, stream: true, temperature: 0.4, max_tokens: 1024, messages: [{ role: 'system', content: SISTEM + konteks }, ...pesan] })
  });
  if (!r.ok) return json({ galat: r.status === 429 ? 'sibuk' : 'Layanan AI sedang bermasalah (' + r.status + ')' }, r.status === 429 ? 429 : 502);
  /* Aliran SSE dari Groq diteruskan apa adanya; aplikasi membaca "data: {...}" per baris */
  return new Response(r.body, { headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-store' } });
}
