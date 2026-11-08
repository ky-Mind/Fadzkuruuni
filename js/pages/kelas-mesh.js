/* js/pages/kelas-mesh.js - Kelas kecil tanpa LiveKit ("mesh", seperti Pixel HQ).
   Suara langsung antar-HP (WebRTC). Sinyal & daftar hadir lewat Firestore kelas/{id}/mesh (tanpa server tambahan).
   Bentuk bintang: tiap jamaah tersambung ke HP pengajar. Pengajar mengirim suaranya, dan bila ada jamaah yang
   diizinkan bicara, pengajar meneruskan suara jamaah itu ke jamaah lain (dicampur per jamaah, tanpa gema suara sendiri).
   Cocok sampai ±10 pendengar. Objek yang dihasilkan meniru antarmuka Room LiveKit yang dipakai kelas.js. */
const MESH_MAKS=12,MESH_ICE=[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']}];
const meshId=()=>Math.random().toString(36).slice(2,10);
const tungguIce=pc=>new Promise(ok=>{if(pc.iceGatheringState=='complete')return ok();const t=setTimeout(ok,3500);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState=='complete'){clearTimeout(t);ok()}})});

/* Identitas tetap per akun (bukan acak): refresh halaman menggantikan kehadiran lama, satu akun = satu orang di kelas */
const meshIdAkun=u=>{let a=2166136261,b=5381;for(const ch of String(u)){const c=ch.charCodeAt(0);a=Math.imul(a^c,16777619)>>>0;b=(Math.imul(b,33)+c)>>>0}return (a.toString(36)+b.toString(36)).slice(0,12)};
async function kelasMesh(id,admin,nama,onUbah,uid){await fbInit();if(!FBD)throw 'firebase';
 const col=FBD.collection('kelas').doc(id).collection('mesh'),pid=uid?meshIdAkun(uid):meshId(),hostSesi=pid+'.'+meshId(),AC=new (window.AudioContext||window.webkitAudioContext)();
 const S_={peserta:new Map(),status:{},pc:new Map(),masuk:new Map(),audio:new Map(),bicara:new Set(),mic:null,micOn:false,tutup:false,unsub:[]};
 const ubah=()=>{if(!S_.tutup)onUbah()};
 const level=st=>{try{const a=AC.createAnalyser();a.fftSize=512;AC.createMediaStreamSource(st).connect(a);const d=new Uint8Array(a.fftSize);return ()=>{a.getByteTimeDomainData(d);let m=0;for(const v of d)m=Math.max(m,Math.abs(v-128));return m}}catch(e){return ()=>0}};
 const putar=(k,st)=>{let el=S_.audio.get(k);if(!el){el=document.createElement('audio');el.autoplay=true;el.playsInline=true;el.className='kaud';document.body.append(el);S_.audio.set(k,el)}el.srcObject=st;el.play().catch(()=>{room.canPlaybackAudio=false;ubah()})};
 /* Peserta lokal (meniru LiveKit) */
 const lokal={identity:pid,name:nama,attributes:{peran:admin?'ustaz':'jamaah',tangan:'',foto:(window.fotoProfil&&fotoProfil())||'',kamera:''},permissions:{canPublish:admin},isSpeaking:false,isMicrophoneEnabled:false,
  async setAttributes(a){Object.assign(lokal.attributes,a);await tulisSaya();ubah()},
  async setCameraEnabled(on){if(on&&!S_.cam)S_.cam=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:640},height:{ideal:360},facingMode:'user'}});
   if(!on&&S_.cam){S_.cam.getTracks().forEach(t=>t.stop());S_.cam=null}const tr=S_.cam?S_.cam.getVideoTracks()[0]:null;S_.pc.forEach(p=>p.vtx&&p.vtx.sender.replaceTrack(tr).catch(()=>{}));lokal.isCameraEnabled=!!on;lokal.attributes.kamera=on?'1':'';tulisSaya().catch(()=>{});ubah()},
  async setMicrophoneEnabled(on){if(on&&!S_.mic){S_.mic=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});S_.micLv=level(S_.mic)}
   S_.micOn=!!on;S_.mic&&S_.mic.getAudioTracks().forEach(t=>t.enabled=!!on);lokal.isMicrophoneEnabled=!!on;
   if(admin)campurUlang();else{const p=S_.pc.get('host');if(p&&p.tx)await p.tx.sender.replaceTrack(on&&S_.mic?S_.mic.getAudioTracks()[0]:null)}
   if(on&&KREC&&S_.mic)kelasRekamSambung(S_.mic.getAudioTracks()[0]);ubah()}};
 const room={_S:S_,mode:'mesh',localParticipant:lokal,remoteParticipants:new Map(),canPlaybackAudio:true,
  async startAudio(){try{await AC.resume()}catch(e){}let ok=true;for(const el of S_.audio.values())try{await el.play()}catch(e){ok=false}room.canPlaybackAudio=ok;ubah()},
  camStream(){return S_.cam||null},
  semuaTrack(){return [...(S_.mic?S_.mic.getAudioTracks():[]),...[...S_.masuk.values()].map(m=>m.track)]},
  async izin(identity,boleh){await col.doc('p_'+identity).set({boleh:!!boleh},{merge:true})},
  async disconnect(){if(S_.tutup)return;S_.tutup=true;S_.unsub.forEach(f=>f());clearInterval(S_.hb);clearInterval(S_.lv);S_.pc.forEach(p=>p.pc.close());S_.audio.forEach(el=>{el.srcObject=null;el.parentNode&&el.parentNode.removeChild(el)});
   S_.mic&&S_.mic.getTracks().forEach(t=>t.stop());S_.cam&&S_.cam.getTracks().forEach(t=>t.stop());try{AC.close()}catch(e){}
   const hapus=[col.doc('p_'+pid).delete(),col.doc('o_'+pid).delete(),col.doc('a_'+pid).delete()];if(admin)hapus.push(col.doc('status').set({host:'',bicara:[]}));await Promise.all(hapus.map(p=>p.catch(()=>{})));room.onDisconnected&&room.onDisconnected()}};
 const tulisSaya=async()=>{const d={nama:nama.slice(0,40),peran:lokal.attributes.peran,tangan:lokal.attributes.tangan||'',t:Date.now()};
  /* Foto & status kamera butuh aturan Firestore terbaru; bila ditolak, tulis tanpa keduanya */
  if(S_.lama)return col.doc('p_'+pid).set(d,{merge:true});try{await col.doc('p_'+pid).set(Object.assign({foto:(lokal.attributes.foto||'').length<=20000?lokal.attributes.foto||'':'',kamera:lokal.attributes.kamera||''},d),{merge:true})}catch(e){if(e&&e.code=='permission-denied'){S_.lama=1;return col.doc('p_'+pid).set(d,{merge:true})}throw e}};
 /* Daftar hadir → remoteParticipants (yang aktif < 60 detik terakhir) */
 const segarPeserta=()=>{const M=new Map(),kini=Date.now();S_.peserta.forEach((d,k)=>{if(k==pid||kini-(d.t||0)>60000)return;
   M.set(k,{identity:k,name:d.nama||'Jamaah',attributes:{peran:d.peran||'jamaah',tangan:d.tangan||'',foto:d.foto||'',kamera:d.kamera},permissions:{canPublish:d.peran=='ustaz'||!!d.boleh},isSpeaking:(S_.status.bicara||[]).includes(k)})});
  room.remoteParticipants=M;lokal.isSpeaking=(S_.status.bicara||[]).includes(pid);
  if(!admin){const saya=S_.peserta.get(pid)||{},boleh=!!saya.boleh;if(boleh!=lokal.permissions.canPublish){lokal.permissions.canPublish=boleh;if(boleh){toast('Kamu diizinkan bicara. Tekan Aktifkan mikrofon.');lokal.setAttributes({tangan:''}).catch(()=>{})}else if(lokal.isMicrophoneEnabled)lokal.setMicrophoneEnabled(false)}}ubah()};

 /* ---------- Pengajar: jawab tawaran tiap jamaah, kirim campuran suara ---------- */
 const campurUntuk=k=>{const p=S_.pc.get(k);if(!p||!p.tx)return;if(!p.dst)p.dst=AC.createMediaStreamDestination();const tr=p.dst.stream.getAudioTracks()[0];if(p.tx.sender.track!==tr)p.tx.sender.replaceTrack(tr).catch(()=>{});
  (p.src||[]).forEach(s=>{try{s.disconnect()}catch(e){}});p.src=[];const tambah=st=>{try{const s=AC.createMediaStreamSource(st);s.connect(p.dst);p.src.push(s)}catch(e){}};
  if(S_.mic&&S_.micOn)tambah(S_.mic);S_.masuk.forEach((m,j)=>{if(j!=k&&(S_.peserta.get(j)||{}).boleh)tambah(m.stream)})};
 const campurUlang=()=>S_.pc.forEach((_,k)=>campurUntuk(k));
 async function jawab(k,sdp){if(S_.pc.has(k)){S_.pc.get(k).pc.close();S_.pc.delete(k)}
  if(S_.pc.size>=MESH_MAKS){await col.doc('a_'+k).set({penuh:true,t:Date.now()});return}
  const pc=new RTCPeerConnection({iceServers:MESH_ICE}),p={pc};S_.pc.set(k,p);
  pc.ontrack=e=>{if(e.track.kind=='video'){const vs=new MediaStream([e.track]),kirim=on=>room.onVideoJamaah&&room.onVideoJamaah(k,on?vs:null);e.track.onmute=()=>kirim(0);e.track.onunmute=()=>kirim(1);if(!e.track.muted)kirim(1);return}
   const st=e.streams[0]||new MediaStream([e.track]);S_.masuk.set(k,{stream:st,track:e.track,lv:level(st)});putar(k,st);campurUlang();if(KREC)kelasRekamSambung(e.track)};
  pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState)&&S_.pc.get(k)===p){S_.pc.delete(k);S_.masuk.delete(k);campurUlang()}};
  await pc.setRemoteDescription({type:'offer',sdp});const T=pc.getTransceivers();p.tx=T.find(t=>t.receiver.track.kind=='audio');p.vtx=T.find(t=>t.receiver.track.kind=='video');p.tx.direction='sendrecv';campurUntuk(k);
  if(p.vtx){p.vtx.direction='sendrecv';if(S_.cam)p.vtx.sender.replaceTrack(S_.cam.getVideoTracks()[0]).catch(()=>{})}
  await pc.setLocalDescription(await pc.createAnswer());await tungguIce(pc);await col.doc('a_'+k).set({sdp:pc.localDescription.sdp,host:hostSesi,t:Date.now()})}

 /* ---------- Jamaah: tawarkan sambungan ke pengajar ---------- */
 let hostKini='';
 async function sambungHost(){const lama=S_.pc.get('host');if(lama){lama.pc.close();S_.pc.delete('host')}
  const pc=new RTCPeerConnection({iceServers:MESH_ICE}),p={pc};S_.pc.set('host',p);p.tx=pc.addTransceiver('audio',{direction:'sendrecv'});p.vtx=pc.addTransceiver('video',{direction:'sendrecv'});if(S_.cam)p.vtx.sender.replaceTrack(S_.cam.getVideoTracks()[0]).catch(()=>{});
  if(lokal.isMicrophoneEnabled&&S_.mic)await p.tx.sender.replaceTrack(S_.mic.getAudioTracks()[0]);
  pc.ontrack=e=>{if(e.track.kind=='video'){const vs=new MediaStream([e.track]),kirim=on=>room.onVideo&&room.onVideo(on?vs:null);e.track.onmute=()=>kirim(0);e.track.onunmute=()=>kirim(1);if(!e.track.muted)kirim(1);return}
   const st=e.streams[0]||new MediaStream([e.track]);S_.masuk.set('host',{stream:st,track:e.track,lv:level(st)});putar('host',st);ubah()};
  pc.onconnectionstatechange=()=>{if(pc.connectionState=='failed'&&S_.pc.get('host')===p&&!S_.tutup)setTimeout(()=>!S_.tutup&&sambungHost(),2000)};
  await pc.setLocalDescription(await pc.createOffer());await tungguIce(pc);p.menunggu=true;
  await col.doc('a_'+pid).delete().catch(()=>{});await col.doc('o_'+pid).set({sdp:pc.localDescription.sdp,host:hostKini,t:Date.now()})}

 /* Dengarkan semua dokumen mesh */
 S_.unsub.push(col.onSnapshot(async q=>{for(const c of q.docChanges()){const k=c.doc.id,d=c.doc.data()||{},hapus=c.type=='removed';
   if(k.startsWith('p_')){hapus?S_.peserta.delete(k.slice(2)):S_.peserta.set(k.slice(2),d)}
   else if(k=='status'&&!hapus){S_.status=d;if(!admin&&d.host&&d.host!=hostKini){hostKini=d.host;sambungHost().catch(()=>{})}}
   else if(admin&&k.startsWith('o_')&&!hapus&&d.sdp&&d.host==hostSesi){const j=k.slice(2);if(!S_.pc.has(j)||S_.pc.get(j).sdp!=d.sdp){jawab(j,d.sdp).then(()=>{const x=S_.pc.get(j);if(x)x.sdp=d.sdp}).catch(()=>{})}}
   else if(!admin&&k=='a_'+pid&&!hapus){const p=S_.pc.get('host');if(d.penuh){toast('Kelas kecil ini sudah penuh.');room.disconnect();continue}
    if(p&&p.menunggu&&d.sdp&&d.host==hostKini){p.menunggu=false;try{await p.pc.setRemoteDescription({type:'answer',sdp:d.sdp})}catch(e){}}}}
  segarPeserta()},()=>{}));
 /* Kelas diakhiri pengajar → semua keluar */
 S_.unsub.push(FBD.collection('kelas').doc(id).onSnapshot(d=>{if(!admin&&d.exists&&d.data().status=='selesai')room.disconnect()},()=>{}));

 await tulisSaya();S_.hb=setInterval(()=>{tulisSaya().catch(()=>{});segarPeserta()},20000);
 if(admin){await col.doc('status').set({host:hostSesi,bicara:[],t:Date.now()});}
 /* Deteksi siapa yang bicara (di HP pengajar), ditulis ke status bila berubah */
 let terakhir='';S_.lv=setInterval(()=>{if(!admin){const h=S_.masuk.get('host');lokal.isSpeaking=false;return}
  const B=[];if(S_.micOn&&S_.micLv&&S_.micLv()>10)B.push(pid);S_.masuk.forEach((m,k)=>{if(m.lv()>10)B.push(k)});const s=B.sort().join(',');
  if(s!=terakhir){terakhir=s;col.doc('status').set({host:hostSesi,bicara:B,t:Date.now()}).catch(()=>{})}},600);
 addEventListener('pagehide',()=>room.disconnect());
 return room}
