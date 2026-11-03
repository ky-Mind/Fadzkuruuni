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
  v.style.transform=v.style.opacity=v.style.transition='';v.innerHTML=pg.html;v.classList.remove('kel','kelb');v.scrollTop=0;$$('#nav a[data-r]').forEach(l=>l.classList.toggle('on',l.dataset.r==(['quran','ai','kalender','pengaturan'].includes(a)?a:(['','menu'].includes(a)?'':'x'))));pg.init&&pg.init();barLekat();tabPil();layarBaca(a=='kitab'&&!!b);baru&&masuk(v,arah);$$('#view .ar2').forEach(e=>e.style.fontSize=S.fs+'px');ftUpd();$$('[data-soon]').forEach(e=>e.onclick=()=>toast('Konten ini segera hadir'))};
 ganti?keluar(v,arah).then(paint):paint()}
/* Isi lama keluar bergiliran dari atas; saat kembali, bergeser ke kanan */
function keluar(v,arah){const K=[...v.children];v.classList.remove('ent','entb');K.forEach((c,i)=>c.style.setProperty('--o',Math.min(i,8)));v.classList.add(arah=='back'?'kelb':'kel');return new Promise(r=>setTimeout(r,180+Math.min(K.length-1,8)*24))}
/* Isi halaman muncul bertahap satu per satu (lembut); saat kembali, masuk dari kiri */
function masuk(v,arah){if(gerakOff())return;[...v.children].forEach((c,i)=>c.style.setProperty('--i',Math.min(i,10)));v.classList.remove('ent','entb');void v.offsetWidth;v.classList.add('ent');arah=='back'&&v.classList.add('entb');clearTimeout(masuk.t);masuk.t=setTimeout(()=>v.classList.remove('ent','entb'),1100)}
/* Kepala halaman baca (yang punya tombol Pengaturan baca, dan kepala surah) menempel di atas,
   bersembunyi saat pengguna menggulir ke bawah dan muncul lagi saat menggulir ke atas, sama seperti bilah kitab */
let BLY=0,BLU=0;
/* Layar penuh (S.kfull) hanya untuk pembaca kitab; halaman baca lain memakai mode Kartu | Mushaf.
   Keluar dari kitab otomatis keluar dari layar penuh peramban. */
function layarBaca(kitab){const baca=kitab,on=!!S.kfull&&baca;document.body.classList.toggle('kfull',on);
 if(!baca&&(document.fullscreenElement||document.webkitFullscreenElement))(document.exitFullscreen||document.webkitExitFullscreen).call(document).catch(()=>{})}
function barLekat(){BLY=0;const h=$('#view > .rh')||$('#view > .bar [data-rs]')?.closest('.bar');if(!h)return;h.classList.add('lekat');
 mbacaCek()}
{const v=$('#view');['touchmove','wheel','keydown'].forEach(n=>v.addEventListener(n,()=>BLU=Date.now(),{passive:true}));
 v.addEventListener('scroll',()=>{const h=$('#view > .lekat');if(!h)return;const y=v.scrollTop,d=y-BLY;h.classList.toggle('lyg',y>4);if(Math.abs(d)>6){if(Date.now()-BLU<400)h.classList.toggle('smb',d>0&&y>140&&!h.contains(document.activeElement));else if(d<0)h.classList.remove('smb');BLY=y}},{passive:true})}
addEventListener('hashchange',route);
route();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
/* Versi baru terpasang (service worker berganti): muat ulang sekali agar tampilan langsung memakai kode terbaru, tanpa perlu buka-tutup aplikasi */
if('serviceWorker'in navigator&&navigator.serviceWorker.controller){let sdh=0;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(sdh||$('.back-d'))return;sdh=1;location.reload()})}
