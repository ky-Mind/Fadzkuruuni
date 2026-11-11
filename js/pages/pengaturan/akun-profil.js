/* js/pages/pengaturan/akun-profil.js - Pengaturan: Akun dan Profil */
/* Logo resmi penyedia login (warna merek) */
const LG_G =
  '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
const LG_F =
  '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M13.4 19.5v-6.2h2.1l.3-2.4h-2.4V9.3c0-.7.2-1.2 1.2-1.2h1.3V6c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.8H8.7v2.4h2.1v6.2z"/></svg>';
const LG_E = `<span class="lge">${ic('mail', 16)}</span>`;
/* Masuk dengan Facebook: selama aplikasi Facebook belum diterbitkan (menunggu verifikasi bisnis Meta) hanya akun admin/penguji yang bisa masuk;
   pengguna lain mendapat pesan yang jelas (lihat FBGAGAL di js/core/android.js dan events.js) */
const FBMASUK = false;
const AKUN = () =>
  `<h2>Akun</h2><div class="list sg" id="cl">${cloudOn() ? (FBU ? row('user', esc(FBU.displayName || S.nm || FBU.email || 'Akun'), esc(FBU.email || '') + ' · ' + ({ 'google.com': 'Google', 'facebook.com': 'Facebook', password: 'Email', emailLink: 'Email' }[FBU.providerData?.[0]?.providerId] || 'Akun') + ' · data tersinkron ke cloud', '<button class="btn s" data-gout>Keluar</button>') + (typeof TADM != 'undefined' && TADM ? row('sliders', 'Dashboard admin', 'Atur tampilan aplikasi, laporan, statistik, dan kelas online', '<a class="btn s" href="admin.html">Buka</a>') : '') : `<p class="lgi mut">Masuk agar penanda ayat, riwayat bacaan, dan pengaturanmu tersimpan di cloud dan ikut pindah ke perangkat lain.</p><div class="lgn"><button class="lgb" data-gin>${LG_G}Masuk dengan Google</button>${FBMASUK ? `<button class="lgb" data-gin="fb">${LG_F}Masuk dengan Facebook</button>` : ''}<button class="lgb" data-gem>${LG_E}Masuk dengan Email</button></div>`) : row('user', 'Masuk dengan Google', 'Belum diaktifkan. Isi konfigurasi Firebase (lihat PANDUAN-FIREBASE.md).', '<button class="btn s" disabled>Segera</button>')}</div>`;
/* Foto profil: dipotong persegi & dikecilkan (192 px JPEG) di perangkat, disimpan di pengaturan & ikut sinkron cloud */
window.fotoProfil = () => S.foto || (typeof FBU != 'undefined' && FBU && FBU.photoURL) || '';
window.avatarHtml = (px) => {
  const h = ((S.nm || (FBU && FBU.displayName) || '').trim()[0] || '').toUpperCase(),
    f = fotoProfil();
  return f
    ? `<img class="ava" src="${esc(f)}" referrerpolicy="no-referrer" alt="Foto profil" style="width:${px}px;height:${px}px">`
    : `<span class="ava avi" style="width:${px}px;height:${px}px;font-size:${Math.round(px * 0.42)}px">${h ? esc(h) : ic('user', Math.round(px * 0.5))}</span>`;
};
/* Foto calon dibaca dan diperkecil (sisi terpanjang maks. 900 px) agar ringan saat diatur ukuran & posisinya */
const fotoBaca = (src) =>
  new Promise((ok, no) => {
    const u = typeof src == 'string' ? src : URL.createObjectURL(src),
      im = new Image();
    im.onload = () => {
      const k = Math.min(1, 900 / Math.max(im.width, im.height)),
        c = document.createElement('canvas');
      c.width = Math.round(im.width * k);
      c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      if (typeof src != 'string') URL.revokeObjectURL(u);
      ok({ u: c.toDataURL('image/jpeg', 0.9), w: c.width, h: c.height, z: 1, x: 0, y: 0 });
    };
    im.onerror = () => {
      if (typeof src != 'string') URL.revokeObjectURL(u);
      no();
    };
    im.src = u;
  });
/* Editor foto seperti Instagram: lapisan layar penuh, foto dicubit (dua jari) / roda tetikus untuk ukuran dan diseret
   untuk posisi di dalam lingkaran FPK px; Selesai = simpan */
const FPK = 280;
let FOTOCALON = null;
const fpDasar = (c) => FPK / Math.min(c.w, c.h);
const fpBatas = (c) => {
  c.z = Math.max(1, Math.min(5, c.z));
  const b = fpDasar(c) * c.z,
    mx = (c.w * b - FPK) / 2,
    my = (c.h * b - FPK) / 2;
  c.x = Math.max(-mx, Math.min(mx, c.x));
  c.y = Math.max(-my, Math.min(my, c.y));
};
const fpGaya = (c) => {
  const b = fpDasar(c) * c.z;
  return `width:${c.w * b}px;height:${c.h * b}px;transform:translate(calc(-50% + ${c.x}px),calc(-50% + ${c.y}px))`;
};
const fpGambar = () => {
  const im = $('#fpc img'),
    z = $('#fpz');
  if (im && FOTOCALON) im.style.cssText = fpGaya(FOTOCALON);
  if (z && FOTOCALON) z.value = FOTOCALON.z;
};
/* Hasil akhir: persegi 192 px JPEG sesuai yang terlihat di lingkaran */
const fpHasil = (c) =>
  new Promise((ok, no) => {
    const im = new Image();
    im.onload = () => {
      const r = 192 / FPK,
        b = fpDasar(c) * c.z,
        W = c.w * b,
        H = c.h * b,
        cv = document.createElement('canvas');
      cv.width = cv.height = 192;
      const g = cv.getContext('2d');
      g.fillStyle = '#fff';
      g.fillRect(0, 0, 192, 192);
      g.drawImage(im, (FPK / 2 + c.x - W / 2) * r, (FPK / 2 + c.y - H / 2) * r, W * r, H * r);
      ok(cv.toDataURL('image/jpeg', 0.82));
    };
    im.onerror = no;
    im.src = c.u;
  });
function fpBuka(c) {
  FOTOCALON = c;
  fpBatas(c);
  $('#fped')?.remove();
  const d = document.createElement('div');
  d.className = 'back-d fpl';
  d.id = 'fped';
  d.innerHTML = `<div class="fplb"><button type="button" class="ib2" data-fbatal aria-label="Batal"><span aria-hidden="true">×</span></button><b>Atur foto</b><button type="button" class="fpok" data-fsimpan>Selesai</button></div><div class="fplw"><div class="fpc" id="fpc" data-noswipe style="width:${FPK}px;height:${FPK}px"><img src="${c.u}" alt="Atur foto profil" draggable="false" style="${fpGaya(c)}"></div></div><p class="fplt">Cubit dengan dua jari untuk memperbesar, seret untuk menggeser.</p><label class="fpzl" data-noswipe>${ic('search', 16)}<input type="range" id="fpz" min="1" max="5" step="0.01" value="${c.z}" aria-label="Ukuran foto"></label>`;
  document.body.append(d);
}
const fpTutup = () => {
  FOTOCALON = null;
  $('#fped')?.remove();
};
document.addEventListener('change', async (x) => {
  if (x.target.id != 'fpi' || !x.target.files[0]) return;
  try {
    fpBuka(await fotoBaca(x.target.files[0]));
  } catch (e) {
    toast('Foto tidak bisa dibaca. Coba foto lain.');
  }
  x.target.value = '';
});
document.addEventListener('input', (x) => {
  if (x.target.id != 'fpz' || !FOTOCALON) return;
  FOTOCALON.z = parseFloat(x.target.value) || 1;
  fpBatas(FOTOCALON);
  fpGambar();
});
/* Seret satu jari = geser; dua jari = cubit (ukuran) sekaligus geser; roda tetikus = ukuran */
const FPJ = new Map();
document.addEventListener('pointerdown', (x) => {
  const el = x.target.closest('#fpc');
  if (!el || !FOTOCALON) return;
  x.preventDefault();
  FPJ.set(x.pointerId, { x: x.clientX, y: x.clientY });
  const c = FOTOCALON,
    k = el.getBoundingClientRect().width / el.offsetWidth || 1;
  let awal = null;
  const ukur = () => {
    const P = [...FPJ.values()];
    if (P.length < 2) return null;
    return {
      d: Math.hypot(P[0].x - P[1].x, P[0].y - P[1].y),
      mx: (P[0].x + P[1].x) / 2,
      my: (P[0].y + P[1].y) / 2,
    };
  };
  const mulai = () => {
    const u = ukur(),
      P = [...FPJ.values()][0];
    awal = { z: c.z, x: c.x, y: c.y, u, px: P.x, py: P.y };
  };
  mulai();
  const gerak = (e) => {
    if (!FPJ.has(e.pointerId)) return;
    FPJ.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const u = ukur();
    if (u && awal.u) {
      c.z = (awal.z * u.d) / Math.max(1, awal.u.d);
      c.x = awal.x + (u.mx - awal.u.mx) / k;
      c.y = awal.y + (u.my - awal.u.my) / k;
    } else if (!u && !awal.u) {
      const P = [...FPJ.values()][0];
      c.x = awal.x + (P.x - awal.px) / k;
      c.y = awal.y + (P.y - awal.py) / k;
    } else mulai();
    fpBatas(c);
    fpGambar();
  };
  const lepas = (e) => {
    FPJ.delete(e.pointerId);
    if (FPJ.size) return mulai();
    removeEventListener('pointermove', gerak);
    removeEventListener('pointerup', lepas);
    removeEventListener('pointercancel', lepas);
  };
  if (FPJ.size == 1) {
    addEventListener('pointermove', gerak);
    addEventListener('pointerup', lepas);
    addEventListener('pointercancel', lepas);
  }
});
document.addEventListener(
  'wheel',
  (x) => {
    if (!x.target.closest('#fpc') || !FOTOCALON) return;
    x.preventDefault();
    FOTOCALON.z *= x.deltaY < 0 ? 1.08 : 1 / 1.08;
    fpBatas(FOTOCALON);
    fpGambar();
  },
  { passive: false }
);
/* Foto profil: ketuk foto / "Edit foto" → pilihan (galeri, atur ukuran, hapus) bila sudah ada foto; bila belum langsung
   ke galeri */
function fotoMenu() {
  if (!S.foto) return $('#fpi')?.click();
  const d = document.createElement('div');
  d.className = 'back-d';
  d.innerHTML = `<div class="sheet fpm"><b class="fpmj">Foto profil</b><button type="button" data-fgaleri>${ic('camera', 20)} Pilih dari galeri</button><button type="button" data-fatur>${ic('edit', 20)} Atur ukuran & posisi</button><button type="button" data-fdel class="mrh">${ic('trash', 20)} Hapus foto</button></div>`;
  d.addEventListener('click', (e) => e.target == d && d.remove());
  document.body.append(d);
}
document.addEventListener('click', async (x) => {
  const t = x.target;
  if (t.closest('[data-fmenu]')) return fotoMenu();
  if (t.closest('[data-fgaleri]')) {
    t.closest('.back-d')?.remove();
    return $('#fpi')?.click();
  }
  if (t.closest('[data-fsimpan]') && FOTOCALON) {
    try {
      S.foto = await fpHasil(FOTOCALON);
    } catch (e) {
      return toast('Foto tidak bisa disimpan. Coba foto lain.');
    }
    fpTutup();
    save();
    tataNav();
    route();
    toast('Foto profil disimpan');
  } else if (t.closest('[data-fbatal]')) fpTutup();
  else if (t.closest('[data-fatur]') && S.foto) {
    t.closest('.back-d')?.remove();
    try {
      fpBuka(await fotoBaca(S.foto));
    } catch (e) {
      toast('Foto tidak bisa dibuka');
    }
  }
});
document.addEventListener('click', (x) => {
  if (!x.target.closest('[data-fdel]')) return;
  x.target.closest('.back-d')?.remove();
  S.foto = null;
  save();
  tataNav();
  route();
  toast('Foto profil dihapus');
});
const JK = [
  ['l', 'Laki-laki'],
  ['p', 'Perempuan'],
  ['', 'Memilih untuk tidak memberi tahu'],
];
const jkNama = () => (JK.find((j) => j[0] == (S.jk || '')) || JK[2])[1];
/* Kepala profil seperti Instagram: foto di tengah + "Edit foto", lalu kotak isian yang dibuka di halamannya sendiri */
const PROFIL = () =>
  `<div class="pfh"><button type="button" class="pff" data-fmenu aria-label="Edit foto">${avatarHtml(92)}</button><button type="button" class="pfe" data-fmenu>Edit foto</button><input type="file" accept="image/*" id="fpi" hidden></div>
<div class="pfk"><a class="pfb" href="#/pengaturan/akun/nama"><small>Nama</small><span>${S.nm ? esc(S.nm) : '<i class="mut">Belum diisi</i>'}</span></a><a class="pfb" href="#/pengaturan/akun/jk"><small>Jenis kelamin</small><span>${esc(jkNama())}</span>${ic('next', 18)}</a></div>`;
/* Subhalaman Nama (Selesai di kanan atas, seperti Instagram) */
const HAL_NAMA = () => ({
  html:
    head('Nama', '#/pengaturan/akun', '<button class="pfok" data-nsimpan type="button">Selesai</button>') +
    `<div class="pfk"><label class="pfb pfin"><small>Nama</small><input id="nm" maxlength="24" value="${esc(S.nm || '')}" placeholder="Nama panggilan" autocomplete="off"></label></div><p class="mut pfkt">Dipakai pada sapaan di Beranda dan di kelas online. Maksimal 24 huruf.</p>`,
  init() {
    const i = $('#nm');
    if (i) {
      i.focus();
      i.addEventListener('keydown', (e) => e.key == 'Enter' && $('[data-nsimpan]')?.click());
    }
  },
});
const HAL_JK = () => ({
  html:
    head('Jenis kelamin', '#/pengaturan/akun') +
    `<p class="mut pfkt">Tidak ditampilkan ke pengguna lain.</p><div class="list sg">${JK.map(
      (j) =>
        `<label class="srw pfr"><span class="t">${j[1]}</span><input type="radio" name="jk" value="${j[0]}"${(S.jk || '') == j[0] ? ' checked' : ''}></label>`
    ).join('')}</div>`,
});
document.addEventListener('click', (x) => {
  if (!x.target.closest('[data-nsimpan]')) return;
  S.nm = ($('#nm')?.value || '').trim().slice(0, 24);
  save();
  toast(S.nm ? 'Nama disimpan' : 'Nama dikosongkan');
  keInduk('#/pengaturan/akun');
});
document.addEventListener('change', (x) => {
  if (x.target.name != 'jk') return;
  S.jk = x.target.value;
  save();
  toast('Jenis kelamin disimpan');
  setTimeout(() => keInduk('#/pengaturan/akun'), 250);
});
/* Hapus akun & data cloud (wajib untuk kebijakan Facebook/Google; petunjuk publik di hapus-data.html) */
const HAPUSAKUN = () =>
  cloudOn() && FBU
    ? `<h2>Hapus akun</h2><div class="card"><p class="mut" style="margin:0 0 10px">Menghapus akunmu di Fadzkuruuni beserta data cloud (pengaturan, penanda ayat, riwayat baca). Data di perangkat ini tetap ada.</p><button class="btn s" data-hapusakun style="color:#b3261e">Hapus akun &amp; data</button></div>`
    : '';
/* Tautan kecil ke dokumen privasi, selalu tampil di bawah (sudah masuk akun maupun belum, di web maupun aplikasi) */
const PRIVASI_KAKI = `<p class="mut pkaki"><a href="kebijakan-privasi.html">Kebijakan Privasi</a> · <a href="hapus-data.html">Penghapusan Data</a></p>`;
SETPAGES.akun = (sub) =>
  sub == 'nama'
    ? HAL_NAMA()
    : sub == 'jk'
      ? HAL_JK()
      : { html: head('Akun & Profil', '#/pengaturan') + PROFIL() + AKUN() + HAPUSAKUN() + PRIVASI_KAKI };
document.addEventListener('click', (x) => {
  if (!x.target.closest('[data-hapusakun]') || !FBU) return;
  konfirmasi(
    'Hapus akun & data?',
    'Akun dan semua data cloud-mu akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.',
    'Hapus permanen',
    async () => {
      const u = firebase.auth().currentUser;
      if (!u) return;
      try {
        await FBD.collection('users')
          .doc(u.uid)
          .delete()
          .catch(() => {});
        await FBD.collection('pemain')
          .doc(u.uid)
          .delete()
          .catch(() => {});
        await FBD.collection('pengguna')
          .doc(u.uid)
          .delete()
          .catch(() => {});
        await u.delete();
        FBU = null;
        S.foto = null;
        S.nm = '';
        S.ct = 0;
        try {
          localStorage.fz = JSON.stringify(S);
        } catch (e) {}
        tataNav();
        toast('Akun dan data cloud sudah dihapus');
        route();
      } catch (e) {
        toast(
          e.code == 'auth/requires-recent-login'
            ? 'Demi keamanan, keluar lalu masuk lagi, kemudian ulangi Hapus akun'
            : 'Gagal menghapus: ' + (e.code || e.message)
        );
      }
    }
  );
});

/* Masuk dengan email: kata sandi (masuk / daftar / lupa sandi) atau tautan masuk tanpa sandi yang dikirim ke email */
const EMSG = {
  'auth/invalid-email': 'Format email tidak valid',
  'auth/missing-password': 'Isi kata sandi',
  'auth/weak-password': 'Kata sandi minimal 6 karakter',
  'auth/email-already-in-use': 'Email ini sudah terdaftar. Pilih Masuk.',
  'auth/invalid-credential': 'Email atau kata sandi salah',
  'auth/wrong-password': 'Email atau kata sandi salah',
  'auth/user-not-found': 'Akun dengan email ini belum ada. Pilih Daftar.',
  'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.',
  'auth/network-request-failed': 'Tidak ada internet',
  'auth/operation-not-allowed': 'Masuk dengan email belum diaktifkan oleh pengelola aplikasi',
  'auth/unauthorized-continue-uri': 'Domain ini belum diizinkan di Firebase (Authorized domains)',
};
const emErr = (e) => EMSG[e && e.code] || 'Gagal: ' + ((e && e.code) || 'coba lagi');
async function emailSheet() {
  if (!navigator.onLine) return toast('Butuh internet untuk masuk');
  await fbInit();
  if (!window.firebase || !firebase.auth) return toast('Layanan akun belum siap. Coba lagi.');
  const A = firebase.auth();
  let mode = 'masuk';
  const e = document.createElement('div');
  e.className = 'back-d tgh';
  document.body.append(e);
  const gambar = () => {
    const d = mode == 'daftar',
      l = mode == 'lupa';
    e.innerHTML = `<div class="sheet ems" role="dialog" aria-label="Masuk dengan email"><b>${l ? 'Atur ulang kata sandi' : d ? 'Daftar dengan email' : 'Masuk dengan email'}</b>
  ${l ? '' : `<div class="seg" id="emm"><button type="button" data-v="masuk" class="${d ? '' : 'on'}">Masuk</button><button type="button" data-v="daftar" class="${d ? 'on' : ''}">Daftar</button></div>`}
  ${d ? '<input class="in" id="emn" maxlength="40" placeholder="Nama" autocomplete="name">' : ''}
  <input class="in" id="eme" type="email" inputmode="email" autocomplete="email" placeholder="Alamat email" value="${esc(e.em || '')}">
  ${l ? '<p class="mut">Kami kirim tautan untuk membuat kata sandi baru ke email ini.</p>' : `<div class="emp"><input class="in" id="emp" type="password" autocomplete="${d ? 'new-password' : 'current-password'}" placeholder="${d ? 'Buat kata sandi (min. 6 karakter)' : 'Kata sandi'}"><button type="button" class="ib2" data-emv aria-label="Tampilkan kata sandi">${ic('eye', 18)}</button></div>`}
  <button class="btn" id="emk" style="width:100%">${l ? 'Kirim tautan' : d ? 'Daftar' : 'Masuk'}</button>
  <div class="eml">${l ? '<button type="button" data-emgo="masuk">Kembali ke masuk</button>' : `${d ? '' : '<button type="button" data-emgo="lupa">Lupa kata sandi?</button>'}<button type="button" data-emlink>Kirim tautan masuk tanpa kata sandi</button>`}</div>
  <button class="btn s" data-x style="width:100%;margin-top:6px">Batal</button></div>`;
    segBind('emm', (v) => {
      e.em = $('#eme', e).value;
      mode = v;
      gambar();
    });
    $('#eme', e).focus();
  };
  gambar();
  const nilai = () => {
    const em = $('#eme', e).value.trim();
    e.em = em;
    if (!/^\S+@\S+\.\S+$/.test(em)) {
      toast('Isi alamat email yang benar');
      return null;
    }
    return em;
  };
  const sibuk = (on, t) => {
    const b = $('#emk', e);
    if (b) {
      b.disabled = on;
      if (t) b.textContent = t;
    }
  };
  e.onclick = async (x) => {
    const t = x.target;
    if (t == e || t.closest('[data-x]')) return e.remove();
    if (t.closest('[data-emv]')) {
      const p = $('#emp', e);
      p.type = p.type == 'password' ? 'text' : 'password';
      return;
    }
    const g = t.closest('[data-emgo]');
    if (g) {
      e.em = $('#eme', e).value;
      mode = g.dataset.emgo;
      return gambar();
    }
    if (t.closest('[data-emlink]')) {
      const em = nilai();
      if (!em) return;
      try {
        await A.sendSignInLinkToEmail(em, {
          url: location.origin + location.pathname + '#/pengaturan/akun',
          handleCodeInApp: true,
        });
        localStorage.fzem = em;
        e.remove();
        dlg(
          'Cek email kamu',
          'Tautan masuk sudah dikirim ke ' + em + '. Buka email itu di perangkat ini, lalu ketuk tautannya untuk masuk.'
        );
      } catch (err) {
        toast(emErr(err));
      }
      return;
    }
    if (!t.closest('#emk')) return;
    const em = nilai();
    if (!em) return;
    if (mode == 'lupa') {
      sibuk(true, 'Mengirim…');
      try {
        await A.sendPasswordResetEmail(em);
        e.remove();
        dlg('Cek email kamu', 'Tautan untuk membuat kata sandi baru sudah dikirim ke ' + em + '.');
      } catch (err) {
        toast(emErr(err));
        sibuk(false, 'Kirim tautan');
      }
      return;
    }
    const pw = $('#emp', e).value;
    if (pw.length < 6) return toast('Kata sandi minimal 6 karakter');
    sibuk(true, mode == 'daftar' ? 'Mendaftar…' : 'Masuk…');
    try {
      if (mode == 'daftar') {
        const r = await A.createUserWithEmailAndPassword(em, pw),
          nm = ($('#emn', e)?.value || '').trim();
        if (nm) {
          await r.user.updateProfile({ displayName: nm });
          if (!S.nm) {
            S.nm = nm.split(' ')[0];
            save();
          }
        }
        try {
          await r.user.sendEmailVerification();
        } catch (z) {}
      } else await A.signInWithEmailAndPassword(em, pw);
      e.remove();
      toast(mode == 'daftar' ? 'Akun dibuat. Selamat datang!' : 'Berhasil masuk');
      route();
    } catch (err) {
      toast(emErr(err));
      sibuk(false, mode == 'daftar' ? 'Daftar' : 'Masuk');
    }
  };
  e.onkeydown = (k) => {
    if (k.key == 'Enter' && k.target.matches('input')) $('#emk', e)?.click();
  };
}
document.addEventListener('click', (x) => {
  if (x.target.closest('[data-gem]')) emailSheet();
});
/* Kembali dari tautan masuk di email: selesaikan proses masuk */
(async () => {
  if (!/[?&]oobCode=/.test(location.href) || !/mode=signIn/.test(location.href)) return;
  await fbInit();
  if (!window.firebase || !firebase.auth) return;
  const A = firebase.auth();
  if (!A.isSignInWithEmailLink(location.href)) return;
  let em = localStorage.fzem;
  if (!em) em = prompt('Masukkan email yang kamu pakai untuk masuk');
  if (!em) return;
  try {
    await A.signInWithEmailLink(em, location.href);
    delete localStorage.fzem;
    history.replaceState(null, '', location.pathname + '#/pengaturan/akun');
    toast('Berhasil masuk');
    route();
  } catch (err) {
    toast(emErr(err));
  }
})();
