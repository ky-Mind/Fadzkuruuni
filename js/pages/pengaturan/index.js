/* js/pages/pengaturan/index.js - Pengaturan: pusat kelompok (tiap kelompok ada di berkas sendiri)
   Urutan menurut seberapa sering dibuka: akun paling atas, lalu pengaturan harian, pengetahuan, lalu Tentang & Bantuan paling bawah.
   Kunci berawalan '#' adalah tautan ke halaman lain, bukan kelompok Pengaturan. */
const SETGROUPS = [
  ['akun', 'user', 'Akun & Profil', 'Masuk dengan Google atau Email, dan nama panggilan'],
  ['salat', 'bell', 'Waktu Salat & Notifikasi', 'Lokasi, izin, adzan, dan pengingat'],
  ['tampilan', 'moon', 'Tampilan & Bacaan', 'Tema, ukuran teks, terjemah, tasbih melayang'],
  ['offline', 'down', 'Offline & Data', "Mode offline: unduh Al-Qur'an, audio, kitab, maulid"],
  ['izin', 'shield', 'Izin Aplikasi', 'Notifikasi, lokasi, mikrofon, kamera, penyimpanan'],
  ['beranda', 'home', 'Beranda', 'Kata-kata yang bergulir di bawah jam'],
  ['#/hadits/info', 'book', 'Info sanad & derajat hadis', 'Arti sanad, rawi, sahih, hasan, dan daif'],
  ['tentang', 'info', 'Tentang & Bantuan', 'Tentang aplikasi dan laporan masalah'],
];
const SETPAGES = {};
/* Kelompok seperti Pengaturan Instagram: judul kecil abu-abu, pemisah tebal antar kelompok. Urutan kelompok mengikuti
   urutan item (bisa diatur admin). */
const SETKEL = [
  ['Akun Anda', ['akun']],
  ['Ibadah & pengingat', ['salat']],
  ['Tampilan & konten', ['tampilan', 'beranda']],
  ['Data & perangkat', ['offline', 'izin']],
  ['Info & bantuan', ['#/hadits/info', 'tentang']],
];
const setBaris = (x) =>
  `<a class="row${(TATA.sembunyiSet || []).includes(x[0]) ? ' tah' : ''}" data-ta="set:${x[0]}" href="${x[0][0] == '#' ? x[0] : '#/pengaturan/' + x[0]}"><span class="si">${ic(x[1], 20)}</span><span class="t">${esc(x[2])}<br><small>${x[3]}</small></span>${ic('next', 18)}</a>`;
function setKelompok(L) {
  L = L.filter((x) => x[0] != 'akun');
  const kel = (k) => (SETKEL.find((g) => g[1].includes(k)) || ['Lainnya'])[0],
    G = [];
  L.forEach((x) => {
    const n = kel(x[0]);
    let g = G.find((y) => y[0] == n);
    if (!g) G.push((g = [n, []]));
    g[1].push(x);
  });
  return G.map(
    (g) => `<section class="setg"><h3>${esc(g[0])}</h3><div class="list">${g[1].map(setBaris).join('')}</div></section>`
  ).join('');
}
/* Halaman pengaturan panjang dibagi seperti pengaturan Instagram: halaman utama hanya daftar ringkas, tiap bagian
   (kumpulan <h2>) dibuka di subhalamannya sendiri. Isi lengkap tetap dipasang (bagian lain disembunyikan) agar semua
   pengikat di init() tetap bekerja. G = [[kunci, ikon, judul, keterangan, [judul h2 …] | fungsi(judulH2)], …]. */
function setBagi(pg, judul, induk, sub, G) {
  const S2 = pg.html.split(/(?=<h2>)/),
    kepala = S2[0] && !S2[0].startsWith('<h2>') ? S2.shift() : '',
    milik = (g, t) => (typeof g[4] == 'function' ? g[4](t) : g[4].includes(t)),
    jdl = (x) => (x.match(/^<h2>([\s\S]*?)<\/h2>/) || [])[1] || '';
  const g = G.find((x) => x[0] == sub);
  if (!g)
    return {
      html:
        head(judul, induk) +
        kepala +
        `<div class="list">${G.filter((x) => S2.some((b) => milik(x, jdl(b))))
          .map((x) => setBaris(['#/pengaturan/' + pg.kunci + '/' + x[0], x[1], x[2], x[3]]))
          .join('')}</div><div hidden>${S2.join('')}</div>`,
      init: pg.init,
    };
  const punya = S2.filter((b) => milik(g, jdl(b))).length;
  return {
    html:
      head(g[2], '#/pengaturan/' + pg.kunci) +
      S2.map((b) => {
        const t = jdl(b),
          ok = milik(g, t);
        return `<section class="sbag"${ok ? '' : ' hidden'}>${ok && punya == 1 ? b.replace(/^<h2>[\s\S]*?<\/h2>/, '') : b}</section>`;
      }).join(''),
    init: pg.init,
  };
}
P.pengaturan = (g, h) => {
  if (SETPAGES[g]) return SETPAGES[g](h);
  const adm = TADMON && TDRAF;
  const ph = `<a class="setpro" href="#/pengaturan/akun">${avatarHtml(64)}<span class="t"><b>${esc(S.nm || (FBU && FBU.displayName) || 'Pengguna Fadzkuruuni')}</b><br><small>${FBU ? esc(FBU.email || 'Sudah masuk') : 'Belum masuk · ketuk untuk masuk'}</small></span>${ic('next', 18)}</a>`;
  return {
    html:
      head('Pengaturan', '#/') +
      ph +
      `<label class="setcari">${ic('search', 18)}<input type="search" id="setq" placeholder="Cari" autocomplete="off"></label>` +
      (adm
        ? `<div class="list">${SETGROUPS.slice()
            .sort(
              (p, q) =>
                (TATA.setelan || SETGROUPS.map((x) => x[0])).indexOf(p[0]) -
                (TATA.setelan || SETGROUPS.map((x) => x[0])).indexOf(q[0])
            )
            .map(setBaris)
            .join('')}</div>`
        : setKelompok(tataSetelan())) +
      '<p class="mut setkosong" hidden>Tidak ada pengaturan yang cocok.</p>',
    /* Cari: saring item menurut judul & keterangan; kelompok yang kosong disembunyikan */
    init() {
      const q = $('#setq');
      if (!q) return;
      q.oninput = () => {
        const t = q.value.trim().toLowerCase();
        let ada = 0;
        $$('#view .row[data-ta]').forEach((r) => {
          const ok = !t || r.textContent.toLowerCase().includes(t);
          r.hidden = !ok;
          ada += ok;
        });
        $$('#view .setg').forEach((s) => (s.hidden = !$$('.row[data-ta]:not([hidden])', s).length));
        $('#view .setkosong').hidden = !!ada;
      };
    },
  };
};
/* Setelah status akun termuat, perbarui kepala profil di halaman Pengaturan */
addEventListener('fbu', () => {
  if (location.hash == '#/pengaturan') route();
});
