/* Daftar kitab. Tiap kitab punya folder sendiri di kitab/<id>/.
   Menambah kitab: jalankan template-kitab/buat_halaman.py (menambah baris otomatis di bawah),
   atau salin satu baris dan sesuaikan. Jangan hapus baris penanda berawalan dua garis miring dan @@. */
const KITAB_KELOMPOK={pondok:'Kitab Karya Pondok Fadzkuruuni',klasik:'Kitab Klasik'};
const KITAB_ISI={};const registerKitab=k=>{KITAB_ISI[k.id]=k};
const KITAB_DAFTAR=[
 {id:"alhawi",kelompok:"pondok",judul:"Al-Hawi fi Khulashatish Sharf wan Nahw",arab:"الحاوي في خلاصة الصرف والنحو",ket:"Ringkasan ilmu sharaf dan nahwu (Arab, dengan keterangan Sunda dan Indonesia)",berkas:"kitab/alhawi/alhawi.js"},
 //@@DAFTAR-BARU@@
 {id:'safinatun-najah',kelompok:'klasik',judul:'Safinatun Najah',arab:'سفينة النجاة',ket:'Fikih dasar ibadah · Syekh Salim bin Sumair Al-Hadrami',berkas:null},
 {id:'fathul-qarib',kelompok:'klasik',judul:'Fathul Qarib',arab:'فتح القريب',ket:"Penjelasan Matan Abi Syuja' · Syekh Muhammad Al-Ghazi",berkas:null},
 {id:'talim-mutaallim',kelompok:'klasik',judul:"Ta'lim Muta'allim",arab:'تعليم المتعلم',ket:'Metodologi belajar · Syekh Az-Zarnuji',berkas:null},
 {id:'aqidatul-awam',kelompok:'klasik',judul:'Aqidatul Awam',arab:'عقيدة العوام',ket:'Akidah dasar · Syekh Ahmad Al-Marzuqi',berkas:null},
 {id:'riyadhus-shalihin',kelompok:'klasik',judul:'Riyadhus Shalihin',arab:'رياض الصالحين',ket:'Kumpulan hadits · Imam An-Nawawi',berkas:null},
 {id:'nashaihul-ibad',kelompok:'klasik',judul:'Nashaihul Ibad',arab:'نصائح العباد',ket:'Kumpulan nasihat · Syekh Nawawi Al-Bantani',berkas:null}];
