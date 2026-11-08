/* api/kelas.js - Token suara Kelas online (LiveKit) dan izin bicara (fungsi Vercel, runtime edge).
   Butuh variabel lingkungan di Vercel: LIVEKIT_URL (wss://...), LIVEKIT_API_KEY, LIVEKIT_API_SECRET.
   POST {aksi:'token', kelas, nama, idToken?}            → {url, token, identity, admin}
        Admin (pemilik / daftar config/admin) boleh berbicara; jamaah hanya mendengar. Tamu tanpa akun boleh mendengar.
   POST {aksi:'izin', kelas, idToken, identity, boleh}  → izinkan / cabut izin bicara seorang jamaah (khusus admin). */
export const config = { runtime: 'edge' };

const PID = 'fadzkuruuni-88a8b';
const PEMILIK = ['hilmykia@gmail.com', 'ponpesfadzkuruuni@gmail.com'];
const FS = `https://firestore.googleapis.com/v1/projects/${PID}/databases/(default)/documents`;
const JSONH = { 'content-type': 'application/json', 'cache-control': 'no-store' };
const jawab = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: JSONH });

const b64u = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64uTeks = s => b64u(new TextEncoder().encode(s));
const dariB64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));

async function jwt(payload, rahasia) {
  const kepala = b64uTeks(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + b64uTeks(JSON.stringify(payload));
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(rahasia), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return kepala + '.' + b64u(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(kepala)));
}

/* Verifikasi ID token Firebase (RS256, kunci publik Google) */
let JWKS = null, JWKT = 0;
async function verifikasi(t) {
  try {
    const [h, p, s] = t.split('.'); const H = JSON.parse(new TextDecoder().decode(dariB64u(h))), P = JSON.parse(new TextDecoder().decode(dariB64u(p)));
    if (!JWKS || Date.now() - JWKT > 3600e3) { JWKS = (await (await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')).json()).keys; JWKT = Date.now(); }
    const j = JWKS.find(x => x.kid == H.kid); if (!j) return null;
    const k = await crypto.subtle.importKey('jwk', j, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    if (!await crypto.subtle.verify('RSASSA-PKCS1-v1_5', k, dariB64u(s), new TextEncoder().encode(h + '.' + p))) return null;
    const n = Date.now() / 1000;
    if (P.aud != PID || P.iss != 'https://securetoken.google.com/' + PID || P.exp < n || !P.sub) return null;
    return P;
  } catch (e) { return null; }
}
async function adminkah(P, t) {
  if (!P || !P.email || !P.email_verified) return false;
  const e = P.email.toLowerCase(); if (PEMILIK.includes(e)) return true;
  try {
    const r = await fetch(FS + '/config/admin', { headers: { authorization: 'Bearer ' + t } }); if (!r.ok) return false;
    const d = await r.json();
    return ((d.fields?.emails?.arrayValue?.values) || []).some(v => String(v.stringValue || '').toLowerCase() == e);
  } catch (x) { return false; }
}

export default async function handler(req) {
  if (req.method != 'POST') return jawab({ galat: 'metode' }, 405);
  const { LIVEKIT_API_KEY: KEY, LIVEKIT_API_SECRET: RHS } = process.env;
  /* Alamat project LiveKit boleh ditulis tanpa wss:// (seperti di dashboard LiveKit) */
  let URL_ = String(process.env.LIVEKIT_URL || '').trim().replace(/\/+$/, '');
  if (URL_ && !/^wss?:\/\//.test(URL_)) URL_ = 'wss://' + URL_.replace(/^https?:\/\//, '');
  if (!URL_ || !KEY || !RHS) return jawab({ galat: 'belum-siap' }, 503);
  let b; try { b = await req.json(); } catch (e) { return jawab({ galat: 'isi' }, 400); }
  if (b.aksi == 'cek') return jawab({ siap: true });
  const id = String(b.kelas || ''); if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) return jawab({ galat: 'kelas' }, 400);
  const kr = await fetch(FS + '/kelas/' + id); if (!kr.ok) return jawab({ galat: 'kelas-tidak-ada' }, 404);
  const status = (await kr.json()).fields?.status?.stringValue || 'jadwal';
  const P = b.idToken ? await verifikasi(String(b.idToken)) : null, admin = await adminkah(P, b.idToken), n = Math.floor(Date.now() / 1000), room = 'kelas-' + id;

  if (b.aksi == 'token') {
    if (status != 'live' && !admin) return jawab({ galat: 'belum-mulai' }, 409);
    const identity = P ? P.sub : 'tamu-' + crypto.randomUUID().slice(0, 8);
    const token = await jwt({
      iss: KEY, sub: identity, name: String(b.nama || 'Jamaah').slice(0, 40), nbf: n - 10, exp: n + 6 * 3600,
      video: { room, roomJoin: true, canSubscribe: true, canPublish: admin, canPublishData: true, canUpdateOwnMetadata: true },
      attributes: { peran: admin ? 'ustaz' : 'jamaah' }
    }, RHS);
    return jawab({ url: URL_, token, identity, admin });
  }
  if (b.aksi == 'izin') {
    if (!admin) return jawab({ galat: 'bukan-admin' }, 403);
    const t = await jwt({ iss: KEY, sub: 'server', nbf: n - 10, exp: n + 60, video: { room, roomAdmin: true } }, RHS);
    const r = await fetch(URL_.replace(/^ws/, 'http').replace(/\/$/, '') + '/twirp/livekit.RoomService/UpdateParticipant', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + t },
      body: JSON.stringify({ room, identity: String(b.identity || ''), permission: { canSubscribe: true, canPublish: !!b.boleh, canPublishData: true, canUpdateMetadata: true } })
    });
    return r.ok ? jawab({ ok: true }) : jawab({ galat: 'livekit-' + r.status }, 502);
  }
  return jawab({ galat: 'aksi' }, 400);
}
