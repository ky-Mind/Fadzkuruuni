/* js/core/tajwid.js - Tajwid berwarna untuk Al-Qur'an (mode Mushaf & Kartu).
   - Warna mengikuti palet font halaman mushaf tajwid (KFGQPC V4, indeks warna CPAL), jadi Kartu dan Mushaf sama persis.
   - S.tj = nyala/mati semua; S.tjOff[id] = satu kelompok hukum dimatikan (warnanya jadi warna teks biasa).
   - Teks tajwid (Quran Foundation, <tajweed class=...>) diubah jadi <span class="tj tj-..."> untuk mode Kartu.
   - Ketuk huruf berwarna: penjelasan singkat hukumnya (tjPop). Lembar "Hukum tajwid" berisi semua hukum, saklar per hukum,
     dan contoh ayat yang bisa diputar (tjLembar). */
if (S.tj == null) S.tj = true;
S.tjOff = S.tjOff || {};
/* Kelompok warna: c = indeks warna di palet font mushaf, alt = indeks lain dengan arti sama */
const TJ_KEL = [
  { id: 'ghunnah', c: 6, nama: 'Ghunnah, Ikhfa & Iqlab', s: 'Dibaca berdengung sekitar 2 harakat' },
  {
    id: 'idgham',
    c: 2,
    alt: [1, 15],
    nama: 'Idgham & huruf tidak dibaca',
    s: 'Huruf abu-abu dilebur atau tidak dibaca',
  },
  { id: 'mad2', c: 5, nama: "Mad thabi'i", s: 'Panjang 2 harakat' },
  { id: 'madjaiz', c: 4, nama: 'Mad jaiz', s: 'Boleh 2, 4, atau 5–6 harakat' },
  { id: 'madwajib', c: 9, nama: 'Mad wajib muttashil', s: 'Wajib 4–5 harakat' },
  { id: 'madlazim', c: 3, nama: 'Mad lazim', s: 'Wajib 6 harakat' },
  { id: 'qalqalah', c: 8, nama: 'Qalqalah', s: 'Dibaca memantul' },
  { id: 'tafkhim', c: 7, nama: 'Tafkhim', s: 'Huruf dibaca tebal' },
];
/* Hukum per kelas teks tajwid: [kelompok, nama, penjelasan] */
const TJ_HK = {
  ghunnah: ['ghunnah', 'Ghunnah', 'Nun atau mim bertasydid (نّ / مّ). Dibaca berdengung sekitar 2 harakat.'],
  ikhafa: [
    'ghunnah',
    'Ikhfa haqiqi',
    'Nun mati atau tanwin bertemu salah satu 15 huruf (ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك). Dibaca samar dengan dengung sekitar 2 harakat.',
  ],
  ikhafa_shafawi: ['ghunnah', 'Ikhfa syafawi', 'Mim mati bertemu ب. Dibaca samar di bibir dengan dengung.'],
  iqlab: ['ghunnah', 'Iqlab', 'Nun mati atau tanwin bertemu ب. Bunyi nun diganti mim samar dengan dengung.'],
  idgham_ghunnah: [
    'idgham',
    'Idgham bighunnah',
    'Nun mati atau tanwin bertemu ي ن م و (di dua kata). Dileburkan ke huruf berikutnya dengan dengung.',
  ],
  idgham_wo_ghunnah: [
    'idgham',
    'Idgham bilaghunnah',
    'Nun mati atau tanwin bertemu ل atau ر. Dileburkan tanpa dengung.',
  ],
  idgham_shafawi: ['idgham', 'Idgham mimi', 'Mim mati bertemu mim. Dileburkan dengan dengung.'],
  idgham_mutajanisayn: [
    'idgham',
    'Idgham mutajanisain',
    'Dua huruf yang makhrajnya sama tetapi sifatnya berbeda. Huruf pertama dileburkan.',
  ],
  idgham_mutaqaribayn: [
    'idgham',
    'Idgham mutaqaribain',
    'Dua huruf yang makhraj dan sifatnya berdekatan. Huruf pertama dileburkan.',
  ],
  laam_shamsiyah: [
    'idgham',
    'Alif lam syamsiyah',
    'Lam tidak dibaca; langsung ke huruf syamsiyah sesudahnya yang bertasydid.',
  ],
  ham_wasl: [
    'idgham',
    'Hamzah washal',
    'Dibaca bila memulai bacaan dari kata ini, tidak dibaca bila bacaan disambung.',
  ],
  slnt: ['idgham', 'Huruf tidak dibaca', 'Huruf yang ditulis tetapi tidak dibaca saat bacaan disambung.'],
  madda_normal: ['mad2', "Mad thabi'i", 'Mad asli, dibaca panjang 2 harakat.'],
  madda_permissible: [
    'madjaiz',
    'Mad jaiz',
    "Mad jaiz munfashil atau mad 'aridh lissukun: boleh dipanjangkan 2, 4, atau 5–6 harakat.",
  ],
  madda_obligatory: [
    'madwajib',
    'Mad wajib muttashil',
    'Huruf mad bertemu hamzah dalam satu kata. Wajib dipanjangkan 4–5 harakat.',
  ],
  madda_necessary: [
    'madlazim',
    'Mad lazim',
    'Huruf mad bertemu sukun atau tasydid asli. Wajib dipanjangkan 6 harakat.',
  ],
  qalaqah: [
    'qalqalah',
    'Qalqalah',
    'Huruf ق ط ب ج د yang sukun dibaca memantul. Lebih kuat bila berhenti di akhir kata (qalqalah kubra).',
  ],
};
/* Contoh ayat tiap kelompok (diputar dari lembar Hukum tajwid) */
const TJ_CONTOH = {
  ghunnah: '2:6',
  idgham: '2:2',
  mad2: '1:4',
  madjaiz: '2:4',
  madwajib: '2:13',
  madlazim: '1:7',
  qalqalah: '2:5',
  tafkhim: '1:2',
};
/* Palet font mushaf (CPAL 0 = terang, 1 = gelap) */
const TJ_PAL = {
  light: {
    1: '#a5a5a5',
    2: '#a3a5a5',
    3: '#b50000',
    4: '#ff7b00',
    5: '#ce9e00',
    6: '#09b000',
    7: '#3f48e6',
    8: '#2fadff',
    9: '#f40000',
    15: '#9fa5a5',
  },
  dark: {
    1: '#9d9999',
    2: '#999999',
    3: '#e30000',
    4: '#ff8e3b',
    5: '#ffc1e0',
    6: '#26b55d',
    7: '#3c84d5',
    8: '#00deff',
    9: '#ff5e8e',
    15: '#919999',
  },
};
const tjGelap = () => document.documentElement.dataset.theme == 'dark';
const tjKel = (id) => TJ_KEL.find((k) => k.id == id);
const tjWarnaKel = (id) => TJ_PAL[tjGelap() ? 'dark' : 'light'][tjKel(id).c];
/* Warna Kartu lewat variabel CSS --tjN (hukum yang dimatikan memakai warna teks biasa) */
function tjWarna() {
  const P = TJ_PAL[tjGelap() ? 'dark' : 'light'],
    r = document.documentElement;
  Object.entries(P).forEach(([i, c]) => {
    const k = TJ_KEL.find((x) => x.c == i || (x.alt || []).includes(+i));
    r.style.setProperty('--tj' + i, k && S.tjOff[k.id] ? 'inherit' : c);
  });
  document.body.classList.toggle('tjon', !!S.tj);
  window.msPalet && msPalet();
}
/* Teks tajwid → HTML berwarna. Harakat/tanda tidak boleh terpisah dari hurufnya ke elemen lain (di Chrome Android
   jadi lingkaran putus-putus dan bertabrakan), jadi potongan berwarna diperluas ke huruf dasar sebelum tanda di awalnya,
   dan tanda sesudahnya ikut masuk. */
const tjTeks = (t) => {
  /* Potong jadi [teks, kelas terdalam]; tag tajwid bisa bersarang (mis. slnt di dalam madda_obligatory) */
  const P = [],
    tumpuk = [];
  String(t)
    .replace(/<span class=end>[^<]*<\/span>/g, '')
    .split(/(<tajweed class=[a-z_]+>|<\/tajweed>)/)
    .forEach((x) => {
      if (!x) return;
      const b = x.match(/^<tajweed class=([a-z_]+)>$/);
      if (b) tumpuk.push(b[1]);
      else if (x == '</tajweed>') tumpuk.pop();
      else P.push({ t: x, c: tumpuk[tumpuk.length - 1] });
    });
  for (let k = 0; k < P.length; k++) {
    const x = P[k];
    if (!x.c) continue;
    if (/^\p{M}/u.test(x.t) && k > 0) {
      let j = k - 1;
      while (j > 0 && !P[j].t) j--;
      const a = P[j],
        g = a.t.match(/[^\p{M}]\p{M}*$/u);
      if (g) {
        a.t = a.t.slice(0, -g[0].length);
        x.t = g[0] + x.t;
      }
    }
    const b = P[k + 1];
    if (b) {
      const g = b.t.match(/^\p{M}+/u);
      if (g) {
        b.t = b.t.slice(g[0].length);
        x.t += g[0];
      }
    }
  }
  return P.map((x) => (x.c ? `<span class="tj tj-${x.c}" data-tj="${x.c}">${x.t}</span>` : x.t))
    .join('')
    .trim();
};
/* Kelas hukum yang ada di sebuah teks tajwid */
const tjKelas = (t) =>
  [...new Set((String(t).match(/class=([a-z_]+)/g) || []).map((x) => x.slice(6)))].filter((c) => TJ_HK[c]);
/* Baris hukum (dipakai di menu ayat dan lembar) */
const tjBaris = (c) => {
  const [g, n, d] = TJ_HK[c];
  return `<div class="tjl"><i style="background:${tjWarnaKel(g)}"></i><div><b>${n}</b><small>${d}</small></div></div>`;
};
/* Penjelasan saat huruf berwarna diketuk */
function tjPop(el) {
  $$('.tjpop').forEach((p) => p.remove());
  const c = el.dataset.tj,
    h = TJ_HK[c];
  if (!h || S.tjOff[h[0]]) return false;
  const r = el.getBoundingClientRect(),
    p = document.createElement('div');
  p.className = 'tjpop';
  p.setAttribute('role', 'tooltip');
  p.innerHTML = `<b><i style="background:${tjWarnaKel(h[0])}"></i>${h[1]}</b><span>${h[2]}</span>`;
  document.body.append(p);
  const w = p.offsetWidth;
  p.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
  p.style.top = (r.top > p.offsetHeight + 90 ? r.top - p.offsetHeight - 8 : r.bottom + 8) + 'px';
  const tutup = (e) => {
    if (e && e.target.closest && e.target.closest('.tjpop')) return;
    p.remove();
    removeEventListener('pointerdown', tutup, true);
    removeEventListener('scroll', tutup, true);
  };
  setTimeout(() => {
    addEventListener('pointerdown', tutup, true);
    addEventListener('scroll', tutup, true);
  }, 0);
  return true;
}
/* Lembar "Hukum tajwid": warna, saklar per hukum, penjelasan, dan contoh ayat */
function tjLembar() {
  const e = document.createElement('div');
  e.className = 'back-d';
  const isi = TJ_KEL.map((k) => {
    const hk = Object.values(TJ_HK).filter((v) => v[0] == k.id);
    const teks = hk.length
      ? hk.map((v) => `<p><b>${v[1]}:</b> ${v[2]}</p>`).join('')
      : `<p>${k.s}. Huruf isti'la (خ ص ض غ ط ق ظ), lam pada lafaz Allah sesudah fathah/dhammah, dan ra pada keadaan tertentu dibaca tebal.</p>`;
    const ex = TJ_CONTOH[k.id];
    return `<div class="tjk"><div class="tjk-h" style="background:${tjWarnaKel(k.id)}"><span>${k.nama}</span><label class="sw"><input type="checkbox" data-tjk="${k.id}"${S.tjOff[k.id] ? '' : ' checked'}><i></i></label></div><div class="tjk-b">${teks}${ex ? `<div class="tjk-ex"><button type="button" class="ib2" data-tjex="${ex}" aria-label="Putar contoh">${ic('play', 18)}</button><span class="tjar" data-tjar="${ex}">…</span></div>` : ''}</div></div>`;
  }).join('');
  e.innerHTML = `<div class="sheet tjsh" role="dialog" aria-label="Hukum tajwid"><div class="am-h"><b>Hukum tajwid</b><button class="ib2" data-x aria-label="Tutup">×</button></div><p class="mut" style="margin:0 0 4px">Warna mengikuti mushaf tajwid standar, sama di mode Mushaf dan Kartu. Matikan hukum yang tidak ingin diwarnai.</p>${isi}</div>`;
  document.body.append(e);
  /* Contoh ayat diisi dari teks tajwid surahnya (Al-Fatihah & Al-Baqarah) */
  [1, 2].forEach((n) =>
    tjSurah(n)
      .then((T) =>
        $$('[data-tjar]', e).forEach((x) => {
          const [s, a] = x.dataset.tjar.split(':').map(Number);
          if (s == n && T[a - 1]) x.innerHTML = tjTeks(T[a - 1]);
        })
      )
      .catch(() => {})
  );
  e.onclick = (x) => {
    if (x.target == e || x.target.closest('[data-x]')) return e.remove();
    const ex = x.target.closest('[data-tjex]');
    if (ex) {
      const [s, a] = ex.dataset.tjex.split(':').map(Number);
      pmQuran(s, a, { satu: 1 });
    }
  };
  e.onchange = (x) => {
    const k = x.target.dataset.tjk;
    if (!k) return;
    S.tjOff[k] = !x.target.checked;
    save();
    tjWarna();
  };
}
addEventListener('DOMContentLoaded', tjWarna);
new MutationObserver(tjWarna).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
