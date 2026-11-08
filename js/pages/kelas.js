/* js/pages/kelas.js - Kelas online: pengajian live (suara saja) di ruang majelis bergaya piksel.
   - Jadwal kelas: Firestore koleksi "kelas" {judul, pengajar, ket, mulai(ms), status 'jadwal'|'live'|'selesai', rekaman?}.
     Semua orang boleh membaca (lewat REST), hanya admin yang membuat/mengubah (lewat Firebase SDK).
   - Suara: LiveKit (server audio, kuat untuk ratusan pendengar). Token dari api/kelas.
     Admin (ustaz) bisa bicara; jamaah mendengar, bisa "Angkat tangan" lalu diizinkan bicara oleh admin.
   - Selama kelas berjalan, pengguna boleh membuka halaman lain (mis. kitab); ada pil "Live" untuk kembali. */
const LKJS='https://cdn.jsdelivr.net/npm/livekit-client@2.15.7/dist/livekit-client.umd.js';
let KELAS=null,KR=null;
const fsNilai=v=>v==null?null:'stringValue' in v?v.stringValue:'integerValue' in v?+v.integerValue:'doubleValue' in v?+v.doubleValue:'booleanValue' in v?v.booleanValue:null;
async function kelasAmbil(){try{const r=await fetch(FSURL+'/kelas?pageSize=100',{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();
  KELAS=(j.documents||[]).map(d=>{const o={id:d.name.split('/').pop()};for(const [k,v] of Object.entries(d.fields||{}))o[k]=fsNilai(v);return o});try{localStorage.fzkelas=JSON.stringify(KELAS)}catch(e){}}
 catch(e){if(!KELAS)try{KELAS=JSON.parse(localStorage.fzkelas||'[]')}catch(x){KELAS=[]}}return KELAS}
const kJam=t=>t?new Date(t).toLocaleString('id-ID',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):'';
const kAdmin=()=>typeof TADM!='undefined'&&!!TADM;

/* ---------- Daftar kelas ---------- */
function kelasKartu(k){const live=k.status=='live',sel=k.status=='selesai',adm=kAdmin();
 return `<div class="kls${live?' live':''}">${live?`<div class="klt"><span class="klv">● Sedang live</span>${KR&&KR.id==k.id?'<small class="mut">Kamu sedang di kelas ini</small>':''}</div>`:`<small class="mut">${sel?'Selesai · ':''}${esc(kJam(k.mulai))}</small>`}
  <b>${esc(k.judul||'Kelas')}</b>${k.pengajar?`<small class="mut">${esc(k.pengajar)}</small>`:''}${k.ket?`<p>${esc(k.ket)}</p>`:''}
  <div class="kla">${live?`<a class="btn" href="#/kelas/${k.id}">${ic('siar',18)} Masuk dan dengarkan</a>`:''}${sel&&k.rekaman?`<a class="sb" href="${esc(k.rekaman)}" target="_blank" rel="noopener">${ic('play',16)} Putar rekaman</a>`:''}
  ${adm&&!sel?(live?`<button class="sb" data-kakhir="${k.id}">Akhiri kelas</button>`:`<button class="sb pri" data-kmulai="${k.id}">Mulai kelas</button>`):''}${adm?`<button class="sb dng" data-khapus="${k.id}">Hapus</button>`:''}</div></div>`}
function kelasDaftar(){const e=$('#kls');if(!e)return;const L=(KELAS||[]).slice(),now=Date.now();
 const live=L.filter(k=>k.status=='live'),akan=L.filter(k=>k.status!='live'&&k.status!='selesai').sort((a,b)=>(a.mulai||0)-(b.mulai||0)),sel=L.filter(k=>k.status=='selesai').sort((a,b)=>(b.mulai||0)-(a.mulai||0)).slice(0,20);
 e.innerHTML=(kAdmin()?`<button class="btn kbuat" data-kbuat>${ic('plus',18)} Buat kelas</button>`:'')
  +(live.length?live.map(kelasKartu).join(''):`<div class="card mut kkosong">${ic('siar',22)}<span>Belum ada kelas yang sedang live. Jadwal kelas berikutnya ada di bawah.</span></div>`)
  +(akan.length?'<h2>Jadwal berikutnya</h2>'+akan.map(kelasKartu).join(''):'')+(sel.length?'<h2>Sudah selesai</h2>'+sel.map(kelasKartu).join(''):'')
  +(!L.length?'<p class="mut">Kelas online (pengajian, ngaji kitab) akan muncul di sini saat dijadwalkan oleh pengurus.</p>':'')}

/* ---------- Ruang majelis ---------- */
P.kelas=id=>{if(!id)return {html:head('Kelas online','#/')+'<div id="kls"><p class="mut">Memuat jadwal kelas…</p></div>',init(){if(KELAS)kelasDaftar();kelasAmbil().then(kelasDaftar)}};
 const k=(KELAS||[]).find(x=>x.id==id)||{id,judul:'Kelas online'};
 return {html:head(esc(k.judul||'Kelas online'),'#/kelas',`<span class="klv kll" id="klst">${KR&&KR.id==id?'● Live':''}</span>`)+`<div class="kpx"><canvas id="kcv" width="96" height="66"></canvas></div>
  <div id="kinfo" class="kinfo"><p class="mut">Menyambungkan ke kelas…</p></div><div id="kctl" class="kctl"></div><div id="kadm"></div>`,
  init(){kelasMasuk(id)}}};

const kHash=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
const KKOP=['#1d1d1d','#ffffff','#2f4f6b','#1d1d1d','#5a3b2a','#ffffff','#1d1d1d','#3b5b3b'],KBAJU=['#2f6b4f','#5b4a8a','#e9e9e9','#8a5a3b','#3b5b8a','#b5823b','#2f4f6b','#6b2f2f','#4a6b2f','#8a3b5b'];
/* Gambar ruang majelis: mimbar ustaz di depan, jamaah duduk di karpet. Yang bicara diberi gelembung, yang angkat tangan diberi tangan kuning. */
function kelasGambar(){const cv=$('#kcv');if(!cv||!KR)return;const R=KR.room,semua=[R.localParticipant,...R.remoteParticipants.values()];
 const ust=semua.filter(p=>(p.attributes||{}).peran=='ustaz'),jm=semua.filter(p=>(p.attributes||{}).peran!='ustaz'),kol=7,baris=Math.max(2,Math.ceil(jm.length/kol)),H=34+baris*12+4;
 if(cv.height!=H)cv.height=H;const c=cv.getContext('2d'),F=(x,y,w,h,f)=>{c.fillStyle=f;c.fillRect(x,y,w,h)},kedip=(Date.now()>>9)&1;
 F(0,0,96,H,'#e9dcc0');for(let y=0;y<H;y+=8)for(let x=((y/8)%2)*8;x<96;x+=16)F(x,y,8,8,'#e2d3b4');
 F(0,0,96,16,'#8a5a3b');F(38,2,20,12,'#2f6b4f');F(44,4,8,9,'#d9b45a');F(6,4,9,8,'#a9d2e8');F(81,4,9,8,'#a9d2e8');F(10,4,1,8,'#8a5a3b');F(85,4,1,8,'#8a5a3b');
 F(6,28,84,H-30,'#9b2d2d');for(let y=30;y<H-2;y+=12)F(6,y,84,1,'#b84444');F(38,18,20,8,'#6b4a2e');F(39,19,18,1,'#8a6a4e');
 const orang=(x,y,p,besar)=>{const h=kHash(p.identity),kop=besar?'#ffffff':KKOP[h%8],baju=besar?'#f4f4f4':KBAJU[(h>>3)%10];F(x,y+5,8,7,baju);F(x+1,y,6,6,'#f0c79c');F(x+1,y-1,6,2,kop);F(x+2,y+2,1,1,'#3a2a1a');F(x+5,y+2,1,1,'#3a2a1a');
  if(p.isSpeaking&&kedip<2){F(x+8,y-5,6,5,'#ffffff');F(x+9,y-4,4,1,'#2f6b4f');F(x+9,y-2,3,1,'#2f6b4f');F(x+8,y,1,1,'#ffffff')}
  if((p.attributes||{}).tangan=='1'){F(x-2,y-6,3,4,'#f5c542');F(x-1,y-2,1,3,'#f5c542')}
  if(p===R.localParticipant){F(x+3,y+13,2,1,'#ffffff')}};
 ust.slice(0,2).forEach((p,i)=>orang(44+(i?-12:0),11,p,1));
 jm.forEach((p,i)=>orang(9+(i%kol)*11.5|0,32+Math.floor(i/kol)*12,p,0))}

function kelasInfo(){const R=KR&&KR.room;if(!R)return;const semua=[R.localParticipant,...R.remoteParticipants.values()],bicara=semua.filter(p=>p.isSpeaking),saya=R.localParticipant,boleh=saya.permissions?.canPublish,tangan=(saya.attributes||{}).tangan=='1',mic=saya.isMicrophoneEnabled;
 const i=$('#kinfo');if(i)i.innerHTML=`<div class="kbic">${ic(bicara.length?'speaker':'speaker',18)}<span>${bicara.length?'<b>'+bicara.map(p=>esc(p.name||'Jamaah')).join(', ')+'</b> sedang berbicara':'Menunggu suara…'}</span></div>
  <small class="mut">${semua.length} orang di majelis · ${KR.admin?'Kamu pengajar (mikrofon '+(mic?'nyala':'mati')+')':boleh?'Kamu diizinkan bicara':'Kamu mendengarkan, mikrofon mati'}</small>${KR.diam?'<button class="btn" data-kaudio style="width:100%;margin-top:10px">Ketuk untuk menyalakan suara</button>':''}`;
 const c=$('#kctl');if(c)c.innerHTML=(KR.admin||boleh?`<button class="btn${mic?'':' s'}" data-kmic>${ic('mic',18)} ${mic?'Matikan mikrofon':'Nyalakan mikrofon'}</button>`:`<button class="btn s" data-ktangan>${ic('tangan',18)} ${tangan?'Turunkan tangan':'Angkat tangan'}</button>`)+`<button class="btn s kkel" data-kkeluar>Keluar</button>`;
 const a=$('#kadm');if(a&&KR.admin){const L=[...R.remoteParticipants.values()],T=L.filter(p=>(p.attributes||{}).tangan=='1'||p.permissions?.canPublish);
  a.innerHTML=`<h2>Jamaah yang angkat tangan</h2>`+(T.length?`<div class="list">${T.map(p=>`<div class="srw"><span class="si">${ic(p.permissions?.canPublish?'mic':'tangan',18)}</span><span class="t">${esc(p.name||'Jamaah')}<br><small class="mut">${p.permissions?.canPublish?'Boleh bicara':'Ingin bertanya'}</small></span><button class="btn s" data-kizin="${esc(p.identity)}" data-boleh="${p.permissions?.canPublish?0:1}">${p.permissions?.canPublish?'Bisukan':'Izinkan bicara'}</button></div>`).join('')}</div>`:'<p class="mut">Belum ada. Jamaah yang menekan "Angkat tangan" muncul di sini.</p>')}
 kelasGambar();kelasPil()}

async function kelasToken(id,aksi,lain){let idToken=null;try{if(typeof FBU!='undefined'&&FBU)idToken=await FBU.getIdToken()}catch(e){}
 const r=await fetch('api/kelas',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({aksi,kelas:id,idToken,nama:S.nm||(typeof FBU!='undefined'&&FBU&&FBU.displayName)||'Jamaah'},lain||{}))});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw j.galat||('http-'+r.status);return j}
const KGAL={'belum-siap':'Server suara kelas belum disiapkan oleh pengelola aplikasi.','belum-mulai':'Kelas ini belum dimulai. Tunggu sampai pengajar memulai kelas.','kelas-tidak-ada':'Kelas tidak ditemukan.'};

async function kelasMasuk(id){if(KR&&KR.id==id){kelasInfo();return kelasPasangTimer()}
 if(KR)await kelasKeluar(1);const i=$('#kinfo');
 if(!navigator.onLine){if(i)i.innerHTML='<p class="mut">Kelas online butuh internet.</p>';return}
 try{const t=await kelasToken(id,'token');if(!window.LivekitClient)await ldjs(LKJS);const L=LivekitClient,R=new L.Room({adaptiveStream:true,dynacast:true});
  KR={id,room:R,admin:!!t.admin,diam:false,judul:((KELAS||[]).find(x=>x.id==id)||{}).judul||'Kelas online'};const ub=()=>KR&&KR.room===R&&kelasInfo();
  R.on(L.RoomEvent.TrackSubscribed,tr=>{if(tr.kind=='audio'){const el=tr.attach();el.className='kaud';document.body.append(el)}})
   .on(L.RoomEvent.TrackUnsubscribed,tr=>{tr.detach().forEach(el=>el.parentNode&&el.parentNode.removeChild(el))})
   .on(L.RoomEvent.ParticipantConnected,ub).on(L.RoomEvent.ParticipantDisconnected,ub).on(L.RoomEvent.ActiveSpeakersChanged,ub).on(L.RoomEvent.ParticipantAttributesChanged,ub)
   .on(L.RoomEvent.LocalTrackPublished,ub).on(L.RoomEvent.LocalTrackUnpublished,ub).on(L.RoomEvent.TrackMuted,ub).on(L.RoomEvent.TrackUnmuted,ub)
   .on(L.RoomEvent.ParticipantPermissionsChanged,(prev,p)=>{if(p===R.localParticipant&&!KR.admin){if(p.permissions?.canPublish&&!prev?.canPublish){toast('Kamu diizinkan bicara. Tekan Nyalakan mikrofon.');R.localParticipant.setAttributes({tangan:''}).catch(()=>{})}}ub()})
   .on(L.RoomEvent.AudioPlaybackStatusChanged,()=>{KR.diam=!R.canPlaybackAudio;ub()})
   .on(L.RoomEvent.Disconnected,()=>{if(KR&&KR.room===R){KR=null;kelasPil();const s=$('#klst');if(s)s.textContent='';const x=$('#kinfo');if(x)x.innerHTML='<p class="mut">Kelas sudah berakhir atau sambungan terputus.</p><a class="btn s" href="#/kelas">Kembali ke daftar kelas</a>';const c=$('#kctl');if(c)c.innerHTML=''}});
  await R.connect(t.url,t.token);try{await R.startAudio()}catch(e){}KR.diam=!R.canPlaybackAudio;
  if(KR.admin)try{await R.localParticipant.setMicrophoneEnabled(true)}catch(e){toast('Mikrofon belum diizinkan')}
  const s=$('#klst');if(s)s.textContent='● Live';kelasInfo();kelasPasangTimer()}
 catch(e){KR=null;if(i)i.innerHTML=`<p class="mut">${esc(KGAL[e]||'Tidak bisa masuk kelas. Periksa internet lalu coba lagi.')}</p><button class="btn s" data-kulang="${id}">Coba lagi</button>`}}
let KTM=0;function kelasPasangTimer(){clearInterval(KTM);KTM=setInterval(()=>{if(!KR||!$('#kcv'))return clearInterval(KTM);kelasGambar()},500)}
async function kelasKeluar(diam){const r=KR&&KR.room;KR=null;clearInterval(KTM);$$('audio.kaud').forEach(a=>a.parentNode.removeChild(a));if(r)try{await r.disconnect()}catch(e){}kelasPil();if(!diam&&/^#\/kelas\//.test(location.hash))location.hash='#/kelas'}

/* Pil "Live" melayang saat kelas berjalan dan pengguna membuka halaman lain */
function kelasPil(){let p=$('#klmini');const di=KR&&location.hash.startsWith('#/kelas/'+KR.id);
 if(!KR||di){if(p)p.hidden=true;return}
 if(!p){p=document.createElement('a');p.id='klmini';document.body.append(p)}p.href='#/kelas/'+KR.id;p.hidden=false;p.innerHTML=`<span class="klv">● Live</span><span class="t">${esc(KR.judul)}</span>${ic('next',16)}`}
addEventListener('hashchange',()=>setTimeout(kelasPil,50));

document.addEventListener('click',async e=>{const t=e.target;
 if(t.closest('[data-kkeluar]'))return kelasKeluar();
 if(t.closest('[data-kaudio]')&&KR){try{await KR.room.startAudio()}catch(x){}KR.diam=!KR.room.canPlaybackAudio;return kelasInfo()}
 if(t.closest('[data-ktangan]')&&KR){const on=(KR.room.localParticipant.attributes||{}).tangan=='1';try{await KR.room.localParticipant.setAttributes({tangan:on?'':'1'});toast(on?'Tangan diturunkan':'Tangan diangkat. Tunggu pengajar mengizinkan.')}catch(x){toast('Gagal. Coba lagi.')}return kelasInfo()}
 if(t.closest('[data-kmic]')&&KR){const lp=KR.room.localParticipant;try{await lp.setMicrophoneEnabled(!lp.isMicrophoneEnabled)}catch(x){toast('Mikrofon belum diizinkan')}return kelasInfo()}
 const iz=t.closest('[data-kizin]');if(iz&&KR){iz.disabled=true;try{await kelasToken(KR.id,'izin',{identity:iz.dataset.kizin,boleh:iz.dataset.boleh=='1'})}catch(x){toast('Gagal mengubah izin bicara')}return}
 const ul=t.closest('[data-kulang]');if(ul)return kelasMasuk(ul.dataset.kulang);
 /* Admin: buat / mulai / akhiri / hapus kelas (Firestore lewat SDK, aturan: hanya admin) */
 if(!t.closest('[data-kbuat],[data-kmulai],[data-kakhir],[data-khapus]'))return;
 await fbInit();if(!FBD||!kAdmin())return toast('Khusus admin. Masuk dengan akun admin.');const col=FBD.collection('kelas');
 const segar=async()=>{await kelasAmbil();kelasDaftar()};
 const m=t.closest('[data-kmulai]');if(m){try{await col.doc(m.dataset.kmulai).update({status:'live',mulai:Date.now()});await segar();location.hash='#/kelas/'+m.dataset.kmulai}catch(x){toast('Gagal memulai kelas')}return}
 const a=t.closest('[data-kakhir]');if(a)return konfirmasi('Akhiri kelas?','Semua jamaah akan keluar dari kelas ini.','Akhiri',async()=>{try{await col.doc(a.dataset.kakhir).update({status:'selesai'});if(KR&&KR.id==a.dataset.kakhir)await kelasKeluar(1);await segar()}catch(x){toast('Gagal mengakhiri kelas')}});
 const h=t.closest('[data-khapus]');if(h)return konfirmasi('Hapus kelas?','Kelas ini dihapus dari daftar.','Hapus',async()=>{try{await col.doc(h.dataset.khapus).delete();await segar()}catch(x){toast('Gagal menghapus')}});
 if(t.closest('[data-kbuat]'))kelasForm(col,segar)});

function kelasForm(col,segar){const e=document.createElement('div');e.className='back-d';const d=new Date(Date.now()+3600e3);d.setMinutes(0,0,0);const lok=new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,16);
 e.innerHTML=`<div class="sheet kfm" role="dialog" aria-label="Buat kelas"><b>Buat kelas</b><label>Judul</label><input class="in" id="kfj" maxlength="80" placeholder="Ngaji Aqidatul Awam">
  <label>Pengajar</label><input class="in" id="kfp" maxlength="60" placeholder="Ustaz pondok"><label>Waktu mulai</label><input class="in" id="kfw" type="datetime-local" value="${lok}">
  <label>Keterangan (opsional)</label><input class="in" id="kfk" maxlength="160" placeholder="Bait 12–20"><div class="act"><button class="sb pri" id="kfs">Simpan jadwal</button><button class="sb" id="kfl">Langsung mulai</button><button class="sb" id="kfb">Batal</button></div></div>`;
 document.body.append(e);const tutup=()=>e.parentNode&&e.parentNode.removeChild(e);e.onclick=x=>{if(x.target==e||x.target.id=='kfb')tutup()};
 const simpan=async live=>{const j=$('#kfj').value.trim();if(!j)return toast('Isi judul kelas');const w=new Date($('#kfw').value).getTime()||Date.now();
  try{const r=await col.add({judul:j,pengajar:$('#kfp').value.trim(),ket:$('#kfk').value.trim(),mulai:live?Date.now():w,status:live?'live':'jadwal',oleh:(FBU&&FBU.email)||'',dibuat:Date.now()});tutup();await segar();if(live)location.hash='#/kelas/'+r.id;else toast('Jadwal kelas disimpan')}catch(x){toast('Gagal menyimpan. Pastikan aturan Firestore terbaru sudah dipublish.')}};
 $('#kfs').onclick=()=>simpan(0);$('#kfl').onclick=()=>simpan(1)}
