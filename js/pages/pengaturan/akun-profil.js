/* js/pages/pengaturan/akun-profil.js - Pengaturan: Akun dan Profil */
/* Logo resmi penyedia login (warna merek) */
const LG_G='<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
const LG_F='<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M13.4 19.5v-6.2h2.1l.3-2.4h-2.4V9.3c0-.7.2-1.2 1.2-1.2h1.3V6c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.8H8.7v2.4h2.1v6.2z"/></svg>';
const LG_E=`<span class="lge">${ic('mail',16)}</span>`;
/* Masuk dengan Facebook: selama aplikasi Facebook belum diterbitkan (menunggu verifikasi bisnis Meta) hanya akun admin/penguji yang bisa masuk;
   pengguna lain mendapat pesan yang jelas (lihat FBGAGAL di js/core/android.js dan events.js) */
const FBMASUK=false;
const AKUN=()=>`<h2>Akun</h2><div class="list sg" id="cl">${cloudOn()?(FBU?row('user',esc(FBU.displayName||S.nm||FBU.email||'Akun'),esc(FBU.email||'')+' · '+({'google.com':'Google','facebook.com':'Facebook','password':'Email','emailLink':'Email'}[FBU.providerData?.[0]?.providerId]||'Akun')+' · data tersinkron ke cloud','<button class="btn s" data-gout>Keluar</button>')+(typeof TADM!='undefined'&&TADM?row('sliders','Mode admin','Atur susunan Beranda, pintasan, Semua Menu, dan Pengaturan langsung di aplikasi',`<button class="btn s" data-tadm="mulai">${TADMON?'Aktif':'Mulai'}</button>`):''):`<p class="lgi mut">Masuk agar penanda ayat, riwayat bacaan, dan pengaturanmu tersimpan di cloud dan ikut pindah ke perangkat lain.</p><div class="lgn"><button class="lgb" data-gin>${LG_G}Masuk dengan Google</button>${FBMASUK?`<button class="lgb" data-gin="fb">${LG_F}Masuk dengan Facebook</button>`:''}<button class="lgb" data-gem>${LG_E}Masuk dengan Email</button></div>`):row('user','Masuk dengan Google','Belum diaktifkan. Isi konfigurasi Firebase (lihat PANDUAN-FIREBASE.md).','<button class="btn s" disabled>Segera</button>')}</div>`;
/* Foto profil: dipotong persegi & dikecilkan (192 px JPEG) di perangkat, disimpan di pengaturan & ikut sinkron cloud */
window.fotoProfil=()=>S.foto||(typeof FBU!='undefined'&&FBU&&FBU.photoURL)||'';
window.avatarHtml=px=>{const h=((S.nm||(FBU&&FBU.displayName)||'').trim()[0]||'').toUpperCase(),f=fotoProfil();return f?`<img class="ava" src="${esc(f)}" referrerpolicy="no-referrer" alt="Foto profil" style="width:${px}px;height:${px}px">`:`<span class="ava avi" style="width:${px}px;height:${px}px;font-size:${Math.round(px*.42)}px">${h?esc(h):ic('user',Math.round(px*.5))}</span>`};
const fotoKecil=f=>new Promise((ok,no)=>{const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{const s=Math.min(im.width,im.height),c=document.createElement('canvas');c.width=c.height=192;c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,192,192);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.82))};im.onerror=()=>{URL.revokeObjectURL(u);no()};im.src=u});
let FOTOCALON=null;
document.addEventListener('change',async x=>{if(x.target.id!='fpi'||!x.target.files[0])return;try{FOTOCALON=await fotoKecil(x.target.files[0]);route()}catch(e){toast('Foto tidak bisa dibaca. Coba foto lain.')}});
document.addEventListener('click',x=>{if(x.target.closest('[data-fsimpan]')&&FOTOCALON){S.foto=FOTOCALON;FOTOCALON=null;save();tataNav();route();toast('Foto profil disimpan')}else if(x.target.closest('[data-fbatal]')){FOTOCALON=null;route()}});
document.addEventListener('click',x=>{if(!x.target.closest('[data-fdel]'))return;S.foto=null;save();tataNav();route();toast('Foto profil dihapus')});
const FOTOBOX=()=>{const c=FOTOCALON;return `<h2>Foto profil</h2><div class="card"><div class="fpb">${c?`<img class="ava" src="${c}" alt="Pratinjau foto profil" style="width:76px;height:76px">`:avatarHtml(76)}<div class="fpt">${c?'<b>Pratinjau foto baru</b><small class="mut">Tekan Simpan foto agar dipakai di profil.</small>':`<small class="mut">${S.foto?'Foto ini tampil di Pengaturan dan menu bawah.':'Belum ada foto. Pilih foto dari galeri HP.'}</small>`}</div></div>
 <div class="act">${c?'<button class="sb pri" data-fsimpan>Simpan foto</button><button class="sb" data-fbatal>Batal</button>':`<label class="sb pri">${ic('camera',16)} ${S.foto?'Ganti foto':'Pilih foto'}<input type="file" accept="image/*" id="fpi" hidden></label>${S.foto?'<button class="sb" data-fdel>Hapus foto</button>':''}`}</div></div>`};
const NAMEBOX=()=>FOTOBOX()+`<h2>Nama</h2><div class="card"><label>Nama panggilan</label><input class="in" id="nm" maxlength="24" value="${esc(S.nm||'')}" placeholder="Dipakai pada sapaan di Beranda"><div class="act"><button class="sb pri" data-nsave>Simpan nama</button><button class="sb" data-ndel>Hapus nama</button></div></div>`;
/* Hapus akun & data cloud (wajib untuk kebijakan Facebook/Google; petunjuk publik di hapus-data.html) */
const HAPUSAKUN=()=>cloudOn()&&FBU?`<h2>Hapus akun</h2><div class="card"><p class="mut" style="margin:0 0 10px">Menghapus akunmu di Fadzkuruuni beserta data cloud (pengaturan, penanda ayat, riwayat baca). Data di perangkat ini tetap ada. <a href="kebijakan-privasi.html" target="_blank" rel="noopener">Kebijakan Privasi</a></p><button class="btn s" data-hapusakun style="color:#b3261e">Hapus akun &amp; data</button></div>`:`<p class="mut" style="font-size:12.5px;margin:16px 2px 0"><a href="kebijakan-privasi.html" target="_blank" rel="noopener">Kebijakan Privasi</a> · <a href="hapus-data.html" target="_blank" rel="noopener">Penghapusan Data</a></p>`;
SETPAGES.akun=()=>({html:head('Akun & Profil','#/pengaturan')+NAMEBOX()+AKUN()+HAPUSAKUN()});
document.addEventListener('click',x=>{if(!x.target.closest('[data-hapusakun]')||!FBU)return;
 konfirmasi('Hapus akun & data?','Akun dan semua data cloud-mu akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.','Hapus permanen',async()=>{const u=firebase.auth().currentUser;if(!u)return;
  try{await FBD.collection('users').doc(u.uid).delete().catch(()=>{});await u.delete();FBU=null;toast('Akun dan data cloud sudah dihapus');route()}
  catch(e){toast(e.code=='auth/requires-recent-login'?'Demi keamanan, keluar lalu masuk lagi, kemudian ulangi Hapus akun':'Gagal menghapus: '+(e.code||e.message))}})});

/* Masuk dengan email: kata sandi (masuk / daftar / lupa sandi) atau tautan masuk tanpa sandi yang dikirim ke email */
const EMSG={'auth/invalid-email':'Format email tidak valid','auth/missing-password':'Isi kata sandi','auth/weak-password':'Kata sandi minimal 6 karakter','auth/email-already-in-use':'Email ini sudah terdaftar. Pilih Masuk.','auth/invalid-credential':'Email atau kata sandi salah','auth/wrong-password':'Email atau kata sandi salah','auth/user-not-found':'Akun dengan email ini belum ada. Pilih Daftar.','auth/too-many-requests':'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.','auth/network-request-failed':'Tidak ada internet','auth/operation-not-allowed':'Masuk dengan email belum diaktifkan oleh pengelola aplikasi','auth/unauthorized-continue-uri':'Domain ini belum diizinkan di Firebase (Authorized domains)'};
const emErr=e=>EMSG[e&&e.code]||'Gagal: '+((e&&e.code)||'coba lagi');
async function emailSheet(){if(!navigator.onLine)return toast('Butuh internet untuk masuk');await fbInit();if(!window.firebase||!firebase.auth)return toast('Layanan akun belum siap. Coba lagi.');
 const A=firebase.auth();let mode='masuk';const e=document.createElement('div');e.className='back-d tgh';document.body.append(e);
 const gambar=()=>{const d=mode=='daftar',l=mode=='lupa';e.innerHTML=`<div class="sheet ems" role="dialog" aria-label="Masuk dengan email"><b>${l?'Atur ulang kata sandi':d?'Daftar dengan email':'Masuk dengan email'}</b>
  ${l?'':`<div class="seg" id="emm"><button type="button" data-v="masuk" class="${d?'':'on'}">Masuk</button><button type="button" data-v="daftar" class="${d?'on':''}">Daftar</button></div>`}
  ${d?'<input class="in" id="emn" maxlength="40" placeholder="Nama" autocomplete="name">':''}
  <input class="in" id="eme" type="email" inputmode="email" autocomplete="email" placeholder="Alamat email" value="${esc(e.em||'')}">
  ${l?'<p class="mut">Kami kirim tautan untuk membuat kata sandi baru ke email ini.</p>':`<div class="emp"><input class="in" id="emp" type="password" autocomplete="${d?'new-password':'current-password'}" placeholder="${d?'Buat kata sandi (min. 6 karakter)':'Kata sandi'}"><button type="button" class="ib2" data-emv aria-label="Tampilkan kata sandi">${ic('eye',18)}</button></div>`}
  <button class="btn" id="emk" style="width:100%">${l?'Kirim tautan':d?'Daftar':'Masuk'}</button>
  <div class="eml">${l?'<button type="button" data-emgo="masuk">Kembali ke masuk</button>':`${d?'':'<button type="button" data-emgo="lupa">Lupa kata sandi?</button>'}<button type="button" data-emlink>Kirim tautan masuk tanpa kata sandi</button>`}</div>
  <button class="btn s" data-x style="width:100%;margin-top:6px">Batal</button></div>`;
  segBind('emm',v=>{e.em=$('#eme',e).value;mode=v;gambar()});$('#eme',e).focus()};
 gambar();
 const nilai=()=>{const em=$('#eme',e).value.trim();e.em=em;if(!/^\S+@\S+\.\S+$/.test(em)){toast('Isi alamat email yang benar');return null}return em};
 const sibuk=(on,t)=>{const b=$('#emk',e);if(b){b.disabled=on;if(t)b.textContent=t}};
 e.onclick=async x=>{const t=x.target;if(t==e||t.closest('[data-x]'))return e.remove();
  if(t.closest('[data-emv]')){const p=$('#emp',e);p.type=p.type=='password'?'text':'password';return}
  const g=t.closest('[data-emgo]');if(g){e.em=$('#eme',e).value;mode=g.dataset.emgo;return gambar()}
  if(t.closest('[data-emlink]')){const em=nilai();if(!em)return;try{await A.sendSignInLinkToEmail(em,{url:location.origin+location.pathname+'#/pengaturan/akun',handleCodeInApp:true});localStorage.fzem=em;e.remove();dlg('Cek email kamu','Tautan masuk sudah dikirim ke '+em+'. Buka email itu di perangkat ini, lalu ketuk tautannya untuk masuk.')}catch(err){toast(emErr(err))}return}
  if(!t.closest('#emk'))return;const em=nilai();if(!em)return;
  if(mode=='lupa'){sibuk(true,'Mengirim…');try{await A.sendPasswordResetEmail(em);e.remove();dlg('Cek email kamu','Tautan untuk membuat kata sandi baru sudah dikirim ke '+em+'.')}catch(err){toast(emErr(err));sibuk(false,'Kirim tautan')}return}
  const pw=$('#emp',e).value;if(pw.length<6)return toast('Kata sandi minimal 6 karakter');
  sibuk(true,mode=='daftar'?'Mendaftar…':'Masuk…');
  try{if(mode=='daftar'){const r=await A.createUserWithEmailAndPassword(em,pw),nm=($('#emn',e)?.value||'').trim();if(nm){await r.user.updateProfile({displayName:nm});if(!S.nm){S.nm=nm.split(' ')[0];save()}}try{await r.user.sendEmailVerification()}catch(z){}}
   else await A.signInWithEmailAndPassword(em,pw);
   e.remove();toast(mode=='daftar'?'Akun dibuat. Selamat datang!':'Berhasil masuk');route()}
  catch(err){toast(emErr(err));sibuk(false,mode=='daftar'?'Daftar':'Masuk')}};
 e.onkeydown=k=>{if(k.key=='Enter'&&k.target.matches('input'))$('#emk',e)?.click()}}
document.addEventListener('click',x=>{if(x.target.closest('[data-gem]'))emailSheet()});
/* Kembali dari tautan masuk di email: selesaikan proses masuk */
(async()=>{if(!/[?&]oobCode=/.test(location.href)||!/mode=signIn/.test(location.href))return;await fbInit();if(!window.firebase||!firebase.auth)return;const A=firebase.auth();if(!A.isSignInWithEmailLink(location.href))return;
 let em=localStorage.fzem;if(!em)em=prompt('Masukkan email yang kamu pakai untuk masuk');if(!em)return;
 try{await A.signInWithEmailLink(em,location.href);delete localStorage.fzem;history.replaceState(null,'',location.pathname+'#/pengaturan/akun');toast('Berhasil masuk');route()}catch(err){toast(emErr(err))}})();
