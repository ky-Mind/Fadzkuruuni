/* js/pages/quran.js - Al-Qur'an: daftar surah, pembaca, mushaf layar penuh, pemutar, penanda ayat */
/* Surah Madaniyah (urutan mushaf); selain itu Makkiyah */
const MADANI=new Set([2,3,4,5,8,9,13,22,24,33,47,48,49,55,57,58,59,60,61,62,63,64,65,66,76,98,99,110]);
const jn=n=>`<span class="jn">${MADANI.has(n)?'Madaniyah':'Makkiyah'}</span>`;
/* Kartu progres di tab Riwayat: surah terakhir dibaca dan jumlah surah yang sudah pernah dibuka */
const KH=()=>{const h=S.hist||[];if(!h.length)return '';const k=new Set(S.dibuka||[]).size,p=Math.round(k/114*100);return `<div class="card kh"><small class="mut">Terakhir dibaca</small><div class="kh-r"><b>${NAMA[h[0]-1]}</b><a class="btn s" href="#/quran/${h[0]}">Lanjutkan</a></div><div class="pb"><i style="width:${p}%"></i></div><small class="mut">${k} dari 114 surah sudah dibuka (${p}%)</small></div>`};
P.quran=()=>({html:`<div class="bar"><a class="bk" href="#/">${ic('back',22)}</a><h1>Al-Quran</h1><button class="btn s" onclick="$('#q').focus()">${ic('search',16)} Cari</button></div><input class="in" id="q" type="search" placeholder="Cari surah…">${tabs([`${ic('book',16)} Surah`,`${ic('news',16)} Juz`,`${ic('clock',16)} Riwayat`])}<div id="ql"></div>`,
 init(){let tab=0;const draw=()=>{const q=$('#q').value.toLowerCase();let a=NAMA.map((n,i)=>i+1);if(tab==2)a=S.hist;else if(q)a=a.filter(i=>(NAMA[i-1]+i).toLowerCase().includes(q));
  $('#ql').innerHTML=(tab==2?KH():'')+(tab==1?list(JUZ,(j,i)=>`<a class="row" href="#/quran/${j[0]}/${j[1]}"><span class="num">${i+1}</span><span class="t">Juz ${i+1}<br><small>${NAMA[j[0]-1]} : ${j[1]}</small></span></a>`):a.length?list(a,i=>`<a class="row" href="#/quran/${i}"><span class="num">${i}</span><span class="t">${NAMA[i-1]}${jn(i)}<br><small>${ARTI[i-1]} (${AYAT[i-1]} Ayat)</small></span></a>`):'<div class="card mut">Belum ada riwayat.</div>');};
  $$('[data-tab]').forEach(b=>b.onclick=()=>{tab=+b.dataset.tab;$$('[data-tab]').forEach(x=>x.classList.toggle('on',x==b));draw()});$('#q').oninput=draw;draw();
  }});
/* Audio per ayat (Syaikh Mishary Alafasy, everyayah.com) agar bisa disimpan untuk offline; tiap surah satu paket unduhan.
   Selain Al-Fatihah dan At-Taubah diawali bismillah (berkas 001001). */
const qAud=(n,a)=>`https://everyayah.com/data/Alafasy_128kbps/${String(n).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`;
const qAudList=n=>[...(n!=1&&n!=9?[qAud(1,1)]:[]),...Array.from({length:AYAT[n-1]},(_,i)=>qAud(n,i+1))];
NAMA.forEach((_,i)=>paket('audio:'+(i+1),{judul:'Audio '+NAMA[i],kat:'audio',selesai:'siap diputar tanpa internet',urls:async()=>qAudList(i+1)}));
/* Pembaca surah. Mode kartu dibagi per halaman (QPER ayat) dan bisa digeser ke samping; mode mushaf satu halaman penuh bergaris.
   Pindah halaman, surah, atau mode dilakukan di tempat (tanpa memuat ulang) dengan animasi geser, dan posisi ayat dipertahankan. */
const QPER=12;
const surah=(n,sc)=>{n=+n;if(!NAMA[n-1])return P.quran();return {html:`<div class="rh"><a class="bk" href="#/quran" aria-label="Daftar surah">${ic('back',22)}</a><div class="rt"><b id="qt"></b><small id="qa"></small></div><div class="mseg" role="group" aria-label="Mode baca"><button type="button" data-md="0" aria-label="Mode kartu: ayat per kartu dengan terjemah">${ic('cards',16)}<span>Kartu</span></button><button type="button" data-md="1" aria-label="Mode mushaf: teks Arab bersambung">${ic('book',16)}<span>Mushaf</span></button></div><button class="ib" id="qs" aria-label="Pengaturan baca">${ic('sliders',20)}</button></div><audio id="au" preload="none"></audio><div class="pl"><button class="ib" id="pp" aria-label="Putar audio">${ic('play',20)}</button><div class="pb"><i id="pg"></i></div><span id="qdl"></span></div><div id="ay"><p class="mut">Memuat…</p></div><div class="snav" id="snav"></div>`,
 init(){qReader(n,+sc||0)}}};
function qReader(n,sc){const el=$('#ay'),R={n,A:null,p:0,busy:0};window.QR=R;$('#qs').onclick=qsheet;
 const pages=()=>S.full?1:Math.ceil(R.A.length/QPER);
 const segOn=()=>$$('.mseg button').forEach(b=>b.classList.toggle('on',(b.dataset.md=='1')==!!S.full));
 /* Pemutar: memutar ayat satu per satu dan menyorot ayat yang sedang dibaca */
 const au=$('#au'),pl={n:0,i:0,L:[]};
 const tandai=()=>{$$('#ay .qplay').forEach(x=>x.classList.remove('qplay'));if(!pl.L.length||pl.n!=R.n)return;const k=pl.i-(pl.L.length-AYAT[pl.n-1]);const t=k>=0&&$('#a'+(k+1));t&&t.classList.add('qplay')};
 const putar=i=>{pl.i=i;au.src=pl.L[i];au.play().catch(()=>{});tandai()};
 const henti=()=>{au.pause();au.removeAttribute('src');pl.L=[];pl.i=0;$('#pg').style.width='0';tandai()};
 R.dari=k=>{pl.n=R.n;pl.L=qAudList(R.n);putar(k-1+(pl.L.length-AYAT[R.n-1]))};
 $('#pp').onclick=()=>{if(pl.n!=R.n||!pl.L.length){pl.n=R.n;pl.L=qAudList(R.n);putar(0)}else au.paused?au.play().catch(()=>{}):au.pause()};
 au.onplay=()=>$('#pp').innerHTML=ic('pause',20);au.onpause=()=>$('#pp').innerHTML=ic('play',20);
 au.onended=()=>{pl.i+1<pl.L.length?putar(pl.i+1):henti()};
 au.onerror=()=>{if(!pl.L.length||!au.getAttribute('src'))return;if(navigator.onLine===false&&pl.i+1<pl.L.length)return putar(pl.i+1);toast('Audio ayat ini belum tersimpan dan internet tidak tersedia');henti()};
 au.ontimeupdate=()=>{if(pl.L.length)$('#pg').style.width=((pl.i+(au.currentTime/au.duration||0))/pl.L.length*100)+'%'};
 const hdr=()=>{$('#qt').textContent=R.n+'. '+NAMA[R.n-1];$('#qa').textContent=ARTI[R.n-1]+' · '+AYAT[R.n-1]+' ayat';segOn();henti();$('#qdl').innerHTML=dlW('audio:'+R.n)};
 const nav=()=>{const np=pages(),first=R.p<=0,last=R.p>=np-1,lbl=S.full||np<2?'':`Ayat ${R.p*QPER+1}–${Math.min(R.A.length,(R.p+1)*QPER)} dari ${R.A.length}`;
  $('#snav').innerHTML=`<button class="btn s" data-qn="-1" ${first&&R.n<=1?'disabled':''}>‹ ${first?'Surah sebelumnya':'Sebelumnya'}</button>${lbl?`<small class="mut">${lbl}</small>`:''}<button class="btn" data-qn="1" ${last&&R.n>=114?'disabled':''}>${last?'Surah berikutnya':'Berikutnya'} ›</button>`};
 const draw=()=>{drawAy(el,R.A,R.n,S.full?null:R.p);nav();tandai()};
 const catat=()=>{S.hist=[R.n,...S.hist.filter(x=>x!=R.n)].slice(0,20);S.dibuka=[...new Set([...(S.dibuka||[]),R.n])];save()};
 /* Ayat yang sedang terlihat paling atas (di bawah header), untuk mempertahankan posisi saat ganti mode */
 const atas=()=>{const y=$('.rh').getBoundingClientRect().bottom;const t=$$('#ay [id^="a"]').find(x=>x.getBoundingClientRect().bottom>y+8);return t?+t.id.slice(1):1};
 const ke=(k,smooth)=>{const t=$('#a'+k);if(t&&k>1)t.scrollIntoView({block:'start',behavior:smooth?'smooth':'auto'});else $('#view').scrollTo({top:0})};
 const slide=(d,fn)=>new Promise(res=>{el.classList.remove('sl-in-l','sl-in-r');el.classList.add(d>0?'sl-out-l':'sl-out-r');setTimeout(()=>{fn();$('#view').scrollTo({top:0});el.classList.remove('sl-out-l','sl-out-r');void el.offsetWidth;el.classList.add(d>0?'sl-in-r':'sl-in-l');res()},170)});
 /* d = 1 (berikutnya) atau -1: pindah halaman kartu dulu, lalu pindah surah di tempat */
 R.go=async d=>{if(R.busy||!R.A)return;const np=pages();
  if(!S.full&&R.p+d>=0&&R.p+d<np){R.busy=1;await slide(d,()=>{R.p+=d;draw()});R.busy=0;return}
  const m=R.n+d;if(m<1||m>114)return;R.busy=1;let A;try{A=await qGet(m)}catch(e){R.busy=0;return toast('Surah ini belum tersimpan dan internet tidak tersedia')}
  await slide(d,()=>{R.n=m;R.A=window.QA=A;R.p=d<0&&!S.full?Math.ceil(A.length/QPER)-1:0;hdr();draw();history.replaceState(null,'','#/quran/'+m);route.cur=location.hash;RIW[RIW.length-1]=location.hash;catat()});R.busy=0};
 R.mode=full=>{full=!!full;if(!!S.full==full||!R.A)return;const k=atas();S.full=full;save();document.body.classList.toggle('full',full);R.p=Math.floor((k-1)/QPER);segOn();draw();ke(k)};
 $$('.mseg button').forEach(b=>b.onclick=()=>R.mode(b.dataset.md=='1'));
 /* Ketuk kartu ayat (atau ayat di mode mushaf) untuk membuka menu ayat; tombol bintang tetap langsung menandai */
 el.onclick=e=>{if(e.target.closest('button,a')||String(getSelection()).trim())return;const t=e.target.closest('.ay,.ayt');if(t)ayMenu(R.n,+t.id.slice(1))};
 $('#snav').onclick=e=>{const b=e.target.closest('[data-qn]');if(b&&!b.disabled)R.go(+b.dataset.qn)};
 /* Geser ke samping: isi ikut bergeser mengikuti jari, lalu pindah halaman/surah saat dilepas */
 let sx=0,sy=0,hz=0;el.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;hz=0;el.style.transition='none'},{passive:true});
 el.addEventListener('touchmove',e=>{const dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;if(!hz&&Math.abs(dx)>12)hz=Math.abs(dx)>Math.abs(dy)*1.3?1:-1;if(hz==1)el.style.transform=`translateX(${dx*.35}px)`},{passive:true});
 el.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;el.style.transition='transform .2s ease';el.style.transform='';if(hz==1&&Math.abs(dx)>60)R.go(dx<0?1:-1)},{passive:true});
 hdr();catat();
 qGet(n).then(A=>{R.A=window.QA=A;if(sc)R.p=Math.floor((sc-1)/QPER);draw();if(sc)requestAnimationFrame(()=>ke(sc))}).catch(()=>{el.innerHTML='<div class="card">Surah ini belum tersimpan di perangkat dan internet tidak tersedia. Sambungkan internet sekali, atau unduh semua dari menu Al-Qur\'an.</div>';$('#snav').innerHTML=''})}
/* Panah kiri/kanan di keyboard untuk halaman/surah sebelumnya/berikutnya */
addEventListener('keydown',e=>{if(!window.QR||!$('#ay')||e.target.closest('input,textarea')||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key=='ArrowRight')QR.go(1);else if(e.key=='ArrowLeft')QR.go(-1)});
function qsheet(cb){const e=document.createElement('div');e.className='back-d';e.innerHTML=`<div class="sheet" role="dialog" aria-label="Pengaturan baca"><b>${$('#ay')?"Pengaturan Al-Qur'an":'Pengaturan baca'}</b><div class="sw">Tema</div><div class="rcs r4" id="sth">${[['auto','Perangkat'],['light','Terang'],['dark','Gelap'],['blue','Biru']].map(x=>`<button type="button" data-v="${x[0]}" class="${x[0]==(S.theme||'auto')?'on':''}">${x[1]}</button>`).join('')}</div><div class="sw">Tampilkan terjemah<input type="checkbox" id="s1" ${S.tr?'checked':''}></div><div class="sw">Tampilkan Latin<input type="checkbox" id="s5" ${S.lt?'checked':''}></div><div class="sw">Ukuran huruf Arab<input type="range" id="s2" min="22" max="52" value="${S.fs}"></div><div class="sw">Ukuran huruf Latin<input type="range" id="s6" min="12" max="26" value="${S.fl||15}"></div><div class="sw">Ukuran terjemah<input type="range" id="s7" min="12" max="26" value="${S.fi||14}"></div><div class="sw">Jenis huruf Arab</div><div class="rcs" id="sf">${[['times','Times'],['amiri','Amiri'],['scheh','Scheherazade']].map(x=>`<button type="button" data-v="${x[0]}" class="${x[0]==(S.af||'times')?'on':''}">${x[1]}</button>`).join('')}</div><div class="sw">Warna aksen</div><div class="rcs" id="sc">${[['emerald','Hijau'],['teal','Teal'],['blue','Biru']].map(x=>`<button type="button" data-v="${x[0]}" class="${x[0]==(S.ac||'emerald')?'on':''}">${x[1]}</button>`).join('')}</div><div class="sw">Mode layar penuh<input type="checkbox" id="s3" ${S.full?'checked':''}></div><div class="qpv"><span class="qpa" id="qpa">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span><small class="mut" id="qpl">Bismillaahir Rahmaanir Raheem</small></div><button class="btn" id="s4" style="width:100%;margin-top:10px">Selesai</button></div>`;document.body.append(e);
 e.onclick=x=>{if(x.target==e||x.target.id=='s4'){e.remove();cb&&cb()}};$('#s1',e).onchange=x=>{S.tr=x.target.checked;save();$$('.ay .tr').forEach(p=>p.hidden=!S.tr)};$('#s5',e).onchange=x=>{S.lt=x.target.checked;save();$$('.ay .lt').forEach(p=>p.hidden=!S.lt)};$('#s6',e).oninput=x=>{S.fl=+x.target.value;save();setSz()};$('#s7',e).oninput=x=>{S.fi=+x.target.value;save();setSz()};$('#s2',e).oninput=x=>{S.fs=+x.target.value;save();$$('#view .ay .ar,#view .ay2 .ar,#view .ar2,#view .mushaf').forEach(a=>a.style.fontSize=S.fs+'px')};$('#s3',e).onchange=x=>window.QR&&$('#ay')?QR.mode(x.target.checked):fsSet(x.target.checked);segBind('sth',v=>{S.theme=v;save();theme()});segBind('sf',v=>{S.af=v;save();accent()});segBind('sc',v=>{S.ac=v;save();accent()});
 /* Pratinjau ikut berubah saat slider, pilihan font, atau warna diubah */
 const prv=()=>{$('#qpa',e).style.fontSize=S.fs+'px';$('#qpl',e).style.fontSize=(S.fl||15)+'px'};prv();e.addEventListener('input',prv);e.addEventListener('click',()=>setTimeout(prv))}
P.bookmark=()=>({html:head('Penanda ayat')+`<p class="mut">Penanda menyimpan ayat yang ingin kamu baca lagi. Ketuk ikon bintang pada sebuah ayat saat membaca, lalu temukan semuanya di sini.</p><div id="bl"></div>`,
 init(){const B=S.bm||[],el=$('#bl');if(!B.length){el.innerHTML='<div class="card mut">Belum ada penanda. Buka sebuah surah, lalu ketuk ikon bintang pada ayat.</div>';return}
  el.innerHTML=list(B,k=>{const [n,a]=k.split(':');return `<div class="row"><a class="t" href="#/quran/${n}/${a}" style="flex:1;min-width:0"><b>${NAMA[n-1]}</b> · ayat ${a}<br><small data-s="${k}">${ARTI[n-1]}</small></a><button class="btn s" data-x="${k}">Hapus</button></div>`});
  B.forEach(k=>{const [n,a]=k.split(':');qGet(+n).then(A=>{const e=$(`[data-s="${k}"]`);if(e&&A[a-1])e.textContent=A[a-1].t.slice(0,90)+'…'}).catch(()=>{})});
  el.onclick=e=>{const b=e.target.closest('[data-x]');if(b){S.bm=S.bm.filter(x=>x!=b.dataset.x);save();route()}}}});
/* Bismillah dipisah dari ayat pertama (kecuali Al-Fatihah, yang memang ayat 1) dan ditampilkan sebagai judul */
const bsmSplit=(A,n)=>{const w=A.map(x=>x.a);let b='';if(n!=1&&w[0].startsWith('بِسْمِ')){w[0]=w[0].split(' ').slice(4).join(' ');b='<div class="bsm">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>'}return {b,w}};
/* Menu ayat: tandai, putar dari ayat ini, salin (Arab + terjemah + rujukan), bagikan */
function ayMenu(n,k){const x=window.QR&&QR.A&&QR.A[k-1];if(!x)return;const key=n+':'+k,ditandai=()=>(S.bm||[]).includes(key),teks=`${x.a}\n\n${x.t}\n\n(QS. ${NAMA[n-1]} [${n}]: ${k})`;
 const e=document.createElement('div');e.className='back-d';e.innerHTML=`<div class="sheet am" role="dialog" aria-label="Menu ayat ${k}"><div class="am-h"><b>${NAMA[n-1]} · ayat ${k}</b><button class="ib2" data-x aria-label="Tutup">×</button></div><div class="am-ar">${x.a}</div><div class="am-l"><button data-am="bm">${ic('star',20)}<span>${ditandai()?'Hapus tanda ayat':'Tandai ayat'}</span></button><button data-am="play">${ic('play',20)}<span>Putar dari ayat ini</span></button><button data-am="share">${ic('share',20)}<span>Bagikan</span></button></div></div>`;document.body.append(e);
 const salin=()=>(navigator.clipboard?navigator.clipboard.writeText(teks):Promise.reject()).then(()=>toast('Ayat disalin'),()=>toast('Tidak bisa menyalin di perangkat ini'));
 e.onclick=ev=>{if(ev.target==e||ev.target.closest('[data-x]'))return e.remove();const b=ev.target.closest('[data-am]');if(!b)return;const a=b.dataset.am;e.remove();
  if(a=='bm'){S.bm=S.bm||[];const i=S.bm.indexOf(key);i<0?S.bm.unshift(key):S.bm.splice(i,1);save();$$(`[data-bm="${key}"]`).forEach(s=>s.classList.toggle('on',i<0));toast(i<0?'Ayat ditandai':'Penanda dihapus')}
  else if(a=='play')window.QR&&QR.dari(k);
  else if(a=='copy')salin();
  else if(a=='share'){navigator.share?navigator.share({text:teks}).catch(()=>{}):salin()}}}
/* Gambar ayat. Mode mushaf: semua ayat bersambung (bismillah di luar blok bergaris). Mode kartu: halaman p (QPER ayat); p null = semua. */
const drawAy=(el,A,n,p)=>{const {b,w}=bsmSplit(A,n);if(S.full){el.innerHTML=`${b}<div class="mushaf" style="font-size:${S.fs}px">${w.map((t,i)=>`<span class="ayt" id="a${i+1}">${t}<span class="mk">${(i+1).toLocaleString('ar-EG')}</span></span>`).join(' ')}</div>`;return}
 const s=(p||0)*QPER,e=p==null?A.length:s+QPER;el.innerHTML=(s?'':b)+A.slice(s,e).map((x,j)=>{const i=s+j;return `<div class="ay" id="a${i+1}"><div class="ah"><span class="n">${i+1}</span><button class="bm ${(S.bm||[]).includes(n+':'+(i+1))?'on':''}" data-bm="${n}:${i+1}" aria-label="Penanda ayat">${ic('star',18)}</button></div><div class="ar" style="font-size:${S.fs}px">${w[i]}</div><p class="lt" ${S.lt?'':'hidden'}>${x.l}</p><p class="mut tr" style="margin:6px 0 0" ${S.tr?'':'hidden'}>${x.t}</p></div>`}).join('')};
