/* js/router.js - Router, dan pendaftaran service worker */
function route(){if(!location.hash.startsWith('#/lapor'))LAST=location.hash||'#/';$('#au')?.pause();const [a='',b,c,d]=location.hash.slice(2).split('/');const pg=a=='quran'&&b?surah(b,c):(P[a]||P[''])(b,c,d);document.body.classList.toggle('full',!!S.full&&a=='quran'&&!!b);document.body.classList.toggle('sub',!(['','quran','artikel','kalender','pengaturan'].includes(a)&&!b));setSz();const v=$('#view');v.innerHTML=pg.html;v.scrollTop=0;v.style.animation='none';v.offsetWidth;v.style.animation='';
 $$('#nav a[data-r]').forEach(l=>l.classList.toggle('on',l.dataset.r==(['quran','artikel','kalender','pengaturan'].includes(a)?a:(['','menu'].includes(a)?'':'x'))));pg.init&&pg.init();$$('#view .ar2').forEach(e=>e.style.fontSize=S.fs+'px');ftUpd();
 $$('[data-soon]').forEach(e=>e.onclick=()=>toast('Konten ini segera hadir'))}
addEventListener('hashchange',route);
route();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
