/* js/pages/pengaturan/izin.js - Pengaturan: Izin Aplikasi.
   Satu tempat untuk melihat dan memberi izin yang dipakai aplikasi (seperti di WhatsApp): notifikasi, lokasi, mikrofon,
   kamera, penyimpanan tetap, dan sensor kompas. Status dibaca lewat navigator.permissions (permFill di js/core/adzan.js).
   Izin yang sudah ditolak tidak bisa diminta ulang oleh situs, jadi pengguna diberi petunjuk membukanya di pengaturan browser/HP. */
const IZIN=[
 ['notifications','bell','Notifikasi','Pengingat adzan dan pemberitahuan aplikasi'],
 ['geolocation','pin','Lokasi','Jadwal salat dan arah kiblat sesuai tempatmu'],
 ['microphone','mic','Mikrofon','Bicara dengan Fadz AI (pesan suara)'],
 ['camera','camera','Kamera','Memotret langsung saat melaporkan masalah'],
 ['persistent-storage','down','Penyimpanan tetap','Agar unduhan offline (Al-Qur\'an, kitab, maulid, AI) tidak dihapus otomatis oleh browser']];
const izinSensorTxt=()=>window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission?'Diminta saat membuka Kiblat':'Tidak perlu izin';
/* Di aplikasi Android (native) izin adalah izin aplikasi Android: penyimpanan tidak perlu izin, ada tambahan Alarm tepat waktu untuk adzan */
const izinDaftar=()=>window.ANDROID?IZIN.filter(x=>x[0]!='persistent-storage').concat([['alarm','clock','Alarm tepat waktu','Agar notifikasi adzan berbunyi tepat pada waktunya walau aplikasi ditutup']]):IZIN;
SETPAGES.izin=()=>({html:head('Izin Aplikasi','#/pengaturan')+`<div id="izl"><p class="mut" style="margin:0 0 10px">Izin hanya dipakai untuk fiturnya masing-masing. Ketuk <b>Izinkan</b> untuk memberi izin; izin yang sudah ditolak bisa dibuka lagi lewat ${window.ANDROID?'Pengaturan HP':'pengaturan browser atau HP'}.</p>
<div class="list sg">${izinDaftar().map(([n,i,t,k])=>row(i,`${t} ${bdg(n)}`,k,`<button class="btn s" data-izin="${n}">Izinkan</button>`)).join('')}
${row('compass','Sensor kompas <span class="bdg">'+izinSensorTxt()+'</span>','Menunjukkan arah kiblat dengan memutar HP',window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission?'<button class="btn s" data-izin="sensor">Izinkan</button>':'')}
${row('beads','Getar <span class="bdg">Tidak perlu izin</span>','Getaran tasbih dan pesan suara','<button class="btn s" data-izin="getar">Coba</button>')}
${row('play','Suara & audio <span class="bdg">Tidak perlu izin</span>','Murattal, adzan, dan Dengarkan jawaban Fadz AI','<button class="btn s" data-izin="suara">Coba</button>')}</div>
<h2>Izin ditolak?</h2>${window.ANDROID?`<div class="card"><p class="mut" style="margin:0 0 10px;line-height:1.7">Buka <b>Pengaturan HP › Aplikasi › Fadzkuruuni › Izin</b>, lalu izinkan yang diperlukan. Setelah itu kembali ke halaman ini.</p><button class="btn" data-izin="buka">Buka pengaturan aplikasi</button></div>`:`<div class="card"><p class="mut" style="margin:0;line-height:1.7">Di <b>Chrome</b>: ketuk ikon di kiri alamat situs › <b>Izin</b> (atau Setelan situs) › izinkan yang diperlukan.<br>Di <b>aplikasi terpasang</b>: tekan lama ikon Fadzkuruuni › <b>Info aplikasi</b> › <b>Izin</b>.<br>Setelah itu buka lagi halaman ini untuk melihat statusnya.</p></div>`}</div>`,
 init(){izinIsi();if(window.ANDROID)document.addEventListener('visibilitychange',function f(){if(!$('#izl'))return document.removeEventListener('visibilitychange',f);if(!document.hidden)izinIsi()});$('#izl').onclick=async e=>{const b=e.target.closest('[data-izin]');if(!b)return;const n=b.dataset.izin;b.disabled=true;
  try{if(window.ANDROID&&['geolocation','microphone','camera','alarm','buka'].includes(n)){if(n=='buka')andPanggil('bukaPengaturan');else{const st=await andMintaIzin(n);if(n!='alarm')toast(st=='granted'?'Izin diberikan':st=='denied'?'Izin ditolak. Buka pengaturan aplikasi untuk mengizinkan.':'Izin belum diberikan')}}
   else if(n=='notifications')await askNotif();
   else if(n=='geolocation')await new Promise((ok,no)=>navigator.geolocation?navigator.geolocation.getCurrentPosition(ok,no,{timeout:15000}):no()).then(()=>toast('Izin lokasi diberikan'),()=>toast('Lokasi tidak diizinkan atau tidak tersedia'));
   else if(n=='microphone'||n=='camera'){const s=await navigator.mediaDevices.getUserMedia(n=='camera'?{video:true}:{audio:true});s.getTracks().forEach(t=>t.stop());toast('Izin '+(n=='camera'?'kamera':'mikrofon')+' diberikan')}
   else if(n=='persistent-storage'){const ok=navigator.storage&&navigator.storage.persist&&await navigator.storage.persist();toast(ok?'Penyimpanan tetap aktif':'Browser belum mengizinkan; biasanya diberikan otomatis bila aplikasi dipasang dan sering dipakai')}
   else if(n=='sensor'){const r=await DeviceOrientationEvent.requestPermission();toast(r=='granted'?'Sensor kompas diizinkan':'Sensor kompas tidak diizinkan')}
   else if(n=='getar'){navigator.vibrate?(navigator.vibrate([120,80,120]),toast('HP bergetar bila didukung')):toast('Perangkat ini tidak mendukung getar')}
   else if(n=='suara'){beep();toast('Terdengar bunyi? Bila tidak, periksa volume HP')}}
  catch(x){toast(x&&x.name=='NotAllowedError'?'Izin ditolak. Buka lewat pengaturan browser (lihat petunjuk di bawah).':x&&x.name=='NotFoundError'?'Perangkat ini tidak punya '+(n=='camera'?'kamera':'mikrofon'):'Izin tidak bisa diminta di perangkat ini')}
  b.disabled=false;izinIsi()}}});
/* Isi status tiap izin; tombol Izinkan disembunyikan bila sudah diizinkan */
async function izinIsi(){await permFill();for(const n of ['persistent-storage']){const e=$(`[data-perm="${n}"]`);if(e&&navigator.storage&&navigator.storage.persisted){try{const p=await navigator.storage.persisted();e.textContent=p?'Diizinkan':'Belum aktif';e.className='bdg '+(p?'':'mid')}catch(x){}}}
 $$('[data-perm]').forEach(e=>{const b=$(`[data-izin="${e.dataset.perm}"]`);if(b)b.hidden=e.textContent=='Diizinkan'})}
