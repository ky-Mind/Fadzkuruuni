/* js/router.js - Router, dan pendaftaran service worker */
const applyNav=()=>document.body.classList.toggle('nav-off',S.sb===false);
function route(){if(!location.hash.startsWith('#/lapor'))LAST=location.hash||'#/';$('#au')?.pause();const [a='',b,c,d]=location.hash.slice(2).split('/');const pg=a=='quran'&&b?surah(b,c):(P[a]||P[''])(b,c,d);document.body.classList.toggle('full',!!S.full&&a=='quran'&&!!b);document.body.classList.toggle('sub',!(['','quran','artikel','kalender','pengaturan'].includes(a)&&!b));setSz();applyNav();const v=$('#view');
 /* Isi halaman dipasang lalu inisialisasinya dijalankan; dipanggil di dalam transisi bila didukung */
 const paint=()=>{v.innerHTML=pg.html;v.scrollTop=0;$$('#nav a[data-r]').forEach(l=>l.classList.toggle('on',l.dataset.r==(['quran','artikel','kalender','pengaturan'].includes(a)?a:(['','menu'].includes(a)?'':'x'))));pg.init&&pg.init();$$('#view .ar2').forEach(e=>e.style.fontSize=S.fs+'px');ftUpd();$$('[data-soon]').forEach(e=>e.onclick=()=>toast('Konten ini segera hadir'))};
 /* Pindah halaman dianimasikan seperti iOS (geser dan memudar) bila browser mendukung View Transitions */
 if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion:reduce)').matches)document.startViewTransition(paint);else paint()}
addEventListener('hashchange',route);
route();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
