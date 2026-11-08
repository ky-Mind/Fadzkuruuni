/* js/pages/beranda.js - Beranda */
/* Pencarian Beranda: dibangun dari isi yang benar-benar ada di aplikasi (surah, wirid & doa beserta tiap bacaannya, maulid, kitab,
   Asmaul Husna, dan fitur), jadi setiap hasil langsung membuka halamannya. Yang memang belum ada isinya ditandai "Segera hadir". */
let CARIX=null;
const cariNorm=t=>String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const cariIndeks=()=>{if(CARIX)return CARIX;const L=[],tb=(n,h,j,kw,kh)=>L.push([n,h,j,cariNorm(n+' '+(kw||'')),kh]);
 NAMA.forEach((n,i)=>tb(n+' · '+ARTI[i],'#/quran/'+(i+1),'Surah'));
 [['w',WN,WD,'Wirid'],['d',MENU.doa,DD,'Doa']].forEach(([t,N,D,j])=>N.forEach((n,i)=>{const isi=D[i]||[];const as=t=='w'&&i==2;tb(n,as?'#/asma':isi.length?`#/baca/${t}/${i}`:null,j);isi.forEach((x,k)=>x&&x[0]&&tb(x[0],`#/bacaan/${t}/${i}/${k}`,j+' · '+n))}));
 MAULID_DAFTAR.forEach(m=>tb(m.judul,m.berkas?'#/maulid/'+m.id:null,'Maulid'));
 KITAB_DAFTAR.forEach(k=>tb(k.judul,k.berkas?'#/kitab/'+k.id:null,k.di?(k.di=='wirid'?'Wirid':'Maulid')+' · Majelis Fadzkuruuni':k.kelompok=='pondok'?'Kitab · Karya Pondok Fadzkuruuni':'Kitab'));
 ASMA.forEach(a=>tb(a[1]+' · '+a[2],'#/asma/'+a[0],'Asmaul Husna'));
 /* Isi kitab: bab/fasal dari daftar isi (data/kitab-indeks.js), mis. "puasa" → Fathul Qarib, Kitab Puasa, hal. 120 */
 if(typeof KITAB_INDEKS!='undefined')Object.entries(KITAB_INDEKS).forEach(([id,E])=>{const k=KITAB_DAFTAR.find(x=>x.id==id);if(!k)return;E.forEach(e=>tb(e[1]+' — '+k.judul,`#/kitab/${id}/${e[3]}`,'Kitab'+(e[0]?' · '+e[0]:'')+' · hal. '+e[4],e[2]+' '+e[0],`${id}|${e[3]}|${e[4]}`))});
 Object.entries(TPOOL).forEach(([r,v])=>tb(tNama(r,v[1]),'#/'+r,'Fitur'));
 /* Pengaturan: tiap kelompok, lalu tiap pengaturan di dalamnya (judul bagian & label sakelar), mis. "tema" → Tampilan & Bacaan */
 if(typeof SETGROUPS!='undefined')SETGROUPS.forEach(g=>{const h=g[0][0]=='#'?g[0]:'#/pengaturan/'+g[0];tb(g[2],h,'Pengaturan',g[3]);
  if(g[0][0]=='#'||!SETPAGES[g[0]])return;try{const t=document.createElement('div');t.innerHTML=SETPAGES[g[0]]().html;const lihat=new Set();
   $$('h2,h3,.tg>span,.ftpr>span,label>span:first-child,.row .t>b,span.t',t).forEach(e=>{const x=(e.firstChild&&e.firstChild.nodeType==3?e.firstChild.textContent:e.textContent).trim();if(x&&x.length<60&&!lihat.has(x)){lihat.add(x);tb(x,h,'Pengaturan · '+g[2])}})}catch(e){}});
 /* Menu zakat & sedekah, dan video tutorial */
 if(MENU.zakat)MENU.zakat.forEach(m=>m&&m[1]&&tb(m[1],'#/sedekah/'+m[0],'Zakat & sedekah'));
 if(typeof TUTOR!='undefined')TUTOR.forEach(v=>tb(v.judul,'#/tutorial/'+v.id,'Video tutorial',v.ket));
 return CARIX=L};
const cariHasil=q=>{const w=cariNorm(q).split(' ').filter(Boolean);if(!w.length)return [];return cariIndeks().filter(x=>w.every(k=>x[3].includes(k))).sort((a,b)=>(b[3].startsWith(w[0])-a[3].startsWith(w[0]))||(!!b[1]-!!a[1])).slice(0,12)};
const SK='<svg class="sk" viewBox="0 0 300 40" preserveAspectRatio="none"><path d="M0 40V30h28v-8l3-6 3 6v8h22c0-12 12-18 22-18s22 6 22 18h26v-6h10v-10l4-6 4 6v10h10v6h22v16z" fill="rgba(255,255,255,.12)"/></svg>';
/* Bagian Beranda (urutan & tampil/sembunyi diatur admin lewat TATA.beranda, js/core/tata.js) */
const BAG={
 lokasi:()=>`<div class="top"><span class="bn"><img src="img/logo.png" alt="" width="30" height="30">Fadzkuruuni</span><a href="#/jadwal">${ic('pin',16)} ${S.loc.n} <b>(Ganti)</b></a></div>`,
 catatan:()=>S.nb?'':NOTE,
 pengumuman:()=>{const u=TATA.umum;if(!u||!u.on||!(u.judul||u.teks))return '';const isi=`<span class="umi">${ic('bell',20)}</span><span class="umt">${u.judul?`<b>${esc(u.judul)}</b>`:''}${u.teks?`<span>${esc(u.teks)}</span>`:''}</span>${u.tautan?`<span class="uml">${esc(u.label||'Buka')} ${ic('next',14)}</span>`:''}`;
  return u.tautan?`<a class="umum" href="${esc(u.tautan)}"${/^https?:/.test(u.tautan)?' target="_blank" rel="noopener"':''}>${isi}</a>`:`<div class="umum">${isi}</div>`},
 sapa:()=>GREET(),
 jadwal:()=>`<div class="hero hfoto"><small class="hnl">${ic('pin',15)}<span id="nl"></span></small><div class="big" id="np">--</div><div id="cd" class="mut2"></div><div class="hgr" aria-hidden="true"><i></i><svg viewBox="0 0 32 22" width="30" height="20" fill="currentColor"><path d="M16 1.5c.6 1.6 2 2.4 2 4.2 3.6 1.2 6 4.2 6 7.8V20H8v-6.5c0-3.6 2.4-6.6 6-7.8 0-1.8 1.4-2.6 2-4.2zM4 9.5l1.2 2V20H2.8v-8.5zm24 0l1.2 2V20h-2.4v-8.5zM1 20.5h30V22H1z"/></svg><i></i></div><small>${new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})} / ${hf(new Date(),{day:'numeric',month:'long',year:'numeric'})}</small><div class="qt"><span id="qtx"></span></div><div class="pt" id="pt"></div></div>`,
 pintasan:()=>`<div class="grid g2">${tataPintasan().map(s=>`<a href="#/${s[0]}" data-ta="pin:${s[0]}"><b>${ic(s[1],26)}</b>${esc(s[2])}</a>`).join('')}</div>`,
 cari:()=>`<div class="srch">${ic('search',18)}<input id="sr" type="search" placeholder="Cari doa, wirid, surah"></div><div id="sl"></div>`,
 /* Kartu geser Beranda: bacaan khas Majelis Fadzkuruuni (kitab karya pondok, wirid & qasidah yang dibaca di majelis) */
 promo:()=>`<div class="carw"><button type="button" class="carb" data-carb="-1" aria-label="Kartu sebelumnya" hidden>${ic('back',20)}</button><button type="button" class="carb kn" data-carb="1" aria-label="Kartu berikutnya">${ic('next',20)}</button><div class="car"><a class="sl" href="#/kitab/ratib-alhaddad"><span class="sl-i">${ic('beads',20)}</span><b>Ratib Al-Haddad</b><span>Wirid harian Majelis Fadzkuruuni</span></a><a class="sl s2" href="#/kitab/aqidatul-awam-fadzkuruuni"><span class="sl-i">${ic('book',20)}</span><b>Aqidatul Awam</b><span>Matan akidah 50, disyarah Khadim Majelis Fadzkuruuni</span></a><a class="sl s3" href="#/kitab/ma-fil-wujud"><span class="sl-i">${ic('heart',20)}</span><b>Qasidah Ma fil Wujud</b><span>Munajat Imam Al-Haddad, dengan terjemah</span></a><a class="sl s3" href="#/kitab/alhawi"><span class="sl-i">${ic('lib',20)}</span><b>Al-Hawi</b><span>Sharaf &amp; nahwu, kitab karya Pondok Fadzkuruuni</span></a></div></div>`,
 lanjut:()=>S.hist[0]?`<h2>Lanjutkan membaca</h2><a class="card" style="display:flex;gap:12px;align-items:center" href="#/quran/${S.hist[0]}">${ic('book',22)}<span>${NAMA[S.hist[0]-1]}<br><small class="mut">${ARTI[S.hist[0]-1]} · ${AYAT[S.hist[0]-1]} ayat</small></span></a>`:'',
 doa:()=>doaHariIni()};
/* Tiap bagian dibungkus <section data-ta> (display:contents) agar mode admin bisa memasang tombol geser; yang disembunyikan hanya terlihat (redup) di mode admin */
const berandaHtml=()=>TATA.beranda.map(x=>{if(!x.on&&!TADMON)return '';let h=BAG[x.id]?BAG[x.id]():'';if(!h&&TADMON)h=`<div class="tak-kosong">${esc(TBAG[x.id])} (kosong saat ini)</div>`;return h?`<section class="tb${x.on?'':' tah'}" data-ta="beranda:${x.id}">${h}</section>`:''}).join('');
P['']=()=>({html:berandaHtml(),
 init(){qrot();if($('#sr'))$('#sr').oninput=e=>{const q=e.target.value.trim(),H=cariHasil(q);$('#sl').innerHTML=q?(H.length?list(H,x=>x[1]?`<a class="row" href="${x[1]}"${x[4]?` data-kh="${x[4]}"`:''}><span class="t">${esc(x[0])}<br><small>${esc(x[2])}</small></span>${ic('next',18)}</a>`:`<div class="row" data-soon><span class="t">${esc(x[0])}<br><small>${esc(x[2])} · Segera hadir</small></span></div>`):`<p class="mut" style="margin:8px 4px">Tidak ada hasil untuk "${esc(q)}".</p>`):'';$$('[data-soon]').forEach(e=>e.onclick=()=>toast('Konten ini segera hadir'))};
 const tick=()=>{if(!$('#pt'))return clearInterval(P.tk);const now=new Date(),T=waktu(now,S.loc),c=locNow(),z=v=>String(v).padStart(2,'0');
 let cur=5;T.forEach((x,i)=>{if(x[1]<=c)cur=i});
 /* Tanda warna: tetap di waktu yang baru masuk selama 10 menit, lalu pindah ke waktu berikutnya (setelah Isya: Subuh) */
 const tn=Math.max(0,T.findIndex(x=>c<x[1]+10/60));
 const nx=T.findIndex((x,i)=>i!=1&&x[1]>c),ni=nx<0?0:nx;let df=T[ni][1]-c;if(nx<0)df+=24;const D=Math.max(0,Math.round(df*3600));
 $('#nl').textContent='Sekarang · '+T[cur][0];$('#np').innerHTML=hm(c)+' <small>'+tzl()+'</small>';$('#cd').textContent='Menuju '+T[ni][0]+' · -'+z(D/3600|0)+':'+z(D%3600/60|0)+':'+z(D%60);/* Kotak waktu salat hanya digambar ulang bila isinya berubah (bukan tiap detik): tidak berkedip, dan susunan/teks dari admin tetap terpasang */
 const ph=T.map((x,i)=>`<div class="${i==tn?'n':''}">${x[0]}<b>${hm(x[1])}</b></div>`).join(''),pe=$('#pt');if(pe.dataset.h!==ph){pe.innerHTML=ph;pe.dataset.h=ph}};tick();clearInterval(P.tk);P.tk=setInterval(tick,1000)}});
const periode=()=>{const h=locNow();return h<4?'malam':h<10?'pagi':h<15?'siang':h<18?'sore':'malam'};
const GREET=()=>`<div class="gr"><small class="mut">${new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} · ${hijri()}</small><div class="gh">Selamat ${periode()}${S.nm?', '+esc(S.nm):''}</div></div>`;
/* Doa hari ini: satu doa (berteks Arab dan terjemah) dari Wirid & Doa */
let DOAPILIH=null;
const doaHariIni=()=>{const L=[];DD.forEach((g,i)=>g.forEach((x,j)=>{if(x[1]&&x[2])L.push([x,i,j])}));if(!L.length)return '';
 /* Berganti setiap kali aplikasi dibuka (dipilih acak sekali per pembukaan, tidak sama dengan doa terakhir) */
 if(DOAPILIH==null){DOAPILIH=Math.floor(Math.random()*L.length);if(L.length>1&&DOAPILIH==S.doaTerakhir)DOAPILIH=(DOAPILIH+1)%L.length;S.doaTerakhir=DOAPILIH;try{save()}catch(e){}}
 const [x,i,j]=L[DOAPILIH%L.length];
 return `<h2>Doa hari ini</h2><a class="card dhi" href="#/bacaan/d/${i}/${j}"><b>${x[0]}</b><div class="dar">${x[1]}</div><p class="mut">${x[2]}</p><span class="dlj">Baca selengkapnya ${ic('next',16)}</span></a>`};

/* Kartu geser (.car) di komputer: tetikus tidak bisa menggeser seperti jari, jadi ada tombol panah kiri/kanan (tampil saat
   kursor di atas kartu) dan kartu bisa diseret dengan tetikus. Di HP tetap digeser dengan jari seperti biasa. */
const carPanah=c=>{const w=c&&c.closest('.carw');if(!w)return;const m=c.scrollWidth-c.clientWidth;/* batas 24 px: jepret kartu (scroll-snap) bisa menyisakan geser kecil di ujung */w.querySelector('[data-carb="-1"]').hidden=c.scrollLeft<=24;w.querySelector('[data-carb="1"]').hidden=c.scrollLeft>=m-24};
document.addEventListener('scroll',e=>{if(e.target.classList&&e.target.classList.contains('car'))carPanah(e.target)},true);
document.addEventListener('mouseover',e=>{const c=e.target.closest&&e.target.closest('.carw');if(c)carPanah(c.querySelector('.car'))});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-carb]');if(!b)return;const c=b.closest('.carw').querySelector('.car'),k=c.querySelector('.sl');
 c.scrollBy({left:+b.dataset.carb*((k?k.offsetWidth:c.clientWidth*.8)+10),behavior:'smooth'})});
{let c=null,x0=0,s0=0,gerak=false;
 document.addEventListener('mousedown',e=>{if(e.button!==0)return;const t=e.target.closest&&e.target.closest('.car');if(!t)return;c=t;x0=e.clientX;s0=t.scrollLeft;gerak=false;e.preventDefault()});
 addEventListener('mousemove',e=>{if(!c)return;const d=e.clientX-x0;if(!gerak&&Math.abs(d)<6)return;if(!gerak){gerak=true;c.style.scrollSnapType='none';c.classList.add('seret')}c.scrollLeft=s0-d});
 addEventListener('mouseup',()=>{if(!c)return;const t=c;c=null;if(!gerak)return;
  /* Setelah diseret: berhenti pas di kartu terdekat */
  const k=t.querySelector('.sl'),w=k?k.offsetWidth+10:t.clientWidth,ke=Math.round(t.scrollLeft/w)*w;t.classList.remove('seret');t.scrollTo({left:ke,behavior:'smooth'});setTimeout(()=>t.style.scrollSnapType='',400);
  /* Klik setelah menyeret tidak membuka kartu */
  addEventListener('click',x=>{x.preventDefault();x.stopPropagation()},{capture:true,once:true});setTimeout(()=>gerak=false,0)})}
