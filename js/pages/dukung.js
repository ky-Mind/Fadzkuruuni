/* js/pages/dukung.js - Dukung kami: satu-satunya tempat pembayaran di aplikasi (donasi untuk pengembangan Fadzkuruuni).
   - "Buka": nomor tujuan disalin, lalu aplikasi bank/dompetnya dibuka; bila belum terpasang, ke Play Store.
     (Aplikasi bank tidak menyediakan tautan resmi untuk mengisi tujuan transfer otomatis, jadi nomor tinggal ditempel.)
   - "Sudah berdonasi? Kabari kami": konfirmasi (bukti transfer opsional) masuk ke dashboard admin, tab Donasi
     (koleksi 'laporan' dengan jenis 'Donasi'; memakai cloudReport/sendReport & fotoMuat dari js/pages/lapor.js).
   - "Bagikan aplikasi": tautan unduhan rilis terbaru di GitHub Releases + versi web, lewat lembar berbagi HP. */
/* [nama, nomor, paket Android di Play Store] */
const BANK=[['BSI','7283603126','com.bsm.activity2'],['Dana','089652243480','id.dana'],['GoPay','089652243480','com.gojek.gopay'],['OVO','030037791453','ovo.id'],['SeaBank','901696052778','id.co.bankbkemobile.digitalbank'],['Bank Saqu','10088196215','bjj.bank.digital.indo.prod']];
const UNDUH_APK='https://github.com/ky-Mind/Fadzkuruuni/releases/latest/download/fadzkuruuni.apk';
const salinTeks=t=>(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(()=>{const a=document.createElement('textarea');a.value=t;document.body.append(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove()});
/* Buka aplikasi bank/dompet: di aplikasi Android lewat jembatan; di Chrome Android lewat intent (cadangan ke Play Store) */
function bukaBank(b){salinTeks(b[1]);toast(`Nomor ${b[0]} ${b[1]} disalin. Tempel di kolom tujuan transfer.`);
 if(window.ANDROID&&window.FadzAndroid.bukaAplikasi){andPanggil('bukaAplikasi',b[2]);return}
 const play='https://play.google.com/store/apps/details?id='+b[2];
 if(/android/i.test(navigator.userAgent))setTimeout(()=>{location.href=`intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${b[2]};S.browser_fallback_url=${encodeURIComponent(play)};end`},600)}
P.dukung=()=>({html:head('Dukung kami','back')+`<div class="card dkh"><span class="dki">${ic('heart',26)}</span><b>Bantu Fadzkuruuni terus berkembang</b>
<p class="mut">Fadzkuruuni gratis dan tanpa iklan, dikembangkan oleh <b>KyMind</b> bersama tim Pondok Pesantren Fadzkuruuni. Dukunganmu dipakai untuk biaya server dan Fadz AI, membuat fitur-fitur baru, dan menyemangati pengembang agar terus memperbaiki aplikasi ini.</p></div>
<h3 class="sec">Donasi untuk pengembangan</h3>
<div class="list">${BANK.map((b,i)=>`<div class="row dkr"><span class="t">${b[0]}<br><b>${b[1]}</b></span><button type="button" class="sb pri" data-dkb="${i}">${ic('next',14)} Buka</button></div>`).join('')}</div>
<p class="mut" style="font-size:13px;margin:8px 0 0">Ketuk <b>Buka</b>: nomor tujuan langsung tersalin dan aplikasinya terbuka (bila belum ada, diarahkan ke Play Store). Berapa pun nominalnya sangat berarti. Nama penerima yang muncul saat transfer adalah nama pengembang Fadzkuruuni.</p>
<button type="button" class="btn" id="dkkf" style="width:100%;margin-top:12px">Sudah berdonasi? Kabari kami</button>
<h3 class="sec">Dukungan tanpa biaya</h3>
<div class="list"><a class="srw" href="#" id="dkbg"><span class="si">${ic('share',20)}</span><span class="t">Bagikan aplikasi ke teman dan keluarga</span>${ic('next',18)}</a>${lk('#/lapor','flag','Laporkan bug atau beri saran')}</div>
<p class="mut tkred">Jazakumullahu khairan atas dukunganmu</p>`,
 init(){
  $$('[data-dkb]').forEach(x=>x.onclick=()=>bukaBank(BANK[+x.dataset.dkb]));
  $('#dkkf').onclick=dkKabari;
  /* Bagikan tautan rilis terbaru: lembar berbagi HP (WhatsApp, Instagram, dll.); tautan juga disalin */
  $('#dkbg').onclick=async e=>{e.preventDefault();const t=`Assalamu'alaikum! Yuk pakai aplikasi Fadzkuruuni: Al-Qur'an, jadwal salat & adzan, kitab kuning, doa, dan Fadz AI. Gratis tanpa iklan.\n\nUnduh aplikasi Android:\n${UNDUH_APK}\n\nAtau buka versi web:\nhttps://fadzkuruuni.vercel.app`;
   salinTeks(t);if(window.ANDROID&&window.FadzAndroid.bagikan){andPanggil('bagikan',t);return}
   try{if(navigator.share)return await navigator.share({title:'Fadzkuruuni',text:t})}catch(x){if(x&&x.name=='AbortError')return}toast('Tautan aplikasi disalin. Tempel di WhatsApp, Instagram, atau mana saja.')}}});
/* Konfirmasi donasi → dashboard admin (tab Donasi). Bukti transfer opsional (maks. 1 foto). Tidak wajib masuk akun. */
function dkKabari(){if($('.back-d'))return;let F=null;const e=document.createElement('div');e.className='back-d';
 e.innerHTML=`<div class="sheet" role="dialog" aria-label="Kabari donasi" style="max-height:90vh;overflow:auto"><b>Kabari kami tentang donasimu</b><p class="mut" style="margin:4px 0 12px">Konfirmasimu masuk ke tim Fadzkuruuni. Semua isian kecuali metode boleh dikosongkan.</p>
<label>Lewat</label><select class="in" id="dkm">${BANK.map(b=>`<option>${b[0]}</option>`).join('')}</select>
<label>Nominal (opsional)</label><input class="in" id="dkn" inputmode="numeric" placeholder="mis. 50000">
<label>Nama (opsional)</label><input class="in" id="dknm" maxlength="60" placeholder="Boleh dikosongkan atau 'Hamba Allah'" value="${esc(FBU&&FBU.displayName||S.nm||'')}">
<label>Pesan atau doa (opsional)</label><textarea class="in" id="dkp" rows="3" maxlength="500" placeholder="Semoga bermanfaat…"></textarea>
<label>Bukti transfer (opsional)</label><div class="rfs" id="dkf"></div><label class="ph" for="dkfi" id="dkfl">${ic('camera',20)} <span>Lampirkan bukti</span></label><input type="file" id="dkfi" accept="image/*" hidden>
<label>Nomor WhatsApp (opsional)</label><input class="in" id="dkw" maxlength="40" inputmode="tel" placeholder="Bila ingin dihubungi tim">
<div class="act"><button class="btn s" data-x style="flex:1">Batal</button><button class="btn" id="dkk" style="flex:1">Kirim konfirmasi</button></div></div>`;
 document.body.append(e);
 const fUI=()=>{$('#dkf').innerHTML=F?`<span><img src="${F.u}" alt="Bukti transfer"><button type="button" data-fx aria-label="Hapus bukti">×</button></span>`:'';$('#dkfl').style.display=F?'none':''};
 $('#dkfi').onchange=x=>{const f=x.target.files[0];if(f){F={f,u:URL.createObjectURL(f)}}x.target.value='';fUI()};
 e.onclick=async x=>{if(x.target==e||x.target.closest('[data-x]')){F&&URL.revokeObjectURL(F.u);return e.remove()}if(x.target.closest('[data-fx]')){URL.revokeObjectURL(F.u);F=null;return fUI()}
  if(!x.target.closest('#dkk'))return;const b=$('#dkk');b.disabled=true;b.textContent='Mengirim…';
  const nom=+($('#dkn').value||'').replace(/\D/g,''),m=$('#dkm').value,p=$('#dkp').value.trim();
  const r={jenis:'Donasi',pesan:p||'Konfirmasi donasi',lokasi:m+(nom?' · '+rp(nom):''),nama:$('#dknm').value.trim(),kontak:$('#dkw').value.trim(),versi:VER,perangkat:perangkat(),foto:F?await fotoMuat([F.f]):[]};
  const st=await sendReport(r);b.disabled=false;b.textContent='Kirim konfirmasi';
  if(st=='gagal')return toast('Gagal mengirim. Coba lagi atau kurangi ukuran foto.');
  F&&URL.revokeObjectURL(F.u);e.remove();
  dlg('Jazakallahu khairan',st=='cloud'?'Konfirmasi donasimu sudah diterima tim Fadzkuruuni. Semoga Allah membalas kebaikanmu.':'Belum ada internet. Konfirmasimu disimpan dan dikirim otomatis saat internet tersedia.')}}
