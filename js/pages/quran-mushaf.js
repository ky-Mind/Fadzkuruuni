/* js/pages/quran-mushaf.js - Mode Mushaf Al-Qur'an: halaman Mushaf Madinah 15 baris (Rasm Utsmani), satu halaman satu layar.
   - Tiga halaman berdampingan (sebelumnya, kini, berikutnya) digeser bersama jari; arah baca Arab: geser ke kanan = halaman
     berikutnya. Data & font halaman sebelah disiapkan lebih dulu (msData/msFont) sehingga geser tanpa jeda.
   - Ketuk kata: ayatnya disorot dan menu ayat dibuka (dengan hukum tajwid kata itu & ayatnya).
   - Murottal: ayat yang dibaca disorot; bila pindah ke halaman lain, halaman dibalik sendiri.
   - Pindah ke mode Kartu / dari Kartu tetap di ayat yang sama (lihat R.mode di js/pages/quran.js).
   Dipanggil dari qReader (R = keadaan pembaca surah). */
const MS_DUR = 280;
function msBuka(R, p) {
  const el = $('#ay');
  if (!el) return;
  R.ms = { p: Math.min(604, Math.max(1, p)), H: {}, sibuk: 0 };
  el.innerHTML = `<div class="msw${S.msGaris !== false ? ' garis' : ''}" id="msw"></div>`;
  const sn = $('#snav');
  if (sn) sn.hidden = true;
  msTinggi();
  msPasang(R);
  msGeserPasang(R);
}
/* Tinggi wadah = sisa layar di bawah kepala surah (kapsul murottal ikut diperhitungkan) */
function msTinggi() {
  const w = $('#msw');
  if (!w) return;
  const atas = w.getBoundingClientRect().top,
    bawah = $('#qmini:not([hidden])') ? 64 : 8;
  w.style.height = Math.max(320, innerHeight - atas - bawah) + 'px';
}
/* Satu halaman: 15 baris; baris tanpa kata sebelum ayat 1 = kepala surah dan/atau basmalah */
function msHalHtml(p, W) {
  const baris = {};
  W.forEach((w, i) => (baris[w[1]] = baris[w[1]] || []).push(i));
  const awal = p <= 2,
    kunci = Object.keys(baris).map(Number),
    maks = awal ? Math.max(...kunci) : 15;
  let h = '';
  for (let b = 1; b <= maks; b++) {
    if (!baris[b]) {
      const nx = W.find((w) => w[1] > b),
        s = nx ? +nx[2].split(':')[0] : 0,
        jarak = nx && nx[2].endsWith(':1') ? nx[1] - b : 0;
      if (jarak == 2 || (jarak == 1 && (s == 1 || s == 9)))
        h += `<div class="msj"><span>سُورَةُ ${NAMA_AR[s - 1]}</span></div>`;
      else if (jarak == 1) h += `<div class="msbs">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
      else if (!awal) h += '<div class="msb"></div>';
      continue;
    }
    h += `<div class="msb msp${p}${awal ? ' tengah' : ''}">${baris[b].map((i) => `<span class="msk" data-i="${i}" data-k="${W[i][2]}">${W[i][0]}</span>`).join('')}</div>`;
  }
  return `<div class="msi${awal ? ' awal' : ''}">${h}</div><div class="msno">${p.toLocaleString('ar-EG')}</div>`;
}
/* Ukuran huruf: baris terpanjang selebar halaman, 15 baris muat setinggi layar */
function msUkur(el) {
  const ls = $$('.msb', el).filter((b) => b.children.length);
  if (!ls.length) return;
  const lebar = el.clientWidth - 20,
    tinggi = (el.clientHeight - 22) / 15.6;
  let fs = Math.min(tinggi * 0.95, 44);
  el.style.fontSize = fs + 'px';
  let mx = 0;
  ls.forEach((b) => {
    b.style.justifyContent = 'flex-start';
    mx = Math.max(
      mx,
      [...b.children].reduce((s, c) => s + c.getBoundingClientRect().width, 0)
    );
    b.style.justifyContent = '';
  });
  if (mx > lebar) fs *= lebar / mx;
  el.style.fontSize = fs * 0.97 + 'px';
  /* Pengaman: bila masih ada baris yang lebih lebar dari halaman (mis. ukuran diambil sebelum font siap), kecilkan */
  const lebih = Math.max(...ls.map((b) => b.scrollWidth / Math.max(1, b.clientWidth)));
  if (lebih > 1.04) el.style.fontSize = (fs * 0.97) / lebih + 'px';
}
/* Bangun lapisan halaman p (memuat data & font bila perlu) */
function msLapis(R, p) {
  const el = document.createElement('div');
  el.className = 'msh';
  el.dataset.p = p;
  el.innerHTML = '<p class="mut msmuat">Memuat halaman…</p>';
  Promise.all([msData(p), msFont(p)])
    .then(([W]) => {
      if (!el.isConnected && R.ms && !Object.values(R.ms.H).includes(el)) return;
      el.innerHTML = msHalHtml(p, W);
      msUkur(el);
      /* WebView kadang baru memakai font halaman sesudah bingkai berikutnya; ukur ulang agar baris tidak meluber */
      requestAnimationFrame(() => msUkur(el));
      document.fonts.ready.then(() => msUkur(el));
      setTimeout(() => msUkur(el), 500);
      if (R.ms && R.ms.H[0] == el) {
        msInfo(R);
        msTandai(R);
      }
    })
    .catch(() => {
      el.innerHTML = `<div class="card msgagal">Halaman ${p} belum tersimpan di perangkat dan internet tidak tersedia.<br><small class="mut">Unduh "Mushaf & tajwid" di Pengaturan › Offline & Data agar bisa dibaca tanpa internet, atau pilih mode Kartu.</small><button class="btn s" data-msulang>Coba lagi</button></div>`;
    });
  return el;
}
function msPasang(R) {
  const w = $('#msw');
  if (!w) return;
  w.innerHTML = '';
  R.ms.H = {};
  [-1, 0, 1].forEach((d) => {
    const p = R.ms.p + d;
    if (p < 1 || p > 604) return;
    const el = msLapis(R, p);
    w.append(el);
    R.ms.H[d] = el;
  });
  msLetak(R, 0);
  msInfo(R);
  msSiapkan(R);
}
/* Halaman berikutnya (d = 1) berada di kiri, sesuai arah baca Arab */
function msLetak(R, dx, ms) {
  const W = $('#msw')?.clientWidth || innerWidth;
  Object.entries(R.ms.H).forEach(([d, el]) => {
    el.style.transition = ms ? `transform ${ms}ms cubic-bezier(.2,.8,.2,1)` : 'none';
    el.style.transform = `translate3d(${dx - d * W}px,0,0)`;
  });
}
/* Siapkan data & font dua halaman ke depan dan belakang saat senggang */
function msSiapkan(R) {
  const p = R.ms.p;
  (window.requestIdleCallback || setTimeout)(() =>
    [1, -1, 2, -2].forEach((d) => {
      const q = p + d;
      if (q >= 1 && q <= 604) {
        msData(q).catch(() => {});
        msFont(q).catch(() => {});
      }
    })
  );
}
/* Pindah ke halaman sebelah dengan geser (d = 1 berikutnya, -1 sebelumnya) */
function msGeser(R, d, ms = MS_DUR) {
  if (!R.ms || R.ms.sibuk || !R.ms.H[d]) return false;
  R.ms.sibuk = 1;
  const W = $('#msw').clientWidth;
  msLetak(R, d * W, ms);
  setTimeout(() => {
    if (!R.ms) return;
    const H = R.ms.H,
      baru = { 0: H[d], [-d]: H[0] };
    H[-d] && H[-d].remove();
    R.ms.p += d;
    const np = R.ms.p + d;
    if (np >= 1 && np <= 604) {
      const el = msLapis(R, np);
      $('#msw').append(el);
      baru[d] = el;
    }
    R.ms.H = baru;
    msLetak(R, 0);
    R.ms.sibuk = 0;
    msInfo(R);
    msCatat(R);
    msSiapkan(R);
    msTandai(R);
  }, ms + 20);
  return true;
}
/* Lompat langsung ke halaman p (dari menu, murottal yang jauh, dll.) */
function msKe(R, p) {
  if (!R.ms) return;
  if (Math.abs(p - R.ms.p) == 1) return msGeser(R, p - R.ms.p);
  R.ms.p = Math.min(604, Math.max(1, p));
  msPasang(R);
  msCatat(R);
}
/* Kepala: "Halaman N" dan surah · juz */
function msInfo(R) {
  if (!R.ms || !$('#qt')) return;
  const p = R.ms.p,
    W = MSD[p],
    k = W && W.find((w) => !w[3]),
    [s, a] = k ? k[2].split(':').map(Number) : MSH[p - 1];
  $('#qt').textContent = 'Halaman ' + p;
  $('#qa').textContent = NAMA[s - 1] + ' · Juz ' + msJuz(s, a);
}
/* Catat posisi (surah halaman ini) untuk Riwayat, Lanjutkan membaca, dan pindah ke mode Kartu */
function msCatat(R) {
  const [s, a] = MSH[R.ms.p - 1];
  S.mpos = R.ms.p;
  (S.qpos = S.qpos || {})[s] = a;
  if (s != R.n) {
    R.n = s;
    R.A = null;
    history.replaceState(null, '', '#/quran/' + s);
    route.cur = location.hash;
    RIW[RIW.length - 1] = location.hash;
    S.hist = [s, ...(S.hist || []).filter((x) => x != s)].slice(0, 20);
  }
  save();
}
/* Sorot ayat yang sedang diputar; halaman dibalik sendiri bila ayatnya ada di halaman lain */
function msTandai(R) {
  if (!R.ms || !R.ms.H[0]) return;
  $$('.msk.qplay', $('#msw')).forEach((x) => x.classList.remove('qplay'));
  if (!pmAktif()) return;
  const a = Math.max(1, pmAyat()),
    p = msHalAyat(PM.n, a);
  if (p != R.ms.p) {
    if (!R.ms.sibuk && !R.ms.jari) msKe(R, p);
    return;
  }
  $$(`.msk[data-k="${PM.n}:${a}"]`, R.ms.H[0]).forEach((x) => x.classList.add('qplay'));
}
/* Geser dengan jari + ketuk kata */
function msGeserPasang(R) {
  const w = $('#msw');
  let x0 = null,
    y0 = 0,
    dx = 0,
    kunci = null,
    t0 = 0,
    gerak = 0;
  w.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length != 1 || R.ms.sibuk || e.touches[0].clientX < 24) return (x0 = null);
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
      dx = 0;
      kunci = null;
      t0 = Date.now();
    },
    { passive: true }
  );
  w.addEventListener(
    'touchmove',
    (e) => {
      if (x0 == null) return;
      const x = e.touches[0].clientX - x0,
        y = e.touches[0].clientY - y0;
      if (!kunci) {
        if (Math.abs(x) < 10 && Math.abs(y) < 10) return;
        kunci = Math.abs(x) > Math.abs(y) ? 'h' : 'v';
        R.ms.jari = kunci == 'h';
      }
      if (kunci != 'h') return;
      if (e.cancelable) e.preventDefault();
      dx = (x > 0 && !R.ms.H[1]) || (x < 0 && !R.ms.H[-1]) ? x / 3 : x;
      msLetak(R, dx);
    },
    { passive: false }
  );
  const lepas = () => {
    if (x0 == null) return;
    x0 = null;
    R.ms.jari = false;
    if (kunci != 'h') return;
    gerak = Date.now();
    const W = w.clientWidth,
      v = dx / Math.max(1, Date.now() - t0),
      kibas = Math.abs(v) > 0.45;
    if ((dx > W * 0.22 || (kibas && dx > 30)) && R.ms.H[1]) msGeser(R, 1, Math.max(150, MS_DUR * (1 - dx / W)));
    else if ((dx < -W * 0.22 || (kibas && dx < -30)) && R.ms.H[-1])
      msGeser(R, -1, Math.max(150, MS_DUR * (1 + dx / W)));
    else msLetak(R, 0, 220);
  };
  w.addEventListener('touchend', lepas, { passive: true });
  w.addEventListener('touchcancel', lepas, { passive: true });
  w.addEventListener('click', (e) => {
    if (Date.now() - gerak < 300) return;
    if (e.target.closest('[data-msulang]')) {
      const p = +e.target.closest('.msh').dataset.p;
      delete MSF[p];
      return msPasang(R);
    }
    const t = e.target.closest('.msk');
    if (!t || !R.ms.H[0].contains(t)) return;
    const k = t.dataset.k,
      [s, a] = k.split(':').map(Number),
      W = MSD[R.ms.p],
      i = +t.dataset.i;
    $$('.msk.aytuju', w).forEach((x) => x.classList.remove('aytuju'));
    $$(`.msk[data-k="${k}"]`, R.ms.H[0]).forEach((x) => x.classList.add('aytuju'));
    const ayat = [...new Set(W.filter((x) => x[2] == k).flatMap((x) => x[4]))];
    ayMenu(s, a, { kata: W[i][3] ? [] : W[i][4], ayat });
  });
}
addEventListener('resize', () => {
  const R = window.QR;
  if (!R || !R.ms || !$('#msw')) return;
  clearTimeout(msTinggi.t);
  msTinggi.t = setTimeout(() => {
    msTinggi();
    Object.values(R.ms.H).forEach(msUkur);
    msLetak(R, 0);
  }, 150);
});
addEventListener('fzpemutar', () => {
  const R = window.QR;
  if (R && R.ms && S.full && $('#msw')) {
    msTinggi();
    msTandai(R);
  }
});
