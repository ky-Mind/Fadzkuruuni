/* api/ai.js - Server AI online untuk halaman Tanya AI (fungsi Vercel, runtime edge).
   Meneruskan percakapan ke Groq (gratis, cepat) dan mengalirkan jawabannya kembali ke aplikasi.
   API key disimpan di Vercel sebagai variabel lingkungan GROQ_API_KEY, tidak pernah dikirim ke HP pengguna.
   Lihat PANDUAN-AI.md untuk cara memasang key. */
export const config = { runtime: 'edge' };

/* Model dicoba berurutan; bila satu tidak tersedia untuk akun ini, pakai berikutnya */
const MODEL = ['openai/gpt-oss-120b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
const ASAL = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const SISTEM = `Kamu adalah "Fadz AI", asisten tanya-jawab di aplikasi ibadah Fadzkuruuni milik Pondok Pesantren Fadzkuruuni.
Jawab dalam bahasa Indonesia yang santun, ringkas, dan mudah dipahami santri maupun masyarakat umum.
Pegang manhaj Ahlussunnah wal Jama'ah; untuk fikih utamakan mazhab Syafi'i dan sebutkan bila ada perbedaan pendapat.
Bila menyebut ayat, tulis nama surah dan nomor ayatnya; bila menyebut hadis, sebutkan perawinya. Jangan mengarang dalil, nomor hadis, atau kutipan kitab; bila tidak yakin, katakan terus terang.
Bila ada "Isi aplikasi yang terkait", utamakan isi itu dan sarankan pengguna membukanya di aplikasi.
Untuk masalah hukum yang rumit atau pribadi (waris, nikah, talak, dsb.), sarankan bertanya langsung kepada ustadz atau kiai.
Tolak dengan sopan pertanyaan yang tidak pantas atau di luar etika Islam.
Jawab ringkas (sekitar 150 kata) kecuali pengguna meminta rincian. Untuk doa, tulis teks Arab, latin, dan artinya.
Jangan menambahkan amalan, jumlah bacaan, atau tata cara yang tidak kamu yakini dalilnya.
Jangan menyebut frasa "Isi aplikasi yang terkait" dan jangan menyebut fitur yang tidak ada di aplikasi (misalnya audio doa); cukup sarankan membuka menu yang sesuai.`;

/* Pengetahuan tetap tentang aplikasi: menu dan letak fitur, agar AI bisa menunjukkan jalan di dalam aplikasi */
const PANDUAN = `Tentang aplikasi Fadzkuruuni (web: fadzkuruuni.vercel.app, bisa dipasang di HP dan dipakai offline):
- Menu bawah: Beranda, Al-Qur'an, Tanya AI, Kalender, Pengaturan. Semua fitur lain ada di Beranda (pintasan) dan "Semua Menu".
- Beranda: sapaan, jam & jadwal salat hari ini dengan hitung mundur, pintasan, pencarian, Doa hari ini, lanjutkan membaca.
- Al-Qur'an: 114 surah, mode Kartu (12 ayat per halaman, geser kiri-kanan) dan mode Mushaf, terjemah & latin, audio murattal Syaikh Mishary Alafasy, ketuk ayat untuk menandai/putar/bagikan, daftar Penanda.
- Wirid & Doa: wirid harian, sholawat, Asmaul Husna (99 nama beserta makna & dalil), istighasah, ratib, hizib, dan doa-doa keseharian.
- Tahlil & Yasin; Maulid (Diba'i, Barzanji, Syarafil Anam, Simtud Durar, Qasidah Burdah, Adl-Dliya'ul Lami'): teks Arab, latin, arti, bisa diunduh PDF untuk dicetak.
- Kitab Kuning: kitab karya pondok (Al-Hawi) dan kitab klasik; Hadits Nabi (kitab hadis & info sanad/derajat).
- Jadwal Salat & Kiblat (kompas), pengingat adzan & notifikasi di Pengaturan > Waktu Salat & Notifikasi.
- Zakat & Sedekah, Kalkulator Zakat (emas, perak, penghasilan, perdagangan, fitrah), Kalkulator Waris, Tasbih digital (juga tasbih melayang), Kalender Hijriah, Kata Mutiara.
- Pengaturan: Akun (masuk Google/Facebook/Email, sinkron cloud), Tampilan (tema Terang/Gelap/Biru, ukuran huruf), Offline & Data (unduh semua konten untuk offline), Tentang & Bantuan.
- Laporkan masalah: di Tentang & Bantuan; bisa menandai bagian halaman yang salah dan melampirkan foto.
Bila pengguna bertanya cara memakai fitur, jelaskan langkahnya dengan nama menu di atas.`;

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
  /* Profil pengguna dan keadaan saat ini (nama panggilan, lokasi, tanggal, jadwal salat hari ini) dari aplikasi */
  const profil = typeof b.profil === 'string' && b.profil ? '\n\nTentang pengguna dan saat ini:\n' + b.profil.slice(0, 1500) + '\nSapa pengguna dengan namanya bila ada, secukupnya (tidak di setiap kalimat).' : '';

  let r, info = '';
  for (const model of MODEL) {
    r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { authorization: 'Bearer ' + key.trim(), 'content-type': 'application/json' },
      body: JSON.stringify({ model, stream: true, temperature: 0.4, max_tokens: 1024, ...(model.startsWith('openai/') ? { reasoning_effort: 'low' } : {}), messages: [{ role: 'system', content: SISTEM + '\n\n' + PANDUAN + profil + konteks }, ...pesan] })
    });
    if (r.ok) break;
    try { info = ((await r.json()).error || {}).message || ''; } catch (e) { info = ''; }
    if (r.status !== 404 && r.status !== 400) break;
  }
  if (!r.ok) return json({ galat: r.status === 429 ? 'sibuk' : 'Layanan AI sedang bermasalah (' + r.status + ')', info: info.slice(0, 200) }, r.status === 429 ? 429 : 502);
  /* Aliran SSE dari Groq diteruskan apa adanya; aplikasi membaca "data: {...}" per baris */
  return new Response(r.body, { headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-store' } });
}
