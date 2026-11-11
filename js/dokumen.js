/* js/dokumen.js - Halaman dokumen (Kebijakan Privasi, Penghapusan Data): tombol ganti tema terang / gelap.
   Pilihan disimpan di localStorage.fzdok (hanya untuk halaman dokumen; tema aplikasi tidak berubah). */
(function () {
  var b = document.getElementById('tema'),
    h = document.documentElement;
  if (!b) return;
  var ikon = function () {
    var t = h.dataset.theme == 'dark';
    b.innerHTML = t
      ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M20 14a8 8 0 1 1-10-10 6.5 6.5 0 0 0 10 10z"/></svg>';
    b.setAttribute('aria-label', t ? 'Ganti ke tema terang' : 'Ganti ke tema gelap');
  };
  ikon();
  b.onclick = function () {
    var t = h.dataset.theme == 'dark' ? 'light' : 'dark';
    h.dataset.theme = t;
    try {
      localStorage.fzdok = t;
    } catch (e) {}
    ikon();
  };
})();
/* Kembali: bila dibuka dari aplikasi, kembali ke halaman aplikasi sebelumnya (riwayat), bukan memuat ulang dari awal */
document.querySelectorAll('[data-kembali]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    try {
      if (document.referrer && new URL(document.referrer).origin == location.origin && history.length > 1) {
        e.preventDefault();
        history.back();
      }
    } catch (x) {}
  });
});

/* Isi dokumen tidak bisa disalin: tidak bisa diseleksi, disalin, dipotong, diseret, atau dibuka menu ketuk-lama/klik-kanan,
   dan pintasan Ctrl/⌘ + C, A, X, S, P serta cetak diblokir. Tautan tetap bisa diketuk. */
(function () {
  var s = document.createElement('style');
  s.textContent =
    'html,body,body *{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important}' +
    '@media print{body{display:none!important}}';
  document.head.appendChild(s);
  var tolak = function (e) {
    e.preventDefault();
    return false;
  };
  ['copy', 'cut', 'selectstart', 'contextmenu', 'dragstart', 'beforeprint'].forEach(function (n) {
    document.addEventListener(n, tolak, true);
  });
  document.addEventListener(
    'keydown',
    function (e) {
      var k = (e.key || '').toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ['c', 'a', 'x', 's', 'p', 'u'].indexOf(k) > -1) tolak(e);
    },
    true
  );
  document.addEventListener('selectionchange', function () {
    var sel = window.getSelection && window.getSelection();
    if (sel && sel.rangeCount && !sel.isCollapsed) sel.removeAllRanges();
  });
})();

/* Di aplikasi Android: bilah status & navigasi sewarna latar halaman dokumen (juga setelah tema diganti) */
(function () {
  var hex = function (c) {
    var m = String(c).match(/\d+/g);
    return m && m.length >= 3
      ? '#' +
          m
            .slice(0, 3)
            .map(function (x) {
              return ('0' + (+x).toString(16)).slice(-2);
            })
            .join('')
      : '';
  };
  var terap = function () {
    try {
      var w = hex(getComputedStyle(document.body).backgroundColor);
      if (w && window.top === window && window.FadzAndroid && FadzAndroid.warnaBar) FadzAndroid.warnaBar(w, w);
    } catch (e) {}
  };
  terap();
  addEventListener('load', terap);
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('#tema')) setTimeout(terap, 50);
  });
})();
