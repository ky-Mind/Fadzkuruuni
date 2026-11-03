/* js/core/events.js - Pendengar peristiwa bersama (klik, input, geser) */
/* Geser kiri/kanan untuk pindah tab (mis. Tahlil | Yasin, Menu | Kalkulator): isi ikut jari, lalu tab berikutnya masuk dari samping.
   Juga bisa dengan geser dua jari di trackpad. Tidak aktif di dalam lembar, isian, kalender, carousel, atau halaman kitab. */
let tx=0,ty=0,tAx=0,tEl=null;
const tabSemua=()=>$$('#view .tabs [data-tab]'),tabIsi=()=>$('#tb')||$('#view .tabs')?.nextElementSibling;
/* Pindah tab dengan gerak yang sama seperti geser halaman Al-Qur'an (kelas sl-out dan sl-in di css): keluar 0,17 s, masuk 0,28 s */
let tabSibuk=0;
const tabGanti=d=>{const T=tabSemua(),i=T.findIndex(b=>b.classList.contains('on')),nb=T[i+d];if(!nb||tabSibuk)return false;tabKe(nb,d);return true};
function tabKe(nb,d){const el=tabIsi();if(!el){nb.click();return}tabSibuk=1;const kurang=matchMedia('(prefers-reduced-motion:reduce)').matches;
 /* Lanjutkan dari posisi jari (bila sedang digeser) menuju posisi keluar, dengan kurva & durasi yang sama */
 const dari=el.style.transform;el.classList.remove('sl-in-l','sl-in-r');el.style.transition='';
 if(dari&&!kurang){el.style.transition='transform .17s ease-in,opacity .17s ease-in';void el.offsetWidth;el.style.transform=`translateX(${d>0?-36:36}px)`;el.style.opacity=0}else el.classList.add(d>0?'sl-out-l':'sl-out-r');
 setTimeout(()=>{nb.click();tabPil();const t=tabIsi()||el;[el,t].forEach(x=>{x.style.transition=x.style.transform=x.style.opacity='';x.classList.remove('sl-out-l','sl-out-r')});
  void t.offsetWidth;t.classList.add(d>0?'sl-in-r':'sl-in-l');setTimeout(()=>{t.classList.remove('sl-in-l','sl-in-r');tabSibuk=0},290)},kurang?0:170)}
/* Ketukan tombol tab juga memakai gerak yang sama; klik dari kode (bukan pengguna) dibiarkan lewat */
document.addEventListener('click',e=>{const b=e.target.closest('#view .tabs [data-tab]');if(!b||!e.isTrusted||b.classList.contains('on'))return;
 const T=tabSemua(),i=T.findIndex(x=>x.classList.contains('on')),k=T.indexOf(b);if(i<0||k<0)return;e.stopImmediatePropagation();e.preventDefault();if(!tabSibuk)tabKe(b,k>i?1:-1)},true);
/* Pil hijau di bilah tab meluncur ke tab yang aktif */
function tabPil(){const tb=$('#view .tabs');if(!tb)return;const T=$$('[data-tab]',tb),i=T.findIndex(b=>b.classList.contains('on'));tb.style.setProperty('--n',T.length);tb.style.setProperty('--ti',Math.max(i,0));tb.classList.add('pil')}
addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;tAx=0;tEl=tabSemua().length>1&&!e.target.closest('input,textarea,.cal,.car,.kp,.back-d,.tabs')?tabIsi():null},{passive:true});
addEventListener('touchmove',e=>{if(!tEl)return;const dx=e.touches[0].clientX-tx,dy=e.touches[0].clientY-ty;
 if(!tAx&&(Math.abs(dx)>10||Math.abs(dy)>10)){tAx=Math.abs(dx)>Math.abs(dy)*1.2?1:-1;if(tAx==1)tEl.style.willChange='transform'}if(tAx!=1)return;
 const T=tabSemua(),i=T.findIndex(b=>b.classList.contains('on')),ada=!!T[i+(dx<0?1:-1)];tEl.style.transition='none';tEl.style.transform=`translateX(${dx*(ada?.45:.12)}px)`;tEl.style.opacity=ada?1-Math.min(Math.abs(dx)/600,.35):1},{passive:true});
addEventListener('touchend',e=>{if(!tEl)return;const el=tEl;tEl=null;const dx=e.changedTouches[0].clientX-tx;
 el.style.willChange='';if(tAx==1&&Math.abs(dx)>60&&tabGanti(dx<0?1:-1))return;el.style.transition='transform .28s cubic-bezier(.22,.8,.3,1),opacity .28s cubic-bezier(.22,.8,.3,1)';el.style.transform='';el.style.opacity=''},{passive:true});
let tWx=0,tWt=0;addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<=Math.abs(e.deltaY)||tabSemua().length<2||e.target.closest('.back-d,.kp,.car'))return;
 if(Date.now()-tWt<600)return;tWx+=e.deltaX;if(Math.abs(tWx)>90){tabGanti(tWx>0?1:-1);tWx=0;tWt=Date.now()}},{passive:true});
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
 if(t.closest('[data-stop]')){if(window.ANDROID)andPanggil('hentikanAdzan');return stopAdzan()}
 if(t.closest('[data-tsub]'))return window.ANDROID?ujiNotif(1):play(0,1);
 if(t.closest('[data-notif]')){await askNotif();return permFill()}
 const gi=t.closest('[data-gin]');if(gi){const fb=gi.dataset.gin=='fb',nm=fb?'Facebook':'Google';if(window.ANDROID){if(!navigator.onLine)return toast('Butuh internet untuk masuk dengan '+nm);/* Masuk lewat tab Chrome aman (Google & Facebook tidak mengizinkan dari WebView); aplikasi lama hanya punya masukGoogle */return fb?(window.FadzAndroid.masukFacebook?andPanggil('masukFacebook'):toast('Perbarui aplikasi Fadzkuruuni untuk masuk dengan Facebook')):andPanggil('masukGoogle')}if(!window.firebase||!firebase.auth)return toast('Butuh internet untuk masuk dengan '+nm);const pr=fb?new firebase.auth.FacebookAuthProvider():new firebase.auth.GoogleAuthProvider();return firebase.auth().signInWithPopup(pr).catch(err=>{const c=err.code||'';if(c=='auth/popup-blocked'||c=='auth/operation-not-supported-in-this-environment')return firebase.auth().signInWithRedirect(pr);toast(c=='auth/unauthorized-domain'?'Domain ini belum diizinkan di Firebase (Authentication > Settings > Authorized domains)':c=='auth/popup-closed-by-user'?'Masuk dibatalkan':c=='auth/operation-not-allowed'||c=='auth/configuration-not-found'?'Masuk dengan '+nm+' belum diaktifkan oleh pengelola aplikasi':c=='auth/account-exists-with-different-credential'?'Email ini sudah terdaftar lewat cara masuk lain. Coba masuk dengan Google.':fb?FBGAGAL+' ('+c+')':'Gagal masuk: '+c)})}
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
 /* Tombol kembali: naik ke halaman induknya, seperti aplikasi pada umumnya (bukan menelusuri riwayat satu per satu) */
 if(a.matches('.bk')&&!/^javascript:/.test(a.getAttribute('href')||'')){e.preventDefault();keInduk(a.getAttribute('href'))}});
/* Pindah ke halaman induk dengan mengganti entri riwayat (tidak menambah, dan tidak pernah keluar dari aplikasi) */
function keInduk(up){pDir(-1);location.replace(up)}
/* Tombol kembali HP (aplikasi Android memanggil ini): tutup lembar/dialog atau layar penuh dulu, lalu naik ke halaman induk
   (mis. Surah → Al-Qur'an → Beranda). Di Beranda mengembalikan 'akar': aplikasi lalu meminta tekan sekali lagi untuk keluar. */
window.fadzKembali=()=>{const o=$$('.back-d');if(o.length){o[o.length-1].remove();return 'ok'}
 if(document.body.classList.contains('kfull')){kitabFull(false);return 'ok'}
 if(document.body.classList.contains('full')){fsSet(false);return 'ok'}
 const h=location.hash||'#/';if(['#','#/'].includes(h))return 'akar';
 const [r,b]=h.slice(2).split('/'),bk=$('#view .bk')?.getAttribute('href');
 let up=tataNavR().includes(r)&&!b?'#/':bk&&!/^javascript:/.test(bk)?bk:'#/';if(up==h)up='#/';
 keInduk(up);return 'ok'};
let gx=0,gy=0,gt=0,gh=0,gv=null;
const gGeserX=t=>{for(let e=t;e&&e.id!='view';e=e.parentElement)if(e.scrollWidth>e.clientWidth+2&&/auto|scroll/.test(getComputedStyle(e).overflowX))return true;return false};
const gLink=dx=>$(dx<0?'#view .pnav [data-nx]':'#view .pnav [data-pv]');
addEventListener('touchstart',e=>{gv=null;if(e.touches.length>1||!$('#view .pnav')||e.target.closest('input,textarea,.sheet,#ftb,.tdlap,.tdbar')||gGeserX(e.target))return;gv=$('#view');gx=e.touches[0].clientX;gy=e.touches[0].clientY;gt=Date.now();gh=0},{passive:true});
addEventListener('touchmove',e=>{if(!gv)return;if(e.touches.length>1){gh=-1;gv.style.transform='';return}const dx=e.touches[0].clientX-gx,dy=e.touches[0].clientY-gy;if(!gh&&Math.abs(dx)>10)gh=Math.abs(dx)>Math.abs(dy)*1.3?1:-1;if(gh!=1)return;
 const r=gLink(dx)?dx*.55:dx*.12;gv.style.transition='none';gv.style.transform=`translateX(${r}px)`;gv.style.opacity=1-Math.min(Math.abs(r)/700,.35)},{passive:true});
addEventListener('touchend',e=>{if(!gv||gh!=1)return;const v=gv;gv=null;const dx=e.changedTouches[0].clientX-gx,cepat=Math.abs(dx)>40&&Date.now()-gt<250,L=gLink(dx);
 if(L&&(Math.abs(dx)>80||cepat)){pDir(dx<0?1:-1);location.hash=L.getAttribute('href');return}
 v.style.transition='transform .3s cubic-bezier(.22,.8,.3,1),opacity .3s';v.style.transform='';v.style.opacity=''},{passive:true});
addEventListener('keydown',e=>{if(!$('#view .pnav')||e.target.closest?.('input,textarea,select')||e.altKey||e.ctrlKey||e.metaKey)return;const L=e.key=='ArrowRight'?$('#view .pnav [data-nx]'):e.key=='ArrowLeft'?$('#view .pnav [data-pv]'):null;if(L){pDir(e.key=='ArrowRight'?1:-1);location.hash=L.getAttribute('href')}});
/* Tarik ke bawah untuk memuat ulang (seperti Instagram): seluruh halaman ikut turun, di celah atas muncul putaran + tulisan.
   Hanya di Beranda dan Pengaturan; halaman lain (Al-Qur'an, bacaan, dll.) tidak bisa ditarik. */
const ptr=mk('',`<span class="plg"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" pathLength="100"/><circle class="pj" cx="24" cy="24" r="21" pathLength="100"/></svg><img src="img/logo.png" alt=""></span><small>Tarik untuk memuat ulang</small>`);ptr.id='ptr';ptr.setAttribute('aria-hidden','true');
const ptrBoleh=()=>['','#','#/','#/pengaturan'].includes(location.hash);
let py=0,px=0,pt=0,pon=0;
const PTB=72,PTH=70;/* batas tarik; tinggi logo + tulisan (indikator selalu di atas isi halaman, tidak menimpa) */
const ptrSet=(y,anim)=>{const v=$('#view'),tr=anim?'transform .32s cubic-bezier(.22,.8,.3,1)':'none';v.style.transition=ptr.style.transition=tr+(anim?',opacity .32s':'');
 v.style.transform=y?`translateY(${y}px)`:'';ptr.style.transform=`translate(-50%,${Math.min(y-PTH-12,0)}px)`;ptr.style.opacity=Math.min(1,Math.max(0,(y-24)/40));
 if(!ptr.classList.contains('muter')){const k=Math.min(1,y/PTB);ptr.style.setProperty('--pk',k);$('.pj',ptr).style.strokeDashoffset=100-k*100}};
addEventListener('touchstart',e=>{pon=0;const v=$('#view');if(!ptrBoleh()||e.touches.length>1||!v||v.scrollTop>0||ptr.classList.contains('muter')||e.target.closest('.back-d,.sheet,#ftb,#ftp,.tdlap,.tdbar,input,textarea,select'))return;pon=1;pt=0;py=e.touches[0].clientY;px=e.touches[0].clientX},{passive:true});
addEventListener('touchmove',e=>{if(!pon)return;const d=e.touches[0].clientY-py,dx=e.touches[0].clientX-px;if($('#view').scrollTop>0||(pt==0&&Math.abs(dx)>Math.abs(d))){pon=0;ptrSet(0,1);return}
 pt=Math.max(0,Math.min(d*.5/zmKini(),130));ptrSet(pt);const siap=pt>PTB;if(siap!=ptr.classList.contains('siap')){ptr.classList.toggle('siap',siap);$('small',ptr).textContent=siap?'Lepaskan untuk memuat ulang':'Tarik untuk memuat ulang'}},{passive:true});
addEventListener('touchend',()=>{if(!pon)return;pon=0;
 if(pt>PTB){ptr.classList.add('muter');$('small',ptr).textContent='Memuat…';ptrSet(PTH+18,1);setTimeout(()=>location.reload(),700)}else{ptrSet(0,1);ptr.classList.remove('siap')}},{passive:true});
/* Cegah salin, potong, seret, dan menu klik kanan pada isi aplikasi; kolom isian tetap bisa diketik dan ditempel */
const bebasSalin=e=>e.target.closest&&e.target.closest('input,textarea,[contenteditable]');
['copy','cut','dragstart','contextmenu','selectstart'].forEach(t=>document.addEventListener(t,e=>{if(!bebasSalin(e))e.preventDefault()}));
