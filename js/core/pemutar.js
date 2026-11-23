/* js/core/pemutar.js - Pemutar murottal global (tetap berbunyi saat pindah halaman, layar mati, atau aplikasi ditutup ke latar).
   - Antrian Al-Qur'an per ayat (Syaikh Mishary Alafasy, everyayah.com; berkas tersimpan offline ikut dipakai lewat service worker).
     Bisa diputar satu ayat, sampai akhir surah, atau terus lintas surah sampai surah/juz pilihan (PM.akhir = {n, a}).
   - Kapsul kecil #qmini di semua halaman: sebelumnya · jeda/lanjut · berikutnya, judul (ketuk = buka surahnya), dan ×.
   - Kontrol media di luar aplikasi: Media Session (notifikasi media & layar kunci di Chrome/PWA, tombol headset/Bluetooth),
     dan di aplikasi Android lewat layanan latar AudioLayanan (FadzAndroid.mediaInfo/mediaHenti), yang memanggil kembali window.fzMedia(aksi).
   Halaman surah menyorot ayat yang sedang dibaca lewat peristiwa 'fzpemutar'. */
const PM = { n: 0, i: 0, L: [], akhir: null, satu: 0, au: null, lepas: 0, mulai: null, rep: 0, putaran: 1 };
const pmAud = (n, a) =>
  `https://everyayah.com/data/Alafasy_128kbps/${String(n).padStart(3, '0')}${String(a).padStart(3, '0')}.mp3`;
/* Berkas satu surah: bismillah (001001) di depan, kecuali Al-Fatihah dan At-Taubah */
const pmDaftar = (n) => [
  ...(n != 1 && n != 9 ? [pmAud(1, 1)] : []),
  ...Array.from({ length: AYAT[n - 1] }, (_, i) => pmAud(n, i + 1)),
];
const pmGeser = (n) => (n != 1 && n != 9 ? 1 : 0);
/* Nomor ayat yang sedang diputar (0 = bismillah pembuka) */
const pmAyat = () => (PM.L.length ? PM.i - pmGeser(PM.n) + 1 : 0);
const pmAktif = () => !!PM.L.length;
function pmAudio() {
  if (PM.au) return PM.au;
  const a = (PM.au = new Audio());
  a.preload = 'auto';
  a.id = 'pmau';
  a.onended = () => pmLanjut(1, 1);
  a.onerror = () => {
    if (!pmAktif() || !a.getAttribute('src')) return;
    if (navigator.onLine === false) {
      toast('Audio ayat ini belum tersimpan dan internet tidak tersedia');
      return pmHenti();
    }
    pmLanjut(1, 1);
  };
  a.onplay = a.onpause = () => pmTampil();
  /* Posisi diingat berkala, agar murottal bisa dilanjutkan setelah aplikasi dibuka lagi */
  let tk = 0;
  a.ontimeupdate = () => {
    if (Date.now() - tk > 3000) {
      tk = Date.now();
      pmIngat();
    }
  };
  return a;
}
/* Mulai memutar Al-Qur'an dari surah n ayat k. o.satu = hanya ayat itu; o.akhir = {n,a} titik berhenti (bawaan: akhir
   surah n) */
function pmQuran(n, k, o) {
  o = o || {};
  PM.n = n;
  PM.L = pmDaftar(n);
  PM.satu = o.satu ? k : 0;
  /* Pemutaran biasa tidak membawa pengaturan ulang dari sesi sebelumnya (lembar pengulangan memasangnya lagi sesudah ini) */
  PM.mulai = null;
  PM.rep = 0;
  PM.putaran = 1;
  PM.akhir = o.satu ? { n, a: k } : o.akhir || { n, a: AYAT[n - 1] };
  /* Diputar dari ayat 1: bismillah dibaca dulu */
  pmKe(k <= 1 ? 0 : k - 1 + pmGeser(n));
}
function pmKe(i, detik, jeda) {
  const a = pmAudio();
  PM.i = i;
  a.src = PM.L[i];
  if (detik > 0)
    a.addEventListener(
      'loadedmetadata',
      () => {
        try {
          a.currentTime = Math.min(detik, (a.duration || detik + 1) - 0.5);
        } catch (e) {}
      },
      { once: true }
    );
  if (jeda) {
    a.playbackRate = a.defaultPlaybackRate = S.pmSpd || 1;
    a.load();
    return pmTampil();
  }
  a.playbackRate = a.defaultPlaybackRate = S.pmSpd || 1;
  a.play().catch(() => {});
  pmTampil();
}
/* Kecepatan murottal: 0,75× · 1× · 1,25× · 1,5× (diingat) */
document.addEventListener('click', (e) => {
  if (!e.target.closest || !e.target.closest('[data-pmsp]')) return;
  const L = [1, 1.25, 1.5, 0.75],
    v = L[(L.indexOf(S.pmSpd || 1) + 1) % L.length];
  S.pmSpd = v;
  save();
  const a = pmAudio();
  a.playbackRate = a.defaultPlaybackRate = v;
  pmTampil();
  toast('Kecepatan murottal ' + String(v).replace('.', ',') + '×');
});
/* d = 1 berikutnya / -1 sebelumnya. otomatis = selesai satu ayat (bukan ditekan pengguna) */
function pmLanjut(d, otomatis) {
  if (!pmAktif()) return;
  const k = pmAyat(),
    A = PM.akhir;
  /* Atur pengulangan: tiap ayat diulang S.pmUlang kali, lalu rentang dari–sampai diulang S.pmUlangS kali (0 = terus) */
  if (d > 0 && otomatis && PM.mulai && k > 0 && (S.pmUlang || 1) > 1 && PM.rep + 1 < S.pmUlang) {
    PM.rep++;
    return pmKe(PM.i);
  }
  PM.rep = 0;
  if (d > 0) {
    if (PM.satu && otomatis) return pmHenti();
    if (otomatis && A && PM.n == A.n && k >= A.a) {
      if (PM.mulai && (!S.pmUlangS || PM.putaran < S.pmUlangS)) {
        const m = PM.mulai,
          pt = PM.putaran + 1;
        pmQuran(m.n, m.a, { akhir: A });
        PM.mulai = m;
        PM.putaran = pt;
        return;
      }
      return pmHenti(true);
    }
    if (PM.i + 1 < PM.L.length) return pmKe(PM.i + 1);
    if (PM.n < 114 && (!A || PM.n < A.n || !otomatis)) {
      const m = PM.n + 1;
      PM.n = m;
      PM.L = pmDaftar(m);
      if (A && m > A.n) PM.akhir = { n: m, a: AYAT[m - 1] };
      return pmKe(0);
    }
    return pmHenti(true);
  }
  /* Sebelumnya: lebih dari 3 detik berjalan = ulang ayat ini; selain itu ayat sebelumnya (bisa ke surah sebelumnya) */
  const a = pmAudio();
  if (a.currentTime > 3) return pmKe(PM.i);
  if (PM.i > 0) return pmKe(PM.i - 1);
  if (PM.n > 1) {
    const m = PM.n - 1;
    PM.n = m;
    PM.L = pmDaftar(m);
    return pmKe(PM.L.length - 1);
  }
  pmKe(0);
}
function pmHenti(selesai) {
  const a = PM.au;
  if (a) {
    a.pause();
    a.removeAttribute('src');
    try {
      a.load();
    } catch (e) {}
  }
  PM.L = [];
  PM.i = 0;
  PM.satu = 0;
  PM.akhir = null;
  PM.mulai = null;
  PM.rep = 0;
  PM.putaran = 1;
  pmTampil();
  if (selesai === true) toast('Murottal selesai');
  try {
    localStorage.removeItem('fzPm');
  } catch (e) {}
}
const pmJeda = () => {
  const a = pmAudio();
  if (!pmAktif()) return;
  a.paused ? a.play().catch(() => {}) : a.pause();
};
const pmJudul = () => {
  if (!pmAktif()) return '';
  const k = pmAyat();
  return NAMA[PM.n - 1] + (k > 0 ? ' · ayat ' + k : ' · bismillah');
};
const pmSub = () => {
  if (!pmAktif()) return '';
  const A = PM.akhir;
  if (PM.mulai)
    return (
      'Diulang' +
      ((S.pmUlang || 1) > 1 ? ` · tiap ayat ${S.pmUlang}×` : '') +
      ` · putaran ${PM.putaran}${S.pmUlangS ? '/' + S.pmUlangS : ''}`
    );
  return (
    'Murottal Mishary Alafasy' +
    (PM.satu
      ? ''
      : A && (A.n != PM.n || A.a != AYAT[PM.n - 1])
        ? ' · sampai ' + NAMA[A.n - 1] + (A.a != AYAT[A.n - 1] ? ' ayat ' + A.a : '')
        : ' · sampai akhir surah')
  );
};
/* Tampilan: kapsul, Media Session, notifikasi Android, dan sorotan ayat di halaman surah */
function pmTampil() {
  const on = pmAktif(),
    a = PM.au,
    main = !!(a && on && !a.paused);
  let m = $('#qmini');
  if (!m && on) {
    m = document.createElement('div');
    m.id = 'qmini';
    m.className = 'qmini pm';
    document.body.append(m);
    m.innerHTML = `<button class="ib2" data-pm="-1" aria-label="Ayat sebelumnya">${ic('back', 16)}</button><button class="ib" data-pm="0" aria-label="Jeda"></button><button class="ib2" data-pm="1" aria-label="Ayat berikutnya">${ic('next', 16)}</button><a class="pmt" data-pmbuka><b></b><small></small></a><button class="ib2" data-pmrep aria-label="Atur pengulangan">${ic('rot', 16)}</button><button class="ib2 pmsp" data-pmsp aria-label="Kecepatan murottal"></button><button class="ib2" data-pm="x" aria-label="Hentikan murottal">×</button>`;
  }
  if (m) {
    m.hidden = !on;
    if (on) {
      const b = m.querySelector('[data-pm="0"]');
      b.innerHTML = ic(main ? 'pause' : 'play', 18);
      b.setAttribute('aria-label', main ? 'Jeda' : 'Lanjutkan');
      m.querySelector('.pmt b').textContent = pmJudul();
      m.querySelector('.pmt small').textContent = pmSub();
      m.querySelector('.pmsp').textContent = String(S.pmSpd || 1).replace('.', ',') + '×';
      m.querySelector('.pmt').href = '#/quran/' + PM.n + (pmAyat() > 1 ? '/' + pmAyat() : '');
    }
  }
  if ('mediaSession' in navigator) {
    try {
      if (on) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: pmJudul(),
          artist: 'Syaikh Mishary Rashid Alafasy',
          album: "Al-Qur'an · Fadzkuruuni",
          artwork: [{ src: 'img/icon-512.png', sizes: '512x512', type: 'image/png' }],
        });
        navigator.mediaSession.playbackState = main ? 'playing' : 'paused';
      } else {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
      }
    } catch (e) {}
  }
  if (window.ANDROID && window.FadzAndroid && FadzAndroid.mediaInfo && !PM.lepas) {
    try {
      on ? FadzAndroid.mediaInfo(pmJudul(), pmSub(), main) : FadzAndroid.mediaHenti();
    } catch (e) {}
  }
  pmIngat();
  dispatchEvent(new CustomEvent('fzpemutar'));
}
if ('mediaSession' in navigator) {
  const h = (n, f) => {
    try {
      navigator.mediaSession.setActionHandler(n, f);
    } catch (e) {}
  };
  h('play', () =>
    pmAudio()
      .play()
      .catch(() => {})
  );
  h('pause', () => pmAudio().pause());
  h('previoustrack', () => pmLanjut(-1));
  h('nexttrack', () => pmLanjut(1));
  h('stop', () => pmHenti());
}
/* Tombol dari notifikasi media aplikasi Android (AudioLayanan) */
window.fzMedia = (x) => {
  if (x == 'main')
    pmAudio()
      .play()
      .catch(() => {});
  else if (x == 'jeda') pmAudio().pause();
  else if (x == 'lanjut') pmLanjut(1);
  else if (x == 'mundur') pmLanjut(-1);
  else if (x == 'henti') pmHenti();
  else if (x == 'tukar') pmJeda();
};
document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('[data-pm]');
  if (!b) return;
  const v = b.dataset.pm;
  if (v == '0') pmJeda();
  else if (v == 'x') pmHenti();
  else pmLanjut(+v);
});
/* Bila sedang di halaman surah yang diputar lalu murottal pindah ke surah berikutnya, halaman ikut pindah ke surah
   itu */
let PMN = 0;
addEventListener('fzpemutar', () => {
  if (!pmAktif()) {
    PMN = 0;
    return;
  }
  if (PMN && PMN != PM.n && location.hash.split('/').slice(0, 3).join('/') == '#/quran/' + PMN)
    location.hash = '#/quran/' + PM.n;
  PMN = PM.n;
});
/* ===== Murottal tidak "hilang" saat aplikasi ditutup lalu dibuka lagi =====
   - Keadaan (surah, ayat, detik, titik berhenti, sedang main/jeda) disimpan di perangkat (localStorage fzPm).
   - Aplikasi Android: bila aplikasi sempat dihapus dari Terbaru sementara murottal tetap berbunyi, halaman baru
     mengambil alih pemutaran dari WebView lama (FadzAndroid.mediaAlih → fzMediaLepas di halaman lama → fzMediaTerima di
     sini), jadi suara lanjut dari detik yang sama dan kapsul pemutar (jeda, maju, kecepatan, ×) tampil lagi.
   - Selain itu (dimuat ulang, dibuka lagi setelah ditutup): kapsul muncul lagi dalam keadaan jeda di ayat terakhir,
     tinggal ketuk putar. */
function pmKeadaan() {
  if (!pmAktif()) return null;
  const a = PM.au;
  return {
    n: PM.n,
    i: PM.i,
    akhir: PM.akhir,
    satu: PM.satu,
    t: a ? +a.currentTime.toFixed(1) : 0,
    main: !!(a && !a.paused),
    w: Date.now(),
  };
}
function pmIngat() {
  if (PM.lepas) return;
  const k = pmKeadaan();
  try {
    if (k) localStorage.fzPm = JSON.stringify(k);
  } catch (e) {}
}
function pmPulih(k, main) {
  if (!k || !(k.n >= 1 && k.n <= 114)) return;
  PM.n = k.n;
  PM.L = pmDaftar(k.n);
  PM.satu = k.satu || 0;
  PM.akhir = k.akhir || { n: k.n, a: AYAT[k.n - 1] };
  pmKe(Math.min(Math.max(0, k.i | 0), PM.L.length - 1), k.t || 0, !main);
}
/* Dipanggil di WebView lama: berhenti tanpa menutup notifikasi, serahkan keadaannya */
window.fzMediaLepas = () => {
  const k = pmKeadaan();
  PM.lepas = 1;
  const a = PM.au;
  if (a) {
    a.onplay = a.onpause = a.onended = a.onerror = a.ontimeupdate = null;
    a.pause();
    a.removeAttribute('src');
  }
  return k;
};
/* Dipanggil di halaman baru dengan keadaan dari WebView lama */
window.fzMediaTerima = (k) => {
  if (!k) return;
  pmPulih(k, k.main);
  if (!k.main) pmTampil();
};
setTimeout(() => {
  if (pmAktif()) return;
  try {
    if (window.ANDROID && window.FadzAndroid && FadzAndroid.mediaAda && FadzAndroid.mediaAda())
      return FadzAndroid.mediaAlih();
  } catch (e) {}
  let k = null;
  try {
    k = JSON.parse(localStorage.fzPm || 'null');
  } catch (e) {}
  if (!k || Date.now() - (k.w || 0) > 7 * 864e5) return;
  /* Halaman sempat dimuat ulang paksa saat murottal berbunyi (mis. memori HP penuh): di aplikasi langsung lanjut */
  const lanjut = k.main && window.ANDROID && Date.now() - k.w < 20000;
  pmPulih(k, lanjut);
}, 600);

/* Lembar "Atur pengulangan" (seperti aplikasi Al-Qur'an pada umumnya): dari surah:ayat sampai surah:ayat, ulangi tiap ayat,
   ulangi seluruh rentang, dan kecepatan. Dibuka dari menu ayat atau tombol ulang di kapsul murottal. */
function pmUlangLembar(n, k) {
  if (!n) {
    n = PM.n || (window.QR && QR.n) || 1;
    k = Math.max(1, pmAyat() || 1);
  }
  const ak = PM.akhir && PM.mulai ? PM.akhir : { n, a: AYAT[n - 1] };
  const optS = (v) =>
      NAMA.map((x, i) => `<option value="${i + 1}"${i + 1 == v ? ' selected' : ''}>${i + 1}. ${esc(x)}</option>`).join(
        ''
      ),
    optA = (s, v) =>
      Array.from({ length: AYAT[s - 1] }, (_, i) => `<option${i + 1 == v ? ' selected' : ''}>${i + 1}</option>`).join(
        ''
      );
  const pil = (id, L, v) =>
    `<div class="seg pmsg" id="${id}">${L.map(([x, t]) => `<button type="button" data-v="${x}" class="${x == v ? 'on' : ''}">${t}</button>`).join('')}</div>`;
  const e = document.createElement('div');
  e.className = 'back-d';
  e.innerHTML = `<div class="sheet pmlb pmul" role="dialog" aria-label="Atur pengulangan"><b>Atur pengulangan</b>
<label class="pml">Dari<span class="pmr"><select class="in" id="uds">${optS(n)}</select><select class="in" id="uda">${optA(n, k)}</select></span></label>
<label class="pml">Sampai<span class="pmr"><select class="in" id="uss">${optS(ak.n)}</select><select class="in" id="usa">${optA(ak.n, ak.a)}</select></span></label>
<div class="pml">Ulangi tiap ayat${pil(
    'uua',
    [
      [1, '1×'],
      [2, '2×'],
      [3, '3×'],
      [5, '5×'],
      [10, '10×'],
    ],
    S.pmUlang || 1
  )}</div>
<div class="pml">Ulangi seluruhnya${pil(
    'uus',
    [
      [1, '1×'],
      [2, '2×'],
      [3, '3×'],
      [5, '5×'],
      [0, '∞'],
    ],
    S.pmUlangS == null ? 1 : S.pmUlangS
  )}</div>
<div class="pml">Kecepatan${pil(
    'uks',
    [
      [0.75, '0,75×'],
      [1, 'Normal'],
      [1.25, '1,25×'],
      [1.5, '1,5×'],
    ],
    S.pmSpd || 1
  )}</div>
<div class="act"><button class="btn s" data-x style="flex:1">Batal</button><button class="btn" data-uy style="flex:1">${ic('play', 16)} Putar</button></div></div>`;
  document.body.append(e);
  const v = { uua: S.pmUlang || 1, uus: S.pmUlangS == null ? 1 : S.pmUlangS, uks: S.pmSpd || 1 };
  e.querySelector('#uds').onchange = (x) => (e.querySelector('#uda').innerHTML = optA(+x.target.value, 1));
  e.querySelector('#uss').onchange = (x) => {
    const s = +x.target.value;
    e.querySelector('#usa').innerHTML = optA(s, AYAT[s - 1]);
  };
  e.onclick = (x) => {
    if (x.target == e || x.target.closest('[data-x]')) return e.remove();
    const b = x.target.closest('.pmsg button');
    if (b) {
      const g = b.parentNode;
      $$('button', g).forEach((y) => y.classList.toggle('on', y == b));
      v[g.id] = +b.dataset.v;
      return;
    }
    if (x.target.closest('[data-uy]')) {
      const dn = +e.querySelector('#uds').value,
        da = +e.querySelector('#uda').value,
        sn = +e.querySelector('#uss').value,
        sa = +e.querySelector('#usa').value;
      if (sn < dn || (sn == dn && sa < da)) return toast('Ayat "Sampai" harus sesudah ayat "Dari"');
      S.pmUlang = v.uua;
      S.pmUlangS = v.uus;
      S.pmSpd = v.uks;
      save();
      e.remove();
      pmQuran(dn, da, { akhir: { n: sn, a: sa } });
      PM.mulai = { n: dn, a: da };
      PM.putaran = 1;
      PM.rep = 0;
      pmTampil();
    }
  };
}
document.addEventListener('click', (e) => {
  if (e.target.closest && e.target.closest('[data-pmrep]')) pmUlangLembar();
});
