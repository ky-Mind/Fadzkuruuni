/* js/router.js - Router, dan pendaftaran service worker */
const applyNav=()=>document.body.classList.toggle('nav-off',S.sb===false);
function route(){if(!location.hash.startsWith('#/lapor'))LAST=location.hash||'#/';else if(!$('#rk'))LASTT=judulKini();$('#au')?.pause();const [a='',b,c,d]=location.hash.slice(2).split('/');const pg=a=='quran'&&b?surah(b,c):(P[a]||P[''])(b,c,d);document.body.classList.toggle('full',!!S.full&&a=='quran'&&!!b);document.body.classList.toggle('sub',!(['','quran','wirid','kalender','pengaturan'].includes(a)&&!b));setSz();applyNav();const v=$('#view');
 /* Isi halaman dipasang lalu inisialisasinya dijalankan; dipanggil di dalam transisi bila didukung */
 const paint=()=>{v.style.transform=v.style.opacity=v.style.transition='';v.innerHTML=pg.html;v.scrollTop=0;$$('#nav a[data-r]').forEach(l=>l.classList.toggle('on',l.dataset.r==(['quran','wirid','kalender','pengaturan'].includes(a)?a:(['','menu'].includes(a)?'':'x'))));pg.init&&pg.init();$$('#view .ar2').forEach(e=>e.style.fontSize=S.fs+'px');ftUpd();$$('[data-soon]').forEach(e=>e.onclick=()=>toast('Konten ini segera hadir'))};
 /* Pindah halaman dianimasikan seperti iOS (geser dan memudar) bila browser mendukung View Transitions */
 /* Saat tab tersembunyi transisi dibatalkan browser; paint dijamin tetap jalan (sekali) agar halaman tidak kosong */
 /* Arah geser (data-vt: fwd/back) dari navigasi bagian atau tombol kembali; dihapus setelah transisi */
 const de=document.documentElement,arah=de.dataset.vt,ulang=()=>delete de.dataset.vt;
 let done=0;const once=()=>{if(!done){done=1;paint()}};
 if(document.startViewTransition&&!document.hidden&&!matchMedia('(prefers-reduced-motion:reduce)').matches){const t=document.startViewTransition(once);t.ready.catch(()=>{});t.finished.catch(()=>{}).then(()=>{once();ulang()});setTimeout(once,400);setTimeout(ulang,900)}else{once();ulang();if(arah&&v.animate&&!matchMedia('(prefers-reduced-motion:reduce)').matches)v.animate([{opacity:0,transform:`translateX(${arah=='back'?-40:40}px)`},{opacity:1,transform:'none'}],{duration:320,easing:'cubic-bezier(.22,.8,.3,1)'})}}
addEventListener('hashchange',route);
route();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
