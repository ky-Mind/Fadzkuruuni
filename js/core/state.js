/* js/core/state.js - Keadaan aplikasi, penyimpanan, tema, registri halaman (P) */
const $ = (s, e = document) => e.querySelector(s),
  $$ = (s, e = document) => [...e.querySelectorAll(s)];
/* Pratinjau dashboard admin (?pratinjau=1): memakai pengaturan bawaan pengguna baru, tidak membaca atau menyimpan
   pengaturan perangkat admin */
const PRAT = new URLSearchParams(location.search).has('pratinjau');
/* Bawaan: tema terang, aksen hitam, huruf Latin Times New Roman, huruf Arab Amiri, ukuran teks bacaan terkecil (bisa
   diubah di Tampilan & Bacaan) */
const S = Object.assign(
  {
    theme: 'light',
    ac: 'hitam',
    lf: 'times',
    af: 'amiri',
    fs: 22,
    fl: 12,
    fi: 12,
    tr: true,
    gold: '',
    loc: { lat: -6.9175, lng: 107.6191, n: 'Bandung', tz: 7 },
    hist: [],
    tas: 0,
  },
  /* Pratinjau dashboard admin: tema mengikuti tema dashboard (?tema=dark|light|blue), sisanya bawaan */
  PRAT ? { theme: new URLSearchParams(location.search).get('tema') || 'light' } : JSON.parse(localStorage.fz || '{}')
);
/* Ukuran tampilan bawaan mengikuti layar HP, ditetapkan sekali saat aplikasi pertama dipasang (rumus yang sama dipakai skrip awal di index.html,
   jadi ukuran sudah benar sejak gambar pertama, tanpa tulisan yang tiba-tiba membesar/mengecil). Pengguna lama tetap memakai pilihannya / 'kecil'. */
const uzLayar = () => {
  const w = Math.min(screen.width || innerWidth, screen.height || innerHeight);
  return w < 380 ? 'kecil' : w < 420 ? 'sedang' : 'besar';
};
/* Sejak 2.9.75 ukuran bawaan 'besar' (100%, seperti Instagram) untuk semua pengguna, sekali (S.uzv = 2); sesudahnya
   pilihan pengguna dihormati */
if (!PRAT && S.uzv != 2) {
  S.uz = 'besar';
  S.uzv = 2;
  try {
    const z = JSON.parse(localStorage.fz || '{}');
    z.uz = 'besar';
    z.uzv = 2;
    localStorage.fz = JSON.stringify(z);
  } catch (e) {}
}
if (!S.uz && !PRAT) {
  S.uz = 'besar';
  try {
    const z = JSON.parse(localStorage.fz || '{}');
    z.uz = S.uz;
    localStorage.fz = JSON.stringify(z);
  } catch (e) {}
}
/* Sekali saja (S.dv<2): pengaturan yang masih bernilai bawaan lama ikut pindah ke bawaan baru; pilihan pengguna
   sendiri tidak diubah */
if ((S.dv || 0) < 2) {
  if (S.theme == 'auto') S.theme = 'light';
  if (!S.ac || S.ac == 'emerald') S.ac = 'hitam';
  if (!S.af || S.af == 'times') S.af = 'amiri';
  if (S.fs == 32) S.fs = 22;
  if (!S.fl || S.fl == 15) S.fl = 12;
  if (!S.fi || S.fi == 14) S.fi = 12;
  S.dv = 2;
  if (!PRAT)
    try {
      localStorage.fz = JSON.stringify(S);
    } catch (e) {}
}
const save = () => {
  if (PRAT) return;
  localStorage.fz = JSON.stringify(S);
  window.cloudPush && window.cloudPush();
  setelSinkron();
};
/* Pengaturan yang tampil di beberapa tempat (halaman Pengaturan, lembar pengaturan baca/kitab, panel tasbih melayang,
   pengaturan halaman Tasbih) selalu disamakan setiap kali ada yang berubah, tanpa memuat ulang */
const SINK_SEG = {
  theme: [['th', 'sth', 'kth'], 'auto'],
  uz: [['uz'], 'kecil'],
  ac: [['acw'], 'hitam'],
  ftz: [['tfz', 'fptz'], 'kecil'],
  vpola: [['tvp', 'fpvp', 'tsvp'], 'ganda'],
  tt: [['ftt', 'fptt', 'tstt'], 33],
  kw: [['kwr'], null],
  kmode: [['kmd'], 'geser'],
  kml: [['kml'], 'peta'],
};
const SINK_TG = {
  vib: [['vib', 'fvb', 'tsvb'], (v) => v !== false],
  ft: [['fb', 'tsft'], (v) => v !== false],
  lt: [['lt', 's5'], (v) => !!v],
  tr: [['tr', 's1'], (v) => v !== false],
  vkuat: [['tsvk'], (v) => !!v],
  kfull: [['kfs'], (v) => !!v],
  klj: [['klj'], (v) => v !== false],
};
const SINK_RG = { fs: [['fs', 's2'], 22], fl: [['fl', 's6'], 15], fi: [['fi', 's7'], 14], kz: [['kzr'], 100] };
let sinkJ = 0;
function setelSinkron() {
  if (sinkJ || typeof document == 'undefined') return;
  sinkJ = setTimeout(() => {
    sinkJ = 0;
    try {
      for (const k in SINK_SEG) {
        const [ids, d] = SINK_SEG[k],
          v = String(S[k] ?? d);
        for (const id of ids)
          document.querySelectorAll('#' + id + ' [data-v]').forEach((b) => b.classList.toggle('on', b.dataset.v == v));
      }
      for (const k in SINK_TG) {
        const [ids, f] = SINK_TG[k];
        for (const id of ids) {
          const e = document.getElementById(id);
          if (e && e.type == 'checkbox') e.checked = f(S[k]);
        }
      }
      for (const k in SINK_RG) {
        const [ids, d] = SINK_RG[k];
        for (const id of ids) {
          const e = document.getElementById(id);
          if (e && e !== document.activeElement) {
            e.value = S[k] ?? d;
            const l = document.querySelector('[data-for="' + id + '"]');
            if (l) l.textContent = e.value;
          }
          document.querySelectorAll('[data-uv="' + k + '"]').forEach((u) => (u.textContent = S[k] ?? d));
        }
      }
      const tc = S.tc || 'auto';
      document.querySelectorAll('#wtk [data-tc]').forEach((b) => b.classList.toggle('on', b.dataset.tc == tc));
    } catch (e) {}
  }, 0);
}
const rp = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const toast = (m, ms) => {
  const t = $('#toast');
  t.textContent = m;
  t.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('on'), ms || 2200);
};
/* Tema: auto (ikut perangkat), light, dark, blue */
const theme = () => {
  const t =
    S.theme == 'blue'
      ? 'blue'
      : S.theme == 'dark' || (S.theme == 'auto' && matchMedia('(prefers-color-scheme:dark)').matches)
        ? 'dark'
        : 'light';
  document.documentElement.dataset.theme = t;
  document.documentElement.style.background = '';
  accent();
};
/* Warna aksen: [nama, terang utama, terang turunan, gelap utama, gelap turunan] */
const ACC = {
  hitam: ['Hitam', '#1c1f1e', '#3d4341', '#e6e9e7', '#ffffff'],
  emerald: ['Hijau', '#24584a', '#3a7363', '#7fb5a2', '#9fcdbb'],
  teal: ['Teal', '#0f5f63', '#2b7f83', '#7cc7cb', '#a6dadd'],
  blue: ['Biru', '#24497d', '#3b68a6', '#8fb6e6', '#adcbf0'],
  ungu: ['Ungu', '#563d7c', '#7257a0', '#b9a3df', '#cfbfec'],
  marun: ['Marun', '#7a2633', '#9a3b4a', '#e59aa6', '#f0b8c1'],
  coklat: ['Coklat', '#6b4423', '#8a5c34', '#d6aa7f', '#e6c4a2'],
  emas: ['Emas', '#8a6512', '#a8801f', '#e2c068', '#ecd393'],
  oranye: ['Oranye', '#a2481a', '#c0602c', '#f2a679', '#f6c0a0'],
  merahmuda: ['Merah muda', '#a03366', '#bd4f80', '#efa0c4', '#f5bfd7'],
  abu: ['Abu', '#3f4b55', '#5a6873', '#aebbc6', '#c7d1d9'],
};
/* Jenis huruf: [nama, font-family CSS, nama di Google Fonts ('' = sudah ada di perangkat)]. Huruf Arab untuk teks
   Arab, huruf Latin untuk seluruh tampilan. */
const FAR = {
  amiri: ['Amiri (bawaan)', "'Amiri',serif", 'Amiri'],
  times: ['Times', "'Times New Roman',Times,serif", ''],
  scheh: ['Scheherazade', "'Scheherazade New',serif", 'Scheherazade New'],
  naskh: ['Noto Naskh', "'Noto Naskh Arabic',serif", 'Noto Naskh Arabic'],
  lateef: ['Lateef', "'Lateef',serif", 'Lateef'],
  markazi: ['Markazi', "'Markazi Text',serif", 'Markazi Text'],
  kufi: ['Reem Kufi', "'Reem Kufi',sans-serif", 'Reem Kufi'],
  cairo: ['Cairo', "'Cairo',sans-serif", 'Cairo'],
  tajawal: ['Tajawal', "'Tajawal',sans-serif", 'Tajawal'],
  harmattan: ['Harmattan', "'Harmattan',sans-serif", 'Harmattan'],
};
const FLT = {
  times: ['Times (bawaan)', "'Times New Roman',Times,serif", ''],
  sistem: ['Sistem', "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif", ''],
  inter: ['Inter', "'Inter',sans-serif", 'Inter'],
  poppins: ['Poppins', "'Poppins',sans-serif", 'Poppins'],
  jakarta: ['Plus Jakarta', "'Plus Jakarta Sans',sans-serif", 'Plus Jakarta Sans'],
  nunito: ['Nunito', "'Nunito',sans-serif", 'Nunito'],
  lora: ['Lora', "'Lora',serif", 'Lora'],
  merri: ['Merriweather', "'Merriweather',serif", 'Merriweather'],
  playfair: ['Playfair', "'Playfair Display',serif", 'Playfair Display'],
  mono: ['Mono', "'JetBrains Mono',monospace", 'JetBrains Mono'],
};
/* Font lain bebas (S.afx / S.lfx) diambil dari Google Fonts menurut namanya; tanpa internet jatuh ke font bawaan */
const fontDari = (M, id, x, cad) => (id == 'x' && x ? [x, `'${x}',${cad}`, x] : M[id] || M.times);
const fontMuat = (g) => {
  if (!g) return;
  const id = 'gf-' + g.replace(/\W/g, '');
  if (document.getElementById(id)) return;
  const l = document.createElement('link');
  l.id = id;
  l.rel = 'stylesheet';
  l.href =
    'https://fonts.googleapis.com/css2?family=' +
    encodeURIComponent(g).replace(/%20/g, '+') +
    ':wght@400;600;700&display=swap';
  document.head.append(l);
};
const accent = () => {
  const t = document.documentElement.dataset.theme,
    a = t == 'blue' ? ACC.blue : ACC[S.ac] || ACC.hitam,
    r = document.documentElement.style,
    dk = t == 'dark';
  r.setProperty('--g', dk ? a[3] : a[1]);
  r.setProperty('--g2', dk ? a[4] : a[2]);
  if (t != 'blue' && ACC[S.ac] && S.ac != 'emerald')
    r.setProperty('--gs', `color-mix(in srgb,var(--g) ${dk ? 16 : 11}%,var(--bg))`);
  else r.removeProperty('--gs');
  const fa = fontDari(FAR, S.af, S.afx, 'serif'),
    fl = fontDari(FLT, S.lf, S.lfx, 'sans-serif');
  fontMuat(fa[2]);
  fontMuat(fl[2]);
  r.setProperty('--ar', fa[1]);
  r.setProperty('--ui', fl[1]);
  window.androidWarna && setTimeout(androidWarna);
  const m = $('meta[name=theme-color]');
  m && m.setAttribute('content', dk ? '#000000' : a[1]);
};
theme();
matchMedia('(prefers-color-scheme:dark)').addEventListener('change', theme);
const P = {};
const VER = '2.9.76';
const REPORT = { wa: '6289506138191', url: '', nocors: false };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
let LAST = '#/',
  LASTT = '';
/* Warna teks bacaan (Arab, latin, terjemah): 'auto' = hitam (putih di tema gelap); selain itu kode warna pilihan
   pengguna */
const WTEKS = [
  ['auto', 'Otomatis'],
  ['#1f5a43', 'Hijau'],
  ['#1f4f8f', 'Biru'],
  ['#6b3f1d', 'Coklat'],
  ['#7a1f2b', 'Merah tua'],
];
/* Ukuran teks bacaan + tampil/sembunyi Latin & terjemah untuk SEMUA halaman (lewat kelas di <html>, langsung berlaku
   tanpa memuat ulang) */
/* Ukuran tampilan di HP (layar sempit): seluruh aplikasi diperkecil lewat zoom. Bawaan 'kecil'. */
const ZM = { kecil: 0.86, sedang: 0.93, besar: 1 };
const zmKini = () => parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
/* Dipanggil setiap pindah halaman: hanya nilai yang berubah yang ditulis, agar tidak memicu hitung ulang tata letak
   seluruh aplikasi */
const setSz = () => {
  const r = document.documentElement.style,
    h = document.documentElement.classList,
    set = (k, v) => {
      if (r.getPropertyValue(k) != v) r.setProperty(k, v);
    };
  set('--zm', String(ZM[S.uz] || ZM.kecil));
  if (h.contains('no-lt') != !S.lt) h.toggle('no-lt', !S.lt);
  if (h.contains('no-tr') != (S.tr === false)) h.toggle('no-tr', S.tr === false);
  set('--lt', (S.fl || 15) + 'px');
  set('--tr', (S.fi || 14) + 'px');
  S.tc && S.tc != 'auto' ? set('--tc', S.tc) : r.getPropertyValue('--tc') && r.removeProperty('--tc');
};
/* Ganti ukuran tampilan tanpa tersendat: lapisan pratinjau geser yang tersembunyi dibuang dulu (dibangun ulang saat senggang),
   lalu ukuran baru dipasang di balik pudar singkat, jadi tidak terlihat tulisan melompat */
function ukuranGanti(v) {
  S.uz = v;
  save();
  try {
    VEL.forEach((e) => e.remove());
    VEL.clear();
    VPRE.clear();
  } catch (e) {}
  $$('.tpeek').forEach((e) => e.remove());
  const a = $('#app');
  a.style.transition = 'none';
  a.style.opacity = '0';
  /* Pewaktu biasa (bukan requestAnimationFrame, yang berhenti saat aplikasi di latar belakang): tampilan tidak pernah
     tertinggal kosong */
  setTimeout(() => {
    setSz();
    void a.offsetWidth;
    a.style.transition = 'opacity .2s ease';
    a.style.opacity = '';
    setTimeout(() => {
      a.style.transition = '';
      window.vSiapkan && vSiapkan();
    }, 240);
  }, 30);
}
/* Pilihan warna teks: bulatan warna + pemilih warna bebas; dipakai di Tampilan & Bacaan dan pengaturan baca */
const wteksUI = () => {
  const tc = S.tc || 'auto',
    lain = tc[0] == '#' && !WTEKS.some((w) => w[0] == tc) ? tc : '';
  return `<div class="wtk" id="wtk">${WTEKS.map(([v, n]) => `<button type="button" data-tc="${v}" class="${tc == v ? 'on' : ''}" style="--c:${v == 'auto' ? 'var(--bc,var(--ink))' : v}" aria-label="${n}"><i>${ic('check', 16)}</i><small>${n}</small></button>`).join('')}<label class="wtkb${lain ? ' on' : ''}" style="${lain ? '--c:' + lain : ''}" aria-label="Pilih warna lain"><i>${ic('check', 16)}</i><input type="color" id="tcx" value="${lain || '#333333'}"><small>Lainnya</small></label></div><div class="wtkp"><span>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</span><small>Bismillāhir-raḥmānir-raḥīm · Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang</small></div>`;
};
const wteksBind = () => {
  const pasang = (v) => {
    S.tc = v;
    save();
    setSz();
    const lain = v[0] == '#' && !WTEKS.some((w) => w[0] == v);
    $$('#wtk [data-tc]').forEach((b) => b.classList.toggle('on', b.dataset.tc == v));
    const l = $('#wtk .wtkb');
    if (l) {
      l.classList.toggle('on', lain);
      l.style.setProperty('--c', lain ? v : '');
    }
  };
  $$('#wtk [data-tc]').forEach((b) => (b.onclick = () => pasang(b.dataset.tc)));
  const x = $('#tcx');
  if (x) x.oninput = (e) => pasang(e.target.value);
};
setSz();
