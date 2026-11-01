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
async function sendReport(r){try{await cloudReport(r);return 'cloud'}catch(e){S.rq=[...(S.rq||[]),r];try{save()}catch(x){S.rq.pop();return 'gagal'}return 'queued'}}
/* Judul halaman yang sedang dibuka sebelum pindah ke halaman laporan (dipanggil router) */
const judulKini=()=>(($('#qt')||$('#view h1')||{}).textContent||'').trim();

P.lapor=()=>{const asal=LAST&&LAST!='#/lapor'?LAST:'';return {html:head('Laporkan masalah',asal||'#/tentang')+`<p class="mut" style="margin:0 0 12px">Laporanmu langsung masuk ke tim Fadzkuruuni. Sertakan foto atau tangkapan layar bila ada, agar kami cepat menemukan bagian yang salah.</p>
<label>Jenis laporan</label>${seg('rj',RJENIS,'Bug')}
<label style="margin-top:12px">Halaman yang dilaporkan</label><div class="rhal">${asal?`${ic('pin',16)}<span><b>${esc(LASTT||'Halaman sebelumnya')}</b><small class="mut">${esc(asal)}</small></span><button type="button" class="sb" id="rhx">Bukan halaman ini</button>`:`<span class="mut">Tidak ada halaman asal. Sebutkan bagiannya di kolom di bawah.</span>`}</div>
<label>Bagian tepatnya (opsional)</label><input class="in" id="rl" maxlength="120" placeholder="Mis. Surah Al-Baqarah ayat 5, bait 12, halaman 34">
<label>Rincian</label><textarea class="in" id="rm" rows="5" maxlength="2000" placeholder="${RCONTOH.Bug}"></textarea>
<label>Foto atau tangkapan layar (opsional, maks. ${RFOTO})</label><div class="rfs" id="rfs"></div><label class="ph" for="rf" id="rfl">${ic('camera',20)} <span>Tambah foto</span></label><input type="file" id="rf" accept="image/*" multiple hidden>
<label>Atas nama</label><input class="in" id="rn" maxlength="60" placeholder="Nama kamu (opsional)" value="${esc(S.nm||(FBU&&FBU.displayName)||'')}">
<label>Kontak untuk dihubungi (opsional)</label><input class="in" id="rc" maxlength="80" placeholder="Email atau nomor WhatsApp" value="${esc((FBU&&FBU.email)||'')}">
<p class="mut" style="font-size:12px;margin:0 0 4px">Versi aplikasi dan jenis perangkat ikut terkirim untuk membantu mencari penyebab bug.</p>
<button class="btn" id="rk" style="width:100%;margin-top:8px">Kirim laporan</button><p style="text-align:center;margin:12px 0 0"><a class="mut" style="font-size:13px;text-decoration:underline" href="#" id="rwa">Atau kirim lewat WhatsApp</a></p>`,
 init(){let J='Bug',F=[],hal=asal;
  segBind('rj',v=>{J=v;$('#rm').placeholder=RCONTOH[v]});
  const fotoUI=()=>{$('#rfs').innerHTML=F.map((f,i)=>`<span><img src="${f.u}" alt="Foto ${i+1}"><button type="button" data-rfx="${i}" aria-label="Hapus foto">×</button></span>`).join('');$('#rfl').style.display=F.length>=RFOTO?'none':''};
  $('#rf').onchange=e=>{for(const f of [...e.target.files].slice(0,RFOTO-F.length))F.push({f,u:URL.createObjectURL(f)});e.target.value='';fotoUI()};
  $('#rfs').onclick=e=>{const b=e.target.closest('[data-rfx]');if(!b)return;URL.revokeObjectURL(F[+b.dataset.rfx].u);F.splice(+b.dataset.rfx,1);fotoUI()};
  $('#rhx')&&($('#rhx').onclick=()=>{hal='';$('.rhal').innerHTML='<span class="mut">Halaman asal tidak disertakan. Sebutkan bagiannya di kolom di bawah.</span>'});
  const isi=async()=>{const pesan=$('#rm').value.trim();if(pesan.length<5){toast('Tulis rincian laporan terlebih dahulu');$('#rm').focus();return null}
   return {jenis:J,pesan,lokasi:$('#rl').value.trim(),hal,halJudul:hal?LASTT||'':'',nama:$('#rn').value.trim(),kontak:$('#rc').value.trim(),versi:VER,perangkat:perangkat(),foto:F.length?await fotoMuat(F.map(x=>x.f)):[]}};
  $('#rwa').onclick=async e=>{e.preventDefault();const r=await isi();if(!r)return;const u='https://wa.me/'+REPORT.wa+'?text='+encodeURIComponent(rtxt(r)+(r.foto.length?'\n\n(Foto belum ikut terkirim; lampirkan di WhatsApp)':''));const w=open(u,'_blank');if(!w)location.href=u};
  $('#rk').onclick=async()=>{const b=$('#rk');b.disabled=true;b.textContent='Menyiapkan…';const r=await isi();if(!r){b.disabled=false;b.textContent='Kirim laporan';return}
   b.textContent='Mengirim…';const st=await sendReport(r);b.disabled=false;b.textContent='Kirim laporan';
   if(st=='gagal')return toast('Laporan gagal disimpan. Coba kurangi foto, atau kirim lewat WhatsApp.');
   F.forEach(x=>URL.revokeObjectURL(x.u));
   dlg('Terima kasih atas laporanmu',st=='cloud'?'Laporanmu sudah diterima tim Fadzkuruuni dan akan segera kami periksa.':'Belum ada internet. Laporanmu disimpan dan akan dikirim otomatis saat internet tersedia.',()=>location.hash=asal||'#/tentang')}}}};
