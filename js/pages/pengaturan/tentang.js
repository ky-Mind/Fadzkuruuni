/* js/pages/pengaturan/tentang.js - Pengaturan: Tentang dan Bantuan */
SETPAGES.tentang=()=>({html:head('Tentang & Bantuan','#/pengaturan')+`<div class="list sg">${lk('#/tentang','info','Tentang aplikasi')}${lk('#/tutorial','play','Video tutorial')}${lk('#/lapor','flag','Laporkan bug atau kesalahan penulisan')}${lk('#/dukung','heart','Dukung kami')}</div>
<h2>Versi</h2><div class="list sg">${(()=>{/* Dua jenis pembaruan, dipisah:
  1) Aplikasi Android (APK): harus diunduh & dipasang ulang bila ada versi baru (dicek ke rilis GitHub)
  2) Isi & tampilan (web): masuk otomatis setiap aplikasi dibuka, tanpa unduh APK */
 const APK='https://github.com/ky-Mind/Fadzkuruuni/releases/latest/download/fadzkuruuni.apk',jm=t=>t?new Date(t).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}):'';
 const web=`<div class="srw"><span class="si">${ic('rot',20)}</span><span class="t">Isi & tampilan · versi ${esc(VER)}<br><small class="mut">Diperbarui otomatis setiap aplikasi dibuka, tanpa perlu mengunduh apa pun.</small></span><button class="sb" data-upweb>Muat terbaru</button></div>`;
 if(!window.ANDROID)return `<div class="srw"><span class="si">${ic('down',20)}</span><span class="t">Aplikasi Android<span id="apkv"></span><br><small class="mut">Pasang aplikasinya untuk adzan, notifikasi kelas, dan bagikan layar dari HP.</small></span><a class="sb pri" href="${APK}" target="_blank" rel="noopener">${ic('down',14)} Unduh APK</a></div>`+web;
 const kini=window.FadzAndroid.versi?FadzAndroid.versi():'',u=S.upInfo,ada=u&&kini&&verLebihBaru(u.v,kini);
 return `<div class="srw${ada?' upada':''}"><span class="si">${ic('down',20)}</span><span class="t">Aplikasi Android · versi ${esc(kini)}<br><small class="mut">${ada?'<b>Versi '+esc(u.v)+' tersedia.</b> Unduh lalu pasang (Perbarui); data tetap aman.':'Versi terbaru'+(S.upCek?' (dicek pukul '+jm(S.upCek)+')':'')+'. Versi baru harus diunduh & dipasang ulang.'}</small></span>${ada?(apkLangsung()?`<button class="sb pri" data-upgo>${ic('down',14)} Perbarui</button>`:`<a class="sb pri" href="${esc(u.url)}" target="_blank" rel="noopener">${ic('down',14)} Perbarui</a>`):'<button class="sb pri" data-upcek>Cek pembaruan</button>'}</div>`+web})()}</div>
<h2>Privasi</h2><div class="list sg">${row('count','Bantu kembangkan aplikasi','Kirim hitungan pemakaian tanpa data pribadi (fitur yang dibuka, kota jadwal salat)',tg('stt',S.stat!==false))}</div><p class="mut pkaki"><a href="kebijakan-privasi.html">Kebijakan Privasi</a> · <a href="hapus-data.html">Penghapusan Data</a></p>`,
 init(){$('#stt').onchange=e=>{S.stat=e.target.checked;save()};
  /* Tombol Perbarui (aplikasi): buka lembar pembaruan dengan unduhan langsung */
  const g=$('[data-upgo]');if(g)g.onclick=()=>{S.upTunda=0;save();pembaruanCek(1)};
  /* Peramban: tampilkan versi APK terbaru dari apk.json */
  const v=$('#apkv');if(v)fetch('apk.json?c='+Math.floor(Date.now()/18e5)).then(r=>r.json()).then(j=>{const t=String(j.tag_name||'').replace(/^v/,'');if(t)v.textContent=' · versi '+t}).catch(()=>{})}});
