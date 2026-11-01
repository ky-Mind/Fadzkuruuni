/* data/maulid/daftar.js - Daftar maulid. Isi tiap maulid ada di berkas sendiri (data/maulid/<id>.js) dan baru dimuat saat dibuka atau diunduh.
   Menambah maulid: buat berkasnya dengan template-kitab/maulid_dari_md.py, lalu isi `berkas` (dan `pdf` bila ada versi cetak) pada baris di bawah. */
const MAULID_ISI={};const registerMaulid=m=>{MAULID_ISI[m.id]=m};
const MAULID_DAFTAR=[
 {id:'diba',judul:"Maulid Diba'i",bagian:14,berkas:'data/maulid/diba.js',pdf:'data/maulid/diba.pdf'},
 {id:'barzanji',judul:'Maulid Barzanji',bagian:20,berkas:'data/maulid/barzanji.js',pdf:'data/maulid/barzanji.pdf'},
 {id:'syarafil-anam',judul:'Maulid Syarafil Anam',berkas:null},
 {id:'simtud-durar',judul:'Maulid Simtud Durar',berkas:null},
 {id:'burdah',judul:'Qasidah Burdah',bagian:10,berkas:'data/maulid/burdah.js',pdf:'data/maulid/burdah.pdf'},
 {id:'adl',judul:"Maulid Adl-Dliya'ul Lami'",bagian:11,berkas:'data/maulid/adl.js',pdf:'data/maulid/adl.pdf'},
 {id:'azab',judul:'Maulid Azab',berkas:null}];
