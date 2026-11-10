/* js/core/waktu.js - Perhitungan waktu salat, Hijriah, lokasi */
function waktu(d, { lat, lng, tz: TZ }) {
  const r = Math.PI / 180,
    tz = TZ ?? -d.getTimezoneOffset() / 60,
    n = (v) => ((((v + 12) % 24) + 24) % 24) - 12;
  const j = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12) / 864e5 + 2440587.5 - 2451545;
  const g = (357.529 + 0.98560028 * j) * r,
    q = 280.459 + 0.98564736 * j,
    L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * r,
    e = 23.439 * r;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / r / 15,
    dec = Math.asin(Math.sin(e) * Math.sin(L));
  const noon = 12 + tz - lng / 15 - n(q / 15 - ra),
    sL = Math.sin(lat * r),
    cL = Math.cos(lat * r),
    sD = Math.sin(dec),
    cD = Math.cos(dec);
  const h = (a) => Math.acos(Math.max(-1, Math.min(1, (Math.sin(a * r) - sL * sD) / (cL * cD)))) / r / 15;
  const asr = Math.atan(1 / (1 + Math.tan(Math.abs(lat * r - dec)))) / r;
  const W = [
    ['Subuh', noon - h(-20)],
    ['Terbit', noon - h(-0.833)],
    ['Zuhur', noon + 0.0333],
    ['Asar', noon + h(asr)],
    ['Magrib', noon + h(-0.833) + 0.0333],
    ['Isya', noon + h(-18)],
  ];
  /* Awal waktu Duha (sunah): matahari setinggi 4,5° setelah terbit, kriteria Kemenag. Disimpan sebagai properti, bukan elemen ke-7,
     agar indeks 6 waktu di seluruh aplikasi (adzan, widget, Android) tidak berubah */
  W.duha = noon - h(4.5);
  return W;
}
const hm = (h) => {
  const m = Math.round((((h % 24) + 24) % 24) * 60) % 1440;
  return String((m / 60) | 0).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
};
/* Tanggal Hijriah (Umm al-Qura) dihitung sendiri, tidak bergantung pada peramban: WebView di sebagian HP tidak punya data
   kalender Islam sehingga tampil "28 Mei 1448 SM". Tabel panjang bulan 1440–1480 H dari kalender Umm al-Qura
   (1 = 30 hari, 0 = 29 hari; mulai 1 Muharam 1440 = 11 Sep 2018); di luar rentang itu memakai algoritma tabular. */
const HUQ = {
  y0: 1440,
  day0: 17785,
  bits: '01011101010010101101101001010101101010101010101101011001010101110100100101110110010010111010101001011011010100101011011010100101011011100100110110110010010110110101001010110110101001011010110100101010111010010010111101001001011101100100101101101010010101101010110010101101011001010101110101001001110110100100110111010001011011011001010101011010101001011011010100101101101010010101101101001010110101011001010101101100101001101110010010101110101001001111010100101011011010010101011010101010101',
};
const HBLN = [
  'Muharam',
  'Safar',
  'Rabiulawal',
  'Rabiulakhir',
  'Jumadilawal',
  'Jumadilakhir',
  'Rajab',
  'Syakban',
  'Ramadan',
  'Syawal',
  'Zulkaidah',
  'Zulhijah',
];
function hParts(dt) {
  const hari = Math.floor(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()) / 864e5);
  let o = hari - HUQ.day0;
  if (o >= 0)
    for (let i = 0; i < HUQ.bits.length; i++) {
      const L = HUQ.bits[i] == '1' ? 30 : 29;
      if (o < L) return { y: HUQ.y0 + Math.floor(i / 12), m: (i % 12) + 1, d: o + 1 };
      o -= L;
    }
  let l = hari + 2440588 - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const m = Math.floor((24 * l) / 709);
  return { y: 30 * n + j - 30, m, d: l - Math.floor((709 * m) / 24) };
}
const hijri = (d = new Date()) => {
  const p = hParts(d);
  return `${p.d} ${HBLN[p.m - 1]} ${p.y} H`;
};
/* Nama kota dari koordinat (GPS / titik di peta), agar lokasi tampil "Bandung" dsb., bukan "Lokasi saya" */
const kotaDari = (lat, lng) =>
  fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`)
    .then((r) => (r.ok ? r.json() : {}))
    .then((j) => (j.city || j.locality || j.principalSubdivision || '').replace(/^(Kota|Kabupaten) /, '').trim())
    .catch(() => '');
const lokasiNama = (lat, lng) =>
  kotaDari(lat, lng).then((n) => {
    if (!n || !S.loc || S.loc.lat != lat || S.loc.lng != lng) return;
    S.loc.n = n;
    save();
    $$('.lc .t b').forEach((b) => (b.textContent = n));
    const k = $('#kbn');
    if (k) k.textContent = 'dari utara sejati · ' + n;
  });
/* ---------- Lokasi otomatis (S.locAuto, bawaan menyala) ----------
   Lokasi mengikuti GPS dengan akurasi tinggi: diambil sekali begitu aplikasi dibuka (sebelum pengguna menyentuh apa pun),
   lalu dipantau selama aplikasi terbuka (watchPosition) dan dicek ulang setiap aplikasi kembali dari latar belakang.
   Pindah lebih dari ±300 m: jadwal salat, kiblat, kartu lokasi, widget, dan alarm adzan Android langsung memakai titik baru.
   Pindah lebih dari ±1,5 km: nama kota dicari ulang. Izin hanya diminta sekali secara otomatis; sesudahnya lewat tombol. */
const jarakKm = (a, b, c, d) => {
  const r = Math.PI / 180,
    x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 12742 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};
function lokasiTerap(p, diam) {
  const lat = +p.coords.latitude.toFixed(5),
    lng = +p.coords.longitude.toFixed(5),
    L = S.loc || {},
    km = L.lat != null ? jarakKm(L.lat, L.lng, lat, lng) : 99;
  const tz = -new Date().getTimezoneOffset() / 60;
  if (km < 0.3 && L.tz == tz && L.gps) return false;
  const nama = km < 1.5 && L.n ? L.n : 'Lokasi saya';
  S.loc = { lat, lng, n: nama, tz, gps: 1, akurasi: Math.round(p.coords.accuracy || 0) };
  S.locWaktu = Date.now();
  save();
  $$('.lc .t').forEach(
    (t) =>
      (t.innerHTML = `<b>${esc(S.loc.n)}</b><br><small class="mut">${lat.toFixed(3)}, ${lng.toFixed(3)} · ${tzl()}</small>`)
  );
  window.androidAdzan && androidAdzan();
  dispatchEvent(new CustomEvent('fzlokasi'));
  if (!diam && km >= 1.5 && L.lat != null) toast('Lokasi diperbarui otomatis');
  if (km >= 1.5 || nama == 'Lokasi saya') lokasiNama(lat, lng);
  return true;
}
const GEO = { enableHighAccuracy: true, maximumAge: 30000, timeout: 20000 };
/* Ambil lokasi sekarang (tombol "Gunakan lokasi saya" / "Perbarui sekarang"); cb dipanggil setelah lokasi tersimpan */
const gps = (cb, paksa) =>
  navigator.geolocation
    ? navigator.geolocation.getCurrentPosition(
        (p) => {
          lokasiTerap(p, 1) || ((S.locWaktu = Date.now()), save());
          toast('Lokasi diperbarui (' + S.loc.n + ')');
          cb && cb();
        },
        (x) =>
          toast(
            x && x.code == 1
              ? 'Izin lokasi ditolak. Izinkan lokasi untuk Fadzkuruuni di pengaturan HP.'
              : 'Lokasi belum didapat. Pastikan GPS/Lokasi HP menyala, lalu coba lagi.'
          ),
        { ...GEO, maximumAge: paksa ? 0 : GEO.maximumAge }
      )
    : toast('Perangkat tidak mendukung lokasi');
let GEOW = null;
const lokasiPantauHenti = () => {
  if (GEOW != null) {
    try {
      navigator.geolocation.clearWatch(GEOW);
    } catch (e) {}
    GEOW = null;
  }
};
async function lokasiBoleh() {
  if (window.ANDROID) {
    const s = andIzinStatus().geolocation;
    return s == 'granted' ? 'granted' : s == 'denied' ? 'denied' : 'prompt';
  }
  try {
    return (await navigator.permissions.query({ name: 'geolocation' })).state;
  } catch (e) {
    return 'prompt';
  }
}
/* tanya=1: boleh memunculkan permintaan izin (sekali saja otomatis, atau saat pengguna menyalakan Lokasi otomatis) */
async function lokasiOtomatis(tanya) {
  if (S.locAuto === false || !navigator.geolocation || document.visibilityState == 'hidden') return;
  const st = await lokasiBoleh();
  if (st == 'denied') return;
  if (st != 'granted') {
    if (!tanya && S.locTanya) return;
    S.locTanya = 1;
    save();
  }
  navigator.geolocation.getCurrentPosition(
    (p) => lokasiTerap(p),
    () => {},
    GEO
  );
  if (GEOW == null)
    try {
      GEOW = navigator.geolocation.watchPosition(
        (p) => lokasiTerap(p),
        () => {},
        { enableHighAccuracy: true, maximumAge: 60000, timeout: 60000 }
      );
    } catch (e) {}
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState == 'visible') lokasiOtomatis();
  else lokasiPantauHenti();
});
/* Dibuka: langsung (izin sudah ada) atau sesaat setelah layar pembuka (permintaan izin pertama kali) */
setTimeout(() => lokasiOtomatis(!S.locTanya), S.locTanya ? 300 : 2500);
const hf = (d, o = {}) => {
  const p = hParts(d),
    r = [];
  if (o.day) r.push(p.d);
  if (o.month) r.push(o.month == 'long' ? HBLN[p.m - 1] : p.m);
  if (o.year) r.push(p.y + ' H');
  return r.join(' ');
};
const tzl = () => ({ 7: 'WIB', 8: 'WITA', 9: 'WIT' })[S.loc.tz ?? -new Date().getTimezoneOffset() / 60] || '';
const locNow = () => {
  const n = new Date(),
    tz = S.loc.tz ?? -n.getTimezoneOffset() / 60,
    u = n.getUTCHours() + n.getUTCMinutes() / 60 + n.getUTCSeconds() / 3600 + tz + (S.kor || 0) / 60;
  return ((u % 24) + 24) % 24;
};
const locCard = () =>
  `<div class="card lc"><span class="si">${ic('pin', 20)}</span><span class="t"><b>${S.loc.n}</b><br><small class="mut">${S.loc.lat.toFixed(3)}, ${S.loc.lng.toFixed(3)} · ${tzl()}</small></span><button class="btn s" data-loc>Ubah</button></div>`;
function lsheet() {
  const e = document.createElement('div');
  e.className = 'back-d';
  let tz = S.loc.tz ?? 7;
  e.innerHTML = `<div class="sheet" style="max-height:88vh;overflow:auto" role="dialog"><b>Atur lokasi</b><button class="btn" id="lg" style="width:100%;margin:10px 0">${ic('pin', 16)} Gunakan lokasi saya (GPS)</button><input class="in" id="lq" type="search" placeholder="Cari kota…"><div id="ll" class="list" style="max-height:200px;overflow:auto;margin-bottom:10px"></div><h2>Atau isi manual</h2><input class="in" id="ln" placeholder="Nama lokasi"><div style="display:flex;gap:8px"><input class="in" id="la" inputmode="decimal" placeholder="Lintang (-6.9175)"><input class="in" id="lo" inputmode="decimal" placeholder="Bujur (107.6191)"></div>${seg(
    'lz',
    [
      [7, 'WIB'],
      [8, 'WITA'],
      [9, 'WIT'],
    ],
    tz
  )}<button class="btn" id="ls" style="width:100%;margin-top:12px">Simpan lokasi</button></div>`;
  document.body.append(e);
  const set = (l) => {
      S.loc = l;
      const au = S.locAuto !== false;
      S.locAuto = false;
      lokasiPantauHenti();
      save();
      e.remove();
      toast('Lokasi: ' + l.n + (au ? ' · lokasi otomatis dimatikan' : ''));
      window.androidAdzan && androidAdzan();
      route();
    },
    draw = () => {
      const q = $('#lq', e).value.toLowerCase(),
        L = CITIES.map((c, i) => [c, i]).filter((x) => x[0][0].toLowerCase().includes(q));
      $('#ll', e).innerHTML = L.length
        ? L.map(
            (x) =>
              `<div class="row" data-c="${x[1]}"><span class="t">${x[0][0]}</span><small class="mut">${{ 7: 'WIB', 8: 'WITA', 9: 'WIT' }[x[0][3]]}</small></div>`
          ).join('')
        : '<div class="row mut">Kota tidak ditemukan. Isi manual di bawah.</div>';
    };
  draw();
  $('#lq', e).oninput = draw;
  segBind('lz', (v) => (tz = +v));
  $('#lg', e).onclick = () =>
    gps(() => {
      e.remove();
      route();
    });
  $('#ls', e).onclick = () => {
    const la = parseFloat($('#la', e).value.replace(',', '.')),
      lo = parseFloat($('#lo', e).value.replace(',', '.'));
    if (!(la >= -90 && la <= 90 && lo >= -180 && lo <= 180)) return toast('Lintang dan bujur belum valid');
    set({ n: $('#ln', e).value.trim() || 'Lokasi manual', lat: la, lng: lo, tz });
  };
  e.onclick = (x) => {
    const r = x.target.closest('[data-c]');
    if (r) {
      const c = CITIES[+r.dataset.c];
      return set({ n: c[0], lat: c[1], lng: c[2], tz: c[3] });
    }
    if (x.target == e) e.remove();
  };
}
/* Lokasi lama tanpa nama kota: cari namanya sekali saat online */
setTimeout(() => {
  if (S.loc && /^(Lokasi saya|Titik di peta)$/i.test(S.loc.n) && navigator.onLine) lokasiNama(S.loc.lat, S.loc.lng);
}, 4000);
