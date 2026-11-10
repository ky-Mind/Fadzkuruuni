/* api/unduhan.js - Jumlah unduhan APK per versi dari GitHub Releases (fungsi Vercel, runtime edge).
   Dipakai dashboard admin (tab Statistik). GitHub dibatasi 60 permintaan/jam per alamat tanpa login, jadi hasilnya
   disimpan di cache Vercel 10 menit: seberapa sering pun dashboard dibuka, GitHub hanya ditanya sesekali.
   GET → {rilis:[[tag, jumlah], ...], t: waktu-ambil-ms} */
export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    const r = await fetch('https://api.github.com/repos/ky-Mind/Fadzkuruuni/releases?per_page=100', {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'fadzkuruuni-statistik' },
    });
    if (!r.ok)
      return new Response(JSON.stringify({ galat: 'github-' + r.status }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      });
    const j = await r.json();
    const rilis = j
      .map((x) => [
        x.tag_name,
        (x.assets || []).filter((a) => /\.apk$/i.test(a.name)).reduce((t, a) => t + a.download_count, 0),
      ])
      .filter((x) => x[1] > 0);
    return new Response(JSON.stringify({ rilis, t: Date.now() }), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, s-maxage=600, stale-while-revalidate=3600',
        'access-control-allow-origin': '*',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ galat: 'jaringan' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
}
