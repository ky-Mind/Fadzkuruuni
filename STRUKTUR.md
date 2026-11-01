# Struktur Fadzkuruuni (modular)
Semua berkas adalah skrip biasa yang dimuat berurutan oleh `index.html` (tanpa bundler). Urutan penting: data, lalu `js/core`, lalu `js/pages`, lalu `events.js` dan `router.js`.

```
index.html            kerangka + urutan pemuatan
sw.js                 service worker (offline); daftar berkas yang disimpan ada di array A
css/app.css           gaya
data/                 DATA saja (mudah diperbarui tanpa menyentuh kode)
  quran-meta.js         nama, arti, jumlah ayat, awal juz
  menu.js               menu & pintasan
  kota.js               daftar kota (lokasi salat)
  ibadah.js asma.js     wirid, doa, tahlil, Asmaul Husna
  pustaka.js            hadits & kata-kata bawaan
  content.js            doa/kitab bawaan awal
  maulid/daftar.js      daftar maulid; isi tiap maulid di maulid/<id>.js (dimuat saat dibuka) + <id>.pdf (versi cetak)
  maulid/adl.js         Maulid Adl-Dliya'ul Lami' lengkap (174 bait: Arab, Latin, terjemah)
  zakat-ilmu.js         ayat, hadits, anjuran, adab untuk halaman Zakat & Sedekah (mudah diedit)
js/core/              fondasi bersama
  state.js icons.js ui.js waktu.js quran-api.js cloud.js adzan.js overlay.js(tombol kembali bertahap) unduh.js(unduhan offline & ke perangkat) events.js
js/pages/             SATU BERKAS PER HALAMAN
  beranda quran wirid-doa asmaul-husna tahlil maulid salat(jadwal+kiblat) zakat waris kalender
  tasbih kitab hadits ai(Tanya AI) menu segera tentang lapor kata-kata
  pengaturan/           pusat + satu berkas per kelompok
    index akun-profil beranda-kata tampilan salat-notifikasi offline-data tentang
js/router.js          router
kitab/                KITAB KUNING: satu folder per kitab (daftar.js = daftar kitab)
  alhawi/               Al-Hawi: meta.json, alhawi.js, hal/*.webp (halaman gambar)
audio/ img/ lisensi/  aset
PANDUAN-FIREBASE.md   cara menyiapkan login Google & laporan
api/ai.js             server AI online (Vercel + Groq); panduan di PANDUAN-AI.md
admin.html            dashboard admin laporan pengguna (masuk Google, email admin saja)
firestore.rules       aturan akses Firestore (tempel di Firebase Console)
```
Menambah halaman baru: buat `js/pages/nama.js` berisi `P.nama=(b,c,d)=>({html:'...',init(){}})`, tambahkan ke `index.html` (sebelum `events.js`) dan ke daftar `A` di `sw.js`.
Menambah kelompok Pengaturan: buat `js/pages/pengaturan/nama.js` berisi `SETPAGES.nama=()=>({html,init})` dan daftarkan di `SETGROUPS` pada `index.js`.

## Menambah kitab
Lihat folder `template-kitab/` (di luar folder deploy): PANDUAN-KITAB.md, skrip buat_halaman.py (PDF menjadi halaman gambar), dan template teks/gaya.

## Pembaruan terbaru
- `data/hadits.js`: 100 hadis pertama tiap kitab (`HADIS_KITAB`). Seluruh hadis dimuat
  dari jsDelivr lewat tombol di halaman kitab (`loadFull` di `js/pages/hadits.js`).
- Halaman Hadits: `P.hadits(kitab, nomor)`; `hadits/info` untuk penjelasan sanad dan derajat.
- Sidebar desktop: `body.nav-off` menjadikan bilah ikon saja. Tombol perkecil ada di
  belakang logo (`#nav .nb`) dan muncul saat kursor di logo. Ctrl+B juga berfungsi.
- Tasbih melayang (`js/pages/tasbih.js`): tombol hitung bisa digeser ke mana saja di layar.
  Tombol pengaturan kecil di layang membuka getar, target, reset, dan sembunyikan; pengaturan
  yang sama ada di Pengaturan > Tampilan & Bacaan. Posisi disimpan di `S.ftp`.
- `data/hadits-bab.js`: nama bab Indonesia per kitab (`HADIS_BAB`). Field judul per hadis
  adalah elemen ke-5 setiap baris `h` di `data/hadits.js`.
- Cache service worker: `V` di `sw.js` harus dinaikkan setiap kali berkas aset berubah.

- Unduhan (`js/core/unduh.js`): tiap konten didaftarkan sebagai paket (`paket(id,{judul,kat,urls,berkas})`).
  Tombol Unduh menawarkan "Simpan ke perangkat & offline" (PDF ke folder Download) atau "Hanya untuk offline",
  selalu ada Batal/Batalkan. Isi offline disimpan di cache `fz-off`; status di `localStorage.fzoff`.
  Pengaturan > Offline & Data: Unduh semua, per kategori, dan per item. Kitab: PDF asli di `kitab/<id>/pdf/juz-N.pdf`
  (otomatis disalin oleh `buat_halaman.py`). Maulid baru: `template-kitab/maulid_dari_md.py` (teks + PDF cetak).
