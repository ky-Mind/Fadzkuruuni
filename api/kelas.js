/* api/kelas.js - Token suara Kelas online (LiveKit) dan izin bicara (fungsi Vercel, runtime edge).
   Butuh variabel lingkungan di Vercel: LIVEKIT_URL (wss://...), LIVEKIT_API_KEY, LIVEKIT_API_SECRET.
   POST {aksi:'token', kelas, nama, idToken?}            → {url, token, identity, admin}
        Admin (pemilik / daftar config/admin) boleh berbicara; jamaah hanya mendengar. Tamu tanpa akun boleh mendengar.
   POST {aksi:'izin', kelas, idToken, identity, boleh}  → izinkan / cabut izin bicara seorang jamaah (khusus admin). */
import { FS, jawab, b64u, b64uTeks, verifikasi, adminkah } from './_firebase.js';

export const config = { runtime: 'edge' };

async function jwt(payload, rahasia) {
  const kepala = b64uTeks(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + b64uTeks(JSON.stringify(payload));
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(rahasia), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return kepala + '.' + b64u(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(kepala)));
}

export default async function handler(req) {
  if (req.method != 'POST') return jawab({ galat: 'metode' }, 405);
  /* Spasi / baris baru yang ikut tersalin dibuang */
  const KEY = String(process.env.LIVEKIT_API_KEY || '').trim(), RHS = String(process.env.LIVEKIT_API_SECRET || '').trim();
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
      video: { room, roomJoin: true, canSubscribe: true, canPublish: true, canPublishSources: admin ? ['camera', 'microphone', 'screen_share', 'screen_share_audio'] : ['camera', 'screen_share', 'screen_share_audio'], canPublishData: true, canUpdateOwnMetadata: true },
      attributes: { peran: admin ? 'ustaz' : 'jamaah' }
    }, RHS);
    return jawab({ url: URL_, token, identity, admin });
  }
  if (b.aksi == 'izin') {
    if (!admin) return jawab({ galat: 'bukan-admin' }, 403);
    const t = await jwt({ iss: KEY, sub: 'server', nbf: n - 10, exp: n + 60, video: { room, roomAdmin: true } }, RHS);
    const r = await fetch(URL_.replace(/^ws/, 'http').replace(/\/$/, '') + '/twirp/livekit.RoomService/UpdateParticipant', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + t },
      body: JSON.stringify({ room, identity: String(b.identity || ''), permission: { canSubscribe: true, canPublish: true, canPublishSources: b.boleh ? ['CAMERA', 'MICROPHONE', 'SCREEN_SHARE', 'SCREEN_SHARE_AUDIO'] : ['CAMERA', 'SCREEN_SHARE', 'SCREEN_SHARE_AUDIO'], canPublishData: true, canUpdateMetadata: true } })
    });
    return r.ok ? jawab({ ok: true }) : jawab({ galat: 'livekit-' + r.status }, 502);
  }
  return jawab({ galat: 'aksi' }, 400);
}
