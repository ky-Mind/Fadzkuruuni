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
  tbKetuk(kls);
};
const tReset = () => {
  S.tas = 0;
  S.tsp = 0;
  save();
  tUpd();
  tbUlang();
};

/* ===== Tampilan "Ringankan beban" di halaman Tasbih =====
   Orang lidi memikul mangkuk berisi bola beban (jumlahnya = target). Tiap ketukan satu butir tasbih emas jatuh dengan
   gravitasi, mengenai bola teratas (kilau + bunyi), bola terpental lalu memantul di tanah. Badan makin tegak secara
   bertahap mengikuti sisa beban (rangka dihitung tiap frame: pinggul, badan, kepala, lengan, kaki 2 ruas), langkah
   makin cepat. Setelah bola habis mangkuk diturunkan ke tanah dan orangnya berjalan ringan. Ketukan berikutnya, tombol
   "Mulai lagi", atau reset mengisi mangkuk lagi. Suara dibuat Web Audio (tanpa berkas), bisa dimatikan. */
S.tsmode = S.tsmode || 'beban';
/* Bacaan yang melayang tiap ketukan; 'urut' = Subhanallah → Alhamdulillah → Allahu Akbar bergantian per putaran */
const TBDZ = {
  subhan: ['Subhanallah', 'سُبْحَانَ اللّٰهِ'],
  hamdu: ['Alhamdulillah', 'اَلْحَمْدُ لِلّٰهِ'],
  akbar: ['Allahu Akbar', 'اَللّٰهُ أَكْبَرُ'],
  istighfar: ['Astaghfirullah', 'أَسْتَغْفِرُ اللّٰهَ'],
  tahlil: ['La ilaha illallah', 'لَا إِلٰهَ إِلَّا اللّٰهُ'],
};
const tbDzikir = (put = S.tsp || 0) => {
  const d = S.tsdz || 'urut';
  return TBDZ[d] || TBDZ[['subhan', 'hamdu', 'akbar'][put % 3]];
};
const tbJudul = () => {
  const s = TB && TB.n.querySelector('.tbs');
  if (s) s.textContent = tbDzikir()[0];
};
const TBG = 206,
  TBNS = 'http://www.w3.org/2000/svg';
const tbEl = (n, a, p) => {
  const e = document.createElementNS(TBNS, n);
  for (const k in a) e.setAttribute(k, a[k]);
  p && p.append(e);
  return e;
};
/* Tumpukan kubah (setengah elips 96×44) di atas bibir mangkuk (100,90); bola diperkecil sampai semua muat */
const tbPosisi = (B) => {
  const W = 96,
    H = 44,
    isi = (r) => {
      const sp = 2 * r * 1.03,
        L = [];
      for (let k = 0; ; k++) {
        const h = r + k * sp * 0.87;
        if (h > H) break;
        const w = W * Math.sqrt(1 - (h / H) ** 2),
          n = Math.floor(w / sp) + 1;
        for (let i = 0; i < n; i++) L.push([100 - ((n - 1) * sp) / 2 + i * sp + (k % 2 ? sp / 4 : -sp / 4), 89 - h]);
      }
      return L;
    };
  let r = Math.min(5.4, Math.sqrt((W * H * 0.785) / (B * 3.6))),
    L = isi(r);
  while (L.length < B && r > 0.6) L = isi((r *= 0.97));
  L.sort((a, b) => b[1] - a[1] || Math.abs(a[0] - 100) - Math.abs(b[0] - 100));
  return { L: L.slice(0, B), r };
};
let TB = null;
const tbLerp = (a, b, t) => a + (b - a) * t;
/* Lutut kaki 2 ruas (paha a, betis b) dari pinggul ke telapak, menekuk ke depan */
const tbLutut = (hx, hy, fx, fy, a, b) => {
  const dx = fx - hx,
    dy = fy - hy,
    d = Math.min(Math.hypot(dx, dy), a + b - 0.01),
    ca = (a * a + d * d - b * b) / (2 * a * d),
    ang = Math.atan2(dy, dx) - Math.acos(Math.max(-1, Math.min(1, ca)));
  let kx = hx + a * Math.cos(ang);
  const ky = hy + a * Math.sin(ang);
  if (kx < (hx + fx) / 2) kx = hx + fx - kx;
  return [kx, ky];
};
const tbF = (v) => v.toFixed(1);
function tbBangun() {
  const n = $('#tbn');
  if (!n) return;
  const B = S.tt,
    { L, r } = tbPosisi(B);
  n.innerHTML = `<svg viewBox="0 0 200 214" aria-hidden="true"><g class="tbbl"></g><g class="tbtn"></g><g class="tbor"></g><g class="tbdp"></g><g class="tbkt"></g></svg>
<span class="tbs"></span>
<span class="tbt"><b>Lebih ringan</b><small>Taqabbalallahu minna wa minkum</small><span class="tblg" role="button" tabindex="0">Mulai lagi</span></span>`;
  const q = (c) => n.querySelector(c),
    R = {};
  R.bukit = tbEl(
    'path',
    { class: 'tbbk', d: 'M0 206 Q40 170 80 206 Q120 182 160 206 Q200 168 240 206 Q280 180 320 206 Q360 172 400 206 Z' },
    q('.tbbl')
  );
  const ta = q('.tbtn');
  tbEl('path', { class: 'tbtnh', d: 'M0 206 H200' }, ta);
  R.rumput = tbEl(
    'path',
    {
      class: 'tbrp',
      d: Array.from({ length: 9 }, (_, i) => `M${i * 40 + 6} 206 l3 -5 l3 5 M${i * 40 + 24} 206 h6`).join(' '),
    },
    ta
  );
  tbEl('path', { class: 'tbtl', d: 'M4 2 Q50 12 94 26' }, ta);
  for (let i = 0; i < 9; i++) tbEl('circle', { class: 'tbbt', cx: 10 + i * 9.6, cy: tbF(5 + i * 2.6), r: 4.2 }, ta);
  const og = q('.tbor');
  R.mangkuk = tbEl('g', {}, og);
  const gb = tbEl('g', {}, R.mangkuk);
  const BOLA = L.map(([x, y], i) =>
    tbEl('circle', { class: 'tbb', cx: x.toFixed(2), cy: y.toFixed(2), r: r.toFixed(2), style: `--i:${i}` }, gb)
  );
  tbEl('path', { class: 'tbmk', d: 'M48 90 Q100 122 152 90 Z' }, R.mangkuk);
  R.kaki1 = tbEl('path', { class: 'tbog' }, og);
  R.kaki2 = tbEl('path', { class: 'tbog' }, og);
  R.badan = tbEl('path', { class: 'tbog' }, og);
  R.lengan = tbEl('path', { class: 'tbog' }, og);
  R.kepala = tbEl('circle', { class: 'tbkp', r: 9.5 }, og);
  R.dp = q('.tbdp');
  n.style.setProperty('--jeda', Math.max(0.3, 260 / B) + 'ms');
  const sisa = S.tt - S.tas;
  BOLA.forEach((b, i) => b.classList.toggle('hilang', i >= sisa));
  TB = {
    n,
    R,
    BOLA,
    RB: r,
    b: sisa / S.tt,
    bt: sisa / S.tt,
    ph: 0,
    geser: 0,
    aktif: 0,
    tahap: 'pikul',
    tTahap: 0,
    taruhan: null,
    part: [],
    baru: [],
    tunggu: 0,
    raf: 0,
    tLalu: performance.now(),
  };
  tbJudul();
  q('.tblg').onclick = (e) => {
    e.stopPropagation();
    tbUlang(true);
  };
  const loop = (t) => {
    if (!TB || !TB.n.isConnected) return;
    const dt = Math.min(0.05, (t - TB.tLalu) / 1000);
    TB.tLalu = t;
    TB.b += (TB.bt - TB.b) * Math.min(1, dt * 3.2);
    const g0 = TB.geser;
    tbRangka(dt);
    tbPartikel(dt, TB.geser - g0);
    TB.raf = requestAnimationFrame(loop);
  };
  TB.raf = requestAnimationFrame(loop);
  const tb = TB;
  halBersih(() => {
    cancelAnimationFrame(tb.raf);
    clearTimeout(tb.tunggu);
    if (TB == tb) TB = null;
  });
}
function tbRangka(dt) {
  const { R } = TB,
    b = TB.b,
    kini = performance.now(),
    jalan = TB.tahap != 'pikul' || kini - TB.aktif < 3500,
    taruh = TB.tahap == 'taruh',
    v = jalan ? 16 + 24 * (1 - b) : 0;
  if (!taruh) {
    TB.ph += dt * (v / 9);
    TB.geser += dt * v;
  }
  const p = TB.ph,
    paha = 31,
    betis = 32,
    hipX = 84 + 4 * b,
    gerak = jalan && !taruh,
    hipY = TBG - (paha + betis) * tbLerp(0.98, 0.84, b) - (gerak ? Math.abs(Math.sin(p)) * 1.6 : 0),
    stride = gerak ? tbLerp(13, 9, b) : 0;
  const kaki = (o) => {
    const fx = hipX + 4 + stride * Math.sin(p + o),
      fy = TBG - (stride ? Math.max(0, Math.cos(p + o)) * 4.5 : 0),
      [kx, ky] = tbLutut(hipX, hipY, fx, fy, paha, betis);
    return `M${tbF(hipX)} ${tbF(hipY)} L${tbF(kx)} ${tbF(ky)} L${tbF(fx)} ${tbF(fy)}`;
  };
  R.kaki1.setAttribute('d', kaki(0));
  R.kaki2.setAttribute('d', kaki(Math.PI));
  /* badan miring 54° saat beban penuh, tegak saat habis */
  const th = ((4 + 50 * b) * Math.PI) / 180,
    dx = Math.sin(th),
    dy = -Math.cos(th),
    len = 46,
    shX = hipX + dx * len,
    shY = hipY + dy * len;
  R.badan.setAttribute(
    'd',
    `M${tbF(hipX)} ${tbF(hipY)} Q${tbF(hipX + dx * len * 0.5 - dy * 3 * b)} ${tbF(hipY + dy * len * 0.5 + dx * 3 * b)} ${tbF(shX)} ${tbF(shY)}`
  );
  const ka = th + 0.35 * b;
  R.kepala.setAttribute('cx', tbF(shX + Math.sin(ka) * 14));
  R.kepala.setAttribute('cy', tbF(shY - Math.cos(ka) * 14));
  /* mangkuk di punggung; baru naik ke atas kepala saat beban hampir habis */
  const pgX = hipX + dx * len * 0.3 + dy * 18 - 12,
    pgY = hipY + dy * len * 0.3 - dx * 18 - 2,
    atX = shX + 1,
    atY = shY - 50,
    w = Math.min(1, b * 3);
  let bx = tbLerp(atX, pgX, w),
    by = tbLerp(atY, pgY, w),
    pegang = true;
  if (taruh) {
    const k = Math.min(1, (kini - TB.tTahap) / 1100),
      e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    bx = tbLerp(atX, shX + 44, e);
    by = tbLerp(atY, TBG - 14, e);
    if (k >= 1) {
      TB.tahap = 'jalan';
      TB.taruhan = { x: bx, y: by, g: TB.geser };
      TB.n.classList.add('selesai');
    }
  }
  if (TB.tahap == 'jalan' && TB.taruhan) {
    bx = TB.taruhan.x - (TB.geser - TB.taruhan.g);
    by = TB.taruhan.y;
    pegang = false;
  }
  R.mangkuk.setAttribute('transform', `translate(${tbF(bx)} ${tbF(by)}) scale(0.82) translate(-100 -90)`);
  TB.mk = { x: bx, y: by };
  if (pegang)
    R.lengan.setAttribute(
      'd',
      `M${tbF(shX)} ${tbF(shY)} L${tbF(bx - 13)} ${tbF(by + 5)} M${tbF(shX)} ${tbF(shY)} L${tbF(bx + 13)} ${tbF(by + 5)}`
    );
  else {
    const ay = Math.sin(p) * 0.5,
      a1 = 0.18 + ay,
      a2 = -0.18 - ay;
    R.lengan.setAttribute(
      'd',
      `M${tbF(shX)} ${tbF(shY + 4)} l${tbF(Math.sin(a1) * 26)} ${tbF(Math.cos(a1) * 26)} M${tbF(shX)} ${tbF(shY + 4)} l${tbF(Math.sin(a2) * 26)} ${tbF(Math.cos(a2) * 26)}`
    );
  }
  R.rumput.setAttribute('transform', `translate(${tbF(-(TB.geser % 40))} 0)`);
  R.bukit.setAttribute('transform', `translate(${tbF(-((TB.geser * 0.35) % 160))} 0)`);
}
function tbPartikel(dt, geser) {
  TB.part = TB.part.concat(TB.baru);
  TB.baru = [];
  TB.part = TB.part.filter((p) => {
    if (p.j == 'butir') {
      p.vy += 1100 * dt;
      p.y += p.vy * dt;
      p.x += p.vx * dt * 0.5;
      if (p.y >= p.ty) {
        p.e.remove();
        tbKena(p);
        return false;
      }
      p.e.setAttribute('cx', tbF(p.x));
      p.e.setAttribute('cy', tbF(p.y));
      return true;
    }
    p.t += dt;
    if (p.j == 'kilau') {
      const k = p.t / 0.35;
      p.e.setAttribute('r', tbF(2 + k * 9));
      p.e.setAttribute('opacity', (1 - k).toFixed(2));
      return k < 1 || (p.e.remove(), false);
    }
    if (p.j == 'debu') {
      const k = p.t / 0.5;
      p.e.setAttribute('rx', tbF(2 + k * 8));
      p.e.setAttribute('opacity', (0.3 * (1 - k)).toFixed(2));
      return k < 1 || (p.e.remove(), false);
    }
    /* bola: gravitasi, memantul dua kali, lalu tertinggal & memudar */
    p.vy += 520 * dt;
    p.x += p.vx * dt - geser;
    p.y += p.vy * dt;
    if (p.y > TBG - p.r) {
      p.y = TBG - p.r;
      if (p.pantul < 2) {
        p.vy *= -0.42;
        p.vx *= 0.7;
        if (!p.pantul) {
          const e = tbEl('ellipse', { class: 'tbdb', cx: tbF(p.x), cy: TBG - 1, rx: 2, ry: 1.6 }, TB.R.dp);
          TB.baru.push({ j: 'debu', e, t: 0 });
        }
        p.pantul++;
      } else (p.vy = 0), (p.vx *= 0.9);
    }
    const o = p.t > 0.9 ? Math.max(0, 1 - (p.t - 0.9) / 0.5) : 1;
    p.e.setAttribute('cx', tbF(p.x));
    p.e.setAttribute('cy', tbF(p.y));
    p.e.setAttribute('opacity', o.toFixed(2));
    return o > 0 || (p.e.remove(), false);
  });
}
function tbKena(p) {
  const k = tbEl('circle', { class: 'tbkl', cx: tbF(p.x), cy: tbF(p.ty), r: 2 }, TB.R.dp);
  TB.baru.push({ j: 'kilau', e: k, t: 0 });
  tbSuara('kena');
  const b = p.bola;
  if (!b) return;
  b.classList.add('hilang');
  const r = TB.RB * 0.82,
    c = tbEl('circle', { class: 'tbb', r: tbF(r), cx: tbF(p.tx), cy: tbF(p.tyb) }, TB.R.dp),
    arah = p.tx < TB.mk.x ? -1 : p.tx > TB.mk.x ? 1 : Math.random() < 0.5 ? -1 : 1;
  TB.baru.push({
    j: 'bola',
    e: c,
    r,
    x: p.tx,
    y: p.tyb,
    vx: arah * (38 + Math.random() * 30),
    vy: -70 - Math.random() * 30,
    t: 0,
    pantul: 0,
  });
}
/* Suara ketukan (Web Audio, tanpa berkas): "tik" butir, "tuk" bola, denting saat target */
let TBAC;
function tbNada(f, t, dur, vol, tipe, f2) {
  const a = TBAC,
    o = a.createOscillator(),
    g = a.createGain();
  o.type = tipe || 'sine';
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}
function tbSuara(j) {
  if (S.tsuara === false) return;
  try {
    TBAC = TBAC || new (window.AudioContext || window.webkitAudioContext)();
    if (TBAC.state == 'suspended') TBAC.resume();
    const t = TBAC.currentTime;
    if (j == 'tik') tbNada(2400, t, 0.06, 0.2, 'triangle', 1700), tbNada(3600, t + 0.004, 0.03, 0.07);
    else if (j == 'kena') tbNada(330, t, 0.13, 0.3, 'sine', 140);
    else [523, 659, 784, 1047].forEach((f, i) => tbNada(f, t + 0.1 + i * 0.12, 1.1, 0.15));
  } catch (e) {}
}
/* Dipanggil tap(): S sudah diperbarui (kls 'penuh' = target tercapai, S.tas sudah kembali 0) */
function tbKetuk(kls) {
  if (!$('#c')) return;
  tbSuara('tik');
  if (!TB || !TB.n.isConnected) return;
  TB.aktif = performance.now();
  /* putaran baru: ketukan pertama sesudah selesai (atau saat mangkuk sedang diturunkan) */
  if (TB.tahap != 'pikul' || TB.tunggu) tbUlang(false, kls == 'penuh' ? 0 : S.tas - 1);
  const ke = kls == 'penuh' ? S.tt : S.tas,
    i = S.tt - ke,
    bola = TB.BOLA[i],
    mk = TB.mk || { x: 100, y: 120 };
  const tx = bola ? mk.x + (+bola.getAttribute('cx') - 100) * 0.82 : mk.x,
    tyb = bola ? mk.y + (+bola.getAttribute('cy') - 90) * 0.82 : mk.y - 10;
  const e = tbEl('circle', { class: 'tbj', r: 4.4, cx: 94, cy: 26 }, TB.R.dp);
  TB.baru.push({ j: 'butir', e, x: 94, y: 26, vx: (tx - 94) * 2.2, vy: 0, ty: tyb - TB.RB - 3, tx, tyb, bola });
  TB.bt = (S.tt - ke) / S.tt;
  /* kata dzikir naik dari atas kepala lalu memudar */
  const [lt, ar] = tbDzikir(kls == 'penuh' ? (S.tsp || 1) - 1 : S.tsp || 0),
    kt = tbEl(
      'g',
      { class: 'tbkw', transform: `translate(${tbF(mk.x + (Math.random() - 0.5) * 50)} ${tbF(mk.y - 62)})` },
      TB.n.querySelector('.tbkt')
    ),
    ka = tbEl('g', { class: 'tbka' }, kt);
  tbEl('text', { class: 'tbka1', 'text-anchor': 'middle' }, ka).textContent = ar;
  tbEl('text', { class: 'tbka2', y: 11, 'text-anchor': 'middle' }, ka).textContent = lt;
  ka.addEventListener('animationend', () => kt.remove());
  const semua = TB.n.querySelectorAll('.tbkw');
  if (semua.length > 6) semua[0].remove();
  if (kls == 'penuh') {
    const tb = TB;
    tb.tunggu = setTimeout(() => {
      tb.tunggu = 0;
      if (TB != tb) return;
      tbSuara('selesai');
      tb.tahap = 'taruh';
      tb.tTahap = performance.now();
    }, 900);
  }
}
/* Isi mangkuk lagi (reset, "Mulai lagi", atau ketukan pertama putaran baru); sudah = hitungan yang sudah berjalan */
function tbUlang(manual, sudah) {
  if (!TB || !TB.n.isConnected) return;
  clearTimeout(TB.tunggu);
  TB.tunggu = 0;
  TB.tahap = 'pikul';
  TB.taruhan = null;
  TB.n.classList.remove('selesai');
  const s = S.tt - (sudah == null ? S.tas : sudah);
  TB.BOLA.forEach((b, i) => {
    b.classList.remove('masuk');
    b.classList.toggle('hilang', i >= s);
  });
  void TB.n.offsetWidth;
  TB.BOLA.forEach((b) => b.classList.add('masuk'));
  TB.bt = s / S.tt;
  tbJudul();
  if (manual) TB.aktif = performance.now();
}
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
const TSMODE = [
  ['beban', 'Ringankan beban'],
  ['cincin', 'Lingkaran'],
];
const TSDZ = [
  ['urut', 'Bergantian'],
  ['subhan', 'Subhanallah'],
  ['hamdu', 'Alhamdulillah'],
  ['akbar', 'Allahu Akbar'],
  ['istighfar', 'Astaghfirullah'],
  ['tahlil', 'Tahlil'],
];
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
<div class="list sg">${row('beads', 'Getar saat menghitung', 'Getar ringan pada setiap ketukan', tg('tsvb', S.vib !== false))}${row('beads', 'Getar lebih kuat', 'Untuk HP yang getarnya terasa lemah', tg('tsvk', !!S.vkuat))}${row('speaker', 'Suara ketukan', 'Bunyi butir tasbih tiap ketukan', tg('tssr', S.tsuara !== false))}${row('count', 'Tasbih melayang', 'Tombol hitung kecil di semua halaman', tg('tsft', S.ft !== false))}</div>
<small class="mut tsl">Getar saat target tercapai</small>${seg('tsvp', VPOLAS, S.vpola || 'ganda')}
<small class="mut tsl">Tampilan</small>${seg('tsmd', TSMODE, S.tsmode || 'beban')}
<small class="mut tsl">Bacaan yang muncul</small>${seg('tsdz', TSDZ, S.tsdz || 'urut')}
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
  $('#tssr').onchange = (x) => {
    S.tsuara = x.target.checked;
    save();
    S.tsuara && tbSuara('tik');
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
    tbBangun();
  });
  segBind('tsdz', (v) => {
    S.tsdz = v;
    save();
    tbJudul();
  });
  segBind('tsmd', (v) => {
    S.tsmode = v;
    save();
    route();
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
    (S.tsmode == 'beban'
      ? `<button class="tsf tsb" id="c" aria-label="Ketuk untuk menambah hitungan"><span class="tsw"><span class="tsr" aria-hidden="true"></span><b id="cn">0</b></span><span class="tbn" id="tbn"></span><span class="tsk"><span id="tg"></span> · <span id="tgk"></span></span><small class="tsh">Ketuk di mana saja</small></button>`
      : `<button class="tsf" id="c" aria-label="Ketuk untuk menambah hitungan"><span class="tsw"><span class="tsr" aria-hidden="true"></span><b id="cn">0</b></span><span class="tsk"><span id="tg"></span> · <span id="tgk"></span></span><small class="tsh">Ketuk di mana saja</small></button>`),
  init() {
    tUpd();
    tbBangun();
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
