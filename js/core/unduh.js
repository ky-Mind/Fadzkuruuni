/* js/core/unduh.js - Unduhan untuk offline dan ke perangkat.
   Tiap konten didaftarkan sebagai paket: paket(id,{judul,kat,urls:async()=>[...],berkas:async()=>[{url,nama}],cache}).
   Isi paket disimpan di Cache Storage (bawaan 'fz-off'), lalu disajikan service worker saat tanpa internet.
   `berkas` (opsional) = file yang disimpan ke folder Download (PDF untuk dicetak). Semua unduhan bisa dibatalkan.
   Tampilan: dlW(id) untuk satu paket, dlG(kunci) untuk kelompok (DLG[kunci] mengembalikan daftar id). */
const PAKET = {},
  DLJ = {},
  DLQ = [],
  DLG = {};
let DLQON = 0;
const paket = (id, o) => (PAKET[id] = Object.assign({ id, cache: 'fz-off' }, o));
const dlAbs = (u) => new URL(u, location.href).href;
const dlTersimpan = () => {
  try {
    return JSON.parse(localStorage.fzoff || '{}');
  } catch (e) {
    return {};
  }
};
const dlTandai = (id, on) => {
  const o = dlTersimpan();
  on ? (o[id] = Date.now()) : delete o[id];
  try {
    localStorage.fzoff = JSON.stringify(o);
  } catch (e) {}
};
const dlSudah = (id) => !!dlTersimpan()[id];
const dlBar = (a, b) => `<div class="dlbar"><i style="width:${b ? Math.round((a / b) * 100) : 0}%"></i></div>`;

const dlW = (id) => `<div class="dlw${dlBuka(id) ? ' open' : ''}" data-dlw="${id}">${dlIsi(id)}</div>`;
const dlBuka = (id) => !!DLJ[id];
function dlIsi(id) {
  const p = PAKET[id],
    j = DLJ[id];
  if (!p) return '';
  if (j && j.st == 'jalan')
    return `<div class="dlp">${dlBar(j.ok, j.n)}<small class="mut">${j.lokal ? 'Mengunduh untuk perangkat & offline' : 'Mengunduh untuk offline'} · ${j.ok}/${j.n || '…'}</small></div><button class="sb dng" data-dlx="${id}">Batalkan</button>`;
  if (j && j.st == 'antre')
    return `<small class="mut">Menunggu giliran…</small><button class="sb dng" data-dlx="${id}">Batalkan</button>`;
  if (j && j.st == 'pilih')
    return `<div class="dlc"><button class="sb pri" data-dlgo="${id}" data-lokal="1">Simpan ke perangkat &amp; offline<small>File PDF masuk ke folder Download (bisa dicetak), sekaligus tersimpan di aplikasi</small></button><button class="sb" data-dlgo="${id}">Hanya untuk offline<small>Tersimpan di dalam aplikasi, bisa dibaca tanpa internet</small></button></div><button class="sb" data-dlno="${id}">Batal</button>`;
  if (dlSudah(id))
    return `<small class="dlok">${ic('check', 14)} Tersimpan offline</small>${p.berkas ? `<button class="sb" data-dlsv="${id}">${ic('down', 14)} Ke perangkat</button>` : ''}<button class="sb dng" data-dldel="${id}">Hapus</button>`;
  return `<button class="sb pri" data-dl="${id}">${ic('down', 14)} Unduh</button>`;
}

const dlG = (k) => `<div class="dlw" data-dlg="${k}">${dlGIsi(k)}</div>`;
function dlGIsi(k) {
  const I = DLG[k] ? DLG[k]() : [],
    n = I.length,
    ok = I.filter(dlSudah).length,
    jalan = I.some((i) => DLJ[i] && DLJ[i].st != 'pilih');
  if (!n) return '';
  if (jalan)
    return `<div class="dlp">${dlBar(ok, n)}<small class="mut">Mengunduh · ${ok}/${n} tersimpan</small></div><button class="sb dng" data-dlxall="${k}">Batalkan</button>`;
  if (ok == n)
    return `<small class="dlok">${ic('check', 14)} Semua tersimpan (${n})</small><button class="sb dng" data-dldelall="${k}">Hapus semua</button>`;
  return `<small class="mut">${ok}/${n} tersimpan</small><button class="sb pri" data-dlall="${k}">${ic('down', 14)} Unduh semua</button>`;
}

function dlSegar(id) {
  if (id)
    $$(`[data-dlw="${id}"]`).forEach((e) => {
      e.innerHTML = dlIsi(id);
      e.classList.toggle('open', dlBuka(id));
    });
  $$('[data-dlg]').forEach((e) => (e.innerHTML = dlGIsi(e.dataset.dlg)));
  window.dlUkuran && dlUkuran();
}

/* Unduh satu paket. lokal=true: setelah tersimpan offline, file PDF-nya juga disimpan ke perangkat. */
async function dlMulai(id, lokal, diam) {
  const p = PAKET[id];
  if (!p || (DLJ[id] && DLJ[id].st == 'jalan')) return false;
  const ac = new AbortController(),
    j = (DLJ[id] = { st: 'jalan', ok: 0, n: 0, lokal, ac }),
    baru = [];
  dlSegar(id);
  try {
    const U = (await p.urls()).map(dlAbs);
    j.n = U.length;
    dlSegar(id);
    const c = await caches.open(p.cache);
    /* Empat berkas diunduh bersamaan agar paket berisi banyak berkas kecil (audio per ayat) tetap cepat */
    let k = 0;
    const kerja = async () => {
      while (k < U.length) {
        const u = U[k++];
        if (ac.signal.aborted) throw 0;
        if (!(await caches.match(u))) {
          const r = await fetch(u, { signal: ac.signal });
          if (!r.ok) throw new Error(r.status);
          await c.put(u, r);
          baru.push(u);
        }
        j.ok++;
        dlSegar(id);
      }
    };
    await Promise.all([kerja(), kerja(), kerja(), kerja()]);
    delete DLJ[id];
    dlTandai(id, 1);
    dlSegar(id);
    if (lokal) await dlSimpan(id);
    else if (!diam) toast(p.judul + ' ' + (p.selesai || 'siap dibaca offline'));
    return true;
  } catch (e) {
    const batal = ac.signal.aborted;
    delete DLJ[id];
    if (batal) {
      try {
        const c = await caches.open(p.cache);
        for (const u of baru) await c.delete(u);
      } catch (x) {}
    }
    dlSegar(id);
    if (!diam || !batal)
      toast(
        batal ? 'Unduhan ' + p.judul + ' dibatalkan' : 'Gagal mengunduh ' + p.judul + '. Cek internet lalu coba lagi.'
      );
    return false;
  }
}

/* Simpan file paket (PDF) ke folder Download perangkat */
async function dlSimpan(id) {
  const p = PAKET[id];
  if (!p || !p.berkas) return;
  let F = [];
  try {
    F = await p.berkas();
  } catch (e) {}
  if (!F.length) return toast('Versi PDF untuk ' + p.judul + ' belum tersedia');
  if (window.ANDROID) {
    F.forEach((f) => andPanggil('unduh', dlAbs(f.url), f.nama));
    return;
  }
  for (const f of F) {
    try {
      const r = (await caches.match(dlAbs(f.url))) || (await fetch(f.url));
      if (!r.ok) throw 0;
      const u = URL.createObjectURL(await r.blob()),
        a = document.createElement('a');
      a.href = u;
      a.download = f.nama;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(u), 5000);
    } catch (e) {
      return toast('Gagal menyimpan ' + f.nama + '. Butuh internet untuk mengambil file PDF.');
    }
  }
  toast(F.length > 1 ? F.length + ' file PDF disimpan ke folder Download' : 'File PDF disimpan ke folder Download');
}

async function dlHapus(id, diam) {
  const p = PAKET[id];
  if (!p) return;
  try {
    const U = (await p.urls()).map(dlAbs);
    for (const k of await caches.keys()) {
      const c = await caches.open(k);
      for (const u of U) await c.delete(u);
    }
  } catch (e) {}
  dlTandai(id, 0);
  dlSegar(id);
  if (!diam) toast(p.judul + ' dihapus dari penyimpanan offline');
}

/* Antrean "Unduh semua": paket diunduh satu per satu, hanya untuk offline */
async function dlSemua(I) {
  const tambah = I.filter((i) => !dlSudah(i) && !DLJ[i] && !DLQ.includes(i));
  tambah.forEach((i) => {
    DLQ.push(i);
    DLJ[i] = { st: 'antre' };
  });
  dlSegar();
  if (DLQON) return;
  DLQON = 1;
  let ok = 0,
    n = 0;
  while (DLQ.length) {
    const id = DLQ.shift();
    if (!DLJ[id] || DLJ[id].st != 'antre') continue;
    delete DLJ[id];
    n++;
    if (await dlMulai(id, false, true)) ok++;
  }
  DLQON = 0;
  dlSegar();
  if (n)
    toast(
      ok == n ? 'Semua konten siap dibaca offline' : ok + ' dari ' + n + ' tersimpan. Sisanya dibatalkan atau gagal.'
    );
}
function dlBatalKel(k) {
  const I = DLG[k] ? DLG[k]() : [];
  I.forEach((i) => {
    const j = DLJ[i];
    if (!j) return;
    if (j.st == 'antre') {
      delete DLJ[i];
      DLQ.splice(DLQ.indexOf(i), 1);
    } else if (j.ac) j.ac.abort();
    dlSegar(i);
  });
  dlSegar();
}

document.addEventListener('click', (e) => {
  const t = e.target.closest(
    '[data-dl],[data-dlgo],[data-dlno],[data-dlx],[data-dlsv],[data-dldel],[data-dlall],[data-dlxall],[data-dldelall]'
  );
  if (!t) return;
  e.preventDefault();
  const d = t.dataset;
  if (d.dl) {
    if (PAKET[d.dl].berkas) {
      DLJ[d.dl] = { st: 'pilih' };
      dlSegar(d.dl);
    } else dlMulai(d.dl, false);
  } else if (d.dlgo) {
    delete DLJ[d.dlgo];
    dlMulai(d.dlgo, !!d.lokal);
  } else if (d.dlno) {
    delete DLJ[d.dlno];
    dlSegar(d.dlno);
  } else if (d.dlx) {
    const j = DLJ[d.dlx];
    if (j && j.st == 'antre') {
      delete DLJ[d.dlx];
      DLQ.splice(DLQ.indexOf(d.dlx), 1);
      dlSegar(d.dlx);
    } else j && j.ac && j.ac.abort();
  } else if (d.dlsv) dlSimpan(d.dlsv);
  else if (d.dldel)
    konfirmasi(
      'Hapus dari penyimpanan offline?',
      PAKET[d.dldel].judul + ' perlu diunduh lagi agar bisa dibuka tanpa internet.',
      'Hapus',
      () => dlHapus(d.dldel)
    );
  else if (d.dlall) dlSemua(DLG[d.dlall]());
  else if (d.dlxall) dlBatalKel(d.dlxall);
  else if (d.dldelall)
    konfirmasi(
      'Hapus semua unduhan?',
      'Semua konten di kelompok ini perlu diunduh lagi agar bisa dibuka tanpa internet.',
      'Hapus semua',
      async () => {
        for (const i of DLG[d.dldelall]()) if (dlSudah(i)) await dlHapus(i, 1);
        toast('Unduhan dihapus');
      }
    );
});

/* Pindah domain aplikasi Android (pindah.html): paket offline dari alamat lama diunduh ulang otomatis di alamat baru,
   hanya saat terhubung tanpa data seluler (Wi-Fi), agar kuota pengguna tidak habis tanpa ditanya */
setTimeout(() => {
  let L = null;
  try {
    L = JSON.parse(localStorage.fzoffPindah || 'null');
  } catch (e) {}
  if (!L || !navigator.onLine) return;
  const c = navigator.connection;
  if (c && c.type == 'cellular') return;
  try {
    localStorage.removeItem('fzoffPindah');
  } catch (e) {}
  const I = Object.keys(L).filter((i) => PAKET[i]);
  if (I.length) dlSemua(I);
}, 5000);
