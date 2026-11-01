/* js/core/events.js - Pendengar peristiwa bersama (klik, input, geser) */
let tx=0,ty=0;
addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)<70||Math.abs(dy)>50||e.target.closest('input,.cal,.car'))return;const T=$$('[data-tab]'),h=location.hash.split('/');
 if(T.length>1){const i=T.findIndex(b=>b.classList.contains('on'));T[i+(dx<0?1:-1)]?.click()}},{passive:true});
document.addEventListener('click',e=>{const c=e.target.closest('[data-copy]');if(c){const v=c.dataset.copy;(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast(v.length>30?'Teks disalin':'Disalin: '+v),()=>toast('Tidak bisa menyalin. Salin manual.'));return}
 const b=e.target.closest('[data-bm]');if(b){const k=b.dataset.bm;S.bm=S.bm||[];const i=S.bm.indexOf(k);i<0?S.bm.unshift(k):S.bm.splice(i,1);save();b.classList.toggle('on',i<0);toast(i<0?'Ayat ditandai':'Penanda dihapus')}});
document.addEventListener('input',e=>{const c=e.target.closest('[data-calc]');if(!c)return;const g=k=>parseFloat((c.querySelector(`[data-k=${k}]`)?.value||'').replace(',','.'))||0,o=c.querySelector('.cres'),t=c.dataset.calc;if(!g('h'))return o.textContent='Isi harga per kg terlebih dahulu.';const kg=t=='fitrah'?g('j')*2.5:g('j')*g('d')*.6;o.innerHTML=`<b>${rp(kg*g('h'))}</b><br><small class="mut">${kg.toFixed(2).replace('.',',')} kg makanan pokok</small>`});
document.addEventListener('click',e=>{const t=e.target;
 if(t.closest('[data-loc]'))return lsheet();
 const z=t.closest('[data-z]');if(z){S.fs=Math.max(22,Math.min(56,S.fs+ +z.dataset.z));save();$$('#view .ay .ar,#view .ay2 .ar,#view .ar2,#view .mushaf').forEach(x=>x.style.fontSize=S.fs+'px');$$('.zb b').forEach(b=>b.textContent=S.fs);return}
 if(t.closest('[data-nb]')){S.nb=1;save();t.closest('.note').remove();return}
 const l=t.closest('[data-lanjut]');if(l){const c=l.closest('[data-pay]'),r=c.querySelector('input[name=pm]:checked'),b=BANK[r?+r.value:0],nom=(c.querySelector('[data-nom]').value||'').replace(/\D/g,'');(navigator.clipboard?navigator.clipboard.writeText(b[1]):Promise.reject()).catch(()=>{});msheet('Pembayaran langsung segera hadir',`<p>Fitur lanjut pembayaran langsung ke aplikasi ${b[0]} masih dalam tahap pengembangan.</p><p>Nomor tujuan <b>${b[1]}</b> (${b[0]}) ${nom?'dengan nominal <b>'+rp(nom)+'</b> ':''}sudah disalin. Silakan buka aplikasi ${b[0]} atau bank pilihanmu, lalu tempel nomor tersebut.</p>`)}});
document.addEventListener('click',async e=>{const t=e.target;
 if(t.closest('[data-rs]'))return qsheet(()=>route());
 if(t.closest('[data-stop]'))return stopAdzan();
 if(t.closest('[data-tsub]'))return play(0);
 if(t.closest('[data-notif]')){await askNotif();return permFill()}
 const gi=t.closest('[data-gin]');if(gi){const fb=gi.dataset.gin=='fb',nm=fb?'Facebook':'Google';if(!window.firebase||!firebase.auth)return toast('Butuh internet untuk masuk dengan '+nm);const pr=fb?new firebase.auth.FacebookAuthProvider():new firebase.auth.GoogleAuthProvider();return firebase.auth().signInWithPopup(pr).catch(err=>{const c=err.code||'';if(c=='auth/popup-blocked'||c=='auth/operation-not-supported-in-this-environment')return firebase.auth().signInWithRedirect(pr);toast(c=='auth/unauthorized-domain'?'Domain ini belum diizinkan di Firebase (Authentication > Settings > Authorized domains)':c=='auth/popup-closed-by-user'?'Masuk dibatalkan':c=='auth/operation-not-allowed'||c=='auth/configuration-not-found'?'Masuk dengan '+nm+' belum diaktifkan oleh pengelola aplikasi':c=='auth/account-exists-with-different-credential'?'Email ini sudah terdaftar lewat cara masuk lain. Coba masuk dengan Google.':'Gagal masuk: '+c)})}
 if(t.closest('[data-gout]'))return konfirmasi('Keluar dari akun?','Data di perangkat tetap tersimpan. Kamu bisa masuk lagi kapan saja.','Keluar',()=>firebase.auth().signOut().then(()=>{FBU=null;route()}));
 if(t.closest('[data-nsave]')){S.nm=($('#nm').value||'').trim().slice(0,24);save();return toast(S.nm?'Nama disimpan':'Nama dikosongkan')}
 if(t.closest('[data-ndel]')){S.nm='';save();$('#nm').value='';return toast('Nama dihapus')}
 if(t.closest('[data-addq]')){const v=($('#qn').value||'').trim();if(!v)return toast('Tulis kata-katanya dulu');QA().push({t:v,p:'any'});save();return route()}
 const qe=t.closest('[data-qe]');if(qe){QEDIT=+qe.dataset.qe;return route()}
 if(t.closest('[data-qc]')){QEDIT=-1;return route()}
 const qs=t.closest('[data-qs]');if(qs){const v=($('#qv').value||'').trim();if(!v)return toast('Teks tidak boleh kosong');QA()[+qs.dataset.qs].t=v;QEDIT=-1;save();return route()}
 const qd=t.closest('[data-qd]');if(qd){QA().splice(+qd.dataset.qd,1);save();return route()}
 if(t.closest('[data-qr]')){S.qa=null;QA();save();return route()}});
/* Sembunyikan / tampilkan sidebar (desktop): tombol di sidebar atau Ctrl+B */
document.addEventListener('click',e=>{if(!e.target.closest('[data-sbt]'))return;S.sb=S.sb===false;save();applyNav()});
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&!e.altKey&&e.key.toLowerCase()=='b'&&!e.target.closest('input,textarea')){e.preventDefault();$('[data-sbt]').click()}});
/* Halaman bernavigasi bagian (.pnav, lihat pnav di js/core/ui.js): geser kiri-kanan untuk pindah bagian.
   Isi mengikuti jari; dilepas cukup jauh (atau dikibas cepat) berpindah, kurang dari itu kembali ke tempat. */
const pDir=d=>document.documentElement.dataset.vt=d>0?'fwd':'back';
document.addEventListener('click',e=>{const a=e.target.closest('.pnav a,.bk');if(!a)return;pDir(a.matches('[data-nx]')?1:-1);
 /* Tombol kembali: bila ada halaman sebelumnya di aplikasi, kembali ke sana (bukan langsung ke induk tetap) */
 if(a.matches('.bk')&&RIW.length>1&&!/^javascript:/.test(a.getAttribute('href')||'')){e.preventDefault();history.back()}});
let gx=0,gy=0,gt=0,gh=0,gv=null;
const gGeserX=t=>{for(let e=t;e&&e.id!='view';e=e.parentElement)if(e.scrollWidth>e.clientWidth+2&&/auto|scroll/.test(getComputedStyle(e).overflowX))return true;return false};
const gLink=dx=>$(dx<0?'#view .pnav [data-nx]':'#view .pnav [data-pv]');
addEventListener('touchstart',e=>{gv=null;if(e.touches.length>1||!$('#view .pnav')||e.target.closest('input,textarea,.sheet,#ftb,.tdlap,.tdbar')||gGeserX(e.target))return;gv=$('#view');gx=e.touches[0].clientX;gy=e.touches[0].clientY;gt=Date.now();gh=0},{passive:true});
addEventListener('touchmove',e=>{if(!gv)return;if(e.touches.length>1){gh=-1;gv.style.transform='';return}const dx=e.touches[0].clientX-gx,dy=e.touches[0].clientY-gy;if(!gh&&Math.abs(dx)>10)gh=Math.abs(dx)>Math.abs(dy)*1.3?1:-1;if(gh!=1)return;
 const r=gLink(dx)?dx*.55:dx*.12;gv.style.transition='none';gv.style.transform=`translateX(${r}px)`;gv.style.opacity=1-Math.min(Math.abs(r)/700,.35)},{passive:true});
addEventListener('touchend',e=>{if(!gv||gh!=1)return;const v=gv;gv=null;const dx=e.changedTouches[0].clientX-gx,cepat=Math.abs(dx)>40&&Date.now()-gt<250,L=gLink(dx);
 if(L&&(Math.abs(dx)>80||cepat)){pDir(dx<0?1:-1);location.hash=L.getAttribute('href');return}
 v.style.transition='transform .3s cubic-bezier(.22,.8,.3,1),opacity .3s';v.style.transform='';v.style.opacity=''},{passive:true});
addEventListener('keydown',e=>{if(!$('#view .pnav')||e.target.closest('input,textarea,select')||e.altKey||e.ctrlKey||e.metaKey)return;const L=e.key=='ArrowRight'?$('#view .pnav [data-nx]'):e.key=='ArrowLeft'?$('#view .pnav [data-pv]'):null;if(L){pDir(e.key=='ArrowRight'?1:-1);location.hash=L.getAttribute('href')}});
/* Tarik ke bawah dari puncak halaman untuk memuat ulang: ikon berputar mengikuti tarikan, dilepas lewat batas lalu memuat ulang */
const ptr=mk('',ic('rot',20));ptr.id='ptr';ptr.setAttribute('aria-hidden','true');
let py=0,px=0,pt=0,pon=0;
const ptrSet=(y,a)=>{ptr.style.transform=`translate(-50%,${y}px) rotate(${a}deg)`;ptr.style.opacity=Math.min(1,Math.max(0,(y+44)/60))};
addEventListener('touchstart',e=>{pon=0;const v=$('#view');if(e.touches.length>1||!v||v.scrollTop>0||ptr.classList.contains('muter')||e.target.closest('.back-d,.sheet,#ftb,#ftp,.tdlap,.tdbar,input,textarea,select'))return;pon=1;pt=0;py=e.touches[0].clientY;px=e.touches[0].clientX;ptr.style.transition='none'},{passive:true});
addEventListener('touchmove',e=>{if(!pon)return;const d=e.touches[0].clientY-py,dx=e.touches[0].clientX-px;if($('#view').scrollTop>0||(pt==0&&Math.abs(dx)>Math.abs(d))){pon=0;ptrSet(-44,0);return}
 pt=Math.max(0,Math.min(d*.5,120));ptrSet(pt-44,pt*3.2);ptr.classList.toggle('siap',pt>72)},{passive:true});
addEventListener('touchend',()=>{if(!pon)return;pon=0;ptr.style.transition='transform .3s cubic-bezier(.22,.8,.3,1),opacity .3s';
 if(pt>72){ptr.classList.add('muter');ptrSet(28,0);setTimeout(()=>location.reload(),650)}else{ptrSet(-44,0);ptr.classList.remove('siap')}},{passive:true});
/* Cegah salin, potong, seret, dan menu klik kanan pada isi aplikasi; kolom isian tetap bisa diketik dan ditempel */
const bebasSalin=e=>e.target.closest&&e.target.closest('input,textarea,[contenteditable]');
['copy','cut','dragstart','contextmenu','selectstart'].forEach(t=>document.addEventListener(t,e=>{if(!bebasSalin(e))e.preventDefault()}));
