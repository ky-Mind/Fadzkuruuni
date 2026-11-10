/* js/pages/zakat.js - Zakat & sedekah: ilmu (data/zakat-ilmu.js), kalkulator zakat (fikih Syafi'i dan ketetapan BAZNAS/Kemenag),
   infak, kurban, fitrah, fidyah. Tidak ada pembayaran di sini; satu-satunya pembayaran ada di Dukung kami (js/pages/dukung.js). */
const NIS = 85,
  RATE = 0.025,
  NPERAK = 595,
  NPANEN = 653;
const gold = () => +S.gold || 0;
const HAUL = [
  'h',
  'Harta sudah dimiliki genap satu tahun (haul)?',
  [
    ['1', 'Ya, sudah genap'],
    ['0', 'Belum genap'],
  ],
];
const zNet = (t, f, calc, info) => ({
  t,
  f: [...f, HAUL],
  run: (v) => {
    const base = calc(v),
      nis = NIS * gold(),
      ok = !!v.h && nis > 0 && base >= nis;
    return {
      wajib: ok,
      z: ok ? base * RATE : 0,
      rows: [
        ['Harta kena zakat', rp(base)],
        ['Nisab (85 g emas)', rp(nis)],
        ['Haul', v.h ? 'Sudah genap' : 'Belum genap'],
      ],
      info,
    };
  },
});
const panen = (t, jenis, info) => ({
  t,
  nogold: true,
  f: [
    ...(jenis
      ? [
          [
            'j',
            'Jenis hasil',
            [
              ['653', 'Gabah kering giling (nisab 653 kg)'],
              ['522', 'Beras (nisab 522 kg)'],
            ],
          ],
        ]
      : []),
    ['a', jenis ? 'Hasil panen (kg)' : 'Hasil panen (kg, setara gabah)'],
    ['b', 'Harga per kg (Rp)'],
    [
      'r',
      jenis ? 'Pengairan' : 'Perawatan',
      jenis
        ? [
            ['.1', 'Tadah hujan / tanpa biaya (10%)'],
            ['.05', 'Irigasi berbiaya (5%)'],
            ['.075', 'Campuran (7,5%)'],
          ]
        : [
            ['.1', 'Tanpa biaya perawatan (10%)'],
            ['.05', 'Dengan biaya perawatan (5%)'],
          ],
    ],
  ],
  run: (v) => {
    const nis = jenis ? v.j : NPANEN,
      ok = v.a >= nis,
      kg = ok ? v.a * v.r : 0;
    return {
      wajib: ok,
      z: kg * v.b,
      unit: 'kg',
      kg,
      rows: [
        ['Hasil panen', v.a + ' kg'],
        ['Nisab', nis + ' kg'],
        ['Kadar', +(v.r * 100).toFixed(1) + '%'],
        ['Zakat', kg.toFixed(2).replace('.', ',') + ' kg'],
      ],
      info,
    };
  },
});
const sapiKomb = (n) => {
  let best = 1e9,
    res = [];
  for (let a = 0; a * 30 <= n; a++)
    for (let b = 0; a * 30 + b * 40 <= n; b++) {
      const r = n - a * 30 - b * 40;
      if (r < best) {
        best = r;
        res = [[a, b]];
      } else if (r == best) res.push([a, b]);
    }
  return res
    .filter((x) => x[0] + x[1] > 0)
    .map(([a, b]) =>
      [a ? a + " ekor tabi' (1 th)" : '', b ? b + ' ekor musinnah (2 th)' : ''].filter(Boolean).join(' + ')
    );
};
const untaZ = (n) =>
  n < 25
    ? ['1 ekor kambing', '2 ekor kambing', '3 ekor kambing', '4 ekor kambing'][Math.floor((n - 5) / 5)]
    : n <= 35
      ? '1 ekor bintu makhad (1 th)'
      : n <= 45
        ? '1 ekor bintu labun (2 th)'
        : n <= 60
          ? '1 ekor hiqqah (3 th)'
          : n <= 75
            ? "1 ekor jadza'ah (4 th)"
            : n <= 90
              ? '2 ekor bintu labun'
              : n <= 120
                ? '2 ekor hiqqah'
                : 'Di atas 120 ekor: tiap 40 ekor 1 bintu labun, tiap 50 ekor 1 hiqqah; hubungi lembaga zakat';
const ZK = {
  tani: panen(
    'Pertanian tanaman pangan',
    true,
    'Nisab 5 wasaq: 653 kg gabah kering giling atau 522 kg beras. Tanpa haul; zakat dikeluarkan saat panen. Kadar 10% bila diairi hujan/sungai tanpa biaya, 5% bila irigasi berbiaya, 7,5% bila campuran.'
  ),
  dagang: zNet(
    'Perdagangan',
    [
      ['a', 'Nilai barang dagangan pada harga pasar (Rp)'],
      ['b', 'Kas dan saldo usaha (Rp)'],
      ['c', 'Piutang yang diharapkan cair (Rp)'],
      ['d', 'Utang jatuh tempo (Rp)'],
    ],
    (v) => v.a + v.b + v.c - v.d,
    'Zakat tijarah: barang dagangan (harga pasar) + kas + piutang yang diharapkan cair, dikurangi utang jatuh tempo, bila mencapai nisab 85 g emas pada akhir haul. Kadar 2,5%. Barang yang tidak untuk dijual tidak dihitung.'
  ),
  emas: {
    t: 'Simpanan emas, perak & uang',
    f: [
      ['a', 'Emas (gram)'],
      ['t', 'Uang tunai / tabungan (Rp)'],
      ['b', 'Perak (gram)'],
      ['c', 'Harga perak per gram (Rp)'],
      HAUL,
    ],
    run: (v) => {
      const nis = NIS * gold(),
        tot = v.a * gold() + v.t,
        okE = !!v.h && nis > 0 && (v.a >= NIS || tot >= nis),
        okP = !!v.h && v.b >= NPERAK,
        zE = okE ? tot * RATE : 0,
        zP = okP ? v.b * (v.c || 0) * RATE : 0;
      return {
        wajib: okE || okP,
        z: zE + zP,
        rows: [
          ['Emas + uang', rp(tot)],
          ['Nisab emas (85 g)', rp(nis)],
          ['Zakat emas + uang', rp(zE)],
          ...(v.b > 0
            ? [
                ['Perak (nisab 595 g)', v.b + ' g'],
                ['Zakat perak', rp(zP)],
              ]
            : []),
          ['Haul', v.h ? 'Sudah genap' : 'Belum genap'],
        ],
        info: "Emas dan perak punya nisab sendiri dan tidak digabung (mazhab Syafi'i). Uang dan tabungan dinilai setara emas. Perhiasan yang dipakai wajar oleh wanita tidak wajib dizakati menurut Syafi'iyah; emas batangan, tabungan emas, dan perhiasan simpanan wajib. Kadar 2,5%.",
      };
    },
  },
  tambak: zNet(
    'Tambak / perikanan',
    [
      ['a', 'Hasil penjualan panen setahun (Rp)'],
      ['b', 'Biaya produksi (Rp)'],
    ],
    (v) => v.a - v.b,
    'Dianalogikan dengan zakat perdagangan: hasil bersih setahun mencapai nisab 85 g emas, kadar 2,5%. Sebagian lembaga menganalogikan dengan hasil pertanian; ikuti ketetapan lembaga zakat setempat.'
  ),
  kebun: panen(
    'Tanaman produktif (kebun)',
    false,
    'Dianalogikan dengan hasil pertanian: nisab setara 653 kg, kadar 10% atau 5% sesuai biaya perawatan, dikeluarkan saat panen. Ada perbedaan pendapat ulama; ikuti ketetapan lembaga zakat setempat.'
  ),
  ternak: {
    t: 'Peternakan',
    nogold: true,
    f: [
      [
        'r',
        'Jenis ternak',
        [
          ['1', 'Kambing / domba'],
          ['2', 'Sapi / kerbau'],
          ['3', 'Unta'],
        ],
      ],
      ['a', 'Jumlah ekor'],
      [
        's',
        'Digembalakan di padang sebagian besar tahun (saimah)?',
        [
          ['1', 'Ya'],
          ['0', 'Tidak (diberi pakan)'],
        ],
      ],
      HAUL,
    ],
    run: (v) => {
      const n = Math.floor(v.a),
        jt = v.r,
        nis = jt == 1 ? 40 : jt == 2 ? 30 : 5;
      let txt = 'Belum mencapai nisab (' + nis + ' ekor)',
        ok = false;
      if (n >= nis) {
        ok = true;
        txt =
          jt == 1
            ? n <= 120
              ? '1 ekor kambing (kambing ≥ 2 th atau domba ≥ 1 th)'
              : n <= 200
                ? '2 ekor kambing'
                : n <= 399
                  ? '3 ekor kambing'
                  : Math.floor(n / 100) + ' ekor kambing'
            : jt == 2
              ? sapiKomb(n).join(' atau ')
              : untaZ(n);
      }
      const rows = [
        ['Jumlah', n + ' ekor'],
        ['Nisab', nis + ' ekor'],
        ['Saimah', v.s ? 'Ya' : 'Tidak'],
        ['Haul', v.h ? 'Sudah genap' : 'Belum genap'],
      ];
      if (ok && !v.s)
        return {
          wajib: false,
          txt: 'Tidak wajib zakat ternak',
          rows,
          info: "Menurut Syafi'iyah zakat ternak hanya untuk hewan saimah. Bila hewan diperdagangkan, hitung sebagai zakat perdagangan.",
        };
      if (ok && !v.h)
        return {
          wajib: false,
          txt: 'Belum wajib (belum haul)',
          rows,
          info: 'Zakat ternak wajib setelah genap satu tahun kepemilikan.',
        };
      return {
        wajib: ok,
        txt,
        rows,
        info: "Ketentuan hadits Mu'adz dan Anas: kambing 40-120 = 1, 121-200 = 2, 201-399 = 3, selanjutnya 1 per 100; sapi tiap 30 ekor 1 tabi' dan tiap 40 ekor 1 musinnah. Syarat: mencapai nisab, haul, dan saimah.",
      };
    },
  },
  usaha: zNet(
    'Perusahaan',
    [
      ['a', 'Aset lancar: kas, piutang, persediaan (Rp)'],
      ['b', 'Kewajiban jangka pendek (Rp)'],
    ],
    (v) => v.a - v.b,
    'Dihitung seperti zakat perdagangan: aset lancar dikurangi kewajiban jangka pendek, nisab 85 g emas, kadar 2,5% pada akhir haul. Aset tetap (gedung, mesin) tidak dizakati.'
  ),
  properti: {
    t: 'Properti',
    f: [
      [
        'r',
        'Jenis properti',
        [
          ['1', 'Disewakan (hasil sewa)'],
          ['2', 'Untuk dijual (dagang)'],
        ],
      ],
      ['a', 'Hasil sewa setahun, atau nilai pasar properti (Rp)'],
      ['b', 'Biaya operasional, atau utang terkait (Rp)'],
      HAUL,
    ],
    run: (v) => {
      const base = v.a - v.b,
        nis = NIS * gold(),
        sewa = v.r == 1,
        ok = (sewa || !!v.h) && nis > 0 && base >= nis;
      return {
        wajib: ok,
        z: ok ? base * RATE : 0,
        rows: [
          [sewa ? 'Hasil sewa bersih setahun' : 'Nilai properti bersih', rp(base)],
          ['Nisab (85 g emas)', rp(nis)],
          ...(sewa ? [] : [['Haul', v.h ? 'Sudah genap' : 'Belum genap']]),
        ],
        info: sewa
          ? 'Hasil sewa dianalogikan dengan zakat penghasilan: bila hasil bersih setahun mencapai nisab 85 g emas, zakatnya 2,5%. Rumah yang ditempati sendiri tidak wajib dizakati.'
          : 'Properti yang dibeli untuk dijual kembali dihitung seperti zakat perdagangan: nilai pasar dikurangi utang, nisab 85 g emas, 2,5% setelah haul.',
      };
    },
  },
  profesi: {
    t: 'Profesi',
    f: [
      ['a', 'Gaji / penghasilan per bulan (Rp)'],
      ['b', 'Penghasilan lain per bulan (Rp)'],
      ['c', 'Kebutuhan pokok dan cicilan wajib per bulan (Rp)'],
      [
        'r',
        'Dihitung dari',
        [
          ['1', 'Penghasilan kotor (ketetapan BAZNAS)'],
          ['2', 'Penghasilan bersih setelah kebutuhan pokok'],
        ],
      ],
    ],
    run: (v) => {
      const nisY = NIS * gold(),
        nisM = nisY / 12,
        m = v.r == 2 ? v.a + v.b - v.c : v.a + v.b,
        ok = nisY > 0 && m >= nisM,
        z = ok ? m * RATE : 0;
      return {
        wajib: ok,
        z,
        rows: [
          ['Penghasilan dihitung / bulan', rp(m)],
          ['Nisab per bulan (85 g emas / 12)', rp(nisM)],
          ['Zakat per bulan', rp(z)],
          ['Setara setahun', rp(z * 12)],
        ],
        info: 'Zakat penghasilan dianalogikan dengan zakat emas (nisab 85 g setahun, kadar 2,5%), ditunaikan tiap bulan atau sekaligus di akhir tahun. Ulama berbeda soal menghitung dari penghasilan kotor atau bersih; keduanya tersedia.',
      };
    },
  },
};
const chips = (k) =>
  `<div class="chips zkc">${Object.entries(ZK)
    .map(([i, z]) => `<a class="chip2 ${i == k ? 'on' : ''}" href="#/zakat/${i}">${z.t}</a>`)
    .join('')}</div>`;
const zOut = (r) =>
  `<div class="zs ${r.wajib ? 'ok' : 'no'}">${r.wajib ? 'Wajib zakat' : 'Belum wajib zakat'}</div><div class="zv">${r.txt ? r.txt : r.unit ? (r.kg || 0).toFixed(2).replace('.', ',') + ' kg ≈ ' + rp(r.z) : rp(r.z)}</div>${(r.rows || []).map((x) => `<div class="zr"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}<p class="mut" style="margin:8px 0 0">${r.info || ''}</p>`;
const zhome = () => ({
  html: head('Zakat & sedekah') + tabs(['Menu', 'Kalkulator']) + '<div id="tb"></div>',
  init() {
    const A = list(
        MENU.zakat,
        (m, i) =>
          `<a class="row" href="#/sedekah/${m[0]}"><span class="num">${i + 1}</span><span class="t">${m[1]}</span>${ic('next', 18)}</a>`
      ),
      B = list(
        Object.entries(ZK),
        ([k, z], i) =>
          `<a class="row" href="#/zakat/${k}"><span class="num">${i + 1}</span><span class="t">${z.t}</span>${ic('next', 18)}</a>`
      ),
      t = $('#tb');
    t.innerHTML = A;
    $$('[data-tab]').forEach(
      (b) =>
        (b.onclick = () => {
          $$('[data-tab]').forEach((x) => x.classList.toggle('on', x == b));
          t.innerHTML = +b.dataset.tab ? B : A;
        })
    );
  },
});
P.zakat = (k) => {
  const z = ZK[k];
  if (!z)
    return zhome(); /* Kolom isian rapi: judul jelas, satuan (Rp / gram / kg) menempel di kolom, pilihan berbentuk tombol bila sedikit */
  const kolom = (f, i) => {
    const sat = /\(Rp\)/.test(f[1])
        ? 'Rp'
        : /\(gram\)/.test(f[1])
          ? 'gram'
          : /\(kg\)/.test(f[1])
            ? 'kg'
            : /ekor/i.test(f[1])
              ? 'ekor'
              : '',
      jud = f[1].replace(/\s*\((Rp|gram|kg)\)/, '');
    return (
      `<div class="zfi"><label for="zf${i}">${jud}</label>` +
      (f[2]
        ? `<div class="zin"><select class="in" id="zf${i}" data-f="${f[0]}">${f[2].map((o) => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select></div>`
        : `<div class="zin${sat == 'Rp' ? ' rp' : ''}">${sat == 'Rp' ? '<span class="zu">Rp</span>' : ''}<input class="in" id="zf${i}" data-f="${f[0]}" inputmode="decimal" placeholder="0">${sat && sat != 'Rp' ? `<span class="zu">${sat}</span>` : ''}</div>`) +
      '</div>'
    );
  };
  return {
    html:
      head('Kalkulator zakat', '#/zakat') +
      chips(k) +
      `<section class="zk"><h2 class="zkt">${z.t}</h2>` +
      (z.nogold
        ? ''
        : `<div class="zgold"><div class="zfi"><label for="gold">Harga emas per gram</label><div class="zin rp"><span class="zu">Rp</span><input class="in" id="gold" inputmode="numeric" value="${S.gold}" placeholder="mis. 1500000"></div><small class="mut">Dipakai semua kalkulator untuk menghitung nisab (85 gram emas).</small></div></div>`) +
      `<div class="zf">${z.f.map(kolom).join('')}</div><div class="res zres" id="rs">Isi data di atas.</div></section>`,
    init() {
      $('.chip2.on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
      const calc = () => {
        const g = $('#gold');
        if (g) {
          S.gold = g.value.replace(/\D/g, '');
          save();
        }
        const v = {};
        $$('[data-f]').forEach((i) => (v[i.dataset.f] = parseFloat(i.value.replace(',', '.')) || 0));
        if (!z.nogold && !gold())
          return ($('#rs').textContent = 'Isi harga emas per gram terlebih dahulu (lihat harga terbaru).');
        $('#rs').innerHTML = zOut(z.run(v));
      };
      $$('input,select').forEach((i) => (i.oninput = calc));
      calc();
    },
  };
};
/* ---- ilmu ---- */
const NIAT = 'نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ نَفْسِي فَرْضًا لِلّٰهِ تَعَالَى';
const FIT = `<div class="card" data-calc="fitrah" style="margin-top:12px"><b>Hitung zakat fitrah</b><label style="margin-top:8px">Jumlah jiwa</label><input class="in" data-k="j" inputmode="numeric" value="1"><label>Harga beras per kg (Rp)</label><input class="in" data-k="h" inputmode="numeric" placeholder="mis. 15000"><div class="res cres">Isi harga beras per kg.</div><small class="mut">Per jiwa 2,5 kg makanan pokok.</small></div>`;
const FID = `<div class="card" data-calc="fidyah" style="margin-top:12px"><b>Hitung fidyah</b><label style="margin-top:8px">Jumlah orang</label><input class="in" data-k="j" inputmode="numeric" value="1"><label>Jumlah hari puasa yang ditinggalkan</label><input class="in" data-k="d" inputmode="numeric" value="1"><label>Harga makanan pokok per kg (Rp)</label><input class="in" data-k="h" inputmode="numeric" placeholder="mis. 15000"><div class="res cres">Isi harga makanan pokok per kg.</div><small class="mut">Per hari 0,6 kg (satu mud).</small></div>`;
const ilmuHtml = (k) => {
  const d = ZILMU[k];
  return d
    ? `<p>${d.ringkas}</p>` +
        (d.kutipan || [])
          .map(
            (q) =>
              `<div class="card kq" style="margin-bottom:10px">${q.ar ? `<div class="ar2">${q.ar}</div>` : ''}<p class="tr" style="margin:4px 0">${q.id}</p><small class="mut">${q.src}${q.ref ? ` · <a href="${q.ref}" style="color:var(--g);font-weight:600">Baca ayatnya</a>` : ''}</small></div>`
          )
          .join('') +
        (d.bagian || [])
          .map((b) => `<h3 class="sec">${b.h}</h3><ul class="kl">${b.isi.map((x) => `<li>${x}</li>`).join('')}</ul>`)
          .join('')
    : '';
};
P.sedekah = (k) => {
  if (k == 'fitrah')
    return twoTabs(
      'Zakat fitrah & fidyah',
      'Zakat fitrah',
      'Fidyah puasa',
      ilmuHtml('fitrah') +
        `<h3 class="sec">Niat zakat fitrah (untuk diri sendiri)</h3><div class="card"><div class="ar2">${NIAT}</div><small class="mut">Aku berniat mengeluarkan zakat fitrah untuk diriku sendiri, fardu karena Allah Taala.</small></div>` +
        FIT,
      ilmuHtml('fidyah') + FID,
      '#/zakat'
    );
  /* Riwayat pembayaran sudah dihapus; menu itu kini Dukung kami */
  if (k == 'dukung' || k == 'riwayat') return P.dukung();
  if (ZILMU[k]) {
    const t = { infak: 'Infak & sedekah', mal: 'Zakat mal', kurban: 'Kurban' }[k];
    return {
      html:
        head(t, '#/zakat') +
        ilmuHtml(k) +
        (k == 'mal'
          ? '<a class="btn s" style="display:inline-block;margin:10px 0" href="#/zakat/emas">Buka kalkulator zakat</a>'
          : ''),
    };
  }
  return zhome();
};
