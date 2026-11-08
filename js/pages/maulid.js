/* js/pages/maulid.js - Maulid: daftar dari data/maulid/daftar.js; isi tiap maulid (data/maulid/<id>.js) dimuat saat dibuka.
   Rute: #/maulid, #/maulid/<id> (daftar bagian + unduh), #/maulid/<id>/<bagian> (bacaan). */
const maulidAmbil=async id=>{const d=MAULID_DAFTAR.find(x=>x.id==id);if(!d||!d.berkas)return null;if(!MAULID_ISI[id])await ldjs(d.berkas);return MAULID_ISI[id]||null};
MAULID_DAFTAR.filter(m=>m.berkas).forEach(m=>paket('maulid:'+m.id,{judul:m.judul,kat:'maulid',urls:async()=>[m.berkas],berkas:m.pdf?async()=>[{url:m.pdf,nama:m.judul.replace(/'/g,'')+'.pdf'}]:null}));
const maulidIsi=(m,k)=>{const B=m.bagian,b=B[k];return b.isi.map(x=>`<div class="ay2"><span class="n">${x.no}</span><div class="ar2" style="font-size:${S.fs}px">${esc(x.ar)}</div>${x.lt?`<p class="lt">${esc(x.lt)}</p>`:''}${x.id?`<p class="tr mut">${esc(x.id)}</p>`:''}</div>`).join('')+KOREKSI+pnav(k>0&&['#/maulid/'+m.id+'/'+(k-1),B[k-1].judul],k<B.length-1&&['#/maulid/'+m.id+'/'+(k+1),B[k+1].judul])};
function maulidBaca(el,m,k){const B=m.bagian,b=B[k];if(!b){el.innerHTML='<div class="card mut">Bagian tidak ditemukan.</div>';return}$('#view h1').textContent=b.judul;
 el.innerHTML=maulidIsi(m,k)}
/* Pratinjau bagian sebelah saat digeser (isi maulid sudah termuat karena bagian ini sedang dibaca) */
PRATINJAU.maulid=(id,k)=>{if(/^\d+$/.test(id||''))id=(MAULID_DAFTAR[+id]||{}).id;const m=MAULID_ISI[id];if(!m||k==null||!m.bagian[+k])return null;
 return head(m.bagian[+k].judul,'#/maulid/'+id,RS)+`<div id="md">${maulidIsi(m,+k)}</div>`};
P.maulid=(id,k)=>{if(/^\d+$/.test(id||''))id=(MAULID_DAFTAR[+id]||{}).id;const d=MAULID_DAFTAR.find(x=>x.id==id);
 if(!d||!d.berkas){return {html:head('Maulid')+pisahBar('maulid',majelisDaftar(KITAB_MAJELIS('maulid'),'Maulid Fadzkuruuni segera hadir.'),list(MAULID_DAFTAR,(m,j)=>`<a class="row" href="${m.berkas?'#/maulid/'+m.id:'#/segera/'+encodeURIComponent(m.judul)}"><span class="num">${j+1}</span><span class="t">${m.judul}<br><small>${m.berkas?(m.bagian||'')+' bagian'+(dlSudah('maulid:'+m.id)?' · tersimpan offline':''):'Segera hadir'}</small></span>${ic('next',18)}</a>`))}};
 return {html:head(k!=null?'':d.judul,k!=null?'#/maulid/'+id:'#/maulid',k!=null?RS:'')+'<div id="md"><p class="mut">Memuat…</p></div>',
  async init(){const el=$('#md');let m=null;try{m=await maulidAmbil(id)}catch(e){}
   if(!m){el.innerHTML='<div class="card mut">Maulid ini belum bisa dimuat. Periksa koneksi, atau unduh dulu agar bisa dibaca tanpa internet.</div>';return}
   if(k!=null)return maulidBaca(el,m,+k);
   el.innerHTML=`<div class="card dlk"><b>Unduh maulid ini</b><p class="mut" style="margin:4px 0 8px">Simpan agar bisa dibaca tanpa internet, atau simpan PDF-nya ke perangkat untuk dicetak.</p>${dlW('maulid:'+id)}</div>`+list(m.bagian,(b,j)=>`<a class="row" href="#/maulid/${id}/${j}"><span class="num">${j+1}</span><span class="t">${esc(b.judul)}<br><small>${b.isi.length} bait</small></span>${ic('next',18)}</a>`)}}};
