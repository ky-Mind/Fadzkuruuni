/* js/core/ui.js - Komponen antarmuka bersama (daftar, tab, segmen, tombol, dialog) */
const list=(a,fn)=>`<div class="list">${a.map(fn).join('')}</div>`;
const head=(t,back='#/',x='')=>`<div class="bar"><a class="bk" href="${back=='back'?'javascript:history.back()':back}" aria-label="Kembali">${ic('panah',24)}</a><h1>${t}</h1>${x}</div>`;
const tabs=(a,i=0)=>`<div class="tabs">${a.map((x,k)=>`<button data-tab="${k}" class="${k==i?'on':''}">${x}</button>`).join('')}</div>`;
const soon=a=>list(a,(x,i)=>`<a class="row" href="#/segera/${encodeURIComponent(x)}"><span class="num">${i+1}</span><span class="t">${x}<br><small>Segera hadir</small></span>${ic('next',18)}</a>`);
/* Halaman dua tab mengingat tab terakhir yang dibuka (mis. kembali dari Doa keseharian tetap di tab Doa, bukan Wirid) */
const TABI={};
function twoTabs(t,l,r,A,B,back='#/',awal){const i=awal??TABI[t]??0;TABI[t]=i;return {html:head(t,back)+tabs([l,r],i)+`<div id="tb">${i?B:A}</div>`,init(){$$('[data-tab]').forEach(b=>b.onclick=()=>{$$('[data-tab]').forEach(x=>x.classList.toggle('on',x==b));TABI[t]=+b.dataset.tab;$('#tb').innerHTML=b.dataset.tab==0?A:B})}}}
const row=(i,t,sb,r)=>`<div class="srw"><span class="si">${ic(i,20)}</span><span class="t">${t}${sb?`<br><small class="mut">${sb}</small>`:''}</span>${r}</div>`;
const tg=(id,on)=>`<label class="tg"><input type="checkbox" id="${id}" ${on?'checked':''}><i></i></label>`;
const lk=(h,i,t)=>`<a class="srw" href="${h}"><span class="si">${ic(i,20)}</span><span class="t">${t}</span>${ic('next',18)}</a>`;
const seg=(id,o,v)=>`<div class="seg" id="${id}">${o.map(x=>`<button type="button" data-v="${x[0]}" class="${x[0]==v?'on':''}">${x[1]}</button>`).join('')}</div>`;
const segBind=(id,fn)=>$$('#'+id+' button').forEach(b=>b.onclick=()=>{$$('#'+id+' button').forEach(x=>x.classList.toggle('on',x==b));fn(b.dataset.v,b)});
/* Ganti tema gaya Telegram: tombol yang dipencet ikut tertutup lingkaran (tidak dipisah). Animasi memakai clip-path lingkaran
   yang dijalankan GPU (compositor). Tanpa View Transitions atau bila gerak dikurangi: langsung berganti. */
function temaGanti(el,ubah,sesudah){const r=el&&el.getBoundingClientRect?el.getBoundingClientRect():null,x=r?r.left+r.width/2:innerWidth/2,y=r?r.top+r.height/2:innerHeight/2;
 if(!document.startViewTransition||gerakOff()){ubah();return sesudah&&sesudah()}
 const h=document.documentElement,gelap=()=>h.dataset.theme=='dark',dulu=gelap();let ke=dulu;
 h.classList.add('tgt');
 const t=document.startViewTransition(()=>{ubah();ke=gelap()});
 let an;t.finished.finally(()=>{an&&an.cancel();h.classList.remove('tgt','tciut');sesudah&&setTimeout(sesudah,50)});
 t.ready.then(()=>{/* Posisi dalam persen layar (#app = seluruh layar, sistem koordinat sama dengan tombol), jadi tepat di zoom berapa pun */
  const V=(document.getElementById('app')||h).getBoundingClientRect(),W=V.width||innerWidth,H=V.height||innerHeight,dx=x-V.left,dy=y-V.top,
   P=`${dx/W*100}% ${dy/H*100}%`,RP=Math.hypot(Math.max(dx,W-dx),Math.max(dy,H-dy))/(Math.hypot(W,H)/Math.SQRT2)*100+1,
   kecil=`circle(0% at ${P})`,besar=`circle(${RP}% at ${P})`,ciut=dulu&&!ke;
  /* Gaya Telegram: tema gelap selalu berupa lingkaran di tombol. Ke gelap: lingkaran gelap melebar dari tombol.
     Ke terang: tampilan gelap lama ditaruh di atas lalu menciut masuk ke tombol. */
  ciut&&h.classList.add('tciut');
  /* Animasi dibatalkan saat selesai: sisa fill:forwards akan terbawa ke transisi berikutnya dan merusaknya */
  an=h.animate({clipPath:ciut?[besar,kecil]:[kecil,besar]},{duration:ciut?300:400,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards',pseudoElement:ciut?'::view-transition-old(root)':'::view-transition-new(root)'})}).catch(()=>{})}
/* Pratinjau halaman untuk geser samping: PRATINJAU[rute](b,c,d) mengembalikan HTML lengkap halaman itu (isi yang biasanya dimuat init),
   atau null bila datanya belum ada. Dipakai js/core/events.js (vHtml). */
const PRATINJAU={};
const stp=(k,v,max)=>`<span class="stp" data-k="${k}" data-max="${max}"><button type="button" data-s="-1" aria-label="Kurangi">−</button><b>${v}</b><button type="button" data-s="1" aria-label="Tambah">+</button></span>`;
function msheet(t,h){const e=document.createElement('div');e.className='back-d';e.innerHTML=`<div class="sheet" role="dialog"><b>${t}</b><div style="margin:8px 0">${h}</div><button class="btn" style="width:100%" data-x>Mengerti</button></div>`;document.body.append(e);e.onclick=x=>{if(x.target==e||x.target.closest('[data-x]'))e.remove()}}
const NOTE=`<div class="note">${ic('info',18)}<span>Aplikasi masih dalam masa pengembangan. Bila ada yang keliru, mohon konfirmasi lewat <a href="#/tentang">Laporkan bug</a>.</span><button class="ib2" data-nb aria-label="Tutup">×</button></div>`;
const mk=(c,h)=>{const e=document.createElement('div');e.className=c;e.innerHTML=h;document.body.append(e);return e};
function dlg(t,m,fn){const e=mk('dlg',`<div role="dialog"><div class="ok">${ic('check',30)}</div><b style="font-size:18px">${t}</b><p class="mut" style="margin:8px 0 16px">${m}</p><button class="btn" style="width:100%">Tutup</button></div>`);e.onclick=x=>{if(x.target==e||x.target.tagName=='BUTTON'){e.remove();fn&&fn()}}}
/* Navigasi bagian sebelumnya/berikutnya. a dan b = [href, judul] atau kosong. Halaman yang memakainya bisa digeser kiri-kanan (js/core/events.js). */
const pnav=(a,b)=>`<nav class="pnav" aria-label="Pindah bagian">${a?`<a href="${a[0]}" data-pv rel="prev">${ic('back',18)}<span><small>Sebelumnya</small><b>${esc(a[1])}</b></span></a>`:'<i></i>'}${b?`<a href="${b[0]}" data-nx rel="next"><span><small>Berikutnya</small><b>${esc(b[1])}</b></span>${ic('next',18)}</a>`:'<i></i>'}</nav>`;
const RS=`<button class="ib" data-rs aria-label="Pengaturan baca">${ic('sliders',20)}</button>`;

/* Bagian "Majelis Fadzkuruuni" di halaman Wirid / Maulid: bacaan edisi majelis, dipisah dari yang umum dengan judul & lencana */
/* Bilah pemisah konten: Fadzkuruuni (bawaan) | Umum. k = kunci halaman agar pilihan diingat selama aplikasi terbuka */
const PBAR={};
const pisahBar=(k,fadz,umum)=>{const u=PBAR[k]==1;return `<div class="pbar" data-pbk="${k}" role="tablist"><button type="button" role="tab" data-pb="0" class="${u?'':'on'}">${ic('mosque',16)}Fadzkuruuni</button><button type="button" role="tab" data-pb="1" class="${u?'on':''}">Umum</button></div><div class="pbi"${u?' hidden':''}>${fadz}</div><div class="pbi"${u?'':' hidden'}>${umum}</div>`};
document.addEventListener('click',e=>{const b=e.target.closest('.pbar [data-pb]');if(!b)return;const bar=b.parentElement,i=+b.dataset.pb;PBAR[bar.dataset.pbk]=i;[...bar.children].forEach((x,j)=>x.classList.toggle('on',j==i));const P1=bar.nextElementSibling,P2=P1&&P1.nextElementSibling;if(P1)P1.hidden=i!=0;if(P2)P2.hidden=i!=1});
/* Pilihan Fadzkuruuni | Umum selalu diingat: isi tab yang dipasang ulang (pindah tab Wirid ↔ Doa, geser, pratinjau geser) mengikuti pilihan terakhir */
window.pbarTerap=root=>{(root||document).querySelectorAll('.pbar[data-pbk]').forEach(bar=>{const i=PBAR[bar.dataset.pbk]==1?1:0;[...bar.children].forEach((x,j)=>{if(x.classList.contains('on')!=(j==i))x.classList.toggle('on',j==i)});
 const P1=bar.nextElementSibling,P2=P1&&P1.nextElementSibling;if(P1&&P1.hidden!=(i!=0))P1.hidden=i!=0;if(P2&&P2.hidden!=(i!=1))P2.hidden=i!=1})};
new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType==1&&(n.classList.contains('pbar')||n.querySelector('.pbar')))return window.pbarTerap()}).observe(document.documentElement,{childList:true,subtree:true});
/* Daftar konten Majelis Fadzkuruuni (tanpa judul bagian), atau pesan bila belum ada */
const majelisDaftar=(L,kosong)=>L.length?`<div class="list mjd">${L.map(k=>`<a class="row" href="${k.rute||(k.teks?`#/maulid/${k.teks}`:`#/kitab/${k.id}`)}"><span class="si mjl-i">${ic(k.di=='wirid'?'beads':'heart',20)}</span><span class="t"><b>${esc(k.judul)}</b>${k.arab?`<br><span class="ar" style="font-size:18px">${k.arab}</span>`:''}<br><small>${esc(k.ket||'')}</small></span>${ic('next',18)}</a>`).join('')}</div>`:`<div class="card mut">${kosong||'Segera hadir.'}</div>`;
const majelisBagian=(judul,L)=>L.length?`<section class="mjl"><h2 class="mjl-h">${ic('mosque',18)}<span>${judul}</span></h2><div class="list">${L.map(k=>`<a class="row" href="${k.rute||(k.teks?`#/maulid/${k.teks}`:`#/kitab/${k.id}`)}"><span class="si mjl-i">${ic(k.di=='wirid'?'beads':'heart',20)}</span><span class="t"><b>${esc(k.judul)}</b>${k.arab?`<br><span class="ar" style="font-size:18px">${k.arab}</span>`:''}<br><small><span class="mjl-b">Edisi Majelis Fadzkuruuni</span> ${esc(k.ket||'')}</small></span>${ic('next',18)}</a>`).join('')}</div></section>`:'';
/* Isi Blob sebagai teks base64 (untuk dikirim ke jembatan Android). Diambil setelah penanda ";base64,", bukan setelah koma
   pertama: jenis berkas bisa memuat koma, mis. "video/mp4;codecs=avc1.42E01F,mp4a.40.2" */
const blobB64=b=>new Promise((ok,gagal)=>{const r=new FileReader();r.onload=()=>{const s=String(r.result),i=s.indexOf(';base64,');ok(i<0?'':s.slice(i+8))};r.onerror=()=>gagal(r.error);r.readAsDataURL(b)});
/* Himbauan kecil di akhir bacaan (menggantikan baris sumber/catatan panjang): ajak pembaca melapor bila ada salah teks */
const KOREKSI='<p class="koreksi">Menemukan kesalahan pada teks? Mohon bantu koreksi lewat <a href="#/lapor">Laporkan</a>.</p>';
/* Jarak tepi area isi (lihat css "Area isi selebar layar"): dihitung ulang setiap #view berubah lebar (jendela, menu sisi diciutkan) */
function lebarIsi(){const v=document.getElementById('view'),r=document.documentElement;if(!v||!window.ResizeObserver)return;
 const atur=()=>{const c=getComputedStyle(v),b=parseFloat(c.getPropertyValue('--gxb'))||24,m=parseFloat(c.getPropertyValue('--vmax'))||760;r.style.setProperty('--gx',Math.max(b,Math.round((v.clientWidth-m)/2+b))+'px')};
 new ResizeObserver(atur).observe(v);atur()}
document.readyState=='loading'?document.addEventListener('DOMContentLoaded',lebarIsi):lebarIsi();
