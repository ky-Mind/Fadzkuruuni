# Fadz AI (Tanya AI) Fadzkuruuni

Menu **Fadz AI** (menu bawah) punya dua mode:

1. **Online**: jawaban dari Groq (model gpt-oss-120b dengan cadangan Llama; gratis dan cepat) lewat server `api/ai.js` di Vercel.
2. **Offline**: AI kecil yang diunduh sekali ke HP (tombol "Unduh AI offline" di ruang chat), berjalan tanpa internet. Butuh browser yang mendukung WebGPU (Chrome Android versi baru). Bila tidak didukung atau belum diunduh, jawaban berupa pencarian di isi aplikasi.

## Memasang AI online (sekali saja)

1. Buka https://console.groq.com, masuk (bisa dengan Google), lalu pilih **API Keys > Create API Key**. Salin key-nya (diawali `gsk_`).
2. Buka https://vercel.com, pilih proyek **Fadzkuruuni > Settings > Environment Variables**.
3. Tambahkan:
   - Key: `GROQ_API_KEY`
   - Value: key dari langkah 1
   - Environment: Production (dan Preview bila perlu)
4. Simpan, lalu buka tab **Deployments**, pilih deploy terbaru, **Redeploy**.

Key hanya tersimpan di Vercel dan tidak pernah dikirim ke HP pengguna, jadi aman dari pencurian.
Kuota gratis Groq terbatas per menit dan per hari. Bila habis, aplikasi otomatis memakai mode offline.

## Catatan
- Server hanya menerima permintaan dari domain `*.vercel.app` dan localhost.
- Aturan menjawab (bahasa, manhaj Ahlussunnah wal Jama'ah, mazhab Syafi'i, tidak mengarang dalil) ada di `SISTEM` pada `api/ai.js`; ubah di sana bila perlu.
- Saat dicoba di komputer dengan `python3 -m http.server`, `api/ai.js` tidak berjalan; halaman chat otomatis memakai mode pencarian isi aplikasi.
