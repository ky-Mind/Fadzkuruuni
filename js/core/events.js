/* js/core/events.js - Pendengar peristiwa bersama (klik, input, geser) */
/* Geser kiri/kanan untuk pindah tab (mis. Tahlil | Yasin, Menu | Kalkulator): isi ikut jari, lalu tab berikutnya masuk dari samping.
   Juga bisa dengan geser dua jari di trackpad. Tidak aktif di dalam lembar, isian, kalender, carousel, atau halaman kitab. */
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
let tWx=0,tWt=0;addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<=Math.abs(e.deltaY)||tabSemua().length<2||e.target.closest('.back-d,.kp,.car'))return;
 if(Date.now()-tWt<600)return;tWx+=e.deltaX;if(Math.abs(tWx)>90){tabGanti(tWx>0?1:-1);tWx=0;tWt=Date.now()}},{passive:true});
document.addEventListener('click',e=>{const c=e.target.closest('[data-copy]');if(c){const v=c.dataset.copy;(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast(v.length>30?'Teks disalin':'Disalin: '+v),()=>toast('Tidak bisa menyalin. Salin manual.'));return}
 const b=e.target.closest('[data-bm]');if(b){const k=b.dataset.bm;S.bm=S.bm||[];const i=S.bm.indexOf(k);i<0?S.bm.unshift(k):S.bm.splice(i,1);save();b.classList.toggle('on',i<0);toast(i<0?'Ayat ditandai':'Penanda dihapus')}});
document.addEventListener('input',e=>{const c=e.target.closest('[data-calc]');if(!c)return;const g=k=>parseFloat((c.querySelector(`[data-k=${k}]`)?.value||'').replace(',','.'))||0,o=c.querySelector('.cres'),t=c.dataset.calc;if(!g('h'))return o.textContent='Isi harga per kg terlebih dahulu.';const kg=t=='fitrah'?g('j')*2.5:g('j')*g('d')*.6;o.innerHTML=`<b>${rp(kg*g('h'))}</b><br><small class="mut">${kg.toFixed(2).replace('.',',')} kg makanan pokok</small>`});
document.addEventListener('click',e=>{const t=e.target;
 if(t.closest('[data-loc]'))return lsheet();
 const z=t.closest('[data-z]');if(z){S.fs=Math.max(22,Math.min(56,S.fs+ +z.dataset.z));save();$$('#view .ay .ar,#view .ay2 .ar,#view .ar2,#view .mushaf').forEach(x=>x.style.fontSize=S.fs+'px');$$('.zb b').forEach(b=>b.textContent=S.fs);return}
 if(t.closest('[data-nb]')){S.nb=1;save();t.closest('.note').remove();return}
});
document.addEventListener('click',async e=>{const t=e.target;
 if(t.closest('[data-rs]'))return qsheet(()=>route());
 if(t.closest('[data-stop]')){if(window.ANDROID)andPanggil('hentikanAdzan');return stopAdzan()}
 if(t.closest('[data-tsub]'))return window.ANDROID?ujiNotif(1):play(0,1);
 if(t.closest('[data-notif]')){await askNotif();return permFill()}
 const gi=t.closest('[data-gin]');if(gi){const fb=gi.dataset.gin=='fb',nm=fb?'Facebook':'Google';if(window.ANDROID){if(!navigator.onLine)return toast('Butuh internet untuk masuk dengan '+nm);/* Masuk lewat tab Chrome aman (Google & Facebook tidak mengizinkan dari WebView); aplikasi lama hanya punya masukGoogle */return fb?(window.FadzAndroid.masukFacebook?andPanggil('masukFacebook'):toast('Perbarui aplikasi Fadzkuruuni untuk masuk dengan Facebook')):andPanggil('masukGoogle')}if(!window.firebase||!firebase.auth)return toast('Butuh internet untuk masuk dengan '+nm);const pr=fb?new firebase.auth.FacebookAuthProvider():new firebase.auth.GoogleAuthProvider();return firebase.auth().signInWithPopup(pr).catch(err=>{const c=err.code||'';if(c=='auth/popup-blocked'||c=='auth/operation-not-supported-in-this-environment')return firebase.auth().signInWithRedirect(pr);toast(c=='auth/unauthorized-domain'?'Domain ini belum diizinkan di Firebase (Authentication > Settings > Authorized domains)':c=='auth/popup-closed-by-user'?'Masuk dibatalkan':c=='auth/operation-not-allowed'||c=='auth/configuration-not-found'?'Masuk dengan '+nm+' belum diaktifkan oleh pengelola aplikasi':c=='auth/account-exists-with-different-credential'?'Email ini sudah terdaftar lewat cara masuk lain. Coba masuk dengan Google.':fb?FBGAGAL+' ('+c+')':'Gagal masuk: '+c)})}
 if(t.closest('[data-gout]'))return konfirmasi('Keluar dari akun?','Data di perangkat tetap tersimpan. Kamu bisa masuk lagi kapan saja.','Keluar',()=>firebase.auth().signOut().then(()=>{FBU=null;route()}));
 if(t.closest('[data-nsave]')){S.nm=($('#nm').value||'').trim().slice(0,24);save();return toast(S.nm?'Nama disimpan':'Nama dikosongkan')}
 if(t.closest('[data-ndel]')){S.nm='';save();$('#nm').value='';return toast('Nama dihapus')}
 if(t.closest('[data-addq]')){const v=($('#qn').value||'').trim();if(!v)return toast('Tulis kata-katanya dulu');QA().push({t:v,p:$('#qnw')?.value||'any'});save();toast('Kata-kata ditambahkan');return route()}
 const qe=t.closest('[data-qe]');if(qe){QEDIT=+qe.dataset.qe;return route()}
 if(t.closest('[data-qc]')){QEDIT=-1;return route()}
 const qs=t.closest('[data-qs]');if(qs){const v=($('#qv').value||'').trim();if(!v)return toast('Teks tidak boleh kosong');const q=QA()[+qs.dataset.qs];q.t=v;q.p=$('#qvw')?.value||q.p||'any';QEDIT=-1;save();return route()}
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
 if(a.matches('.bk')&&!/^javascript:/.test(a.getAttribute('href')||'')){e.preventDefault();keInduk(tujuanKembali())}});
/* Tujuan kembali: halaman asal (riwayat di aplikasi), bila tidak ada (mis. baru dibuka lewat tautan) ke induk tetap di tombol kembali.
   Menu bawah (Al-Qur'an, Fadz AI, dll.) selalu kembali ke Beranda. */
function tujuanKembali(){const h=location.hash||'#/',[r,b]=h.slice(2).split('/');if(tataNavR().includes(r)&&!b)return '#/';
 const asal=RIW[RIW.length-2];if(asal&&asal!=h)return asal;const bk=$('#view .bk')?.getAttribute('href');return bk&&!/^javascript:/.test(bk)&&bk!=h?bk:'#/'}
/* Pindah ke halaman induk dengan mengganti entri riwayat (tidak menambah, dan tidak pernah keluar dari aplikasi) */
function keInduk(up){pDir(-1);location.replace(up)}
/* Tombol kembali HP (aplikasi Android memanggil ini): tutup lembar/dialog atau layar penuh kitab dulu, lalu naik ke halaman induk
   (mis. Surah → Al-Qur'an → Beranda). Di Beranda mengembalikan 'akar': aplikasi lalu meminta tekan sekali lagi untuk keluar.
   Mode Kartu/Mushaf Al-Qur'an bukan lapisan: kembali langsung keluar dari surah, tidak berganti mode. */
window.fadzKembali=()=>{const o=$$('.back-d');if(o.length){const d=o[o.length-1];if(d.dataset.wajib)wajibGoyang(d);else d.remove();return 'ok'}
 if(document.body.classList.contains('kfull')){kitabFull(false);return 'ok'}
 const h=location.hash||'#/';if(['#','#/'].includes(h))return 'akar';
 keInduk(tujuanKembali());return 'ok'};
/* Geser samping seperti WhatsApp (sama dengan Kisah-Lillah): isi sebelah ikut bergeser masuk bersama jari.
   - Tab (Surah | Juz | Riwayat, Tahlil | Yasin, dll.): isi tab sebelah tampil di samping isi tab ini.
   - Bagian berurutan (.pnav: surah/bacaan berikutnya) dan halaman menu bawah (Beranda, Al-Qur'an, Fadz AI, Kalender, Pengaturan):
     halaman sebelah (potret terakhirnya, atau dirender langsung bila belum pernah dibuka) ikut bergeser.
   - Geser dari tepi kiri di subhalaman = kembali ke halaman induk: halaman ini mengikuti jari, halaman induk tampil di belakang.
   Dilepas cukup jauh (22% lebar) atau dikibas: meluncur penuh lalu halaman/tab asli dipasang tanpa animasi; kurang dari itu kembali. */
const GS_BATAS=.22,GS_KIBAS=.5,GS_DUR=260,GS_EASE='cubic-bezier(.22,.8,.3,1)';
const gsHP=()=>matchMedia('(max-width:899px)').matches;
/* Potret isi halaman per alamat (diisi router setiap kali halaman ditinggalkan) */
const VSNAP=new Map();
/* Kelas tata letak #view per halaman (dipakai router dan pratinjau geser, agar ukuran/jarak tepi sama persis) */
const vKelas=h=>/^#\/pengaturan(\/|$)/.test(h||'')?'phal':'';
function vSnap(h,html){if(!h||!html||html.length>600000)return;VSNAP.delete(h);VSNAP.set(h,html);if(VSNAP.size>24)VSNAP.delete(VSNAP.keys().next().value)}
/* Isi halaman lain sebagai HTML: potret terakhir, atau dirender dari fungsi halamannya (tanpa init) */
/* Pratinjau yang sudah disiapkan untuk halaman sebelah (dibuang setiap pindah halaman) */
const VPRE=new Map();
/* Lapisan pratinjau siap pakai per alamat (dibangun saat senggang, disembunyikan); saat jari mulai menggeser tinggal ditampilkan */
const VEL=new Map();
function vSiapkan(){VPRE.clear();VEL.forEach(e=>e.remove());VEL.clear();const h=location.hash||'#/',[a,b]=h.slice(2).split('/'),N=tataNavR(),L=[];
 if($('#view .pnav')){$$('#view .pnav [data-nx],#view .pnav [data-pv]').forEach(x=>L.push(x.getAttribute('href')))}else if(N.includes(a)&&!b){const k=N.indexOf(a);[N[k-1],N[k+1]].forEach(r=>r!=null&&L.push('#/'+r))}
 const kerja=()=>L.forEach(t=>{if(!VSNAP.has(t)&&!VPRE.has(t))VPRE.set(t,vHtml(t));if(window.gsBangun)gsBangun(t)});(window.requestIdleCallback||setTimeout)(kerja,{timeout:800})}
function vHtml(h){if(VSNAP.has(h))return VSNAP.get(h);if(VPRE.has(h))return VPRE.get(h);try{const [a='',b,c,d]=h.replace(/^#\/?/,'').split('/');const pr=PRATINJAU[a]&&PRATINJAU[a](b,c,d);if(pr)return pr;return ((a=='quran'&&b?surah(b,c):(P[a]||P[''])(b,c,d))||{}).html||''}catch(e){return ''}}
/* Jangan bajak geseran di isian, penggeser, lembar, kitab, kalender, carousel, atau daftar yang bisa digeser samping */
function gsHalang(t){/* Deretan tombol yang bisa digeser samping */{const sc=t.closest('.act,.kla');if(sc&&sc.scrollWidth>sc.clientWidth+1)return true}/* Pratinjau admin: elemen yang bisa diatur diseret, bukan menggeser halaman */if(typeof TPRATINJAU!='undefined'&&TPRATINJAU&&t.closest('[data-ta]'))return true;if(t.closest('input,textarea,select,[contenteditable],[data-noswipe],.sheet,.back-d,#ftb,#ftp,.tdlap,.tdbar,.kmp,.kp,.cal,.car,.tsf'))return true;
 for(let e=t;e&&e.id!='view';e=e.parentElement)if(e.scrollWidth>e.clientWidth+2&&/auto|scroll/.test(getComputedStyle(e).overflowX))return true;return false}
/* Isi tab sebelah: tab itu dipilih sebentar untuk mengambil isinya, lalu tab asli dan isinya (simpul yang sama, lengkap dengan isian) dikembalikan */
function gsTabHtml(nb){const T=tabSemua(),cur=T.find(b=>b.classList.contains('on')),el=tabIsi(),v=$('#view');if(!cur||!el)return '';
 const simpan=[...el.childNodes],sy=v.scrollTop;let h='';try{nb.click();h=(tabIsi()||el).innerHTML}catch(e){}
 try{cur.click()}catch(e){}const el2=tabIsi()||el;el2.replaceChildren(...simpan);v.scrollTop=sy;tabPil();return h}
{
 const v=$('#view'),app=$('#app');
 let sx=null,sy=0,t0=0,dx=0,lock=null,mode='',dir=0,tujuan=null,peek=null,el=null,sibuk=false,tm=0,k=1;
 const W=()=>v.clientWidth;
 const buang=()=>{if(peek){peek.remove();peek=null}};
 /* Halaman sebelah: lapisan seukuran #view di dalam #app, digeser selebar layar ke sisinya */
 /* Bangun lapisan pratinjau untuk alamat t (tersembunyi di luar layar) */
 const bangunPeek=(t,html,blk)=>{const p=document.createElement('div');p.className='vpeek'+(blk?' blk':'')+(vKelas(t)?' '+vKelas(t):'');p.setAttribute('aria-hidden','true');p.innerHTML=html;
  Object.assign(p.style,{left:v.offsetLeft+'px',top:v.offsetTop+'px',width:v.offsetWidth+'px',height:v.offsetHeight+'px',visibility:'hidden',transform:'translate3d(-200vw,0,0)'});
  const lk=p.querySelector(':scope>.rh')||p.querySelector(':scope>.bar [data-rs]')?.closest('.bar')||p.querySelector(':scope>.aibar');lk&&lk.classList.add('lekat');return p};
 window.gsBangun=t=>{if(VEL.has(t)||!gsHP())return;const p=bangunPeek(t,vHtml(t));app.append(p);VEL.set(t,p)};
 const peekHal=(html,blk)=>{buang();const siap=!blk&&VEL.get(tujuan);
  if(siap){peek=siap;VEL.delete(tujuan);Object.assign(peek.style,{left:v.offsetLeft+'px',top:v.offsetTop+'px',width:v.offsetWidth+'px',height:v.offsetHeight+'px',visibility:''});if(peek.querySelector("#aic .aim"))peek.scrollTop=peek.scrollHeight;return}
  peek=document.createElement('div');peek.className='vpeek'+(blk?' blk':'')+(vKelas(tujuan)?' '+vKelas(tujuan):'');peek.setAttribute('aria-hidden','true');peek.innerHTML=html;
  Object.assign(peek.style,{left:v.offsetLeft+'px',top:v.offsetTop+'px',width:v.offsetWidth+'px',height:v.offsetHeight+'px'});blk?app.insertBefore(peek,v):app.append(peek);
  /* Kepala halaman yang menempel (dipasang router lewat barLekat) juga dipasang di pratinjau, agar letaknya sama */
  const lk=peek.querySelector(':scope>.rh')||peek.querySelector(':scope>.bar [data-rs]')?.closest('.bar')||peek.querySelector(':scope>.aibar');lk&&lk.classList.add('lekat');
  /* Fadz AI dibuka di pesan terbaru (bawah): pratinjaunya juga ditampilkan dari bawah */
  if(peek.querySelector("#aic .aim"))peek.scrollTop=peek.scrollHeight};
 /* Tab sebelah: lapisan seukuran isi tab, tepat di sampingnya */
 const peekTab=html=>{buang();if(!html)return;peek=document.createElement('div');peek.className='tpeek';peek.setAttribute('aria-hidden','true');peek.innerHTML=html;
  Object.assign(peek.style,{left:el.offsetLeft+'px',top:el.offsetTop+'px',width:el.offsetWidth+'px'});el.after(peek)};
 const pasang=(px,tr)=>{const w=W(),g=mode=='tab'?el:v;g.style.transition=tr?`transform ${tr}`:'none';g.style.transform=px?`translate3d(${px}px,0,0)`:'';
  if(mode=='back'){v.style.boxShadow=px?'-10px 0 24px rgba(0,0,0,.22)':'';if(peek){peek.style.transition=tr?`transform ${tr},filter ${tr}`:'none';peek.style.transform=`translate3d(${(px-w)*.3}px,0,0)`;peek.style.filter=`brightness(${.8+.2*Math.min(1,px/w)})`}}
  else if(peek){peek.style.transition=g.style.transition;peek.style.transform=`translate3d(${px+dir*w}px,0,0)`}};
 const pulih=()=>{cancelAnimationFrame(raf);raf=0;[v,el].forEach(g=>{if(g){g.style.transition=g.style.transform='';g.style.boxShadow='';g.classList.remove('gsj')}});v.style.position=v.style.zIndex=v.style.background=v.style.overflowY='';buang();sibuk=false};
 /* Posisi digambar sekali per frame layar (bukan tiap event sentuh) */
 let raf=0,pxT=0,jejak=[];const jadwal=px=>{pxT=px;if(!raf)raf=requestAnimationFrame(()=>{raf=0;if(sx!==null&&lock=='h')pasang(pxT)})};
 const meluncur=(px,lalu,ms=GS_DUR)=>{pasang(px,`${ms}ms ${GS_EASE}`);clearTimeout(tm);tm=setTimeout(()=>lalu&&lalu(),ms+20)};
 /* Halaman baru dipasang router (data-vt=geser, tanpa animasi): potret dilepas */
 document.addEventListener('fz-dipasang',()=>{if(mode&&sibuk){mode='';pulih()}});
 /* Router memasang halaman baru dan mengembalikan #view ke tempatnya; pratinjau (sudah tepat di layar) tetap di atas sampai fz-dipasang */
 const pilihSebelah=d=>{dir=d;tujuan=null;buang();
  if(mode=='tab'){const T=tabSemua(),i=T.findIndex(b=>b.classList.contains('on'));tujuan=T[i+d]||null;if(tujuan)peekTab(gsTabHtml(tujuan));return}
  const h=location.hash||'#/',[a,b]=h.slice(2).split('/');let L=$(d>0?'#view .pnav [data-nx]':'#view .pnav [data-pv]');
  if(L)tujuan=L.getAttribute('href');else if(!$('#view .pnav')&&tataNavR().includes(a)&&!b){const N=tataNavR(),k=N.indexOf(a);tujuan=N[k+d]!=null?'#/'+N[k+d]:null}
  if(tujuan)peekHal(vHtml(tujuan))};
 v.addEventListener('touchstart',e=>{sx=null;if(sibuk||!gsHP()||e.touches.length!=1||document.body.classList.contains('kfull')||gsHalang(e.target))return;
  const t=e.touches[0];sx=t.clientX;sy=t.clientY;t0=Date.now();dx=0;lock=null;mode='';jejak=[];
  /* Halaman jadi lapisan GPU sendiri sejak disentuh: saat digeser cukup dipindah, tidak digambar ulang tiap frame */
  v.classList.add('gsj');
  /* Jarak jari (piksel layar) diubah ke piksel CSS: di HP seluruh tampilan memakai zoom, isi harus tepat menempel di jari */
  k=v.getBoundingClientRect().width/v.offsetWidth||1;
  /* Tepi kiri di subhalaman: geser kembali */
  if(t.clientX<24&&document.body.classList.contains('subhal'))mode='back';
  /* Isi surah punya geser sendiri (halaman kartu / surah sebelah, lihat qReader di js/pages/quran.js) */
  else if(e.target.closest('#ay'))sx=null},{passive:true});
 v.addEventListener('touchmove',e=>{if(sx===null)return;
  if(e.touches.length!=1){const h=lock=='h';sx=null;if(h)meluncur(0,pulih);return}
  const x=(e.touches[0].clientX-sx)/k,y=(e.touches[0].clientY-sy)/k,kini=performance.now();jejak.push([kini,x]);while(jejak.length>2&&kini-jejak[0][0]>100)jejak.shift();
  if(lock===null){if(Math.abs(x)<12&&Math.abs(y)<12)return;
   if(mode=='back'){lock=x>0&&x>Math.abs(y)?'h':'v';if(lock=='h'){dir=-1;tujuan=tujuanKembali();Object.assign(v.style,{position:'relative',zIndex:'1',background:'var(--bg)'});peekHal(vHtml(tujuan),1)}}
   else{lock=Math.abs(x)>Math.abs(y)*1.6?'h':'v';if(lock=='h'){
    /* Halaman bertab: geser di isi tab = pindah tab; geser di bagian atas (judul, cari, tombol tab) = pindah halaman (mis. Al-Qur'an ↔ Beranda / Fadz AI) */
    /* Halaman menu bawah (mis. Al-Qur'an): geser di mana saja selalu ke halaman besar sebelah (Beranda / Fadz AI); tab (Surah/Juz/Riwayat) hanya lewat ketukan */
    const [ra,rb]=(location.hash||'#/').slice(2).split('/'),akar=tataNavR().includes(ra)&&!rb;
    const ti=!akar&&tabSemua().length>1?tabIsi():null;mode=ti&&ti.contains(e.target)?'tab':'hal';el=mode=='tab'?ti:null;v.style.position='relative';v.style.overflowY='hidden';if(el)el.classList.add('gsj');pilihSebelah(x<0?1:-1)}else v.classList.remove('gsj')}}
  if(lock!='h')return;
  if(mode=='back'){dx=Math.max(0,x);jadwal(dx);return}
  /* Arah berbalik melewati titik awal: ganti isi sebelah yang ditampilkan */
  const nd=x<0?1:-1;if(nd!=dir&&x!=0)pilihSebelah(nd);dx=x;jadwal(tujuan?dx:dx*.25)},{passive:true});
 const lepas=()=>{if(sx===null)return;const h=lock=='h';sx=null;if(!h){v.classList.remove('gsj');return}cancelAnimationFrame(raf);raf=0;
  /* Kecepatan dari gerakan ~100 ms terakhir (bukan rata-rata sejak menyentuh): kibasan cepat langsung meluncur */
  const j0=jejak[0],j1=jejak[jejak.length-1],vJ=j0&&j1&&j1[0]>j0[0]?(j1[1]-j0[1])/(j1[0]-j0[0]):0;
  const w=W(),vel=Math.abs(vJ)>Math.abs(dx/Math.max(1,Date.now()-t0))?vJ:dx/Math.max(1,Date.now()-t0),ms=Math.max(140,Math.min(GS_DUR,(w-Math.abs(dx))/Math.max(.6,Math.abs(vel))));
  if(mode=='back'){if(dx>w*.33||vel>GS_KIBAS){sibuk=true;meluncur(w,()=>{if(peek)peek.style.zIndex='2';document.documentElement.dataset.vt='geser';location.replace(tujuan);setTimeout(()=>{if(sibuk){mode='';pulih()}},1500)},ms)}else meluncur(0,()=>{mode='';pulih()});return}
  const kibas=Math.abs(vel)>GS_KIBAS&&Math.sign(vel)==-dir;
  if(tujuan&&(Math.abs(dx)>w*GS_BATAS||kibas)){sibuk=true;
   meluncur(-dir*w,()=>{if(mode=='tab'){const g=el;tujuan.click();tabPil();g.style.transition='none';g.style.transform='';const n=tabIsi();if(n){n.style.transition='none';n.style.transform=''}mode='';pulih();return}
    document.documentElement.dataset.vt='geser';location.hash=tujuan;setTimeout(()=>{if(sibuk){mode='';pulih()}},1500)},ms)}
  else meluncur(0,()=>{mode='';pulih()})};
 v.addEventListener('touchend',lepas,{passive:true});
 v.addEventListener('touchcancel',()=>{if(sx!==null){sx=null;if(lock=='h')meluncur(0,()=>{mode='';pulih()})}},{passive:true});
}
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
 if(pt>PTB)ptrMuat();else{ptrSet(0,1);ptr.classList.remove('siap')}},{passive:true});
/* Muat ulang dengan tampilan tarik-untuk-memuat (dipakai juga saat menu bawah yang aktif dipencet lagi) */
function ptrMuat(){if(ptrMuat.on)return;ptrMuat.on=1;ptr.classList.add('siap','muter');$('small',ptr).textContent='Memuat…';ptrSet(PTH+18,1);
 /* Muat ulang lembut (seperti Instagram): ambil pengaturan tampilan terbaru & cek versi baru, lalu gambar ulang halaman di tempat — tanpa memuat ulang seluruh aplikasi, jadi tidak ada layar putih */
 const sw='serviceWorker'in navigator?navigator.serviceWorker.getRegistration().then(g=>g&&g.update()).catch(()=>{}):0;
 Promise.all([Promise.resolve(typeof tataAmbil=='function'&&tataAmbil(1)).catch(()=>{}),sw,new Promise(r=>setTimeout(r,650))]).then(()=>{
  const v=$('#view'),y=v.scrollTop;route();v.scrollTop=y;ptrSet(0,1);setTimeout(()=>{ptr.classList.remove('siap','muter');$('small',ptr).textContent='Tarik untuk memuat ulang';ptrMuat.on=0},340)})}
/* Menu bawah seperti Instagram: pindah halaman langsung tanpa animasi keluar-masuk.
   Memencet menu yang sedang aktif: bila halaman sedang digulir, kembali ke atas; bila sudah di atas, hanya Beranda yang dimuat ulang. */
document.addEventListener('click',e=>{const a=e.target.closest('#nav a[data-r]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey)return;
 const tuju=a.getAttribute('href')||'#/',kini=location.hash||'#/',sama=tuju.replace(/^#\/?$/,'#/')==kini.replace(/^#\/?$/,'#/');
 if(!sama){document.documentElement.dataset.vt='nav';return}
 e.preventDefault();const v=$('#view');if(v.scrollTop>4)keAtas(v);else if(tuju.replace(/^#\/?$/,'#/')=='#/')ptrMuat()},true);
/* Gulir ke atas dengan animasi sendiri (gulir halus bawaan peramban tidak selalu jalan di dalam WebView) */
function keAtas(v){const y0=v.scrollTop,t0=performance.now(),D=Math.min(520,240+y0*.08);if(gerakOff())return v.scrollTop=0;
 const f=t=>{const p=Math.min(1,(t-t0)/D),e=1-Math.pow(1-p,3);v.scrollTop=y0*(1-e);if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
/* Cegah salin, potong, seret, dan menu klik kanan pada isi aplikasi; kolom isian tetap bisa diketik dan ditempel */
const bebasSalin=e=>e.target.closest&&e.target.closest('input,textarea,[contenteditable]');
['copy','cut','dragstart','contextmenu','selectstart'].forEach(t=>document.addEventListener(t,e=>{if(!bebasSalin(e))e.preventDefault()}));

/* Pengaturan › Tentang & Bantuan: cek pembaruan aplikasi sekarang */
document.addEventListener('click',e=>{if(e.target.closest('[data-upcek]'))pembaruanCek(1)});
