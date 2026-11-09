/* js/pages/quran.js - Al-Qur'an: daftar surah, pembaca, mushaf layar penuh, pemutar, penanda ayat */
/* Surah Madaniyah (urutan mushaf); selain itu Makkiyah */
const MADANI=new Set([2,3,4,5,8,9,13,22,24,33,47,48,49,55,57,58,59,60,61,62,63,64,65,66,76,98,99,110]);
const jn=n=>`<span class="jn">${MADANI.has(n)?'Madaniyah':'Makkiyah'}</span>`;
/* Kartu progres di tab Riwayat: surah terakhir dibaca dan jumlah surah yang sudah pernah dibuka */
/* Ayat terakhir dibaca per surah: tanda manual (S.tbaca) diutamakan, lalu posisi gulir terakhir (S.qpos) */
const qKe=n=>{const tb=S.tbaca,a=tb&&tb.n==n?tb.a:(S.qpos||{})[n];return '#/quran/'+n+(a>1?'/'+a:'')};
const KH=()=>{const h=S.hist||[],tb=S.tbaca;if(!h.length&&!tb)return '';const k=new Set(S.dibuka||[]).size,p=Math.round(k/114*100);return `<div class="card kh"><small class="mut">${tb?'Ditandai terakhir dibaca':'Terakhir dibaca'}</small><div class="kh-r"><b>${tb?`${NAMA[tb.n-1]} · ayat ${tb.a}`:NAMA[h[0]-1]}</b><a class="btn s" href="${tb?'#/quran/'+tb.n+'/'+tb.a:qKe(h[0])}">Lanjutkan</a></div><div class="pb"><i style="width:${p}%"></i></div><small class="mut">${k} dari 114 surah sudah dibuka (${p}%)</small></div>`};
/* Tab terakhir di daftar Al-Qur'an diingat: kembali ke Al-Qur'an (lewat menu, geser, atau tombol kembali) tetap di tab yang sama */
let QTAB=0;
/* Isi daftar Al-Qur'an (Surah/Juz/Riwayat) sebagai HTML: dipakai halaman ini dan pratinjau geser, agar keduanya sama persis */
/* Cari surah tanpa peduli spasi, tanda hubung, atau petik: "yasin" = "Ya Sin", "aliimran" = "Ali 'Imran" */
function qDaftar(tab,cari){const nrm=x=>x.toLowerCase().replace(/[^a-z0-9]/g,''),q=nrm(cari||'');let a=NAMA.map((n,i)=>i+1);if(tab==2)a=S.hist;else if(q)a=a.filter(i=>nrm(NAMA[i-1]+i).includes(q));
  return (tab==2?KH():'')+(tab==1?list(JUZ,(j,i)=>`<a class="row" href="#/quran/${j[0]}/${j[1]}"><span class="num">${i+1}</span><span class="t">Juz ${i+1}<br><small>${NAMA[j[0]-1]} : ${j[1]}</small></span></a>`):a.length?list(a,i=>{const ak=tab==2&&(S.tbaca&&S.tbaca.n==i?S.tbaca.a:(S.qpos||{})[i]);return `<a class="row" href="${tab==2?qKe(i):'#/quran/'+i}"><span class="num">${i}</span><span class="t">${NAMA[i-1]}${jn(i)}<br><small>${ak>1?`Terakhir dibaca: ayat ${ak} dari ${AYAT[i-1]}`:`${ARTI[i-1]} (${AYAT[i-1]} Ayat)`}</small></span></a>`}):'<div class="card mut">Belum ada riwayat.</div>');}
PRATINJAU.quran=b=>b?null:P.quran().html.replace('<div id="ql"></div>',`<div id="ql">${qDaftar(QTAB,'')}</div>`);
P.quran=()=>({html:`<div class="bar"><a class="bk" href="#/" aria-label="Kembali">${ic('panah',24)}</a><h1>Al-Quran</h1><button class="btn s" onclick="$('#q').focus()">${ic('search',16)} Cari</button></div><input class="in" id="q" type="search" placeholder="Cari surah…">${tabs([`${ic('book',16)} Surah`,`${ic('news',16)} Juz`,`${ic('clock',16)} Riwayat`],QTAB)}<div id="ql"></div>`,
 init(){let tab=QTAB;const draw=()=>{$('#ql').innerHTML=qDaftar(tab,$('#q').value)};
  $$('[data-tab]').forEach(b=>b.onclick=()=>{tab=QTAB=+b.dataset.tab;$$('[data-tab]').forEach(x=>x.classList.toggle('on',x==b));draw()});$('#q').oninput=draw;draw();
  }});
/* Audio per ayat (Syaikh Mishary Alafasy, everyayah.com) agar bisa disimpan untuk offline; tiap surah satu paket unduhan.
   Selain Al-Fatihah dan At-Taubah diawali bismillah (berkas 001001). */
const qAud=(n,a)=>`https://everyayah.com/data/Alafasy_128kbps/${String(n).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`;
const qAudList=n=>[...(n!=1&&n!=9?[qAud(1,1)]:[]),...Array.from({length:AYAT[n-1]},(_,i)=>qAud(n,i+1))];
NAMA.forEach((_,i)=>paket('audio:'+(i+1),{judul:'Audio '+NAMA[i],kat:'audio',selesai:'siap diputar tanpa internet',urls:async()=>qAudList(i+1)}));
/* Pembaca surah. Mode kartu dibagi per halaman (QPER ayat) dan bisa digeser ke samping; mode mushaf satu halaman penuh bergaris.
   Pindah halaman, surah, atau mode dilakukan di tempat (tanpa memuat ulang) dengan animasi geser, dan posisi ayat dipertahankan. */
const QPER=12;
addEventListener('fzpemutar',()=>{if(window.QR&&QR.tandai&&$('#ay'))QR.tandai()});
const surah=(n,sc)=>{n=+n;if(!NAMA[n-1])return P.quran();return {html:`<div class="rh"><a class="bk" href="#/quran" aria-label="Daftar surah">${ic('panah',24)}</a><div class="rt"><b id="qt"></b><small id="qa"></small></div><div class="mseg" role="group" aria-label="Mode baca"><button type="button" data-md="0" aria-label="Mode kartu: ayat per kartu dengan terjemah">${ic('cards',16)}<span>Kartu</span></button><button type="button" data-md="1" aria-label="Mode mushaf: teks Arab bersambung">${ic('book',16)}<span>Mushaf</span></button></div><button class="ib" id="qs" aria-label="Pengaturan baca">${ic('sliders',20)}</button></div><div id="ay"><p class="mut">Memuat…</p></div><div class="snav" id="snav"></div>`,
 init(){qReader(n,+sc||0)}}};
function qReader(n,sc){const el=$('#ay'),R={n,A:null,p:0,busy:0};window.QR=R;$('#qs').onclick=qsheet;
 const pages=()=>S.full?1:Math.ceil(R.A.length/QPER);
 const segOn=()=>$$('.mseg button').forEach(b=>b.classList.toggle('on',(b.dataset.md=='1')==!!S.full));
 /* Pemutar global (js/core/pemutar.js): tetap berbunyi saat pindah halaman / aplikasi di latar. Ayat yang dibaca disorot di sini */
 const tandai=()=>{$$('#ay .qplay').forEach(x=>x.classList.remove('qplay'));if(!pmAktif()||PM.n!=R.n)return;const k=pmAyat(),t=k>0&&$('#a'+k);if(!t)return;t.classList.add('qplay');
  /* Ikuti ayat yang dibaca bila pengguna tidak sedang menggulir sendiri */
  if(!document.hidden&&Date.now()-(R.gulir||0)>4000){const r=t.getBoundingClientRect();if(r.top<80||r.bottom>innerHeight-120){if(!S.full&&R.p!=Math.floor((k-1)/QPER)){R.p=Math.floor((k-1)/QPER);draw()}($('#a'+k)||t).scrollIntoView({block:'center',behavior:'smooth'})}}};
 R.tandai=tandai;
 R.dari=k=>pmQuran(R.n,k);
 /* Putar hanya satu ayat (berhenti setelah ayat itu selesai) */
 R.satu=k=>pmQuran(R.n,k,{satu:1});
 /* Putar terus lintas surah sampai titik pilihan {n,a} */
 R.terus=(k,akhir)=>pmQuran(R.n,k,{akhir});
 ['touchmove','wheel'].forEach(t=>$('#view').addEventListener(t,()=>R.gulir=Date.now(),{passive:true}));
 const hdr=()=>{$('#qt').textContent=R.n+'. '+NAMA[R.n-1];$('#qa').textContent=ARTI[R.n-1]+' · '+AYAT[R.n-1]+' ayat';segOn();tandai()};
 const nav=()=>{const np=pages(),first=R.p<=0,last=R.p>=np-1,lbl=S.full||np<2?'':`Ayat ${R.p*QPER+1}–${Math.min(R.A.length,(R.p+1)*QPER)} dari ${R.A.length}`;
  $('#snav').innerHTML=`<button class="snb" data-qn="-1" aria-label="${first?'Surah sebelumnya':'Halaman sebelumnya'}" ${first&&R.n<=1?'disabled':''}>‹</button><small class="mut">${lbl||'Geser ke samping untuk pindah surah'}</small><button class="snb" data-qn="1" aria-label="${last?'Surah berikutnya':'Halaman berikutnya'}" ${last&&R.n>=114?'disabled':''}>›</button>`};
 const draw=()=>{drawAy(el,R.A,R.n,S.full?null:R.p);nav();tandai();const t=R.tuju&&$('#a'+R.tuju);t&&t.classList.add('aytuju')};
 /* Ayat yang dituju (dari penanda, terakhir dibaca, pencarian) diberi blok warna dan berkedip 3 kali; blok tetap sampai ayat lain dipilih */
 window.ayTuju=k=>{R.tuju=k;$$('#ay .aytuju,#ay .aykedip').forEach(x=>x.classList.remove('aytuju','aykedip'));const t=$('#a'+k);if(!t)return;t.classList.add('aytuju');void t.offsetWidth;t.classList.add('aykedip')};
 window.ayPilih=k=>{R.tuju=k;$$('#ay .aytuju').forEach(x=>x.classList.remove('aytuju','aykedip'));const t=$('#a'+k);t&&t.classList.add('aytuju')};
 const catat=()=>{S.hist=[R.n,...S.hist.filter(x=>x!=R.n)].slice(0,20);S.dibuka=[...new Set([...(S.dibuka||[]),R.n])];save()};
 /* Ayat yang sedang terlihat paling atas (di bawah header), untuk mempertahankan posisi saat ganti mode */
 const atas=()=>{const y=$('.rh').getBoundingClientRect().bottom;const t=$$('#ay [id^="a"]').find(x=>x.getBoundingClientRect().bottom>y+8);return t?+t.id.slice(1):1};
 const ke=(k,smooth)=>{const t=$('#a'+k);if(t&&k>1)t.scrollIntoView({block:'start',behavior:smooth?'smooth':'auto'});else $('#view').scrollTo({top:0})};
 const slide=(d,fn)=>new Promise(res=>{if(R.instan){fn();return res()}el.classList.remove('sl-in-l','sl-in-r');el.classList.add(d>0?'sl-out-l':'sl-out-r');setTimeout(()=>{fn();$('#view').scrollTo({top:0});el.classList.remove('sl-out-l','sl-out-r');void el.offsetWidth;el.classList.add(d>0?'sl-in-r':'sl-in-l');res()},170)});
 /* d = 1 (berikutnya) atau -1: pindah halaman kartu dulu, lalu pindah surah di tempat */
 R.go=async d=>{if(R.busy||!R.A)return;const np=pages();
  if(!S.full&&R.p+d>=0&&R.p+d<np){R.busy=1;await slide(d,()=>{R.p+=d;draw()});R.busy=0;return}
  const m=R.n+d;if(m<1||m>114)return;R.busy=1;let A;try{A=SBL[m]||await qGet(m)}catch(e){R.busy=0;return toast('Surah ini belum tersimpan dan internet tidak tersedia')}
  await slide(d,()=>{R.n=m;R.tuju=0;R.A=window.QAYAT=A;R.p=d<0&&!S.full?Math.ceil(A.length/QPER)-1:0;hdr();draw();history.replaceState(null,'','#/quran/'+m);R.siapkan&&R.siapkan();route.cur=location.hash;RIW[RIW.length-1]=location.hash;catat()});R.busy=0};
 R.mode=full=>{full=!!full;if(!!S.full==full||!R.A)return;const k=atas();S.full=full;save();document.body.classList.toggle('full',full);R.p=Math.floor((k-1)/QPER);segOn();draw();ke(k);R.siapPeek&&R.siapPeek()};
 $$('.mseg button').forEach(b=>b.onclick=()=>R.mode(b.dataset.md=='1'));
 /* Ketuk kartu ayat (atau ayat di mode mushaf) untuk membuka menu ayat; tombol bintang tetap langsung menandai */
 el.onclick=e=>{if(e.target.closest('button,a')||String(getSelection()).trim())return;const t=e.target.closest('.ay,.ayt');if(t){ayPilih(+t.id.slice(1));ayMenu(R.n,+t.id.slice(1))}};
 $('#snav').onclick=e=>{const b=e.target.closest('[data-qn]');if(b&&!b.disabled)(R.geser||R.go)(+b.dataset.qn)};
 /* Geser ke samping seperti WhatsApp: halaman kartu (atau surah) sebelah ikut masuk bersama jari; dilepas cukup jauh
    atau dikibas: meluncur penuh lalu dipasang tanpa animasi; kurang dari itu kembali. Tepi kiri dibiarkan untuk geser kembali.
    Pratinjau digambar dengan draw() yang sama persis (kartu, penanda, sorotan, tombol Sebelumnya/Berikutnya, label ayat),
    kartu + tombol navigasi bergeser bersama, dan posisi gulir dipertahankan: setelah pindah tidak ada yang berubah/meloncat. */
 /* Surah sebelum & sesudah disiapkan lebih dulu, supaya saat digeser isinya langsung tampil */
 const SBL={};const siapkan=()=>[R.n-1,R.n+1].forEach(m=>{if(m>=1&&m<=114&&!SBL[m])qGet(m).then(B=>{SBL[m]=B;R.siapPeek&&R.siapPeek()}).catch(()=>{})});R.siapkan=siapkan;
 {let sx=null,sy=0,t0=0,dx=0,lk=null,d=0,ada=0,pk=null,k=1,sc0=0,pTop=0,jejak=[],raf=0,sibuk=0;const V=$('#view'),sn=$('#snav'),Wd=()=>V.clientWidth,ES='cubic-bezier(.22,.8,.3,1)';
  const buang=()=>{if(pk){pk.remove();pk=null}};
  /* Gambar keadaan lain (halaman kartu / surah sebelah) dengan draw() asli, ambil HTML-nya, lalu kembalikan keadaan & simpul asli */
  const gambarLain=st=>{const sA=[...el.childNodes],sN=[...sn.childNodes],o={n:R.n,A:R.A,p:R.p,tuju:R.tuju};let h='';
   try{Object.assign(R,st,{tuju:0});draw();h=`<div class="qpk">${el.innerHTML}</div><div class="snav">${sn.innerHTML}</div>`}catch(e){}
   Object.assign(R,o);el.replaceChildren(...sA);sn.replaceChildren(...sN);return h};
  /* Isi sebelah (dd = 1 berikutnya, -1 sebelumnya): '' bila tidak ada. Disimpan per keadaan, dan disiapkan saat senggang
     (lihat R.siapPeek), sehingga saat jari mulai menggeser isinya tinggal ditampilkan, tanpa jeda menyusun puluhan kartu ayat */
  const PKC={},pkKunci=dd=>[R.n,R.p,S.full?1:0,dd,SBL[R.n+dd]?1:0,R.tuju,S.fs].join('|');
  const htmlSebelah=dd=>{if(!R.A)return '';const kk=pkKunci(dd);if(PKC[dd]&&PKC[dd].k==kk)return PKC[dd].h;let h='';
   if(!S.full&&R.p+dd>=0&&R.p+dd<pages())h=gambarLain({p:R.p+dd});
   else{const m=R.n+dd,B=SBL[m];if(m<1||m>114)h='';else if(!B)return '<p class="mut" style="text-align:center;padding:28px 0">Memuat…</p>';else h=gambarLain({n:m,A:B,p:S.full?0:dd<0?Math.ceil(B.length/QPER)-1:0})}
   PKC[dd]={k:kk,h};return h};
  let siT=0;R.siapPeek=()=>{clearTimeout(siT);siT=setTimeout(()=>(window.requestIdleCallback||setTimeout)(()=>{if(sx!==null||sibuk||R.busy||window.QR!==R)return;[1,-1].forEach(htmlSebelah)},{timeout:900}),250)};
  el.addEventListener('click',()=>{delete PKC[1];delete PKC[-1];R.siapPeek()},true);
  const isiSebelah=dd=>{buang();d=dd;ada=0;if(!R.A||R.busy)return;const h=htmlSebelah(dd);if(!h)return;ada=1;
   pk=document.createElement('div');pk.className='tpeek gsj';pk.setAttribute('aria-hidden','true');pk.innerHTML=h;
   Object.assign(pk.style,{left:el.offsetLeft+'px',top:pTop+'px',width:el.offsetWidth+'px'});sn.after(pk)};
  const pasang=(px,tr)=>{const t=tr?`transform ${tr}`:'none';[el,sn].forEach(g=>{g.style.transition=t;g.style.transform=px?`translate3d(${px}px,0,0)`:''});if(pk){pk.style.transition=t;pk.style.transform=`translate3d(${px+d*Wd()}px,0,0)`}};
  /* Posisi jari diterapkan sekali per frame layar */
  let tuj=0;const jadwal=px=>{tuj=px;if(!raf)raf=requestAnimationFrame(()=>{raf=0;pasang(tuj)})};
  const pulih=()=>{cancelAnimationFrame(raf);raf=0;[el,sn].forEach(g=>{g.style.transition=g.style.transform='';g.classList.remove('gsj')});V.style.position='';buang();sibuk=0;R.siapPeek()};
  /* Mulai menggeser ke arah dd: pratinjau ditaruh mulai dari atas layar yang terlihat (di bawah kepala surah bila tampil),
     bukan dari awal daftar yang sudah tergulir */
  const mulai=dd=>{k=V.getBoundingClientRect().width/V.offsetWidth||1;V.style.position='relative';sc0=V.scrollTop;[el,sn].forEach(g=>g.classList.add('gsj'));
   const rh=$('.rh'),hb=rh&&!rh.classList.contains('smb')?(rh.getBoundingClientRect().bottom-V.getBoundingClientRect().top)/k:0;pTop=Math.max(el.offsetTop,sc0+hb);isiSebelah(dd)};
  /* Meluncur penuh ke isi sebelah lalu dipasang: isi baru ditaruh tepat di posisi pratinjau tadi (tidak meloncat ke atas) */
  const tuntas=ms=>{sibuk=1;pasang(-d*Wd(),`${ms}ms ${ES}`);
   setTimeout(async()=>{R.instan=1;let ok=0;const n0=R.n,p0=R.p;try{await R.go(d);ok=R.n!=n0||R.p!=p0}finally{R.instan=0;
    if(ok){BLU=0;V.scrollTop=sc0-(pTop-el.offsetTop);BLY=V.scrollTop}pulih()}},ms+20)};
  const batal=ms=>{sibuk=1;pasang(0,`${ms}ms ${ES}`);setTimeout(pulih,ms+20)};
  /* Tombol Sebelumnya/Berikutnya dan panah keyboard: gerak luncur yang sama seperti digeser jari */
  R.geser=dd=>{if(sx!==null||sibuk||R.busy||!R.A)return;mulai(dd);if(!ada){pulih();return R.go(dd)}pasang(0);void el.offsetWidth;requestAnimationFrame(()=>tuntas(300))};
  /* Geser bisa di mana saja di halaman surah, termasuk ruang kosong di bawah ayat (kecuali kepala surah, pemutar, dan tombol).
     Pendengar dipasang di #view yang tetap ada antarhalaman, jadi pendengar surah sebelumnya dilepas dulu */
  window.QRgeser&&QRgeser.abort();const ab=window.QRgeser=new AbortController(),ops=x=>({passive:x,signal:ab.signal});
  V.addEventListener('touchstart',e=>{sx=null;if(window.QR!==R||!el.isConnected)return ab.abort();if(e.touches.length!=1||R.busy||sibuk||e.touches[0].clientX<24||e.target.closest('button,a,input,label,.rh,.pl,.sheet,.back-d,.tpeek'))return;sx=e.touches[0].clientX;sy=e.touches[0].clientY;t0=Date.now();dx=0;lk=null;jejak=[];k=V.getBoundingClientRect().width/V.offsetWidth||1},ops(true));
  V.addEventListener('touchmove',e=>{if(sx===null)return;if(e.touches.length!=1){sx=null;if(lk=='h')batal(200);return}
   const x=(e.touches[0].clientX-sx)/k,y=(e.touches[0].clientY-sy)/k,kini=performance.now();
   if(lk===null){if(Math.abs(x)<12&&Math.abs(y)<12)return;lk=Math.abs(x)>Math.abs(y)*1.6?'h':'v';if(lk=='h')mulai(x<0?1:-1)}
   if(lk!='h')return;if(e.cancelable)e.preventDefault();jejak.push([kini,x]);while(jejak.length>2&&kini-jejak[0][0]>100)jejak.shift();
   const nd=x<0?1:-1;if(nd!=d&&x!=0)isiSebelah(nd);dx=x;jadwal(ada?dx:dx*.25)},ops(false));
  V.addEventListener('touchend',()=>{if(sx===null)return;sx=null;if(lk!='h')return;cancelAnimationFrame(raf);raf=0;
   /* Kecepatan dari gerakan ±100 ms terakhir: kibasan cepat langsung meluncur, geser pelan diputuskan dari jaraknya */
   const w=Wd(),j0=jejak[0],j1=jejak[jejak.length-1],vJ=j0&&j1&&j1[0]>j0[0]?(j1[1]-j0[1])/(j1[0]-j0[0]):0,vR=dx/Math.max(1,Date.now()-t0),vel=Math.abs(vJ)>Math.abs(vR)?vJ:vR,kibas=Math.abs(vel)>.45&&Math.sign(vel)==-d;
   if(ada&&(Math.abs(dx)>w*.22||kibas))tuntas(Math.round(Math.max(150,Math.min(280,(w-Math.abs(dx))/Math.max(.6,Math.abs(vel))))));
   else batal(260)},ops(true));
  V.addEventListener('touchcancel',()=>{if(sx!==null){sx=null;if(lk=='h')batal(200)}},ops(true))}
 hdr();catat();
 /* Catat ayat paling atas yang sedang dibaca (untuk Riwayat & Lanjutkan) */
 let qt=0;const vw=$('#view');vw.addEventListener('scroll',function f(){if(window.QR!==R||!$('#ay'))return vw.removeEventListener('scroll',f);clearTimeout(qt);qt=setTimeout(()=>{if(!R.A||window.QR!==R)return;(S.qpos=S.qpos||{})[R.n]=atas();save()},400)},{passive:true});
 qGet(n).then(A=>{R.A=window.QAYAT=A;R.siapkan&&R.siapkan();if(sc)R.p=Math.floor((sc-1)/QPER);draw();R.siapPeek();if(sc)requestAnimationFrame(()=>{ke(sc);ayTuju(sc)})}).catch(()=>{el.innerHTML='<div class="card">Surah ini belum tersimpan di perangkat dan internet tidak tersedia. Sambungkan internet sekali, atau unduh semua dari menu Al-Qur\'an.</div>';$('#snav').innerHTML=''})}
/* Panah kiri/kanan di keyboard untuk halaman/surah sebelumnya/berikutnya */
addEventListener('keydown',e=>{if(!window.QR||!$('#ay')||e.target.closest('input,textarea')||e.altKey||e.ctrlKey||e.metaKey)return;const g=QR.geser||QR.go;if(e.key=='ArrowRight')g(1);else if(e.key=='ArrowLeft')g(-1)});
/* Mode baca Kartu | Mushaf untuk Tahlil, Maulid, Wirid & Doa (seperti Al-Qur'an). Mushaf: teks Arab tiap bagian (.ay2) disambung
   jadi satu paragraf dengan nomor bulat; terjemah & Latin disembunyikan. Disimpan di S.mbaca, terpisah dari mode mushaf Al-Qur'an (S.full). */
const mbacaUI=()=>`<div class="mseg" role="group" aria-label="Mode baca"><button type="button" data-mb="0" aria-label="Mode kartu" class="${S.mbaca=='mushaf'?'':'on'}">${ic('cards',16)}<span>Kartu</span></button><button type="button" data-mb="1" aria-label="Mode mushaf" class="${S.mbaca=='mushaf'?'on':''}">${ic('book',16)}<span>Mushaf</span></button></div>`;
function mbacaSet(on){S.mbaca=on?'mushaf':'kartu';save();$$('[data-mb]').forEach(b=>b.classList.toggle('on',(b.dataset.mb=='1')==on));mushafBaca()}
function mushafBaca(){const v=$('#view');if(!v||$('#ay'))return;const on=S.mbaca=='mushaf'&&!!$('#view > .bar.lekat');
 if(!on){$$('.mushaf.mbc',v).forEach(m=>m.remove());$$('.ay2.mbh',v).forEach(a=>a.classList.remove('mbh'));return}
 new Set($$('.ay2:not(.mbh)',v).map(a=>a.parentElement)).forEach(par=>{let run=[];const tutup=()=>{if(!run.length)return;const m=document.createElement('div');m.className='mushaf mbc';m.style.fontSize=S.fs+'px';
   m.innerHTML=run.map((a,i)=>{const t=$('.ar,.ar2',a),n=$('.n',a);return `<span class="ayt">${t?esc(t.textContent.trim()):''}<span class="mk">${(+(n&&n.textContent)||i+1).toLocaleString('ar-EG')}</span></span>`}).join(' ');
   run[0].before(m);run.forEach(a=>a.classList.add('mbh'));run=[]};
  [...par.children].forEach(c=>{if(c.classList.contains('ay2')&&!c.classList.contains('mbh'))run.push(c);else tutup()});tutup()})}
/* Pilihan Kartu | Mushaf hanya muncul di halaman yang memang punya bagian ayat/bait (.ay2), mis. Tahlil, Yasin, Maulid.
   Halaman tanpa itu (Asmaul Husna, doa tunggal, dll.) tidak menampilkannya karena tidak ada efeknya. */
function mbacaCek(){const h=$('#view > .bar.lekat');if(!h)return;const ada=!!$('#view .ay2'),m=$('.mseg',h);
 if(ada&&!m){$('[data-rs]',h).insertAdjacentHTML('beforebegin',mbacaUI());$$('[data-mb]',h).forEach(b=>b.onclick=()=>mbacaSet(b.dataset.mb=='1'))}else if(!ada&&m)m.remove();
 if(ada)mushafBaca()}
/* Isi yang dimuat belakangan (mis. tab Yasin) ikut diperiksa: pilihan muncul/hilang dan dijadikan mushaf bila perlu */
{let mt=0;new MutationObserver(()=>{clearTimeout(mt);mt=setTimeout(()=>{const h=$('#view > .bar.lekat');if(!h)return;if(!!$('#view .ay2')!=!!$('.mseg',h)||(S.mbaca=='mushaf'&&$('#view .ay2:not(.mbh)')))mbacaCek()},30)}).observe($('#view'),{childList:true,subtree:true})}
/* Lembar "Pengaturan baca" bersama (Al-Qur'an, Tahlil, Maulid, Wirid & Doa); tata letaknya sama dengan Pengaturan kitab */
function qsheet(cb){const e=document.createElement('div'),qr=!!$('#ay'),jd=($('#view h1')||{}).textContent||'';e.className='back-d';
 const sl=(id,lb,min,max,v)=>`<div class="srw ksl"><span class="t">${lb}</span><input type="range" id="${id}" min="${min}" max="${max}" value="${v}" aria-label="${lb}"><b data-for="${id}">${v}</b></div>`;
 e.innerHTML=`<div class="sheet ksh" role="dialog" aria-label="Pengaturan baca">
<div class="ksh-h"><span class="si">${ic('sliders',20)}</span><div><b>${qr?"Pengaturan Al-Qur'an":'Pengaturan baca'}</b><small class="mut">${esc(jd)}</small></div><button type="button" class="ksh-x" id="s4" aria-label="Tutup">×</button></div>
<div class="ksh-b">
<div class="qpv"><span class="qpa" id="qpa">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span><small class="qpl" id="qpl">Bismillaahir Rahmaanir Raheem</small><small class="qpt" id="qpt">Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang</small></div>
<div class="ksh-l">Tema aplikasi</div>${seg('sth',[['auto','Perangkat'],['light','Terang'],['dark','Gelap'],['blue','Biru']],S.theme||'auto')}
${qr||$('#view .ay2')?`<div class="ksh-l">Mode baca</div>${seg('smd',[['0','Kartu'],['1','Mushaf']],(qr?S.full:S.mbaca=='mushaf')?'1':'0')}`:''}
${qr&&window.QR?`<div class="ksh-l">Audio surah ini</div><div class="qsdl"><span class="mut">Simpan murattal ${esc(NAMA[QR.n-1])} agar bisa diputar tanpa internet</span>${dlW('audio:'+QR.n)}</div>`:''}
<div class="ksh-l">Tampilkan</div>
<p class="mut ksh-mn">Mode Mushaf hanya menampilkan teks Arab bersambung. Latin dan terjemah tampil saat ayat diketuk, atau pilih mode Kartu.</p>
<div class="list sg ksh-c ksh-mt">${row('search','Teks Latin','Transliterasi di bawah teks Arab',tg('s5',S.lt))}${row('news','Terjemah','Arti dalam bahasa Indonesia',tg('s1',S.tr))}</div>
<div class="ksh-l">Ukuran huruf</div>
<div class="list sg ksh-c">${sl('s2','Arab',22,52,S.fs)}<div class="ksh-mt">${sl('s6','Latin',12,26,S.fl||15)}${sl('s7','Terjemah',12,26,S.fi||14)}</div></div>
<div class="ksh-l">Warna teks</div><div class="ksh-c kpad">${wteksUI()}</div>
<div class="ksh-l">Jenis huruf Arab</div>${fontUI('af',FAR,'بِسْمِ اللّٰهِ')}
<div class="ksh-l">Jenis huruf Latin & Indonesia</div>${fontUI('lf',FLT,'Abc Fadzkuruuni')}
<div class="ksh-l">Warna aksen</div><div class="ksh-c kpad"><div class="wtk acw" id="acw">${Object.entries(ACC).map(([v,a])=>`<button type="button" data-v="${v}" class="${v==(S.ac||'hitam')?'on':''}" style="--c:${a[1]}" aria-label="${a[0]}"><i>${ic('check',16)}</i><small>${a[0]}</small></button>`).join('')}</div></div>
</div></div>`;document.body.append(e);
 e.onclick=x=>{if(x.target==e||x.target.closest('#s4')){e.remove();typeof cb=='function'&&cb()}};
 $('#s1',e).onchange=x=>{S.tr=x.target.checked;save();setSz()};$('#s5',e).onchange=x=>{S.lt=x.target.checked;save();setSz()};
 $('#s6',e).oninput=x=>{S.fl=+x.target.value;save();setSz()};$('#s7',e).oninput=x=>{S.fi=+x.target.value;save();setSz()};
 $('#s2',e).oninput=x=>{S.fs=+x.target.value;save();$$('#view .ay .ar,#view .ay2 .ar,#view .ar2,#view .mushaf').forEach(a=>a.style.fontSize=S.fs+'px');$$('#view .bsm').forEach(a=>a.style.fontSize=Math.round(S.fs*.85)+'px')};
 /* Latin & terjemah dinonaktifkan di mode Mushaf, dan di halaman yang memang tidak punya teks Latin/terjemah (mis. Asmaul Husna) */
 const tanpa=!qr&&!$('#view .lt,#view .tr,#view .kt-lt,#view .kt-id');
 const msf=()=>{const on=tanpa||(qr?!!S.full:S.mbaca=='mushaf');e.querySelector('.sheet').classList.toggle('msf',on);$$('.ksh-mt input',e).forEach(i=>i.disabled=on);const n=$('.ksh-mn',e);if(n)n.textContent=tanpa?'Halaman ini tidak memiliki teks Latin dan terjemah, jadi pengaturannya tidak dipakai di sini.':'Mode Mushaf hanya menampilkan teks Arab bersambung. Latin dan terjemah tampil saat ayat diketuk, atau pilih mode Kartu.'};msf();
 if($('#smd',e))segBind('smd',v=>{window.QR&&qr?QR.mode(v=='1'):mbacaSet(v=='1');msf()});
 segBind('sth',v=>{S.theme=v;save();theme()});wteksBind();fontBind('af',FAR);fontBind('lf',FLT);segBind('acw',v=>{S.ac=v;save();accent()});
 /* Pratinjau dan angka di samping penggeser ikut berubah */
 const prv=()=>{$('#qpa',e).style.fontSize=S.fs+'px';$('#qpl',e).style.fontSize=(S.fl||15)+'px';$('#qpt',e).style.fontSize=(S.fi||14)+'px';$$('[data-for]',e).forEach(b=>b.textContent=$('#'+b.dataset.for,e).value)};prv();e.addEventListener('input',prv);e.addEventListener('click',()=>setTimeout(prv))}
P.bookmark=()=>({html:head('Penanda ayat')+`<p class="mut">Penanda menyimpan ayat yang ingin kamu baca lagi. Ketuk ikon bintang pada sebuah ayat saat membaca, lalu temukan semuanya di sini.</p><div id="bl"></div>`,
 init(){const B=S.bm||[],el=$('#bl');if(!B.length){el.innerHTML='<div class="card mut">Belum ada penanda. Buka sebuah surah, lalu ketuk ikon bintang pada ayat.</div>';return}
  el.innerHTML=list(B,k=>{const [n,a]=k.split(':');return `<div class="row"><a class="t" href="#/quran/${n}/${a}" style="flex:1;min-width:0"><b>${NAMA[n-1]}</b> · ayat ${a}<br><small data-s="${k}">${ARTI[n-1]}</small></a><button class="btn s" data-x="${k}">Hapus</button></div>`});
  B.forEach(k=>{const [n,a]=k.split(':');qGet(+n).then(A=>{const e=$(`[data-s="${k}"]`);if(e&&A[a-1])e.textContent=A[a-1].t.slice(0,90)+'…'}).catch(()=>{})});
  el.onclick=e=>{const b=e.target.closest('[data-x]');if(b){S.bm=S.bm.filter(x=>x!=b.dataset.x);save();route()}}}});
/* Bismillah dipisah dari ayat pertama (kecuali Al-Fatihah, yang memang ayat 1) dan ditampilkan sebagai judul */
const bsmSplit=(A,n)=>{const w=A.map(x=>x.a);let b='';if(n!=1&&w[0].startsWith('بِسْمِ')){w[0]=w[0].split(' ').slice(4).join(' ');b=`<div class="bsm" style="font-size:${Math.round(S.fs*.85)}px">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`}return {b,w}};
/* Menu ayat: tandai, putar dari ayat ini, salin (Arab + terjemah + rujukan), bagikan */
function ayMenu(n,k){const x=window.QR&&QR.A&&QR.A[k-1];if(!x)return;const key=n+':'+k,ditandai=()=>(S.bm||[]).includes(key),teks=`${x.a}\n\n${x.t}\n\n(QS. ${NAMA[n-1]} [${n}]: ${k})`;
 const e=document.createElement('div');e.className='back-d';e.innerHTML=`<div class="sheet am" role="dialog" aria-label="Menu ayat ${k}"><div class="am-h"><b>${NAMA[n-1]} · ayat ${k}</b><button class="ib2" data-x aria-label="Tutup">×</button></div><div class="am-ar">${x.a}</div>${S.full?`${S.lt&&x.l?`<p class="lt am-lt">${x.l}</p>`:''}${S.tr!==false?`<p class="mut tr am-tr">${x.t}</p>`:''}`:''}<div class="am-l"><button data-am="bm">${ic('star',20)}<span>${ditandai()?'Hapus tanda ayat':'Tandai ayat'}</span></button><button data-am="tb">${ic('book',20)}<span>${S.tbaca&&S.tbaca.n==n&&S.tbaca.a==k?'Sudah ditandai terakhir dibaca':'Tandai sebagai terakhir dibaca'}</span></button><button data-am="play">${ic('play',20)}<span>Putar ayat ini saja</span></button><button data-am="dari">${ic('play',20)}<span>Putar dari ayat ini sampai akhir surah</span></button><button data-am="terus">${ic('play',20)}<span>Putar terus sampai surah…</span></button><button data-am="share">${ic('share',20)}<span>Bagikan</span></button></div></div>`;document.body.append(e);
 const salin=()=>(navigator.clipboard?navigator.clipboard.writeText(teks):Promise.reject()).then(()=>toast('Ayat disalin'),()=>toast('Tidak bisa menyalin di perangkat ini'));
 e.onclick=ev=>{if(ev.target==e||ev.target.closest('[data-x]'))return e.remove();const b=ev.target.closest('[data-am]');if(!b)return;const a=b.dataset.am;e.remove();
  if(a=='bm'){S.bm=S.bm||[];const i=S.bm.indexOf(key);i<0?S.bm.unshift(key):S.bm.splice(i,1);save();$$(`[data-bm="${key}"]`).forEach(s=>s.classList.toggle('on',i<0));toast(i<0?'Ayat ditandai':'Penanda dihapus')}
  else if(a=='play')window.QR&&QR.satu(k);
  else if(a=='dari')window.QR&&QR.dari(k);
  else if(a=='terus')pmTerusLembar(n,k);
  else if(a=='tb'){S.tbaca={n,a:k,t:Date.now()};save();toast(`${NAMA[n-1]} ayat ${k} ditandai sebagai terakhir dibaca`)}
  else if(a=='copy')salin();
  else if(a=='share'){window.ANDROID?andPanggil('bagikan',teks):navigator.share?navigator.share({text:teks}).catch(()=>{}):salin()}}}
/* Gambar ayat. Mode mushaf: semua ayat bersambung (bismillah di luar blok bergaris). Mode kartu: halaman p (QPER ayat); p null = semua. */
const drawAy=(el,A,n,p)=>{const {b,w}=bsmSplit(A,n);if(S.full){el.innerHTML=`${b}<div class="mushaf" style="font-size:${S.fs}px">${w.map((t,i)=>`<span class="ayt" id="a${i+1}">${t}<span class="mk">${(i+1).toLocaleString('ar-EG')}</span></span>`).join(' ')}</div>`;return}
 const s=(p||0)*QPER,e=p==null?A.length:s+QPER;el.innerHTML=(s?'':b)+A.slice(s,e).map((x,j)=>{const i=s+j;return `<div class="ay" id="a${i+1}"><div class="ah"><span class="n">${i+1}</span><button class="bm ${(S.bm||[]).includes(n+':'+(i+1))?'on':''}" data-bm="${n}:${i+1}" aria-label="Penanda ayat">${ic('star',18)}</button></div><div class="ar" style="font-size:${S.fs}px">${w[i]}</div><p class="lt">${x.l}</p><p class="mut tr" style="margin:6px 0 0">${x.t}</p></div>`}).join('')};

/* Lembar "Putar terus sampai…": dari ayat ini terus lintas surah sampai akhir surah pilihan, akhir juz, atau akhir Al-Qur'an */
function pmTerusLembar(n,k){const juzKe=()=>{if(typeof JUZ=='undefined')return 0;let j=0;JUZ.forEach((x,i)=>{if(x[0]<n||(x[0]==n&&x[1]<=k))j=i});return j};
 const ji=juzKe(),akhirJuz=ji+1<JUZ.length?(()=>{const [sn,sa]=JUZ[ji+1];return sa>1?{n:sn,a:sa-1}:{n:sn-1,a:AYAT[sn-2]}})():{n:114,a:6};
 const pil=S.pmAkhir&&S.pmAkhir>=n?S.pmAkhir:Math.min(114,n+1);
 const e=document.createElement('div');e.className='back-d';e.innerHTML=`<div class="sheet pmlb" role="dialog" aria-label="Putar terus"><b>Putar terus dari ${esc(NAMA[n-1])} ayat ${k}</b><p class="mut">Murottal berlanjut otomatis ke surah berikutnya, tetap berbunyi walau layar mati atau aplikasi ditutup ke latar.</p>
  <div class="pmc"><button class="sb" data-pma="${n+1<=114?n+1:114}">Sampai surah berikutnya</button><button class="sb" data-pmj>Sampai akhir juz ${ji+1}</button><button class="sb" data-pma="114">Sampai akhir Al-Qur'an</button></div>
  <label class="pml">Atau pilih sampai surah<select class="in" id="pmsel">${NAMA.map((x,i)=>i+1>=n?`<option value="${i+1}"${i+1==pil?' selected':''}>${i+1}. ${esc(x)}</option>`:'').join('')}</select></label>
  <div class="act"><button class="btn s" data-x style="flex:1">Batal</button><button class="btn" data-pmy style="flex:1">${ic('play',16)} Putar</button></div></div>`;
 document.body.append(e);const mulai=akhir=>{e.remove();S.pmAkhir=akhir.n;save();pmQuran(n,k,{akhir});toast('Diputar sampai '+NAMA[akhir.n-1]+(akhir.a!=AYAT[akhir.n-1]?' ayat '+akhir.a:''))};
 e.onclick=x=>{if(x.target==e||x.target.closest('[data-x]'))return e.remove();const a=x.target.closest('[data-pma]');if(a){const m=+a.dataset.pma;return mulai({n:m,a:AYAT[m-1]})}
  if(x.target.closest('[data-pmj]'))return mulai(akhirJuz);if(x.target.closest('[data-pmy]')){const m=+$('#pmsel').value;mulai({n:m,a:AYAT[m-1]})}}}
