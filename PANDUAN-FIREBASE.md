# Firebase Fadzkuruuni (sudah terhubung)
Konfigurasi proyek `fadzkuruuni-88a8b` sudah ada di `FBCFG` pada `js/app.js`. Kunci web Firebase memang publik; keamanannya ada pada Rules di bawah.

## Yang harus kamu atur di Firebase Console
1. **Authentication > Settings > Authorized domains**: tambahkan domain tempat aplikasi berjalan, mis. `fadzkuruuni.vercel.app` (`localhost` sudah ada). Tanpa ini tombol Masuk akan menampilkan pesan domain belum diizinkan.
2. **Authentication > Sign-in method**: Google sudah Enabled.
3. **Firestore Database > Rules**, tempel lalu Publish:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /laporan/{id} {
      allow create: if request.resource.size < 900000;
      allow read, update, delete: if false;
    }
  }
}
```
   Laporan (dengan foto) tersimpan di koleksi `laporan`; baca lewat Firebase Console > Firestore.
4. Opsional: batasi API key (Google Cloud Console > Credentials > HTTP referrers) ke domain aplikasimu.

Catatan: login Google tidak berjalan dari `file://`; buka lewat server atau hosting.
