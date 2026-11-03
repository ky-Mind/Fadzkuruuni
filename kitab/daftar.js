/* Daftar kitab. Tiap kitab punya folder sendiri di kitab/<id>/.
   Menambah kitab: jalankan template-kitab/buat_halaman.py (menambah baris otomatis di bawah),
   atau salin satu baris dan sesuaikan. Jangan hapus baris penanda berawalan dua garis miring dan @@. */
const KITAB_KELOMPOK={pondok:'Kitab Karya Pondok Fadzkuruuni',klasik:'Kitab Umum'};
const KITAB_ISI={};const registerKitab=k=>{KITAB_ISI[k.id]=k};
const KITAB_DAFTAR=[
 {id:"alhawi",kelompok:"pondok",judul:"Al-Hawi fi Khulashatish Sharf wan Nahw",arab:"الحاوي في خلاصة الصرف والنحو",ket:"Ringkasan ilmu sharaf dan nahwu (Arab, dengan keterangan Sunda dan Indonesia)",berkas:"kitab/alhawi/alhawi.js"},
 //@@DAFTAR-BARU@@
 {id:'safinatun-najah',kelompok:'klasik',judul:'Safinatun Najah',arab:'سفينة النجاة',ket:'Fikih dasar ibadah · Syekh Salim bin Sumair Al-Hadrami',berkas:'kitab/safinatun-najah/safinatun-najah.js'},
 {id:'fathul-qarib',kelompok:'klasik',judul:'Fathul Qarib',arab:'فتح القريب',ket:"Penjelasan Matan Abi Syuja' · Syekh Muhammad Al-Ghazi",berkas:'kitab/fathul-qarib/fathul-qarib.js'},
 {id:'talim-mutaallim',kelompok:'klasik',judul:"Ta'lim Muta'allim",arab:'تعليم المتعلم',ket:'Metodologi belajar · Syekh Az-Zarnuji',berkas:'kitab/talim-mutaallim/talim-mutaallim.js'},
 {id:'aqidatul-awam',kelompok:'klasik',judul:'Aqidatul Awam',arab:'عقيدة العوام',ket:'Akidah dasar · Syekh Ahmad Al-Marzuqi',berkas:'kitab/aqidatul-awam/aqidatul-awam.js'},
 {id:'riyadhus-shalihin',kelompok:'klasik',judul:'Riyadhus Shalihin',arab:'رياض الصالحين',ket:'Kumpulan hadits · Imam An-Nawawi',berkas:'kitab/riyadhus-shalihin/riyadhus-shalihin.js'},
 {id:'nashaihul-ibad',kelompok:'klasik',judul:'Nashaihul Ibad',arab:'نصائح العباد',ket:'Kumpulan nasihat · Syekh Nawawi Al-Bantani',berkas:'kitab/nashaihul-ibad/nashaihul-ibad.js'}];
