/* Daftar kitab. Tiap kitab punya folder sendiri di kitab/<id>/.
   Menambah kitab: jalankan template-kitab/buat_halaman.py (menambah baris otomatis di bawah),
   atau salin satu baris dan sesuaikan. Jangan hapus baris penanda berawalan dua garis miring dan @@. */
const KITAB_KELOMPOK={pondok:'Kitab Karya Pondok Fadzkuruuni',klasik:'Kitab Umum'};
/* Baris dengan di:'wirid' / di:'maulid' (wirid & qasidah Majelis Fadzkuruuni) tampil di halaman Wirid / Maulid, bukan di daftar Kitab.
   Isinya tetap dibaca dengan pembaca kitab (#/kitab/<id>). */
const KITAB_MAJELIS=di=>KITAB_DAFTAR.filter(k=>k.di==di);
const KITAB_ISI={};const registerKitab=k=>{KITAB_ISI[k.id]=k};
const KITAB_DAFTAR=[
 {id:"alhawi",kelompok:"pondok",judul:"Al-Hawi fi Khulashatish Sharf wan Nahw",arab:"الحاوي في خلاصة الصرف والنحو",ket:"Ringkasan sharaf dan nahwu · Abuya Mahbubillah, pimpinan Ponpes Fadzkuruuni",berkas:"kitab/alhawi/alhawi.js"},
 {id:"aqidatul-awam-fadzkuruuni",kelompok:"pondok",judul:"Aqidatul Awam (Edisi Majelis Fadzkuruuni)",arab:"متن عقيدة العوام",ket:"Matan akidah 50, edisi Majelis Fadzkuruuni",berkas:"kitab/aqidatul-awam-fadzkuruuni/aqidatul-awam-fadzkuruuni.js"},
 {id:"ma-fil-wujud",kelompok:"pondok",di:"maulid",teks:"ma-fil-wujud/0",judul:"Qasidah Ma fil Wujud",arab:"ما في الوجود",ket:"Qasidah munajat dengan terjemah, dibaca di Majelis Fadzkuruuni",berkas:"kitab/ma-fil-wujud/ma-fil-wujud.js"},
 {id:"ratib-alhaddad",kelompok:"pondok",di:"wirid",judul:"Ratib Al-Haddad",arab:"راتب الحداد",ket:"Wirid harian Majelis Fadzkuruuni",berkas:"kitab/ratib-alhaddad/ratib-alhaddad.js"},
 {id:"amaliyah",kelompok:"pondok",di:"maulid",teks:"amaliyah",judul:"Amaliyah Majelis Fadzkuruuni",arab:"الضياء اللامع · ما في الوجود",ket:"Bacaan majelis: Maulid Adh-Dhiya'ul Lami', Ma fil Wujud, Mahallul Qiyam",berkas:"kitab/amaliyah/amaliyah.js"},
 {id:"ikhtisar-faraidh",kelompok:"pondok",judul:"Ikhtisar Ilmu Faraidh",arab:"علم الفرائض",ket:"Dasar-dasar ilmu faraidh (waris) · Majelis Fadzkuruuni",berkas:"kitab/ikhtisar-faraidh/ikhtisar-faraidh.js"},
 //@@DAFTAR-BARU@@
 {id:'safinatun-najah',kelompok:'klasik',judul:'Safinatun Najah',arab:'سفينة النجاة',ket:'Fikih dasar ibadah · Syekh Salim bin Sumair Al-Hadrami',berkas:'kitab/safinatun-najah/safinatun-najah.js'},
 {id:"kasyifatus-saja",kelompok:"klasik",judul:"Kasyifatus Saja",arab:"كاشفة السجا شرح سفينة النجا",ket:"Syarah Safinatun Najah (fikih) · Syekh Nawawi Al-Bantani",berkas:"kitab/kasyifatus-saja/kasyifatus-saja.js"},
 {id:'fathul-qarib',kelompok:'klasik',judul:'Fathul Qarib',arab:'فتح القريب',ket:"Penjelasan Matan Abi Syuja' · Syekh Muhammad Al-Ghazi",berkas:'kitab/fathul-qarib/fathul-qarib.js'},
 {id:"yaqut-nafis",kelompok:"klasik",judul:"Syarh Al-Yaqut An-Nafis",arab:"شرح الياقوت النفيس في مذهب ابن إدريس",ket:"Fikih Syafi'i · Syekh Muhammad Asy-Syathiri",berkas:"kitab/yaqut-nafis/yaqut-nafis.js"},
 {id:'aqidatul-awam',kelompok:'klasik',judul:'Aqidatul Awam',arab:'عقيدة العوام',ket:'Akidah dasar · Syekh Ahmad Al-Marzuqi',berkas:'kitab/aqidatul-awam/aqidatul-awam.js'},
 {id:'talim-mutaallim',kelompok:'klasik',judul:"Ta'lim Muta'allim",arab:'تعليم المتعلم',ket:'Metodologi belajar · Syekh Az-Zarnuji',berkas:'kitab/talim-mutaallim/talim-mutaallim.js'},
 {id:"arbain-nawawi",kelompok:"klasik",judul:"Al-Arba'in An-Nawawiyah",arab:"الأربعون النووية",ket:"42 hadits pilihan · Imam An-Nawawi",berkas:"kitab/arbain-nawawi/arbain-nawawi.js"},
 {id:'riyadhus-shalihin',kelompok:'klasik',judul:'Riyadhus Shalihin',arab:'رياض الصالحين',ket:'Kumpulan hadits · Imam An-Nawawi',berkas:'kitab/riyadhus-shalihin/riyadhus-shalihin.js'},
 {id:'nashaihul-ibad',kelompok:'klasik',judul:'Nashaihul Ibad',arab:'نصائح العباد',ket:'Kumpulan nasihat · Syekh Nawawi Al-Bantani',berkas:'kitab/nashaihul-ibad/nashaihul-ibad.js'},
 {id:"asy-syifa",kelompok:"klasik",judul:"Asy-Syifa bi Ta'rifi Huquqil Mushthafa",arab:"الشفا بتعريف حقوق المصطفى",ket:"Kedudukan & hak-hak Nabi ﷺ · Al-Qadhi 'Iyadh",berkas:"kitab/asy-syifa/asy-syifa.js"},
 {id:"mutammimah-ajurumiyah",kelompok:"klasik",judul:"Mutammimah Al-Ajurumiyah",arab:"متممة الآجرومية",ket:"Nahwu lanjutan Al-Ajurumiyah · Syekh Al-Haththab Ar-Ru'aini",berkas:"kitab/mutammimah-ajurumiyah/mutammimah-ajurumiyah.js"},
 {id:"kasyful-muruthiyyah",kelompok:"klasik",judul:"Kasyful Muruthiyyah",arab:"كشف المروطية عن ستور الآجرومية",ket:"Syarah Al-Ajurumiyah (nahwu) · Syekh Nawawi Al-Bantani",berkas:"kitab/kasyful-muruthiyyah/kasyful-muruthiyyah.js"},
 {id:"ad-durus-nahwiyyah",kelompok:"klasik",judul:"Ad-Durus An-Nahwiyyah",arab:"الدروس النحوية",ket:"Nahwu bertingkat dengan latihan · Hifni Nashif dkk.",berkas:"kitab/ad-durus-nahwiyyah/ad-durus-nahwiyyah.js"},
 {id:"qathrun-nada",kelompok:"klasik",judul:"Syarh Qathrun Nada wa Ballus Shada",arab:"شرح قطر الندى وبل الصدى",ket:"Nahwu tingkat menengah · Ibnu Hisyam Al-Anshari",berkas:"kitab/qathrun-nada/qathrun-nada.js"}];
