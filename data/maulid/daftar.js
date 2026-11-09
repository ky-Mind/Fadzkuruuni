/* data/maulid/daftar.js - Daftar maulid. Isi tiap maulid ada di berkas sendiri (data/maulid/<id>.js) dan baru dimuat saat dibuka atau diunduh.
   Menambah maulid: buat berkasnya dengan template-kitab/maulid_dari_md.py, lalu isi `berkas` (dan `pdf` bila ada versi cetak) pada baris di bawah. */
const MAULID_ISI={};const registerMaulid=m=>{MAULID_ISI[m.id]=m};
const MAULID_DAFTAR=[
 {id:'diba',judul:"Maulid Diba'i",bagian:14,berkas:'data/maulid/diba.js',pdf:'data/maulid/diba.pdf'},
 {id:'barzanji',judul:'Maulid Barzanji',bagian:20,berkas:'data/maulid/barzanji.js',pdf:'data/maulid/barzanji.pdf'},
 {id:'syarafil-anam',judul:'Maulid Syarafil Anam',bagian:36,berkas:'data/maulid/syarafil-anam.js',pdf:'data/maulid/syarafil-anam.pdf'},
 {id:'simtud-durar',judul:'Maulid Simtud Durar',bagian:20,berkas:'data/maulid/simtud-durar.js',pdf:'data/maulid/simtud-durar.pdf'},
 {id:'burdah',judul:'Qasidah Burdah',bagian:10,berkas:'data/maulid/burdah.js',pdf:'data/maulid/burdah.pdf'},
 {id:'adl',judul:"Maulid Adl-Dliya'ul Lami'",bagian:11,berkas:'data/maulid/adl.js',pdf:'data/maulid/adl.pdf'},
 {id:'azab',judul:'Maulid Azab',bagian:11,berkas:'data/maulid/azab.js'},
 /* majelis:1 = bacaan Majelis Fadzkuruuni: tampil di tab Fadzkuruuni (lewat kitab/daftar.js `teks`), bukan di daftar Umum */
 {id:'ma-fil-wujud',majelis:1,judul:'Qasidah Ma fil Wujud',bagian:1,berkas:'data/maulid/ma-fil-wujud.js',pdf:'kitab/ma-fil-wujud/pdf/juz-1.pdf'},
 {id:'amaliyah',majelis:1,judul:'Amaliyah Majelis Fadzkuruuni',bagian:11,berkas:'data/maulid/amaliyah.js',pdf:'kitab/amaliyah/pdf/juz-1.pdf'},
 /* majelis:'sholawat' = Sholawat Majelis Fadzkuruuni (Wirid › Sholawat › Fadzkuruuni dan halaman jeda Amaliyah); dibaca di #/shf/<id> */
 {id:'ya-imamar-rusli',majelis:'sholawat',judul:'Ya Imamar Rusli Ya Sanadi',arab:'يَا إِمَامَ الرُّسْلِ يَا سَنَدِيْ',ket:'Qasidah sholawat · 10 bait',bagian:1,berkas:'data/sholawat/ya-imamar-rusli.js',rute:'#/shf/ya-imamar-rusli'},
 {id:'ya-rabbi-antal-hadi',majelis:'sholawat',judul:'Ya Rabbi Antal Hadi',arab:'يَا رَبِّيْ أَنْتَ الْهَادِيْ',ket:'Qasidah doa & sholawat · 11 bait',bagian:1,berkas:'data/sholawat/ya-rabbi-antal-hadi.js',rute:'#/shf/ya-rabbi-antal-hadi'},
 {id:'birasulillah-wal-badawi',majelis:'sholawat',judul:'Birasulillah wal Badawi',arab:'بِرَسُوْلِ اللهِ وَالْبَدَوِيْ',ket:'Qasidah tawassul & sholawat · 14 bait',bagian:1,berkas:'data/sholawat/birasulillah-wal-badawi.js',rute:'#/shf/birasulillah-wal-badawi'}];
const SHOLAWAT_FZ=()=>MAULID_DAFTAR.filter(m=>m.majelis=='sholawat').map(m=>({...m,di:'sholawat'}));
