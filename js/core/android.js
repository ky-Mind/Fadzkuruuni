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
const andMintaIzin=n=>new Promise(ok=>{andIzinTunggu[n]=ok;andPanggil('mintaIzin',n);if(n=='alarm')setTimeout(()=>ok(andIzinStatus().alarm),400)});
/* Suara pembaca selesai */
window.fadzTtsSelesai=()=>{try{if(AITTS){AITTS=null;aiTtsUI()}}catch(e){}};
/* Masuk Google: token dari tab Chrome diteruskan ke Firebase di aplikasi */
window.fadzMasukGoogle=async(id,at)=>{try{if(typeof fbInit=='function')await fbInit();for(let k=0;k<40&&!(window.firebase&&firebase.auth);k++)await new Promise(r=>setTimeout(r,250));
 await firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(id||null,at||null));toast('Berhasil masuk dengan Google')}catch(e){toast('Gagal masuk: '+(e.code||e.message))}};
/* Pengingat adzan: jadwal 7 hari ke depan dikirim ke Android (dipasang sebagai alarm). Dikirim ulang bila pengaturan/lokasi berubah. */
let andAdzanSig='';
function androidAdzan(){if(!ANDROID)return;const az=S.az||{},sig=JSON.stringify([az.on,az.pre,az.w,S.loc,S.kor,new Date().toDateString()]);if(sig==andAdzanSig)return;andAdzanSig=sig;
 const L=[];if(az.on){const tz=S.loc.tz??-new Date().getTimezoneOffset()/60,pre=+az.pre||0,kor=(S.kor||0)/60;
  for(let d=0;d<7;d++){const h=new Date();h.setDate(h.getDate()+d);const T=waktu(h,S.loc),dasar=Date.UTC(h.getFullYear(),h.getMonth(),h.getDate());
   WI.forEach((wi,k)=>{if(!az.w[k])return;const jam=T[wi][1],t=dasar+(jam-tz-kor)*36e5;
    if(pre)L.push({t:t-pre*6e4,judul:'Menjelang '+WS[k],isi:pre+' menit lagi masuk waktu '+WS[k]+' ('+S.loc.n+')',jenis:'pengingat'});
    L.push({t,judul:'Waktu '+WS[k]+' telah tiba',isi:'Untuk wilayah '+S.loc.n+' dan sekitarnya',jenis:az.sound===false?'pengingat':k==0?'subuh':'adzan'})})}}
 L.sort((a,b)=>a.t-b.t);andPanggil('jadwalAdzan',JSON.stringify(L.filter(x=>x.t>Date.now())))}
if(ANDROID){document.documentElement.classList.add('android');androidWarna();androidAdzan();setInterval(androidAdzan,15000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){andAdzanSig='';androidAdzan()}})}
