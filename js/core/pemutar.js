/* js/core/pemutar.js - Pemutar murottal global (tetap berbunyi saat pindah halaman, layar mati, atau aplikasi ditutup ke latar).
   - Antrian Al-Qur'an per ayat (Syaikh Mishary Alafasy, everyayah.com; berkas tersimpan offline ikut dipakai lewat service worker).
     Bisa diputar satu ayat, sampai akhir surah, atau terus lintas surah sampai surah/juz pilihan (PM.akhir = {n, a}).
   - Kapsul kecil #qmini di semua halaman: sebelumnya · jeda/lanjut · berikutnya, judul (ketuk = buka surahnya), dan ×.
   - Kontrol media di luar aplikasi: Media Session (notifikasi media & layar kunci di Chrome/PWA, tombol headset/Bluetooth),
     dan di aplikasi Android lewat layanan latar AudioLayanan (FadzAndroid.mediaInfo/mediaHenti), yang memanggil kembali window.fzMedia(aksi).
   Halaman surah menyorot ayat yang sedang dibaca lewat peristiwa 'fzpemutar'. */
const PM={n:0,i:0,L:[],akhir:null,satu:0,au:null};
const pmAud=(n,a)=>`https://everyayah.com/data/Alafasy_128kbps/${String(n).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`;
/* Berkas satu surah: bismillah (001001) di depan, kecuali Al-Fatihah dan At-Taubah */
const pmDaftar=n=>[...(n!=1&&n!=9?[pmAud(1,1)]:[]),...Array.from({length:AYAT[n-1]},(_,i)=>pmAud(n,i+1))];
const pmGeser=n=>n!=1&&n!=9?1:0;
/* Nomor ayat yang sedang diputar (0 = bismillah pembuka) */
const pmAyat=()=>PM.L.length?PM.i-pmGeser(PM.n)+1:0;
const pmAktif=()=>!!PM.L.length;
function pmAudio(){if(PM.au)return PM.au;const a=PM.au=new Audio();a.preload='auto';a.id='pmau';
 a.onended=()=>pmLanjut(1,1);
 a.onerror=()=>{if(!pmAktif()||!a.getAttribute('src'))return;if(navigator.onLine===false){toast('Audio ayat ini belum tersimpan dan internet tidak tersedia');return pmHenti()}pmLanjut(1,1)};
 a.onplay=a.onpause=()=>pmTampil();return a}
/* Mulai memutar Al-Qur'an dari surah n ayat k. o.satu = hanya ayat itu; o.akhir = {n,a} titik berhenti (bawaan: akhir surah n) */
function pmQuran(n,k,o){o=o||{};PM.n=n;PM.L=pmDaftar(n);PM.satu=o.satu?k:0;PM.akhir=o.satu?{n,a:k}:(o.akhir||{n,a:AYAT[n-1]});
 /* Diputar dari ayat 1: bismillah dibaca dulu */
 pmKe(k<=1?0:k-1+pmGeser(n))}
function pmKe(i){const a=pmAudio();PM.i=i;a.src=PM.L[i];a.playbackRate=a.defaultPlaybackRate=S.pmSpd||1;a.play().catch(()=>{});pmTampil()}
/* Kecepatan murottal: 0,75× · 1× · 1,25× · 1,5× (diingat) */
document.addEventListener('click',e=>{if(!e.target.closest||!e.target.closest('[data-pmsp]'))return;const L=[1,1.25,1.5,0.75],v=L[(L.indexOf(S.pmSpd||1)+1)%L.length];S.pmSpd=v;save();const a=pmAudio();a.playbackRate=a.defaultPlaybackRate=v;pmTampil();toast('Kecepatan murottal '+String(v).replace('.',',')+'×')});
/* d = 1 berikutnya / -1 sebelumnya. otomatis = selesai satu ayat (bukan ditekan pengguna) */
function pmLanjut(d,otomatis){if(!pmAktif())return;const k=pmAyat(),A=PM.akhir;
 if(d>0){if(PM.satu&&otomatis)return pmHenti();
  if(otomatis&&A&&PM.n==A.n&&k>=A.a)return pmHenti(true);
  if(PM.i+1<PM.L.length)return pmKe(PM.i+1);
  if(PM.n<114&&(!A||PM.n<A.n||!otomatis)){const m=PM.n+1;PM.n=m;PM.L=pmDaftar(m);if(A&&m>A.n)PM.akhir={n:m,a:AYAT[m-1]};return pmKe(0)}
  return pmHenti(true)}
 /* Sebelumnya: lebih dari 3 detik berjalan = ulang ayat ini; selain itu ayat sebelumnya (bisa ke surah sebelumnya) */
 const a=pmAudio();if(a.currentTime>3)return pmKe(PM.i);
 if(PM.i>0)return pmKe(PM.i-1);
 if(PM.n>1){const m=PM.n-1;PM.n=m;PM.L=pmDaftar(m);return pmKe(PM.L.length-1)}pmKe(0)}
function pmHenti(selesai){const a=PM.au;if(a){a.pause();a.removeAttribute('src');try{a.load()}catch(e){}}PM.L=[];PM.i=0;PM.satu=0;PM.akhir=null;pmTampil();if(selesai===true)toast('Murottal selesai')}
const pmJeda=()=>{const a=pmAudio();if(!pmAktif())return;a.paused?a.play().catch(()=>{}):a.pause()};
const pmJudul=()=>{if(!pmAktif())return '';const k=pmAyat();return NAMA[PM.n-1]+(k>0?' · ayat '+k:' · bismillah')};
const pmSub=()=>{if(!pmAktif())return '';const A=PM.akhir;return 'Murottal Mishary Alafasy'+(PM.satu?'':A&&(A.n!=PM.n||A.a!=AYAT[PM.n-1])?' · sampai '+NAMA[A.n-1]+(A.a!=AYAT[A.n-1]?' ayat '+A.a:''):' · sampai akhir surah')};
/* Tampilan: kapsul, Media Session, notifikasi Android, dan sorotan ayat di halaman surah */
function pmTampil(){const on=pmAktif(),a=PM.au,main=!!(a&&on&&!a.paused);
 let m=$('#qmini');if(!m&&on){m=document.createElement('div');m.id='qmini';m.className='qmini pm';document.body.append(m);
  m.innerHTML=`<button class="ib2" data-pm="-1" aria-label="Ayat sebelumnya">${ic('back',16)}</button><button class="ib" data-pm="0" aria-label="Jeda"></button><button class="ib2" data-pm="1" aria-label="Ayat berikutnya">${ic('next',16)}</button><a class="pmt" data-pmbuka><b></b><small></small></a><button class="ib2 pmsp" data-pmsp aria-label="Kecepatan murottal"></button><button class="ib2" data-pm="x" aria-label="Hentikan murottal">×</button>`}
 if(m){m.hidden=!on;if(on){const b=m.querySelector('[data-pm="0"]');b.innerHTML=ic(main?'pause':'play',18);b.setAttribute('aria-label',main?'Jeda':'Lanjutkan');m.querySelector('.pmt b').textContent=pmJudul();m.querySelector('.pmt small').textContent=pmSub();m.querySelector('.pmsp').textContent=String(S.pmSpd||1).replace('.',',')+'×';m.querySelector('.pmt').href='#/quran/'+PM.n+(pmAyat()>1?'/'+pmAyat():'')}}
 if('mediaSession'in navigator){try{if(on){navigator.mediaSession.metadata=new MediaMetadata({title:pmJudul(),artist:'Syaikh Mishary Rashid Alafasy',album:"Al-Qur'an · Fadzkuruuni",artwork:[{src:'img/icon-512.png',sizes:'512x512',type:'image/png'}]});navigator.mediaSession.playbackState=main?'playing':'paused'}else{navigator.mediaSession.metadata=null;navigator.mediaSession.playbackState='none'}}catch(e){}}
 if(window.ANDROID&&window.FadzAndroid&&FadzAndroid.mediaInfo){try{on?FadzAndroid.mediaInfo(pmJudul(),pmSub(),main):FadzAndroid.mediaHenti()}catch(e){}}
 dispatchEvent(new CustomEvent('fzpemutar'))}
if('mediaSession'in navigator){const h=(n,f)=>{try{navigator.mediaSession.setActionHandler(n,f)}catch(e){}};
 h('play',()=>pmAudio().play().catch(()=>{}));h('pause',()=>pmAudio().pause());h('previoustrack',()=>pmLanjut(-1));h('nexttrack',()=>pmLanjut(1));h('stop',()=>pmHenti())}
/* Tombol dari notifikasi media aplikasi Android (AudioLayanan) */
window.fzMedia=x=>{if(x=='main')pmAudio().play().catch(()=>{});else if(x=='jeda')pmAudio().pause();else if(x=='lanjut')pmLanjut(1);else if(x=='mundur')pmLanjut(-1);else if(x=='henti')pmHenti();else if(x=='tukar')pmJeda()};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pm]');if(!b)return;const v=b.dataset.pm;if(v=='0')pmJeda();else if(v=='x')pmHenti();else pmLanjut(+v)});
/* Bila sedang di halaman surah yang diputar lalu murottal pindah ke surah berikutnya, halaman ikut pindah ke surah itu */
let PMN=0;addEventListener('fzpemutar',()=>{if(!pmAktif()){PMN=0;return}if(PMN&&PMN!=PM.n&&location.hash.split('/').slice(0,3).join('/')=='#/quran/'+PMN)location.hash='#/quran/'+PM.n;PMN=PM.n});
