/* js/pages/maulid.js - Maulid: daftar dari data/maulid/daftar.js; isi tiap maulid (data/maulid/<id>.js) dimuat saat dibuka.
   Rute: #/maulid, #/maulid/<id> (daftar bagian + unduh), #/maulid/<id>/<bagian> (bacaan). */
const maulidAmbil=async id=>{const d=MAULID_DAFTAR.find(x=>x.id==id);if(!d||!d.berkas)return null;if(!MAULID_ISI[id])await ldjs(d.berkas);return MAULID_ISI[id]||null};
MAULID_DAFTAR.filter(m=>m.berkas).forEach(m=>paket('maulid:'+m.id,{judul:m.judul,kat:'maulid',urls:async()=>[m.berkas],berkas:m.pdf?async()=>[{url:m.pdf,nama:m.judul.replace(/'/g,'')+'.pdf'}]:null}));
const maulidIsi=(m,k)=>{const B=m.bagian,b=B[k];return b.isi.map(x=>`<div class="ay2"><span class="n">${x.no}</span><div class="ar2" style="font-size:${S.fs}px">${esc(x.ar)}</div>${x.lt?`<p class="lt">${esc(x.lt)}</p>`:''}${x.id?`<p class="tr mut">${esc(x.id)}</p>`:''}</div>`).join('')+KOREKSI+pnav(k>0&&(B[k-1].jeda?['#/jeda/'+m.id+'/'+(k-1),'Sholawat']:['#/maulid/'+m.id+'/'+(k-1),B[k-1].judul]),k<B.length-1&&(b.jeda?['#/jeda/'+m.id+'/'+k,'Sholawat sebelum '+B[k+1].judul.replace(/:.*/,'')]:['#/maulid/'+m.id+'/'+(k+1),B[k+1].judul]))};
/* Jeda sholawat (Amaliyah): setelah bagian ber-"jeda", jamaah memilih satu sholawat, membacanya, lalu lanjut ke bagian berikutnya.
   Sementara memakai daftar Sholawat Fadzkuruuni (masih kosong) + Sholawat Umum dari Wirid › Sholawat. JEDA = bagian tujuan selanjutnya. */
let JEDA=null;
const jedaLanjut=(J=JEDA)=>J?`<a class="btn jlanjut" href="#/maulid/${J.id}/${J.k}">${ic('next',18)} Lanjut ke ${esc(J.judul)}</a>`:'';
P.jeda=(id,k)=>{k=+k;const d=MAULID_DAFTAR.find(x=>x.id==id),m=MAULID_ISI[id];
 if(!d||!m||!m.bagian[k+1]){setTimeout(()=>{location.hash='#/maulid/'+id},0);return {html:head('Sholawat','#/maulid/'+id)}}
 /* JEDA baru diisi di init: halaman ini juga dibuat untuk pratinjau geser tanpa benar-benar dibuka */
 const J={id,k:k+1,judul:m.bagian[k+1].judul},SU=items('w',1).filter(x=>x.j>=0);
 return {html:head('Sholawat','#/maulid/'+id+'/'+k,RS)+`<div class="card jeda"><b>Selesai ${esc(m.bagian[k].judul.replace(/:.*/,''))}</b><p class="mut" style="margin:4px 0 10px">Pilih sholawat yang dibaca bersama, lalu lanjut ke ${esc(J.judul)}.</p>${jedaLanjut(J)}</div>
<h2>Sholawat Fadzkuruuni</h2>${majelisDaftar(KITAB_MAJELIS('sholawat'),'Sholawat Fadzkuruuni segera hadir. Sementara, pilih dari Sholawat Umum di bawah.')}
<h2>Sholawat Umum <small class="mut">(sementara)</small></h2>${list(SU,(x,i)=>`<a class="row" href="#/bacaan/w/1/${x.j}"><span class="num">${i+1}</span><span class="t">${esc(x.n)}</span>${ic('next',18)}</a>`)}`,init(){JEDA=J}}};
/* Saat membaca sholawat dari halaman jeda: tombol lanjut ke bagian maulid berikutnya */
{const B=P.bacaan;P.bacaan=(t,i,j)=>{const p=B(t,i,j);if(JEDA&&t=='w'&&+i==1&&p&&p.html)p.html=p.html.replace(KOREKSI,`<div class="card jeda">${jedaLanjut()}<a class="btn s jpilih" href="#/jeda/${JEDA.id}/${JEDA.k-1}">Pilih sholawat lain</a></div>`+KOREKSI);return p}}
/* Jeda selesai setelah masuk bagian tujuan atau keluar dari Maulid */
addEventListener('hashchange',()=>{if(JEDA&&!/^#\/(jeda|bacaan\/w\/1)\//.test(location.hash))JEDA=null});
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
