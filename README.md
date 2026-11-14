# Fadzkuruuni

Aplikasi dzikir, Al-Qur'an, dan ibadah harian. Jalan di browser sebagai PWA (bisa offline) dan di Android.

Live: https://majelisfadzkuruuni.web.id (juga https://fadzkuruuni.vercel.app)

## Fitur

- Al-Qur'an, wirid & doa, Asmaul Husna, tahlil, maulid
- Jadwal salat dan arah kiblat, kalender, tasbih melayang
- Kitab kuning dan hadits, zakat & sedekah, kalkulator waris
- Tanya AI, unduhan untuk dipakai offline, login Google

## Teknologi

HTML, CSS, dan JavaScript biasa tanpa bundler. Service worker untuk offline, Firebase (Auth + Firestore) untuk akun dan laporan, serverless function di Vercel untuk AI.

## Struktur

```
index.html      kerangka dan urutan pemuatan skrip
data/           data konten (Qur'an, doa, kota, hadits)
js/core/        fondasi bersama
js/pages/       satu berkas per halaman
api/            serverless function (AI, TTS, push)
kitab/          kitab kuning per folder
sw.js           service worker
```

Detail lengkap ada di [STRUKTUR.md](STRUKTUR.md). Panduan Firebase dan AI ada di `PANDUAN-FIREBASE.md` dan `PANDUAN-AI.md`.

## Jalankan lokal

```bash
python3 -m http.server 8080
```

Lalu buka `http://localhost:8080`.
