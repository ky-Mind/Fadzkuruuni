/* js/core/android.js - Bila dibuka di aplikasi Android Fadzkuruuni (native, WebView sendiri), fitur yang tidak ada di WebView
   dialihkan ke Android asli lewat window.FadzAndroid (MainActivity.Jembatan di proyek fadzkuruuni-android):
   izin aplikasi, pengingat adzan (alarm Android, tetap jalan walau aplikasi ditutup), suara pembaca, unduhan, bagikan,
   layar penuh, warna bilah status, dan masuk Google (lewat tab Chrome aman). Di browser biasa berkas ini tidak berbuat apa-apa. */
const ANDROID=!!window.FadzAndroid;window.ANDROID=ANDROID;
const andPanggil=(f,...a)=>{try{return window.FadzAndroid[f](...a)}catch(e){}};
/* Warna bilah status & navigasi HP mengikuti latar halaman (tema terang/gelap/biru) */
function androidWarna(){if(!ANDROID)return;const bg=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#ffffff';andPanggil('warnaBar',bg,bg)}
/* Izin: status dari Android ('granted' | 'denied' | 'prompt'), permintaan menunggu hasil dari Android */
const andIzinStatus=()=>{try{return JSON.parse(window.FadzAndroid.statusIzin()||'{}')}catch(e){return {}}};
const andIzinTunggu={};
window.fadzIzinHasil=(n,st)=>{const f=andIzinTunggu[n];delete andIzinTunggu[n];f&&f(st)};
/* Bila Android membuka layar pengaturan (izin pernah ditolak) jawaban tidak datang: setelah kembali ke aplikasi atau 20 detik, pakai status terbaru */
const andMintaIzin=n=>new Promise(ok=>{let sdh=0;const sel=st=>{if(sdh)return;sdh=1;delete andIzinTunggu[n];document.removeEventListener('visibilitychange',vis);ok(st)};
 const vis=()=>{if(!document.hidden)setTimeout(()=>sel(andIzinStatus()[n]),600)};andIzinTunggu[n]=sel;document.addEventListener('visibilitychange',vis);
 andPanggil('mintaIzin',n);setTimeout(()=>sel(andIzinStatus()[n]),n=='alarm'?400:20000)});
/* Suara pembaca selesai */
window.fadzTtsSelesai=()=>{try{if(AITTS&&AITTS.android){clearTimeout(AITTS.tunggu);AITTS=null;aiTtsUI()}}catch(e){}};
/* Mesin suara HP mulai berbicara / gagal (tidak ada mesin, tanpa suara Indonesia, galat): gagal → suara server */
window.fadzTtsMulai=()=>{try{if(AITTS&&AITTS.android)AITTS.mulai=1}catch(e){}};
window.fadzTtsGagal=()=>{try{if(AITTS&&AITTS.android&&!AITTS.mulai){const {t,i}=AITTS;aiAwan(t,i)}}catch(e){}};
/* Masuk Google: token dari tab Chrome diteruskan ke Firebase di aplikasi */
/* Pesan bila masuk Facebook gagal (aplikasi Facebook masih menunggu verifikasi Meta) */
const FBGAGAL='Masuk dengan Facebook belum tersedia untuk semua akun (sedang diverifikasi Meta). Pakai Google atau Email dulu.';
window.fadzMasuk=async(p,id,at)=>{try{if(typeof fbInit=='function')await fbInit();for(let k=0;k<40&&!(window.firebase&&firebase.auth);k++)await new Promise(r=>setTimeout(r,250));
 const c=p=='fb'?firebase.auth.FacebookAuthProvider.credential(at):firebase.auth.GoogleAuthProvider.credential(id||null,at||null);await firebase.auth().signInWithCredential(c);toast('Berhasil masuk dengan '+(p=='fb'?'Facebook':'Google'))}catch(e){toast(e.code=='auth/account-exists-with-different-credential'?'Email ini sudah terdaftar lewat cara masuk lain. Masuk dengan Google dulu.':p=='fb'?FBGAGAL:'Gagal masuk: '+(e.code||e.message))}};
window.fadzMasukGoogle=async(id,at)=>{try{if(typeof fbInit=='function')await fbInit();for(let k=0;k<40&&!(window.firebase&&firebase.auth);k++)await new Promise(r=>setTimeout(r,250));
 await firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(id||null,at||null));toast('Berhasil masuk dengan Google')}catch(e){toast('Gagal masuk: '+(e.code||e.message))}};
/* Pengingat adzan: jadwal 30 hari ke depan dikirim ke Android (alarm terdekat dipasang berantai), agar adzan tetap
   berbunyi walau aplikasi lama tidak dibuka. Dikirim ulang bila pengaturan/lokasi berubah. */
let andAdzanSig='';
/* Jenis alarm per waktu salat; APK lama (tanpa versiAdzan) belum mengenal 'senyap' & suara per waktu */
const andJenis=k=>{const md=azMode(k),v2=window.FadzAndroid&&FadzAndroid.versiAdzan,az=S.az;
 if(az.sound===false||md=='bunyi'||!v2&&(md=='senyap'||md=='beduk'||md=='alarm'))return {jenis:'pengingat'};
 if(md=='senyap')return {jenis:'senyap'};if(md=='beduk'||md=='alarm')return {jenis:'adzan',suara:md};
 return {jenis:k==0?'subuh':'adzan',suara:v2?azSuara(k):''}};
function androidAdzan(){if(!ANDROID)return;const az=S.az||{},sig=JSON.stringify([az.on,az.pre,az.w,az.m,az.v,az.sound,az.dh,S.loc,S.kor,new Date().toDateString()]);if(sig==andAdzanSig)return;andAdzanSig=sig;
 const L=[];if(az.on){const tz=S.loc.tz??-new Date().getTimezoneOffset()/60,pre=+az.pre||0,kor=(S.kor||0)/60;
  for(let d=0;d<30;d++){const h=new Date();h.setDate(h.getDate()+d);const T=waktu(h,S.loc),dasar=Date.UTC(h.getFullYear(),h.getMonth(),h.getDate());
   if(azMode(5)!='mati')L.push({t:dasar+(T[1][1]-tz-kor)*36e5,judul:'Matahari terbit',isi:'Waktu Subuh telah berakhir. Wilayah '+S.loc.n,...andJenis(5)});
   if(az.dh&&T.duha!=null)L.push({t:dasar+(T.duha-tz-kor)*36e5,judul:'Waktu Duha telah masuk',isi:'Waktu salat Duha untuk wilayah '+S.loc.n+', hingga menjelang Zuhur',jenis:'pengingat'});
   WI.forEach((wi,k)=>{if(!az.w[k])return;const jam=T[wi][1],t=dasar+(jam-tz-kor)*36e5;
    if(pre)L.push({t:t-pre*6e4,judul:'Menjelang '+WS[k],isi:pre+' menit lagi masuk waktu '+WS[k]+' ('+S.loc.n+')',jenis:'pengingat'});
    L.push({t,judul:'Waktu '+WS[k]+' telah tiba',isi:'Untuk wilayah '+S.loc.n+' dan sekitarnya',...andJenis(k)})})}}
 L.sort((a,b)=>a.t-b.t);andPanggil('jadwalAdzan',JSON.stringify(L.filter(x=>x.t>Date.now())))}
/* Data widget layar utama: jadwal 6 waktu hari ini s.d. lusa (jam & waktu epoch), lokasi, tanggal, dan kata-kata Beranda */
let andWidSig='';
function androidWidget(){if(!ANDROID||!window.FadzAndroid.jadwalWidget)return;const tz=S.loc.tz??-new Date().getTimezoneOffset()/60,kor=(S.kor||0)/60,H=[];
 const DH=[];for(let d=0;d<3;d++){const h=new Date();h.setDate(h.getDate()+d);const T=waktu(h,S.loc),dasar=Date.UTC(h.getFullYear(),h.getMonth(),h.getDate());H.push(T.map(x=>[x[0],hm(x[1]),Math.round(dasar+(x[1]-tz-kor)*36e5)]));DH.push(T.duha!=null?hm(T.duha):'')}
 const n=new Date(),o={lok:S.loc.n,zona:tzl(),tgl:n.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})+' / '+(typeof hf=='function'?hf(n,{day:'numeric',month:'long',year:'numeric'}):hijri(n)),h:H,dh:DH,kata:(typeof QA=='function'?QA():[]).map(q=>[q.t,q.p||'any']).slice(0,60)},sig=JSON.stringify([S.loc,S.kor,n.toDateString(),o.kata.length]);
 if(sig==andWidSig)return;andWidSig=sig;andPanggil('jadwalWidget',JSON.stringify(o))}
if(ANDROID){document.documentElement.classList.add('android');androidWarna();androidAdzan();
 /* Pilihan suara adzan disamakan ke Android (dipakai pemutar adzan) */
 andPanggil('aturSuara','adzan',S.az.sa||'bawaan');andPanggil('aturSuara','subuh',S.az.ss||'bawaan');setInterval(androidAdzan,15000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){andAdzanSig='';androidAdzan();andWidSig='';androidWidget()}});
 /* Sekali: minta izin "jalan di latar belakang" (pengecualian hemat baterai). Tanpa ini banyak HP (OPPO, Realme, Xiaomi, Vivo)
    menahan atau membatalkan alarm adzan saat aplikasi ditutup dan layar mati. */
 setTimeout(()=>{if(!S.az.on||S.batTanya||!window.FadzAndroid.ujiAdzan||andIzinStatus().baterai!='prompt'||$('.back-d'))return;S.batTanya=1;save();
  konfirmasi('Agar adzan tetap berbunyi','Izinkan Fadzkuruuni berjalan di latar belakang, supaya HP tidak menahan pengingat adzan saat aplikasi ditutup dan layar mati.','Izinkan',()=>andMintaIzin('baterai'))},6000)}
