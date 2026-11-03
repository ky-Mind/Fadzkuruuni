/* api/stt.js - Ubah rekaman suara Fadz AI menjadi teks (fungsi Vercel, runtime edge).
   Aplikasi mengirim berkas audio apa adanya (webm/ogg/mp4 dari perekam HP); diteruskan ke Whisper di Groq
   dengan kunci GROQ_API_KEY yang sama dengan api/ai.js. Lebih andal di HP daripada pengenalan suara bawaan browser. */
export const config = { runtime: 'edge' };

const MODEL = ['whisper-large-v3-turbo', 'whisper-large-v3'];
const ASAL = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const MAKS = 4 * 1024 * 1024;
/* Petunjuk ejaan istilah keagamaan agar Whisper menulisnya dengan benar */
const PETUNJUK = 'Pertanyaan berbahasa Indonesia tentang Islam: salat, wudu, zakat, doa, Al-Qur\'an, surah Yasin, tahlil, maulid, sholawat, hadis, fikih, mazhab Syafi\'i, Fadzkuruuni.';

const json = (o, s) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });
const ekstensi = t => /mp4|m4a|aac/.test(t) ? 'm4a' : /ogg/.test(t) ? 'ogg' : /wav/.test(t) ? 'wav' : /mpeg|mp3/.test(t) ? 'mp3' : 'webm';

export default async function handler(req) {
  if (req.method !== 'POST') return json({ galat: 'Gunakan POST' }, 405);
  const asal = req.headers.get('origin') || '';
  if (asal && !ASAL.test(asal)) return json({ galat: 'Asal permintaan tidak diizinkan' }, 403);
  const key = process.env.GROQ_API_KEY;
  if (!key) return json({ galat: 'belum-dipasang' }, 503);

  const jenis = (req.headers.get('content-type') || 'audio/webm').split(';')[0].trim();
  if (!jenis.startsWith('audio/') && !jenis.startsWith('video/')) return json({ galat: 'Kirim berkas audio' }, 415);
  const data = await req.arrayBuffer();
  if (data.byteLength < 800) return json({ galat: 'kosong' }, 400);
  if (data.byteLength > MAKS) return json({ galat: 'Rekaman terlalu panjang' }, 413);

  let r, info = '';
  for (const model of MODEL) {
    const fd = new FormData();
    fd.append('file', new Blob([data], { type: jenis }), 'suara.' + ekstensi(jenis));
    fd.append('model', model);
    fd.append('language', 'id');
    fd.append('temperature', '0');
    fd.append('prompt', PETUNJUK);
    fd.append('response_format', 'json');
    r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { authorization: 'Bearer ' + key.trim() }, body: fd });
    if (r.ok) break;
    try { info = ((await r.json()).error || {}).message || ''; } catch (e) { info = ''; }
    if (r.status !== 404 && r.status !== 400) break;
  }
  if (!r.ok) return json({ galat: r.status === 429 ? 'sibuk' : 'Pengenal suara bermasalah (' + r.status + ')', info: info.slice(0, 200) }, r.status === 429 ? 429 : 502);
  const h = await r.json();
  return json({ teks: String(h.text || '').trim() }, 200);
}
