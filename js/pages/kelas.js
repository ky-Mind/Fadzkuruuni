/* js/pages/kelas.js - Kelas online: pengajian live (suara saja) di ruang majelis bergaya piksel.
   - Jadwal kelas: Firestore koleksi "kelas" {judul, pengajar, ket, mulai(ms), status 'jadwal'|'live'|'selesai', rekaman?}.
     Semua orang boleh membaca (lewat REST), hanya admin yang membuat/mengubah (lewat Firebase SDK).
   - Suara: LiveKit (server audio, kuat untuk ratusan pendengar). Token dari api/kelas.
     Admin (ustaz) bisa bicara; jamaah mendengar, bisa "Angkat tangan" lalu diizinkan bicara oleh admin.
   - Selama kelas berjalan, pengguna boleh membuka halaman lain (mis. kitab); ada pil "Live" untuk kembali. */
/* Pustaka LiveKit disimpan di aplikasi sendiri (CDN kadang diblokir operator seluler); CDN hanya cadangan */
const LKJS='js/lib/livekit-client-2.15.7.umd.js',LKJS_CDN='https://cdn.jsdelivr.net/npm/livekit-client@2.15.7/dist/livekit-client.umd.js';
const lkMuat=()=>ldjs(LKJS).catch(()=>ldjs(LKJS_CDN));
let KELAS=null,KR=null,KSIAP=null;
/* Rincian teknis galat (nama + pesan) agar penyebab gagal masuk kelas bisa dilaporkan */
const kGalatRinci=e=>{if(!e||typeof e=='string')return '';const t=[e.name,e.message].filter(Boolean).join(': ').slice(0,160);return t?`<br><small class="mut" style="opacity:.8">Rincian: ${esc(t)}</small>`:''};const KULANG={};
let KKUNCI=null;
async function kelasCekServer(){try{const r=await fetch('api/kelas',{method:'POST',headers:{'content-type':'application/json'},body:'{"aksi":"cek"}'});KSIAP=r.ok;if(r.ok)KKUNCI=(await r.json().catch(()=>({}))).kunci||null}catch(e){KSIAP=null}return KSIAP}
const fsNilai=v=>v==null?null:'stringValue' in v?v.stringValue:'integerValue' in v?+v.integerValue:'doubleValue' in v?+v.doubleValue:'booleanValue' in v?v.booleanValue:null;
async function kelasAmbil(){try{const r=await fetch(FSURL+'/kelas?pageSize=100',{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();
  KELAS=(j.documents||[]).map(d=>{const o={id:d.name.split('/').pop()};for(const [k,v] of Object.entries(d.fields||{}))o[k]=fsNilai(v);return o});try{localStorage.fzkelas=JSON.stringify(KELAS)}catch(e){}}
 catch(e){if(!KELAS)try{KELAS=JSON.parse(localStorage.fzkelas||'[]')}catch(x){KELAS=[]}}return KELAS}
const kJam=t=>t?new Date(t).toLocaleString('id-ID',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):'';
/* Kelas dengan tautan YouTube (live streaming atau rekaman): tampil sebagai video, bukan ruang suara */
const ytId=u=>{const m=String(u||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|embed\/|shorts\/))([\w-]{11})/);return m?m[1]:''};
const ytGambar=id=>`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const ytInfo=async u=>{try{const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(u));return r.ok?await r.json():null}catch(e){return null}};
/* Admin kelas: pemilik / admin dengan akses "semua" atau "kelas" (pengajar Kelas online) */
const kAdmin=()=>typeof adminBisa=='function'&&adminBisa('kelas');

/* ---------- Daftar kelas ---------- */
function kelasKartu(k){const live=k.status=='live',sel=k.status=='selesai',adm=kAdmin();
 return `<div class="kls${live?' live':''}">${live?`<div class="klt"><span class="klv">● Sedang live</span>${KR&&KR.id==k.id?'<small class="mut">Kamu sedang di kelas ini</small>':''}</div>`:`<small class="mut">${sel?'Selesai · ':''}${esc(kJam(k.mulai))}</small>`}
  ${k.yt?`<a class="kyt" href="#/kelas/${k.id}" aria-label="Tonton ${esc(k.judul||'video')}"><img src="${ytGambar(k.yt)}" alt="" loading="lazy"><span class="kyp">${ic('play',26)}</span>${live?'<span class="klv kytl">● LIVE</span>':''}</a>`:''}
  <b>${esc(k.judul||'Kelas')}</b>${k.pengajar?`<small class="mut">${esc(k.pengajar)}</small>`:''}${k.ket?`<p>${esc(k.ket)}</p>`:''}
  <div class="kla">${live?`<a class="btn" href="#/kelas/${k.id}">${ic(k.yt?'play':'siar',18)} ${k.yt?'Tonton live':'Masuk dan dengarkan'}</a>`:''}${sel&&k.rekaman?(ytId(k.rekaman)?`<a class="sb" href="#/kelas/${k.id}">${ic('play',16)} Putar rekaman</a>`:`<a class="sb" href="${esc(k.rekaman)}" target="_blank" rel="noopener">${ic('play',16)} Putar rekaman</a>`):''}${adm&&!sel?`<button class="sb" data-kytset="${k.id}">${k.yt?'Ubah':'Tempel'} link YouTube</button>`:''}
  ${adm&&!sel?(live?`<button class="sb" data-kakhir="${k.id}">Akhiri kelas</button>`:`<button class="sb pri" data-kmulai="${k.id}">Mulai kelas</button>`):''}${adm&&sel?`<button class="sb" data-ktaut="${k.id}">${k.rekaman?'Ubah':'Isi'} tautan rekaman</button>`:''}${adm?`<button class="sb" data-ktgl="${k.id}">Ubah tanggal</button><button class="sb dng" data-khapus="${k.id}">Hapus</button>`:''}</div>${!k.yt&&k.mode=='mesh'&&!sel?'<small class="mut">Kelas kecil (maks. ±10 jamaah).</small>':''}${k.rekam&&!sel?'<small class="mut">Kelas ini direkam.</small>':''}</div>`}
function kelasDaftar(){const e=$('#kls');if(e)e.innerHTML=kelasDaftarHtml()}
function kelasDaftarHtml(){const L=(KELAS||[]).slice(),now=Date.now();
 const live=L.filter(k=>k.status=='live'),akan=L.filter(k=>k.status!='live'&&k.status!='selesai').sort((a,b)=>(a.mulai||0)-(b.mulai||0)),sel=L.filter(k=>k.status=='selesai').sort((a,b)=>(b.mulai||0)-(a.mulai||0)).slice(0,20);
 const peringat=kAdmin()?(KSIAP&&KKUNCI&&KKUNCI!='cocok'?`<div class="kperingat">${ic('info',18)}<span><b>Kunci LiveKit ditolak server (${esc(KKUNCI)}).</b> LIVEKIT_API_KEY / LIVEKIT_API_SECRET di Vercel tidak cocok dengan project LiveKit. Buat API key baru di LiveKit Cloud (Settings › API Keys), salin key dan secret-nya ke Vercel (Settings › Environment Variables), lalu Redeploy.</span></div>`:KSIAP===false?`<div class="kperingat">${ic('info',18)}<span><b>Server suara belum disiapkan.</b> Isi LIVEKIT_URL, LIVEKIT_API_KEY, dan LIVEKIT_API_SECRET di Vercel (Settings › Environment Variables), lalu Redeploy. Sebelum itu, kelas besar otomatis berjalan sebagai kelas kecil (maks. ±10 jamaah).</span></div>`:'')
  :'';
 return peringat+(kAdmin()?`<button class="btn kbuat" data-kbuat>${ic('plus',18)} Buat kelas</button>`:'')
  +(live.length?live.map(kelasKartu).join(''):`<div class="card mut kkosong">${ic('siar',22)}<span>Belum ada kelas yang sedang live. Jadwal kelas berikutnya ada di bawah.</span></div>`)
  +(akan.length?'<h2>Jadwal berikutnya</h2>'+akan.map(kelasKartu).join(''):'')+(sel.length?'<h2>Sudah selesai</h2>'+sel.map(kelasKartu).join(''):'')
  +(!L.length?'<p class="mut">Kelas online (pengajian, ngaji kitab) akan muncul di sini saat dijadwalkan oleh pengurus.</p>':'')}

/* ---------- Ruang majelis ---------- */
/* Daftar tersimpan dipakai langsung (tanpa "Memuat…") agar geser antarhalaman tidak meloncat; diperbarui setelahnya */
try{KELAS=KELAS||JSON.parse(localStorage.fzkelas||'null')}catch(e){}
PRATINJAU.kelas=id=>id?null:head('Kelas online','#/')+'<div id="kls">'+kelasDaftarHtml()+'</div>';
P.kelas=id=>{if(!id)return {html:head('Kelas online','#/')+'<div id="kls">'+(KELAS?kelasDaftarHtml():'<p class="mut">Memuat jadwal kelas…</p>')+'</div>',init(){if(KELAS)kelasDaftar();kelasAmbil().then(kelasDaftar);if(kAdmin()&&KSIAP===null)kelasCekServer().then(kelasDaftar)}};
 const k=(KELAS||[]).find(x=>x.id==id)||{id,judul:'Kelas online'},vid=k.yt||(k.status=='selesai'&&ytId(k.rekaman));
 if(vid)return {html:head(esc(k.judul||'Kelas online'),'#/kelas',k.status=='live'?'<span class="klv kll">● Live</span>':'')+`<div class="kvid"><iframe src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&playsinline=1&rel=0" title="${esc(k.judul||'Video kelas')}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
  <div class="kinfo"><b>${esc(k.judul||'')}</b>${k.pengajar?`<br><small class="mut">${esc(k.pengajar)}</small>`:''}${k.ket?`<p>${esc(k.ket)}</p>`:''}<p><a class="sb" href="https://www.youtube.com/watch?v=${vid}" target="_blank" rel="noopener">${ic('share',16)} Buka di YouTube</a></p></div>`,init(){if(KR&&KR.id!=id)kelasKeluar(1)}};
 return {html:head(esc(k.judul||'Kelas online'),'#/kelas',`<span class="klv kll" id="klst">${KR&&KR.id==id?'● Live':''}</span>`)+`<div class="kz" id="kz"><div class="kzm"><div class="kzs" id="kzs"><video id="kzv" autoplay playsinline muted hidden></video><div id="kzsa" class="kzsa"><div class="kzw">${ic('siar',28)}<span>Menyambungkan…</span></div></div><div class="kzsn" id="kzsn"></div><div class="kzbar"><button type="button" class="kzfs kzorang on" data-kzorang aria-label="Tampilkan atau sembunyikan peserta" title="Peserta">${ic('users',18)}</button><button type="button" class="kzfs" data-kzkitab aria-label="Buka kitab di samping" title="Kitab">${ic('book',18)}</button><button type="button" class="kzfs" data-kzfs aria-label="Layar penuh" title="Layar penuh">${ic('full',18)}</button></div></div><div class="kzg" id="kzg"></div></div><aside class="kzk" id="kzk" hidden></aside></div>
  <div id="kinfo" class="kinfo"><p class="mut">Menyambungkan ke kelas…</p></div><div id="kctl" class="kctl"></div>
  <div class="kchat"><h2>Pesan</h2><div id="kcl" class="kcl"><p class="mut">Belum ada pesan.</p></div><form id="kcf" class="kcf" autocomplete="off"><input class="in" id="kci" maxlength="500" placeholder="Tulis pesan untuk kelas…" enterkeyhint="send"><button class="btn" type="submit" aria-label="Kirim">${ic('send',18)}</button></form></div><div id="kadm"></div>`,
  init(){kelasMasuk(id)}}};

/* ---------- Tampilan seperti Zoom: pengajar besar di atas (kamera bila menyala), jamaah kotak kecil di bawah ---------- */
const kHash=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
/* Boleh bicara: pengajar, atau jamaah yang diizinkan (LiveKit: sumber mikrofon diizinkan; kelas kecil: boleh) */
const kBoleh=p=>{if(!p)return false;if((p.attributes||{}).peran=='ustaz')return true;const m=p.permissions;if(!m||!m.canPublish)return false;const s=m.canPublishSources;return !s||!s.length||s.some(x=>x==2||x=='microphone'||x=='MICROPHONE')};
/* Video tiap orang: pengajar → panggung besar (KR.video); jamaah → kotaknya (KR.vid) */
/* Kamera yang dipakai: depan (user) atau belakang (environment); tombol ganti hanya muncul bila perangkat punya lebih dari satu kamera */
const kHadap=()=>S.khadap=='environment'?'environment':'user';
const kCamHitung=()=>navigator.mediaDevices&&navigator.mediaDevices.enumerateDevices&&navigator.mediaDevices.enumerateDevices().then(L=>{const n=L.filter(d=>d.kind=='videoinput').length>1;if(KR&&KR.camBanyak!==n){KR.camBanyak=n;kelasInfo()}}).catch(()=>{});
function kSetVid(p,st){if(!KR||!p)return;KR.vid=KR.vid||new Map();st?KR.vid.set(p.identity,st):KR.vid.delete(p.identity);if((p.attributes||{}).peran=='ustaz'){KR.video=st||null;KR.videoLokal=!!(st&&p===KR.room.localParticipant)}}
function kSetLayar(p,st){if(!KR||!p)return;KR.layar=KR.layar||new Map();st?KR.layar.set(p.identity,st):KR.layar.delete(p.identity);if(!st&&KR.pin===p.identity)KR.pin=null}
/* Berbagi layar? LiveKit: ada aliran layar; kelas kecil: tanda kamera='layar' (layar dikirim lewat jalur kamera) */
const kLayar=p=>!!(p&&((KR.layar&&KR.layar.get(p.identity))||(KR.mode=='mesh'&&(p.attributes||{}).kamera=='layar')));
function kStream(p){if(!p||!KR)return null;const L=KR.layar&&KR.layar.get(p.identity);if(L)return L;const k=(p.attributes||{}).kamera,saya=p===KR.room.localParticipant;
 if(KR.mode=='mesh'&&!saya&&!(k===undefined||k=='1'||k=='layar'))return null;return (KR.vid&&KR.vid.get(p.identity))||((p.attributes||{}).peran=='ustaz'?KR.video:null)||null}
const kAva=(p,z)=>{const f=(p.attributes||{}).foto;if(f&&(/^data:image\/(jpeg|png|webp);base64,/.test(f)||/^https:\/\/[\w.-]+\.(googleusercontent|fbcdn|facebook)\.(com|net)\//.test(f)))return `<img class="ava kzav" src="${esc(f)}" alt="" referrerpolicy="no-referrer" style="width:${z}px;height:${z}px">`;const h=kHash(p.identity)%360;return `<span class="ava kzav" style="width:${z}px;height:${z}px;font-size:${Math.round(z*.42)}px;background:hsl(${h} 42% 86%);color:hsl(${h} 45% 28%)">${esc(((p.name||'J').trim()[0]||'J').toUpperCase())}</span>`};
function kelasGambar(){const st=$('#kzs'),g=$('#kzg');if(!st||!g||!KR)return;const R=KR.room,saya=R.localParticipant,semua=[saya,...R.remoteParticipants.values()];
 const ust=semua.find(p=>(p.attributes||{}).peran=='ustaz'),nm=p=>p===saya?(p.name||'Kamu')+' (Kamu)':(p.name||'Jamaah');
 if(!ust&&KR.video&&!KR.admin)KR.video=null;/* pengajar keluar → jangan tampilkan gambar terakhirnya */
 if(KR.pin&&!semua.some(p=>p.identity===KR.pin))KR.pin=null;
 const fokus=semua.find(p=>p.identity===KR.pin)||semua.find(p=>kLayar(p))||ust;
 /* Panggung besar */
 const v=$('#kzv'),vs=fokus?kStream(fokus):null,lay=!!(fokus&&kLayar(fokus));if(v.srcObject!==vs){v.srcObject=vs;if(vs)v.play().catch(()=>{})}v.hidden=!vs;v.classList.toggle('cermin',!!(vs&&fokus===saya&&!lay));v.classList.toggle('layar',lay);
 const sa=$('#kzsa'),isi=vs?'':(fokus?kAva(fokus,104):`<div class="kzw">${ic('siar',28)}<span>Menunggu pengajar masuk…</span></div>`);const sk=(fokus?fokus.identity+'|'+((fokus.attributes||{}).foto||'').length:'')+(vs?'v':'');if(sa.dataset.k!==sk){sa.innerHTML=isi;sa.dataset.k=sk}
 $('#kzsn').innerHTML=fokus?`${fokus.isSpeaking?ic('speaker',15):''}<span>${esc(nm(fokus))}</span><small>${lay?'Berbagi layar':(fokus.attributes||{}).peran=='ustaz'?'Pengajar':''}${KR.pin?' · disorot':''}</small>`:'';
 st.classList.toggle('bicara',!!(fokus&&fokus.isSpeaking));st.dataset.kpin=KR.pin?'':'';st.title=KR.pin?'Ketuk untuk kembali':'';
 /* Kotak peserta lain (diperbarui di tempat agar video tidak berkedip). Ketuk = sorot di panggung */
 const ada=new Set();semua.filter(p=>p!==fokus).forEach(p=>{const id='kzt'+kHash(p.identity);ada.add(id);let t=document.getElementById(id);
  if(!t){t=document.createElement('button');t.type='button';t.id=id;t.className='kzt';t.innerHTML='<video autoplay playsinline muted hidden></video><span class="kza"></span><span class="kzn"></span>';g.append(t)}
  t.dataset.kpin=p.identity;
  const vs=kStream(p),vv=t.querySelector('video');if(vv.srcObject!==vs){vv.srcObject=vs;if(vs)vv.play().catch(()=>{})}vv.hidden=!vs;vv.classList.toggle('cermin',p===saya&&!kLayar(p));vv.classList.toggle('layar',kLayar(p));
  const a=t.querySelector('.kza');a.hidden=!!vs;const ak=(p.name||'')+'|'+((p.attributes||{}).foto||'').length;if(a.dataset.k!==ak){a.innerHTML=kAva(p,46);a.dataset.k=ak}
  t.classList.toggle('bicara',!!p.isSpeaking);t.classList.toggle('vid',!!vs);
  const n=`${(p.attributes||{}).tangan=='1'?`<span class="kzh">${ic('tangan',13)}</span>`:''}${kBoleh(p)?ic('mic',13):''}${esc(nm(p))}${(p.attributes||{}).peran=='ustaz'?' · Pengajar':''}`;const ne=t.querySelector('.kzn');if(ne.innerHTML!==n)ne.innerHTML=n});
 [...g.children].forEach(c=>{if(!ada.has(c.id))g.removeChild(c)})}

function kelasInfo(){const R=KR&&KR.room;if(!R)return;const semua=[R.localParticipant,...R.remoteParticipants.values()],bicara=semua.filter(p=>p.isSpeaking),saya=R.localParticipant,boleh=kBoleh(saya),tangan=(saya.attributes||{}).tangan=='1',mic=saya.isMicrophoneEnabled;
 const i=$('#kinfo');if(i)i.innerHTML=`<div class="kbic">${ic(bicara.length?'speaker':'speaker',18)}<span>${bicara.length?'<b>'+bicara.map(p=>esc(p.name||'Jamaah')).join(', ')+'</b> sedang berbicara':KR.mode=='mesh'&&!KR.admin&&!semua.some(p=>(p.attributes||{}).peran=='ustaz')?'Menunggu pengajar masuk…':'Menunggu suara…'}</span></div>
  <small class="mut">${KR.mode=='mesh'?'Kelas kecil · ':''}${semua.length} orang di majelis · ${KR.admin?'Kamu pengajar (mikrofon '+(mic?'nyala':'mati')+')':boleh?'Kamu diizinkan bicara':'Kamu mendengarkan, mikrofon mati'}</small>${KR.diam?'<button class="btn" data-kaudio style="width:100%;margin-top:10px">Ketuk untuk menyalakan suara</button>':''}`;
 const c=$('#kctl');if(c)c.innerHTML=((KR.admin||boleh)&&!mic?`<div class="kmicn">${ic('mic',20)}<span><b>Mikrofon mati.</b> ${KR.admin?'Tekan Aktifkan mikrofon saat mulai mengajar.':'Kamu diizinkan bicara. Tekan Aktifkan mikrofon untuk mulai berbicara.'}</span></div>`:'')
  +(KR.admin||boleh?`<button class="btn${mic?' s':''}" data-kmic>${ic('mic',18)} ${mic?'Matikan mikrofon':'Aktifkan mikrofon'}</button>`:`<button class="btn s" data-ktangan>${ic('tangan',18)} ${tangan?'Turunkan tangan':'Angkat tangan'}</button>`)+`<button class="btn s" data-kcam>${ic('camera',18)} ${KR.camOn?'Matikan kamera':'Nyalakan kamera'}</button>`+(KR.camOn&&KR.camBanyak?`<button class="btn s" data-kflip>${ic('camera',18)} ${kHadap()=='user'?'Pakai kamera belakang':'Pakai kamera depan'}</button>`:'')+(navigator.mediaDevices&&navigator.mediaDevices.getDisplayMedia?`<button class="btn s${KR.layarOn?' kon':''}" data-klayar>${ic('panel',18)} ${KR.layarOn?'Hentikan berbagi layar'+(kLayarSuara()?' <small>· dengan suara</small>':' <small>· tanpa suara</small>'):'Bagikan layar'}</button>`:'')+`<button class="btn s kkel" data-kkeluar>Keluar</button>`+(KR.admin?`<button class="btn s kkel" data-kakhirr>Akhiri kelas</button>`:'')+(KR.admin?`<button class="btn s krb" data-krec>${KREC?'<span class="krec">● Merekam</span> Hentikan & simpan':ic('mic',18)+' Rekam kelas'}</button>`:'');
 const a=$('#kadm');if(a&&KR.admin){const L=[...R.remoteParticipants.values()],T=L.filter(p=>(p.attributes||{}).tangan=='1'||kBoleh(p));
  a.innerHTML=`<h2>Jamaah yang angkat tangan</h2>`+(T.length?`<div class="list">${T.map(p=>`<div class="srw"><span class="si">${ic(kBoleh(p)?'mic':'tangan',18)}</span><span class="t">${esc(p.name||'Jamaah')}<br><small class="mut">${kBoleh(p)?'Boleh bicara':'Ingin bertanya'}</small></span><button class="btn s" data-kizin="${esc(p.identity)}" data-boleh="${kBoleh(p)?0:1}">${kBoleh(p)?'Bisukan':'Izinkan bicara'}</button></div>`).join('')}</div>`:'<p class="mut">Belum ada. Jamaah yang menekan "Angkat tangan" muncul di sini.</p>')}
 kelasGambar();kelasPil()}

async function kelasToken(id,aksi,lain){let idToken=null;try{if(typeof FBU!='undefined'&&FBU)idToken=await FBU.getIdToken()}catch(e){}
 const r=await fetch('api/kelas',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({aksi,kelas:id,idToken,nama:kNama()},lain||{}))});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw j.galat||('http-'+r.status);return j}
const KGAL={'belum-siap':'Server suara kelas belum disiapkan oleh pengelola aplikasi.','belum-mulai':'Kelas ini belum dimulai. Tunggu sampai pengajar memulai kelas.','kelas-tidak-ada':'Kelas tidak ditemukan.'};

const kAkun=async()=>{await fbInit();if(!window.firebase||!firebase.auth)return null;return new Promise(ok=>{const u=firebase.auth().onAuthStateChanged(x=>{u();ok(x)})})};
const kNama=()=>(S.nm||(typeof FBU!='undefined'&&FBU&&FBU.displayName)||'Jamaah').slice(0,40);
async function kelasMasuk(id,paksaLK){if(KR&&KR.id==id){kelasInfo();kelasChat(id);return kelasPasangTimer()}
 /* Ikut kelas wajib masuk akun: nama & foto profil di kelas diambil dari akun */
 if(!await kAkun()){const i=$('#kinfo');if(i)i.innerHTML=`<div class="kperingat">${ic('user',18)}<span><b>Masuk dulu untuk ikut kelas.</b> Nama dan foto profil dari akunmu akan tampil di kelas.</span></div><a class="btn" href="#/pengaturan/akun">Masuk dengan Google atau Email</a>`;const sa=$('#kzsa');if(sa)sa.innerHTML=`<div class="kzw">${ic('user',28)}<span>Masuk akun untuk bergabung</span></div>`;return}
 /* Dibuka langsung lewat tautan: muat data kelas dulu (status, jenis kelas) */
 if(!(KELAS||[]).some(x=>x.id==id))await kelasAmbil();
 if(KR)await kelasKeluar(1);const i=$('#kinfo');
 if(!navigator.onLine){if(i)i.innerHTML='<p class="mut">Kelas online butuh internet.</p>';return}
 const kk=(KELAS||[]).find(x=>x.id==id)||{};
 if(!paksaLK&&(kk.mode=='mesh'||(kk.mode!='livekit'&&KSIAP===false)))return kelasMasukMesh(id);
 try{let t;try{t=await kelasToken(id,'token')}catch(e){if(e=='belum-siap'){KSIAP=false;return kelasMasukMesh(id)}throw e}if(!window.LivekitClient)await lkMuat();const L=LivekitClient,R=new L.Room({adaptiveStream:false,dynacast:true,stopMicTrackOnMute:true});
  KR={id,room:R,admin:!!t.admin,diam:false,judul:((KELAS||[]).find(x=>x.id==id)||{}).judul||'Kelas online'};const ub=()=>KR&&KR.room===R&&kelasInfo();
  R.on(L.RoomEvent.TrackSubscribed,(tr,pub,p)=>{if(tr.kind=='video'){const st=new MediaStream([tr.mediaStreamTrack]);pub.source==L.Track.Source.ScreenShare?kSetLayar(p,st):kSetVid(p,st);return ub()}if(tr.kind=='audio'){const el=tr.attach();el.className='kaud';document.body.append(el);kelasRekamSambung(tr.mediaStreamTrack)}})
   .on(L.RoomEvent.LocalTrackPublished,pub=>{if(pub.kind=='video'&&pub.track){const st=new MediaStream([pub.track.mediaStreamTrack]);pub.source==L.Track.Source.ScreenShare?kSetLayar(R.localParticipant,st):kSetVid(R.localParticipant,st);ub()}})
   .on(L.RoomEvent.LocalTrackUnpublished,pub=>{if(pub.source==L.Track.Source.ScreenShare){kSetLayar(R.localParticipant,null);KR.layarOn=false;ub();kelasPil()}})
   .on(L.RoomEvent.TrackUnsubscribed,(tr,pub,p)=>{if(tr.kind=='video'){pub.source==L.Track.Source.ScreenShare?kSetLayar(p,null):kSetVid(p,null);ub()}tr.detach().forEach(el=>el.parentNode&&el.parentNode.removeChild(el))})
   .on(L.RoomEvent.ParticipantConnected,ub).on(L.RoomEvent.ParticipantDisconnected,ub).on(L.RoomEvent.ActiveSpeakersChanged,ub).on(L.RoomEvent.ParticipantAttributesChanged,ub)
   .on(L.RoomEvent.LocalTrackPublished,ub).on(L.RoomEvent.LocalTrackUnpublished,ub).on(L.RoomEvent.TrackMuted,(pub,p)=>{if(pub.kind=='video'&&p!==R.localParticipant)(pub.source==L.Track.Source.ScreenShare?kSetLayar:kSetVid)(p,null);ub()}).on(L.RoomEvent.TrackUnmuted,(pub,p)=>{if(pub.kind=='video'&&pub.track&&p!==R.localParticipant)(pub.source==L.Track.Source.ScreenShare?kSetLayar:kSetVid)(p,new MediaStream([pub.track.mediaStreamTrack]));ub()})
   .on(L.RoomEvent.ParticipantPermissionsChanged,(prev,p)=>{if(p===R.localParticipant&&!KR.admin){if(kBoleh(p)&&!kBoleh({permissions:prev})){toast('Kamu diizinkan bicara. Tekan Aktifkan mikrofon.');R.localParticipant.setAttributes({tangan:''}).catch(()=>{})}}ub()})
   .on(L.RoomEvent.AudioPlaybackStatusChanged,()=>{KR.diam=!R.canPlaybackAudio;ub()})
   .on(L.RoomEvent.Disconnected,a=>kelasPutus(R,a));
  await R.connect(t.url,t.token);try{await R.startAudio()}catch(e){}KR.diam=!R.canPlaybackAudio;if(fotoProfil())R.localParticipant.setAttributes({foto:fotoProfil()}).catch(()=>{});
  KULANG[id]=0;const s=$('#klst');if(s)s.textContent='● Live';kelasInfo();kelasPasangTimer();kelasChat(id);if(KR.admin&&((KELAS||[]).find(x=>x.id==id)||{}).rekam)kelasRekamMulai()}
 catch(e){KR=null;console.warn('kelas',e);if(!paksaLK&&kk.mode!='livekit'&&e!='belum-mulai'&&e!='kelas-tidak-ada'){try{KR&&KR.room&&KR.room.disconnect()}catch(x){}KR=null;return kelasMasukMesh(id,true)}if(i)i.innerHTML=`<p class="mut">${esc(KGAL[e]||(/^http-/.test(e)?'Server kelas tidak bisa dihubungi ('+e+'). Coba lagi sebentar.':'Tidak bisa masuk kelas. Periksa internet lalu coba lagi.'))}${kGalatRinci(e)}</p><button class="btn s" data-kulang="${id}">Coba lagi</button>`}}
function kelasPutus(R,alasan){if(KR&&KR.room===R){const kid=KR.id,ulang=alasan!=null&&![1,2,4,5,10].includes(alasan)&&(KULANG[kid]||0)<3&&location.hash=='#/kelas/'+kid;if(KREC)kelasRekamStop();if(KR.chatUnsub)try{KR.chatUnsub()}catch(e){}KR=null;kelasPil();const s=$('#klst');if(s)s.textContent='';const x=$('#kinfo');const c=$('#kctl');if(c)c.innerHTML='';const a=$('#kadm');if(a)a.innerHTML='';
  /* Sinyal HP berganti / internet putus sebentar: sambungkan lagi otomatis (maks. 3 kali) */
  if(ulang){KULANG[kid]=(KULANG[kid]||0)+1;if(x)x.innerHTML='<p class="mut">Sambungan terputus, menyambung ulang…</p>';setTimeout(()=>{if(!KR&&location.hash=='#/kelas/'+kid)kelasMasuk(kid)},1500*KULANG[kid]);return}
  if(x)x.innerHTML=`<p class="mut">Kelas sudah berakhir atau sambungan terputus.</p><button class="btn s" data-kulang="${kid}">Sambungkan lagi</button> <a class="btn s" href="#/kelas">Kembali ke daftar kelas</a>`}}
/* Kelas kecil tanpa LiveKit (js/pages/kelas-mesh.js) */
async function kelasMasukMesh(id,dariLK){const i=$('#kinfo'),k=(KELAS||[]).find(x=>x.id==id)||{},admin=kAdmin();
 try{if(k.status!='live'&&!admin)throw 'belum-mulai';let R=null;
  R=await kelasMesh(id,admin,kNama(),()=>{if(KR&&R&&KR.room===R){KR.diam=!R.canPlaybackAudio;kelasInfo()}},FBU&&FBU.uid);
  R.onDisconnected=()=>kelasPutus(R);KR={id,room:R,admin,diam:!R.canPlaybackAudio,mode:'mesh',judul:k.judul||'Kelas online'};R.onVideo=st=>{if(KR&&KR.room===R&&!admin){KR.video=st;KR.videoLokal=false;kelasInfo()}};
  R.onLayarSelesai=()=>{if(KR&&KR.room===R){KR.layarOn=false;kSetLayar(R.localParticipant,null);kelasInfo();kelasPil()}};R.onVideoJamaah=(j,st)=>{if(!KR||KR.room!==R)return;KR.vid=KR.vid||new Map();st?KR.vid.set(j,st):KR.vid.delete(j);kelasInfo()};kelasChat(id);
  KULANG[id]=0;const s=$('#klst');if(s)s.textContent='● Live';kelasInfo();kelasPasangTimer();if(admin&&k.rekam)kelasRekamMulai()}
 catch(e){KR=null;console.warn('kelas kecil',e);
  /* Kelas kecil gagal (mis. aturan Firestore belum dipublish) → coba lewat LiveKit bila servernya siap */
  if(!dariLK&&e!='belum-mulai'&&KSIAP!==false)return kelasMasuk(id,true);
  if(i)i.innerHTML=`<p class="mut">${esc(KGAL[e]||(e&&e.code=='permission-denied'?'Kelas kecil belum aktif: aturan Firestore terbaru belum dipublish oleh pengelola.':'Tidak bisa masuk kelas. Periksa internet lalu coba lagi.'))}${kGalatRinci(e)}</p><button class="btn s" data-kulang="${id}">Coba lagi</button>`}}
let KTM=0;function kelasPasangTimer(){clearInterval(KTM);KTM=setInterval(()=>{if(!KR||!$('#kzs'))return clearInterval(KTM);kelasGambar()},500)}
async function kelasKeluar(diam){if(KREC)await kelasRekamStop();const r=KR&&KR.room;try{const lp=r&&r.localParticipant;if(lp){if(lp.setCameraEnabled&&KR.camOn)await lp.setCameraEnabled(false);if(lp.setMicrophoneEnabled&&lp.isMicrophoneEnabled)await lp.setMicrophoneEnabled(false)}}catch(e){}
 $$('#kzv,.kzt video').forEach(v=>{const s=v.srcObject;if(s&&s.getTracks)s.getTracks().forEach(t=>{if(t.readyState=='live'&&KR&&KR.videoLokal)t.stop()});v.srcObject=null});if(KR&&KR.chatUnsub)try{KR.chatUnsub()}catch(e){}KR=null;clearInterval(KTM);$$('audio.kaud').forEach(a=>a.parentNode.removeChild(a));if(r)try{await r.disconnect()}catch(e){}kelasPil();if(!diam&&/^#\/kelas\//.test(location.hash))location.hash='#/kelas'}

/* Pil "Live" melayang saat kelas berjalan dan pengguna membuka halaman lain */
function kelasPil(){let p=$('#klmini');const di=KR&&location.hash.startsWith('#/kelas/'+KR.id);
 if(!KR||!KR.layarOn||di){if(p)p.hidden=true;return}
 if(!p){p=document.createElement('div');p.id='klmini';document.body.append(p)}p.hidden=false;p.innerHTML=`<a href="#/kelas/${KR.id}"><span class="klv">● Berbagi layar</span><span class="t">${esc(KR.judul)} · Kembali ke kelas</span></a><button type="button" data-klhenti>${ic('stop',14)}Berhenti</button>`}
/* Hentikan berbagi layar dari mana saja (pil, notifikasi Android, tombol di kelas) dan bersihkan tampilan */
async function kLayarHenti(){if(!KR||!KR.layarOn)return kelasPil();const R=KR.room,lp=R.localParticipant;
 try{if(R.mode=='mesh'){await lp.setScreenShare(false)}else await lp.setScreenShareEnabled(false)}catch(e){}
 if(KR){KR.layarOn=false;kSetLayar(lp,null);kelasInfo()}kelasPil();toast('Berbagi layar dihentikan')}
document.addEventListener('click',e=>{if(e.target.closest('[data-klhenti]')){e.preventDefault();kLayarHenti()}});
addEventListener('hashchange',()=>setTimeout(kelasPil,30));
/* Keluar otomatis dari kelas (pengajar maupun jamaah):
   - menekan panah kembali / tombol kembali HP / pindah ke halaman lain
   - aplikasi ditutup
   - aplikasi ditinggalkan (layar lain / layar mati) lebih dari 30 detik */
let KIZIN=0,KTANYA=0;
const kTanyaKeluar=tujuan=>{if(KTANYA)return;KTANYA=1;konfirmasi('Keluar dari kelas?','Mikrofon dan kamera akan dimatikan dan kamu keluar dari kelas ini.','Keluar',async()=>{KTANYA=0;KIZIN=1;await kelasKeluar(1);
  /* Lembar konfirmasi menutup dirinya lewat history.back(); tunggu selesai, lalu ganti entri riwayat (bukan menambah) agar tombol kembali tidak membawa masuk kelas lagi */
  await new Promise(ok=>{const t=setTimeout(ok,600);addEventListener('popstate',()=>{clearTimeout(t);setTimeout(ok,30)},{once:true})});
  history.replaceState(null,'',tujuan||'#/kelas');route();setTimeout(()=>KIZIN=0,300)});
 /* Batal: lembar konfirmasi tertutup tanpa memilih Keluar */const iv=setInterval(()=>{if(!document.querySelector('.back-d.tgh')){clearInterval(iv);KTANYA=0}},300)};
/* Menekan tautan lain (panah kembali, menu) selama di kelas: tanya dulu */
document.addEventListener('click',e=>{if(!KR||KR.layarOn)return;const a=e.target.closest('a[href^="#"]');if(!a)return;const h=a.getAttribute('href');if(h.startsWith('#/kelas/'+KR.id))return;e.preventDefault();e.stopPropagation();kTanyaKeluar(h)},true);
/* Tombol kembali HP / riwayat: kembalikan ke kelas lalu tanya */
addEventListener('hashchange',()=>{if(!KR||KR.layarOn||KIZIN||location.hash.startsWith('#/kelas/'+KR.id))return;const tujuan=location.hash;history.replaceState(null,'','#/kelas/'+KR.id);route();kTanyaKeluar(tujuan)});
addEventListener('pagehide',()=>{if(KR)kelasKeluar(1)});
let KSEMB=0;document.addEventListener('visibilitychange',()=>{clearTimeout(KSEMB);if(document.hidden&&KR&&!KR.layarOn){const id=KR.id;KSEMB=setTimeout(async()=>{if(!document.hidden||!KR)return;await kelasKeluar(1);
  const x=$('#kinfo');if(x&&location.hash=='#/kelas/'+id){x.innerHTML=`<p class="mut">Kamu keluar dari kelas karena aplikasi ditinggalkan.</p><button class="btn s" data-kulang="${id}">Masuk lagi</button>`;const c=$('#kctl');if(c)c.innerHTML=''}},30000)}});

/* ---------- Layar penuh video kelas (live & YouTube) ----------
   Video kelas yang dibuat layar penuh (tombol di pojok video live, atau tombol layar penuh pemutar YouTube)
   diputar ke posisi mendatar (landscape) dan kembali tegak saat keluar.
   Aplikasi Android memakai jembatan layarMiring (Activity dikunci tegak); peramban memakai screen.orientation.lock. */
const kVideoPenuh=()=>{const f=document.fullscreenElement||document.webkitFullscreenElement;return !!(f&&f.closest&&f.closest('.kvid,.kz'))};
function kMiring(on){const A=window.FadzAndroid;if(A&&A.layarMiring){try{A.layarMiring(!!on)}catch(e){}return}
 const o=screen.orientation;if(!o)return;if(on)o.lock&&o.lock('landscape').catch(()=>{});else o.unlock&&o.unlock()}
let KMIRING=false;
const kPenuhUbah=()=>{const on=kVideoPenuh();if(on==KMIRING)return;KMIRING=on;kMiring(on);const b=$('[data-kzfs]');if(b)b.classList.toggle('on',on)};
document.addEventListener('fullscreenchange',kPenuhUbah);
/* ---------- Kitab di samping video kelas (seperti berbagi dokumen di Zoom/Meet) ----------
   Jamaah memilih kitab sendiri lalu membalik halaman; pilihan terakhir diingat (S.kzk = {id, j, n}).
   Di layar penuh panel berada di kanan video; di layar biasa di bawah video. */
const kKitabList=()=>(typeof KITAB_DAFTAR!='undefined'?KITAB_DAFTAR:[]).filter(k=>k.berkas);
async function kKitab(ubah){const el=$('#kzk');if(!el)return;const L=kKitabList();if(!L.length){el.innerHTML='<p class="mut">Kitab belum tersedia.</p>';return}
 const c=S.kzk=Object.assign({id:L[0].id,j:0,n:1},S.kzk||{},ubah||{});if(!L.some(k=>k.id==c.id))Object.assign(c,{id:L[0].id,j:0,n:1});
 let k=null;try{k=await kitabAmbil(c.id)}catch(e){}
 const J=k&&k.juz||[],j=J[c.j]||J[0];if(j&&!J[c.j])c.j=0;const n=j?Math.min(Math.max(1,c.n),j.halaman):1;c.n=n;save();
 el.innerHTML=`<div class="kzkh"><select class="in" data-kzksel aria-label="Pilih kitab">${L.map(x=>`<option value="${x.id}"${x.id==c.id?' selected':''}>${esc(x.judul)}</option>`).join('')}</select>${J.length>1?`<select class="in kzkj" data-kzkjuz aria-label="Pilih juz">${J.map((x,i)=>`<option value="${i}"${i==c.j?' selected':''}>Juz ${x.no}</option>`).join('')}</select>`:''}<button type="button" class="kzkx" data-kzkitab aria-label="Tutup kitab" title="Tutup kitab">✕</button></div>
 <div class="kzkb" data-kzkgeser>${j?`<img src="${pgUrl(j,n)}" alt="${esc(k.judul)} halaman ${n}" decoding="async">`:'<p class="mut">Kitab ini belum bisa dimuat. Periksa internet.</p>'}</div>
 <div class="kzkf"><button type="button" class="btn s" data-kzkn="-1" ${n<=1?'disabled':''} aria-label="Halaman sebelumnya">${ic('back',16)}</button><label class="kzkp"><input class="in" type="number" inputmode="numeric" min="1" max="${j?j.halaman:1}" value="${n}" data-kzkhal aria-label="Nomor halaman"><span>/ ${j?j.halaman:1}</span></label><button type="button" class="btn s" data-kzkn="1" ${j&&n>=j.halaman?'disabled':''} aria-label="Halaman berikutnya">${ic('next',16)}</button></div>`;
 /* Halaman berikutnya dimuat lebih dulu agar membalik terasa cepat */
 if(j&&n<j.halaman){const im=new Image();im.src=pgUrl(j,n+1)}}
function kKitabTampil(on){const el=$('#kzk'),z=$('#kz');if(!el||!z)return;on=on==null?el.hidden:on;el.hidden=!on;z.classList.toggle('dgkitab',on);$$('.kzbar [data-kzkitab]').forEach(b=>b.classList.toggle('on',on));if(on)kKitab()}
document.addEventListener('click',e=>{const t=e.target;if(!t.closest)return;
 if(t.closest('[data-kzkitab]')){e.preventDefault();return kKitabTampil()}
 if(t.closest('[data-kzorang]')){const z=$('#kz');if(z){z.classList.toggle('tanpaorang');t.closest('[data-kzorang]').classList.toggle('on',!z.classList.contains('tanpaorang'))}return}
 const nb=t.closest('[data-kzkn]');if(nb&&!nb.disabled){const c=S.kzk||{};return kKitab({n:(c.n||1)+(+nb.dataset.kzkn)})}});
document.addEventListener('change',e=>{const t=e.target;if(!t.matches)return;
 if(t.matches('[data-kzksel]'))return kKitab({id:t.value,j:0,n:1});
 if(t.matches('[data-kzkjuz]'))return kKitab({j:+t.value,n:1});
 if(t.matches('[data-kzkhal]'))return kKitab({n:+t.value||1})});
/* Geser kiri/kanan pada halaman kitab = balik halaman (kitab Arab: geser ke kanan = halaman berikutnya) */
{let x0=null;document.addEventListener('touchstart',e=>{x0=e.target.closest&&e.target.closest('[data-kzkgeser]')?e.touches[0].clientX:null},{passive:true});
 document.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)<50)return;const c=S.kzk||{};kKitab({n:(c.n||1)+(dx>0?1:-1)})},{passive:true})}document.addEventListener('webkitfullscreenchange',kPenuhUbah);
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-kzfs]');if(!b)return;const z=b.closest('.kz')||b.closest('.kzs'),f=document.fullscreenElement||document.webkitFullscreenElement;
 if(f)(document.exitFullscreen||document.webkitExitFullscreen).call(document).catch(()=>{});
 else (z.requestFullscreen||z.webkitRequestFullscreen||(()=>Promise.reject())).call(z,{navigationUI:'hide'}).catch(()=>toast('Layar penuh tidak didukung di perangkat ini'))});
document.addEventListener('click',async e=>{const t=e.target;
 if(t.closest('[data-kkeluar]'))return kTanyaKeluar('#/kelas');
 if(t.closest('[data-kaudio]')&&KR){try{await KR.room.startAudio()}catch(x){}KR.diam=!KR.room.canPlaybackAudio;return kelasInfo()}
 if(t.closest('[data-ktangan]')&&KR){const on=(KR.room.localParticipant.attributes||{}).tangan=='1';try{await KR.room.localParticipant.setAttributes({tangan:on?'':'1'});toast(on?'Tangan diturunkan':'Tangan diangkat. Tunggu pengajar mengizinkan.')}catch(x){toast('Gagal. Coba lagi.')}return kelasInfo()}
 /* Ganti kamera depan ⇄ belakang (pilihan diingat untuk kelas berikutnya) */
 if(t.closest('[data-kflip]')&&KR&&KR.camOn){const R=KR.room,lp=R.localParticipant,f=kHadap()=='user'?'environment':'user',b=t.closest('[data-kflip]');b.disabled=true;
  try{let st=null;if(R.mode=='mesh')st=await R.gantiKamera(f);else{const pub=lp.getTrackPublication(LivekitClient.Track.Source.Camera);if(pub&&pub.track){await pub.track.restartTrack({facingMode:f});st=new MediaStream([pub.track.mediaStreamTrack])}}
   S.khadap=f;save();kSetVid(lp,st);toast(f=='user'?'Kamera depan':'Kamera belakang')}catch(x){toast('Kamera '+(f=='user'?'depan':'belakang')+' tidak bisa dipakai')}return kelasInfo()}
 if(t.closest('[data-kcam]')&&KR){const R=KR.room,lp=R.localParticipant,on=!KR.camOn;try{await lp.setCameraEnabled(on,on?{facingMode:kHadap()}:undefined);KR.camOn=on;if(on)kCamHitung();
  let st=null;if(on){if(R.mode=='mesh')st=R.camStream();else{const pub=lp.getTrackPublication(LivekitClient.Track.Source.Camera);if(pub&&pub.track)st=new MediaStream([pub.track.mediaStreamTrack])}}kSetVid(lp,st)}
  catch(x){toast('Kamera belum diizinkan. Izinkan kamera di pengaturan HP.')}return kelasInfo()}
 if(t.closest('[data-klayar]')&&KR&&!KR.layarOn&&!t.closest('[data-klayar]').dataset.ok){const b=t.closest('[data-klayar]');return konfirmasi('Bagikan layar dengan suara',window.ANDROID?'Seluruh layar HP akan dibagikan. Suara dari aplikasi lain yang sedang diputar (mis. YouTube) ikut terdengar jamaah, terpisah dari mikrofon. Kamu boleh pindah ke aplikasi lain; kelas tetap berjalan. Hentikan dari tombol di kelas atau dari notifikasi.':'Agar suara video (mis. YouTube) terdengar jamaah: pilih tab "Tab Chrome" yang memutar video, lalu nyalakan "Bagikan juga audio tab". Berbagi seluruh layar atau jendela hanya membawa suara di Windows (centang "Bagikan audio sistem"); di Linux dan Mac tidak ada suaranya.','Pilih layar',()=>{b.dataset.ok='1';b.click();delete b.dataset.ok})}
 if(t.closest('[data-klayar]')&&KR){const R=KR.room,lp=R.localParticipant,on=!KR.layarOn;
  try{if(R.mode=='mesh'){const st=await lp.setScreenShare(on);kSetLayar(lp,st||null)}else{await lp.setScreenShareEnabled(on,{audio:LAYAR_OPSI.audio,systemAudio:'include',selfBrowserSurface:'exclude',surfaceSwitching:'include',preferCurrentTab:false,video:{displaySurface:'browser'}});const pub=lp.getTrackPublication(LivekitClient.Track.Source.ScreenShare);kSetLayar(lp,on&&pub&&pub.track?new MediaStream([pub.track.mediaStreamTrack]):null)}KR.layarOn=on;if(on)KR.pin=null}
  catch(x){if(!(x&&x.name=='NotAllowedError'))toast('Layar tidak bisa dibagikan dari perangkat ini.')}
  if(on&&KR&&KR.layarOn)toast(kLayarSuara()?'Layar dan suaranya sedang dibagikan':window.ANDROID?'Layar dibagikan tanpa suara (suara aplikasi lain butuh Android 10 ke atas dan izin mikrofon).':'Layar dibagikan TANPA suara. Untuk video ber-suara, bagikan ulang dan pilih tab Chrome dengan "Bagikan juga audio tab" menyala.',7000)
  return kelasInfo()}
 /* Ketuk kotak peserta = sorot di panggung besar; ketuk panggung = kembali */
 const pin=t.closest('.kzt[data-kpin]');if(pin&&KR){KR.pin=pin.dataset.kpin;return kelasInfo()}
 if(t.closest('#kzs')&&!t.closest('.kzbar')&&KR&&KR.pin){KR.pin=null;return kelasInfo()}
 if(t.closest('[data-kmic]')&&KR){const lp=KR.room.localParticipant;const on=!lp.isMicrophoneEnabled;try{await lp.setMicrophoneEnabled(on);/* LiveKit: lepas jalur mikrofon sepenuhnya saat dimatikan (perangkat mikrofon tidak lagi dipakai) */if(!on&&KR.room.mode!='mesh'){const pub=lp.getTrackPublication&&lp.getTrackPublication(LivekitClient.Track.Source.Microphone);if(pub&&pub.track)try{await lp.unpublishTrack(pub.track,true)}catch(e){}}toast(on?'Mikrofon aktif':'Mikrofon dimatikan')}catch(x){toast('Mikrofon belum diizinkan. Izinkan mikrofon di pengaturan HP.')}return kelasInfo()}
 const iz=t.closest('[data-kizin]');if(iz&&KR){iz.disabled=true;try{if(KR.room.mode=='mesh')await KR.room.izin(iz.dataset.kizin,iz.dataset.boleh=='1');else await kelasToken(KR.id,'izin',{identity:iz.dataset.kizin,boleh:iz.dataset.boleh=='1'})}catch(x){toast('Gagal mengubah izin bicara')}return}
 const ul=t.closest('[data-kulang]');if(ul)return kelasMasuk(ul.dataset.kulang);
 /* Admin: buat / mulai / akhiri / hapus kelas (Firestore lewat SDK, aturan: hanya admin) */
 if(t.closest('[data-krec]')&&KR)return KREC?kelasRekamStop():kelasRekamMulai();
 if(t.closest('[data-kakhirr]')&&KR&&KR.admin){const id=KR.id;return konfirmasi('Akhiri kelas?','Semua jamaah otomatis keluar dari kelas ini. Rekaman (bila ada) disimpan.','Akhiri',async()=>{try{await FBD.collection('kelas').doc(id).update({status:'selesai'})}catch(x){return toast('Gagal mengakhiri kelas')}await kelasKeluar(1);history.replaceState(null,'','#/kelas');route();toast('Kelas diakhiri')})}
 if(!t.closest('[data-kbuat],[data-kmulai],[data-kakhir],[data-khapus],[data-ktaut],[data-kytset],[data-ktgl]'))return;
 await fbInit();if(!FBD||!kAdmin())return toast('Khusus admin. Masuk dengan akun admin.');const col=FBD.collection('kelas');
 const segar=async()=>{await kelasAmbil();kelasDaftar()};
 const m=t.closest('[data-kmulai]');if(m){try{await col.doc(m.dataset.kmulai).update({status:'live',mulai:Date.now()});kelasSiarkan(m.dataset.kmulai,'mulai');await segar();location.hash='#/kelas/'+m.dataset.kmulai}catch(x){toast('Gagal memulai kelas')}return}
 const tg=t.closest('[data-ktgl]');if(tg){const k=(KELAS||[]).find(x=>x.id==tg.dataset.ktgl)||{},d=new Date(k.mulai||Date.now()),v=new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,16),e=document.createElement('div');e.className='back-d';
  e.innerHTML=`<div class="sheet kfm" role="dialog" aria-label="Ubah tanggal"><b>Ubah tanggal</b><p class="mut">${esc(k.judul||'Kelas')}</p><input class="in" id="ktg" type="datetime-local" value="${v}"><div class="act"><button class="sb pri" id="ktgs">Simpan</button><button class="sb" id="ktgb">Batal</button></div></div>`;
  document.body.append(e);const tutup=()=>e.parentNode&&e.parentNode.removeChild(e);e.onclick=x=>{if(x.target==e||x.target.id=='ktgb')tutup()};
  $('#ktgs').onclick=async()=>{const w=new Date($('#ktg').value).getTime();if(!w)return toast('Isi tanggal');try{await col.doc(tg.dataset.ktgl).update({mulai:w});tutup();await segar();toast('Tanggal diubah')}catch(x){toast('Gagal mengubah tanggal')}};return}
 const a=t.closest('[data-kakhir]');if(a)return konfirmasi('Akhiri kelas?','Semua jamaah akan keluar dari kelas ini.','Akhiri',async()=>{try{await col.doc(a.dataset.kakhir).update({status:'selesai'});if(KR&&KR.id==a.dataset.kakhir)await kelasKeluar(1);await segar()}catch(x){toast('Gagal mengakhiri kelas')}});
 const h=t.closest('[data-khapus]');if(h)return konfirmasi('Hapus kelas?','Kelas ini dihapus dari daftar.','Hapus',async()=>{try{await col.doc(h.dataset.khapus).delete();await segar()}catch(x){toast('Gagal menghapus')}});
 const tt=t.closest('[data-ktaut]');if(tt){const k=(KELAS||[]).find(x=>x.id==tt.dataset.ktaut)||{};const e=document.createElement('div');e.className='back-d';
  e.innerHTML=`<div class="sheet kfm" role="dialog" aria-label="Tautan rekaman"><b>Tautan rekaman</b><p class="mut">Unggah file rekaman (mis. ke Google Drive atau YouTube), lalu tempel tautannya di sini agar jamaah bisa memutar ulang.</p><input class="in" id="ktu" type="url" placeholder="https://drive.google.com/…" value="${esc(k.rekaman||'')}"><div class="act"><button class="sb pri" id="kts">Simpan</button><button class="sb" id="ktb">Batal</button></div></div>`;
  document.body.append(e);const tutup=()=>e.parentNode&&e.parentNode.removeChild(e);e.onclick=x=>{if(x.target==e||x.target.id=='ktb')tutup()};
  $('#kts').onclick=async()=>{const v=$('#ktu').value.trim();if(v&&!/^https?:\/\//.test(v))return toast('Tautan harus diawali https://');try{await col.doc(tt.dataset.ktaut).update({rekaman:v});tutup();await segar();toast('Tautan rekaman disimpan')}catch(x){toast('Gagal menyimpan')}};return}
 const yy=t.closest('[data-kytset]');if(yy){const k=(KELAS||[]).find(x=>x.id==yy.dataset.kytset)||{};const e=document.createElement('div');e.className='back-d';
  e.innerHTML=`<div class="sheet kfm" role="dialog" aria-label="Link YouTube"><b>Link live streaming YouTube</b><p class="mut">Tempel link YouTube. Kelas ini akan tampil sebagai video. Kosongkan untuk kembali memakai ruang suara.</p><input class="in" id="kyu" type="url" placeholder="https://youtube.com/live/…" value="${k.yt?'https://youtu.be/'+k.yt:''}"><div id="kyp2" class="kfyp" ${k.yt?'':'hidden'}>${k.yt?`<img src="${ytGambar(k.yt)}" alt="">`:''}</div><div class="act"><button class="sb pri" id="kys">Simpan</button><button class="sb" id="kyb">Batal</button></div></div>`;
  document.body.append(e);const tutup=()=>e.parentNode&&e.parentNode.removeChild(e);e.onclick=x=>{if(x.target==e||x.target.id=='kyb')tutup()};
  $('#kyu').oninput=()=>{const id=ytId($('#kyu').value),p=$('#kyp2');p.hidden=!id;if(id)p.innerHTML=`<img src="${ytGambar(id)}" alt="">`};
  $('#kys').onclick=async()=>{const v=$('#kyu').value.trim(),id=ytId(v);if(v&&!id)return toast('Link YouTube tidak dikenali');try{await col.doc(yy.dataset.kytset).update({yt:id});tutup();await segar();toast(id?'Link YouTube disimpan':'Link YouTube dihapus')}catch(x){toast('Gagal menyimpan')}};return}
 if(t.closest('[data-kbuat]'))kelasForm(col,segar)});

function kelasForm(col,segar){const e=document.createElement('div');e.className='back-d';const d=new Date(Date.now()+3600e3);d.setMinutes(0,0,0);const lok=new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,16);
 e.innerHTML=`<div class="sheet kfm" role="dialog" aria-label="Buat kelas"><b>Buat kelas</b><label>Link YouTube: live streaming atau video lama (opsional)</label><input class="in" id="kfy" type="url" inputmode="url" placeholder="Tempel link YouTube di sini"><div id="kfyp" class="kfyp" hidden></div><label>Judul</label><input class="in" id="kfj" maxlength="80" placeholder="Ngaji Aqidatul Awam">
  <label>Pengajar</label><input class="in" id="kfp" maxlength="60" placeholder="Ustaz pondok"><label>Waktu mulai</label><input class="in" id="kfw" type="datetime-local" value="${lok}"><small class="mut kfwk" id="kfwk" hidden>Untuk video lama, isi tanggal aslinya (boleh tanggal yang sudah lewat). Video tampil di "Sudah selesai" sesuai tanggal ini.</small>
  <label>Keterangan (opsional)</label><input class="in" id="kfk" maxlength="160" placeholder="Bait 12–20">
  <label>Jenis kelas suara</label><select class="in" id="kfm"><option value="mesh"${KSIAP===false?' selected':''}>Kelas kecil (sampai ±10 jamaah, tanpa LiveKit)</option><option value="livekit"${KSIAP===false?'':' selected'}>Kelas besar (LiveKit, puluhan–ratusan jamaah)</option></select>
  <label class="kcek"><input type="checkbox" id="kfr"> Rekam kelas (video layar/kamera + semua suara, disimpan di perangkat pengajar: folder Download/Fadzkuruuni)</label><label class="kff" id="kffw" hidden>Format rekaman <select id="kff">${Object.entries(REKAM_FMT).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><div class="act"><button class="sb pri" id="kfv" hidden>Simpan sebagai video</button><button class="sb pri" id="kfs">Simpan jadwal</button><button class="sb" id="kfl">Langsung mulai</button><button class="sb" id="kfb">Batal</button></div></div>`;
 document.body.append(e);const tutup=()=>e.parentNode&&e.parentNode.removeChild(e);e.onclick=x=>{if(x.target==e||x.target.id=='kfb')tutup()};
 const simpan=async live=>{const j=$('#kfj').value.trim();if(!j)return toast('Isi judul kelas');const w=new Date($('#kfw').value).getTime()||Date.now();
  try{const r=await col.add({judul:j,pengajar:$('#kfp').value.trim(),ket:$('#kfk').value.trim(),mulai:live?Date.now():w,status:live?'live':'jadwal',rekam:$('#kfr').checked,rekamFmt:$('#kff').value,mode:$('#kfm').value,yt:ytId($('#kfy').value),oleh:(FBU&&FBU.email)||'',dibuat:Date.now()});kelasSiarkan(r.id,live?'mulai':'baru');tutup();await segar();if(live)location.hash='#/kelas/'+r.id;else toast('Jadwal kelas disimpan')}catch(x){toast('Gagal menyimpan. Pastikan aturan Firestore terbaru sudah dipublish.')}};
 $('#kfs').onclick=()=>simpan(0);$('#kfl').onclick=()=>simpan(1);
 /* Video YouTube yang sudah ada (mis. rekaman pengajian lama): langsung jadi kelas "Sudah selesai" dengan tanggal bebas, bisa diputar ulang jamaah */
 $('#kfv').onclick=async()=>{const id=ytId($('#kfy').value),j=$('#kfj').value.trim();if(!id)return toast('Tempel link YouTube dulu');if(!j)return toast('Isi judul');const w=new Date($('#kfw').value).getTime();if(!w)return toast('Isi tanggal video');
  try{await col.add({judul:j,pengajar:$('#kfp').value.trim(),ket:$('#kfk').value.trim(),mulai:w,status:'selesai',rekaman:'https://youtu.be/'+id,yt:'',mode:'mesh',oleh:(FBU&&FBU.email)||'',dibuat:Date.now()});tutup();await segar();toast('Video disimpan di "Sudah selesai"')}catch(x){toast('Gagal menyimpan. Pastikan aturan Firestore terbaru sudah dipublish.')}};
 /* Tempel link YouTube: langsung tampil gambar videonya, judul & pengajar terisi otomatis */
 $('#kfy').oninput=async()=>{const u=$('#kfy').value.trim(),id=ytId(u),p=$('#kfyp');p.hidden=!id;$('#kfv').hidden=!id;$('#kfwk').hidden=!id;if(!id)return;p.innerHTML=`<img src="${ytGambar(id)}" alt=""><span class="kyp">${ic('play',22)}</span>`;
  const i=await ytInfo(u);if(i){if(!$('#kfj').value.trim())$('#kfj').value=(i.title||'').slice(0,80);if(!$('#kfp').value.trim())$('#kfp').value=(i.author_name||'').slice(0,60)}}}

/* Bagikan layar dengan suara: di Chrome/Edge komputer centang "Bagikan juga audio tab/sistem" pada jendela pilihan layar.
   Suara pengguna sendiri tidak diputar ulang di perangkatnya (tidak bergema). */
const LAYAR_OPSI={video:{frameRate:{ideal:15,max:20},displaySurface:'browser'},audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},systemAudio:'include',suppressLocalAudioPlayback:false,selfBrowserSurface:'exclude',surfaceSwitching:'include',preferCurrentTab:false};
/* Suara layar ada? (berbeda dari mikrofon: ikut terdengar walau mikrofon dimatikan) */
const kLayarSuara=()=>{if(!KR||!KR.layarOn)return false;const R=KR.room;if(R.mode=='mesh')return !!(R._S.layar&&R._S.layar.getAudioTracks().some(t=>t.readyState=='live'));try{return !!R.localParticipant.getTrackPublication(LivekitClient.Track.Source.ScreenShareAudio)}catch(e){return false}};
/* ---------- Bagikan layar dari aplikasi Android ----------
   WebView tidak punya getDisplayMedia. Di aplikasi (APK dengan LayarLayanan), layar ditangkap native (MediaProjection):
   gambar JPEG & suara PCM diambil lewat jembatan lalu dijadikan jalur video/audio biasa (MediaStreamTrackGenerator),
   sehingga kelas kecil maupun LiveKit memperlakukannya sama seperti berbagi layar di komputer.
   Pewaktu memakai worker agar tetap jalan saat pengguna berpindah ke aplikasi lain. */
function kLayarAndroid(w,h,adaSuara){const G=window.MediaStreamTrackGenerator;let vt,vw,at,aw,cv,cg;
 if(G&&window.VideoFrame){const g=new G({kind:'video'});vw=g.writable.getWriter();vt=g}else{cv=document.createElement('canvas');cv.width=w;cv.height=h;cg=cv.getContext('2d');vt=cv.captureStream(8).getVideoTracks()[0]}
 if(adaSuara&&G&&window.AudioData){const g=new G({kind:'audio'});aw=g.writable.getWriter();at=g}
 let n=-1,k=0,hidup=true,sibuk=0,ats=Math.round(performance.now()*1000);
 const wk=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),60)'],{type:'text/javascript'})));
 wk.onmessage=async()=>{if(!hidup)return;k++;
  if(aw){const b=FadzAndroid.layarSuara();if(b){const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);const q=new Int16Array(u.buffer,0,u.length>>1),f=new Float32Array(q.length);for(let i=0;i<q.length;i++)f[i]=q[i]/32768;
   try{aw.write(new AudioData({format:'f32',sampleRate:48000,numberOfFrames:f.length,numberOfChannels:1,timestamp:ats,data:f}))}catch(e){}ats+=Math.round(f.length/48000*1e6)}}
  if(k%2||sibuk)return;const r=FadzAndroid.layarGambar(n);if(!r)return;const i=r.indexOf('|');n=+r.slice(0,i);sibuk=1;
  try{const bl=await (await fetch('data:image/jpeg;base64,'+r.slice(i+1))).blob(),bm=await createImageBitmap(bl);
   if(vw){const fr=new VideoFrame(bm,{timestamp:Math.round(performance.now()*1000)});await vw.write(fr);fr.close()}else{if(cv.width!=bm.width){cv.width=bm.width;cv.height=bm.height}cg.drawImage(bm,0,0)}bm.close()}catch(e){}sibuk=0};
 const henti=()=>{if(!hidup)return;hidup=false;wk.terminate();try{FadzAndroid.layarHenti()}catch(e){}};
 /* Halaman menghentikan jalur (Hentikan berbagi layar / keluar kelas) → hentikan tangkapan native */
 [vt,at].forEach(t=>{if(!t)return;const s=t.stop.bind(t);t.stop=()=>{s();henti()}});
 /* Dihentikan dari notifikasi / sistem → beri tahu kelas seperti saat berbagi layar di komputer dihentikan */
 window.fzLayarSelesai=()=>{if(!hidup)return;hidup=false;wk.terminate();[vt,at].forEach(t=>{if(t)try{t.dispatchEvent(new Event('ended'))}catch(e){}});setTimeout(()=>{if(typeof kLayarHenti=='function')kLayarHenti()},300)};
 return new MediaStream([vt,at].filter(Boolean))}
if(window.ANDROID&&window.FadzAndroid&&FadzAndroid.layarMulai&&navigator.mediaDevices&&!navigator.mediaDevices.getDisplayMedia){
 navigator.mediaDevices.getDisplayMedia=()=>new Promise((ok,gagal)=>{window.fzLayarSiap=(y,w,h,s)=>{window.fzLayarSiap=null;if(!y)return gagal(new DOMException('Ditolak','NotAllowedError'));try{const st=kLayarAndroid(w,h,!!s);st.fzAndroidSuara=!!s;ok(st)}catch(e){try{FadzAndroid.layarHenti()}catch(x){}gagal(e)}};FadzAndroid.layarMulai()})}
/* ---------- Rekam kelas (di HP pengajar) ----------
   Semua suara (mikrofon pengajar, suara jamaah yang diizinkan bicara, dan suara layar yang dibagikan) dicampur.
   Gambar mengikuti panggung kelas: layar yang sedang dibagikan, atau kamera pengajar, atau kartu judul bila tidak ada video.
   Format: MP4 (bawaan, paling mudah diputar & diunggah ke Drive/YouTube), WebM, atau suara saja.
   Di aplikasi Android ditulis bertahap ke Download/Fadzkuruuni (tidak menumpuk di memori); di browser diunduh saat selesai. */
let KREC=null;
function kelasRekamSambung(tr){if(!KREC||!tr)return;try{KREC.ac.createMediaStreamSource(new MediaStream([tr])).connect(KREC.dst)}catch(e){}}
const REKAM_FMT={mp4:'MP4 (video, disarankan)',webm:'WebM (video)',audio:'Suara saja'};
/* Jenis berkas yang didukung perangkat untuk format pilihan (MP4 hanya bila codec H.264 tersedia, "video/mp4" tanpa codec bisa menghasilkan berkas kosong); MP4 tidak didukung → WebM */
function kRekamJenis(f){const ok=t=>{try{return MediaRecorder.isTypeSupported(t)}catch(e){return false}},cari=L=>L.find(ok);
 if(f=='audio'){const t=cari(['audio/mp4;codecs=mp4a.40.2','audio/mp4;codecs=opus','audio/webm;codecs=opus','audio/webm']);return t&&{mime:t,ext:/mp4/.test(t)?'m4a':'webm',video:false}}
 const t=(f!='webm'&&cari(['video/mp4;codecs=avc1.42E01F,mp4a.40.2','video/mp4;codecs=avc1,mp4a','video/mp4;codecs=avc1,opus','video/mp4;codecs=avc3,mp4a']))||cari(['video/webm;codecs=vp8,opus','video/webm;codecs=vp9,opus','video/webm']);
 return t&&{mime:t,ext:/mp4/.test(t)?'mp4':'webm',video:true}}
/* Gambar rekaman: panggung kelas digambar ke kanvas 15 kali per detik (pewaktu di worker agar tetap jalan saat pengajar membuka tab/aplikasi lain) */
function kRekamKanvas(){const W=window.ANDROID?854:1280,H=window.ANDROID?480:720,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),v=document.createElement('video');v.muted=true;v.playsInline=true;
 const teks=(t,y,z,w)=>{g.font=`${w||600} ${z}px Georgia,serif`;g.fillStyle='#fff';g.textAlign='center';g.fillText(t,W/2,y,W-80)};
 const gambar=()=>{if(!KR)return;const R=KR.room,semua=[R.localParticipant,...R.remoteParticipants.values()],ust=semua.find(p=>(p.attributes||{}).peran=='ustaz'),f=semua.find(p=>kLayar(p))||ust,st=f?kStream(f):null;
  if(v.srcObject!==st){v.srcObject=st;if(st)v.play().catch(()=>{})}g.fillStyle='#111';g.fillRect(0,0,W,H);
  if(st&&v.videoWidth){const s=Math.min(W/v.videoWidth,H/v.videoHeight),w=v.videoWidth*s,h=v.videoHeight*s;g.drawImage(v,(W-w)/2,(H-h)/2,w,h)}
  else{teks(KR.judul||'Kelas online',H/2-10,Math.round(H/14));teks(f?(f.name||'Pengajar'):'Fadzkuruuni',H/2+Math.round(H/12),Math.round(H/24),400)}
  g.font=`600 ${Math.round(H/40)}px sans-serif`;g.textAlign='left';g.fillStyle='rgba(0,0,0,.45)';const lb='● '+(KR.judul||'Kelas online').slice(0,60),lw=g.measureText(lb).width;g.fillRect(12,H-18-H/40-10,lw+20,H/40+16);g.fillStyle='#fff';g.fillText(lb,22,H-24)};
 const wk=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),66)'],{type:'text/javascript'})));wk.onmessage=gambar;gambar();
 return {track:c.captureStream(15).getVideoTracks()[0],stop(){wk.terminate();v.srcObject=null}}}
async function kelasRekamMulai(){if(KREC||!KR)return;if(!window.MediaRecorder)return toast('Perangkat ini tidak mendukung rekam');
 const kd=(KELAS||[]).find(x=>x.id==KR.id)||{},fmt=REKAM_FMT[kd.rekamFmt]?kd.rekamFmt:'mp4',J=kRekamJenis(fmt);if(!J)return toast('Perangkat ini tidak mendukung rekam');
 if(fmt=='mp4'&&J.ext!='mp4')toast('Perangkat ini belum bisa merekam MP4, direkam sebagai WebM');
 const ac=new (window.AudioContext||window.webkitAudioContext)(),dst=ac.createMediaStreamDestination();KREC={ac,dst,J,bag:[],antre:Promise.resolve(),nama:'Kelas '+(KR.judul||'').replace(/[^\w\- ]+/g,'').trim().slice(0,40)+' '+new Date().toISOString().slice(0,16).replace(/[T:]/g,'-')+'.'+J.ext};
 const R=KR.room;if(R.mode=='mesh')R.semuaTrack().forEach(kelasRekamSambung);else{[LivekitClient.Track.Source.Microphone,LivekitClient.Track.Source.ScreenShareAudio].forEach(s=>{const pub=R.localParticipant.getTrackPublication&&R.localParticipant.getTrackPublication(s);if(pub&&pub.track)kelasRekamSambung(pub.track.mediaStreamTrack)});
 R.remoteParticipants.forEach(p=>p.audioTrackPublications.forEach(pub=>pub.track&&kelasRekamSambung(pub.track.mediaStreamTrack)));
 R.on(LivekitClient.RoomEvent.LocalTrackPublished,pub=>{if(pub.kind=='audio'&&pub.track)kelasRekamSambung(pub.track.mediaStreamTrack)})}
 const and=window.ANDROID&&window.FadzAndroid&&FadzAndroid.rekamMulai&&FadzAndroid.rekamMulai(KREC.nama,J.mime.split(';')[0]);KREC.and=!!and;
 const trk=[...dst.stream.getAudioTracks()];if(J.video){KREC.kv=kRekamKanvas();trk.unshift(KREC.kv.track)}
 let mr;try{mr=new MediaRecorder(new MediaStream(trk),{mimeType:J.mime,audioBitsPerSecond:J.video?96000:48000,...(J.video?{videoBitsPerSecond:window.ANDROID?900000:1500000}:{})})}catch(e){if(KREC.kv)KREC.kv.stop();try{ac.close()}catch(x){}if(and)try{FadzAndroid.rekamSelesai()}catch(x){}KREC=null;return toast('Perangkat ini tidak bisa merekam format ini')}KREC.mr=mr;
 /* Potongan terakhir datang setelah stop (KREC sudah dikosongkan): pakai objek rekaman ini sendiri, bukan KREC */
 const RK=KREC;mr.ondataavailable=ev=>{if(!ev.data||!ev.data.size)return;if(RK.and){const b=ev.data;RK.antre=RK.antre.then(()=>blobB64(b)).then(d=>{try{if(d)FadzAndroid.rekamTambah(d)}catch(e){}}).catch(()=>{})}else RK.bag.push(ev.data)};
 mr.start(5000);toast('Mulai merekam kelas ('+(J.video?'video ':'suara ')+J.ext.toUpperCase()+')');kelasInfo()}
async function kelasRekamStop(){const k=KREC;if(!k)return;KREC=null;await new Promise(ok=>{k.mr.onstop=ok;try{k.mr.stop()}catch(e){ok()}});await new Promise(r=>setTimeout(r,0));await k.antre;try{k.ac.close()}catch(e){}if(k.kv)k.kv.stop();
 if(k.and){try{FadzAndroid.rekamSelesai()}catch(e){}toast('Rekaman disimpan di Download/Fadzkuruuni')}
 else{const u=URL.createObjectURL(new Blob(k.bag,{type:k.J.mime.split(';')[0]})),a=document.createElement('a');a.href=u;a.download=k.nama;document.body.append(a);a.click();a.parentNode.removeChild(a);setTimeout(()=>URL.revokeObjectURL(u),10000);toast('Rekaman diunduh')}
 if(KR)kelasInfo()}
/* Status admin baru diketahui setelah akun termuat: gambar ulang daftar kelas (tombol Buat kelas & peringatan) */
addEventListener('fzadmin',()=>{if(location.hash!='#/kelas'||!$('#kls'))return;kelasDaftar();if(kAdmin()&&KSIAP===null)kelasCekServer().then(kelasDaftar)});

/* Tautan di pesan (https://… atau www.…) tampil berbeda dan bisa diketuk; teks lain tetap aman (di-escape dulu) */
const kTautan=t=>esc(t).replace(/(https?:\/\/|www\.)[^\s<]+[^\s<.,;:!?)'"]/gi,m=>{const u=/^www\./i.test(m)?'https://'+m:m;return `<a class="kcl-a" href="${u}" target="_blank" rel="noopener noreferrer">${m}</a>`});
/* ---------- Pesan (chat) di kelas: Firestore kelas/{id}/chat, 60 pesan terakhir ---------- */
async function kelasChat(id){await fbInit();if(!FBD||!KR||KR.id!=id)return;try{if(KR.chatUnsub)KR.chatUnsub();
 KR.chatUnsub=FBD.collection('kelas').doc(id).collection('chat').orderBy('t').limitToLast(60).onSnapshot(q=>{const e=$('#kcl');if(!e)return;const saya=KR&&KR.room.localParticipant.identity;
  e.innerHTML=q.docs.length?q.docs.map(d=>{const m=d.data();return `<div class="kcm${m.pid==saya?' saya':''}"><b>${esc(m.nama||'Jamaah')}</b><span>${kTautan(m.teks||'')}</span><small>${new Date(m.t||0).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</small></div>`}).join(''):'<p class="mut">Belum ada pesan.</p>';e.scrollTop=e.scrollHeight},()=>{})}catch(x){}}
document.addEventListener('submit',async e=>{if(e.target.id!='kcf')return;e.preventDefault();const i=$('#kci'),teks=(i.value||'').trim();if(!teks||!KR)return;i.value='';
 try{await FBD.collection('kelas').doc(KR.id).collection('chat').add({nama:kNama(),teks:teks.slice(0,500),t:Date.now(),pid:KR.room.localParticipant.identity})}
 catch(x){i.value=teks;toast(x&&x.code=='permission-denied'?'Pesan belum aktif: aturan Firestore terbaru belum dipublish.':'Pesan gagal dikirim')}});

/* ---------- Daftar kelas langsung diperbarui + pemberitahuan kelas baru / dimulai / segera dimulai ---------- */
let KWATCH=null;
function kelasPantau(){if(KWATCH||!FBD)return;try{KWATCH=FBD.collection('kelas').onSnapshot(q=>{KELAS=q.docs.map(d=>Object.assign({id:d.id},d.data()));try{localStorage.fzkelas=JSON.stringify(KELAS)}catch(e){}
  if(location.hash=='#/kelas')kelasDaftar();kelasBeritahu();
  /* Aplikasi Android: alarm pengingat kelas (10 menit sebelum & saat mulai) langsung diperbarui, tidak menunggu cek 15 menit */
  if(window.ANDROID&&window.FadzAndroid&&FadzAndroid.kelasSegarkan){clearTimeout(kelasPantau.t);kelasPantau.t=setTimeout(()=>{try{FadzAndroid.kelasSegarkan()}catch(e){}},1500)}
  /* Kelas yang sedang diikuti diakhiri/dihapus pengajar: semua peserta otomatis keluar */
  if(KR&&!KR.keluarOtomatis){const k=KELAS.find(x=>x.id==KR.id);if(!k||k.status=='selesai'){const id=KR.id;KR.keluarOtomatis=1;kelasKeluar(1).then(()=>{if(location.hash.startsWith('#/kelas/'+id)){history.replaceState(null,'','#/kelas');route()}toast('Kelas telah diakhiri pengajar')})}}},()=>{KWATCH=null})}catch(e){KWATCH=null}}
addEventListener('fbu',kelasPantau);
/* ---------- Notifikasi kelas saat situs ditutup (Web Push) ----------
   Peramban yang sudah mengizinkan notifikasi didaftarkan di Firestore `langganan` (id = sidik alamat langganannya).
   Saat admin membuat jadwal atau memulai kelas, server (api/push.js) mengirim notifikasi ke semua langganan, sehingga muncul
   walau situs ditutup. Aplikasi Android memakai notifikasi native (KelasCek), jadi tidak didaftarkan di sini. */
const b64uKe=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((s.length+3)%4)),c=>c.charCodeAt(0));
async function kelasLangganan(){if(!kn().on||window.ANDROID||TPRATINJAU||!('serviceWorker'in navigator)||!('PushManager'in window)||!window.Notification||Notification.permission!='granted'||!cloudOn())return;
 try{const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
  if(!sub){const {kunci}=await (await fetch('api/push',{method:'POST',headers:{'content-type':'application/json'},body:'{"aksi":"kunci"}'})).json();if(!kunci)return;
   sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64uKe(kunci)})}
  const j=sub.toJSON(),id=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(j.endpoint)))].slice(0,20).map(b=>b.toString(16).padStart(2,'0')).join('');
  /* Tanda sudah terdaftar disimpan di peramban ini saja (bukan di S yang ikut tersinkron ke perangkat lain) */
  if(localStorage.fzLangganan==id)return;await fbInit();if(!FBD)return;
  await FBD.collection('langganan').doc(id).set({endpoint:j.endpoint,p256dh:j.keys.p256dh,auth:j.keys.auth,t:Date.now()});localStorage.fzLangganan=id}catch(e){console.warn('langganan kelas',e)}}
addEventListener('load',()=>setTimeout(()=>{if(window.ANDROID)knTerap();else kelasLangganan()},5000));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState=='visible')kelasLangganan()});
/* Admin: kirim notifikasi kelas ke semua peramban yang berlangganan (jenis 'baru' = jadwal baru, 'mulai' = kelas dimulai) */
async function kelasSiarkan(id,jenis){try{if(typeof FBU=='undefined'||!FBU)return;const idToken=await FBU.getIdToken();
 await fetch('api/push',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({aksi:'kirim',kelas:id,jenis,idToken})})}catch(e){}}
/* Pengaturan notifikasi kelas (Pengaturan › Waktu Salat & Notifikasi › Kelas online), terpisah dari adzan:
   on = semua notifikasi kelas; baru = jadwal baru; mulai = kelas dimulai; ingat = 10 menit sebelum; senyap = tanpa bunyi saat adzan berbunyi */
const KN_AWAL={on:true,baru:true,mulai:true,ingat:true,senyap:true,suara:'bawaan'};
const KN_SUARA=[['bawaan','Bawaan HP'],['bel','Bel'],['lonceng','Lonceng'],['getar','Getar saja'],['sendiri','Suara sendiri']];
/* Bunyi saat pemberitahuan kelas tampil di dalam aplikasi/situs yang sedang dibuka (saat tertutup, bunyi diatur saluran notifikasi HP) */
async function knBunyi(){const a=kn(),v=a.suara||'bawaan';if(a.senyap&&typeof ADZ!='undefined'&&ADZ&&!ADZ.paused)return;
 if(v=='getar'){navigator.vibrate&&navigator.vibrate([0,400,200,400]);return}
 try{const b=v=='sendiri'?await idbAmbil('suara_kelas'):null,u=b?URL.createObjectURL(b):v=='lonceng'?'audio/kelas-lonceng.mp3':'audio/kelas-bel.mp3',x=new Audio(u);x.onended=()=>b&&URL.revokeObjectURL(u);x.play().catch(()=>{})}catch(e){}}
const kn=()=>Object.assign({},KN_AWAL,S.kn||{});
const knBoleh=j=>{const a=kn();return a.on&&a[j]!==false};
/* Kirim pengaturan ke aplikasi Android (APK 2.6.5+), dan atur langganan notifikasi peramban */
function knTerap(){const a=kn();if(window.ANDROID&&window.FadzAndroid&&FadzAndroid.aturKelas){try{FadzAndroid.aturKelas(JSON.stringify(a))}catch(e){}}
 if(!window.ANDROID){if(a.on)kelasLangganan();else kelasBerhenti()}}
/* Peramban: berhenti berlangganan notifikasi kelas */
async function kelasBerhenti(){try{const reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();const id=localStorage.fzLangganan;
 if(sub)await sub.unsubscribe();if(id){await fbInit();if(FBD)await FBD.collection('langganan').doc(id).delete().catch(()=>{})}delete localStorage.fzLangganan}catch(e){}}
/* Aplikasi Android 2.6+: notifikasi sistem ditangani native (KelasCek) agar tidak dobel; halaman hanya menampilkan pemberitahuan di dalam aplikasi */
function kNotif(judul,isi,id,jenis){if(jenis&&!knBoleh(jenis))return;if(window.ANDROID){if(!(window.FadzAndroid&&FadzAndroid.kelasSegarkan))andPanggil('notifikasi',judul,isi)}
 else if(document.hidden&&window.Notification&&Notification.permission=='granted')try{const n=new Notification(judul,{body:isi,icon:'img/icon-192.png',tag:'kelas-'+id});n.onclick=()=>{focus();location.hash='#/kelas/'+id}}catch(e){}
 let b=$('#knotif');if(!b){b=document.createElement('a');b.id='knotif';document.body.append(b)}b.href='#/kelas/'+id;b.innerHTML=`${ic('siar',20)}<span><b>${esc(judul)}</b><small>${esc(isi)}</small></span>`;b.hidden=false;knBunyi();clearTimeout(b.t);b.t=setTimeout(()=>b.hidden=true,9000);b.onclick=()=>b.hidden=true}
function kelasBeritahu(){let T=null;try{T=JSON.parse(localStorage.fzkelasT||'null')}catch(e){}const awal=!T;T=T||{};const kini=Date.now(),saya=(typeof FBU!='undefined'&&FBU&&FBU.email)||'';
 (KELAS||[]).forEach(k=>{const lama=T[k.id]||'';if(!awal&&k.oleh!==saya){
   if(k.status=='live'&&lama.indexOf('live')<0&&kini-(k.mulai||0)<3*3600e3)kNotif('Kelas online dimulai',(k.judul||'Kelas')+(k.pengajar?' · '+k.pengajar:'')+'. Ketuk untuk bergabung.',k.id,'mulai');
   else if(k.status=='jadwal'&&!lama)kNotif('Kelas baru dijadwalkan',(k.judul||'Kelas')+' · '+kJam(k.mulai),k.id,'baru')}
  T[k.id]=(k.status||'jadwal')+(lama.indexOf('ingat')>=0?'+ingat':'')});try{localStorage.fzkelasT=JSON.stringify(T)}catch(e){}}
/* Pengingat 10 menit sebelum kelas terjadwal dimulai (selama aplikasi terbuka; saat tertutup ditangani aplikasi Android) */
setInterval(()=>{let T={};try{T=JSON.parse(localStorage.fzkelasT||'{}')}catch(e){}let ubah=0;const kini=Date.now();
 (KELAS||[]).forEach(k=>{if(k.status=='jadwal'&&k.mulai&&k.mulai-kini<10*60e3&&k.mulai-kini>-5*60e3&&(T[k.id]||'').indexOf('ingat')<0){kNotif('Kelas segera dimulai',(k.judul||'Kelas')+' · '+kJam(k.mulai),k.id,'ingat');T[k.id]=(T[k.id]||'jadwal')+'+ingat';ubah=1}});
 if(ubah)try{localStorage.fzkelasT=JSON.stringify(T)}catch(e){}},60e3);
/* Pilihan format rekaman hanya tampil bila "Rekam kelas" dicentang */
document.addEventListener('change',e=>{if(e.target.id=='kfr'){const w=$('#kffw');if(w)w.hidden=!e.target.checked}});
