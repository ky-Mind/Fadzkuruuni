/* js/pages/pengaturan/salat-notifikasi.js - Pengaturan: Waktu Salat dan Notifikasi (lokasi, izin, adzan) */
/* Kotak pilihan suara adzan + rekam/unggah suara sendiri */
const suaraOpsi = (j) =>
  SUARA.filter((x) => j == 'subuh' || !x[0].startsWith('subuh-'))
    .map(([v, n]) => `<option value="${v}" ${suaraPilih(j) == v ? 'selected' : ''}>${n}</option>`)
    .join('');
/* Tiap pilihan suara punya tombol Coba sendiri (bisa didengar tanpa harus dipilih dulu); ketuk nama untuk memilih */
const suaraBaris = (j, lb) =>
  `<label>${lb}</label><div class="sual" data-sual="${j}">${SUARA.filter(
    (x) => j == 'subuh' || !x[0].startsWith('subuh-')
  )
    .map(
      ([v, n]) =>
        `<div class="suai${suaraPilih(j) == v ? ' on' : ''}"><button type="button" class="suap" data-spilih="${j}|${v}" aria-pressed="${suaraPilih(j) == v}"><span class="sur"></span><span>${n}</span></button><button type="button" class="sb" data-scoba="${j}|${v}" aria-label="Coba ${n}">${ic('play', 14)} Coba</button></div>`
    )
    .join(
      ''
    )}</div><div class="sus" data-sus="${j}" hidden><span class="mut" data-sust="${j}">Memeriksa…</span><button type="button" class="sb" data-rekam="${j}">${ic('mic', 14)} Rekam</button><label class="sb sbf">${ic('down', 14)} Unggah<input type="file" accept="audio/*" data-unggah="${j}" hidden></label></div>`;
const korTxt = () => (S.kor ? (S.kor > 0 ? '+' : '') + S.kor + ' menit dari jam perangkat' : 'Sesuai jam perangkat');
/* Terbit & Duha di daftar Notifikasi per waktu (urut sesuai jadwal: Subuh, Terbit, Duha, Zuhur, …) */
const terbitBaris = () =>
  row(
    'sun',
    'Terbit',
    'Notifikasi saat matahari terbit (waktu Subuh berakhir), tanpa adzan',
    `<button type="button" class="sb" data-tbcoba aria-label="Coba notifikasi Terbit">${ic('play', 14)} Coba</button>` +
      tg('aw5', azMode(5) != 'mati')
  );
const duhaBaris = () =>
  row(
    'sun',
    'Duha (sunah)',
    'Notifikasi biasa saat masuk waktu Duha, tanpa adzan',
    `<button type="button" class="sb" data-dhcoba aria-label="Coba notifikasi Duha">${ic('play', 14)} Coba</button>` +
      tg('adh', S.az.dh)
  );
/* ---------- Panel pengaturan adzan (satu-satunya): dipakai di Pengaturan › Waktu Salat & Notifikasi dan di lembar "Pengaturan adzan"
   pada Jadwal salat. Isi dan datanya sama persis (S.az), jadi perubahan di satu tempat langsung tampil di tempat lain.
   - Pengingat adzan (saklar utama), izin notifikasi (+ izin latar & alarm di Android)
   - Tiap waktu: Subuh, Terbit, Duha, Zuhur, Asar, Magrib, Isya, masing-masing dengan jenis pengingat (Adzan/Beduk/Alarm/Bunyi/Senyap/Mati)
     yang dibuka lewat lembar yang sama dengan Jadwal salat (jnSheet)
   - Suara: putar suara adzan, suara Zuhur–Isya dan Subuh (lembar pilihan + Coba + rekam/unggah), pengingat sebelum waktu
   - Uji coba */
const AZURUT = [0, 5, 'dh', 1, 2, 3, 4];
const suaraNama = (v) => (SUARA.find((x) => x[0] == v) || [0, 'Bawaan aplikasi'])[1];
const azChip = (k) => {
  if (k == 'dh') {
    const md = S.az.on && S.az.dh ? 'bunyi' : 'mati';
    return `<button type="button" class="jnb jn-${md}" data-azdh aria-label="Pengingat Duha: ${md == 'mati' ? 'Mati' : 'Notifikasi'}">${ic(md == 'mati' ? 'stop' : 'bell', 14)}<span>${md == 'mati' ? 'Mati' : 'Notifikasi'}</span></button>`;
  }
  const md = S.az.on ? azMode(k) : 'mati';
  return `<button type="button" class="jnb jn-${md}" data-azjn="${k}" aria-label="Pengingat ${WSN(k)}: ${AZMODE[md][0]}">${ic(AZMODE[md][2], 14)}<span>${AZMODE[md][0]}</span></button>`;
};
const azKet = (k) => {
  if (k == 'dh') return 'Sunah · notifikasi biasa, tanpa adzan';
  if (k == 5) return 'Saat matahari terbit (waktu Subuh berakhir)';
  const md = S.az.on ? azMode(k) : 'mati';
  return md == 'adzan' ? 'Adzan: ' + suaraNama(azSuara(k) || suaraPilih(k == 0 ? 'subuh' : 'adzan')) : AZMODE[md][1];
};
const azPanelIsi = () => {
  const and = window.ANDROID && window.FadzAndroid && FadzAndroid.ujiAdzan;
  return `<div class="list sg">${row('bell', 'Pengingat adzan', 'Notifikasi saat waktu salat tiba', `<label class="tg"><input type="checkbox" data-azon ${S.az.on ? 'checked' : ''}><i></i></label>`)}${row('bell', 'Izin notifikasi', bdg('notifications'), '<button class="btn s" data-notif>Izinkan</button>')}${and ? row('shield', 'Jalan di latar belakang ' + bdg('baterai'), 'Wajib agar adzan berbunyi saat aplikasi ditutup dan layar mati', '<button class="btn s" data-azizin="baterai">Izinkan</button>') + row('clock', 'Alarm tepat waktu ' + bdg('alarm'), 'Agar adzan berbunyi tepat pada waktunya', '<button class="btn s" data-azizin="alarm">Izinkan</button>') : ''}</div>
<div class="azh"><b>Tiap waktu salat</b><small class="mut">Ketuk tombol di kanan untuk memilih Adzan, Beduk, Alarm, Bunyi, Senyap, atau Mati</small></div>
<div class="list sg azw${S.az.on ? '' : ' azoff'}">${AZURUT.map((k) => row(k == 'dh' || k == 5 ? 'sun' : 'clock', k == 'dh' ? 'Duha' : WSN(k), azKet(k), azChip(k))).join('')}</div>
<div class="azh"><b>Suara adzan</b></div>
<div class="list sg">${row('speaker', 'Putar suara adzan', 'Mati = hanya notifikasi; Subuh memakai suara berbeda', `<label class="tg"><input type="checkbox" data-azsnd ${S.az.sound ? 'checked' : ''}><i></i></label>`)}${row('play', 'Zuhur, Asar, Magrib, Isya', suaraNama(suaraPilih('adzan')), '<button class="btn s" data-azsu="adzan">Ubah</button>')}${row('play', 'Subuh', suaraNama(suaraPilih('subuh')), '<button class="btn s" data-azsu="subuh">Ubah</button>')}${row('clock', 'Pengingat sebelum waktu', 'Notifikasi beberapa menit sebelum waktu salat', '')}<div class="segw"><div class="seg">${[
    [0, 'Mati'],
    [5, '5 mnt'],
    [10, '10 mnt'],
    [15, '15 mnt'],
  ]
    .map(([v, n]) => `<button type="button" data-azpre="${v}" class="${+S.az.pre == v ? 'on' : ''}">${n}</button>`)
    .join('')}</div></div></div>
<div class="azh"><b>Uji coba</b></div>
<div class="card">${and ? '<p class="mut" style="margin:0 0 10px">Uji sungguhan: ketuk <b>Uji adzan 1 menit lagi</b>, lalu tutup aplikasi dan matikan layar. Bila adzan berbunyi, pengingat sudah berjalan.</p>' : ''}<div class="act">${and ? '<button class="sb pri" data-uji1>Uji adzan 1 menit lagi</button>' : ''}<button class="sb pri" data-aztes>Tes notifikasi & suara</button><button class="sb" data-tsub>Tes adzan Subuh</button><button class="sb" data-stop>Hentikan suara</button></div></div>`;
};
const azPanel = () => `<div class="azp">${azPanelIsi()}</div>`;
/* Semua tampilan pengaturan adzan diperbarui bersama (panel di halaman & lembar, baris Jadwal salat), lalu jadwal
   alarm Android disusun ulang */
function azSegar() {
  save();
  window.ANDROID && androidAdzan();
  $$('.azp').forEach((e) => {
    const sh = e.closest('.sheet'),
      sc = sh ? sh.scrollTop : 0;
    e.innerHTML = azPanelIsi();
    if (sh) sh.scrollTop = sc;
  });
  permFill();
  dispatchEvent(new CustomEvent('fzadzan'));
}
/* Lembar pilihan suara (Zuhur–Isya atau Subuh): tiap suara bisa dicoba, ketuk nama untuk memilih; rekam/unggah suara
   sendiri */
function azSuaraSheet(j) {
  const e = document.createElement('div');
  e.className = 'back-d azsh';
  e.innerHTML = `<div class="sheet am jns-s" role="dialog" aria-label="Suara adzan"><div class="am-h"><b>Suara adzan ${j == 'subuh' ? 'Subuh' : 'Zuhur, Asar, Magrib, Isya'}</b><button class="ib2" data-x aria-label="Tutup">×</button></div><div class="card sua">${suaraBaris(j, 'Ketuk nama untuk memilih, Coba untuk mendengar')}<small class="mut">Pilih "Rekaman / berkas sendiri" untuk merekam suara adzanmu atau mengunggah berkas audio. Di aplikasi Android adzan diputar dengan volume alarm, jadi tetap terdengar walau HP dalam mode senyap notifikasi.</small></div><button class="btn" data-x style="width:100%;margin-top:12px">Selesai</button></div>`;
  document.body.append(e);
  suaraIkat();
  e.addEventListener('click', (x) => {
    if (x.target == e || x.target.closest('[data-x]')) {
      stopAdzan();
      cobaLepas();
      e.remove();
      azSegar();
    }
  });
}
/* Satu set pengendali untuk semua panel (didelegasikan, jadi tetap bekerja setelah panel digambar ulang) */
document.addEventListener('change', async (e) => {
  const t = e.target;
  if (!t.closest || !t.closest('.azp')) return;
  if (t.matches('[data-azon]')) {
    if (t.checked && !(await askNotif())) {
      t.checked = false;
    }
    S.az.on = t.checked;
    azSegar();
    toast(S.az.on ? 'Pengingat adzan menyala' : 'Pengingat adzan dimatikan');
    return;
  }
  if (t.matches('[data-azsnd]')) {
    S.az.sound = t.checked;
    azSegar();
    toast(S.az.sound ? 'Suara adzan menyala' : 'Hanya notifikasi, tanpa suara adzan');
  }
});
document.addEventListener('click', (e) => {
  const t = e.target;
  if (!t.closest || !t.closest('.azp')) return;
  const jn = t.closest('[data-azjn]');
  if (jn) return jnSheet(+jn.dataset.azjn, azSegar);
  if (t.closest('[data-azdh]')) {
    S.az.dh = S.az.on && S.az.dh ? 0 : 1;
    if (S.az.dh) S.az.on = true;
    azSegar();
    return toast(S.az.dh ? 'Pengingat Duha menyala' : 'Pengingat Duha dimatikan');
  }
  const su = t.closest('[data-azsu]');
  if (su) return azSuaraSheet(su.dataset.azsu);
  const pr = t.closest('[data-azpre]');
  if (pr) {
    S.az.pre = +pr.dataset.azpre;
    azSegar();
    return toast(S.az.pre ? 'Pengingat ' + S.az.pre + ' menit sebelum waktu' : 'Pengingat sebelum waktu dimatikan');
  }
  const ts = t.closest('[data-aztes]');
  if (ts) return cobaTombol(ts, () => ujiNotif(), window.ANDROID ? 24e4 : 0);
});
/* Waktu Salat & Notifikasi dibagi ke subhalaman (seperti pengaturan Instagram): halaman utama hanya daftar ringkas */
const SALAT_BAG = {
  lokasi: [
    'Lokasi',
    () =>
      `${locCard()}<div class="list sg" style="margin-top:8px">${row('pin', 'Lokasi otomatis', S.locAuto === false ? 'Mati · lokasi hanya berubah saat kamu mengubahnya' : 'Mengikuti GPS: diperbarui setiap aplikasi dibuka dan saat kamu berpindah tempat', tg('lauto', S.locAuto !== false))}${row('pin', 'Izin lokasi', bdg('geolocation'), '<button class="btn s" data-gps>Perbarui sekarang</button>')}</div>`,
  ],
  jam: [
    'Jam sekarang',
    () =>
      `<div class="card"><div class="lc"><span class="t"><b>Koreksi jam</b><br><small class="mut" id="kori">${korTxt()}</small></span><button class="sb" id="kreset">Reset</button></div><div class="qa" style="margin-top:12px"><input class="in" type="time" id="kjam" value="${hm(locNow())}"><button class="sb pri" id="ksave">Simpan</button></div><small class="mut">Jika jam di layar kurang akurat, atur jam sekarang sesuai jam yang benar. Koreksi hanya berlaku di perangkat ini.</small></div>`,
  ],
  adzan: [
    'Pengingat adzan',
    () =>
      `<p class="mut azsama">Sama persis dengan <b>Pengaturan adzan</b> di halaman Jadwal salat: ubah di satu tempat, yang lain ikut berubah.</p>${azPanel()}`,
  ],
  kelas: [
    'Notifikasi kelas online',
    () => `<div class="list sg">${row('siar', 'Notifikasi kelas online', 'Muncul walau aplikasi ditutup. Saluran & bunyinya terpisah dari adzan', tg('kno', kn().on))}<div id="knr"${kn().on ? '' : ' hidden'}>${row('cal', 'Jadwal kelas baru', 'Saat admin membuat jadwal kelas', tg('knb', kn().baru))}${row('play', 'Kelas dimulai', 'Saat kelas mulai live', tg('knm', kn().mulai))}${row('clock', 'Pengingat sebelum kelas', '10 menit sebelum dan saat jadwal kelas', tg('kni', kn().ingat))}${row('moon', 'Senyap saat adzan berbunyi', 'Notifikasi kelas tetap muncul, tapi tanpa bunyi selama adzan diputar', tg('kns', kn().senyap))}</div>${row('play', 'Ajakan tonton tutorial', 'Saat masuk kelas baru, ditawari video tutorial singkat dulu', tg('ktutr', !S.ktutOff))}</div>
<div class="knsw" id="knsw"${kn().on ? '' : ' hidden'}><div class="ksh-l">Suara notifikasi kelas</div><div class="knsl" role="group" aria-label="Suara notifikasi kelas">${KN_SUARA.map(([v, n]) => `<button type="button" data-knsu="${v}" aria-pressed="${kn().suara == v}"${kn().suara == v ? ' class="on"' : ''}>${n}</button>`).join('')}</div>
<div class="act knsa"><button class="sb" data-kncoba>${ic('play', 14)} Coba</button><span id="knsr"${kn().suara == 'sendiri' ? '' : ' hidden'}><label class="sb sbf">${ic('down', 14)} Pilih berkas<input type="file" accept="audio/*" data-unggah="kelas" hidden></label> <button class="sb" data-rekam="kelas">${ic('mic', 14)} Rekam</button></span></div><small class="mut" id="knsst"></small></div>
<div class="act" style="margin:10px 0 4px"><button class="sb" data-kntes>${ic('bell', 14)} Tes notifikasi kelas</button>${window.ANDROID ? '<button class="sb" data-knhp>Pengaturan notifikasi di HP</button>' : ''}</div><small class="mut" id="knst"></small>
`,
  ],
};
const SALAT_DAFTAR = () => [
  [
    '#/pengaturan/salat/lokasi',
    'pin',
    'Lokasi',
    esc((S.loc && S.loc.n) || 'Belum diatur') + (S.locAuto === false ? ' · manual' : ' · otomatis'),
  ],
  ['#/pengaturan/salat/adzan', 'bell', 'Pengingat adzan', 'Adzan, beduk, alarm, dan pengingat tiap waktu salat'],
  ['#/pengaturan/salat/kelas', 'siar', 'Notifikasi kelas online', kn().on ? 'Nyala' : 'Mati'],
  [
    '#/pengaturan/salat/jam',
    'clock',
    'Jam sekarang',
    S.kor ? 'Dikoreksi ' + (S.kor > 0 ? '+' : '') + S.kor + ' menit' : 'Sesuai jam perangkat',
  ],
];
SETPAGES.salat = (sub) => {
  const b = SALAT_BAG[sub];
  return {
    html: b
      ? head(b[0], '#/pengaturan/salat') + b[1]()
      : head('Waktu Salat & Notifikasi', '#/pengaturan') +
        `<div class="list">${SALAT_DAFTAR().map(setBaris).join('')}</div>`,
    init() {
      if (!b) return;
      permFill();
      if (sub == 'jam')
        $('#ksave').onclick = () => {
          const [h, m] = ($('#kjam').value || '').split(':').map(Number);
          if (isNaN(h) || isNaN(m)) return toast('Isi jam dulu');
          let d = Math.round(h * 60 + m - locNow() * 60);
          if (d > 720) d -= 1440;
          if (d < -720) d += 1440;
          S.kor = (S.kor || 0) + d;
          save();
          toast('Jam disesuaikan');
          route();
        };
      if (sub == 'jam')
        $('#kreset').onclick = () => {
          S.kor = 0;
          save();
          toast('Koreksi jam direset');
          route();
        };
      if (sub == 'lokasi') $('[data-gps]').onclick = () => gps(() => route(), 1);
      if (sub == 'lokasi')
        $('#lauto').onchange = (e) => {
          S.locAuto = e.target.checked;
          save();
          if (S.locAuto) lokasiOtomatis(1);
          else lokasiPantauHenti();
          toast(S.locAuto ? 'Lokasi otomatis menyala' : 'Lokasi otomatis dimatikan');
          route();
        };
      if (sub == 'kelas') knIkat();
    },
  };
};
/* Rekaman/berkas sendiri: simpan di perangkat (IndexedDB) dan, di Android, salin ke aplikasi untuk alarm adzan */
async function suaraSimpan(j, blob) {
  if (j == 'kelas') return knSuaraSimpan(blob);
  if (blob.size > 8e6) return toast('Berkas terlalu besar (maks. 8 MB)');
  if (blob.size < 2000) return toast('Rekaman terlalu pendek');
  await idbSimpan('suara_' + j, blob);
  if (window.ANDROID) {
    const b64 = await blobB64(blob);
    const h = andPanggil('simpanSuaraSendiri', j, b64);
    if (h && h != 'ok') return toast(h);
  }
  if (j == 'subuh') S.az.ss = 'sendiri';
  else S.az.sa = 'sendiri';
  save();
  window.ANDROID && andPanggil('aturSuara', j, 'sendiri');
  toast('Suara adzan sendiri tersimpan');
  suaraStatus();
}
async function suaraStatus() {
  for (const j of ['adzan', 'subuh']) {
    const w = $(`[data-sus="${j}"]`);
    if (!w) continue;
    w.hidden = suaraPilih(j) != 'sendiri';
    const b = await idbAmbil('suara_' + j);
    $(`[data-sust="${j}"]`).textContent = b
      ? 'Rekaman tersimpan (' + Math.round(b.size / 1024) + ' KB)'
      : 'Belum ada rekaman. Rekam atau unggah berkas.';
  }
}
let SREK = null;
function suaraIkat() {
  suaraStatus();
  $$('[data-suara]').forEach(
    (el) =>
      (el.onchange = () => {
        const j = el.dataset.suara;
        if (j == 'subuh') S.az.ss = el.value;
        else S.az.sa = el.value;
        save();
        window.ANDROID && andPanggil('aturSuara', j, el.value);
        suaraStatus();
      })
  );
  $$('[data-coba]').forEach(
    (b) => (b.onclick = () => cobaTombol(b, async () => putarSuara(await suaraSrc(b.dataset.coba))))
  );
  $$('[data-spilih]').forEach(
    (b) =>
      (b.onclick = () => {
        const [j, v] = b.dataset.spilih.split('|');
        if (j == 'subuh') S.az.ss = v;
        else S.az.sa = v;
        save();
        window.ANDROID && andPanggil('aturSuara', j, v);
        $$(`[data-sual="${j}"] .suai`).forEach((x) => {
          const on = x.querySelector('[data-spilih]') === b;
          x.classList.toggle('on', on);
          x.querySelector('[data-spilih]').setAttribute('aria-pressed', on);
        });
        suaraStatus();
        toast('Suara dipilih');
      })
  );
  $$('[data-scoba]').forEach(
    (b) =>
      (b.onclick = () =>
        cobaTombol(b, async () => {
          const [j, v] = b.dataset.scoba.split('|');
          if (v == 'sendiri' && !(await idbAmbil('suara_' + j))) {
            toast('Belum ada rekaman sendiri. Pilih lalu rekam atau unggah.');
            return false;
          }
          putarSuara(await suaraSrc(j, v));
        }))
  );
  $$('[data-unggah]').forEach(
    (i) =>
      (i.onchange = (e) => {
        const f = e.target.files[0];
        e.target.value = '';
        if (f) suaraSimpan(i.dataset.unggah, f);
      })
  );
  $$('[data-rekam]').forEach(
    (b) =>
      (b.onclick = async () => {
        const j = b.dataset.rekam;
        if (SREK) {
          const r = SREK;
          SREK = null;
          r.rec.stop();
          return;
        }
        if (
          window.ANDROID &&
          andIzinStatus().microphone != 'granted' &&
          (await andMintaIzin('microphone')) != 'granted'
        )
          return toast('Izinkan mikrofon untuk merekam');
        try {
          const st = await navigator.mediaDevices.getUserMedia({ audio: true });
          const rec = new MediaRecorder(st),
            P = [];
          SREK = { rec, b };
          rec.ondataavailable = (e) => e.data.size && P.push(e.data);
          rec.onstop = () => {
            st.getTracks().forEach((t) => t.stop());
            window.ANDROID && setTimeout(() => andPanggil('audioNormal'), 150);
            b.innerHTML = ic('mic', 14) + ' Rekam';
            b.classList.remove('pri');
            suaraSimpan(j, new Blob(P, { type: rec.mimeType || 'audio/webm' }));
          };
          rec.start();
          b.innerHTML = ic('stop', 14) + ' Selesai';
          b.classList.add('pri');
          toast('Merekam… ketuk Selesai bila sudah');
          setTimeout(() => {
            if (SREK && SREK.rec == rec) {
              SREK = null;
              rec.stop();
            }
          }, 300000);
        } catch (x) {
          toast('Mikrofon tidak bisa dipakai');
        }
      })
  );
}

/* Android: izin agar adzan berbunyi saat aplikasi ditutup, dan uji adzan sungguhan lewat alarm (1 menit lagi) */
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-azizin]');
  if (b) {
    await andMintaIzin(b.dataset.azizin);
    permFill();
    return;
  }
  if (e.target.closest('[data-uji1]')) {
    andPanggil('ujiAdzan', 60);
    toast('Adzan uji berbunyi 1 menit lagi. Sekarang tutup aplikasi dan matikan layar.');
  }
});

/* Notifikasi kelas online: simpan pilihan, terapkan ke aplikasi Android / langganan peramban, tes, dan tampilkan
   statusnya */
function knIkat() {
  const simpan = (k, v) => {
    S.kn = Object.assign(kn(), { [k]: v });
    save();
    knTerap();
    knStatus();
  };
  $('#ktutr').onchange = (e) => {
    S.ktutOff = !e.target.checked;
    save();
    toast(e.target.checked ? 'Ajakan tutorial kelas dinyalakan' : 'Ajakan tutorial kelas dimatikan');
  };
  $('#kno').onchange = async (e) => {
    if (e.target.checked && !(await askNotif())) {
      e.target.checked = false;
      return;
    }
    $('#knr').hidden = $('#knsw').hidden = !e.target.checked;
    simpan('on', e.target.checked);
  };
  $$('[data-knsu]').forEach(
    (b) =>
      (b.onclick = () => {
        simpan('suara', b.dataset.knsu);
        $$('[data-knsu]').forEach((x) => {
          x.classList.toggle('on', x == b);
          x.setAttribute('aria-pressed', x == b);
        });
        knSuaraStatus();
      })
  );
  $('[data-kncoba]').onclick = (e) =>
    cobaTombol(e.currentTarget, async () => {
      const v = kn().suara;
      if (v == 'getar') {
        navigator.vibrate && navigator.vibrate([0, 400, 200, 400]);
        toast('Getar saja, tanpa suara');
        return false;
      }
      if (v == 'bawaan') {
        if (window.ANDROID) {
          andPanggil('ujiNotifikasi', 'Tes suara notifikasi kelas', 'Begini bunyi notifikasi kelas online.', 'kelas');
          return false;
        }
        beep();
        return false;
      }
      if (v == 'sendiri') {
        const b = await idbAmbil('suara_kelas');
        if (!b) {
          toast('Belum ada suara sendiri. Pilih berkas atau rekam dulu.');
          return false;
        }
        return putarSuara(URL.createObjectURL(b));
      }
      return putarSuara('audio/kelas-' + v + '.mp3');
    });
  knSuaraStatus();
  [
    ['knb', 'baru'],
    ['knm', 'mulai'],
    ['kni', 'ingat'],
    ['kns', 'senyap'],
  ].forEach(([id, k]) => ($('#' + id).onchange = (e) => simpan(k, e.target.checked)));
  $('[data-kntes]').onclick = async () => {
    if (window.ANDROID) {
      const h = andPanggil(
        'ujiNotifikasi',
        'Tes notifikasi kelas',
        'Begini notifikasi kelas online akan tampil.',
        'kelas'
      );
      return h == 'ok'
        ? toast('Notifikasi tes dikirim. Lihat bagian atas layar.')
        : konfirmasi(
            'Notifikasi kelas belum bisa muncul',
            (NOTIFSEBAB[h] || 'Terjadi kesalahan: ' + h) +
              ' Buka pengaturan, lalu nyalakan Notifikasi dan kategori "Kelas online".',
            'Buka pengaturan',
            () => andPanggil('bukaPengaturanNotif')
          );
    }
    if (!(await askNotif())) return;
    notify('Tes notifikasi kelas', 'Begini notifikasi kelas online akan tampil.');
    toast('Notifikasi tes dikirim');
  };
  const hp = $('[data-knhp]');
  if (hp) hp.onclick = () => andPanggil('bukaPengaturanNotif');
  knStatus();
}
/* Suara sendiri untuk notifikasi kelas: disimpan di perangkat (IndexedDB) dan, di Android, disalin ke aplikasi agar
   dipakai saluran notifikasi */
async function knSuaraSimpan(blob) {
  if (blob.size > 3e6) return toast('Berkas terlalu besar (maks. 3 MB). Pilih suara pendek.');
  if (blob.size < 1500) return toast('Rekaman terlalu pendek');
  await idbSimpan('suara_kelas', blob);
  if (window.ANDROID) {
    const ext = ((blob.type || '').split('/')[1] || 'mp3').split(';')[0].replace('mpeg', 'mp3'),
      h = andPanggil('simpanSuaraKelas', await blobB64(blob), ext);
    if (h && h != 'ok') return toast(h);
  }
  S.kn = Object.assign(kn(), { suara: 'sendiri' });
  save();
  knTerap();
  toast('Suara notifikasi kelas tersimpan');
  knSuaraStatus();
}
async function knSuaraStatus() {
  const el = $('#knsst');
  if (!el) return;
  const v = kn().suara;
  $('#knsr').hidden = v != 'sendiri';
  const b = v == 'sendiri' ? await idbAmbil('suara_kelas') : null;
  el.textContent =
    (v == 'sendiri'
      ? b
        ? 'Suara sendiri tersimpan (' + Math.round(b.size / 1024) + ' KB). '
        : 'Belum ada suara sendiri. Pilih berkas audio dari HP atau rekam. '
      : '') +
    (window.ANDROID
      ? ''
      : 'Di peramban, notifikasi saat situs ditutup memakai bunyi bawaan sistem; pilihan ini dipakai saat situs terbuka.');
}
/* Status: apakah perangkat ini sudah terdaftar menerima notifikasi kelas saat aplikasi/situs ditutup */
async function knStatus() {
  const el = $('#knst');
  if (!el) return;
  const a = kn();
  if (!a.on) {
    el.textContent = 'Notifikasi kelas dimatikan.';
    return;
  }
  if (window.ANDROID) {
    const s =
      window.FadzAndroid && FadzAndroid.kelasStatus
        ? (() => {
            try {
              return JSON.parse(FadzAndroid.kelasStatus());
            } catch (e) {
              return null;
            }
          })()
        : null;
    el.textContent = !s
      ? 'Perbarui aplikasi ke versi terbaru agar notifikasi kelas muncul seketika saat aplikasi ditutup.'
      : s.fcm == 'ok'
        ? 'Perangkat ini terdaftar: notifikasi kelas muncul walau aplikasi ditutup.'
        : 'Belum terdaftar (' + s.fcm + '). Pastikan internet & layanan Google Play aktif, lalu buka ulang aplikasi.';
    return;
  }
  if (!('PushManager' in window))
    return (el.textContent = 'Peramban ini belum mendukung notifikasi saat situs ditutup.');
  if (!window.Notification || Notification.permission != 'granted')
    return (el.textContent = 'Izinkan notifikasi agar notifikasi kelas muncul walau situs ditutup.');
  el.textContent = localStorage.fzLangganan
    ? 'Peramban ini terdaftar: notifikasi kelas muncul walau situs ditutup (selama peramban berjalan).'
    : 'Mendaftarkan peramban ini…';
  if (!localStorage.fzLangganan) {
    await kelasLangganan();
    el.textContent = localStorage.fzLangganan
      ? 'Peramban ini terdaftar: notifikasi kelas muncul walau situs ditutup (selama peramban berjalan).'
      : 'Belum terdaftar. Coba muat ulang halaman.';
  }
}
