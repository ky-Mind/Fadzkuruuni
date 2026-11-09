/* js/pages/maulid.js - Maulid: daftar dari data/maulid/daftar.js; isi tiap maulid (data/maulid/<id>.js) dimuat saat dibuka.
   Rute: #/maulid, #/maulid/<id> (daftar bagian + unduh), #/maulid/<id>/<bagian> (bacaan). */
const maulidAmbil=async id=>{const d=MAULID_DAFTAR.find(x=>x.id==id);if(!d||!d.berkas)return null;if(!MAULID_ISI[id])await ldjs(d.berkas);return MAULID_ISI[id]||null};
MAULID_DAFTAR.filter(m=>m.berkas).forEach(m=>paket('maulid:'+m.id,{judul:m.judul,kat:'maulid',urls:async()=>[m.berkas],berkas:m.pdf?async()=>[{url:m.pdf,nama:m.judul.replace(/'/g,'')+'.pdf'}]:null}));
const maulidIsi=(m,k)=>{const B=m.bagian,b=B[k];return b.isi.map(x=>`<div class="ay2"><span class="n">${x.no}</span><div class="ar2" style="font-size:${S.fs}px">${esc(x.ar)}</div>${x.lt?`<p class="lt">${esc(x.lt)}</p>`:''}${x.id?`<p class="tr mut">${esc(x.id)}</p>`:''}</div>`).join('')+KOREKSI+pnav(k>0&&(B[k-1].jeda?['#/jeda/'+m.id+'/'+(k-1),'Sholawat']:['#/maulid/'+m.id+'/'+(k-1),B[k-1].judul]),k<B.length-1&&(b.jeda?['#/jeda/'+m.id+'/'+k,'Sholawat sebelum '+B[k+1].judul.replace(/:.*/,'')]:['#/maulid/'+m.id+'/'+(k+1),B[k+1].judul]))};
/* Jeda sholawat (Amaliyah): setelah bagian ber-"jeda", jamaah memilih satu sholawat, membacanya, lalu lanjut ke bagian berikutnya.
   Sementara memakai daftar Sholawat Fadzkuruuni (masih kosong) + Sholawat Umum dari Wirid › Sholawat. JEDA = bagian tujuan selanjutnya.
   Pembuat halaman harus murni (tanpa efek samping): dipakai juga untuk pratinjau geser. */
let JEDA=null;
const jedaSingkat=j=>j.replace(/:.*/,'');
const jedaBar=(J,ganti)=>`<div class="jd-bar${ganti?' dua':''}">${ganti?`<a class="btn s" href="#/jeda/${J.id}/${J.k-1}">${ic('heart',16)}<span>Ganti sholawat</span></a>`:''}<a class="btn jd-go" href="#/maulid/${J.id}/${J.k}"><span>Lanjut ke ${esc(jedaSingkat(J.judul))}</span>${ic('next',18)}</a></div>`;
const jedaIsi=(id,k,m)=>{const J={id,k:k+1,judul:m.bagian[k+1].judul},SU=items('w',1).filter(x=>x.j>=0),FZ=KITAB_MAJELIS('sholawat').concat(SHOLAWAT_FZ()),a=jedaSingkat(m.bagian[k].judul),b=jedaSingkat(J.judul);
 return `<section class="jd-hero"><ol class="jd-step"><li class="ok">${ic('check',14)}${esc(a)}</li><i class="jd-ar">${ic('next',14)}</i><li class="on">${ic('heart',14)}Sholawat</li><i class="jd-ar">${ic('next',14)}</i><li>${esc(b)}</li></ol>
<h2>Waktunya bersholawat</h2><p>Pilih satu sholawat untuk dibaca bersama, lalu lanjut ke <b>${esc(J.judul)}</b>.</p></section>
<div class="jd-sec"><b>Sholawat Fadzkuruuni</b>${FZ.length?'':'<span class="jd-pill">Segera hadir</span>'}</div>${FZ.length?`<div class="jd-grid fz">${FZ.map(x=>`<a class="jd-c" href="${x.rute||'#/kitab/'+x.id}"><span class="si">${ic('heart',16)}</span><span>${esc(x.judul)}</span></a>`).join('')}</div>`:''}
<div class="jd-sec"><b>Sholawat Umum</b></div>
<div class="jd-grid">${SU.map(x=>`<a class="jd-c" href="#/bacaan/w/1/${x.j}"><span class="si">${ic('heart',16)}</span><span>${esc(x.n)}</span></a>`).join('')}</div>
${pnav(['#/maulid/'+id+'/'+k,m.bagian[k].judul],['#/maulid/'+id+'/'+(k+1),J.judul])}${jedaBar(J)}`};
P.jeda=(id,k)=>{k=+k;const m=MAULID_ISI[id],ok=m&&m.bagian[k+1];
 return {html:head('Sholawat','#/maulid/'+id+'/'+k,RS)+`<div id="jd">${ok?jedaIsi(id,k,m):'<p class="mut">Memuat…</p>'}</div>`,
  async init(){let mm=m;if(!ok){try{mm=await maulidAmbil(id)}catch(e){}if(!mm||!mm.bagian[k+1]){location.replace('#/maulid/'+id);return}const el=$('#jd');if(el)el.innerHTML=jedaIsi(id,k,mm)}
   JEDA={id,k:k+1,judul:mm.bagian[k+1].judul}}}};
PRATINJAU.jeda=(id,k)=>{const m=MAULID_ISI[id];if(!m||!m.bagian[+k+1])return null;return head('Sholawat','#/maulid/'+id+'/'+k,RS)+`<div id="jd">${jedaIsi(id,+k,m)}</div>`};
/* Saat membaca sholawat dari halaman jeda: bilah bawah Ganti sholawat | Lanjut ke bagian berikutnya */
{const B=P.bacaan;P.bacaan=(t,i,j)=>{const p=B(t,i,j);if(JEDA&&t=='w'&&+i==1&&p&&p.html)p.html+=jedaBar(JEDA,1);return p}}
/* Sholawat Majelis Fadzkuruuni (data/sholawat/<id>.js, format maulid satu bagian): #/shf/<id> */
P.shf=id=>{const d=MAULID_DAFTAR.find(x=>x.id==id&&x.majelis=='sholawat');if(!d)return P.baca('w',1);const m=MAULID_ISI[id],J=JEDA;
 const isi=mm=>maulidIsi(mm,0)+(J?jedaBar(J,1):'');
 return {html:head(d.judul,J?`#/jeda/${J.id}/${J.k-1}`:'#/baca/w/1',RS)+`<div id="md">${m?isi(m):'<p class="mut">Memuat…</p>'}</div>`,
  async init(){if(m)return;let mm=null;try{mm=await maulidAmbil(id)}catch(e){}const el=$('#md');if(!el)return;el.innerHTML=mm?isi(mm):'<div class="card mut">Sholawat ini belum bisa dimuat. Periksa koneksi lalu coba lagi.</div>'}}};
addEventListener('hashchange',()=>{if(JEDA&&!/^#\/(jeda|shf|bacaan\/w\/1)\//.test(location.hash))JEDA=null});
function maulidBaca(el,m,k){const B=m.bagian,b=B[k];if(!b){el.innerHTML='<div class="card mut">Bagian tidak ditemukan.</div>';return}$('#view h1').textContent=b.judul;
 el.innerHTML=maulidIsi(m,k)}
/* Pratinjau bagian sebelah saat digeser (isi maulid sudah termuat karena bagian ini sedang dibaca) */
PRATINJAU.maulid=(id,k)=>{if(/^\d+$/.test(id||''))id=(MAULID_DAFTAR[+id]||{}).id;const m=MAULID_ISI[id];if(!m||k==null||!m.bagian[+k])return null;
 return head(m.bagian[+k].judul,'#/maulid/'+id,RS)+`<div id="md">${maulidIsi(m,+k)}</div>`};
P.maulid=(id,k)=>{if(/^\d+$/.test(id||''))id=(MAULID_DAFTAR[+id]||{}).id;const d=MAULID_DAFTAR.find(x=>x.id==id);
 if(!d||!d.berkas){return {html:head('Maulid')+pisahBar('maulid',majelisDaftar(KITAB_MAJELIS('maulid'),'Maulid Fadzkuruuni segera hadir.'),list(MAULID_DAFTAR.filter(m=>!m.majelis),(m,j)=>`<a class="row" href="${m.berkas?'#/maulid/'+m.id:'#/segera/'+encodeURIComponent(m.judul)}"><span class="num">${j+1}</span><span class="t">${m.judul}<br><small>${m.berkas?(m.bagian||'')+' bagian'+(dlSudah('maulid:'+m.id)?' · tersimpan offline':''):'Segera hadir'}</small></span>${ic('next',18)}</a>`))}};
 return {html:head(k!=null?'':d.judul,k!=null?'#/maulid/'+id:'#/maulid',k!=null?RS:'')+'<div id="md"><p class="mut">Memuat…</p></div>',
  async init(){const el=$('#md');let m=null;try{m=await maulidAmbil(id)}catch(e){}
   if(!m){el.innerHTML='<div class="card mut">Maulid ini belum bisa dimuat. Periksa koneksi, atau unduh dulu agar bisa dibaca tanpa internet.</div>';return}
   if(k!=null)return maulidBaca(el,m,+k);
   el.innerHTML=`<div class="card dlk"><b>Unduh maulid ini</b><p class="mut" style="margin:4px 0 8px">Simpan agar bisa dibaca tanpa internet, atau simpan PDF-nya ke perangkat untuk dicetak.</p>${dlW('maulid:'+id)}</div>`+list(m.bagian,(b,j)=>`<a class="row" href="#/maulid/${id}/${j}"><span class="num">${j+1}</span><span class="t">${esc(b.judul)}<br><small>${b.isi.length} bait</small></span>${ic('next',18)}</a>`)}}};
