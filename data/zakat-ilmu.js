/* data/zakat-ilmu.js - Ilmu ringkas untuk halaman Zakat & Sedekah. Mudah diedit tanpa menyentuh kode.
   Setiap jenis: ringkas (pengantar), kutipan [{ar, id, src, ref?}], bagian [{h, isi:[butir...]}]. Mohon diperiksakan kepada ustaz/kiai. */
const ZILMU={
infak:{ringkas:"Infak dan sedekah adalah pemberian sukarela dari harta (dan kebaikan lain) untuk mencari rida Allah. Tidak ada nisab maupun waktu tertentu: kapan saja, sekecil apa pun, kepada siapa pun yang membutuhkan.",
 kutipan:[
 {ar:"مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",id:"Sedekah tidak akan mengurangi harta.",src:"HR. Muslim no. 2588"},
 {ar:"اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ",id:"Jagalah diri kalian dari api neraka walau dengan (bersedekah) separuh butir kurma.",src:"HR. Bukhari no. 1417 dan Muslim no. 1016"},
 {ar:"الصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ",id:"Sedekah memadamkan dosa sebagaimana air memadamkan api.",src:"HR. Tirmidzi no. 614"},
 {ar:"الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى",id:"Tangan di atas (pemberi) lebih baik daripada tangan di bawah (penerima).",src:"HR. Bukhari no. 1429 dan Muslim no. 1034"},
 {id:"Perumpamaan orang yang menginfakkan hartanya di jalan Allah seperti sebutir benih yang menumbuhkan tujuh tangkai; pada setiap tangkai ada seratus biji. Allah melipatgandakan bagi siapa yang Dia kehendaki.",src:"QS. Al-Baqarah: 261 (ringkasan makna)",ref:"#/quran/2/261"}],
 bagian:[
 {h:"Keutamaan",isi:["Pahalanya dilipatgandakan oleh Allah (QS. Al-Baqarah: 261).","Menghapus dosa dan menjadi perisai dari api neraka (hadits di atas).","Orang yang bersedekah dengan sembunyi-sembunyi, sampai tangan kirinya tidak tahu apa yang diberikan tangan kanannya, termasuk tujuh golongan yang dinaungi Allah pada hari kiamat (HR. Bukhari no. 660 dan Muslim no. 1031)."]},
 {h:"Anjuran",isi:["Bersegeralah selagi sehat dan sebelum ajal tiba (lihat QS. Al-Munafiqun: 10).","Utamakan yang rutin walau sedikit; amal yang paling dicintai Allah adalah yang paling terus-menerus.","Dahulukan keluarga yang membutuhkan dan kerabat: sedekah kepada orang miskin bernilai sedekah, kepada kerabat bernilai dua, yaitu sedekah dan silaturahim (HR. Tirmidzi no. 658)."]},
 {h:"Adab",isi:["Ikhlas karena Allah, bukan untuk pujian.","Dari harta yang halal: sesungguhnya Allah itu baik dan tidak menerima kecuali yang baik (HR. Muslim no. 1015).","Tidak menyebut-nyebut pemberian dan tidak menyakiti perasaan penerima (QS. Al-Baqarah: 264).","Berikan yang terbaik dan yang kamu cintai (QS. Ali Imran: 92)."]},
 {h:"Tidak hanya uang",isi:["Setiap persendian manusia wajib disedekahi tiap hari: berlaku adil, menolong orang, kata yang baik, langkah menuju salat, dan menyingkirkan gangguan dari jalan adalah sedekah (HR. Bukhari no. 2989 dan Muslim no. 1009).","Senyum di hadapan saudaramu adalah sedekah (HR. Tirmidzi no. 1956)."]},
 {h:"Beda zakat, infak, dan sedekah",isi:["Zakat: wajib, ada nisab, haul, dan kadar tertentu; penerimanya delapan golongan.","Infak dan sedekah: sunnah, tanpa nisab dan tanpa batas, boleh kepada siapa pun yang membutuhkan."]}]},
mal:{ringkas:"Zakat mal adalah zakat atas harta yang sudah mencapai nisab dan haul: emas dan perak, uang simpanan, perdagangan, hasil pertanian, peternakan, dan lainnya. Zakat termasuk rukun Islam yang ketiga.",
 kutipan:[
 {ar:"بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ",id:"Islam dibangun di atas lima perkara: bersaksi bahwa tiada tuhan selain Allah dan Muhammad utusan Allah, mendirikan salat, menunaikan zakat, haji ke Baitullah, dan puasa Ramadan.",src:"HR. Bukhari no. 8 dan Muslim no. 16"},
 {id:"Ambillah zakat dari sebagian harta mereka, guna membersihkan dan menyucikan mereka, dan doakanlah mereka.",src:"QS. At-Taubah: 103 (ringkasan makna)",ref:"#/quran/9/103"}],
 bagian:[
 {h:"Syarat harta wajib dizakati",isi:["Dimiliki penuh oleh seorang muslim.","Mencapai nisab (batas minimal).","Telah genap satu tahun (haul), kecuali hasil pertanian yang dizakati saat panen.","Lebih dari kebutuhan pokok, dan utang yang jatuh tempo dikurangkan sesuai jenis zakatnya."]},
 {h:"Ringkasan nisab dan kadar (lihat Kalkulator Zakat)",isi:["Emas 85 gram dan perak 595 gram: 2,5%.","Perdagangan, perusahaan, profesi: setara 85 gram emas, 2,5%.","Pertanian: 653 kg gabah atau 522 kg beras; 10% (tanpa biaya), 5% (berbiaya), 7,5% (campuran).","Kambing/domba mulai 40 ekor, sapi/kerbau mulai 30 ekor."]},
 {h:"Delapan golongan penerima (QS. At-Taubah: 60)",isi:["Fakir dan miskin.","Amil (pengelola zakat).","Muallaf.","Riqab (hamba sahaya / korban perbudakan).","Gharim (orang yang berutang untuk kebutuhan yang dibenarkan).","Fi sabilillah.","Ibnu sabil (musafir yang kehabisan bekal)."]},
 {h:"Adab",isi:["Segera tunaikan setelah wajib; jangan ditunda tanpa uzur.","Niat zakat saat menyerahkan, dan berikan kepada yang berhak atau lembaga amil tepercaya."]}]},
fitrah:{ringkas:"Zakat fitrah adalah zakat jiwa yang wajib ditunaikan setiap muslim pada akhir Ramadan sebagai penyuci bagi yang berpuasa dan bantuan makanan bagi fakir miskin.",
 kutipan:[
 {id:"Rasulullah mewajibkan zakat fitrah satu sha' kurma atau gandum atas setiap muslim: hamba sahaya dan merdeka, laki-laki dan perempuan, kecil dan besar, dan memerintahkan agar ditunaikan sebelum orang-orang keluar untuk salat Id.",src:"HR. Bukhari no. 1503 dan Muslim no. 984 (dari Ibnu Umar)"},
 {id:"Zakat fitrah menjadi penyuci bagi orang yang berpuasa dari perbuatan sia-sia dan kata-kata kotor, serta makanan bagi orang miskin. Siapa yang menunaikannya sebelum salat, itulah zakat yang diterima; siapa yang menunaikannya sesudah salat, itu hanya sedekah biasa.",src:"HR. Abu Dawud no. 1609 dan Ibnu Majah no. 1827 (dari Ibnu Abbas)"}],
 bagian:[
 {h:"Siapa yang wajib",isi:["Setiap muslim yang hidup pada akhir Ramadan dan awal Syawal, serta memiliki kelebihan makanan untuk malam dan hari raya.","Ia menunaikan untuk dirinya dan orang yang menjadi tanggungannya (istri, anak, dan lainnya)."]},
 {h:"Waktu",isi:["Wajib sejak terbenam matahari akhir Ramadan; boleh dibayar sejak awal Ramadan.","Paling utama sebelum salat Idulfitri.","Tidak boleh ditunda setelah hari raya tanpa uzur; bila terlambat tetap wajib dibayar."]},
 {h:"Ukuran",isi:["Satu sha' makanan pokok setempat.","Di Indonesia lazim dihitung 2,5 kg beras per jiwa (ketetapan BAZNAS/Kemenag); sebagian ulama Syafi'iyah menghitung satu sha' sekitar 2,7 kg. Boleh mengikuti ketetapan lembaga zakat setempat.","Menurut Hanafi boleh dengan uang; menurut Syafi'i yang afdal dengan makanan pokok (konsultasikan kebiasaan di tempatmu)."]},
 {h:"Penerima",isi:["Terutama fakir dan miskin, juga golongan penerima zakat lainnya (QS. At-Taubah: 60)."]}]},
fidyah:{ringkas:"Fidyah adalah memberi makan orang miskin sebagai ganti puasa Ramadan yang tidak bisa dikerjakan.",
 kutipan:[{id:"Bagi orang yang berat menjalankannya (puasa), wajib membayar fidyah, yaitu memberi makan seorang miskin.",src:"QS. Al-Baqarah: 184 (ringkasan makna)",ref:"#/quran/2/184"}],
 bagian:[
 {h:"Siapa yang membayar fidyah",isi:["Orang sakit menahun yang tidak diharapkan sembuh.","Orang lanjut usia yang tidak kuat berpuasa.","Ibu hamil atau menyusui yang khawatir terhadap bayi/anaknya: menurut Syafi'iyah membayar fidyah dan juga mengqada puasa; bila hanya khawatir terhadap dirinya, cukup qada."]},
 {h:"Ukuran",isi:["Satu mud (sekitar 0,6 kg) makanan pokok untuk setiap hari yang ditinggalkan (mazhab Syafi'i).","Diberikan kepada fakir miskin; boleh dalam bentuk makanan matang atau bahan makanan."]}]},
kurban:{ringkas:"Kurban adalah menyembelih hewan ternak pada Iduladha dan hari Tasyrik (10-13 Zulhijah) untuk mendekatkan diri kepada Allah. Hukumnya sunnah muakkadah menurut mayoritas ulama, termasuk mazhab Syafi'i.",
 kutipan:[
 {id:"Maka dirikanlah salat karena Tuhanmu, dan berkurbanlah.",src:"QS. Al-Kautsar: 2 (ringkasan makna)",ref:"#/quran/108"},
 {id:"Nabi berkurban dengan dua ekor domba bertanduk, putih kehitaman. Beliau menyembelihnya sendiri dengan menyebut nama Allah dan bertakbir.",src:"HR. Bukhari no. 5558 dan Muslim no. 1966 (dari Anas)"}],
 bagian:[
 {h:"Hewan kurban dan umur (mazhab Syafi'i)",isi:["Unta minimal 5 tahun, sapi/kerbau minimal 2 tahun, kambing minimal 2 tahun, domba minimal 1 tahun.","Kambing atau domba untuk satu orang; sapi, kerbau, atau unta boleh untuk tujuh orang (HR. Muslim no. 1318)."]},
 {h:"Syarat sehat",isi:["Tidak buta sebelah yang jelas, tidak pincang yang jelas, tidak sakit yang jelas, dan tidak sangat kurus (HR. Abu Dawud no. 2802)."]},
 {h:"Waktu",isi:["Setelah salat Iduladha (dan khutbah) sampai terbenam matahari tanggal 13 Zulhijah."]},
 {h:"Pembagian",isi:["Kurban sunnah: disunnahkan dimakan sebagian, dan sebagian besar disedekahkan kepada fakir miskin (lazim dibagi tiga: dimakan, dihadiahkan, disedekahkan).","Kurban nazar: seluruhnya disedekahkan.","Daging dan kulit tidak dijual, dan upah penyembelih tidak diambil dari hewan kurban."]},
 {h:"Adab",isi:["Niat karena Allah, menyembelih dengan menyebut nama Allah dan pisau yang tajam, serta memperlakukan hewan dengan baik.","Bagi yang akan berkurban, disunnahkan tidak memotong rambut dan kuku sejak masuk 1 Zulhijah sampai hewannya disembelih (HR. Muslim no. 1977)."]}]}
};
