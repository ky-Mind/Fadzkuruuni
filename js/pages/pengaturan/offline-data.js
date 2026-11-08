/* js/pages/pengaturan/offline-data.js - Pengaturan: Offline dan Data.
   Mode offline: satu tombol untuk mengunduh semua konten, lalu per kategori dan per item (js/core/unduh.js). Semua bisa dibatalkan. */
paket('quran',{judul:"Al-Qur'an (114 surah)",kat:'quran',cache:'fz-data',urls:async()=>Array.from({length:114},(_,i)=>qUrl(i+1))});
const OFFKAT=[['quran',"Al-Qur'an",'book'],['kitab','Kitab Kuning','lib'],['maulid','Maulid','moon']];
/* "Unduh semua" tidak termasuk audio (sekitar 1 GB); audio punya bagian sendiri di bawah */
DLG.semua=()=>Object.values(PAKET).filter(p=>p.kat!='audio').map(p=>p.id);DLG.audio=()=>Object.values(PAKET).filter(p=>p.kat=='audio').map(p=>p.id);OFFKAT.forEach(([k])=>DLG[k]=()=>Object.values(PAKET).filter(p=>p.kat==k).map(p=>p.id));
const OFFL=()=>`<h2>Mode offline</h2><div class="card"><p class="mut" style="margin:0 0 10px">Unduh semua isi aplikasi sekaligus (teks Al-Qur'an, kitab, dan maulid) agar bisa dibuka tanpa internet. Bisa dibatalkan kapan saja; jadwal salat selalu tersedia offline.</p>${dlG('semua')}<p class="mut" id="ouk" style="margin:10px 0 0;font-size:12px"></p></div>`
 +OFFKAT.map(([k,t,i])=>{const I=DLG[k]();return I.length?`<h2>${t}</h2><div class="list sg">${I.length>1?`<div class="srw dlr"><span class="si">${ic('down',20)}</span><span class="t">Semua ${t}<br><small class="mut">${I.length} item</small></span>${dlG(k)}</div>`:''}${I.map(id=>`<div class="srw dlr"><span class="si">${ic(i,20)}</span><span class="t">${PAKET[id].judul}</span>${dlW(id)}</div>`).join('')}</div>`:''}).join('')
 +`<h2>Audio Al-Qur'an</h2><div class="list sg"><div class="srw dlr"><span class="si">${ic('play',20)}</span><span class="t">Semua audio (114 surah)<br><small class="mut">Murattal Syaikh Mishary Alafasy, sekitar 1 GB. Tiap surah juga bisa diunduh dari pemutar di halaman surah.</small></span>${dlG('audio')}</div></div><details class="oad"><summary>Pilih per surah</summary><div class="list sg">${DLG.audio().map((id,i)=>`<div class="srw dlr"><span class="num">${i+1}</span><span class="t">${NAMA[i]}<br><small class="mut">${AYAT[i]} ayat</small></span>${dlW(id)}</div>`).join('')}</div></details><h2>AI offline</h2><div class="list sg"><div class="srw dlr"><span class="si">${ic('spark',20)}</span><span class="t">Fadz AI tanpa internet<br><small class="mut">${aiTerpasang()?'Terpasang: '+AIM[aiTerpasang()].nama+' ('+AIM[aiTerpasang()].ukuran+')':'Belum diunduh. Saat offline, Fadz AI mencari di isi aplikasi.'}</small></span><button class="sb" data-aioff>Kelola</button></div></div>`;
/* Tampilkan ruang yang terpakai; tandai Al-Qur'an tersimpan bila sudah diunduh dengan versi lama */
window.dlUkuran=async()=>{const e=$('#ouk');if(!e||!navigator.storage||!navigator.storage.estimate)return;try{const s=await navigator.storage.estimate();e.textContent='Ruang terpakai di perangkat: '+(s.usage/1048576).toFixed(1)+' MB'}catch(x){}};
async function offFill(){try{const n=(await (await caches.open('fz-data')).keys()).filter(r=>/surah\//.test(r.url)).length;if(n>=114&&!dlSudah('quran')){dlTandai('quran',1);dlSegar('quran')}}catch(e){}dlUkuran()}

SETPAGES.offline=()=>({html:head('Offline & Data','#/pengaturan')+OFFL()+`<h2>Data</h2><div class="list sg">${lk('#/bookmark','star','Daftar penanda ayat')}${row('clock','Riwayat bacaan Al-Qur\'an',`<span id="hxk">${(S.hist||[]).length?(S.hist||[]).length+' surah di tab Riwayat, beserta posisi terakhir dibaca. Penanda ayat tidak ikut terhapus.':'Riwayat kosong.'}</span>`,`<button class="sb dng" id="hx" ${(S.hist||[]).length?'':'disabled'}>${ic('trash',14)} Hapus</button>`)}</div>`,init(){offFill();
 /* Hapus riwayat: mengosongkan tab Riwayat di Al-Qur'an dan posisi terakhir dibaca tiap surah; penanda ayat (bintang) & tanda "terakhir dibaca" tetap */
 $('#hx').onclick=()=>konfirmasi('Hapus riwayat bacaan?','Daftar surah di tab Riwayat Al-Qur\'an dan posisi terakhir dibaca tiap surah akan dikosongkan. Penanda ayat tidak ikut terhapus.','Hapus',()=>{S.hist=[];S.qpos={};save();toast('Riwayat bacaan dihapus');$('#hxk')&&($('#hxk').textContent='Riwayat kosong.');$('#hx')&&($('#hx').disabled=true)})}});

/* ===== Tawaran mode offline: langkah terakhir setelah izin awal (dan setelah pembaruan bila ada isi baru) =====
   Diizinkan: semua isi (Al-Qur'an, kitab kuning, maulid) diunduh di latar; isi baru setelah pembaruan ikut diunduh otomatis.
   "Nanti saja": ditanyakan lagi hanya bila ada isi baru yang belum pernah ditawarkan. */
function offTawar(){if(TPRATINJAU||typeof DLG=='undefined'||!DLG.semua)return;const I=DLG.semua(),sisa=I.filter(i=>!dlSudah(i));if(!sisa.length)return;
 if(S.offOn){dlSemua(sisa);return}
 const lihat=S.offLihat||[];if(!sisa.some(i=>!lihat.includes(i)))return;
 /* Hanya ditawarkan di Beranda, agar tidak muncul tiba-tiba di tengah halaman lain */
 if($('.back-d')||!navigator.onLine||!['','#','#/'].includes(location.hash))return setTimeout(offTawar,5000);
 const e=document.createElement('div');e.className='back-d';
 e.innerHTML=`<div class="sheet offt" role="dialog"><div class="offt-i">${ic('down',28)}</div><b style="font-size:18px">Izinkan mode offline?</b>
  <p class="mut" style="margin:8px 0 12px">Unduh semua isi aplikasi (Al-Qur'an, kitab kuning, dan maulid) supaya tetap bisa dibaca tanpa internet. Unduhan berjalan di latar dan bisa dibatalkan kapan saja di Pengaturan › Offline & Data.</p>
  <button class="btn" style="width:100%" data-ofy>${ic('down',16)} Izinkan &amp; unduh semua</button><button class="btn s" style="width:100%;margin-top:8px;background:transparent;color:var(--mut)" data-ofn>Nanti saja</button></div>`;
 document.body.append(e);const tutup=()=>{S.offLihat=I;save();e.remove()};
 e.onclick=x=>{if(x.target==e||x.target.closest('[data-ofn]'))return tutup();if(x.target.closest('[data-ofy]')){S.offOn=1;tutup();dlSemua(sisa);toast('Mengunduh '+sisa.length+' paket untuk mode offline')}}}
/* ===== "Yang baru": isi & tampilan (web) diperbarui otomatis; sekali tiap versi baru ditampilkan ringkasan perubahannya =====
   Daftar ringkas per versi ada di YANG_BARU (data/yang-baru.js). Pemasangan pertama tidak ditampilkan. */
function yangBaruCek(){if(TPRATINJAU)return;/* Pengguna lama yang belum pernah melihat "Yang baru" (sudah ada riwayat pemakaian) dianggap memperbarui dari 2.9.0 */const lama=S.verLihat||(S.upCek||S.dibuka||S.loc?'2.9.0':null);if(lama==VER)return;S.verLihat=VER;save();if(!lama||typeof YANG_BARU=='undefined')return;
 const L=Object.keys(YANG_BARU).filter(v=>verLebihBaru(v,lama)&&!verLebihBaru(v,VER)).sort((a,b)=>verLebihBaru(a,b)?-1:1),isi=L.flatMap(v=>YANG_BARU[v]).slice(0,8);if(!isi.length)return;
 const e=document.createElement('div');e.className='back-d';e.innerHTML=`<div class="sheet upd" role="dialog"><div class="offt-i">${ic('rot',28)}</div><b style="font-size:18px">Fadzkuruuni diperbarui</b><p class="mut" style="margin:4px 0 10px">Versi ${esc(VER)} · sudah terpasang otomatis</p><ul class="upd-l">${isi.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><button class="btn" style="width:100%;margin-top:12px" data-ybo>Oke</button></div>`;
 document.body.append(e);e.onclick=x=>{if(x.target==e||x.target.closest('[data-ybo]'))e.remove()}}
/* Dipanggil aplikasi Android setelah dialog izin awal selesai; aplikasi lama / web: ditawarkan beberapa detik setelah dibuka */
window.fadzIzinSelesai=()=>setTimeout(()=>{pembaruanCek().finally(()=>{yangBaruCek();setTimeout(offTawar,600)})},700);
{const awalAndroid=window.ANDROID&&window.FadzAndroid.izinAwalSudah&&!FadzAndroid.izinAwalSudah();
 if(!awalAndroid)setTimeout(()=>{pembaruanCek().finally(()=>{yangBaruCek();setTimeout(offTawar,800)})},4000)}

/* ===== Pemberitahuan pembaruan aplikasi Android: rilis terbaru di GitHub dibandingkan dengan versi terpasang =====
   Dicek paling sering tiap 6 jam (atau saat diminta dari Pengaturan › Tentang & Bantuan). */
const verLebihBaru=(a,b)=>{const x=String(a).split('.').map(Number),y=String(b).split('.').map(Number);for(let i=0;i<Math.max(x.length,y.length);i++){const d=(x[i]||0)-(y[i]||0);if(d)return d>0}return false};
/* Baris versi di Tentang & Bantuan diperbarui setelah pemeriksaan (menampilkan tombol Perbarui bila ada versi baru) */
const upSegar=()=>{if(location.hash=='#/pengaturan/tentang')route()};
/* Isi & tampilan (web): ambil versi terbaru sekarang (biasanya sudah otomatis); halaman dimuat ulang bila ada yang baru */
document.addEventListener('click',async e=>{if(!e.target.closest('[data-upweb]'))return;if(!navigator.onLine)return toast('Butuh internet');toast('Memeriksa isi terbaru…');
 try{const r=await fetch('js/core/state.js?c='+Date.now(),{cache:'no-store'}),t=await r.text(),v=(t.match(/VER='([\d.]+)'/)||[])[1];
  if(v&&v!==VER){const g='serviceWorker'in navigator&&await navigator.serviceWorker.getRegistration();if(g)await g.update().catch(()=>{});toast('Memuat versi '+v+'…');setTimeout(()=>location.reload(),900)}else toast('Isi & tampilan sudah versi terbaru ('+VER+')')}catch(x){toast('Gagal memeriksa, coba lagi')}});
async function pembaruanCek(paksa){if(!window.ANDROID||!window.FadzAndroid.versi||TPRATINJAU)return paksa&&toast('Pemeriksaan pembaruan hanya untuk aplikasi Android');
 if(pembaruanCek.buka)return;
 /* Tiap aplikasi dibuka: rilis terbaru diambil dari GitHub paling sering 30 menit sekali (tersimpan), lembar pembaruan tampil bila ada versi lebih baru */
 let j=null;if(paksa||Date.now()-(S.upCek||0)>=18e5){if(!navigator.onLine)return paksa&&toast('Butuh internet untuk memeriksa pembaruan');
  /* Sumber utama: apk.json di situs ini (diperbarui tiap rilis, tanpa batas 60 permintaan/jam seperti API GitHub); cadangan: API GitHub */
  try{let r=await fetch('apk.json?c='+Date.now(),{cache:'no-store'}).catch(()=>null);if(!r||!r.ok)r=await fetch('https://api.github.com/repos/ky-Mind/Fadzkuruuni/releases/latest',{cache:'no-store'});if(!r.ok)throw 0;j=await r.json();if(!j.tag_name)throw 0;S.upRil={tag:j.tag_name,body:j.body,assets:(j.assets||[]).map(a=>({name:a.name,browser_download_url:a.browser_download_url})),html_url:j.html_url}}catch(e){return paksa&&toast('Gagal memeriksa pembaruan, coba lagi')}
  S.upCek=Date.now();save()}else j=S.upRil&&{tag_name:S.upRil.tag,body:S.upRil.body,assets:S.upRil.assets,html_url:S.upRil.html_url};if(!j)return;const baru=String(j.tag_name||'').replace(/^v/,''),kini=FadzAndroid.versi();
 if(!baru||!verLebihBaru(baru,kini)){S.upInfo=null;save();upSegar();return paksa&&toast('Aplikasi Android sudah versi terbaru ('+kini+')')}
 if(!paksa&&(S.upTunda||0)>Date.now())return;
 const apk=((j.assets||[]).find(a=>/\.apk$/i.test(a.name))||{}).browser_download_url||j.html_url;S.upInfo={v:baru,url:apk};save();upSegar();
 const cat=String(j.body||'').split('\n').map(x=>x.replace(/^[-*]\s*/,'').trim()).filter(Boolean).slice(0,8);
 pembaruanCek.buka=1;return new Promise(res=>{const e=document.createElement('div');e.className='back-d';
  e.innerHTML=`<div class="sheet upd" role="dialog"><div class="offt-i">${ic('rot',28)}</div><b style="font-size:18px">Pembaruan tersedia</b><p class="mut" style="margin:4px 0 10px">Versi ${esc(baru)} · terpasang ${esc(kini)}</p>
   ${cat.length?`<ul class="upd-l">${cat.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
   <p class="mut" style="font-size:12.5px;margin:10px 0 12px">Ketuk Unduh pembaruan, lalu buka berkas <b>fadzkuruuni.apk</b> yang terunduh dan pilih <b>Perbarui</b>. Data dan pengaturanmu tetap aman.</p>
   <a class="btn" style="width:100%;display:flex;justify-content:center;gap:6px" href="${apk}" target="_blank" rel="noopener" data-upy>${ic('down',16)} Unduh pembaruan</a><button class="btn s" style="width:100%;margin-top:8px;background:transparent;color:var(--mut)" data-upn>Nanti saja</button></div>`;
  /* Nanti saja = ditanyakan lagi 12 jam kemudian (versi baru tetap ditawarkan, tidak dilewati selamanya) */
  document.body.append(e);e.onclick=x=>{if(x.target==e||x.target.closest('[data-upn]')){S.upTunda=Date.now()+432e5;save();e.remove();pembaruanCek.buka=0;res()}else if(x.target.closest('[data-upy]')){setTimeout(()=>{e.remove();pembaruanCek.buka=0;res()},300)}}})}
/* Kembali ke aplikasi (dari latar belakang): periksa lagi */
document.addEventListener('visibilitychange',()=>{if(document.visibilityState=='visible'&&window.ANDROID)setTimeout(()=>pembaruanCek().catch(()=>{}),1500)});
