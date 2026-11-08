/* js/core/tata.js - Tata letak aplikasi yang bisa diatur admin (dashboard admin.html > Tampilan, atau Mode admin di aplikasi).
   TATA_BAWAAN = susunan asli di kode. Admin menerbitkan perubahan ke Firestore config/tampilan (field "json");
   aplikasi mengambilnya lewat REST (tanpa memuat Firebase), menyimpannya untuk offline, lalu menerapkannya.
   Juga: statistik pemakaian ringan tanpa data pribadi (koleksi "stat", satu dokumen per hari). */
const FSURL='https://firestore.googleapis.com/v1/projects/'+FBCFG.projectId+'/databases/(default)/documents';
const TPRATINJAU=new URLSearchParams(location.search).has('pratinjau');
const TPEMILIK=['hilmykia@gmail.com','ponpesfadzkuruuni@gmail.com'];

/* Semua tujuan yang bisa dipakai di pintasan, Semua Menu, dan menu bawah: rute -> [ikon, nama] */
const TPOOL=(()=>{const P={'':['home','Beranda'],menu:['grid','Lainnya']};MENUALL.forEach(g=>g[1].forEach(m=>P[m[0]]=[m[1],m[2]]));SHORT.forEach(s=>P[s[0]]=P[s[0]]||[s[1],s[2]]);
 Object.assign(P,{zakat:P.zakat||['heart','Zakat & Sedekah'],lapor:['flag','Laporkan masalah'],ai:P.ai||['spark','Fadz AI'],kalender:P.kalender||['cal','Kalender'],pengaturan:P.pengaturan||['sliders','Pengaturan'],dukung:P.dukung||['heart','Dukung kami'],tutorial:P.tutorial||['play','Video tutorial'],bookmark:P.bookmark||['star','Penanda ayat']});return P})();
/* Bagian Beranda: id -> nama (untuk dashboard & mode admin) */
const TBAG={lokasi:'Logo & lokasi',catatan:'Catatan pembuka',pengumuman:'Pengumuman admin',sapa:'Sapaan & tanggal',jadwal:'Jam & jadwal salat',pintasan:'Pintasan',cari:'Pencarian',promo:'Kartu promo (zakat, tahlil, waris)',lanjut:'Lanjutkan membaca',doa:'Doa hari ini'};
const TATA_BAWAAN={beranda:Object.keys(TBAG).map(id=>({id,on:true})),pintasan:SHORT.map(s=>s[0]),menu:MENUALL.map(g=>({nama:g[0],isi:g[1].map(m=>m[0])})),
 nav:['','quran','ai','kelas','pengaturan'],setelan:null,sembunyiSet:[],label:{},umum:{on:false,judul:'',teks:'',tautan:'',label:'Buka'},bawaan:{}};

/* Gabungkan konfigurasi admin dengan bawaan: urutan dari admin, bagian baru dari kode tetap muncul (di akhir) */
/* Fitur baru yang otomatis masuk ke susunan admin yang sudah terbit */
const TATA_BARU=['sholawat','kelas'];
function tataGabung(c){const B=JSON.parse(JSON.stringify(TATA_BAWAAN)),T=Object.assign(B,c&&typeof c=='object'?c:{});
 if(c&&Array.isArray(c.beranda)){const ada=new Set(c.beranda.map(x=>x.id));T.beranda=c.beranda.filter(x=>TBAG[x.id]).concat(TATA_BAWAAN.beranda.filter(x=>!ada.has(x.id)))}
 /* Kelas online menggantikan Kalender di menu bawah (Kalender tetap ada di Semua Menu) */
 if(Array.isArray(T.nav)&&T.nav.includes('kalender')&&!T.nav.includes('kelas'))T.nav=T.nav.map(r=>r=='kalender'?'kelas':r);
 const sah=r=>r in TPOOL;T.pintasan=(T.pintasan||[]).filter(sah);T.nav=(T.nav||[]).filter(r=>sah(r)&&!r.includes('/')).slice(0,5);if(T.nav.length<2)T.nav=TATA_BAWAAN.nav.slice();
 T.menu=(T.menu||[]).map(g=>({nama:String(g.nama||''),isi:(g.isi||[]).filter(sah)})).filter(g=>g.isi.length);
 /* Fitur yang ditambahkan setelah susunan admin diterbitkan (mis. Sholawat) disisipkan ke kelompok bawaannya, setelah item sebelumnya */
 if(c&&Array.isArray(c.menu)){const semua=new Set(T.menu.flatMap(g=>g.isi));TATA_BARU.forEach(r=>{if(semua.has(r)||(c.dihapus||[]).includes(r))return;const gb=TATA_BAWAAN.menu.find(g=>g.isi.includes(r));if(!gb)return;
  const g=T.menu.find(x=>x.nama==gb.nama)||T.menu[0];if(!g)return;const sbl=gb.isi[gb.isi.indexOf(r)-1],k=g.isi.indexOf(sbl);g.isi.splice(k<0?g.isi.length:k+1,0,r)})}T.label=T.label||{};T.umum=Object.assign({},TATA_BAWAAN.umum,T.umum||{});T.bawaan=T.bawaan||{};return T}
const tataBaca=()=>{try{return JSON.parse(localStorage.fztata||'null')}catch(e){return null}};
let TATAV=(tataBaca()||{}).v||0,TATA=tataGabung((tataBaca()||{}).c);

const tNama=(r,d)=>TATA.label[r]||d||(TPOOL[r]||[])[1]||r;
const tIkon=r=>(TPOOL[r]||['grid'])[0];
const tataPintasan=()=>TATA.pintasan.map(r=>[r,tIkon(r),tNama(r)]);
const tataMenu=()=>TATA.menu.map(g=>[g.nama,g.isi.map(r=>[r,tIkon(r),tNama(r)])]);
const tataSetelan=()=>{const G=SETGROUPS,urut=TATA.setelan;let L=G;if(Array.isArray(urut)){const m=new Map(G.map(x=>[x[0],x]));L=urut.map(k=>m.get(k)).filter(Boolean).concat(G.filter(x=>!urut.includes(x[0])))}return L.filter(x=>!(TATA.sembunyiSet||[]).includes(x[0]))};
const tataNavR=()=>TATA.nav;

/* Menu bawah/samping dibangun dari TATA.nav */
function tataNav(){const n=$('#nav');if(!n)return;$$('a[data-r]',n).forEach(a=>a.remove());n.insertAdjacentHTML('beforeend',TATA.nav.map(r=>`<a href="#/${r}" data-r="${r}" data-tip="${esc(tNama(r))}">${r=='pengaturan'&&window.fotoProfil&&fotoProfil()?`<img class="ava navava" src="${esc(fotoProfil())}" alt="" referrerpolicy="no-referrer">`:ic(tIkon(r))}<span>${esc(tNama(r))}</span></a>`).join(''));const a=location.hash.slice(2).split('/')[0];$$('a[data-r]',n).forEach(l=>l.classList.toggle('on',l.dataset.r==a))}

/* Tampilan bawaan dari admin: hanya untuk pengguna baru (pengaturan yang belum pernah disimpan di perangkat) */
const TSU=(()=>{if(TPRATINJAU)return [];try{return Object.keys(JSON.parse(localStorage.fz||'{}'))}catch(e){return []}})();
function tataBawaan(){const b=TATA.bawaan||{};let ub=0;['theme','ac','af','lf','fs','fl','fi','lt','tr'].forEach(k=>{if(b[k]!==undefined&&b[k]!==''&&!TSU.includes(k)&&S[k]!==b[k]){S[k]=b[k];ub=1}});if(ub){theme();setSz()}}

function tataTerap(c,v,simpan){TATA=tataGabung(c);if(v)TATAV=v;if(simpan)try{localStorage.fztata=JSON.stringify({v,c})}catch(e){}tataBawaan();tataNav();
 const a=location.hash.slice(2).split('/')[0];if(['','menu','pengaturan'].includes(a)&&!document.querySelector('.back-d'))route()}
/* Ambil konfigurasi terbaru (REST publik, tanpa login); dicek saat dibuka & tiap kembali ke aplikasi (maks. 1x per 5 menit) */
let TCEK=0;async function tataAmbil(paksa){if(TPRATINJAU||!navigator.onLine||(!paksa&&Date.now()-TCEK<3e5))return;TCEK=Date.now();
 try{const r=await fetch(FSURL+'/config/tampilan?key='+FBCFG.apiKey,{cache:'no-store'});if(!r.ok)return;const f=(await r.json()).fields||{},v=+(f.v?.integerValue||0);if(!v||v==TATAV)return;tataTerap(JSON.parse(f.json?.stringValue||'{}'),v,1)}catch(e){}}
tataBawaan();
/* Data untuk dashboard admin (dibaca dari iframe pratinjau, sama asal) */
if(TPRATINJAU)window.TATAINFO={TPOOL,TBAG,TATA_BAWAAN,setelan:()=>SETGROUPS,ACC,FAR,FLT,gabung:tataGabung,aktif:()=>TATA};
if(TPRATINJAU){addEventListener('message',e=>{if(e.origin!==location.origin||!e.data||!e.data.tata)return;tataTerap(e.data.tata,0,0);if(e.data.ke!=null&&location.hash!=e.data.ke)location.hash=e.data.ke})}

/* ===== Pratinjau di dashboard admin: tekan lama lalu geser untuk mengubah urutan =====
   Berlaku untuk menu bawah (#nav), pintasan & bagian Beranda, item Semua Menu, dan item Pengaturan (elemen ber-data-ta).
   Saat dilepas, urutan baru dikirim ke dashboard (postMessage {urut:{j,k}}); dashboard memperbarui draf lalu mengirim ulang tata. */
if(TPRATINJAU){let sr=null,tm=0,x0=0,y0=0;
 const target=t=>{const n=t.closest('#nav a[data-r]');if(n)return {el:n,j:'nav',kunci:a=>a.dataset.r,sib:()=>$$('#nav a[data-r]')};
  const a=t.closest('[data-ta]');if(!a)return null;const j=a.dataset.ta.split(':')[0];
  return {el:a,j,kunci:x=>x.dataset.ta.slice(j.length+1),sib:()=>[...a.parentElement.children].filter(x=>x.dataset&&x.dataset.ta&&x.dataset.ta.startsWith(j+':'))}};
 const batal=()=>{clearTimeout(tm);tm=0};
 const angkat=()=>{const s=sr;if(!s)return;s.on=1;const r=s.t.el.getBoundingClientRect();s.gx=x0-r.left;s.gy=y0-r.top;s.t.el.classList.add('sret');document.body.classList.add('sreton');try{navigator.vibrate&&navigator.vibrate(18)}catch(e){}};
 addEventListener('pointerdown',e=>{if(e.button>0)return;const t=target(e.target);if(!t||t.sib().length<2)return;x0=e.clientX;y0=e.clientY;sr={t,on:0,id:e.pointerId};batal();tm=setTimeout(angkat,350)},true);
 addEventListener('pointermove',e=>{if(!sr)return;if(!sr.on){if(Math.hypot(e.clientX-x0,e.clientY-y0)>8){batal();sr=null}return}
  e.preventDefault();const el=sr.t.el;el.style.transform='';const pts=document.elementsFromPoint(e.clientX,e.clientY);
  const atas=pts.map(p=>p.closest&&(sr.t.j=='nav'?p.closest('#nav a[data-r]'):p.closest('[data-ta]'))).find(p=>p&&p!==el&&sr.t.sib().includes(p));
  if(atas){const r=atas.getBoundingClientRect(),datar=sr.t.j=='nav'||sr.t.j=='pin'||Math.abs(r.top-el.getBoundingClientRect().top)<4,
   sesudah=datar?e.clientX>r.left+r.width/2:e.clientY>r.top+r.height/2;atas.parentElement.insertBefore(el,sesudah?atas.nextSibling:atas)}
  const r=el.getBoundingClientRect();el.style.transform=`translate(${e.clientX-sr.gx-r.left}px,${e.clientY-sr.gy-r.top}px) scale(1.06)`},{capture:true,passive:false});
 addEventListener('touchmove',e=>{if(sr&&sr.on)e.preventDefault()},{capture:true,passive:false});
 const lepas=e=>{batal();if(!sr)return;const s=sr;sr=null;if(!s.on)return;e&&e.preventDefault&&e.preventDefault();
  s.t.el.classList.remove('sret');s.t.el.style.transform='';document.body.classList.remove('sreton');
  /* Klik setelah menyeret tidak membuka halaman */
  addEventListener('click',function f(ev){ev.preventDefault();ev.stopPropagation();removeEventListener('click',f,true)},true);setTimeout(()=>{},0);
  parent.postMessage({urut:{j:s.t.j,k:s.t.sib().map(s.t.kunci)}},location.origin)};
 addEventListener('pointerup',lepas,true);addEventListener('pointercancel',lepas,true);
 addEventListener('contextmenu',e=>{if(sr)e.preventDefault()},true)}
else{tataAmbil(1);document.addEventListener('visibilitychange',()=>{if(!document.hidden)tataAmbil()})}

/* ===== Statistik ringan (tanpa data pribadi): jumlah buka per fitur, perangkat aktif harian, kota, jenis aplikasi ===== */
const TSTAT={hal:{},pv:0};let TSTT=0;
const tKunci=s=>String(s||'lain').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,40)||'lain';
const tHari=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const tJenis=()=>window.ANDROID||/; wv\)/.test(navigator.userAgent)||document.referrer.startsWith('android-app://')?'android':matchMedia('(display-mode: standalone)').matches?'terpasang':'browser';
/* Merek/model HP untuk statistik (mis. "SM-A055F"); tanpa identitas. Dari Client Hints bila ada, kalau tidak dari user agent */
let TMODEL='';(async()=>{try{const u=navigator.userAgentData;if(u&&u.getHighEntropyValues){const h=await u.getHighEntropyValues(['model','platform']);if(h.model)TMODEL=h.model;else if(h.platform&&!/android/i.test(h.platform))TMODEL='Komputer '+h.platform}}catch(e){}
 if(!TMODEL||TMODEL=='K'){const u=navigator.userAgent,m=u.match(/Android [\d.]+; (?:[a-z]{2}[-_][a-zA-Z]{2}; )?([^;)]+?)(?: Build|\))/);TMODEL=m&&m[1]!='K'?m[1].trim():/iPhone/.test(u)?'iPhone':/iPad/.test(u)?'iPad':/Android/.test(u)?'Android':/Windows/.test(u)?'Komputer Windows':/Mac OS/.test(u)?'Komputer Mac':/Linux/.test(u)?'Komputer Linux':'Lainnya'}})();
const tVersi=()=>window.ANDROID&&window.FadzAndroid&&FadzAndroid.versi?'apk '+FadzAndroid.versi():'web '+VER;
const tStatAktif=()=>!TPRATINJAU&&!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&S.stat!==false;
function tataCatat(a){if(!tStatAktif())return;const k=tKunci(a||'beranda');TSTAT.hal[k]=(TSTAT.hal[k]||0)+1;TSTAT.pv++;clearTimeout(TSTT);TSTT=setTimeout(tataKirim,30000)}
function tataKirim(){if(!tStatAktif()||!navigator.onLine)return;const hari=tHari(),F=[];let baru=0;
 try{if(localStorage.fzstat!=hari){baru=1}}catch(e){}
 if(!TSTAT.pv&&!baru)return;
 const inc=(p,n)=>F.push({fieldPath:p,increment:{integerValue:String(n)}});
 if(TSTAT.pv)inc('pv',TSTAT.pv);Object.entries(TSTAT.hal).forEach(([k,n])=>inc('hal.'+k,n));
 if(baru){inc('aktif',1);inc('kota.'+tKunci(S.loc&&S.loc.n),1);inc('jenis.'+tJenis(),1)}
 TSTAT.hal={};TSTAT.pv=0;
 fetch(FSURL.replace(/\/documents$/,'/documents:commit')+'?key='+FBCFG.apiKey,{method:'POST',keepalive:true,headers:{'content-type':'application/json'},
  body:JSON.stringify({writes:[{transform:{document:'projects/'+FBCFG.projectId+'/databases/(default)/documents/stat/'+hari,fieldTransforms:F}}]})})
  .then(r=>{if(r.ok&&baru){try{localStorage.fzstat=hari}catch(e){}
   /* Model HP & versi dikirim terpisah: bila Firestore Rules belum diperbarui, hanya kiriman ini yang ditolak (statistik utama tetap tercatat) */
   const G=[{fieldPath:'model.'+tKunci(TMODEL||'lainnya'),increment:{integerValue:'1'}},{fieldPath:'versi.'+tKunci(tVersi()),increment:{integerValue:'1'}}];
   fetch(FSURL.replace(/\/documents$/,'/documents:commit')+'?key='+FBCFG.apiKey,{method:'POST',keepalive:true,headers:{'content-type':'application/json'},
    body:JSON.stringify({writes:[{transform:{document:'projects/'+FBCFG.projectId+'/databases/(default)/documents/stat/'+hari,fieldTransforms:G}}]})}).catch(()=>{})}}).catch(()=>{})}
document.addEventListener('visibilitychange',()=>{if(document.hidden)tataKirim()});

/* ===== Mode admin di aplikasi: admin yang masuk bisa menggeser/menyembunyikan bagian Beranda, pintasan, Semua Menu, dan Pengaturan ===== */
let TADM=null,TADMON=false,TDRAF=null;
async function tataAuth(u){TADM=null;if(!u||!u.email||!u.emailVerified)return tataAdminUI();const e=u.email.toLowerCase();
 let L=TPEMILIK.slice();try{const d=await FBD.collection('config').doc('admin').get();if(d.exists)L=L.concat((d.data().emails||[]).map(x=>String(x).toLowerCase()))}catch(x){}
 if(L.includes(e))TADM=e;tataAdminUI();
 /* Halaman Akun & Profil yang sudah terbuka digambar ulang agar baris "Mode admin" muncul */
 if(TADM&&location.hash=='#/pengaturan/akun'&&typeof route=='function')route()}
const tataAdminKah=()=>!!TADM;
/* Tombol "Mode admin" muncul di halaman yang bisa diatur */
function tataAdminUI(){dispatchEvent(new Event('fzadmin'));$('#tadm')?.remove();document.body.classList.toggle('tadmon',!!TADMON);const a=location.hash.slice(2).split('/');if(!TADM||TPRATINJAU||!(['','menu'].includes(a[0])||(a[0]=='pengaturan'&&!a[1])))return;
 /* Tombol "Mode admin" tidak melayang di Beranda / Semua Menu (menghalangi isi): hanya di Pengaturan; saat mode admin aktif, bilah Terbitkan tetap tampil */
 /* Tombol "Mode admin" ada di Pengaturan › Akun & Profil (tidak melayang); bilah Terbitkan/Batal hanya tampil saat mode admin aktif */
 if(!TADMON)return;
 document.body.insertAdjacentHTML('beforeend',`<div id="tadm" class="tadm${TADMON?' on':''}">${TADMON?`<b>Mode admin</b><button type="button" data-tadm="simpan" class="pri">Terbitkan</button><button type="button" data-tadm="batal">Batal</button><a href="admin.html" target="_blank" rel="noopener">Dashboard</a>`:`<button type="button" data-tadm="mulai">${ic('sliders',16)} Mode admin</button>`}</div>`)}
/* Kendali naik/turun/sembunyikan dipasang pada elemen ber-data-ta="jenis:kunci" */
function tataAdminPasang(){if(!TADMON)return;$$('#view [data-ta]').forEach(el=>{if($(':scope > .tak',el))return;const [j,k]=el.dataset.ta.split(':'),sembunyi=el.classList.contains('tah');
 el.insertAdjacentHTML('afterbegin',`<span class="tak"><button type="button" data-tak="naik" aria-label="Naikkan">▲</button><button type="button" data-tak="turun" aria-label="Turunkan">▼</button>${j=='beranda'||j=='set'?`<button type="button" data-tak="lihat" aria-label="${sembunyi?'Tampilkan':'Sembunyikan'}">${sembunyi?'Tampilkan':'Sembunyikan'}</button>`:`<button type="button" data-tak="hapus" aria-label="Keluarkan">Keluarkan</button>`}</span>`)})}
function tataGeser(j,k,aksi){const D=TDRAF,pind=(A,i,d)=>{const t=i+d;if(i<0||t<0||t>=A.length)return;[A[i],A[t]]=[A[t],A[i]]};
 if(j=='beranda'){const i=D.beranda.findIndex(x=>x.id==k);if(aksi=='lihat')D.beranda[i].on=!D.beranda[i].on;else pind(D.beranda,i,aksi=='naik'?-1:1)}
 else if(j=='pin'){const i=D.pintasan.indexOf(k);if(aksi=='hapus')D.pintasan.splice(i,1);else pind(D.pintasan,i,aksi=='naik'?-1:1)}
 else if(j=='menu'){const [g,r]=k.split('|'),G=D.menu[+g];const i=G.isi.indexOf(r);if(aksi=='hapus')G.isi.splice(i,1);else pind(G.isi,i,aksi=='naik'?-1:1)}
 else if(j=='set'){if(!D.setelan)D.setelan=SETGROUPS.map(x=>x[0]);D.sembunyiSet=D.sembunyiSet||[];const i=D.setelan.indexOf(k);if(aksi=='lihat'){const s=D.sembunyiSet.indexOf(k);s<0?D.sembunyiSet.push(k):D.sembunyiSet.splice(s,1)}else pind(D.setelan,i,aksi=='naik'?-1:1)}
 TATA=tataGabung(D);route()}
/* Menerbitkan: simpan ke config/tampilan + riwayat (dijaga Firestore Rules: hanya admin) */
async function tataTerbitkan(c,ket){const v=Date.now(),json=JSON.stringify(c);const ref=FBD.collection('config').doc('tampilan');
 await ref.set({json,v,t:v,oleh:TADM||'',ket:ket||''});await ref.collection('riwayat').add({json,v,t:v,oleh:TADM||'',ket:ket||''});TATAV=v;try{localStorage.fztata=JSON.stringify({v,c})}catch(e){}}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-tadm]');if(b){const a=b.dataset.tadm;
  if(a=='mulai'){TADMON=true;TDRAF=JSON.parse(JSON.stringify(TATA));toast('Mode admin: geser atau sembunyikan bagian, lalu Terbitkan');
   /* Dimulai dari Akun & Profil: buka Beranda agar bisa langsung mengatur */
   const h=location.hash.slice(2).split('/');if(!(['','menu'].includes(h[0])||(h[0]=='pengaturan'&&!h[1]))){location.hash='#/';return}}
  else if(a=='batal'){TADMON=false;TDRAF=null;TATA=tataGabung((tataBaca()||{}).c);toast('Perubahan dibatalkan')}
  else if(a=='simpan'){b.disabled=true;try{await tataTerbitkan(TDRAF,'Mode admin di aplikasi');TADMON=false;TATA=tataGabung(TDRAF);TDRAF=null;toast('Tampilan diterbitkan untuk semua pengguna')}catch(x){b.disabled=false;return toast('Gagal menerbitkan: '+(x.code||x.message))}}
  route();return}
 const t=e.target.closest('[data-tak]');if(t&&TADMON){e.preventDefault();e.stopPropagation();const el=t.closest('[data-ta]'),[j,k]=el.dataset.ta.split(/:(.*)/s);tataGeser(j,k,t.dataset.tak)}},true);
