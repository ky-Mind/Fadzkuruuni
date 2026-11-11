/* js/router.js - Router, dan pendaftaran service worker */
const applyNav = () => document.body.classList.toggle('nav-off', S.sb === false);
/* Pindah halaman: isi lama keluar bertahap satu per satu, lalu isi baru masuk bertahap. Muat ulang halaman yang sama
   tidak dianimasikan. */
const gerakOff = () => matchMedia('(prefers-reduced-motion:reduce)').matches;
let RT = 0;
/* Riwayat halaman di dalam aplikasi: tombol kembali (di aplikasi maupun tombol kembali HP) menuju halaman asal, mis.
   Kalkulator zakat → Semua Menu bila dibuka dari Semua Menu, → Beranda bila dibuka dari Beranda */
/* Disimpan di sessionStorage: setelah muat ulang, kembali/geser tetap menuju halaman asal yang sama (mis. Semua Menu) */
const RIW = (() => {
  try {
    const r = JSON.parse(sessionStorage.fzRiw || '[]');
    return Array.isArray(r) ? r : [];
  } catch (e) {
    return [];
  }
})();
const riwSimpan = () => {
  try {
    sessionStorage.fzRiw = JSON.stringify(RIW);
    sessionStorage.fzDm = window.DARIMENU || '';
  } catch (e) {}
};
/* Sesi baca berurutan: semua halaman di dalamnya dianggap satu langkah, sehingga kembali (tombol ← maupun tombol kembali HP) langsung keluar
   ke halaman asal bacaan, bukan menelusuri bagian demi bagian. Maulid: #/maulid/<id>/<bagian>, #/jeda/<id>/<k>, dan sholawat yang dibuka dari jeda
   (#/bacaan/w/1/…, #/shf/…) selama jeda berlangsung. Bacaan lain (wirid, tahlil, kitab, hadis) memakai aturan halaman saudara di bawah. */
const sesiBaca = (h) => {
  const [a, b, c] = (h || '').slice(2).split('/');
  if (a == 'maulid' && b && c != null) return 'maulid:' + b;
  if (a == 'jeda' && b) return 'maulid:' + b;
  if (typeof JEDA != 'undefined' && JEDA && (a == 'shf' || (a == 'bacaan' && b == 'w' && c == '1')))
    return 'maulid:' + JEDA.id;
  return '';
};
let RIWS = '';
/* LAST/LASTT: halaman asal untuk laporan. Video tutorial (dibuka dari halaman laporan) bukan halaman asal,
   agar kembali dan selesai melapor tidak bolak-balik ke tutorial */
function route() {
  const lw = /^#\/tutorial/;
  if (lw.test(location.hash)) {
  } else if (!location.hash.startsWith('#/lapor')) LAST = location.hash || '#/';
  else if (!$('#rk') && !lw.test(route.cur || '')) LASTT = judulKini();
  $('#au')?.pause();
  const [a = '', b, c, d] = location.hash.slice(2).split('/');
  /* Alamat tak dikenal (mis. '#null'): ke Beranda yang sebenarnya, agar menu bawah tetap ada */
  if (a && !P[a] && !(a == 'quran' && b)) {
    location.replace('#/');
    return;
  }
  const pg = a == 'quran' && b ? surah(b, c) : (P[a] || P[''])(b, c, d);
  const v = $('#view'),
    tok = ++RT,
    baru = route.cur != location.hash,
    geser = ['geser', 'nav'].includes(document.documentElement.dataset.vt),
    ganti = baru && v.children.length && !gerakOff() && !geser;
  /* Potret halaman yang ditinggalkan, untuk ditampilkan saat geser samping (lihat geser di js/core/events.js) */
  v.querySelectorAll('.tpeek').forEach((e) => e.remove());
  if (baru && route.cur != null && v.children.length && !v.classList.contains('kel') && !v.classList.contains('kelb'))
    vSnap(route.cur || '#/', v.innerHTML);
  route.cur = location.hash;
  /* Alamat halaman yang dipasang render ini (dikirim di fz-dipasang). Bukan location.hash saat sinyal dikirim: alamat bisa
     sudah berganti ke tujuan geseran berikutnya, dan sinyal halaman lama lalu dikira milik halaman baru */
  const hIni = location.hash || '#/';
  {
    const h = location.hash || '#/',
      t = RIW[RIW.length - 1],
      par = (x) => x.replace(/\/[^/]*$/, '');
    const sh = sesiBaca(h),
      st = t ? RIWS : '';
    RIWS = sh;
    if (RIW[RIW.length - 2] == h && !(st && st == sh)) RIW.pop();
    else if (t != h) {
      /* Halaman saudara (surah/bacaan/subhalaman berikutnya), atau halaman dalam satu sesi baca (Maulid: bagian →
         jeda sholawat → bagian berikutnya), mengganti entri terakhir: kembali langsung keluar dari bacaan, seperti
         Al-Qur'an */
      if (t && ((par(t) == par(h) && par(h).split('/').length >= 2) || (st && st == sh))) RIW[RIW.length - 1] = h;
      else RIW.push(h);
      if (RIW.length > 60) RIW.shift();
    }
  }
  /* Bagian yang dibuka dari Semua Menu tetap ditandai selama masih di bagian itu (mis. Al-Qur'an → surah → kembali
     ke Al-Qur'an): panah kembali dan geser tetap menuju Semua Menu */
  if (window.DARIMENU && a !== window.DARIMENU) window.DARIMENU = null;
  riwSimpan();
  /* Arah (data-vt: fwd/back) dari navigasi bagian, geser, atau tombol kembali */
  const de = document.documentElement,
    arah = de.dataset.vt;
  delete de.dataset.vt;
  /* Isi halaman dipasang lalu inisialisasinya dijalankan */
  const paint = () => {
    if (tok != RT) return;
    document.body.classList.toggle(
      'full',
      !!S.full && a == 'quran' && !!b
    ); /* Halaman utama yang dibuka dari Semua Menu: tanpa menu bawah, panah kembali ke Semua Menu */
    const dm = window.DARIMENU === a && !b;
    document.body.classList.toggle('subhal', !(tataNavR().includes(a) && !b) || dm);
    setSz();
    applyNav();
    v.style.transform = v.style.opacity = v.style.transition = '';
    v.innerHTML = pg.html;
    if (window.DARIMENU === a && !b) {
      const bk = $('.bar .bk', v);
      if (bk) bk.setAttribute('href', '#/menu');
      else {
        const br = $('.bar', v);
        if (br)
          br.insertAdjacentHTML(
            'afterbegin',
            `<a class="bk" href="#/menu" aria-label="Kembali">${ic('panah', 24)}</a>`
          );
      }
    }
    v.classList.remove('kel', 'kelb');
    v.classList.toggle('phal', vKelas(location.hash) == 'phal');
    v.scrollTop = 0;
    $$('#nav a[data-r]').forEach((l) =>
      l.classList.toggle('on', l.dataset.r == (tataNavR().includes(a) && a ? a : ['', 'menu'].includes(a) ? '' : 'x'))
    );
    const ip = pg.init && pg.init();
    barLekat();
    tabPil();
    tataAdminUI();
    tataAdminPasang();
    if (baru) tataCatat(a);
    layarBaca(a == 'kitab' && !!b);
    baru && !geser && masuk(v, arah);
    /* Hasil geser: pratinjau tetap menutupi sampai isi asli selesai dimuat (init async, mis. Maulid/kitab/surah),
       lalu dilepas tanpa kedip */
    setTimeout(() => {
      if (tok == RT) vSiapkan();
    }, 300);
    /* Isi yang dimuat belakangan oleh init (mis. bacaan Maulid): mode baca langsung diterapkan begitu isinya masuk */
    if (ip && ip.then) ip.then(() => tok == RT && window.mbacaCek && mbacaCek()).catch(() => {});
    geser &&
      Promise.race([Promise.resolve(ip).catch(() => {}), new Promise((r) => setTimeout(r, 1500))]).then(() =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (tok != RT || (location.hash || '#/') != hIni) return;
            /* Mode baca (pilihan Kartu | Mushaf, tampilan mushaf) dipasang sekarang juga, bukan menunggu pengamat perubahan,
               agar halaman asli sudah sama persis dengan pratinjau saat pratinjau dilepas */
            window.mbacaCek && mbacaCek();
            document.dispatchEvent(new CustomEvent('fz-dipasang', { detail: hIni }));
          })
        )
      );
    $$('#view .ar2').forEach((e) => (e.style.fontSize = S.fs + 'px'));
    ftUpd();
    $$('[data-soon]').forEach((e) => (e.onclick = () => toast('Konten ini segera hadir')));
  };
  ganti ? keluar(v, arah).then(paint) : paint();
}
/* Isi lama keluar bergiliran dari atas; saat kembali, bergeser ke kanan */
function keluar(v, arah) {
  const K = [...v.children];
  v.classList.remove('ent', 'entb');
  K.forEach((c, i) => c.style.setProperty('--o', Math.min(i, 8)));
  v.classList.add(arah == 'back' ? 'kelb' : 'kel');
  return new Promise((r) => setTimeout(r, 180 + Math.min(K.length - 1, 8) * 24));
}
/* Isi halaman muncul bertahap satu per satu (lembut); saat kembali, masuk dari kiri */
function masuk(v, arah) {
  if (gerakOff()) return;
  [...v.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 10)));
  v.classList.remove('ent', 'entb');
  void v.offsetWidth;
  v.classList.add('ent');
  arah == 'back' && v.classList.add('entb');
  clearTimeout(masuk.t);
  masuk.t = setTimeout(() => v.classList.remove('ent', 'entb'), 1100);
}
/* Kepala halaman baca (yang punya tombol Pengaturan baca, dan kepala surah) menempel di atas,
   bersembunyi saat pengguna menggulir ke bawah dan muncul lagi saat menggulir ke atas, sama seperti bilah kitab */
let BLY = 0,
  BLU = 0;
/* Layar penuh (S.kfull) hanya untuk pembaca kitab; halaman baca lain memakai mode Kartu | Mushaf.
   Keluar dari kitab otomatis keluar dari layar penuh peramban. */
function layarBaca(kitab) {
  const baca = kitab,
    on = !!S.kfull && baca;
  document.body.classList.toggle('kfull', on);
  if (window.ANDROID && !on) andPanggil('layarPenuh', false);
  if (!baca && (document.fullscreenElement || document.webkitFullscreenElement))
    (document.exitFullscreen || document.webkitExitFullscreen).call(document).catch(() => {});
}
function barLekat() {
  BLY = 0;
  const h = $('#view > .rh') || $('#view > .bar [data-rs]')?.closest('.bar') || $('#view > .aibar');
  if (!h) return;
  h.classList.add('lekat');
  mbacaCek();
}
{
  const v = $('#view');
  ['touchmove', 'wheel', 'keydown'].forEach((n) => v.addEventListener(n, () => (BLU = Date.now()), { passive: true }));
  v.addEventListener(
    'scroll',
    () => {
      const h = $('#view > .lekat');
      if (!h) return;
      const y = v.scrollTop,
        d = y - BLY;
      h.classList.toggle('lyg', y > 4);
      if (Math.abs(d) > 6) {
        if (Date.now() - BLU < 400) h.classList.toggle('smb', d > 0 && y > 140 && !h.contains(document.activeElement));
        else if (d < 0) h.classList.remove('smb');
        BLY = y;
      }
    },
    { passive: true }
  );
}
addEventListener('hashchange', route);
tataNav();
route();
/* Aplikasi Android: halaman sudah tampil → tutup layar pembuka (logo + slogan) setelah gambar pertama */
requestAnimationFrame(() =>
  requestAnimationFrame(() => {
    try {
      window.top === window && window.FadzAndroid && FadzAndroid.halamanSiap && FadzAndroid.halamanSiap();
    } catch (e) {}
  })
);
/* Layar pembuka web (index.html): tampil minimal ±1,4 detik agar slogan sempat terbaca, lalu memudar */
{
  const pb = document.getElementById('pembuka');
  if (pb)
    setTimeout(
      () => {
        pb.classList.add('tutup');
        setTimeout(() => pb.remove(), 500);
      },
      Math.max(0, 1400 - performance.now())
    );
}
if ('serviceWorker' in navigator && !TPRATINJAU)
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
/* Saat aplikasi dibuka lagi dari latar belakang, cek versi baru; bila ada, halaman dimuat ulang otomatis (lihat
   controllerchange) */
if ('serviceWorker' in navigator && !TPRATINJAU)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState == 'visible')
      navigator.serviceWorker
        .getRegistration()
        .then((g) => g && g.update())
        .catch(() => {});
  });
/* Versi baru terpasang (service worker berganti): muat ulang sekali agar tampilan langsung memakai kode terbaru,
   tanpa perlu buka-tutup aplikasi */
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  let sdh = 0,
    tunda = 0;
  const muat = () => {
    if (sdh) return;
    sdh = 1;
    location.reload();
  };
  /* Tidak memuat ulang di depan pengguna (terasa seperti 'refresh sendiri'): bila halaman sedang terlihat, ditunda
     sampai aplikasi ditinggal lalu dibuka lagi */
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (document.visibilityState == 'hidden') return muat();
    tunda = 1;
  });
  document.addEventListener('visibilitychange', () => {
    if (tunda && document.visibilityState == 'visible' && !$('.back-d')) muat();
  });
}
