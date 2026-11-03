/* js/core/tata.js - Tata letak aplikasi yang bisa diatur admin (dashboard admin.html > Tampilan, atau Mode admin di aplikasi).
   TATA_BAWAAN = susunan asli di kode. Admin menerbitkan perubahan ke Firestore config/tampilan (field "json");
   aplikasi mengambilnya lewat REST (tanpa memuat Firebase), menyimpannya untuk offline, lalu menerapkannya.
   Juga: statistik pemakaian ringan tanpa data pribadi (koleksi "stat", satu dokumen per hari). */
const FSURL='https://firestore.googleapis.com/v1/projects/'+FBCFG.projectId+'/databases/(default)/documents';
const TPRATINJAU=new URLSearchParams(location.search).has('pratinjau');
const TPEMILIK=['hilmykia@gmail.com','ponpesfadzkuruuni@gmail.com'];

/* Semua tujuan yang bisa dipakai di pintasan, Semua Menu, dan menu bawah: rute -> [ikon, nama] */
const TPOOL=(()=>{const P={'':['home','Beranda'],menu:['grid','Lainnya']};MENUALL.forEach(g=>g[1].forEach(m=>P[m[0]]=[m[1],m[2]]));SHORT.forEach(s=>P[s[0]]=P[s[0]]||[s[1],s[2]]);
 Object.assign(P,{zakat:P.zakat||['heart','Zakat & Sedekah'],lapor:['flag','Laporkan masalah'],ai:P.ai||['spark','Fadz AI'],kalender:P.kalender||['cal','Kalender'],pengaturan:P.pengaturan||['sliders','Pengaturan']});return P})();
/* Bagian Beranda: id -> nama (untuk dashboard & mode admin) */
const TBAG={lokasi:'Logo & lokasi',catatan:'Catatan pembuka',pengumuman:'Pengumuman admin',sapa:'Sapaan & tanggal',jadwal:'Jam & jadwal salat',pintasan:'Pintasan',cari:'Pencarian',promo:'Kartu promo (zakat, tahlil, waris)',lanjut:'Lanjutkan membaca',doa:'Doa hari ini'};
const TATA_BAWAAN={beranda:Object.keys(TBAG).map(id=>({id,on:true})),pintasan:SHORT.map(s=>s[0]),menu:MENUALL.map(g=>({nama:g[0],isi:g[1].map(m=>m[0])})),
 nav:['','quran','ai','kalender','pengaturan'],setelan:null,sembunyiSet:[],label:{},umum:{on:false,judul:'',teks:'',tautan:'',label:'Buka'},bawaan:{}};

/* Gabungkan konfigurasi admin dengan bawaan: urutan dari admin, bagian baru dari kode tetap muncul (di akhir) */
function tataGabung(c){const B=JSON.parse(JSON.stringify(TATA_BAWAAN)),T=Object.assign(B,c&&typeof c=='object'?c:{});
 if(c&&Array.isArray(c.beranda)){const ada=new Set(c.beranda.map(x=>x.id));T.beranda=c.beranda.filter(x=>TBAG[x.id]).concat(TATA_BAWAAN.beranda.filter(x=>!ada.has(x.id)))}
 const sah=r=>r in TPOOL;T.pintasan=(T.pintasan||[]).filter(sah);T.nav=(T.nav||[]).filter(r=>sah(r)&&!r.includes('/')).slice(0,5);if(T.nav.length<2)T.nav=TATA_BAWAAN.nav.slice();
 T.menu=(T.menu||[]).map(g=>({nama:String(g.nama||''),isi:(g.isi||[]).filter(sah)})).filter(g=>g.isi.length);T.label=T.label||{};T.umum=Object.assign({},TATA_BAWAAN.umum,T.umum||{});T.bawaan=T.bawaan||{};return T}
const tataBaca=()=>{try{return JSON.parse(localStorage.fztata||'null')}catch(e){return null}};
let TATAV=(tataBaca()||{}).v||0,TATA=tataGabung((tataBaca()||{}).c);

const tNama=(r,d)=>TATA.label[r]||d||(TPOOL[r]||[])[1]||r;
const tIkon=r=>(TPOOL[r]||['grid'])[0];
const tataPintasan=()=>TATA.pintasan.map(r=>[r,tIkon(r),tNama(r)]);
const tataMenu=()=>TATA.menu.map(g=>[g.nama,g.isi.map(r=>[r,tIkon(r),tNama(r)])]);
const tataSetelan=()=>{const G=SETGROUPS,urut=TATA.setelan;let L=G;if(Array.isArray(urut)){const m=new Map(G.map(x=>[x[0],x]));L=urut.map(k=>m.get(k)).filter(Boolean).concat(G.filter(x=>!urut.includes(x[0])))}return L.filter(x=>!(TATA.sembunyiSet||[]).includes(x[0]))};
const tataNavR=()=>TATA.nav;

/* Menu bawah/samping dibangun dari TATA.nav */
function tataNav(){const n=$('#nav');if(!n)return;$$('a[data-r]',n).forEach(a=>a.remove());n.insertAdjacentHTML('beforeend',TATA.nav.map(r=>`<a href="#/${r}" data-r="${r}" data-tip="${esc(tNama(r))}">${ic(tIkon(r))}<span>${esc(tNama(r))}</span></a>`).join(''))}

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
else{tataAmbil(1);document.addEventListener('visibilitychange',()=>{if(!document.hidden)tataAmbil()})}

/* ===== Statistik ringan (tanpa data pribadi): jumlah buka per fitur, perangkat aktif harian, kota, jenis aplikasi ===== */
const TSTAT={hal:{},pv:0};let TSTT=0;
const tKunci=s=>String(s||'lain').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,40)||'lain';
const tHari=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const tJenis=()=>window.ANDROID||/; wv\)/.test(navigator.userAgent)||document.referrer.startsWith('android-app://')?'android':matchMedia('(display-mode: standalone)').matches?'terpasang':'browser';
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
  .then(r=>{if(r.ok&&baru)try{localStorage.fzstat=hari}catch(e){}}).catch(()=>{})}
document.addEventListener('visibilitychange',()=>{if(document.hidden)tataKirim()});

/* ===== Mode admin di aplikasi: admin yang masuk bisa menggeser/menyembunyikan bagian Beranda, pintasan, Semua Menu, dan Pengaturan ===== */
let TADM=null,TADMON=false,TDRAF=null;
async function tataAuth(u){TADM=null;if(!u||!u.email||!u.emailVerified)return tataAdminUI();const e=u.email.toLowerCase();
 let L=TPEMILIK.slice();try{const d=await FBD.collection('config').doc('admin').get();if(d.exists)L=L.concat((d.data().emails||[]).map(x=>String(x).toLowerCase()))}catch(x){}
 if(L.includes(e))TADM=e;tataAdminUI()}
const tataAdminKah=()=>!!TADM;
/* Tombol "Mode admin" muncul di halaman yang bisa diatur */
function tataAdminUI(){$('#tadm')?.remove();document.body.classList.toggle('tadmon',!!TADMON);const a=location.hash.slice(2).split('/');if(!TADM||TPRATINJAU||!(['','menu'].includes(a[0])||(a[0]=='pengaturan'&&!a[1])))return;
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
  if(a=='mulai'){TADMON=true;TDRAF=JSON.parse(JSON.stringify(TATA));toast('Mode admin: geser atau sembunyikan bagian, lalu Terbitkan')}
  else if(a=='batal'){TADMON=false;TDRAF=null;TATA=tataGabung((tataBaca()||{}).c);toast('Perubahan dibatalkan')}
  else if(a=='simpan'){b.disabled=true;try{await tataTerbitkan(TDRAF,'Mode admin di aplikasi');TADMON=false;TATA=tataGabung(TDRAF);TDRAF=null;toast('Tampilan diterbitkan untuk semua pengguna')}catch(x){b.disabled=false;return toast('Gagal menerbitkan: '+(x.code||x.message))}}
  route();return}
 const t=e.target.closest('[data-tak]');if(t&&TADMON){e.preventDefault();e.stopPropagation();const el=t.closest('[data-ta]'),[j,k]=el.dataset.ta.split(/:(.*)/s);tataGeser(j,k,t.dataset.tak)}},true);
