/* js/core/events.js - Pendengar peristiwa bersama (klik, input, geser) */
let tx=0,ty=0;
addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)<70||Math.abs(dy)>50||e.target.closest('input,.cal,.car'))return;const T=$$('[data-tab]'),h=location.hash.split('/');
 if(T.length>1){const i=T.findIndex(b=>b.classList.contains('on'));T[i+(dx<0?1:-1)]?.click()}else if(h[1]=='quran'&&h[2]){const n=+h[2]+(dx<0?1:-1);if(n>=1&&n<=114)location.hash='#/quran/'+n}},{passive:true});
document.addEventListener('click',e=>{const c=e.target.closest('[data-copy]');if(c){const v=c.dataset.copy;(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast(v.length>30?'Teks disalin':'Disalin: '+v),()=>toast('Tidak bisa menyalin. Salin manual.'));return}
 const b=e.target.closest('[data-bm]');if(b){const k=b.dataset.bm;S.bm=S.bm||[];const i=S.bm.indexOf(k);i<0?S.bm.unshift(k):S.bm.splice(i,1);save();b.classList.toggle('on',i<0);toast(i<0?'Ayat ditandai':'Penanda dihapus')}});
document.addEventListener('input',e=>{const c=e.target.closest('[data-calc]');if(!c)return;const g=k=>parseFloat((c.querySelector(`[data-k=${k}]`)?.value||'').replace(',','.'))||0,o=c.querySelector('.cres'),t=c.dataset.calc;if(!g('h'))return o.textContent='Isi harga per kg terlebih dahulu.';const kg=t=='fitrah'?g('j')*2.5:g('j')*g('d')*.6;o.innerHTML=`<b>${rp(kg*g('h'))}</b><br><small class="mut">${kg.toFixed(2).replace('.',',')} kg makanan pokok</small>`});
document.addEventListener('click',e=>{const t=e.target;
 if(t.closest('[data-loc]'))return lsheet();
 const z=t.closest('[data-z]');if(z){S.fs=Math.max(22,Math.min(56,S.fs+ +z.dataset.z));save();$$('#view .ay .ar,#view .ay2 .ar,#view .ar2,#view .mushaf').forEach(x=>x.style.fontSize=S.fs+'px');$$('.zb b').forEach(b=>b.textContent=S.fs);return}
 if(t.closest('[data-nb]')){S.nb=1;save();t.closest('.note').remove();return}
 const l=t.closest('[data-lanjut]');if(l){const c=l.closest('[data-pay]'),r=c.querySelector('input[name=pm]:checked'),b=BANK[r?+r.value:0],nom=(c.querySelector('[data-nom]').value||'').replace(/\D/g,'');(navigator.clipboard?navigator.clipboard.writeText(b[1]):Promise.reject()).catch(()=>{});msheet('Pembayaran langsung segera hadir',`<p>Fitur lanjut pembayaran langsung ke aplikasi ${b[0]} masih dalam tahap pengembangan.</p><p>Nomor tujuan <b>${b[1]}</b> (${b[0]}) ${nom?'dengan nominal <b>'+rp(nom)+'</b> ':''}sudah disalin. Silakan buka aplikasi ${b[0]} atau bank pilihanmu, lalu tempel nomor tersebut.</p>`)}});
document.addEventListener('click',async e=>{const t=e.target;
 if(t.closest('[data-rs]'))return qsheet(()=>route());
 if(t.closest('[data-stop]'))return stopAdzan();
 if(t.closest('[data-tsub]'))return play(0);
 if(t.closest('[data-notif]')){await askNotif();return permFill()}
 if(t.closest('[data-gin]')){if(!window.firebase||!firebase.auth)return toast('Butuh internet untuk masuk dengan Google');const pr=new firebase.auth.GoogleAuthProvider();return firebase.auth().signInWithPopup(pr).catch(err=>{const c=err.code||'';if(c=='auth/popup-blocked'||c=='auth/operation-not-supported-in-this-environment')return firebase.auth().signInWithRedirect(pr);toast(c=='auth/unauthorized-domain'?'Domain ini belum diizinkan di Firebase (Authentication > Settings > Authorized domains)':c=='auth/popup-closed-by-user'?'Masuk dibatalkan':'Gagal masuk: '+c)})}
 if(t.closest('[data-gout]'))return firebase.auth().signOut().then(()=>{FBU=null;route()});
 if(t.closest('[data-nsave]')){S.nm=($('#nm').value||'').trim().slice(0,24);save();return toast(S.nm?'Nama disimpan':'Nama dikosongkan')}
 if(t.closest('[data-ndel]')){S.nm='';save();$('#nm').value='';return toast('Nama dihapus')}
 if(t.closest('[data-addq]')){const v=($('#qn').value||'').trim();if(!v)return toast('Tulis kata-katanya dulu');QA().push({t:v,p:'any'});save();return route()}
 const qe=t.closest('[data-qe]');if(qe){QEDIT=+qe.dataset.qe;return route()}
 if(t.closest('[data-qc]')){QEDIT=-1;return route()}
 const qs=t.closest('[data-qs]');if(qs){const v=($('#qv').value||'').trim();if(!v)return toast('Teks tidak boleh kosong');QA()[+qs.dataset.qs].t=v;QEDIT=-1;save();return route()}
 const qd=t.closest('[data-qd]');if(qd){QA().splice(+qd.dataset.qd,1);save();return route()}
 if(t.closest('[data-qr]')){S.qa=null;QA();save();return route()}});
