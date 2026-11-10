/* api/_firebase.js - Bagian bersama fungsi Vercel (bukan endpoint: berkas berawalan _ tidak dijadikan rute).
   Verifikasi ID token Firebase, cek admin, dan alamat Firestore REST. Dipakai api/kelas.js dan api/push.js. */
export const PID = 'fadzkuruuni-88a8b';
export const PEMILIK = ['hilmykia@gmail.com', 'ponpesfadzkuruuni@gmail.com'];
export const FS = `https://firestore.googleapis.com/v1/projects/${PID}/databases/(default)/documents`;
const JSONH = { 'content-type': 'application/json', 'cache-control': 'no-store' };
export const jawab = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: JSONH });

export const b64u = (b) =>
  btoa(String.fromCharCode(...new Uint8Array(b)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
export const b64uTeks = (s) => b64u(new TextEncoder().encode(s));
export const dariB64u = (s) =>
  Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) =>
    c.charCodeAt(0)
  );

/* Verifikasi ID token Firebase (RS256, kunci publik Google). Hasil: isi token, atau null bila tidak sah */
let JWKS = null,
  JWKT = 0;
export async function verifikasi(t) {
  try {
    const [h, p, s] = String(t).split('.');
    const H = JSON.parse(new TextDecoder().decode(dariB64u(h))),
      P = JSON.parse(new TextDecoder().decode(dariB64u(p)));
    if (!JWKS || Date.now() - JWKT > 3600e3) {
      JWKS = (
        await (
          await fetch('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
        ).json()
      ).keys;
      JWKT = Date.now();
    }
    const j = JWKS.find((x) => x.kid == H.kid);
    if (!j) return null;
    const k = await crypto.subtle.importKey('jwk', j, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, [
      'verify',
    ]);
    if (!(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', k, dariB64u(s), new TextEncoder().encode(h + '.' + p))))
      return null;
    const n = Date.now() / 1000;
    if (P.aud != PID || P.iss != 'https://securetoken.google.com/' + PID || P.exp < n || !P.sub) return null;
    return P;
  } catch (e) {
    return null;
  }
}

/* Admin = pemilik, atau email di dokumen config/admin (dibaca dengan token pengguna itu sendiri).
   akses (opsional): kategori yang dibutuhkan, mis. 'kelas'. Admin tanpa kategori tersimpan dianggap 'semua' (sama dengan firestore.rules). */
export async function adminkah(P, t, akses) {
  if (!P || !P.email || !P.email_verified) return false;
  const e = P.email.toLowerCase();
  if (PEMILIK.includes(e)) return true;
  try {
    const r = await fetch(FS + '/config/admin', { headers: { authorization: 'Bearer ' + t } });
    if (!r.ok) return false;
    const d = await r.json();
    if (!(d.fields?.emails?.arrayValue?.values || []).some((v) => String(v.stringValue || '').toLowerCase() == e))
      return false;
    if (!akses) return true;
    const L = d.fields?.akses?.mapValue?.fields?.[e]?.arrayValue?.values;
    const A = L ? L.map((v) => v.stringValue) : ['semua'];
    return A.includes('semua') || A.includes(akses);
  } catch (x) {
    return false;
  }
}
