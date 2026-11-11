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
   navigasi hilang). Sesuai permintaan pemilik, tampilan ini "mengambil alih" layar: tidak ada tombol keluar, dan tombol
   kembali HP/peramban tidak menutupnya (lapisan .back-d ber-data-wajib, lihat fadzKembali & riwayat di atas). Lapisan baru
   tertutup saat halaman ke latar belakang: layar dimatikan (tombol daya), tombol Home, pindah aplikasi/tab. */
let KYM_BUKA = false,
  KYM_TUNGGU = false;
/* APK 2.6.34 ke atas: aplikasi disematkan & ditarik balik (KunciLayanan) sampai tombol daya ditekan. Menarik balik butuh
   izin "Tampil di atas aplikasi lain"; ditanyakan sebelum KyMind dibuka, sekali per sesi. */
const kymSemat = () => kymKunci() && !!andPanggil('kunciSiap');
function kymindMasuk() {
  if ($('#kymL')) return;
  if (kymSemat() && !andPanggil('izinAtas') && !sessionStorage.fzKymIzin) {
    sessionStorage.fzKymIzin = 1;
    return konfirmasi(
      'Kunci KyMind',
      'Agar KyMind hanya bisa ditutup dengan tombol daya, izinkan Fadzkuruuni "Tampil di atas aplikasi lain", lalu kembali ke aplikasi.',
      'Izinkan',
      () => {
        KYM_TUNGGU = true;
        andPanggil('mintaIzinAtas');
      }
    );
  }
  kymindBuka();
}
/* Kembali dari pengaturan izin: KyMind langsung dibuka */
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !KYM_TUNGGU) return;
  KYM_TUNGGU = false;
  setTimeout(kymindBuka, 300);
});
function kymindBuka() {
  if ($('#kymL')) return;
  const d = document.createElement('div');
  d.className = 'back-d';
  d.id = 'kymL';
  d.dataset.wajib = '1';
  d.innerHTML = '<iframe src="kymind/?tanam=1" title="KyMind" allow="fullscreen; autoplay"></iframe>';
  document.body.append(d);
  KYM_BUKA = true;
  /* Aplikasi Android baru: tetap terkunci walau aplikasi ditutup paksa lalu dibuka lagi */
  if (kymKunci() || kymDesk())
    try {
      localStorage.fzKym = 1;
    } catch (e) {}
  if (kymSemat()) andPanggil('kunciMulai');
  const fs = d.requestFullscreen || d.webkitRequestFullscreen;
  try {
    const p = fs && fs.call(d);
    p && p.catch && p.catch(() => {});
  } catch (e) {}
  if (window.ANDROID) {
    andPanggil('layarPenuh', true);
    andPanggil('warnaBar', '#040507', '#040507');
  }
  /* Desktop: tombol Esc juga ditangkap saat fokus ada di dalam iframe KyMind */
  const f = d.querySelector('iframe');
  f.addEventListener('load', () => {
    try {
      f.contentWindow.addEventListener('keydown', kymEsc, true);
    } catch (e) {}
  });
  setTimeout(() => f.focus(), 300);
}
const kymindTutup = () => {
  const d = $('#kymL');
  d && d.remove();
};
/* Lapisan dilepas: keluar layar penuh dan kembalikan bilah HP */
new MutationObserver(() => {
  if (!KYM_BUKA || $('#kymL')) return;
  KYM_BUKA = false;
  if (kymSemat()) andPanggil('kunciLepas');
  if (document.fullscreenElement || document.webkitFullscreenElement)
    (document.exitFullscreen || document.webkitExitFullscreen).call(document).catch(() => {});
  if (window.ANDROID) {
    andPanggil('layarPenuh', false);
    window.androidWarna && androidWarna();
  }
}).observe(document.body, { childList: true });
/* Jalan keluar:
   - Aplikasi Android 2.6.33 ke atas (FadzAndroid.layarMatiSiap): HANYA tombol daya (layar mati, fzLayarMati). Tombol Home,
     pindah aplikasi, menutup paksa / menghapus dari Terbaru tidak membebaskan: saat dibuka lagi KyMind tampil lagi.
   - Desktop (peramban komputer, bukan HP/tablet): HANYA tombol Esc (permintaan pemilik). Pindah tab, minimize, menutup tab
     lalu membuka situs lagi tidak membebaskan (localStorage.fzKym). Esc saat layar penuh ditelan peramban untuk keluar
     layar penuh, jadi keluarnya layar penuh saat halaman masih terlihat juga dihitung sebagai Esc.
   - APK lama: onPause memanggil window.fadzLatar. Peramban HP: visibilitychange (tab/aplikasi ke latar, termasuk tombol
     daya), karena peramban tidak bisa membedakan tombol daya dari pindah tab. */
const kymKunci = () => {
  try {
    return !!(window.ANDROID && window.FadzAndroid && FadzAndroid.layarMatiSiap && FadzAndroid.layarMatiSiap());
  } catch (e) {
    return false;
  }
};
const kymDesk = () => {
  try {
    if (window.ANDROID) return false;
    const ua = navigator.userAgent;
    /* iPad tampil sebagai "Macintosh" tapi layar sentuh */
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1))
      return false;
    return true;
  } catch (e) {
    return false;
  }
};
document.addEventListener(
  'visibilitychange',
  () => document.hidden && KYM_BUKA && !kymKunci() && !kymDesk() && kymindTutup()
);
window.fadzLatar = () => KYM_BUKA && !kymKunci() && !kymDesk() && kymindTutup();
function kymEsc(e) {
  if (e.key != 'Escape' || !KYM_BUKA || !kymDesk()) return;
  e.preventDefault();
  e.stopPropagation();
  window.fzLayarMati();
}
document.addEventListener('keydown', kymEsc, true);
const kymLayarPenuh = () => {
  if (!KYM_BUKA || !kymDesk() || document.fullscreenElement || document.webkitFullscreenElement) return;
  /* Bukan karena minimize / pindah jendela: tunggu sebentar lalu pastikan halaman masih terlihat */
  setTimeout(() => !document.hidden && KYM_BUKA && window.fzLayarMati(), 200);
};
let KYM_PENUH = false;
['fullscreenchange', 'webkitfullscreenchange'].forEach((n) =>
  document.addEventListener(n, () => {
    const p = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (KYM_PENUH && !p) kymLayarPenuh();
    KYM_PENUH = p;
  })
);
window.fzLayarMati = () => {
  try {
    localStorage.removeItem('fzKym');
  } catch (e) {}
  KYM_BUKA && kymindTutup();
};
try {
  if (localStorage.fzKym == 1) {
    /* APK dengan kunci: hanya bila kunci belum dilepas tombol daya (saat aplikasi tertutup, hanya layanan yang hidup) */
    if ((kymKunci() && (!kymSemat() || andPanggil('kunciAktif'))) || kymDesk()) setTimeout(kymindBuka, 50);
    else localStorage.removeItem('fzKym');
  }
} catch (e) {}
document.addEventListener(
  'click',
  (e) => {
    const a = e.target.closest && e.target.closest('a.kym');
    if (!a) return;
    e.preventDefault();
    kymindMasuk();
  },
  true
);
