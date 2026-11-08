/* js/pages/kelas.js - Kelas online: pengajian live (suara saja) di ruang majelis bergaya piksel.
   - Jadwal kelas: Firestore koleksi "kelas" {judul, pengajar, ket, mulai(ms), status 'jadwal'|'live'|'selesai', rekaman?}.
     Semua orang boleh membaca (lewat REST), hanya admin yang membuat/mengubah (lewat Firebase SDK).
   - Suara: LiveKit (server audio, kuat untuk ratusan pendengar). Token dari api/kelas.
     Admin (ustaz) bisa bicara; jamaah mendengar, bisa "Angkat tangan" lalu diizinkan bicara oleh admin.
   - Selama kelas berjalan, pengguna boleh membuka halaman lain (mis. kitab); ada pil "Live" untuk kembali. */
const LKJS='https://cdn.jsdelivr.net/npm/livekit-client@2.15.7/dist/livekit-client.umd.js';
let KELAS=null,KR=null,KSIAP=null;
async function kelasCekServer(){try{const r=await fetch('api/kelas',{method:'POST',headers:{'content-type':'application/json'},body:'{"aksi":"cek"}'});KSIAP=r.ok}catch(e){KSIAP=null}return KSIAP}
const fsNilai=v=>v==null?null:'stringValue' in v?v.stringValue:'integerValue' in v?+v.integerValue:'doubleValue' in v?+v.doubleValue:'booleanValue' in v?v.booleanValue:null;
async function kelasAmbil(){try{const r=await fetch(FSURL+'/kelas?pageSize=100',{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();
  KELAS=(j.documents||[]).map(d=>{const o={id:d.name.split('/').pop()};for(const [k,v] of Object.entries(d.fields||{}))o[k]=fsNilai(v);return o});try{localStorage.fzkelas=JSON.stringify(KELAS)}catch(e){}}
 catch(e){if(!KELAS)try{KELAS=JSON.parse(localStorage.fzkelas||'[]')}catch(x){KELAS=[]}}return KELAS}
const kJam=t=>t?new Date(t).toLocaleString('id-ID',{weekday:'long',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}):'';
/* Kelas dengan tautan YouTube (live streaming atau rekaman): tampil sebagai video, bukan ruang suara */
const ytId=u=>{const m=String(u||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|embed\/|shorts\/))([\w-]{11})/);return m?m[1]:''};
const ytGambar=id=>`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const ytInfo=async u=>{try{const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(u));return r.ok?await r.json():null}catch(e){return null}};
const kAdmin=()=>typeof TADM!='undefined'&&!!TADM;

/* ---------- Daftar kelas ---------- */
function kelasKartu(k){const live=k.status=='live',sel=k.status=='selesai',adm=kAdmin();
 return `<div class="kls${live?' live':''}">${live?`<div class="klt"><span class="klv">● Sedang live</span>${KR&&KR.id==k.id?'<small class="mut">Kamu sedang di kelas ini</small>':''}</div>`:`<small class="mut">${sel?'Selesai · ':''}${esc(kJam(k.mulai))}</small>`}
  ${k.yt?`<a class="kyt" href="#/kelas/${k.id}" aria-label="Tonton ${esc(k.judul||'video')}"><img src="${ytGambar(k.yt)}" alt="" loading="lazy"><span class="kyp">${ic('play',26)}</span>${live?'<span class="klv kytl">● LIVE</span>':''}</a>`:''}
  <b>${esc(k.judul||'Kelas')}</b>${k.pengajar?`<small class="mut">${esc(k.pengajar)}</small>`:''}${k.ket?`<p>${esc(k.ket)}</p>`:''}
  <div class="kla">${live?`<a class="btn" href="#/kelas/${k.id}">${ic(k.yt?'play':'siar',18)} ${k.yt?'Tonton live':'Masuk dan dengarkan'}</a>`:''}${sel&&k.rekaman?(ytId(k.rekaman)?`<a class="sb" href="#/kelas/${k.id}">${ic('play',16)} Putar rekaman</a>`:`<a class="sb" href="${esc(k.rekaman)}" target="_blank" rel="noopener">${ic('play',16)} Putar rekaman</a>`):''}${adm&&!sel?`<button class="sb" data-kytset="${k.id}">${k.yt?'Ubah':'Tempel'} link YouTube</button>`:''}
  ${adm&&!sel?(live?`<button class="sb" data-kakhir="${k.id}">Akhiri kelas</button>`:`<button class="sb pri" data-kmulai="${k.id}">Mulai kelas</button>`):''}${adm&&sel?`<button class="sb" data-ktaut="${k.id}">${k.rekaman?'Ubah':'Isi'} tautan rekaman</button>`:''}${adm?`<button class="sb dng" data-khapus="${k.id}">Hapus</button>`:''}</div>${!k.yt&&k.mode=='mesh'&&!sel?'<small class="mut">Kelas kecil (maks. ±10 jamaah).</small>':''}${k.rekam&&!sel?'<small class="mut">Kelas ini direkam.</small>':''}</div>`}
function kelasDaftar(){const e=$('#kls');if(!e)return;const L=(KELAS||[]).slice(),now=Date.now();
 const live=L.filter(k=>k.status=='live'),akan=L.filter(k=>k.status!='live'&&k.status!='selesai').sort((a,b)=>(a.mulai||0)-(b.mulai||0)),sel=L.filter(k=>k.status=='selesai').sort((a,b)=>(b.mulai||0)-(a.mulai||0)).slice(0,20);
 const peringat=kAdmin()?(KSIAP===false?`<div class="kperingat">${ic('info',18)}<span><b>Server suara belum disiapkan.</b> Isi LIVEKIT_URL, LIVEKIT_API_KEY, dan LIVEKIT_API_SECRET di Vercel (Settings › Environment Variables), lalu Redeploy. Sebelum itu, kelas besar otomatis berjalan sebagai kelas kecil (maks. ±10 jamaah).</span></div>`:'')
  :'';
 e.innerHTML=peringat+(kAdmin()?`<button class="btn kbuat" data-kbuat>${ic('plus',18)} Buat kelas</button>`:'')
  +(live.length?live.map(kelasKartu).join(''):`<div class="card mut kkosong">${ic('siar',22)}<span>Belum ada kelas yang sedang live. Jadwal kelas berikutnya ada di bawah.</span></div>`)
  +(akan.length?'<h2>Jadwal berikutnya</h2>'+akan.map(kelasKartu).join(''):'')+(sel.length?'<h2>Sudah selesai</h2>'+sel.map(kelasKartu).join(''):'')
  +(!L.length?'<p class="mut">Kelas online (pengajian, ngaji kitab) akan muncul di sini saat dijadwalkan oleh pengurus.</p>':'')}

/* ---------- Ruang majelis ---------- */
P.kelas=id=>{if(!id)return {html:head('Kelas online','#/')+'<div id="kls"><p class="mut">Memuat jadwal kelas…</p></div>',init(){if(KELAS)kelasDaftar();kelasAmbil().then(kelasDaftar);if(kAdmin()&&KSIAP===null)kelasCekServer().then(kelasDaftar)}};
 const k=(KELAS||[]).find(x=>x.id==id)||{id,judul:'Kelas online'},vid=k.yt||(k.status=='selesai'&&ytId(k.rekaman));
 if(vid)return {html:head(esc(k.judul||'Kelas online'),'#/kelas',k.status=='live'?'<span class="klv kll">● Live</span>':'')+`<div class="kvid"><iframe src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&playsinline=1&rel=0" title="${esc(k.judul||'Video kelas')}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
  <div class="kinfo"><b>${esc(k.judul||'')}</b>${k.pengajar?`<br><small class="mut">${esc(k.pengajar)}</small>`:''}${k.ket?`<p>${esc(k.ket)}</p>`:''}<p><a class="sb" href="https://www.youtube.com/watch?v=${vid}" target="_blank" rel="noopener">${ic('share',16)} Buka di YouTube</a></p></div>`,init(){if(KR&&KR.id!=id)kelasKeluar(1)}};
 return {html:head(esc(k.judul||'Kelas online'),'#/kelas',`<span class="klv kll" id="klst">${KR&&KR.id==id?'● Live':''}</span>`)+`<div class="kz"><div class="kzs" id="kzs"><video id="kzv" autoplay playsinline muted hidden></video><div id="kzsa" class="kzsa"><div class="kzw">${ic('siar',28)}<span>Menyambungkan…</span></div></div><div class="kzsn" id="kzsn"></div></div><div class="kzg" id="kzg"></div></div>
  <div id="kinfo" class="kinfo"><p class="mut">Menyambungkan ke kelas…</p></div><div id="kctl" class="kctl"></div><div id="kadm"></div>`,
  init(){kelasMasuk(id)}}};

/* ---------- Tampilan seperti Zoom: pengajar besar di atas (kamera bila menyala), jamaah kotak kecil di bawah ---------- */
const kHash=s=>{let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
const kAva=(p,z)=>{const h=kHash(p.identity)%360;return `<span class="ava kzav" style="width:${z}px;height:${z}px;font-size:${Math.round(z*.42)}px;background:hsl(${h} 42% 86%);color:hsl(${h} 45% 28%)">${esc(((p.name||'J').trim()[0]||'J').toUpperCase())}</span>`};
function kelasGambar(){const st=$('#kzs'),g=$('#kzg');if(!st||!g||!KR)return;const R=KR.room,saya=R.localParticipant,semua=[saya,...R.remoteParticipants.values()];
 const ust=semua.find(p=>(p.attributes||{}).peran=='ustaz'),jm=semua.filter(p=>p!==ust),nm=p=>p===saya?(p.name||'Kamu')+' (Kamu)':(p.name||'Jamaah');
 const v=$('#kzv'),vs=KR.video||null;if(v.srcObject!==vs){v.srcObject=vs;if(vs)v.play().catch(()=>{})}v.hidden=!vs;v.classList.toggle('cermin',!!(vs&&KR.videoLokal));
 const sa=$('#kzsa'),isi=vs?'':(ust?kAva(ust,104):`<div class="kzw">${ic('siar',28)}<span>Menunggu pengajar masuk…</span></div>`);if(sa.dataset.k!==(ust?ust.identity:'')+(vs?'v':'')){sa.innerHTML=isi;sa.dataset.k=(ust?ust.identity:'')+(vs?'v':'')}
 $('#kzsn').innerHTML=ust?`${ust.isSpeaking?ic('speaker',15):''}<span>${esc(nm(ust))}</span><small>Pengajar</small>`:'';st.classList.toggle('bicara',!!(ust&&ust.isSpeaking));
 g.innerHTML=jm.map(p=>`<div class="kzt${p.isSpeaking?' bicara':''}">${kAva(p,46)}<span class="kzn">${(p.attributes||{}).tangan=='1'?`<span class="kzh">${ic('tangan',13)}</span>`:''}${p.permissions?.canPublish?ic('mic',13):''}${esc(nm(p))}</span></div>`).join('')}

function kelasInfo(){const R=KR&&KR.room;if(!R)return;const semua=[R.localParticipant,...R.remoteParticipants.values()],bicara=semua.filter(p=>p.isSpeaking),saya=R.localParticipant,boleh=saya.permissions?.canPublish,tangan=(saya.attributes||{}).tangan=='1',mic=saya.isMicrophoneEnabled;
 const i=$('#kinfo');if(i)i.innerHTML=`<div class="kbic">${ic(bicara.length?'speaker':'speaker',18)}<span>${bicara.length?'<b>'+bicara.map(p=>esc(p.name||'Jamaah')).join(', ')+'</b> sedang berbicara':KR.mode=='mesh'&&!KR.admin&&!semua.some(p=>(p.attributes||{}).peran=='ustaz')?'Menunggu pengajar masuk…':'Menunggu suara…'}</span></div>
  <small class="mut">${KR.mode=='mesh'?'Kelas kecil · ':''}${semua.length} orang di majelis · ${KR.admin?'Kamu pengajar (mikrofon '+(mic?'nyala':'mati')+')':boleh?'Kamu diizinkan bicara':'Kamu mendengarkan, mikrofon mati'}</small>${KR.diam?'<button class="btn" data-kaudio style="width:100%;margin-top:10px">Ketuk untuk menyalakan suara</button>':''}`;
 const c=$('#kctl');if(c)c.innerHTML=((KR.admin||boleh)&&!mic?`<div class="kmicn">${ic('mic',20)}<span><b>Mikrofon mati.</b> ${KR.admin?'Tekan Aktifkan mikrofon saat mulai mengajar.':'Kamu diizinkan bicara. Tekan Aktifkan mikrofon untuk mulai berbicara.'}</span></div>`:'')
  +(KR.admin||boleh?`<button class="btn${mic?' s':''}" data-kmic>${ic('mic',18)} ${mic?'Matikan mikrofon':'Aktifkan mikrofon'}</button>`:`<button class="btn s" data-ktangan>${ic('tangan',18)} ${tangan?'Turunkan tangan':'Angkat tangan'}</button>`)+(KR.admin?`<button class="btn s" data-kcam>${ic('camera',18)} ${KR.camOn?'Matikan kamera':'Nyalakan kamera'}</button>`:'')+`<button class="btn s kkel" data-kkeluar>Keluar</button>`+(KR.admin?`<button class="btn s krb" data-krec>${KREC?'<span class="krec">● Merekam</span> Hentikan & simpan':ic('mic',18)+' Rekam kelas'}</button>`:'');
 const a=$('#kadm');if(a&&KR.admin){const L=[...R.remoteParticipants.values()],T=L.filter(p=>(p.attributes||{}).tangan=='1'||p.permissions?.canPublish);
  a.innerHTML=`<h2>Jamaah yang angkat tangan</h2>`+(T.length?`<div class="list">${T.map(p=>`<div class="srw"><span class="si">${ic(p.permissions?.canPublish?'mic':'tangan',18)}</span><span class="t">${esc(p.name||'Jamaah')}<br><small class="mut">${p.permissions?.canPublish?'Boleh bicara':'Ingin bertanya'}</small></span><button class="btn s" data-kizin="${esc(p.identity)}" data-boleh="${p.permissions?.canPublish?0:1}">${p.permissions?.canPublish?'Bisukan':'Izinkan bicara'}</button></div>`).join('')}</div>`:'<p class="mut">Belum ada. Jamaah yang menekan "Angkat tangan" muncul di sini.</p>')}
 kelasGambar();kelasPil()}

async function kelasToken(id,aksi,lain){let idToken=null;try{if(typeof FBU!='undefined'&&FBU)idToken=await FBU.getIdToken()}catch(e){}
 const r=await fetch('api/kelas',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.assign({aksi,kelas:id,idToken,nama:S.nm||(typeof FBU!='undefined'&&FBU&&FBU.displayName)||'Jamaah'},lain||{}))});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw j.galat||('http-'+r.status);return j}
const KGAL={'belum-siap':'Server suara kelas belum disiapkan oleh pengelola aplikasi.','belum-mulai':'Kelas ini belum dimulai. Tunggu sampai pengajar memulai kelas.','kelas-tidak-ada':'Kelas tidak ditemukan.'};

async function kelasMasuk(id,paksaLK){if(KR&&KR.id==id){kelasInfo();return kelasPasangTimer()}
 /* Dibuka langsung lewat tautan: muat data kelas dulu (status, jenis kelas) */
 if(!(KELAS||[]).some(x=>x.id==id))await kelasAmbil();
 if(KR)await kelasKeluar(1);const i=$('#kinfo');
 if(!navigator.onLine){if(i)i.innerHTML='<p class="mut">Kelas online butuh internet.</p>';return}
 const kk=(KELAS||[]).find(x=>x.id==id)||{};
 if(!paksaLK&&(kk.mode=='mesh'||(kk.mode!='livekit'&&KSIAP===false)))return kelasMasukMesh(id);
 try{let t;try{t=await kelasToken(id,'token')}catch(e){if(e=='belum-siap'){KSIAP=false;return kelasMasukMesh(id)}throw e}if(!window.LivekitClient)await ldjs(LKJS);const L=LivekitClient,R=new L.Room({adaptiveStream:true,dynacast:true});
  KR={id,room:R,admin:!!t.admin,diam:false,judul:((KELAS||[]).find(x=>x.id==id)||{}).judul||'Kelas online'};const ub=()=>KR&&KR.room===R&&kelasInfo();
  R.on(L.RoomEvent.TrackSubscribed,tr=>{if(tr.kind=='video'){KR.video=new MediaStream([tr.mediaStreamTrack]);KR.videoLokal=false;return ub()}if(tr.kind=='audio'){const el=tr.attach();el.className='kaud';document.body.append(el);kelasRekamSambung(tr.mediaStreamTrack)}})
   .on(L.RoomEvent.LocalTrackPublished,pub=>{if(pub.kind=='video'&&pub.track){KR.video=new MediaStream([pub.track.mediaStreamTrack]);KR.videoLokal=true;ub()}})
   .on(L.RoomEvent.TrackUnsubscribed,tr=>{if(tr.kind=='video'){KR.video=null;ub()}tr.detach().forEach(el=>el.parentNode&&el.parentNode.removeChild(el))})
   .on(L.RoomEvent.ParticipantConnected,ub).on(L.RoomEvent.ParticipantDisconnected,ub).on(L.RoomEvent.ActiveSpeakersChanged,ub).on(L.RoomEvent.ParticipantAttributesChanged,ub)
   .on(L.RoomEvent.LocalTrackPublished,ub).on(L.RoomEvent.LocalTrackUnpublished,ub).on(L.RoomEvent.TrackMuted,(pub,p)=>{if(pub.kind=='video'&&p!==R.localParticipant)KR.video=null;ub()}).on(L.RoomEvent.TrackUnmuted,(pub,p)=>{if(pub.kind=='video'&&pub.track&&p!==R.localParticipant){KR.video=new MediaStream([pub.track.mediaStreamTrack]);KR.videoLokal=false}ub()})
   .on(L.RoomEvent.ParticipantPermissionsChanged,(prev,p)=>{if(p===R.localParticipant&&!KR.admin){if(p.permissions?.canPublish&&!prev?.canPublish){toast('Kamu diizinkan bicara. Tekan Aktifkan mikrofon.');R.localParticipant.setAttributes({tangan:''}).catch(()=>{})}}ub()})
   .on(L.RoomEvent.AudioPlaybackStatusChanged,()=>{KR.diam=!R.canPlaybackAudio;ub()})
   .on(L.RoomEvent.Disconnected,()=>kelasPutus(R));
  await R.connect(t.url,t.token);try{await R.startAudio()}catch(e){}KR.diam=!R.canPlaybackAudio;
  const s=$('#klst');if(s)s.textContent='● Live';kelasInfo();kelasPasangTimer();if(KR.admin&&((KELAS||[]).find(x=>x.id==id)||{}).rekam)kelasRekamMulai()}
 catch(e){KR=null;console.warn('kelas',e);if(!paksaLK&&e!='belum-mulai'&&e!='kelas-tidak-ada'){try{KR&&KR.room&&KR.room.disconnect()}catch(x){}KR=null;return kelasMasukMesh(id,true)}if(i)i.innerHTML=`<p class="mut">${esc(KGAL[e]||(/^http-/.test(e)?'Server kelas tidak bisa dihubungi ('+e+'). Coba lagi sebentar.':'Tidak bisa masuk kelas. Periksa internet lalu coba lagi.'))}</p><button class="btn s" data-kulang="${id}">Coba lagi</button>`}}
function kelasPutus(R){if(KR&&KR.room===R){if(KREC)kelasRekamStop();KR=null;kelasPil();const s=$('#klst');if(s)s.textContent='';const x=$('#kinfo');if(x)x.innerHTML='<p class="mut">Kelas sudah berakhir atau sambungan terputus.</p><a class="btn s" href="#/kelas">Kembali ke daftar kelas</a>';const c=$('#kctl');if(c)c.innerHTML='';const a=$('#kadm');if(a)a.innerHTML=''}}
/* Kelas kecil tanpa LiveKit (js/pages/kelas-mesh.js) */
async function kelasMasukMesh(id,dariLK){const i=$('#kinfo'),k=(KELAS||[]).find(x=>x.id==id)||{},admin=kAdmin();
 try{if(k.status!='live'&&!admin)throw 'belum-mulai';let R=null;
  R=await kelasMesh(id,admin,S.nm||(typeof FBU!='undefined'&&FBU&&FBU.displayName)||'Jamaah',()=>{if(KR&&R&&KR.room===R){KR.diam=!R.canPlaybackAudio;kelasInfo()}});
  R.onDisconnected=()=>kelasPutus(R);KR={id,room:R,admin,diam:!R.canPlaybackAudio,mode:'mesh',judul:k.judul||'Kelas online'};R.onVideo=st=>{if(KR&&KR.room===R&&!admin){KR.video=st;KR.videoLokal=false;kelasInfo()}};
  const s=$('#klst');if(s)s.textContent='● Live';kelasInfo();kelasPasangTimer();if(admin&&k.rekam)kelasRekamMulai()}
 catch(e){KR=null;console.warn('kelas kecil',e);
  /* Kelas kecil gagal (mis. aturan Firestore belum dipublish) → coba lewat LiveKit bila servernya siap */
  if(!dariLK&&e!='belum-mulai'&&KSIAP!==false)return kelasMasuk(id,true);
  if(i)i.innerHTML=`<p class="mut">${esc(KGAL[e]||(e&&e.code=='permission-denied'?'Kelas kecil belum aktif: aturan Firestore terbaru belum dipublish oleh pengelola.':'Tidak bisa masuk kelas. Periksa internet lalu coba lagi.'))}</p><button class="btn s" data-kulang="${id}">Coba lagi</button>`}}
let KTM=0;function kelasPasangTimer(){clearInterval(KTM);KTM=setInterval(()=>{if(!KR||!$('#kzs'))return clearInterval(KTM);kelasGambar()},500)}
async function kelasKeluar(diam){if(KREC)await kelasRekamStop();const r=KR&&KR.room;KR=null;clearInterval(KTM);$$('audio.kaud').forEach(a=>a.parentNode.removeChild(a));if(r)try{await r.disconnect()}catch(e){}kelasPil();if(!diam&&/^#\/kelas\//.test(location.hash))location.hash='#/kelas'}

/* Pil "Live" melayang saat kelas berjalan dan pengguna membuka halaman lain */
function kelasPil(){let p=$('#klmini');const di=KR&&location.hash.startsWith('#/kelas/'+KR.id);
 if(!KR||di){if(p)p.hidden=true;return}
 if(!p){p=document.createElement('a');p.id='klmini';document.body.append(p)}p.href='#/kelas/'+KR.id;p.hidden=false;p.innerHTML=`<span class="klv">● Live</span><span class="t">${esc(KR.judul)}</span>${ic('next',16)}`}
addEventListener('hashchange',()=>setTimeout(kelasPil,50));

document.addEventListener('click',async e=>{const t=e.target;
 if(t.closest('[data-kkeluar]'))return kelasKeluar();
 if(t.closest('[data-kaudio]')&&KR){try{await KR.room.startAudio()}catch(x){}KR.diam=!KR.room.canPlaybackAudio;return kelasInfo()}
 if(t.closest('[data-ktangan]')&&KR){const on=(KR.room.localParticipant.attributes||{}).tangan=='1';try{await KR.room.localParticipant.setAttributes({tangan:on?'':'1'});toast(on?'Tangan diturunkan':'Tangan diangkat. Tunggu pengajar mengizinkan.')}catch(x){toast('Gagal. Coba lagi.')}return kelasInfo()}
 if(t.closest('[data-kcam]')&&KR){const on=!KR.camOn;try{await KR.room.localParticipant.setCameraEnabled(on);KR.camOn=on;KR.videoLokal=on;KR.video=on?(KR.room.camStream?KR.room.camStream():KR.video):null}catch(x){toast('Kamera belum diizinkan. Izinkan kamera di pengaturan HP.')}return kelasInfo()}
 if(t.closest('[data-kmic]')&&KR){const lp=KR.room.localParticipant;const on=!lp.isMicrophoneEnabled;try{await lp.setMicrophoneEnabled(on);toast(on?'Mikrofon aktif':'Mikrofon dimatikan')}catch(x){toast('Mikrofon belum diizinkan. Izinkan mikrofon di pengaturan HP.')}return kelasInfo()}
 const iz=t.closest('[data-kizin]');if(iz&&KR){iz.disabled=true;try{if(KR.room.mode=='mesh')await KR.room.izin(iz.dataset.kizin,iz.dataset.boleh=='1');else await kelasToken(KR.id,'izin',{identity:iz.dataset.kizin,boleh:iz.dataset.boleh=='1'})}catch(x){toast('Gagal mengubah izin bicara')}return}
 const ul=t.closest('[data-kulang]');if(ul)return kelasMasuk(ul.dataset.kulang);
 /* Admin: buat / mulai / akhiri / hapus kelas (Firestore lewat SDK, aturan: hanya admin) */
 if(t.closest('[data-krec]')&&KR)return KREC?kelasRekamStop():kelasRekamMulai();
 if(!t.closest('[data-kbuat],[data-kmulai],[data-kakhir],[data-khapus],[data-ktaut],[data-kytset]'))return;
 await fbInit();if(!FBD||!kAdmin())return toast('Khusus admin. Masuk dengan akun admin.');const col=FBD.collection('kelas');
 const segar=async()=>{await kelasAmbil();kelasDaftar()};
 const m=t.closest('[data-kmulai]');if(m){try{await col.doc(m.dataset.kmulai).update({status:'live',mulai:Date.now()});await segar();location.hash='#/kelas/'+m.dataset.kmulai}catch(x){toast('Gagal memulai kelas')}return}
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
 e.innerHTML=`<div class="sheet kfm" role="dialog" aria-label="Buat kelas"><b>Buat kelas</b><label>Link live streaming YouTube (opsional)</label><input class="in" id="kfy" type="url" inputmode="url" placeholder="Tempel link YouTube di sini"><div id="kfyp" class="kfyp" hidden></div><label>Judul</label><input class="in" id="kfj" maxlength="80" placeholder="Ngaji Aqidatul Awam">
  <label>Pengajar</label><input class="in" id="kfp" maxlength="60" placeholder="Ustaz pondok"><label>Waktu mulai</label><input class="in" id="kfw" type="datetime-local" value="${lok}">
  <label>Keterangan (opsional)</label><input class="in" id="kfk" maxlength="160" placeholder="Bait 12–20">
  <label>Jenis kelas suara</label><select class="in" id="kfm"><option value="mesh"${KSIAP===false?' selected':''}>Kelas kecil (sampai ±10 jamaah, tanpa LiveKit)</option><option value="livekit"${KSIAP===false?'':' selected'}>Kelas besar (LiveKit, puluhan–ratusan jamaah)</option></select>
  <label class="kcek"><input type="checkbox" id="kfr"> Rekam kelas (file suara disimpan di HP pengajar, folder Download/Fadzkuruuni)</label><div class="act"><button class="sb pri" id="kfs">Simpan jadwal</button><button class="sb" id="kfl">Langsung mulai</button><button class="sb" id="kfb">Batal</button></div></div>`;
 document.body.append(e);const tutup=()=>e.parentNode&&e.parentNode.removeChild(e);e.onclick=x=>{if(x.target==e||x.target.id=='kfb')tutup()};
 const simpan=async live=>{const j=$('#kfj').value.trim();if(!j)return toast('Isi judul kelas');const w=new Date($('#kfw').value).getTime()||Date.now();
  try{const r=await col.add({judul:j,pengajar:$('#kfp').value.trim(),ket:$('#kfk').value.trim(),mulai:live?Date.now():w,status:live?'live':'jadwal',rekam:$('#kfr').checked,mode:$('#kfm').value,yt:ytId($('#kfy').value),oleh:(FBU&&FBU.email)||'',dibuat:Date.now()});tutup();await segar();if(live)location.hash='#/kelas/'+r.id;else toast('Jadwal kelas disimpan')}catch(x){toast('Gagal menyimpan. Pastikan aturan Firestore terbaru sudah dipublish.')}};
 $('#kfs').onclick=()=>simpan(0);$('#kfl').onclick=()=>simpan(1);
 /* Tempel link YouTube: langsung tampil gambar videonya, judul & pengajar terisi otomatis */
 $('#kfy').oninput=async()=>{const u=$('#kfy').value.trim(),id=ytId(u),p=$('#kfyp');p.hidden=!id;if(!id)return;p.innerHTML=`<img src="${ytGambar(id)}" alt=""><span class="kyp">${ic('play',22)}</span>`;
  const i=await ytInfo(u);if(i){if(!$('#kfj').value.trim())$('#kfj').value=(i.title||'').slice(0,80);if(!$('#kfp').value.trim())$('#kfp').value=(i.author_name||'').slice(0,60)}}}

/* ---------- Rekam kelas (di HP pengajar) ----------
   Semua suara (mikrofon pengajar + suara jamaah yang diizinkan bicara) dicampur lalu direkam (WebM/Opus).
   Di aplikasi Android ditulis bertahap ke Download/Fadzkuruuni (tidak menumpuk di memori); di browser diunduh saat selesai. */
let KREC=null;
function kelasRekamSambung(tr){if(!KREC||!tr)return;try{KREC.ac.createMediaStreamSource(new MediaStream([tr])).connect(KREC.dst)}catch(e){}}
async function kelasRekamMulai(){if(KREC||!KR)return;if(!window.MediaRecorder)return toast('Perangkat ini tidak mendukung rekam');
 const ac=new (window.AudioContext||window.webkitAudioContext)(),dst=ac.createMediaStreamDestination();KREC={ac,dst,bag:[],antre:Promise.resolve(),nama:'Kelas '+(KR.judul||'').replace(/[^\w\- ]+/g,'').trim().slice(0,40)+' '+new Date().toISOString().slice(0,16).replace(/[T:]/g,'-')+'.webm'};
 const R=KR.room;if(R.mode=='mesh')R.semuaTrack().forEach(kelasRekamSambung);else{const mic=R.localParticipant.getTrackPublication&&R.localParticipant.getTrackPublication(LivekitClient.Track.Source.Microphone);if(mic&&mic.track)kelasRekamSambung(mic.track.mediaStreamTrack);
 R.remoteParticipants.forEach(p=>p.audioTrackPublications.forEach(pub=>pub.track&&kelasRekamSambung(pub.track.mediaStreamTrack)));
 R.on(LivekitClient.RoomEvent.LocalTrackPublished,pub=>{if(pub.kind=='audio'&&pub.track)kelasRekamSambung(pub.track.mediaStreamTrack)})}
 const and=window.ANDROID&&window.FadzAndroid&&FadzAndroid.rekamMulai&&FadzAndroid.rekamMulai(KREC.nama,'audio/webm');KREC.and=!!and;
 const mr=new MediaRecorder(dst.stream,MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?{mimeType:'audio/webm;codecs=opus',audioBitsPerSecond:32000}:{});KREC.mr=mr;
 mr.ondataavailable=ev=>{if(!ev.data||!ev.data.size)return;if(KREC.and){const b=ev.data;KREC.antre=KREC.antre.then(()=>new Promise(ok=>{const f=new FileReader();f.onload=()=>{try{FadzAndroid.rekamTambah(String(f.result).split(',')[1])}catch(e){}ok()};f.readAsDataURL(b)}))}else KREC.bag.push(ev.data)};
 mr.start(5000);toast('Mulai merekam kelas');kelasInfo()}
async function kelasRekamStop(){const k=KREC;if(!k)return;KREC=null;await new Promise(ok=>{k.mr.onstop=ok;try{k.mr.stop()}catch(e){ok()}});await k.antre;try{k.ac.close()}catch(e){}
 if(k.and){try{FadzAndroid.rekamSelesai()}catch(e){}toast('Rekaman disimpan di Download/Fadzkuruuni')}
 else{const u=URL.createObjectURL(new Blob(k.bag,{type:'audio/webm'})),a=document.createElement('a');a.href=u;a.download=k.nama;document.body.append(a);a.click();a.parentNode.removeChild(a);setTimeout(()=>URL.revokeObjectURL(u),10000);toast('Rekaman diunduh')}
 if(KR)kelasInfo()}
/* Status admin baru diketahui setelah akun termuat: gambar ulang daftar kelas (tombol Buat kelas & peringatan) */
addEventListener('fzadmin',()=>{if(location.hash!='#/kelas'||!$('#kls'))return;kelasDaftar();if(kAdmin()&&KSIAP===null)kelasCekServer().then(kelasDaftar)});
