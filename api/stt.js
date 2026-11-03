/* api/stt.js - Ubah rekaman suara Fadz AI menjadi teks (fungsi Vercel, runtime edge).
   Aplikasi mengirim berkas audio apa adanya (webm/ogg/mp4 dari perekam HP); diteruskan ke Whisper di Groq
   dengan kunci GROQ_API_KEY yang sama dengan api/ai.js. Lebih andal di HP daripada pengenalan suara bawaan browser. */
export const config = { runtime: 'edge' };

/* large-v3 (lebih teliti untuk ucapan campuran Indonesia-Arab) didahulukan; turbo sebagai cadangan */
const MODEL = ['whisper-large-v3', 'whisper-large-v3-turbo'];
const ASAL = /^https:\/\/([a-z0-9-]+\.)*vercel\.app$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const MAKS = 4 * 1024 * 1024;
/* Petunjuk ejaan: daftar istilah (bukan kalimat), agar Whisper menulis salam & istilah keagamaan dengan benar.
   Bila suara tidak jelas Whisper kadang mengulang petunjuk ini; hasil seperti itu dibuang di bawah (mirip()). */
const PETUNJUK = "Assalamu'alaikum, wa'alaikumussalam, bismillah, alhamdulillah, insya Allah, masya Allah, salat, wudu, zakat, doa, Al-Qur'an, Yasin, tahlil, maulid, sholawat, hadis, Fadzkuruuni.";
/* Kalimat yang sering "dikarang" Whisper saat hening atau berisik */
const HALU = /^(selamat menikmati|terima kasih (sudah|telah) menonton|terima kasih\.?|sampai jumpa|jangan lupa (like|subscribe)|subtitle|terjemahan oleh|pertanyaan berbahasa|thank you|thanks for watching|bye)[.!]?$/i;
const norm = t => t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
/* Hasil hanya mengulang potongan petunjuk = suara tidak tertangkap */
const mirip = t => { const n = norm(t); return n.length > 0 && norm(PETUNJUK).includes(n) && n.split(' ').length > 3; };

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

  /* ?p=1 memakai petunjuk istilah (uji coba); bawaan tanpa petunjuk karena petunjuk bisa 'diulang' Whisper saat suara kurang jelas */
  const petunjuk = new URL(req.url).searchParams.get('p') === '1';
  let r, info = '';
  for (const model of MODEL) {
    const fd = new FormData();
    fd.append('file', new Blob([data], { type: jenis }), 'suara.' + ekstensi(jenis));
    fd.append('model', model);
    fd.append('language', 'id');
    fd.append('temperature', '0');
    if (petunjuk) fd.append('prompt', PETUNJUK);
    fd.append('response_format', 'verbose_json');
    r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { authorization: 'Bearer ' + key.trim() }, body: fd });
    if (r.ok) break;
    try { info = ((await r.json()).error || {}).message || ''; } catch (e) { info = ''; }
    if (r.status !== 404 && r.status !== 400) break;
  }
  if (!r.ok) return json({ galat: r.status === 429 ? 'sibuk' : 'Pengenal suara bermasalah (' + r.status + ')', info: info.slice(0, 200) }, r.status === 429 ? 429 : 502);
  const h = await r.json();
  /* Buang potongan yang kemungkinan besar bukan ucapan (hening/berisik), kalimat karangan, dan pengulangan petunjuk */
  const seg = Array.isArray(h.segments) ? h.segments.filter(x => !((x.no_speech_prob ?? 0) > 0.6 && (x.avg_logprob ?? 0) < -0.7) && (x.compression_ratio ?? 1) < 2.6) : null;
  let teks = String(seg ? seg.map(x => x.text).join(' ') : h.text || '').replace(/\s+/g, ' ').trim();
  if (HALU.test(teks) || mirip(teks)) teks = '';
  /* Ringkasan keyakinan per potongan (untuk menyetel saringan; tidak berisi data pribadi) */
  const ukur = (h.segments || []).map(x => [+(x.no_speech_prob ?? -1).toFixed(3), +(x.avg_logprob ?? 0).toFixed(2), +(x.compression_ratio ?? 0).toFixed(2), String(x.text || '').slice(0, 40)]);
  return json({ teks, ukur }, 200);
}
