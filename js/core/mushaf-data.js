/* js/core/mushaf-data.js - Data Mushaf Madinah per halaman (604 halaman, 15 baris) dan teks tajwid per surah.
   Sumber: Quran Foundation (quran.com) API v4 dan font halaman KFGQPC V4 (berwarna tajwid, COLR). Semua disimpan service
   worker di cache 'fz-mushaf' (bisa diunduh sekaligus lewat paket offline "Mushaf & tajwid").
   - msData(p): kata-kata halaman p → [kode glyph, baris, "s:a", akhir ayat?, kelas tajwid[]]
   - msFont(p): muat font halaman p (nama keluarga "msp{p}")
   - msPalet(): aturan font-palette tiap halaman (terang/gelap, tajwid mati, hukum tertentu dimatikan)
   - msHalAyat(s, a): halaman tempat ayat s:a (dari data/mushaf-hal.js)
   - tjSurah(n): teks tajwid semua ayat surah n (untuk mode Kartu) */
const MS_API = (p) =>
  `https://api.quran.com/api/v4/verses/by_page/${p}?words=true&word_fields=code_v2,line_number,verse_key,char_type_name&fields=text_uthmani_tajweed&per_page=50`;
const MS_FONT = (p) => `https://verses.quran.foundation/fonts/quran/hafs/v4/colrv1/woff2/p${p}.woff2`;
const TJ_URL = (n) => `https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number=${n}`;
const MSD = {},
  MSDJ = {},
  MSF = {},
  TJT = {},
  TJJ = {};
async function msData(p) {
  if (MSD[p]) return MSD[p];
  if (MSDJ[p]) return MSDJ[p];
  return (MSDJ[p] = (async () => {
    try {
      const r = await fetch(MS_API(p));
      if (!r.ok) throw 0;
      const d = await r.json(),
        W = [];
      d.verses.forEach((v) => {
        /* Kata ke-i dipasangkan dengan potongan teks tajwid ke-i (dipisah spasi di luar tag) */
        const bag = v.text_uthmani_tajweed.split(/ (?![^<]*>)/);
        v.words.forEach((w, i) => {
          const akhir = w.char_type_name == 'end';
          W.push([w.code_v2, w.line_number, w.verse_key, akhir ? 1 : 0, akhir ? [] : tjKelas(bag[i] || '')]);
        });
      });
      return (MSD[p] = W);
    } finally {
      delete MSDJ[p];
    }
  })());
}
function msFont(p) {
  if (MSF[p]) return MSF[p];
  const f = new FontFace('msp' + p, `url(${MS_FONT(p)}) format('woff2')`, { display: 'block' });
  return (MSF[p] = f.load().then(
    (x) => {
      document.fonts.add(x);
      msPalet();
      return x;
    },
    (e) => {
      delete MSF[p];
      throw e;
    }
  ));
}
/* Palet: 0 terang, 1 gelap, 3 terang tanpa tajwid, 4 gelap tanpa tajwid; tinta (0/13/14) mengikuti warna teks tema, hukum yang
   dimatikan ditimpa warna tinta */
function msPalet() {
  let st = $('#mspal');
  if (!st) {
    st = document.createElement('style');
    st.id = 'mspal';
    document.head.append(st);
  }
  const gelap = tjGelap(),
    tinta =
      getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || (gelap ? '#f5f5f5' : '#1d2b25'),
    base = S.tj ? (gelap ? 1 : 0) : gelap ? 4 : 3,
    ov = [0, 13, 14].map((i) => `${i} ${tinta}`);
  if (S.tj)
    TJ_KEL.forEach((k) => {
      if (S.tjOff[k.id]) [k.c, ...(k.alt || [])].forEach((i) => ov.push(`${i} ${tinta}`));
    });
  st.textContent = Object.keys(MSF)
    .map(
      (p) =>
        `@font-palette-values --msp${p}{font-family:msp${p};base-palette:${base};override-colors:${ov.join(',')}}.msp${p}{font-family:msp${p};font-palette:--msp${p}}`
    )
    .join('\n');
}
/* Halaman tempat ayat s:a (pencarian biner pada awal tiap halaman) */
function msHalAyat(s, a) {
  let lo = 0,
    hi = MSH.length - 1;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1,
      [ms, ma] = MSH[m];
    if (ms < s || (ms == s && ma <= a)) lo = m;
    else hi = m - 1;
  }
  return lo + 1;
}
/* Juz untuk ayat s:a (JUZ = awal tiap juz [surah, ayat] dari data/quran-meta.js) */
function msJuz(s, a) {
  let j = 1;
  if (typeof JUZ != 'undefined')
    JUZ.forEach((x, i) => {
      if (x[0] < s || (x[0] == s && x[1] <= a)) j = i + 1;
    });
  return j;
}
async function tjSurah(n) {
  if (TJT[n]) return TJT[n];
  if (TJJ[n]) return TJJ[n];
  return (TJJ[n] = (async () => {
    try {
      const r = await fetch(TJ_URL(n));
      if (!r.ok) throw 0;
      const d = await r.json();
      return (TJT[n] = d.verses.map((v) => v.text_uthmani_tajweed));
    } finally {
      delete TJJ[n];
    }
  })());
}
