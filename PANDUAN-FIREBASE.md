# Mengaktifkan "Masuk dengan Google" (sinkron cloud)
1. Buka console.firebase.google.com, buat proyek, lalu tambahkan aplikasi Web.
2. Authentication > Sign-in method > aktifkan Google. Tambahkan domain tempat aplikasi berjalan ke Authorized domains (localhost sudah ada).
3. Firestore Database > buat database. Pada Rules, izinkan pengguna hanya mengakses dokumennya sendiri:
   `match /users/{uid} { allow read, write: if request.auth != null && request.auth.uid == uid; }`
4. Salin konfigurasi (apiKey, authDomain, projectId, appId) ke konstanta `FBCFG` di `js/app.js`.
Catatan: login Google tidak berjalan dari `file://`; jalankan lewat server (mis. `python3 -m http.server`) atau hosting.
