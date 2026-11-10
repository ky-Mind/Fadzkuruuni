/* js/core/tata.js - Tata letak aplikasi yang bisa diatur admin (dashboard admin.html > Tampilan, atau Mode admin di aplikasi).
   TATA_BAWAAN = susunan asli di kode. Admin menerbitkan perubahan ke Firestore config/tampilan (field "json");
   aplikasi mengambilnya lewat REST (tanpa memuat Firebase), menyimpannya untuk offline, lalu menerapkannya.
   Juga: statistik pemakaian ringan tanpa data pribadi (koleksi "stat", satu dokumen per hari). */
const FSURL = 'https://firestore.googleapis.com/v1/projects/' + FBCFG.projectId + '/databases/(default)/documents';
const TPRATINJAU = new URLSearchParams(location.search).has('pratinjau');
const TPEMILIK = ['hilmykia@gmail.com', 'ponpesfadzkuruuni@gmail.com'];

/* Semua tujuan yang bisa dipakai di pintasan, Semua Menu, dan menu bawah: rute -> [ikon, nama] */
const TPOOL = (() => {
  const P = { '': ['home', 'Beranda'], menu: ['grid', 'Lainnya'] };
  MENUALL.forEach((g) => g[1].forEach((m) => (P[m[0]] = [m[1], m[2]])));
  SHORT.forEach((s) => (P[s[0]] = P[s[0]] || [s[1], s[2]]));
  Object.assign(P, {
    zakat: P.zakat || ['heart', 'Zakat & Sedekah'],
    lapor: ['flag', 'Laporkan masalah'],
    ai: P.ai || ['spark', 'Fadz AI'],
    kalender: P.kalender || ['cal', 'Kalender'],
    pengaturan: P.pengaturan || ['sliders', 'Pengaturan'],
    dukung: P.dukung || ['heart', 'Dukung kami'],
    tutorial: P.tutorial || ['play', 'Video tutorial'],
    bookmark: P.bookmark || ['star', 'Penanda ayat'],
  });
  return P;
})();
/* Bagian Beranda: id -> nama (untuk dashboard & mode admin) */
const TBAG = {
  lokasi: 'Logo & lokasi',
  catatan: 'Catatan pembuka',
  pengumuman: 'Pengumuman admin',
  sapa: 'Sapaan & tanggal',
  jadwal: 'Jam & jadwal salat',
  pintasan: 'Pintasan',
  cari: 'Pencarian',
  promo: 'Kartu promo (zakat, tahlil, waris)',
  lanjut: 'Lanjutkan membaca',
  doa: 'Doa hari ini',
};
const TATA_BAWAAN = {
  beranda: Object.keys(TBAG).map((id) => ({ id, on: true })),
  pintasan: SHORT.map((s) => s[0]),
  menu: MENUALL.map((g) => ({ nama: g[0], isi: g[1].map((m) => m[0]) })),
  nav: ['', 'quran', 'ai', 'kelas', 'pengaturan'],
  setelan: null,
  sembunyiSet: [],
  label: {},
  umum: { on: false, judul: '', teks: '', tautan: '', label: 'Buka' },
  bawaan: {},
  urutU: {},
  teks: {},
};

/* Gabungkan konfigurasi admin dengan bawaan: urutan dari admin, bagian baru dari kode tetap muncul (di akhir) */
/* Fitur baru yang otomatis masuk ke susunan admin yang sudah terbit */
const TATA_BARU = ['sholawat', 'kelas'];
function tataGabung(c) {
  const B = JSON.parse(JSON.stringify(TATA_BAWAAN)),
    T = Object.assign(B, c && typeof c == 'object' ? c : {});
  if (c && Array.isArray(c.beranda)) {
    const ada = new Set(c.beranda.map((x) => x.id));
    T.beranda = c.beranda.filter((x) => TBAG[x.id]).concat(TATA_BAWAAN.beranda.filter((x) => !ada.has(x.id)));
  }
  /* Kelas online menggantikan Kalender di menu bawah (Kalender tetap ada di Semua Menu) */
  if (Array.isArray(T.nav) && T.nav.includes('kalender') && !T.nav.includes('kelas'))
    T.nav = T.nav.map((r) => (r == 'kalender' ? 'kelas' : r));
  const sah = (r) => r in TPOOL;
  T.pintasan = (T.pintasan || []).filter(sah);
  T.nav = (T.nav || []).filter((r) => sah(r) && !r.includes('/')).slice(0, 5);
  if (T.nav.length < 2) T.nav = TATA_BAWAAN.nav.slice();
  T.menu = (T.menu || [])
    .map((g) => ({ nama: String(g.nama || ''), isi: (g.isi || []).filter(sah) }))
    .filter((g) => g.isi.length);
  /* Fitur yang ditambahkan setelah susunan admin diterbitkan (mis. Sholawat) disisipkan ke kelompok bawaannya,
     setelah item sebelumnya */
  if (c && Array.isArray(c.menu)) {
    const semua = new Set(T.menu.flatMap((g) => g.isi));
    TATA_BARU.forEach((r) => {
      if (semua.has(r) || (c.dihapus || []).includes(r)) return;
      const gb = TATA_BAWAAN.menu.find((g) => g.isi.includes(r));
      if (!gb) return;
      const g = T.menu.find((x) => x.nama == gb.nama) || T.menu[0];
      if (!g) return;
      const sbl = gb.isi[gb.isi.indexOf(r) - 1],
        k = g.isi.indexOf(sbl);
      g.isi.splice(k < 0 ? g.isi.length : k + 1, 0, r);
    });
  }
  T.label = T.label || {};
  T.urutU = T.urutU && typeof T.urutU == 'object' ? T.urutU : {};
  T.teks = T.teks && typeof T.teks == 'object' ? T.teks : {};
  T.umum = Object.assign({}, TATA_BAWAAN.umum, T.umum || {});
  T.bawaan = T.bawaan || {};
  return T;
}
const tataBaca = () => {
  try {
    return JSON.parse(localStorage.fztata || 'null');
  } catch (e) {
    return null;
  }
};
let TATAV = (tataBaca() || {}).v || 0,
  TATA = tataGabung((tataBaca() || {}).c);

const tNama = (r, d) => TATA.label[r] || d || (TPOOL[r] || [])[1] || r;
const tIkon = (r) => (TPOOL[r] || ['grid'])[0];
const tataPintasan = () => TATA.pintasan.map((r) => [r, tIkon(r), tNama(r)]);
const tataMenu = () => TATA.menu.map((g) => [g.nama, g.isi.map((r) => [r, tIkon(r), tNama(r)])]);
const tataSetelan = () => {
  const G = SETGROUPS,
    urut = TATA.setelan;
  let L = G;
  if (Array.isArray(urut)) {
    const m = new Map(G.map((x) => [x[0], x]));
    L = urut
      .map((k) => m.get(k))
      .filter(Boolean)
      .concat(G.filter((x) => !urut.includes(x[0])));
  }
  return L.filter((x) => !(TATA.sembunyiSet || []).includes(x[0]));
};
const tataNavR = () => TATA.nav;

/* Menu bawah/samping dibangun dari TATA.nav */
function tataNav() {
  const n = $('#nav');
  if (!n) return;
  $$('a[data-r]', n).forEach((a) => a.remove());
  n.insertAdjacentHTML(
    'beforeend',
    TATA.nav
      .map(
        (r) =>
          `<a href="#/${r}" data-r="${r}" data-tip="${esc(tNama(r))}">${r == 'pengaturan' && window.fotoProfil && fotoProfil() ? `<img class="ava navava" src="${esc(fotoProfil())}" alt="" referrerpolicy="no-referrer">` : ic(tIkon(r))}<span>${esc(tNama(r))}</span></a>`
      )
      .join('')
  );
  const a = location.hash.slice(2).split('/')[0];
  $$('a[data-r]', n).forEach((l) => l.classList.toggle('on', l.dataset.r == a));
}

/* Tampilan bawaan dari admin: hanya untuk pengguna baru (pengaturan yang belum pernah disimpan di perangkat) */
const TSU = (() => {
  if (TPRATINJAU) return [];
  try {
    return Object.keys(JSON.parse(localStorage.fz || '{}'));
  } catch (e) {
    return [];
  }
})();
function tataBawaan() {
  const b = TATA.bawaan || {};
  let ub = 0;
  ['theme', 'ac', 'af', 'lf', 'fs', 'fl', 'fi', 'lt', 'tr'].forEach((k) => {
    if (b[k] !== undefined && b[k] !== '' && !TSU.includes(k) && S[k] !== b[k]) {
      S[k] = b[k];
      ub = 1;
    }
  });
  if (ub) {
    theme();
    setSz();
  }
}

function tataTerap(c, v, simpan) {
  TATA = tataGabung(c);
  if (v) TATAV = v;
  if (simpan)
    try {
      localStorage.fztata = JSON.stringify({ v, c });
    } catch (e) {}
  tataBawaan();
  tataNav();
  const a = location.hash.slice(2).split('/')[0];
  if (['', 'menu', 'pengaturan'].includes(a) && !document.querySelector('.back-d')) route();
  else tUmumTerap();
}
/* Ambil konfigurasi terbaru (REST publik, tanpa login); dicek saat dibuka & tiap kembali ke aplikasi (maks. 1x per 5
   menit) */
let TCEK = 0;
async function tataAmbil(paksa) {
  if (TPRATINJAU || !navigator.onLine || (!paksa && Date.now() - TCEK < 3e5)) return;
  TCEK = Date.now();
  try {
    const r = await fetch(FSURL + '/config/tampilan?key=' + FBCFG.apiKey, { cache: 'no-store' });
    if (!r.ok) return;
    const f = (await r.json()).fields || {},
      v = +(f.v?.integerValue || 0);
    if (!v || v == TATAV) return;
    tataTerap(JSON.parse(f.json?.stringValue || '{}'), v, 1);
  } catch (e) {}
}
tataBawaan();
/* Data untuk dashboard admin (dibaca dari iframe pratinjau, sama asal) */
if (TPRATINJAU)
  window.TATAINFO = {
    TPOOL,
    TBAG,
    TATA_BAWAAN,
    setelan: () => SETGROUPS,
    ACC,
    FAR,
    FLT,
    gabung: tataGabung,
    aktif: () => TATA,
  };
if (TPRATINJAU) {
  addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || !e.data.tata) return;
    if (e.data.diam) {
      TATA = tataGabung(e.data.tata);
      tUmumTerap();
      return;
    }
    tataTerap(e.data.tata, 0, 0);
    if (e.data.ke != null && location.hash != e.data.ke) location.hash = e.data.ke;
  });
}

/* ===== Ubahan bebas dari pratinjau dashboard: urutan & teks elemen apa saja =====
   Selain susunan terstruktur di atas (menu bawah, pintasan, bagian Beranda, Semua Menu, Pengaturan), admin bisa memindah
   tombol/kartu/chip apa pun dan mengganti teksnya. Disimpan per halaman (tHal: rute dengan angka diganti *):
   TATA.urutU[hal][kunciInduk] = [kunci anak berurutan], TATA.teks[hal][kunci] = teks baru.
   Kunci = jalur posisi asli ("#pt.2", "@beranda:jadwal.0", "v.3.0.2"), dicatat di data-tk sebelum ada yang dipindah, jadi tetap sama walau urutan berubah. */
const tHal = () =>
  location.hash
    .slice(2)
    .split('?')[0]
    .split('/')
    .map((s) => (/^\d+$/.test(s) ? '*' : s))
    .join('/') || 'beranda';
/* Elemen ber-id atau ber-data-ta memakai namanya sendiri sebagai jangkar ("#pt", "@beranda:jadwal"), jadi kunci anak-anaknya
   tidak bergeser bila bagian lain di atasnya disembunyikan/ditambah. Selebihnya: jangkar induk + nomor urut asli. */
function tTag(root) {
  if (!root.dataset.tk) root.dataset.tk = 'v';
  const jalan = (el) => {
    let i = 0;
    for (const c of el.children) {
      if (!c.dataset.tk) c.dataset.tk = c.id ? '#' + c.id : c.dataset.ta ? '@' + c.dataset.ta : el.dataset.tk + '.' + i;
      i++;
      if (c.children.length && !(c instanceof SVGElement)) jalan(c);
    }
  };
  jalan(root);
}
/* Teks milik elemen itu sendiri (tanpa anak elemen, mis. ikon atau angka jam) */
const tTeksNode = (el) => [...el.childNodes].filter((n) => n.nodeType == 3 && n.data.trim());
const tTeksSendiri = (el) =>
  tTeksNode(el)
    .map((n) => n.data.trim())
    .join(' ');
function tTeksPasang(el, v) {
  const L = tTeksNode(el);
  if (!L.length || tTeksSendiri(el) == v) return;
  const a = L[0].data.match(/^\s*/)[0],
    b = L[L.length - 1].data.match(/\s*$/)[0];
  L[0].data = a + v + b;
  L.slice(1).forEach((n) => (n.data = ''));
}
function tUmumTerap() {
  const h = tHal(),
    U = (TATA.urutU || {})[h],
    X = (TATA.teks || {})[h],
    v = $('#view');
  if (!v || (!U && !X)) return;
  tTag(v);
  const cari = (k) => (k == 'v' ? v : v.querySelector(`[data-tk="${CSS.escape(k)}"]`));
  for (const ck in U || {}) {
    const c = cari(ck);
    if (!c) continue;
    const anak = [...c.children],
      m = new Map(anak.map((x) => [x.dataset.tk, x])),
      daftar = U[ck].map((k) => m.get(k)).filter(Boolean);
    if (daftar.length < 2) continue;
    /* Anak yang tercatat diisikan ke slot-slot mereka sendiri; anak lain (mis. isi baru) tetap di tempatnya */
    const set = new Set(daftar);
    let j = 0;
    const akhir = anak.map((x) => (set.has(x) ? daftar[j++] : x));
    if (akhir.every((x, i) => x === anak[i])) continue;
    akhir.forEach((x) => c.appendChild(x));
  }
  for (const k in X || {}) {
    const el = cari(k);
    if (el) tTeksPasang(el, X[k]);
  }
}
/* MutationObserver sudah mengumpulkan perubahan satu tugas (gambar halaman + init), jadi langsung diterapkan sebelum
   layar dilukis: tanpa kedip */
{
  const amati = new MutationObserver(() => tUmumTerap());
  /* Diamati dari #app (bukan #view): pergantian halaman bisa memasang elemen #view yang baru */
  const pasang = () => {
    amati.observe($('#app') || document.body, { childList: true, subtree: true });
    tUmumTerap();
  };
  document.readyState == 'loading' ? document.addEventListener('DOMContentLoaded', pasang) : pasang();
}

/* ===== Pratinjau di dashboard admin =====
   - Tekan lama (±0,35 dtk) tombol/kartu/chip apa saja, lalu geser: elemen menempel di jempol/kursor (selisih gerak dibagi zoom
     halaman), tombol lain menyingkir dengan animasi halus. Dilepas = urutan baru dikirim ke dashboard.
   - Ketuk sekali teks apa saja: muncul kotak ubah teks (Simpan, Kembalikan, atau Buka untuk menjalankan tombolnya).
   Menu bawah, pintasan, bagian Beranda, Semua Menu & Pengaturan tetap memakai susunan terstruktur (postMessage {urut}),
   nama menu memakai TATA.label ({label}); elemen lain memakai ubahan bebas ({urutU} / {teks}). */
if (TPRATINJAU) {
  let sr = null,
    tm = 0,
    x0 = 0,
    y0 = 0,
    lewatKlik = null;
  const ASLI = new WeakMap(),
    gerak = new Set();
  const zm = () => (typeof zmKini == 'function' ? zmKini() : 1);
  const terstruktur = (t) => {
    const n = t.closest('#nav a[data-r]');
    if (n) return { el: n, j: 'nav', kunci: (a) => a.dataset.r, sib: () => $$('#nav a[data-r]') };
    const a = t.closest('[data-ta]');
    if (!a) return null;
    const j = a.dataset.ta.split(':')[0];
    return {
      el: a,
      j,
      kunci: (x) => x.dataset.ta.slice(j.length + 1),
      sib: () =>
        [...a.parentElement.children].filter((x) => x.dataset && x.dataset.ta && x.dataset.ta.startsWith(j + ':')),
    };
  };
  /* Elemen bebas yang dipindah: naik dari titik sentuh sampai ketemu elemen yang punya saudara sejenis (≥2) di
     induknya */
  const bebas = (t) => {
    const v = $('#view');
    if (!v || !v.contains(t)) return null;
    let e = t.closest('svg') ? t.closest('svg').parentElement : t;
    for (; e && e !== v; e = e.parentElement) {
      const p = e.parentElement;
      if (!p || p === v) break;
      const sj = [...p.children].filter((x) => x.tagName == e.tagName && !x.hidden);
      if (sj.length >= 2 && e.offsetWidth)
        return {
          el: e,
          j: '',
          bebas: 1,
          sib: () => [...p.children].filter((x) => x.tagName == e.tagName && !x.hidden),
        };
    }
    return null;
  };
  /* Yang paling dalam menang: chip/tombol di dalam bagian Beranda dipindah sendiri, bukan seluruh bagiannya */
  const target = (t) => {
    if (t.closest('input,textarea,select,[contenteditable],.tedt')) return null;
    const a = terstruktur(t),
      b = bebas(t);
    return a && b && a.el !== b.el && a.el.contains(b.el) ? b : a || b;
  };
  const batal = () => {
    clearTimeout(tm);
    tm = 0;
  };
  const angkat = () => {
    const s = sr;
    if (!s) return;
    tTag($('#view'));
    s.on = 1;
    const r = s.t.el.getBoundingClientRect();
    s.gx = x0 - r.left;
    s.gy = y0 - r.top;
    s.t.el.classList.add('sret');
    s.t.el.style.pointerEvents = 'none';
    document.body.classList.add('sreton');
    tEditTutup();
    try {
      navigator.vibrate && navigator.vibrate(18);
    } catch (e) {}
  };
  /* Pindahkan dengan animasi FLIP: saudara yang tergeser meluncur ke tempat barunya */
  const pindah = (el, ke, sesudah) => {
    const sib = sr.t.sib(),
      r0 = new Map(sib.map((x) => [x, x.getBoundingClientRect()]));
    ke.parentElement.insertBefore(el, sesudah ? ke.nextSibling : ke);
    const z = zm();
    sib.forEach((x) => {
      if (x === el) return;
      const a = r0.get(x),
        b = x.getBoundingClientRect(),
        dx = (a.left - b.left) / z,
        dy = (a.top - b.top) / z;
      if (!dx && !dy) return;
      gerak.add(x);
      const an = x.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], {
        duration: 200,
        easing: 'cubic-bezier(.2,.8,.2,1)',
      });
      an.onfinish = an.oncancel = () => gerak.delete(x);
    });
  };
  let raf = 0,
    ev = null;
  const langkah = () => {
    raf = 0;
    const e = ev;
    if (!sr || !sr.on || !e) return;
    const el = sr.t.el;
    /* Isi digambar ulang halaman saat diseret: batalkan dengan tenang */
    if (!el.isConnected) {
      sr = null;
      document.body.classList.remove('sreton');
      return;
    }
    const sib = sr.t.sib();
    const atas = document
      .elementsFromPoint(e.clientX, e.clientY)
      .map((p) => sib.find((x) => x !== el && x.contains(p)))
      .find(Boolean);
    if (atas && !gerak.has(atas)) {
      const i = sib.indexOf(el),
        k = sib.indexOf(atas);
      pindah(el, atas, k > i);
    }
    el.style.transform = 'none';
    const r = el.getBoundingClientRect(),
      z = zm();
    el.style.transform = `translate(${(e.clientX - sr.gx - r.left) / z}px,${(e.clientY - sr.gy - r.top) / z}px) scale(1.04)`;
  };
  addEventListener(
    'pointerdown',
    (e) => {
      if (e.button > 0 || sr) return;
      const t = target(e.target);
      x0 = e.clientX;
      y0 = e.clientY;
      sr = { t, on: 0, id: e.pointerId, ketuk: 1 };
      batal();
      if (t && t.sib().length >= 2) tm = setTimeout(angkat, 350);
    },
    true
  );
  addEventListener(
    'pointermove',
    (e) => {
      if (!sr || e.pointerId !== sr.id) return;
      if (!sr.on) {
        if (Math.hypot(e.clientX - x0, e.clientY - y0) > 8) {
          batal();
          sr.ketuk = 0;
          if (!sr.t) sr = null;
          else sr.t = null;
        }
        return;
      }
      e.preventDefault();
      ev = e;
      if (!raf) raf = requestAnimationFrame(langkah);
    },
    { capture: true, passive: false }
  );
  addEventListener(
    'touchmove',
    (e) => {
      if (sr && sr.on) e.preventDefault();
    },
    { capture: true, passive: false }
  );
  const lepas = (e) => {
    batal();
    if (!sr || (e && e.pointerId !== sr.id)) return;
    const s = sr;
    sr = null;
    if (!s.on) {
      if (s.ketuk && e.type == 'pointerup') lewatKlik = { x: e.clientX, y: e.clientY, t: Date.now() };
      return;
    }
    cancelAnimationFrame(raf);
    raf = 0;
    e.preventDefault && e.preventDefault();
    const el = s.t.el,
      z = zm(),
      awal = el.style.transform;
    el.classList.remove('sret');
    el.style.pointerEvents = '';
    el.style.transform = '';
    document.body.classList.remove('sreton');
    if (!el.isConnected || !el.parentElement) return;
    /* Mendarat halus ke tempatnya */
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(awal || '');
    if (m)
      el.animate([{ transform: `translate(${m[1]}px,${m[2]}px) scale(1.04)` }, { transform: 'none' }], {
        duration: 180,
        easing: 'cubic-bezier(.2,.8,.2,1)',
      });
    /* Klik setelah menyeret tidak membuka halaman */
    addEventListener(
      'click',
      function f(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        removeEventListener('click', f, true);
      },
      true
    );
    setTimeout(() => {
      lewatKlik = null;
    }, 0);
    if (s.t.bebas) {
      const p = el.parentElement;
      parent.postMessage(
        { urutU: { h: tHal(), c: p.dataset.tk, k: [...p.children].map((x) => x.dataset.tk) } },
        location.origin
      );
    } else parent.postMessage({ urut: { j: s.t.j, k: s.t.sib().map(s.t.kunci) } }, location.origin);
  };
  addEventListener('pointerup', lepas, true);
  addEventListener('pointercancel', lepas, true);
  addEventListener(
    'contextmenu',
    (e) => {
      if (sr) e.preventDefault();
    },
    true
  );

  /* ----- Ketuk sekali: ubah teks ----- */
  const teksDi = (t) => {
    const v = $('#view'),
      n = $('#nav');
    for (let e = t; e && e !== document.body; e = e.parentElement) {
      if (e === v) return null;
      if (e instanceof SVGElement) continue;
      const s = tTeksSendiri(e);
      if (s) {
        if (/^[\d\s:.,/+%×–-]+$/.test(s)) return null;
        return (v && v.contains(e)) || (n && n.contains(e)) ? e : null;
      }
    }
    return null;
  };
  /* Nama menu (menu bawah, pintasan, Semua Menu) disimpan sebagai TATA.label agar sama di semua tempat */
  const ruteMenu = (el) => {
    const a = el.closest('#nav a[data-r]');
    if (a) return a.dataset.r;
    const t = el.closest('[data-ta^="pin:"],[data-ta^="menu:"]');
    if (!t) return null;
    const k = t.dataset.ta.split(':').slice(1).join(':');
    return t.dataset.ta.startsWith('menu:') ? k.split('|').slice(1).join('|') : k;
  };
  addEventListener(
    'click',
    (e) => {
      if (e.target.closest('.tedt')) return;
      if (lewatKlik && e.target.dataset && e.target.dataset.tbuka == null) {
        const el = teksDi(e.target);
        if (el && !e.target.closest('input,textarea,select,[contenteditable]')) {
          e.preventDefault();
          e.stopPropagation();
          lewatKlik = null;
          return tEdit(el, e.target);
        }
      }
      lewatKlik = null;
    },
    true
  );
  window.tEditTutup = () => $('.tedt')?.remove();
  function tEdit(el, asal) {
    tEditTutup();
    if (!ASLI.has(el)) ASLI.set(el, tTeksSendiri(el));
    const r = ruteMenu(el),
      d = document.createElement('div');
    d.className = 'tedt';
    d.innerHTML = `<b>Ubah teks</b><input value="${esc(tTeksSendiri(el))}" maxlength="120" aria-label="Teks baru"><div><button type="button" data-te="simpan" class="pri">Simpan</button><button type="button" data-te="asli">Kembalikan</button><button type="button" data-te="buka">Buka</button><button type="button" data-te="x" aria-label="Tutup">×</button></div>${r != null ? '<small>Nama menu ini ikut berubah di pintasan, Semua Menu, dan menu bawah.</small>' : ''}`;
    document.body.append(d);
    const z = zm(),
      R = el.getBoundingClientRect(),
      w = d.offsetWidth * z,
      h = d.offsetHeight * z;
    d.style.left = Math.max(6, Math.min(innerWidth - w - 6, R.left)) / z + 'px';
    d.style.top = (R.bottom + h + 8 < innerHeight ? R.bottom + 6 : Math.max(6, R.top - h - 6)) / z + 'px';
    const inp = $('input', d);
    inp.focus();
    inp.select();
    const kirim = (v) => {
      if (r != null) parent.postMessage({ label: { r, v } }, location.origin);
      else {
        tTag($('#view'));
        parent.postMessage({ teks: { h: tHal(), k: el.dataset.tk, v } }, location.origin);
      }
    };
    inp.onkeydown = (x) => {
      if (x.key == 'Enter') $('[data-te=simpan]', d).click();
      if (x.key == 'Escape') tEditTutup();
    };
    d.onclick = (x) => {
      const b = x.target.closest('[data-te]');
      if (!b) return;
      const a = b.dataset.te;
      tEditTutup();
      if (a == 'simpan') {
        const v = inp.value.trim();
        if (!v) return;
        tTeksPasang(el, v);
        kirim(v == ASLI.get(el) ? '' : v);
      } else if (a == 'asli') {
        tTeksPasang(el, ASLI.get(el));
        kirim('');
      } else if (a == 'buka') {
        const t = asal.isConnected ? asal : el;
        t.dataset.tbuka = '';
        t.click();
        delete t.dataset.tbuka;
      }
    };
  }
  addEventListener(
    'pointerdown',
    (e) => {
      if (!e.target.closest('.tedt')) tEditTutup();
    },
    true
  );
} else {
  tataAmbil(1);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tataAmbil();
  });
}

/* ===== Statistik ringan (tanpa data pribadi): jumlah buka per fitur, perangkat aktif harian, kota, jenis aplikasi
   ===== */
const TSTAT = { hal: {}, pv: 0 };
let TSTT = 0;
const tKunci = (s) =>
  String(s || 'lain')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'lain';
const tHari = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};
const tJenis = () =>
  window.ANDROID || /; wv\)/.test(navigator.userAgent) || document.referrer.startsWith('android-app://')
    ? 'android'
    : matchMedia('(display-mode: standalone)').matches
      ? 'terpasang'
      : 'browser';
/* Merek/model HP untuk statistik (mis. "SM-A055F"); tanpa identitas. Dari Client Hints bila ada, kalau tidak dari
   user agent */
let TMODEL = '';
(async () => {
  try {
    const u = navigator.userAgentData;
    if (u && u.getHighEntropyValues) {
      const h = await u.getHighEntropyValues(['model', 'platform']);
      if (h.model) TMODEL = h.model;
      else if (h.platform && !/android/i.test(h.platform)) TMODEL = 'Komputer ' + h.platform;
    }
  } catch (e) {}
  if (!TMODEL || TMODEL == 'K') {
    const u = navigator.userAgent,
      m = u.match(/Android [\d.]+; (?:[a-z]{2}[-_][a-zA-Z]{2}; )?([^;)]+?)(?: Build|\))/);
    TMODEL =
      m && m[1] != 'K'
        ? m[1].trim()
        : /iPhone/.test(u)
          ? 'iPhone'
          : /iPad/.test(u)
            ? 'iPad'
            : /Android/.test(u)
              ? 'Android'
              : /Windows/.test(u)
                ? 'Komputer Windows'
                : /Mac OS/.test(u)
                  ? 'Komputer Mac'
                  : /Linux/.test(u)
                    ? 'Komputer Linux'
                    : 'Lainnya';
  }
})();
const tVersi = () =>
  window.ANDROID && window.FadzAndroid && FadzAndroid.versi ? 'apk ' + FadzAndroid.versi() : 'web ' + VER;
const tStatAktif = () => !TPRATINJAU && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && S.stat !== false;
function tataCatat(a) {
  if (!tStatAktif()) return;
  const k = tKunci(a || 'beranda');
  TSTAT.hal[k] = (TSTAT.hal[k] || 0) + 1;
  TSTAT.pv++;
  clearTimeout(TSTT);
  TSTT = setTimeout(tataKirim, 30000);
}
function tataKirim() {
  if (!tStatAktif() || !navigator.onLine) return;
  const hari = tHari(),
    F = [];
  let baru = 0;
  try {
    if (localStorage.fzstat != hari) {
      baru = 1;
    }
  } catch (e) {}
  if (!TSTAT.pv && !baru) return;
  const inc = (p, n) => F.push({ fieldPath: p, increment: { integerValue: String(n) } });
  if (TSTAT.pv) inc('pv', TSTAT.pv);
  Object.entries(TSTAT.hal).forEach(([k, n]) => inc('hal.' + k, n));
  if (baru) {
    inc('aktif', 1);
    inc('kota.' + tKunci(S.loc && S.loc.n), 1);
    inc('jenis.' + tJenis(), 1);
  }
  TSTAT.hal = {};
  TSTAT.pv = 0;
  fetch(FSURL.replace(/\/documents$/, '/documents:commit') + '?key=' + FBCFG.apiKey, {
    method: 'POST',
    keepalive: true,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      writes: [
        {
          transform: {
            document: 'projects/' + FBCFG.projectId + '/databases/(default)/documents/stat/' + hari,
            fieldTransforms: F,
          },
        },
      ],
    }),
  })
    .then((r) => {
      if (r.ok && baru) {
        try {
          localStorage.fzstat = hari;
        } catch (e) {}
        /* Model HP & versi dikirim terpisah: bila Firestore Rules belum diperbarui, hanya kiriman ini yang ditolak
           (statistik utama tetap tercatat) */
        const G = [
          { fieldPath: 'model.' + tKunci(TMODEL || 'lainnya'), increment: { integerValue: '1' } },
          { fieldPath: 'versi.' + tKunci(tVersi()), increment: { integerValue: '1' } },
        ];
        fetch(FSURL.replace(/\/documents$/, '/documents:commit') + '?key=' + FBCFG.apiKey, {
          method: 'POST',
          keepalive: true,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            writes: [
              {
                transform: {
                  document: 'projects/' + FBCFG.projectId + '/databases/(default)/documents/stat/' + hari,
                  fieldTransforms: G,
                },
              },
            ],
          }),
        }).catch(() => {});
      }
    })
    .catch(() => {});
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) tataKirim();
});

/* ===== Mode admin di aplikasi: admin yang masuk bisa menggeser/menyembunyikan bagian Beranda, pintasan, Semua Menu,
   dan Pengaturan ===== */
/* TADM = email admin yang sedang masuk; TAKSES = kategori aksesnya (lihat adminBisa) */
let TADM = null,
  TADMON = false,
  TDRAF = null,
  TAKSES = [];
/* Kategori akses admin: semua | kelas (pengajar Kelas online) | laporan | tampilan | statistik. Pemilik & admin lama
   = semua */
const adminBisa = (a) => !!TADM && (TAKSES.includes('semua') || TAKSES.includes(a));
async function tataAuth(u) {
  TADM = null;
  TAKSES = [];
  if (!u || !u.email || !u.emailVerified) return tataAdminUI();
  const e = u.email.toLowerCase();
  let L = TPEMILIK.slice(),
    A = {};
  try {
    const d = await FBD.collection('config').doc('admin').get();
    if (d.exists) {
      L = L.concat((d.data().emails || []).map((x) => String(x).toLowerCase()));
      A = d.data().akses || {};
    }
  } catch (x) {}
  if (L.includes(e)) {
    TADM = e;
    TAKSES = TPEMILIK.includes(e) ? ['semua'] : A[e] || ['semua'];
  }
  tataAdminUI();
  /* Halaman Akun & Profil yang sudah terbuka digambar ulang agar baris "Mode admin" muncul */
  if (TADM && location.hash == '#/pengaturan/akun' && typeof route == 'function') route();
}
const tataAdminKah = () => adminBisa('tampilan');
/* Tombol "Mode admin" muncul di halaman yang bisa diatur */
function tataAdminUI() {
  dispatchEvent(new Event('fzadmin'));
  $('#tadm')?.remove();
  document.body.classList.toggle('tadmon', !!TADMON);
  const a = location.hash.slice(2).split('/');
  if (!adminBisa('tampilan') || TPRATINJAU || !(['', 'menu'].includes(a[0]) || (a[0] == 'pengaturan' && !a[1]))) return;
  /* Tombol "Mode admin" tidak melayang di Beranda / Semua Menu (menghalangi isi): hanya di Pengaturan; saat mode
     admin aktif, bilah Terbitkan tetap tampil */
  /* Tombol "Mode admin" ada di Pengaturan › Akun & Profil (tidak melayang); bilah Terbitkan/Batal hanya tampil saat
     mode admin aktif */
  if (!TADMON) return;
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div id="tadm" class="tadm on" role="toolbar" aria-label="Mode admin"><span class="tgrip" aria-hidden="true">${TIK.grip}</span><b>Mode admin</b><button type="button" data-tadm="simpan" class="pri">Terbitkan</button><button type="button" data-tadm="batal">Batal</button><a href="admin.html" target="_blank" rel="noopener">Dashboard</a></div>`
  );
  seretMelayang($('#tadm'), 'tadmPos');
}
/* Ikon kecil kendali Mode admin (garis, mengikuti warna teks) */
const TIK = (() => {
  const s = (d) =>
    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  return {
    naik: s('<path d="M6 15l6-6 6 6"/>'),
    turun: s('<path d="M6 9l6 6 6-6"/>'),
    kiri: s('<path d="M15 6l-6 6 6 6"/>'),
    kanan: s('<path d="M9 6l6 6-6 6"/>'),
    lihat: s('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    sembunyi: s(
      '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/>'
    ),
    hapus: s('<path d="M6 6l12 12M18 6L6 18"/>'),
    grip: '<svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor" aria-hidden="true"><circle cx="4" cy="4" r="1.6"/><circle cx="10" cy="4" r="1.6"/><circle cx="4" cy="9" r="1.6"/><circle cx="10" cy="9" r="1.6"/><circle cx="4" cy="14" r="1.6"/><circle cx="10" cy="14" r="1.6"/></svg>',
  };
})();
/* Kendali Mode admin pada elemen ber-data-ta="jenis:kunci":
   - bagian Beranda: kepala bergaris putus-putus berisi nama bagian + tombol ikon naik / turun / sembunyikan
   - pintasan & isi Semua Menu (kisi): tombol ikon kecil geser kiri / kanan / keluarkan di atas ikonnya, tanpa menutupi nama
   - baris Pengaturan (daftar): naik / turun / sembunyikan di kanan baris */
function tataAdminPasang() {
  if (!TADMON) return;
  $$('#view [data-ta]').forEach((el) => {
    if ($(':scope > .tak', el)) return;
    const [j, k] = el.dataset.ta.split(':'),
      sembunyi = el.classList.contains('tah'),
      kisi = !!el.closest('.grid'),
      b = (aksi, ikon, label) =>
        `<button type="button" data-tak="${aksi}" aria-label="${label}" title="${label}">${ikon}</button>`;
    const urut = kisi
      ? b('naik', TIK.kiri, 'Geser ke kiri') + b('turun', TIK.kanan, 'Geser ke kanan')
      : b('naik', TIK.naik, 'Naikkan') + b('turun', TIK.turun, 'Turunkan');
    const tampil =
      j == 'beranda' || j == 'set'
        ? b('lihat', sembunyi ? TIK.sembunyi : TIK.lihat, sembunyi ? 'Tampilkan' : 'Sembunyikan')
        : b('hapus', TIK.hapus, 'Keluarkan dari daftar');
    const nama = j == 'beranda' ? `<b class="tan">${esc(TBAG[k] || k)}${sembunyi ? ' · tersembunyi' : ''}</b>` : '';
    el.insertAdjacentHTML(
      'afterbegin',
      `<span class="tak tak-${j == 'beranda' ? 'bag' : kisi ? 'kisi' : 'baris'}">${nama}<span class="takb">${urut}${tampil}</span></span>`
    );
  });
}
function tataGeser(j, k, aksi) {
  const D = TDRAF,
    pind = (A, i, d) => {
      const t = i + d;
      if (i < 0 || t < 0 || t >= A.length) return;
      [A[i], A[t]] = [A[t], A[i]];
    };
  if (j == 'beranda') {
    const i = D.beranda.findIndex((x) => x.id == k);
    if (aksi == 'lihat') D.beranda[i].on = !D.beranda[i].on;
    else pind(D.beranda, i, aksi == 'naik' ? -1 : 1);
  } else if (j == 'pin') {
    const i = D.pintasan.indexOf(k);
    if (aksi == 'hapus') D.pintasan.splice(i, 1);
    else pind(D.pintasan, i, aksi == 'naik' ? -1 : 1);
  } else if (j == 'menu') {
    const [g, r] = k.split('|'),
      G = D.menu[+g];
    const i = G.isi.indexOf(r);
    if (aksi == 'hapus') G.isi.splice(i, 1);
    else pind(G.isi, i, aksi == 'naik' ? -1 : 1);
  } else if (j == 'set') {
    if (!D.setelan) D.setelan = SETGROUPS.map((x) => x[0]);
    D.sembunyiSet = D.sembunyiSet || [];
    const i = D.setelan.indexOf(k);
    if (aksi == 'lihat') {
      const s = D.sembunyiSet.indexOf(k);
      s < 0 ? D.sembunyiSet.push(k) : D.sembunyiSet.splice(s, 1);
    } else pind(D.setelan, i, aksi == 'naik' ? -1 : 1);
  }
  TATA = tataGabung(D);
  route();
}
/* Menerbitkan: simpan ke config/tampilan + riwayat (dijaga Firestore Rules: hanya admin) */
async function tataTerbitkan(c, ket) {
  const v = Date.now(),
    json = JSON.stringify(c);
  const ref = FBD.collection('config').doc('tampilan');
  await ref.set({ json, v, t: v, oleh: TADM || '', ket: ket || '' });
  await ref.collection('riwayat').add({ json, v, t: v, oleh: TADM || '', ket: ket || '' });
  TATAV = v;
  try {
    localStorage.fztata = JSON.stringify({ v, c });
  } catch (e) {}
}
document.addEventListener(
  'click',
  async (e) => {
    const b = e.target.closest('[data-tadm]');
    if (b) {
      const a = b.dataset.tadm;
      if (a == 'mulai') {
        TADMON = true;
        TDRAF = JSON.parse(JSON.stringify(TATA));
        toast('Mode admin: geser atau sembunyikan bagian, lalu Terbitkan');
        /* Dimulai dari Akun & Profil: buka Beranda agar bisa langsung mengatur */
        const h = location.hash.slice(2).split('/');
        if (!(['', 'menu'].includes(h[0]) || (h[0] == 'pengaturan' && !h[1]))) {
          location.hash = '#/';
          return;
        }
      } else if (a == 'batal') {
        TADMON = false;
        TDRAF = null;
        TATA = tataGabung((tataBaca() || {}).c);
        toast('Perubahan dibatalkan');
      } else if (a == 'simpan') {
        b.disabled = true;
        try {
          await tataTerbitkan(TDRAF, 'Mode admin di aplikasi');
          TADMON = false;
          TATA = tataGabung(TDRAF);
          TDRAF = null;
          toast('Tampilan diterbitkan untuk semua pengguna');
        } catch (x) {
          b.disabled = false;
          return toast('Gagal menerbitkan: ' + (x.code || x.message));
        }
      }
      route();
      return;
    }
    const t = e.target.closest('[data-tak]');
    if (t && TADMON) {
      e.preventDefault();
      e.stopPropagation();
      const el = t.closest('[data-ta]'),
        [j, k] = el.dataset.ta.split(/:(.*)/s);
      tataGeser(j, k, t.dataset.tak);
    }
  },
  true
);
