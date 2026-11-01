/* js/router.js - Router, dan pendaftaran service worker */
const applyNav=()=>document.body.classList.toggle('nav-off',S.sb===false);
/* Pindah halaman: isi lama keluar bertahap satu per satu, lalu isi baru masuk bertahap. Muat ulang halaman yang sama tidak dianimasikan. */
const gerakOff=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
let RT=0;
/* Riwayat halaman di dalam aplikasi: tombol kembali kembali ke halaman sebelumnya satu per satu (mis. Maulid → Semua Menu → Beranda) */
const RIW=[];
function route(){if(!location.hash.startsWith('#/lapor'))LAST=location.hash||'#/';else if(!$('#rk'))LASTT=judulKini();$('#au')?.pause();const [a='',b,c,d]=location.hash.slice(2).split('/');const pg=a=='quran'&&b?surah(b,c):(P[a]||P[''])(b,c,d);const v=$('#view'),tok=++RT,baru=route.cur!=location.hash,ganti=baru&&v.children.length&&!gerakOff();route.cur=location.hash;{const h=location.hash||'#/';if(RIW[RIW.length-2]==h)RIW.pop();else if(RIW[RIW.length-1]!=h)RIW.push(h)}
 /* Arah (data-vt: fwd/back) dari navigasi bagian, geser, atau tombol kembali */
 const de=document.documentElement,arah=de.dataset.vt;delete de.dataset.vt;
 /* Isi halaman dipasang lalu inisialisasinya dijalankan */
 const paint=()=>{if(tok!=RT)return;document.body.classList.toggle('full',!!S.full&&a=='quran'&&!!b);document.body.classList.toggle('sub',!(['','quran','ai','kalender','pengaturan'].includes(a)&&!b));setSz();applyNav();
  v.style.transform=v.style.opacity=v.style.transition='';v.innerHTML=pg.html;v.classList.remove('kel','kelb');v.scrollTop=0;$$('#nav a[data-r]').forEach(l=>l.classList.toggle('on',l.dataset.r==(['quran','ai','kalender','pengaturan'].includes(a)?a:(['','menu'].includes(a)?'':'x'))));pg.init&&pg.init();baru&&masuk(v,arah);$$('#view .ar2').forEach(e=>e.style.fontSize=S.fs+'px');ftUpd();$$('[data-soon]').forEach(e=>e.onclick=()=>toast('Konten ini segera hadir'))};
 ganti?keluar(v,arah).then(paint):paint()}
/* Isi lama keluar bergiliran dari atas; saat kembali, bergeser ke kanan */
function keluar(v,arah){const K=[...v.children];v.classList.remove('ent','entb');K.forEach((c,i)=>c.style.setProperty('--o',Math.min(i,8)));v.classList.add(arah=='back'?'kelb':'kel');return new Promise(r=>setTimeout(r,180+Math.min(K.length-1,8)*24))}
/* Isi halaman muncul bertahap satu per satu (lembut); saat kembali, masuk dari kiri */
function masuk(v,arah){if(gerakOff())return;[...v.children].forEach((c,i)=>c.style.setProperty('--i',Math.min(i,10)));v.classList.remove('ent','entb');void v.offsetWidth;v.classList.add('ent');arah=='back'&&v.classList.add('entb');clearTimeout(masuk.t);masuk.t=setTimeout(()=>v.classList.remove('ent','entb'),1100)}
addEventListener('hashchange',route);
route();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
