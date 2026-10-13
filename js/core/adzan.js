/* js/core/adzan.js - Adzan, notifikasi, izin */
const WS=['Subuh','Zuhur','Asar','Magrib','Isya'],WI=[0,2,3,4,5];
S.az=Object.assign({on:false,sound:true,pre:0,w:[1,1,1,1,1]},S.az||{});
const beep=()=>{try{const c=new(window.AudioContext||window.webkitAudioContext)(),t=c.currentTime;[0,.35,.7].forEach(d=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=660;o.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.2,t+d);g.gain.exponentialRampToValueAtTime(.001,t+d+.3);o.start(t+d);o.stop(t+d+.3)})}catch(e){}};
let ADZ=null;
const stopAdzan=()=>{if(ADZ){ADZ.pause();ADZ=null}};
const play=(k=1)=>{if(!S.az.sound)return;stopAdzan();ADZ=new Audio(k==0?'audio/adzan-subuh.mp3':'audio/adzan.mp3');ADZ.onerror=beep;ADZ.play?.().catch(beep)};
const notify=async(t,b)=>{if(!('Notification'in window)||Notification.permission!='granted')return;try{const r=await navigator.serviceWorker.ready;r.showNotification(t,{body:b,icon:'img/icon-192.png',badge:'img/icon-192.png',tag:'adzan',vibrate:[200,100,200]})}catch(e){new Notification(t,{body:b})}};
const askNotif=async()=>{if(!('Notification'in window)){toast('Browser tidak mendukung notifikasi');return false}const r=await Notification.requestPermission();toast(r=='granted'?'Notifikasi diizinkan':'Izin ditolak. Aktifkan lewat pengaturan situs di browser.');return r=='granted'};
let fired='';
setInterval(()=>{if(!S.az.on)return;const n=new Date(),T=waktu(n,S.loc),mm=Math.floor(locNow()*60),pre=+S.az.pre;WI.forEach((wi,k)=>{if(!S.az.w[k])return;const m=Math.round(T[wi][1]*60)%1440;[[m-pre,1],[m,0]].forEach(([x,isPre])=>{if(isPre&&!pre)return;const key=n.toDateString()+WS[k]+isPre;if(x==mm&&!fired.includes(key)){fired+=key+'|';isPre?notify('Menjelang '+WS[k],pre+' menit lagi masuk waktu '+WS[k]+' ('+S.loc.n+')'):(notify('Waktu '+WS[k]+' telah tiba','Untuk wilayah '+S.loc.n+' dan sekitarnya'),play(k))}})})},5000);
const bdg=n=>`<span class="bdg" data-perm="${n}">…</span>`;
async function permFill(){for(const el of $$('[data-perm]')){const n=el.dataset.perm;let s='Belum diminta';try{const r=await navigator.permissions.query({name:n});s={granted:'Diizinkan',denied:'Ditolak',prompt:'Belum diminta'}[r.state]||s}catch(e){if(n=='notifications'&&'Notification'in window)s={granted:'Diizinkan',denied:'Ditolak',default:'Belum diminta'}[Notification.permission]||s}el.textContent=s;el.className='bdg '+(s=='Diizinkan'?'':s=='Ditolak'?'no':'mid')}}
