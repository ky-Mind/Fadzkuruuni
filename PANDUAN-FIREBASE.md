# Firebase Fadzkuruuni (sudah terhubung)
Konfigurasi proyek `fadzkuruuni-88a8b` sudah ada di `FBCFG` pada `js/core/cloud.js` (dan `admin.html`). Kunci web Firebase memang publik; keamanannya ada pada Rules di bawah.

## Yang harus kamu atur di Firebase Console
1. **Authentication > Settings > Authorized domains**: tambahkan domain tempat aplikasi berjalan, mis. `fadzkuruuni.vercel.app` (`localhost` sudah ada). Tanpa ini tombol Masuk akan menampilkan pesan domain belum diizinkan.
2. **Authentication > Sign-in method**: Google sudah Enabled.
   Untuk tombol **Masuk dengan Email**: aktifkan **Email/Password** (dan *Email link* bila ingin masuk tanpa kata sandi). Email pendaftaran, reset kata sandi, dan tautan masuk bisa diubah bahasanya di **Authentication > Templates** (pilih bahasa Indonesia).
   Untuk tombol **Masuk dengan Facebook**: buat aplikasi di developers.facebook.com (produk *Facebook Login*), lalu di Firebase aktifkan **Facebook** dan isi *App ID* dan *App Secret*. Salin *OAuth redirect URI* yang ditampilkan Firebase ke pengaturan Facebook Login (Valid OAuth Redirect URIs). Sebelum ini diaktifkan, tombol Facebook menampilkan pesan "belum diaktifkan".
3. **Firestore Database > Rules**: salin seluruh isi berkas `firestore.rules`, tempel, lalu **Publish**.
   Laporan pengguna tersimpan di koleksi `laporan`: siapa pun boleh mengirim, tetapi hanya admin yang bisa membaca, mengubah status, dan menghapus.
4. Opsional: batasi API key (Google Cloud Console > Credentials > HTTP referrers) ke domain aplikasimu.

Catatan: login Google tidak berjalan dari `file://`; buka lewat server atau hosting.

## Dashboard admin (laporan pengguna)
Buka `https://fadzkuruuni.vercel.app/admin.html`, lalu masuk dengan Google memakai salah satu email admin:
- hilmykia@gmail.com
- ponpesfadzkuruuni@gmail.com

Di sana terlihat semua laporan (bug, salah tulis, konten kurang, saran) beserta foto, halaman asal (bisa langsung dibuka), nama pelapor, kontak, dan perangkat. Status bisa diubah (Baru, Diproses, Selesai), diberi catatan, atau dihapus.

Menambah atau mengganti admin: ubah daftar `ADMIN` di `admin.html` **dan** daftar email di fungsi `isAdmin()` pada `firestore.rules`, lalu Publish ulang Rules. Rules-lah yang benar-benar mengunci akses.

## Dashboard: Tampilan, Peta, Statistik, Admin
Dashboard `admin.html` punya tab:
- **Laporan**: laporan pengguna (seperti sebelumnya).
- **Tampilan**: atur urutan & tampil/sembunyi bagian Beranda, pintasan, Semua Menu, menu bawah, halaman Pengaturan, nama menu, pengumuman di Beranda, dan tampilan bawaan pengguna baru. Ada pratinjau HP langsung; perubahan baru berlaku setelah **Terbitkan**. Ada **Riwayat** untuk memulihkan versi lama dan **Kembalikan ke bawaan**.
- **Peta aplikasi**: setiap fitur dan di mana ia muncul (pintasan, Semua Menu, menu bawah), plus urutan Beranda & Pengaturan.
- **Statistik**: perangkat aktif per hari, halaman dibuka, fitur terpopuler, kota, jenis aplikasi. Tanpa data pribadi; pengguna bisa mematikannya di Pengaturan > Tentang & Bantuan.
- **Admin**: pemilik menambah/menghapus admin lain (disimpan di `config/admin`).

Di aplikasi, admin yang masuk dengan Google melihat tombol **Mode admin** di Beranda, Semua Menu, dan Pengaturan untuk menggeser/menyembunyikan bagian langsung, lalu Terbitkan.

Data di Firestore: `config/tampilan` (tata letak, field `json`), `config/tampilan/riwayat`, `config/admin` (`emails`), `stat/{YYYY-MM-DD}`.
**Wajib:** setelah pembaruan ini, salin ulang seluruh isi `firestore.rules` ke Firebase Console > Firestore Database > Rules, lalu **Publish**. Sebelum itu, Tampilan/Statistik/Admin akan menampilkan "permission-denied".
