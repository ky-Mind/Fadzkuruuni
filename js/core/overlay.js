/* js/core/overlay.js - Tombol kembali bertahap: satu lapisan per tekan (lembar/dialog, lalu layar penuh, baru
   halaman). Plus dialog konfirmasi. */
let OVN = 0,
  OVSKIP = 0,
  OVPOP = 0,
  FSPUSH = 0;
/* Kunci guliran latar selama ada lembar/dialog terbuka */
const ovlKunci = () => document.body.classList.toggle('ovl', !!document.querySelector('.back-d'));
new MutationObserver((ms) => {
  ovlKunci();
  ms.forEach((m) => {
    m.addedNodes.forEach((n) => {
      if (n.classList && n.classList.contains('back-d')) {
        history.pushState({ ov: 1 }, '');
        OVN++;
      }
    });
    m.removedNodes.forEach((n) => {
      if (n.classList && n.classList.contains('back-d') && OVN > 0) {
        OVN--;
        if (OVPOP > 0) {
          OVPOP--;
          return;
        }
        if (history.state && history.state.ov) {
          OVSKIP++;
          history.back();
        }
      }
    });
  });
}).observe(document.body, { childList: true });
addEventListener('popstate', (e) => {
  if (OVSKIP > 0) {
    OVSKIP--;
    return;
  }
  const o = document.querySelectorAll('.back-d');
  if (o.length) {
    const d = o[o.length - 1];
    if (d.dataset.wajib) {
      history.pushState({ ov: 1 }, '');
      wajibGoyang(d);
      return;
    }
    OVPOP++;
    d.remove();
    return;
  }
  if (FSPUSH && document.body.classList.contains('full')) {
    FSPUSH = 0;
    fsSet(false, null, true);
  }
});
function fsSet(on, n, viaBack) {
  S.full = on;
  save();
  document.body.classList.toggle('full', on);
  if (window.QAYAT && $('#ay')) drawAy($('#ay'), window.QAYAT, n || +location.hash.split('/')[2]);
  if (on) {
    history.pushState({ fs: 1 }, '');
    FSPUSH = 1;
  } else if (!viaBack && FSPUSH && history.state && history.state.fs) {
    FSPUSH = 0;
    OVSKIP++;
    history.back();
  }
}
/* Dialog yang wajib dijawab (data-wajib) hanya digoyang bila pengguna mencoba menutupnya dengan cara lain */
const wajibGoyang = (d) => {
  const s = d.querySelector('.sheet');
  if (!s) return;
  s.classList.remove('goyang');
  void s.offsetWidth;
  s.classList.add('goyang');
  navigator.vibrate && navigator.vibrate(30);
};
function konfirmasi(t, m, ya, fn) {
  const e = document.createElement('div');
  e.className = 'back-d tgh';
  e.innerHTML = `<div class="sheet" role="alertdialog" aria-label="${esc(t)}"><b>${esc(t)}</b><p class="mut" style="margin:6px 0 14px">${esc(m)}</p><div class="act"><button class="btn s" data-x style="flex:1">Batal</button><button class="btn" data-ya style="flex:1">${esc(ya)}</button></div></div>`;
  document.body.append(e);
  e.onclick = (x) => {
    if (x.target == e || x.target.closest('[data-x]')) e.remove();
    else if (x.target.closest('[data-ya]')) {
      e.remove();
      fn();
    }
  };
}
/* KyMind: teks "KyMind" (a.kym) membuka halaman kymind/ di lapisan yang menutup seluruh layar. Di peramban memakai layar
   penuh sungguhan (tab, bilah alamat, dan bookmark hilang); di aplikasi Android memakai mode imersif (bilah status &
   navigasi hilang). Lapisan berkelas .back-d, jadi tombol kembali HP/peramban menutupnya seperti lembar lain
   (fadzKembali & riwayat di atas). Tutup juga lewat tombol × di halaman KyMind atau Esc. */
let KYM_BUKA = false,
  KYM_FS = false;
function kymindBuka() {
  if ($('#kymL')) return;
  const d = document.createElement('div');
  d.className = 'back-d';
  d.id = 'kymL';
  d.innerHTML = '<iframe src="kymind/?tanam=1" title="KyMind" allow="fullscreen; autoplay"></iframe>';
  document.body.append(d);
  KYM_BUKA = true;
  const fs = d.requestFullscreen || d.webkitRequestFullscreen;
  try {
    const p = fs && fs.call(d);
    p && p.catch && p.catch(() => {});
  } catch (e) {}
  if (window.ANDROID) {
    andPanggil('layarPenuh', true);
    andPanggil('warnaBar', '#040507', '#040507');
  }
  setTimeout(() => {
    const f = $('#kymL iframe');
    f && f.focus();
  }, 300);
}
const kymindTutup = () => {
  const d = $('#kymL');
  d && d.remove();
};
/* Lapisan dilepas (×, Esc, tombol kembali): keluar layar penuh dan kembalikan bilah HP */
new MutationObserver(() => {
  if (!KYM_BUKA || $('#kymL')) return;
  KYM_BUKA = KYM_FS = false;
  if (document.fullscreenElement || document.webkitFullscreenElement)
    (document.exitFullscreen || document.webkitExitFullscreen).call(document).catch(() => {});
  if (window.ANDROID) {
    andPanggil('layarPenuh', false);
    window.androidWarna && androidWarna();
  }
}).observe(document.body, { childList: true });
/* Esc di peramban keluar dari layar penuh: lapisan ikut ditutup */
addEventListener('fullscreenchange', () => {
  const fe = document.fullscreenElement;
  if (fe && fe.id == 'kymL') KYM_FS = true;
  else if (!fe && KYM_FS) kymindTutup();
});
addEventListener('message', (e) => {
  if (e.origin == location.origin && e.data && e.data.kymind == 'tutup') kymindTutup();
});
document.addEventListener(
  'click',
  (e) => {
    const a = e.target.closest && e.target.closest('a.kym');
    if (!a) return;
    e.preventDefault();
    kymindBuka();
  },
  true
);
