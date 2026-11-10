/* data/yang-baru.js - Ringkasan "Yang baru" per versi web (ditampilkan sekali setelah pembaruan, lihat yangBaruCek).
   Tambahkan entri baru di atas setiap kali VER dinaikkan untuk perubahan yang terasa oleh pengguna. */
const YANG_BARU = {
  '2.9.64': [
    'Ajakan unduh aplikasi (web) dan tawaran pembaruan (aplikasi Android) hanya bisa ditutup lewat tombolnya: Nanti saja atau Unduh/Perbarui',
    'Geser halaman lebih mulus: halaman yang digeser sama persis dengan halaman aslinya saat bertukar, termasuk di Maulid, jeda sholawat, dan mode Mushaf',
    'Menu bawah langsung menandai halaman tujuan begitu jari dilepas',
  ],
  '2.9.63': [
    'Video tutorial dan rekaman kelas punya pemutar baru: bilah waktu yang bisa digeser, mundur/maju 10 detik, kecepatan 0,75×–2×, dan layar penuh',
    'Rekaman kelas (YouTube, Google Drive, atau berkas video) diputar langsung di aplikasi dan bisa dipercepat atau digeser',
    'Semua video tutorial dibuat ulang: tulisan langkah tidak lagi menabrak bingkai HP, dan kotak penanda tombol lebih jelas',
    'Di web, ajakan unduh aplikasi Android muncul setiap kali situs dibuka',
    'Di aplikasi Android, tawaran pembaruan muncul setiap kali aplikasi dibuka selama versinya masih lama',
  ],
  '2.9.62': [
    "Maulid: tombol kembali langsung keluar dari bacaan (seperti Al-Qur'an), tidak lagi mundur bagian demi bagian dan jeda sholawat",
    'Menu bawah tidak lagi hilang setelah menggeser halaman berkali-kali dengan cepat',
    'Halaman yang tidak punya halaman sebelah tidak bergeser sedikit pun saat digeser',
    'Pengaturan adzan dirapikan: Pengaturan › Waktu Salat & Notifikasi dan tombol Pengaturan adzan di Jadwal salat kini panel yang sama dan saling sinkron (tiap waktu: Adzan, Beduk, Alarm, Bunyi, Senyap, Mati)',
    'Lokasi otomatis: lokasi mengikuti GPS begitu aplikasi dibuka dan saat berpindah tempat; jadwal salat, kiblat, dan alarm adzan langsung ikut',
    'Ukuran tampilan bawaan disesuaikan dengan layar HP sejak pertama dipasang; mengganti ukuran tidak lagi membuat tulisan melompat atau tersendat',
    'Kebijakan Privasi dan Penghapusan Data tidak bisa disalin',
    'Dashboard admin: geser kiri-kanan untuk pindah tab',
  ],
  '2.9.61': [
    'Murottal bisa diputar terus lintas surah: ketuk ayat › "Putar terus sampai surah…", lalu pilih sampai surah berikutnya, akhir juz, akhir Al-Qur\'an, atau surah pilihan',
    'Murottal tetap berbunyi saat pindah halaman, layar mati, atau aplikasi ditutup ke latar (seperti aplikasi musik), dengan kapsul pemutar di semua halaman',
    'Aplikasi Android 2.6.25: notifikasi media murottal dengan tombol sebelumnya, jeda/putar, berikutnya, dan hentikan (juga di layar kunci dan headset Bluetooth)',
    'Fadz AI: menekan tombol mikrofon langsung menghentikan suara AI yang sedang membaca, dan ada petunjuk tahan / geser ke atas untuk merekam lebih lama',
    'Video tutorial bisa digeser bebas tanpa mengulang dari awal, ada tombol mundur/maju 10 detik dan kecepatan 0,75×–2×',
    'Kecepatan murottal bisa diatur dari kapsul pemutar (1×, 1,25×, 1,5×, 0,75×)',
    'Rekaman kelas kini ikut merekam halaman kitab yang ditampilkan pengajar (di sisi kanan video); kitab pribadi jamaah tidak ikut',
    "Video tutorial Al-Qur'an diperbarui",
    'Moto di layar pembuka diperbaiki: "Berfikir untuk berdzikir, bertadabur untuk bersyukur."',
  ],
  '2.9.60': [
    'Kelas online layar penuh ala Google Meet: tombol di bawah video untuk angkat tangan / mikrofon, kamera, bagikan layar, pesan, kitab, peserta, dan keluar',
    'Pesan kelas bisa dibuka di samping video tanpa keluar dari layar penuh',
    'Garis pembatas antara video dan kitab bisa digeser (jari atau tetikus) untuk mengatur ukurannya; ketuk dua kali untuk ukuran semula',
    'Saat berbagi layar, kamera tetap tampil sebagai gambar kecil di pojok',
    'Tombol pintas keyboard di komputer: M mikrofon, H angkat tangan, V kamera, S bagikan layar, C pesan, K kitab, P peserta, F layar penuh, [ ] ukuran kitab, ← → balik halaman, ? daftar tombol',
    'Video tutorial baru: Cara memperbarui aplikasi (HP). Tutorial kelas online ikut diperbarui',
    'Fadz AI kini paham seluruh fitur & cara memakai aplikasi, dan langsung menunjuk isinya: tanya "surat ke-52 apa?", "QS 36:9", "juz 30", "hadis Bukhari nomor 5", "Asmaul Husna ke-7", "Fathul Qarib halaman 12", atau "cara ganti tema", lalu ketuk tombol di bawah jawaban untuk membukanya',
  ],
  '2.9.59': [
    'Kelas online: pengajar bisa menentukan kitab yang dikaji (saat membuat kelas atau lewat tombol Atur kitab). Jamaah yang menekan tombol Kitab langsung dibukakan kitab itu, tanpa mencari',
    'Tombol Kitab kini berlabel dan berwarna, ada petunjuk "Kitab ada di sini", dan ajakan "Kitab kelas ini" di bawah video',
    'Panel kitab bisa dikecilkan (tinggal judul & halaman) tanpa ditutup; di layar penuh jadi kartu kecil di pojok',
    'Jamaah tetap bisa membaca kitab lain sendiri, lalu kembali ke kitab kelas kapan saja',
    'Saat masuk kelas baru ada ajakan menonton video tutorial "Cara ikut kelas online" (bisa dimatikan di Pengaturan › Notifikasi kelas online)',
    'Aplikasi Android 2.6.24: layar pembuka langsung tampil tanpa layar hitam, dan bilah atas/bawah mengikuti tema (tidak putih lagi)',
  ],
  '2.9.58': [
    'Layar pembuka berslogan "Berfikir untuk berdzikir, bertadabur untuk bersyukur." kini tampil saat aplikasi dimuat, menggantikan layar gelap kosong',
  ],
  '2.9.57': [
    'Kelas online: halaman kitab dan video/layar yang dibagikan bisa diperbesar dengan mencubit dua jari, digeser saat diperbesar, dan ketuk dua kali untuk memperbesar atau kembali normal',
  ],
  '2.9.56': [
    'Kitab di kelas online kini mengikuti pengajar: halaman yang dibuka pengajar otomatis tampil di layar jamaah',
    'Jamaah boleh membalik sendiri (berhenti mengikuti), lalu ketuk Ikuti pengajar untuk kembali ke halaman pengajar',
  ],
  '2.9.55': [
    'Kelas online ala Google Meet: tombol layar penuh kini memperbesar seluruh kelas, dengan video pengajar, deretan wajah peserta di bawah (bisa disembunyikan), dan kitab di samping',
    'Tombol Kitab di pojok video: pilih kitab, balik halaman dengan tombol atau geser, dan pilihan terakhir diingat',
    'Aplikasi Android 2.6.21: layar pembuka dengan slogan "Berfikir untuk berdzikir, bertadabur untuk bersyukur."',
  ],
  '2.9.54': [
    'Kelas online: saat berbagi layar ada tombol merah Berhenti di pil "Berbagi layar", dan pil itu langsung hilang setelah berbagi layar dihentikan (termasuk dari notifikasi)',
    'Aplikasi Android 2.6.20: berbagi layar tidak lagi terputus saat pengajar pindah ke aplikasi lain',
  ],
  '2.9.52': [
    'Sholawat Ya Imamar Rusli Ya Sanadi diperbarui sesuai naskah Majelis (10 bait: Qasaman bin najmi, Sayyidus sadat min Mudhar, Qamarun thabat sariratuh, dan seterusnya)',
    'Kelas online: bila gagal masuk kelas, kini tampil rincian penyebabnya agar mudah dilaporkan',
  ],
  '2.9.51': [
    'Ikon di dalam lingkaran berwarna (Ratib, Maulid, Sholawat, Kitab, dan lainnya) kini tampil putih dan jelas, tidak lagi abu-abu gelap',
  ],
  '2.9.50': [
    'Sholawat Fadzkuruuni kini berisi 3 qasidah (Arab, Latin, terjemah): Ya Imamar Rusli Ya Sanadi, Ya Rabbi Antal Hadi, dan Birasulillah wal Badawi',
    'Ketiganya juga muncul di halaman Sholawat antar bagian Amaliyah',
  ],
  '2.9.49': [
    'Halaman Sholawat di Amaliyah tampil baru: penanda langkah (Bagian I → Sholawat → Bagian II), pilihan sholawat berbentuk kartu, dan tombol Lanjut yang selalu terlihat di bawah',
    'Geser kiri-kanan antara bagian maulid dan halaman Sholawat kini mulus',
  ],
  '2.9.48': [
    'Amaliyah: setelah Bagian I, II, III, dan IV ada halaman Sholawat. Pilih sholawat yang dibaca, lalu tekan Lanjut ke bagian berikutnya (sementara memakai daftar Sholawat Umum)',
  ],
  '2.9.47': [
    'Maulid › Fadzkuruuni: Qasidah Ma fil Wujud dan Amaliyah Majelis Fadzkuruuni kini berupa teks per bait (Arab, Latin, terjemah) seperti maulid Umum, bisa diperbesar hurufnya dan disimpan offline',
    "Amaliyah lengkap: Ya Rabbi Shalli, Inna Fatahna, Maulid Adh-Dhiya'ul Lami' bagian I–IV, Mahallul Qiyam, An-Nabi Ya Man Hadhar, Qad Kafani, Ma fil Wujud, dan Doa",
  ],
  '2.9.46': [
    'Kelas online: kamera dan suara pengajar kini tetap tersambung dari jauh dan di jaringan seluler (video tidak lagi berhenti setelah HP pindah aplikasi atau layar mati)',
    'Kelas online: bila sinyal putus sebentar, kelas menyambung ulang otomatis; ada juga tombol Sambungkan lagi',
  ],
  '2.9.45': [
    'Al-Hawi kini lengkap sampai Juz 3, dengan keterangan karya Abuya Mahbubillah, pimpinan Ponpes Fadzkuruuni',
    'Kitab Karya Pondok baru: Ikhtisar Ilmu Faraidh',
    "Maulid: Amaliyah Majelis Fadzkuruuni (Adh-Dhiya'ul Lami', Ma fil Wujud, Mahallul Qiyam); Ratib Al-Haddad memakai edisi terbaru",
    "Kitab Umum baru: Al-Arba'in An-Nawawiyah, Mutammimah Al-Ajurumiyah, Kasyful Muruthiyyah, Ad-Durus An-Nahwiyyah, Syarh Qathrun Nada, Kasyifatus Saja, Syarh Al-Yaqut An-Nafis, dan Asy-Syifa",
  ],
  '2.9.44': [
    'Video tutorial widget kini memakai rekaman layar HP Android asli: memasang widget Jadwal Salat lengkap dari Subuh sampai Isya, termasuk Duha',
  ],
  '2.9.43': [
    'Perbaikan: widget layar utama langsung terisi jadwal saat aplikasi dibuka (sebelumnya baru terisi setelah keluar-masuk aplikasi)',
  ],
  '2.9.42': [
    'Kotak Duha di Beranda dan widget kini tampil sama jelasnya dengan waktu salat lain',
    'Video tutorial widget khusus untuk HP (tidak tampil di pilihan Desktop, karena widget hanya ada di Android)',
  ],
  '2.9.41': [
    'Widget Jadwal Salat di layar utama HP kini menampilkan waktu Duha (perbarui aplikasi Android ke 2.6.17)',
    'Video tutorial baru: memasang widget di layar utama HP',
  ],
  '2.9.40': [
    'Notifikasi singkat (mis. "Subuh: suara adzan…") dan pemberitahuan kelas kini selalu tampil di depan, tidak tertutup lembar atau latar buram',
    'Lembar Pengingat: pilihan aktif ditandai latar lembut dan centang di samping namanya',
  ],
  '2.9.39': [
    'Lembar Pengingat waktu salat: tombol Coba ada di semua pilihan bersuara (termasuk Adzan dan pilihan yang sedang aktif), dan memilih tidak lagi membuat lembar dimuat ulang',
  ],
  '2.9.38': [
    'Pengaturan › Notifikasi per waktu kini lengkap dan urut: Subuh, Terbit, Duha, Zuhur, Asar, Magrib, Isya (Terbit bisa dinyalakan/dimatikan dan dicoba)',
  ],
  '2.9.37': [
    'Waktu Duha tampil di Beranda (sebaris dengan waktu salat) dan di Jadwal salat, lengkap dengan notifikasi saat masuk waktunya',
    'Jadwal salat › Suara adzan: pilih suara adzan Zuhur–Isya & Subuh, coba dengar, rekaman sendiri, dan pengingat sebelum waktu langsung dari halaman jadwal',
  ],
  '2.9.36': [
    'Tasbih melayang kini digeser mulus dan tetap tepat di bawah jempol, di semua ukuran',
    'Jam & jadwal salat di Beranda tidak lagi digambar ulang tiap detik (lebih hemat dan tidak berkedip)',
  ],
  '2.9.34': [
    'Di layar lebar (tablet, laptop), bilah atas halaman baca kini mentok ke tepi kiri-kanan dan batang gulir ada di tepi layar; isi tetap di tengah',
  ],
  '2.9.33': [
    "Al-Qur'an lebih bersih: bilah pemutar dan tombol surah dihapus. Putar audio lewat ketuk ayat; selama berbunyi muncul kapsul kecil untuk jeda/hentikan. Unduh audio surah ada di Pengaturan Al-Qur'an",
    "Pengaturan Al-Qur'an memburamkan latar dengan sama di mode Kartu dan Mushaf",
    'Kelas online: bisa ganti kamera depan atau belakang',
    'Notifikasi kelas punya pilihan suara: bawaan HP, bel, lonceng, getar saja, atau suara sendiri (berkas dari HP atau rekam)',
    'Baris sumber di akhir bacaan diganti himbauan kecil untuk melapor bila ada kesalahan teks',
  ],
  '2.9.32': [
    'Semua video tutorial (Pengaturan › Tentang & Bantuan › Video tutorial) kini bersuara: tiap langkah dibacakan, versi HP dan desktop',
  ],
  '2.9.31': [
    'Admin kini punya kategori akses: semua akses, pengajar Kelas online, laporan & donasi, tampilan aplikasi, atau peta & statistik',
  ],
  '2.9.30': [
    'Pembaruan aplikasi Android bisa langsung diunduh & dipasang dari dalam aplikasi (mulai versi 2.6.7), lengkap dengan persentase unduhan',
    'Notifikasi "Pembaruan Fadzkuruuni tersedia" muncul di HP; diketuk langsung membuka layar pembaruan',
    'Lembar "Fadzkuruuni diperbarui" juga menawarkan versi aplikasi Android terbaru',
  ],
  '2.9.29': [
    'Perbaikan: rekaman kelas di aplikasi Android tersimpan utuh (sebelumnya berkas MP4 kosong / tidak bisa diputar)',
  ],
  '2.9.28': [
    'Pengaturan › Waktu Salat & Notifikasi: bagian baru "Notifikasi kelas online" (jadwal baru, kelas dimulai, pengingat, senyap saat adzan, tes notifikasi)',
    'Perbaikan pengiriman notifikasi kelas ke aplikasi Android',
  ],
  '2.9.27': [
    "Geser antarhalaman lebih lancar: geser beruntun langsung direspons, halaman Al-Qur'an lebih ringan",
    'Beranda di komputer: kartu Ratib, Aqidatul Awam, dll. bisa digeser dengan tombol panah atau diseret tetikus',
  ],
  '2.9.26': [
    'Aplikasi Android 2.6.4: notifikasi kelas online muncul seketika saat jadwal dibuat atau kelas dimulai, walau aplikasi ditutup',
  ],
  '2.9.25': [
    'Kitab, Maulid, Wirid & Sholawat: tombol perbesar, layar penuh, dan pengaturan bacaan berfungsi lagi',
    "Al-Qur'an: geser antarhalaman lebih halus, cepat maupun pelan, dan bisa digeser dari bagian kosong di bawah ayat",
    "Al-Qur'an: pemutar audio tetap di tempatnya saat halaman digulir",
    'Kelas online: video layar penuh di tengah dan mendatar; video kelas live punya tombol layar penuh',
    'Tombol Coba suara adzan berubah menjadi Hentikan selama diputar',
    'Kelas online: notifikasi jadwal & kelas dimulai muncul walau situs ditutup (peramban)',
    'Kebijakan Privasi & Penghapusan Data: teks dirapikan, tautannya kini juga muncul di aplikasi (bawah Akun & Profil dan Tentang & Bantuan)',
  ],
  '2.9.22': [
    'Notifikasi kelas online kini muncul juga saat aplikasi ditinggal ke latar belakang (perlu aplikasi Android 2.6.2)',
    'Pengaturan › Tentang: versi aplikasi Android dan versi isi dipisah, masing-masing bisa dicek',
  ],
  '2.9.20': [
    'Kelas online: video YouTube lama bisa disimpan dengan tanggal aslinya dan diputar ulang',
    'Kelas online: bagikan layar beserta suaranya, rekaman video MP4',
    'Saat kelas diakhiri, semua peserta otomatis keluar',
    'Mikrofon yang dimatikan benar-benar dilepas',
    'Geser antarhalaman dan antartab lebih halus; bacaan Wirid & Sholawat bisa digeser ke bacaan sebelah',
    'Kiblat: penjelasan bila HP tidak punya sensor kompas, jarum lebih stabil',
    'Pemberitahuan pembaruan aplikasi muncul tiap membuka aplikasi bila ada versi baru',
  ],
};
