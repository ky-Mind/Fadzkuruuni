/* api/push.js - Notifikasi kelas online (fungsi Vercel, runtime edge), agar pemberitahuan kelas tetap muncul
   walau situs / aplikasi Fadzkuruuni sedang ditutup (seperti notifikasi adzan).
   Dua jalur, masing-masing aktif bila variabel lingkungannya ada di Vercel:
   1) Peramban (Web Push): VAPID_PUBLIC dan VAPID_PRIVATE (dari `npx web-push generate-vapid-keys`).
      Langganan tiap peramban disimpan di Firestore koleksi `langganan` (lihat firestore.rules); hanya admin yang bisa
      membacanya, jadi daftar dibaca dengan ID token admin yang memicunya.
   2) Aplikasi Android (Firebase Cloud Messaging): FIREBASE_SA = isi JSON kunci service account Firebase.
      Pesan data dikirim ke topik "kelas" (semua HP berlangganan, lihat KelasPesan.java di aplikasi).
   POST {aksi:'kunci'}                              → {kunci} kunci publik VAPID untuk pushManager.subscribe (null bila belum diatur)
   POST {aksi:'status'}                             → pemeriksaan tanpa mengirim apa pun: {web, android} ('ok' atau sebab gagal);
                                                       FCM diuji dengan validate_only (pesan divalidasi, tidak dikirim ke HP)
   POST {aksi:'kirim', kelas, jenis, idToken}       → khusus admin; jenis 'baru' (jadwal baru) atau 'mulai' (kelas dimulai)
                                                       → {terkirim, gagal, dibuang, android} */
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

/* ---------- Firebase Cloud Messaging (aplikasi Android) ---------- */
let AKSES = null, AKSEST = 0;
async function tokenAkses(sa) {
  if (AKSES && Date.now() < AKSEST) return AKSES;
  const n = Math.floor(Date.now() / 1000);
  const isi = b64uTeks(JSON.stringify({ alg: 'RS256', typ: 'JWT' })) + '.' + b64uTeks(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: 'https://oauth2.googleapis.com/token', iat: n, exp: n + 3600 }));
  const der = dariB64u(sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '').replace(/\+/g, '-').replace(/\//g, '_'));
  const k = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const jwt = isi + '.' + b64u(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', k, teks(isi)));
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt });
  const j = await r.json(); if (!j.access_token) throw new Error('oauth ' + r.status);
  AKSES = j.access_token; AKSEST = Date.now() + (j.expires_in - 120) * 1000; return AKSES;
}
/* Pesan data (bukan notifikasi) berprioritas tinggi ke topik "kelas": aplikasi yang menampilkan notifikasinya */
/* Isi FIREBASE_SA dibaca seluwes mungkin: JSON apa adanya, JSON yang baris private_key-nya berubah jadi baris baru sungguhan
   saat ditempel, terbungkus tanda kutip, atau dalam bentuk base64 */
function bacaSA(t) {
  const coba = s => { try { const o = JSON.parse(s); return typeof o == 'string' ? JSON.parse(o) : o; } catch (e) { return null; } };
  t = t.trim().replace(/^'([\s\S]*)'$/, '$1');
  return coba(t)
    || coba(t.replace(/("private_key"\s*:\s*")([\s\S]*?)(")/, (m, a, k, b) => a + k.replace(/\r?\n/g, '\\n') + b))
    || coba(t.replace(/\r?\n/g, ' ').replace(/(-----BEGIN PRIVATE KEY-----)([\s\S]*?)(-----END PRIVATE KEY-----)/, (m, a, k, b) => a + k.replace(/ /g, '\\n') + b))
    || (/^[A-Za-z0-9+/=\s]+$/.test(t) ? coba(atob(t.replace(/\s+/g, ''))) : null);
}
/* Keterangan bentuk isi (tanpa membuka isinya) untuk pemeriksaan */
const bentukSA = t => `panjang ${t.length} karakter, diawali "${t.trim()[0] || ''}", diakhiri "${t.trim().slice(-1)}", ${/private_key/.test(t) ? 'ada' : 'tidak ada'} private_key`;

async function kirimAndroid(saTeks, data, uji = false) {
  const sa = bacaSA(saTeks);
  if (!sa) return 'FIREBASE_SA bukan JSON yang utuh (' + bentukSA(saTeks) + ')';
  if (!sa.private_key || !sa.client_email || !sa.project_id) return 'FIREBASE_SA tidak berisi private_key / client_email / project_id';
  let t; try { t = await tokenAkses(sa); } catch (e) { return 'kunci service account ditolak Google (' + e.message + ')'; }
  try {
    const r = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
      method: 'POST', headers: { authorization: 'Bearer ' + t, 'content-type': 'application/json' },
      body: JSON.stringify({ validate_only: uji, message: { topic: 'kelas', data, android: { priority: 'HIGH', ttl: '86400s' } } })
    });
    if (r.ok) return 'ok';
    const g = await r.json().catch(() => ({}));
    return 'FCM ' + r.status + ': ' + String(g.error?.message || '').slice(0, 160);
  } catch (e) { return 'FCM tidak terjangkau'; }
}

const tgl = ms => new Date(ms).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export default async function handler(req) {
  if (req.method != 'POST') return jawab({ galat: 'metode' }, 405);
  const PUB = String(process.env.VAPID_PUBLIC || '').trim(), PRIV = String(process.env.VAPID_PRIVATE || '').trim(), SA = String(process.env.FIREBASE_SA || '').trim();
  let b; try { b = await req.json(); } catch (e) { return jawab({ galat: 'isi' }, 400); }
  if (b.aksi == 'kunci') return jawab({ kunci: PUB && PRIV ? PUB : null });
  if (b.aksi == 'status') return jawab({ web: PUB && PRIV ? 'ok' : 'VAPID_PUBLIC / VAPID_PRIVATE belum diatur', android: SA ? await kirimAndroid(SA, { uji: '1' }, true) : 'FIREBASE_SA belum diatur' });
  if (b.aksi != 'kirim') return jawab({ galat: 'aksi' }, 400);
  if (!(PUB && PRIV) && !SA) return jawab({ galat: 'belum-siap' }, 503);
  const t = String(b.idToken || ''), P = await verifikasi(t);
  if (!await adminkah(P, t)) return jawab({ galat: 'bukan-admin' }, 403);
  const id = String(b.kelas || ''); if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return jawab({ galat: 'kelas' }, 400);
  const kr = await fetch(FS + '/kelas/' + id); if (!kr.ok) return jawab({ galat: 'kelas-tidak-ada' }, 404);
  const f = (await kr.json()).fields || {}, judul = f.judul?.stringValue || 'Kelas online', oleh = f.pengajar?.stringValue || '';
  const mulai = +(f.mulai?.integerValue || f.mulai?.doubleValue || 0);
  const P_ = b.jenis == 'mulai'
    ? { judul: 'Kelas online dimulai', isi: judul + (oleh ? ' · ' + oleh : '') + '. Ketuk untuk bergabung.', url: './#/kelas/' + id, tag: 'kelas-' + id }
    : { judul: 'Jadwal kelas baru', isi: judul + (mulai ? ' · ' + tgl(mulai) : '') + (oleh ? ' · ' + oleh : ''), url: './#/kelas/' + id, tag: 'kelas-' + id };
  const pesan = JSON.stringify(P_);
  const android = SA ? kirimAndroid(SA, { judul: P_.judul, isi: P_.isi, id, jenis: String(b.jenis || 'baru') }) : Promise.resolve('belum-siap');
  const L = PUB && PRIV ? await daftarLangganan(t) : [];
  let terkirim = 0, gagal = 0, dibuang = 0;
  /* Dikirim bertahap 20 sekaligus */
  for (let i = 0; i < L.length; i += 20) {
    const H = await Promise.all(L.slice(i, i + 20).map(x => kirimSatu(x, pesan, PUB, PRIV)));
    await Promise.all(H.map((h, j) => {
      if (h == 'ok') terkirim++; else if (h == 'gagal') gagal++;
      else { dibuang++; return fetch('https://firestore.googleapis.com/v1/' + L[i + j].nama, { method: 'DELETE', headers: { authorization: 'Bearer ' + t } }).catch(() => {}); }
    }));
  }
  return jawab({ terkirim, gagal, dibuang, android: await android });
}
