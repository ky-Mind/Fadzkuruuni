/* js/core/adzan.js - Adzan, notifikasi, izin */
const WS=['Subuh','Zuhur','Asar','Magrib','Isya'],WI=[0,2,3,4,5];
/* Pengingat adzan menyala bawaan (sekali dinyalakan juga untuk pengguna lama yang belum pernah mengubahnya: S.azv) */
S.az=Object.assign({on:true,sound:true,pre:0,w:[1,1,1,1,1]},S.az||{});
if(!S.azv){S.az.on=true;S.azv=1;try{save()}catch(e){}}
const beep=()=>{try{const c=new(window.AudioContext||window.webkitAudioContext)(),t=c.currentTime;[0,.35,.7].forEach(d=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=660;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.2,t+d);g.gain.exponentialRampToValueAtTime(.001,t+d+.3);o.start(t+d);o.stop(t+d+.3)})}catch(e){}};
let ADZ=null;
const stopAdzan=()=>{if(ADZ){ADZ.pause();ADZ=null}};
/* Pilihan suara adzan: bawaan, beberapa muadzin (rekaman berlisensi bebas dari Wikimedia Commons, lihat lisensi/ATRIBUSI-ADZAN.txt),
   atau rekaman/berkas sendiri (disimpan di IndexedDB; di Android juga disalin ke aplikasi agar dipakai alarm adzan) */
const SUARA=[['bawaan','Bawaan aplikasi'],['makkah','Masjidil Haram, Makkah'],['merdu','Adzan merdu'],['syam','Sabah Fakhri (Syam)'],['aaqib','Aaqib Azeez'],['istanbul','Istanbul'],['subuh-malmo','Adzan Subuh (Masjid Malmö)'],['sendiri','Rekaman / berkas sendiri']];
const idbBuka=()=>new Promise((ok,no)=>{const r=indexedDB.open('fz-suara',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const idbSimpan=async(k,v)=>{const d=await idbBuka();return new Promise((ok,no)=>{const t=d.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=ok;t.onerror=()=>no(t.error)})};
const idbAmbil=async k=>{try{const d=await idbBuka();return await new Promise(ok=>{const q=d.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>ok(q.result||null);q.onerror=()=>ok(null)})}catch(e){return null}};
const suaraPilih=j=>(j=='subuh'?S.az.ss:S.az.sa)||'bawaan';
const suaraSrc=async j=>{const p=suaraPilih(j);if(p=='sendiri'){const b=await idbAmbil('suara_'+j);if(b)return URL.createObjectURL(b)}
 return p=='bawaan'||p=='sendiri'?(j=='subuh'?'audio/adzan-subuh.mp3':'audio/adzan.mp3'):'audio/adzan/'+p+'.mp3'};
const putarSuara=src=>{stopAdzan();ADZ=new Audio(src);ADZ.onerror=beep;ADZ.play?.().catch(beep)};
const play=(k=1,uji)=>{if(!S.az.sound||(window.ANDROID&&!uji))return;suaraSrc(k==0?'subuh':'adzan').then(putarSuara)};
const notify=async(t,b)=>{if(window.ANDROID)return;if(!('Notification'in window)||Notification.permission!='granted')return;try{const r=await navigator.serviceWorker.ready;r.showNotification(t,{body:b,icon:'img/apple-touch-icon.png',badge:'img/badge-96.png',tag:'adzan',vibrate:[200,100,200]})}catch(e){new Notification(t,{body:b})}};
const askNotif=async()=>{if(typeof ANDROID!='undefined'&&ANDROID){if(andIzinStatus().notifications=='granted')return true;const st=await andMintaIzin('notifications');toast(st=='granted'?'Notifikasi diizinkan':'Notifikasi belum diizinkan. Buka Pengaturan aplikasi > Izin.');androidAdzan();return st=='granted'}if(!('Notification'in window)){toast('Browser tidak mendukung notifikasi');return false}const r=await Notification.requestPermission();toast(r=='granted'?'Notifikasi diizinkan':'Izin ditolak. Aktifkan lewat pengaturan situs di browser.');return r=='granted'};
/* Uji notifikasi: di aplikasi Android memakai notifikasi Android asli (melayang dari atas, dengan suara adzan); di browser memakai notifikasi web + suara */
/* Hasil uji di Android: bila tidak bisa tampil, jelaskan sebabnya dan tawarkan membuka pengaturan notifikasi */
const NOTIFSEBAB={izin:'Izin notifikasi belum diberikan untuk Fadzkuruuni.',mati:'Notifikasi Fadzkuruuni sedang dimatikan di pengaturan HP.','kanal-mati':'Kategori notifikasi ini (Adzan/Pengingat) dimatikan di pengaturan HP.'};
const ujiNotif=async subuh=>{if(window.ANDROID){const h=andPanggil('ujiNotifikasi',subuh?'Tes adzan Subuh':'Tes notifikasi','Pengingat adzan Fadzkuruuni berfungsi.',subuh?'subuh':S.az.sound?'adzan':'pengingat');
  if(h=='ok'||h===undefined)return toast(h=='ok'?'Notifikasi tes dikirim. Lihat bagian atas layar.':'Notifikasi tes dikirim. Bila tidak muncul, perbarui aplikasi ke versi terbaru.');
  if(h=='izin'&&await askNotif())return ujiNotif(subuh);
  return konfirmasi('Notifikasi belum bisa muncul',(NOTIFSEBAB[h]||'Terjadi kesalahan: '+h)+' Buka pengaturan, nyalakan Notifikasi, termasuk "Adzan", "Adzan Subuh", "Pengingat menjelang salat", serta "Notifikasi mengambang/pop-up" bila ada.','Buka pengaturan',()=>andPanggil('bukaPengaturanNotif'))}
 if(!await askNotif())return;
 notify(subuh?'Tes adzan Subuh':'Tes notifikasi','Pengingat adzan Fadzkuruuni berfungsi.');play(subuh?0:1,1)};
let fired='';
setInterval(()=>{if(!S.az.on)return;const n=new Date(),T=waktu(n,S.loc),mm=Math.floor(locNow()*60),pre=+S.az.pre;WI.forEach((wi,k)=>{if(!S.az.w[k])return;const m=Math.round(T[wi][1]*60)%1440;[[m-pre,1],[m,0]].forEach(([x,isPre])=>{if(isPre&&!pre)return;const key=n.toDateString()+WS[k]+isPre;if(x==mm&&!fired.includes(key)){fired+=key+'|';isPre?notify('Menjelang '+WS[k],pre+' menit lagi masuk waktu '+WS[k]+' ('+S.loc.n+')'):(notify('Waktu '+WS[k]+' telah tiba','Untuk wilayah '+S.loc.n+' dan sekitarnya'),play(k))}})})},5000);
const bdg=n=>`<span class="bdg" data-perm="${n}">…</span>`;
const IZST={granted:'Diizinkan',denied:'Ditolak',prompt:'Belum diminta'};
async function permFill(){const AI=typeof ANDROID!='undefined'&&ANDROID?andIzinStatus():null;for(const el of $$('[data-perm]')){const n=el.dataset.perm;let s='Belum diminta';if(AI&&(n in AI||n=='persistent-storage')){s=n=='persistent-storage'?'Diizinkan':IZST[AI[n]]||s;el.textContent=s;el.className='bdg '+(s=='Diizinkan'?'':s=='Ditolak'?'no':'mid');continue}try{const r=await navigator.permissions.query({name:n});s={granted:'Diizinkan',denied:'Ditolak',prompt:'Belum diminta'}[r.state]||s}catch(e){if(n=='notifications'&&'Notification'in window)s={granted:'Diizinkan',denied:'Ditolak',default:'Belum diminta'}[Notification.permission]||s}el.textContent=s;el.className='bdg '+(s=='Diizinkan'?'':s=='Ditolak'?'no':'mid')}}
