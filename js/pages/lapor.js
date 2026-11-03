/* js/pages/lapor.js - Laporkan masalah: bug, salah tulis, konten kurang, atau saran.
   Laporan (beserta hingga 3 foto, halaman asal, dan info perangkat) dikirim ke Firestore koleksi 'laporan',
   lalu dibaca admin di admin.html. Tanpa internet laporan disimpan dulu dan dikirim otomatis saat online. */
const RFOTO=3,RJENIS=[['Bug','Bug / error'],['Salah tulis','Salah tulis'],['Konten kurang','Konten kurang'],['Saran','Saran']];
const RCONTOH={'Bug':'Apa yang terjadi, dan apa yang kamu lakukan sebelumnya? Mis. tombol Unduh tidak merespons setelah ditekan.','Salah tulis':'Tulis teks yang salah dan seharusnya bagaimana. Mis. harakat pada bait 3 seharusnya fathah, bukan kasrah.','Konten kurang':'Kitab, bab, doa, atau halaman apa yang belum ada? Mis. Juz 2 Safinatun Najah belum ada.','Saran':'Fitur atau perbaikan apa yang kamu inginkan?'};
/* Perkecil foto ke JPEG; ukuran diturunkan bertahap agar semua foto muat dalam satu laporan (batas dokumen Firestore 1 MB) */
const shrink=(f,max,q)=>new Promise(r=>{const i=new Image,u=URL.createObjectURL(f);i.onload=()=>{const s=Math.min(1,max/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);r(c.toDataURL('image/jpeg',q))};i.onerror=()=>{URL.revokeObjectURL(u);r(null)};i.src=u});
async function fotoMuat(F){for(const [m,q] of [[1280,.7],[1024,.6],[800,.55],[640,.5]]){const D=[];for(const f of F){const d=await shrink(f,m,q);if(d)D.push(d)}if(D.join('').length<760000)return D}return []}
const perangkat=()=>({ua:navigator.userAgent.slice(0,200),layar:innerWidth+'x'+innerHeight,tema:S.theme||'auto',pwa:matchMedia('(display-mode: standalone)').matches});
const rtxt=r=>`*Laporan Fadzkuruuni v${VER}*\nJenis: ${r.jenis}\nNama: ${r.nama||'-'}\nHalaman: ${r.halJudul||'-'} (${r.hal||'-'})\nLokasi: ${r.lokasi||'-'}\n\n${r.pesan}`;
async function cloudReport(r){if(!navigator.onLine)throw 0;if(!FBD)await fbInit();if(!FBD)throw 0;
 await Promise.race([FBD.collection('laporan').add({...r,uid:FBU?FBU.uid:null,email:FBU?FBU.email:null,status:'baru',t:Date.now()}),new Promise((_,x)=>setTimeout(()=>x(0),20000))])}
/* Laporan lama di antrean (versi sebelumnya) menyimpan satu foto sebagai teks; diubah ke bentuk baru */
async function flushQ(){if(!(S.rq||[]).length||!navigator.onLine)return;const rest=[];for(const q of S.rq){const r={...q};if(typeof r.foto=='string')r.foto=[r.foto];try{await cloudReport(r)}catch(e){rest.push(q)}}const n=S.rq.length-rest.length;S.rq=rest;save();if(n)toast(n+' laporan tertunda sudah terkirim')}
addEventListener('online',flushQ);setTimeout(flushQ,5000);
/* Hasil: 'cloud' terkirim; 'queued' disimpan karena offline; 'ditolak' disimpan karena server menolak (mis. aturan Firebase belum dipasang) */
async function sendReport(r){try{await cloudReport(r);return 'cloud'}catch(e){const off=!navigator.onLine||e===0&&!navigator.onLine;S.rq=[...(S.rq||[]),r];try{save()}catch(x){S.rq.pop();return 'gagal'}return off?'queued':'ditolak'}}
/* Judul halaman yang sedang dibuka sebelum pindah ke halaman laporan (dipanggil router) */
const judulKini=()=>(($('#qt')||$('#view h1')||{}).textContent||'').trim();

/* Draf form disimpan saat pengguna pergi menandai halaman lain (mode tandai), lalu dipulihkan saat kembali */
let RDRAFT=null,RTANDA=null;
const rhalHTML=(hal,judul,bagian)=>hal?`${ic('pin',16)}<span><b>${esc(judul||'Halaman sebelumnya')}</b><small class="mut">${esc(bagian?'Ditandai: '+bagian:hal)}</small></span><button type="button" class="sb" id="rhx">Tandai halaman lain</button>`:`<span class="mut">Belum ada halaman. Tandai bagian yang bermasalah langsung di aplikasi.</span><button type="button" class="sb pri" id="rhx">Tandai halaman</button>`;

P.lapor=()=>{const asal=LAST&&LAST!='#/lapor'?LAST:'',D=RDRAFT||{},T=RTANDA;RDRAFT=RTANDA=null;
 let hal=T?T.hal:D.hal!==undefined?D.hal:asal,halJ=T?T.judul:D.halJ!==undefined?D.halJ:LASTT,bagian=T?T.bagian:D.bagian||'';
 return {html:head('Laporkan masalah',asal||'#/tentang')+`<p class="mut" style="margin:0 0 12px">Laporanmu langsung masuk ke tim Fadzkuruuni. Sertakan foto atau tangkapan layar bila ada, agar kami cepat menemukan bagian yang salah.</p>
<label>Jenis laporan</label>${seg('rj',RJENIS,D.J||'Bug')}
<label style="margin-top:12px">Halaman yang dilaporkan</label><div class="rhal">${rhalHTML(hal,halJ,bagian)}</div>
<label>Bagian tepatnya (opsional)</label><input class="in" id="rl" maxlength="120" placeholder="Mis. Surah Al-Baqarah ayat 5, bait 12, halaman 34" value="${esc(D.lokasi||(T&&T.nomor)||'')}">
<label>Rincian</label><textarea class="in" id="rm" rows="5" maxlength="2000" placeholder="${RCONTOH[D.J||'Bug']}">${esc(D.pesan||'')}</textarea>
<label>Foto atau tangkapan layar (opsional, maks. ${RFOTO})</label><div class="rfs" id="rfs"></div><label class="ph" for="rf" id="rfl">${ic('camera',20)} <span>Tambah foto</span></label><input type="file" id="rf" accept="image/*" multiple hidden>
<label>Atas nama</label><input class="in" id="rn" maxlength="60" placeholder="Nama kamu (opsional)" value="${esc(D.nama??(S.nm||(FBU&&FBU.displayName)||''))}">
<label>Kontak untuk dihubungi (opsional)</label><input class="in" id="rc" maxlength="80" placeholder="Email atau nomor WhatsApp" value="${esc(D.kontak??((FBU&&FBU.email)||''))}">
<p class="mut" style="font-size:12px;margin:0 0 4px">Versi aplikasi dan jenis perangkat ikut terkirim untuk membantu mencari penyebab bug.</p>
<button class="btn" id="rk" style="width:100%;margin-top:8px">Kirim laporan</button><p style="text-align:center;margin:12px 0 0"><a class="mut" style="font-size:13px;text-decoration:underline" href="#" id="rwa">Atau kirim lewat WhatsApp</a></p>`,
 init(){let J=D.J||'Bug',F=D.F||[];
  if(T&&T.foto&&F.length<RFOTO)F.push({f:T.foto,u:URL.createObjectURL(T.foto)});
  segBind('rj',v=>{J=v;$('#rm').placeholder=RCONTOH[v]});
  const fotoUI=()=>{$('#rfs').innerHTML=F.map((f,i)=>`<span><img src="${f.u}" alt="Foto ${i+1}"><button type="button" data-rfx="${i}" aria-label="Hapus foto">×</button></span>`).join('');$('#rfl').style.display=F.length>=RFOTO?'none':''};fotoUI();
  $('#rf').onchange=e=>{for(const f of [...e.target.files].slice(0,RFOTO-F.length))F.push({f,u:URL.createObjectURL(f)});e.target.value='';fotoUI()};
  $('#rfs').onclick=e=>{const b=e.target.closest('[data-rfx]');if(!b)return;URL.revokeObjectURL(F[+b.dataset.rfx].u);F.splice(+b.dataset.rfx,1);fotoUI()};
  /* Tandai halaman lain: simpan isian, buka aplikasi dalam mode tandai */
  $('.rhal').onclick=e=>{if(!e.target.closest('#rhx'))return;RDRAFT={J,pesan:$('#rm').value,lokasi:$('#rl').value,nama:$('#rn').value,kontak:$('#rc').value,F,hal,halJ,bagian};tandaiMulai(hal||asal||'#/')};
  const isi=async()=>{const pesan=$('#rm').value.trim();if(pesan.length<5){toast('Tulis rincian laporan terlebih dahulu');$('#rm').focus();return null}
   return {jenis:J,pesan,lokasi:[$('#rl').value.trim(),bagian&&!$('#rl').value.includes(bagian)?'Ditandai: '+bagian:''].filter(Boolean).join(' · ').slice(0,300),hal,halJudul:hal?halJ||'':'',nama:$('#rn').value.trim(),kontak:$('#rc').value.trim(),versi:VER,perangkat:perangkat(),foto:F.length?await fotoMuat(F.map(x=>x.f)):[]}};
  $('#rwa').onclick=async e=>{e.preventDefault();const r=await isi();if(!r)return;const u='https://wa.me/'+REPORT.wa+'?text='+encodeURIComponent(rtxt(r)+(r.foto.length?'\n\n(Foto belum ikut terkirim; lampirkan di WhatsApp)':''));const w=open(u,'_blank');if(!w)location.href=u};
  $('#rk').onclick=async()=>{const b=$('#rk');b.disabled=true;b.textContent='Menyiapkan…';const r=await isi();if(!r){b.disabled=false;b.textContent='Kirim laporan';return}
   b.textContent='Mengirim…';const st=await sendReport(r);b.disabled=false;b.textContent='Kirim laporan';
   if(st=='gagal')return toast('Laporan gagal disimpan. Coba kurangi foto, atau kirim lewat WhatsApp.');
   F.forEach(x=>URL.revokeObjectURL(x.u));
   dlg('Terima kasih atas laporanmu',st=='cloud'?'Laporanmu sudah diterima tim Fadzkuruuni dan akan segera kami periksa.':st=='queued'?'Belum ada internet. Laporanmu disimpan dan akan dikirim otomatis saat internet tersedia.':'Server laporan sedang tidak bisa menerima (pengaturan server belum siap). Laporanmu disimpan di perangkat dan akan dikirim ulang otomatis. Bila mendesak, kirim juga lewat WhatsApp.',()=>location.hash=asal||'#/tentang')}}}};

/* Mode tandai: pengguna membuka halaman yang bermasalah, menekan "Tandai di sini", lalu mengetuk bagian yang salah.
   Bagian itu disorot, diambil tangkapannya (html2canvas, butuh internet), lalu kembali ke form laporan. */
let TDM=null;
const tdBar=(teks,tombol)=>{TDM.bar.innerHTML=`<span>${teks}</span><div>${tombol}</div>`;tdTinggi()};
/* Tinggi pita petunjuk dipakai untuk menurunkan aplikasi (body.td #app) */
const tdTinggi=()=>{if(TDM)document.documentElement.style.setProperty('--tdh',TDM.bar.offsetHeight+'px')};
addEventListener('resize',tdTinggi);
function tdBuka(){TDM={bar:mk('tdbar',''),lap:null,box:null,el:null};TDM.bar.setAttribute('role','status');document.body.classList.add('td');tdLangkah1()}
/* Draf ikut disimpan di sesi agar mode tandai tetap berjalan bila halaman dimuat ulang (foto tidak ikut tersimpan) */
/* Halaman laporan diganti (bukan ditumpuk) di riwayat: tombol Kembali selama menandai berpindah antarhalaman aplikasi
   tanpa keluar dari mode tandai; draf laporan tetap tersimpan dan kembali lewat Batal atau setelah menandai */
function tandaiMulai(ke){tandaiAkhir();try{sessionStorage.fztd=JSON.stringify({...RDRAFT,F:[],nF:(RDRAFT.F||[]).length})}catch(e){}tdBuka();location.replace(location.pathname+location.search+ke)}
const tdLangkah1=()=>tdBar(`${ic('flag',18)} <span>Buka halaman yang bermasalah. Sudah di halamannya? Tekan <b>Tandai di sini</b>.</span>`,'<button class="sb" data-td="x">Batal</button><button class="sb pri" data-td="1">Tandai di sini</button>');
function tdLangkah2(){const L=TDM.lap||(TDM.lap=mk('tdlap',''));L.hidden=false;TDM.hv&&(TDM.hv.hidden=true);TDM.box&&TDM.box.remove();TDM.box=null;TDM.el=null;
 tdBar(`${ic('flag',18)} <span><b>Ketuk bagian yang bermasalah</b><br><small>Mis. sapaan, jadwal salat, satu ayat, atau satu tombol</small></span>`,'<button class="sb" data-td="0">Kembali</button><button class="sb" data-td="x">Batal</button>')}
/* Bagian yang dipilih: blok bermakna terdekat (ayat, bait, kartu, baris, paragraf) di dalam isi halaman */
/* Bagian dipilih sekecil mungkin tetapi tetap utuh: satu waktu salat, sapaan, satu tombol menu, satu ayat, satu baris daftar, dst. */
const TDSEL='.pt>div,.gr,.top,.note,.srch,.car>a,.grid>a,.hero,.ay,.ay2,.ayt,.mushaf,.card,.row,.srw,.pnav a,.tabs,.seg,.zb,.dlw,li,p,h1,h2,h3,img,.ar2,.bar';
const tdBlok=(x,y)=>{const e=document.elementsFromPoint(x,y).find(n=>n.closest('#view'));if(!e)return null;const b=e.closest(TDSEL);return b&&b.closest('#view')&&b!=$('#view')?b:null};
const tdNomor=e=>{const a=e.closest('[id^="a"]');if(a&&$('#ay')&&/^a\d+$/.test(a.id))return 'Ayat '+a.id.slice(1);const n=e.closest('.ay2')?.querySelector('.n');if(n)return 'No. '+n.textContent.trim();const p=e.closest('[data-p]');return p?'Halaman '+p.dataset.p:''};
function tdPilih(e){const r=e.getBoundingClientRect(),b=TDM.box||(TDM.box=mk('tdbox',''));TDM.el=e;
 Object.assign(b.style,{left:r.left-4+'px',top:r.top-4+'px',width:r.width+8+'px',height:r.height+8+'px'});TDM.lap.hidden=true;
 TDM.hv&&(TDM.hv.hidden=true);tdBar(`${ic('check',18)} <span><b>Laporkan bagian ini?</b><br><small>Bagian yang disorot akan diambil gambarnya untuk laporan</small></span>`,'<button class="sb" data-td="2">Pilih ulang</button><button class="sb pri" data-td="ok">Ya, laporkan</button>')}
async function tdSelesai(){const e=TDM.el;if(!e)return;tdBar('Mengambil tangkapan…','');let foto=null;
 try{if(!window.html2canvas)await ldjs('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
  const c=await html2canvas(e,{backgroundColor:getComputedStyle(document.body).backgroundColor,scale:Math.min(2,devicePixelRatio||1),logging:false,useCORS:true}),k=document.createElement('canvas'),p=12;
  k.width=c.width+p*2;k.height=c.height+p*2;const x=k.getContext('2d');x.fillStyle=getComputedStyle(document.body).backgroundColor||'#fff';x.fillRect(0,0,k.width,k.height);x.drawImage(c,p,p);x.strokeStyle='#e0442f';x.lineWidth=4;x.strokeRect(4,4,k.width-8,k.height-8);
  foto=await new Promise(r=>k.toBlob(b=>r(b&&new File([b],'tanda.png',{type:'image/png'})),'image/png'))}catch(x){toast('Tangkapan layar tidak bisa diambil; bagian tetap ditandai')}
 RTANDA={hal:location.hash||'#/',judul:judulKini(),bagian:(e.innerText||e.alt||'').replace(/\s+/g,' ').trim().slice(0,160),nomor:tdNomor(e),foto};tandaiAkhir();location.hash='#/lapor'}
function tandaiAkhir(){try{delete sessionStorage.fztd}catch(e){}if(!TDM)return;document.body.classList.remove('td');['bar','lap','box','hv'].forEach(k=>TDM[k]&&TDM[k].remove());TDM=null}
document.addEventListener('click',e=>{const b=e.target.closest('[data-td]');if(b&&TDM){const v=b.dataset.td;
  if(v=='x'){tandaiAkhir();if(RDRAFT)location.hash='#/lapor';return}if(v=='1'||v=='2')return tdLangkah2();if(v=='0'){TDM.lap.hidden=true;TDM.hv&&(TDM.hv.hidden=true);return tdLangkah1()}if(v=='ok')return tdSelesai()}
 if(TDM&&e.target.closest('.tdlap')){const t=tdBlok(e.clientX,e.clientY);t?tdPilih(t):toast('Ketuk salah satu bagian isi halaman')}});
/* Di laptop, bagian di bawah kursor sudah disorot terang sebelum diklik */
document.addEventListener('pointermove',e=>{if(!TDM||!TDM.lap||TDM.lap.hidden||e.pointerType!='mouse')return;const t=tdBlok(e.clientX,e.clientY),h=TDM.hv||(TDM.hv=mk('tdhv',''));h.hidden=!t;if(!t)return;const r=t.getBoundingClientRect();Object.assign(h.style,{left:r.left-4+'px',top:r.top-4+'px',width:r.width+8+'px',height:r.height+8+'px'})});
/* Sorotan ikut bergeser saat halaman digulir; roda tetikus tetap bisa menggulir saat memilih */
const tdLetak=()=>{if(!TDM||!TDM.box||!TDM.el)return;const r=TDM.el.getBoundingClientRect();Object.assign(TDM.box.style,{left:r.left-4+'px',top:r.top-4+'px'})};
document.addEventListener('scroll',tdLetak,true);
document.addEventListener('wheel',e=>{if(TDM&&e.target.closest('.tdlap'))$('#view').scrollBy(0,e.deltaY)},{passive:true});
/* Pindah halaman saat menandai: sorotan lama dibuang; kembali ke langkah pertama */
addEventListener('hashchange',()=>{if(!TDM)return;TDM.hv&&(TDM.hv.hidden=true);if(location.hash.startsWith('#/lapor'))return tandaiAkhir();if(TDM.box||!TDM.lap?.hidden){TDM.lap&&(TDM.lap.hidden=true);TDM.box&&TDM.box.remove();TDM.box=null;tdLangkah1()}});
/* Lanjutkan mode tandai setelah muat ulang */
try{const d=JSON.parse(sessionStorage.fztd||'null');if(d){RDRAFT={...d,F:[]};tdBuka();if(d.nF)setTimeout(()=>toast('Halaman dimuat ulang: foto yang tadi dipilih perlu ditambahkan lagi'),800)}}catch(e){}
