/* api/push.js - Notifikasi kelas online lewat Web Push (fungsi Vercel, runtime edge), agar pemberitahuan kelas
   tetap muncul walau situs Fadzkuruuni sedang ditutup (seperti notifikasi aplikasi biasa).
   Butuh variabel lingkungan di Vercel: VAPID_PUBLIC dan VAPID_PRIVATE (pasangan kunci dari `npx web-push generate-vapid-keys`).
   Langganan tiap peramban disimpan di Firestore koleksi `langganan` (lihat firestore.rules); hanya admin yang bisa membacanya,
   jadi pengiriman memakai ID token admin yang memicunya (tanpa service account).
   POST {aksi:'kunci'}                              → {kunci} kunci publik VAPID untuk pushManager.subscribe (null bila belum diatur)
   POST {aksi:'kirim', kelas, jenis, idToken}       → khusus admin; jenis 'baru' (jadwal baru) atau 'mulai' (kelas dimulai)
                                                       → {terkirim, gagal, dibuang} */
import { FS, jawab, b64u, b64uTeks, dariB64u, verifikasi, adminkah } from './_firebase.js';

export const config = { runtime: 'edge' };

const KONTAK = 'mailto:ponpesfadzkuruuni@gmail.com';
const teks = s => new TextEncoder().encode(s);
const gabung = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };
const hkdf = async (garam, ikm, info, n) => new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: garam, info },
  await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']), n * 8));

/* Tanda tangan VAPID (JWT ES256) untuk asal layanan push (mis. https://fcm.googleapis.com) */
async function vapid(asal, pub, priv) {
  const P = dariB64u(pub), k = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', d: priv, x: b64u(P.slice(1, 33)), y: b64u(P.slice(33, 65)), ext: true },
    { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const isi = b64uTeks(JSON.stringify({ typ: 'JWT', alg: 'ES256' })) + '.' + b64uTeks(JSON.stringify({ aud: asal, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: KONTAK }));
  return isi + '.' + b64u(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, k, teks(isi)));
}

/* Enkripsi pesan untuk satu peramban (RFC 8291, aes128gcm) */
async function enkripsi(L, pesan) {
  const ua = dariB64u(L.p256dh), rahasia = dariB64u(L.auth);
  const kp = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const as = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
  const uaK = await crypto.subtle.importKey('raw', ua, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const bersama = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaK }, kp.privateKey, 256));
  const ikm = await hkdf(rahasia, bersama, gabung(teks('WebPush: info\0'), ua, as), 32);
  const garam = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(garam, ikm, teks('Content-Encoding: aes128gcm\0'), 16), nonce = await hkdf(garam, ikm, teks('Content-Encoding: nonce\0'), 12);
  const kunci = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const sandi = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, kunci, gabung(teks(pesan), new Uint8Array([2]))));
  return gabung(garam, new Uint8Array([0, 0, 16, 0]), new Uint8Array([65]), as, sandi);
}

/* Kirim ke satu peramban. Hasil: 'ok', 'buang' (langganan sudah tidak berlaku), atau 'gagal' */
async function kirimSatu(L, pesan, pub, priv) {
  try {
    const u = new URL(L.endpoint);
    const r = await fetch(L.endpoint, {
      method: 'POST', body: await enkripsi(L, pesan),
      headers: { authorization: `vapid t=${await vapid(u.origin, pub, priv)}, k=${pub}`, 'content-encoding': 'aes128gcm', 'content-type': 'application/octet-stream', ttl: '86400', urgency: 'high' }
    });
    return r.ok ? 'ok' : (r.status == 404 || r.status == 410) ? 'buang' : 'gagal';
  } catch (e) { return 'gagal'; }
}

/* Semua langganan (dibaca dengan token admin) */
async function daftarLangganan(t) {
  const L = []; let hal = '';
  for (let i = 0; i < 20; i++) {
    const r = await fetch(FS + '/langganan?pageSize=300' + (hal ? '&pageToken=' + encodeURIComponent(hal) : ''), { headers: { authorization: 'Bearer ' + t } });
    if (!r.ok) break;
    const d = await r.json();
    for (const x of d.documents || []) { const f = x.fields || {}; if (f.endpoint && f.p256dh && f.auth) L.push({ nama: x.name, endpoint: f.endpoint.stringValue, p256dh: f.p256dh.stringValue, auth: f.auth.stringValue }); }
    if (!(hal = d.nextPageToken)) break;
  }
  return L;
}

const tgl = ms => new Date(ms).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export default async function handler(req) {
  if (req.method != 'POST') return jawab({ galat: 'metode' }, 405);
  const PUB = String(process.env.VAPID_PUBLIC || '').trim(), PRIV = String(process.env.VAPID_PRIVATE || '').trim();
  let b; try { b = await req.json(); } catch (e) { return jawab({ galat: 'isi' }, 400); }
  if (b.aksi == 'kunci') return jawab({ kunci: PUB && PRIV ? PUB : null });
  if (b.aksi != 'kirim') return jawab({ galat: 'aksi' }, 400);
  if (!PUB || !PRIV) return jawab({ galat: 'belum-siap' }, 503);
  const t = String(b.idToken || ''), P = await verifikasi(t);
  if (!await adminkah(P, t)) return jawab({ galat: 'bukan-admin' }, 403);
  const id = String(b.kelas || ''); if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return jawab({ galat: 'kelas' }, 400);
  const kr = await fetch(FS + '/kelas/' + id); if (!kr.ok) return jawab({ galat: 'kelas-tidak-ada' }, 404);
  const f = (await kr.json()).fields || {}, judul = f.judul?.stringValue || 'Kelas online', oleh = f.pengajar?.stringValue || '';
  const mulai = +(f.mulai?.integerValue || f.mulai?.doubleValue || 0);
  const pesan = JSON.stringify(b.jenis == 'mulai'
    ? { judul: 'Kelas online dimulai', isi: judul + (oleh ? ' · ' + oleh : '') + '. Ketuk untuk bergabung.', url: './#/kelas/' + id, tag: 'kelas-' + id }
    : { judul: 'Jadwal kelas baru', isi: judul + (mulai ? ' · ' + tgl(mulai) : '') + (oleh ? ' · ' + oleh : ''), url: './#/kelas/' + id, tag: 'kelas-' + id });
  const L = await daftarLangganan(t);
  let terkirim = 0, gagal = 0, dibuang = 0;
  /* Dikirim bertahap 20 sekaligus */
  for (let i = 0; i < L.length; i += 20) {
    const H = await Promise.all(L.slice(i, i + 20).map(x => kirimSatu(x, pesan, PUB, PRIV)));
    await Promise.all(H.map((h, j) => {
      if (h == 'ok') terkirim++; else if (h == 'gagal') gagal++;
      else { dibuang++; return fetch('https://firestore.googleapis.com/v1/' + L[i + j].nama, { method: 'DELETE', headers: { authorization: 'Bearer ' + t } }).catch(() => {}); }
    }));
  }
  return jawab({ terkirim, gagal, dibuang });
}
