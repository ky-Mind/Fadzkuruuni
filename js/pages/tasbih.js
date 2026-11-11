/* js/pages/tasbih.js - Tasbih dan tombol hitung melayang (bisa digeser ke mana saja di layar). Pengaturan ada di
   tombol kecil di layang dan di Tampilan & Bacaan. */
S.tt = S.tt || 33;
/* Getar: tiap hitungan getar singkat; saat target tercapai getar sesuai pola pilihan (S.vpola) */
const VPOLA = { pendek: [140], panjang: [550], ganda: [160, 90, 160, 90, 320] };
const VPOLAS = [
  ['pendek', 'Pendek'],
  ['panjang', 'Panjang'],
  ['ganda', 'Berpola'],
];
/* Di aplikasi Android getar lewat jembatan asli (WebView tidak menjalankan navigator.vibrate) */
const getarKe = (p) => {
  p = [].concat(p);
  if (window.ANDROID && window.FadzAndroid && FadzAndroid.getar) return andPanggil('getar', p.join(','));
  if (navigator.vibrate)
    try {
      navigator.vibrate(p);
    } catch (e) {}
};
const buzz = (p) => {
  if (S.vib !== false) getarKe(p);
};
/* Tasbih melayang: lingkaran manik-manik (33 butir) yang terisi sesuai hitungan, angka di tengah, rumbai di bawah */
const MANIK = 33,
  MANIKSVG = Array.from({ length: MANIK }, (_, i) => {
    const a = (i / MANIK) * 2 * Math.PI - Math.PI / 2;
    return `<circle class="mk" cx="${(50 + 42 * Math.cos(a)).toFixed(2)}" cy="${(50 + 42 * Math.sin(a)).toFixed(2)}" r="3.7"/>`;
  }).join('');
const tUpd = () => {
  const f = $('#fc');
  if (f) {
    const n = Math.round((S.tas / S.tt) * MANIK);
    $('#fcn').textContent = S.tas;
    $('#fct').textContent = S.tas + '/' + S.tt;
    $$('#fc .mk').forEach((m, i) => m.classList.toggle('on', i < n));
  }
  const c = $('#c');
  if (c) {
    $('#cn').textContent = S.tas;
    $('#tg').textContent = S.tas + ' / ' + S.tt;
    c.style.setProperty('--p', ((S.tas / S.tt) * 100).toFixed(2));
    $('#tgk').textContent = 'Putaran ke-' + ((S.tsp || 0) + 1);
  }
};
const tap = () => {
  S.tas++;
  const f = $('#fc'),
    c = $('#c');
  let kls = 'ketuk';
  if (S.tas >= S.tt) {
    buzz(VPOLA[S.vpola] || VPOLA.ganda);
    toast('Target ' + S.tt + ' tercapai');
    S.tas = 0;
    S.tsp = (S.tsp || 0) + 1;
    kls = 'penuh';
  } else buzz(S.vkuat ? 40 : 18);
  [f, c].forEach((x) => {
    if (x) {
      x.classList.remove('ketuk', 'penuh');
      void x.offsetWidth;
      x.classList.add(kls);
    }
  });
  save();
  tUpd();
};
const tReset = () => {
  S.tas = 0;
  S.tsp = 0;
  save();
  tUpd();
};
const ftb = mk(
  '',
  `<button id="fc" aria-label="Tasbih: tambah hitungan"><svg class="fcr" viewBox="0 0 100 100" aria-hidden="true">${MANIKSVG}</svg><b id="fcn">0</b><small id="fct">0/33</small></button><svg class="rumbai" viewBox="0 0 20 34" aria-hidden="true"><circle cx="10" cy="4" r="3.6"/><path d="M8 7h4l1 4h-6z"/><path d="M6.5 11h7l3 21H3.5z"/></svg><button id="fg" aria-label="Pengaturan tasbih">${ic('more', 18)}</button>`
);
/* Disembunyikan sampai halaman pertama siap (ftUpd), agar tidak sempat muncul sekilas saat aplikasi dimuat ulang */
ftb.id = 'ftb';
ftb.hidden = true;
$('#fc').onclick = tap;

/* Posisi disimpan dalam piksel dan dijepit agar tetap di dalam layar */
/* x,y dalam koordinat layar; dibagi skala tampilan (zoom di HP) saat dipasang sebagai left/top */
/* Ukuran tasbih melayang (Kecil/Sedang/Besar): skala dari pojok kanan bawah */
const FTZ = [
    ['kecil', 'Kecil'],
    ['sedang', 'Sedang'],
    ['besar', 'Besar'],
  ],
  FTZS = { kecil: 1, sedang: 1.25, besar: 1.5 };
/* Ukuran lama (kecil .78, sedang 1, besar 1.22) dipindah sekali: sedang → kecil (tampilan sama), besar → sedang */
if (!S.ftzv) {
  S.ftz = S.ftz == 'besar' ? 'sedang' : 'kecil';
  S.ftzv = 1;
  save();
}
const ftUkuran = () => document.documentElement.style.setProperty('--fts', FTZS[S.ftz] || 1);
ftUkuran();
/* x,y = pojok kiri atas yang terlihat (koordinat layar). Diukur langsung dari kotak yang tampil, jadi tetap tepat walau
   tasbih diperbesar (skala dari pojok kanan bawah) dan halaman di-zoom (HP): left/top digeser sebesar selisihnya ÷ zoom */
const place = (x, y) => {
  const r = ftb.getBoundingClientRect(),
    z = zmKini();
  x = Math.min(Math.max(0, x), innerWidth - r.width);
  y = Math.min(Math.max(0, y), innerHeight - r.height);
  const l = ftb.offsetLeft + (x - r.left) / z,
    t = ftb.offsetTop + (y - r.top) / z;
  Object.assign(ftb.style, { left: l + 'px', top: t + 'px', right: 'auto', bottom: 'auto' });
  return { x, y };
};

/* Seret seperti Kisah-Lillah: jari ditangkap tombol (setPointerCapture), posisi = posisi awal + jarak gerak jari,
   digambar sekali per frame. Tasbih tetap tepat di bawah jempol/kursor dari awal sampai dilepas. Ketukan biasa tetap menghitung. */
let dg = null,
  dgRaf = 0;
const dgGambar = () => {
  dgRaf = 0;
  if (dg && dg.moved) {
    place(dg.r.left + dg.x - dg.sx, dg.r.top + dg.y - dg.sy);
    ftpLetak();
  }
};
ftb.addEventListener('pointerdown', (e) => {
  if (e.button > 0 || e.target.closest('#fg')) return;
  delete ftb.dataset.drag;
  try {
    ftb.setPointerCapture(e.pointerId);
  } catch (x) {}
  dg = {
    id: e.pointerId,
    sx: e.clientX,
    sy: e.clientY,
    x: e.clientX,
    y: e.clientY,
    r: ftb.getBoundingClientRect(),
    moved: false,
  };
});
ftb.addEventListener('pointermove', (e) => {
  if (!dg || dg.id !== e.pointerId) return;
  dg.x = e.clientX;
  dg.y = e.clientY;
  if (!dg.moved) {
    if (Math.hypot(dg.x - dg.sx, dg.y - dg.sy) < 6) return;
    dg.moved = true;
    ftb.classList.add('seret');
    ftpTutup && ftpTutup();
  }
  e.preventDefault();
  if (!dgRaf) dgRaf = requestAnimationFrame(dgGambar);
});
const dgLepas = (e) => {
  if (!dg || dg.id !== e.pointerId) return;
  cancelAnimationFrame(dgRaf);
  dgRaf = 0;
  const w = dg;
  dg = null;
  ftb.classList.remove('seret');
  if (w.moved) {
    place(w.r.left + w.x - w.sx, w.r.top + w.y - w.sy);
    const r = ftb.getBoundingClientRect();
    S.ftp = { x: r.left, y: r.top };
    save();
    ftb.dataset.drag = 1;
  }
};
ftb.addEventListener('pointerup', dgLepas);
ftb.addEventListener('pointercancel', dgLepas);
ftb.addEventListener(
  'click',
  (e) => {
    if (ftb.dataset.drag) {
      delete ftb.dataset.drag;
      e.stopPropagation();
      e.preventDefault();
    }
  },
  true
);
addEventListener('resize', () => {
  if (S.ftp) place(S.ftp.x, S.ftp.y);
});

/* Pengaturan tasbih melayang: panel kecil yang ikut melayang di samping tombol (getar, target, reset, sembunyikan).
   Tutup dengan ketuk di luar panel, tombol pengaturan lagi, atau Esc. */
const ftpTutup = () => {
  const p = $('#ftp');
  if (!p) return;
  p.classList.add('out');
  setTimeout(() => p.remove(), 140);
};
const ftpLetak = () => {
  const p = $('#ftp');
  if (!p) return;
  const z = zmKini(),
    r = ftb.getBoundingClientRect(),
    w = p.offsetWidth * z,
    h = p.offsetHeight * z;
  let x = Math.min(Math.max(8, r.right - w), innerWidth - w - 8),
    y = r.top - h - 10;
  if (y < 8) y = Math.min(r.bottom + 10, innerHeight - h - 8);
  p.style.left = x / z + 'px';
  p.style.top = y / z + 'px';
  p.style.transformOrigin = `${(r.left + r.width / 2 - x) / z}px ${y < r.top ? h / z : 0}px`;
};
ftb.querySelector('#fg').onclick = (e) => {
  e.stopPropagation();
  if ($('#ftp')) return ftpTutup();
  const p = mk(
    'ftp',
    `<div class="ftph"><b>Tasbih</b><button class="ib2" data-fx aria-label="Tutup">×</button></div><div class="ftpr"><span>Getar saat menghitung</span>${tg('fvb', S.vib !== false)}</div><small class="mut">Getar saat target tercapai</small>${seg('fpvp', VPOLAS, S.vpola || 'ganda')}<small class="mut">Target</small>${seg(
      'fptt',
      [
        [33, '33'],
        [99, '99'],
        [100, '100'],
        [1000, '1000'],
      ],
      S.tt
    )}<small class="mut">Ukuran</small>${seg('fptz', FTZ, S.ftz || 'kecil')}<div class="ftpa"><button class="sb" id="frz">Reset</button><button class="sb dng" id="fhd">Sembunyikan</button></div>`
  );
  p.id = 'ftp';
  p.setAttribute('role', 'dialog');
  p.setAttribute('aria-label', 'Pengaturan tasbih melayang');
  ftpLetak();
  $('#fvb').onchange = (e) => {
    S.vib = e.target.checked;
    save();
    S.vib && buzz(18);
  };
  segBind('fpvp', (v) => {
    S.vpola = v;
    save();
    buzz(VPOLA[v]);
  });
  segBind('fptt', (v) => {
    S.tt = +v;
    S.tas = 0;
    S.tsp = 0;
    save();
    tUpd();
  });
  segBind('fptz', (v) => {
    S.ftz = v;
    save();
    ftUkuran();
    setTimeout(ftpLetak, 220);
  });
  $('#frz').onclick = () => {
    tReset();
    toast('Hitungan direset');
  };
  $('#fhd').onclick = () => {
    S.ft = false;
    save();
    ftUpd();
    ftpTutup();
    toast('Tasbih melayang disembunyikan');
  };
  $('[data-fx]', p).onclick = ftpTutup;
};
document.addEventListener(
  'pointerdown',
  (e) => {
    if ($('#ftp') && !e.target.closest('#ftp,#fg')) ftpTutup();
  },
  true
);
addEventListener('keydown', (e) => {
  if (e.key == 'Escape') ftpTutup();
});
addEventListener('resize', ftpLetak);
addEventListener('hashchange', ftpTutup);

/* Sinkron dengan sakelar "Tasbih melayang" di Pengaturan (Tampilan & Bacaan) dan di pengaturan halaman Tasbih */
const ftUpd = () => {
  if (S.ft === false) ftpTutup();
  $$('#fb,#tsft').forEach((x) => (x.checked = S.ft !== false));
  /* Tidak tampil di halaman Tasbih dan Fadz AI (agar tidak menutupi tombol kirim/mikrofon) */
  ftb.hidden = S.ft === false || ['tasbih', 'ai'].includes(location.hash.slice(2).split('/')[0]);
  if (S.ftp) place(S.ftp.x, S.ftp.y);
  tUpd();
};
/* Halaman Tasbih: seluruh area di bawah bilah atas adalah tombol hitung (ketuk di mana saja).
   Bilah atas: reset dan pengaturan (getar, pola getar, target, tasbih melayang). */
const TTGT = [
  [33, '33'],
  [99, '99'],
  [100, '100'],
  [1000, '1000'],
];
function tsSheet() {
  if ($('.back-d')) return;
  const e = document.createElement('div');
  e.className = 'back-d';
  e.innerHTML = `<div class="sheet tss" role="dialog" aria-label="Pengaturan tasbih"><div class="am-h"><b>Pengaturan tasbih</b><button class="ib2" data-x aria-label="Tutup">×</button></div>
<div class="list sg">${row('beads', 'Getar saat menghitung', 'Getar ringan pada setiap ketukan', tg('tsvb', S.vib !== false))}${row('beads', 'Getar lebih kuat', 'Untuk HP yang getarnya terasa lemah', tg('tsvk', !!S.vkuat))}${row('count', 'Tasbih melayang', 'Tombol hitung kecil di semua halaman', tg('tsft', S.ft !== false))}</div>
<small class="mut tsl">Getar saat target tercapai</small>${seg('tsvp', VPOLAS, S.vpola || 'ganda')}
<small class="mut tsl">Target hitungan</small>${seg('tstt', TTGT, S.tt)}
<button class="btn s" data-tsr style="width:100%;margin-top:14px">Reset hitungan</button></div>`;
  document.body.append(e);
  $('#tsvb').onchange = (x) => {
    S.vib = x.target.checked;
    save();
    S.vib && buzz(30);
  };
  $('#tsvk').onchange = (x) => {
    S.vkuat = x.target.checked;
    save();
    buzz(S.vkuat ? 40 : 18);
  };
  $('#tsft').onchange = (x) => {
    S.ft = x.target.checked;
    save();
    ftUpd();
    toast(S.ft ? 'Tasbih melayang ditampilkan di halaman lain' : 'Tasbih melayang disembunyikan');
  };
  segBind('tsvp', (v) => {
    S.vpola = v;
    save();
    buzz(VPOLA[v]);
  });
  segBind('tstt', (v) => {
    S.tt = +v;
    tReset();
  });
  e.onclick = (x) => {
    if (x.target == e || x.target.closest('[data-x]')) e.remove();
    else if (x.target.closest('[data-tsr]')) {
      tReset();
      toast('Hitungan direset');
      e.remove();
    }
  };
}
P.tasbih = () => ({
  html:
    head(
      'Tasbih',
      '#/',
      `<button class="ib" data-tsrz aria-label="Reset hitungan">${ic('rot', 19)}</button><button class="ib" data-tsset aria-label="Pengaturan tasbih">${ic('sliders', 19)}</button>`
    ) +
    `<button class="tsf" id="c" aria-label="Ketuk untuk menambah hitungan"><span class="tsw"><span class="tsr" aria-hidden="true"></span><b id="cn">0</b></span><span class="tsk"><span id="tg"></span> · <span id="tgk"></span></span><small class="tsh">Ketuk di mana saja</small></button>`,
  init() {
    tUpd();
    $('#c').onclick = tap;
    $('[data-tsrz]').onclick = () => {
      if (!S.tas && !S.tsp) return toast('Hitungan masih 0');
      konfirmasi('Reset hitungan?', 'Hitungan tasbih kembali ke 0.', 'Reset', () => {
        tReset();
        toast('Hitungan direset');
      });
    };
    $('[data-tsset]').onclick = tsSheet;
    /* Papan ketik: spasi/Enter menambah hitungan */
    const k = (e) => {
      if (!$('#c')) return removeEventListener('keydown', k);
      if ((e.key == ' ' || e.key == 'Enter') && !$('.back-d') && document.activeElement != $('#c')) {
        e.preventDefault();
        tap();
      }
    };
    halDengar(window, 'keydown', k);
  },
});
