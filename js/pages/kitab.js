/* js/pages/kitab.js - Kitab Kuning: daftar kitab (kitab/daftar.js) dan pembaca.
   Dua mode per juz: halaman gambar (juz.pola) untuk PDF seperti Al-Hawi, dan teks (juz.bab) untuk kitab yang ditempel sendiri.
   Kitab satu juz (tanpaJuz) langsung dibuka tanpa daftar juz; tombol unduhnya pindah ke bilah pembaca. */
/* Gambar halaman & PDF kitab (±180 MB) dilayani GitHub Pages dari repo yang sama, bukan Vercel, agar setiap deployment Vercel kecil.
   Saat uji lokal tetap dari folder sendiri. */
const KITAB_ASAL=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)?'':'https://ky-mind.github.io/Fadzkuruuni/';
/* Pembaca kitab yang sedang terbuka disimpan di window.KBACA (ke, cur, stabil, tampil). Jangan memakai nama KR: itu milik kelas online (js/pages/kelas.js). */
const padn=n=>String(n).padStart(2,'0'),pgUrl=(j,n)=>KITAB_ASAL+j.pola.replace('{n}',padn(n));
const kitabCss=h=>{if(!h||document.querySelector('link[data-kc="'+h+'"]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=h;l.dataset.kc=h;document.head.append(l)};
const kitabAmbil=async id=>{const d=KITAB_DAFTAR.find(x=>x.id==id);if(!d||!d.berkas)return null;if(!KITAB_ISI[id])await ldjs(d.berkas);const k=KITAB_ISI[id];if(k&&k.css)kitabCss(k.css);return k||null};
const tanpaJuz=k=>(k.juzTotal||k.juz.length)==1;
const kitabHub=()=>{const H=Object.entries(KITAB_KELOMPOK).map(([g,nm])=>{const L=KITAB_DAFTAR.filter(k=>k.kelompok==g&&!k.di);return L.length?`<div class="list">${L.map(k=>`<a class="row" href="${k.berkas?'#/kitab/'+k.id:'#/segera/'+encodeURIComponent(k.judul)}"><span class="si" style="width:46px;height:46px">${ic('lib',22)}</span><span class="t"><b>${k.judul}</b>${k.arab?`<br><span class="ar" style="font-size:18px">${k.arab}</span>`:''}<br><small>${k.ket||''}${k.berkas?(dlSudah('kitab:'+k.id)?' · Tersimpan offline':''):' · Segera hadir'}</small></span>${ic('next',18)}</a>`).join('')}</div>`:'<div class="card mut">Segera hadir.</div>'});return pisahBar('kitab',H[0],H[1])};
function kitabDetail(el,k){const kh=S.kh||{};el.innerHTML=`<div class="card" style="text-align:center">${k.arab?`<div class="ar2" style="text-align:center">${k.arab}</div>`:''}<b>${esc(k.judul)}</b><p class="mut" style="margin:4px 0 0">${esc(k.pengarang||'')}</p><p class="mut" style="margin:6px 0 0">${esc(k.ket||'')}</p></div>
<h2>Daftar juz</h2><div class="list">${Array.from({length:k.juzTotal||k.juz.length},(_,i)=>{const n=i+1,j=k.juz.find(x=>x.no==n);return j?`<a class="row" href="#/kitab/${k.id}/${n}"><span class="num">${n}</span><span class="t"><b>Juz ${n}</b><br><small>${j.pola?j.halaman+' halaman':(j.bab||[]).length+' bab'}${kh[k.id+'-'+n]?' · terakhir hal. '+kh[k.id+'-'+n]:''}</small></span>${ic('next',18)}</a>`:`<a class="row" href="#/segera/${encodeURIComponent(k.judul+' Juz '+n)}"><span class="num">${n}</span><span class="t"><b>Juz ${n}</b><br><small>Segera hadir</small></span>${ic('next',18)}</a>`}).join('')}</div>
<div class="card dlk" style="margin-top:12px"><b>Unduh kitab ini</b><p class="mut" style="margin:4px 0 8px">Simpan semua halaman agar bisa dibaca tanpa internet, atau simpan PDF-nya ke perangkat untuk dicetak.</p>${dlW('kitab:'+k.id)}</div>`}
/* Paket unduhan per kitab: semua halaman gambar (offline) dan PDF tiap juz (ke perangkat) */
KITAB_DAFTAR.filter(d=>d.berkas).forEach(d=>paket('kitab:'+d.id,{judul:d.judul,kat:'kitab',
 urls:async()=>{const k=await kitabAmbil(d.id),U=[d.berkas];k.juz.forEach(j=>{if(j.pola)for(let i=1;i<=j.halaman;i++)U.push(pgUrl(j,i))});return U},
 berkas:async()=>{const k=await kitabAmbil(d.id);return k.juz.filter(j=>j.pdf).map(j=>({url:KITAB_ASAL+j.pdf,nama:k.judul+(k.juz.length>1?' - Juz '+j.no:'')+'.pdf'}))}}));
/* Warna halaman: tema (malam saat tema gelap), asli, sepia, malam. Nilai lama S.kinv===false dibaca sebagai "asli". */
const kwarna=()=>S.kw||(S.kinv===false?'asli':'tema'),kwKls=()=>({tema:'inv',sepia:'sep',malam:'mlm'})[kwarna()]||'';
/* Layar penuh pembaca kitab: menyembunyikan menu dan tasbih melayang, dan memakai layar penuh peramban bila didukung.
   Saat halaman dibuka ulang (tanpa ketukan) hanya tampilannya yang dipulihkan, karena peramban menolak layar penuh tanpa ketukan. */
/* Cara membaca di layar penuh (berlaku untuk semua kitab): 'geser' = satu halaman per layar, geser kanan/kiri;
   'gulir' = semua halaman bersambung ke bawah seperti PDF */
const kGeser=()=>document.body.classList.contains('kfull')&&!document.body.classList.contains('kgulir');
function kitabMode(m){S.kmode=m;save();window.KBACA&&KBACA.stabil&&KBACA.stabil();const R=window.KBACA,n=R&&$('#kp')?R.cur():0;document.body.classList.toggle('kgulir',m=='gulir');$$('[data-kmd]').forEach(b=>b.classList.toggle('on',b.dataset.v==m));if(n)setTimeout(()=>R.ke(n),40)}
function kitabFull(on,pulih){S.kfull=on;save();window.KBACA&&KBACA.stabil&&KBACA.stabil();document.body.classList.toggle('kfull',on);document.body.classList.toggle('kgulir',S.kmode=='gulir');if(window.ANDROID)andPanggil('layarPenuh',!!on);const b=$('[data-kfs]');if(b)b.classList.toggle('on',on);const R=window.KBACA;if(R&&$('#kp')){const n=R.cur();setTimeout(()=>{R.ke(n);on&&R.tampil&&R.tampil()},40)}if(pulih)return;
 const de=document.documentElement,fe=document.fullscreenElement||document.webkitFullscreenElement;
 if(on&&!fe)(de.requestFullscreen||de.webkitRequestFullscreen||(()=>Promise.reject())).call(de).catch(()=>{});else if(!on&&fe)(document.exitFullscreen||document.webkitExitFullscreen).call(document).catch(()=>{})}
/* Keluar layar penuh lewat tombol Esc/kembali di perangkat: tampilan ikut kembali normal */
addEventListener('keydown',e=>{if(!document.body.classList.contains('kfull')||!window.KBACA||!$('#kp')||e.target.closest?.('input'))return;
 if(e.key=='ArrowLeft'||e.key=='ArrowRight'){e.preventDefault();KBACA.ke(KBACA.cur()+(e.key=='ArrowLeft'?1:-1))}else if(e.key=='Escape')kitabFull(false)});
addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('kfull'))kitabFull(false,1)});
/* Hasil pencarian bab kitab (data-kh="id|juz|halaman") membuka kitab langsung di halaman babnya */
let KITAB_KE=null;
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('[data-kh]');if(!a)return;const [id,j,n]=a.dataset.kh.split('|');KITAB_KE={key:id+'-'+j,n:+n}},true);
function kitabHalaman(el,k,j){let cur=0;const key=k.id+'-'+j.no,kkh=KITAB_KE&&KITAB_KE.key==key?KITAB_KE.n:0,last=kkh?Math.min(kkh,j.halaman):S.klj===false?1:Math.min((S.kh||{})[key]||1,j.halaman),jn=x=>k.juz.find(y=>y.no==x),z=()=>S.kz||100;KITAB_KE=null;
 el.innerHTML=`<div class="ktb"><div class="ktr"><div class="kzg"><button class="sb" data-kz="-15" aria-label="Perkecil">−</button><b id="kzv">${z()}%</b><button class="sb" data-kz="15" aria-label="Perbesar">+</button></div>
<form class="kgo" id="kgf" title="Ketik nomor halaman lalu Enter"><input class="in" id="kgo" type="number" inputmode="numeric" enterkeyhint="go" min="1" max="${j.halaman}" value="${last}" aria-label="Nomor halaman"><span class="mut">/ ${j.halaman}</span></form></div>
<div class="kpr"><i id="kpb" style="width:${last/j.halaman*100}%"></i></div></div>
<div class="kp ${kwKls()}" id="kp" style="--r:${k.rasio||.7606}"><div class="kpi">${Array.from({length:j.halaman},(_,i)=>`<img loading="lazy" decoding="async" data-p="${i+1}" src="${pgUrl(j,i+1)}" alt="Halaman ${i+1}" style="width:${z()}%" draggable="false">`).join('')}</div></div>
<div class="kfo" id="kfo"><button type="button" class="kfo-x" data-kfx aria-label="Keluar layar penuh">×</button><button type="button" class="kfo-x kfo-s" data-kfset aria-label="Pengaturan membaca">${ic('sliders',16)}</button><span id="kfp">${last} / ${j.halaman}</span></div>
${pnav(jn(j.no-1)&&[`#/kitab/${k.id}/${j.no-1}`,'Juz '+(j.no-1)],jn(j.no+1)&&[`#/kitab/${k.id}/${j.no+1}`,'Juz '+(j.no+1)])}`;
 const zoom=v=>{S.kz=Math.max(60,Math.min(400,v));save();$$('#kp img').forEach(i=>i.style.width=S.kz+'%');$('#kzv').textContent=S.kz+'%';const r=$('#kzr');if(r){r.value=S.kz;$('#kzrv').textContent=S.kz+'%'}};
 const ke=n=>{const t=$('#kp img[data-p="'+n+'"]');if(!t)return toast('Halaman tidak ada');window.KBACA&&KBACA.stabil&&KBACA.stabil();if(kGeser()){const kp=$('#kp');kp.scrollLeft=-(n-1)*kp.clientWidth;cur=n;$('#kfp').textContent=n+' / '+j.halaman;$('#kgo').value=n}else{t.scrollIntoView({block:'start'});cur=n}setTimeout(()=>{y0=vw.scrollTop;ktb.classList.remove('smb')},60)};
 $$('[data-kz]').forEach(b=>b.onclick=()=>zoom(z()+ +b.dataset.kz));
 $('#kgf').onsubmit=e=>{e.preventDefault();ke(+$('#kgo').value);$('#kgo').blur()};$('#kgo').onchange=()=>ke(+$('#kgo').value);$('#kgo').onfocus=e=>e.target.select();
 /* Judul, tombol layar penuh, dan pengaturan ikut menempel di atas bersama bilah halaman */
 const bar=$('#view .bar'),ktb=$('.ktb',el);if(bar)ktb.prepend(bar);$('.ktr',ktb).insertAdjacentHTML('afterend',`<div class="kib"><button class="ib" data-kfs aria-label="Layar penuh" title="Layar penuh">${ic('full',18)}</button><button class="ib" data-ks aria-label="Pengaturan kitab" title="Pengaturan">${ic('sliders',18)}</button></div>`);
 $('[data-kfs]').onclick=()=>kitabFull(!document.body.classList.contains('kfull'));kitabFull(!!S.kfull,1);
 /* Bilah bersembunyi saat menggulir ke bawah (membaca) dan muncul lagi saat menggulir ke atas */
 /* Hanya guliran oleh pengguna (jari, roda, tombol) yang menyembunyikan bilah; geseran karena gambar dimuat atau lompat halaman tidak */
 const vw=$('#view');let y0=vw.scrollTop,usr=0;['touchmove','wheel','keydown'].forEach(n=>vw.addEventListener(n,()=>usr=Date.now(),{passive:true}));
 vw.onscroll=()=>{const y=vw.scrollTop,d=y-y0;ktb.classList.toggle('lyg',y>4);if(Math.abs(d)>6){if(Date.now()-usr<400)ktb.classList.toggle('smb',d>0&&y>140&&!ktb.contains(document.activeElement));else if(d<0)ktb.classList.remove('smb');y0=y}};
 const ksBuka=$('[data-ks]').onclick=()=>{if($('.back-d'))return;const e=document.createElement('div');e.className='back-d';e.innerHTML=`<div class="sheet ksh" role="dialog" aria-label="Pengaturan kitab">
<div class="ksh-h"><span class="si">${ic('lib',20)}</span><div><b>Pengaturan kitab</b><small class="mut">${esc(k.judul)}</small></div><button type="button" class="ksh-x" id="kok" aria-label="Tutup">×</button></div>
<div class="ksh-b">
<div class="ksh-l">Ukuran halaman</div>
<div class="ksh-c ksz"><button type="button" class="sb" data-kzs="-10" aria-label="Perkecil">−</button><input type="range" id="kzr" min="60" max="400" step="5" value="${z()}" aria-label="Ukuran halaman"><button type="button" class="sb" data-kzs="10" aria-label="Perbesar">+</button><b id="kzrv">${z()}%</b><button type="button" class="sb" id="kzf" title="Pas lebar layar">Pas layar</button></div>
<div class="ksh-l">Warna halaman</div>
<div class="kwc" id="kwr">${[['tema','Ikuti tema'],['asli','Asli'],['sepia','Sepia'],['malam','Malam']].map(x=>`<button type="button" data-v="${x[0]}" class="${x[0]==kwarna()?'on':''}"><i class="kwp kw-${x[0]}"><u></u><u></u><u></u><u></u></i><small>${x[1]}</small></button>`).join('')}</div>
<div class="ksh-l">Tema aplikasi</div>
${seg('kth',[['auto','Perangkat'],['light','Terang'],['dark','Gelap'],['blue','Biru']],S.theme||'auto')}
<div class="ksh-l">Membaca</div>
<div class="list sg ksh-c">${row('book','Lanjutkan dari halaman terakhir','Buka kitab di halaman yang terakhir dibaca',tg('klj',S.klj!==false))}${row('full','Mode layar penuh','Halaman memenuhi layar; menu disembunyikan',tg('kfs',!!S.kfull))}</div>
<div class="ksh-l">Cara membaca (semua kitab)</div>
<div class="seg" id="kmd">${[['geser','Geser per halaman'],['gulir','Gulir ke bawah']].map(x=>`<button type="button" data-kmd data-v="${x[0]}" class="${(S.kmode||'geser')==x[0]?'on':''}">${x[1]}</button>`).join('')}</div>
<p class="mut ksh-n">Cubit dengan dua jari untuk memperbesar atau memperkecil. Di mode Geser, halaman yang diperbesar tidak berpindah; ketuk dua kali untuk menstabilkannya, lalu geser untuk pindah halaman.</p>
${tanpaJuz(k)?`<div class="ksh-l">Unduh</div><div class="ksh-c kdl"><div class="kdl-t"><span class="si">${ic('down',18)}</span><span><b>Simpan kitab ini</b><small class="mut">Baca tanpa internet, atau simpan PDF-nya ke perangkat untuk dicetak.</small></span></div>${dlW('kitab:'+k.id)}</div>`:''}
</div></div>`;document.body.append(e);
  e.onclick=x=>{if(x.target==e||x.target.id=='kok')e.remove()};
  $('#kzr',e).oninput=x=>zoom(+x.target.value);$('#kzf',e).onclick=()=>zoom(100);$$('[data-kzs]',e).forEach(b=>b.onclick=()=>zoom(z()+ +b.dataset.kzs));
  segBind('kwr',v=>{S.kw=v;delete S.kinv;save();$('#kp').className='kp '+kwKls()});segBind('kth',v=>{S.theme=v;save();theme()});
  $('#klj',e).onchange=x=>{S.klj=x.target.checked;save()};$('#kfs',e).onchange=x=>kitabFull(x.target.checked);segBind('kmd',kitabMode)};
 /* Layar penuh: satu halaman memenuhi layar, geser kanan/kiri untuk pindah halaman (urutan kanan-ke-kiri seperti kitab Arab).
    Ketuk halaman untuk memunculkan nomor halaman & tombol keluar sebentar. */
 cur=last;window.KBACA={ke,cur:()=>cur};kitabCubit($('#kp'),zoom);document.body.classList.toggle('kgulir',S.kmode=='gulir');const kfo=$('#kfo');let kt=0;const kfoTampil=()=>{kfo.classList.add('on');clearTimeout(kt);kt=setTimeout(()=>kfo.classList.remove('on'),2500)};
 /* Ketuk sekali = munculkan/sembunyikan; ditunda sebentar agar ketuk dua kali (perbesar/stabilkan) tidak ikut memicunya */
 let kk=0;$('#kp').onclick=()=>{if(!document.body.classList.contains('kfull'))return;clearTimeout(kk);kk=setTimeout(()=>{if(Date.now()-(+$('#kp')?.dataset.dbl||0)<500)return;kfo.classList.contains('on')?kfo.classList.remove('on'):kfoTampil()},330)};
 $('[data-kfset]').onclick=()=>{kfo.classList.remove('on');ksBuka()};
 $('[data-kfx]').onclick=()=>kitabFull(false);window.KBACA.tampil=kfoTampil;
 /* Di layar penuh, halaman aktif dihitung langsung dari posisi geser (lebih cepat & pasti daripada pengamat visibilitas) */
 const kp=$('#kp');let ts=0;kp.addEventListener('scroll',()=>{if(!kGeser())return;const p=Math.min(j.halaman,Math.round(Math.abs(kp.scrollLeft)/kp.clientWidth)+1);if(p==cur)return;
  cur=p;$('#kfp').textContent=p+' / '+j.halaman;$('#kgo').value=p;$('#kpb').style.width=p/j.halaman*100+'%';(S.kh=S.kh||{})[key]=p;clearTimeout(ts);ts=setTimeout(save,700)},{passive:true});
 /* Halaman aktif = halaman yang paling banyak terlihat (bukan yang terakhir dilaporkan), agar nomor tidak meloncat ke halaman berikutnya */
 let tm=0;const vis={};const io=new IntersectionObserver(es=>{es.forEach(e=>vis[e.target.dataset.p]=e.isIntersecting?e.intersectionRatio:0);let p=0,m=.549;for(const k in vis)if(vis[k]>m){m=vis[k];p=+k}[{isIntersecting:p>0,target:{dataset:{p}}}].forEach(e=>{if(e.isIntersecting&&!kGeser()){const p=+e.target.dataset.p;cur=p;$('#kfp').textContent=p+' / '+j.halaman;if(document.activeElement!=$('#kgo'))$('#kgo').value=p;$('#kpb').style.width=p/j.halaman*100+'%';(S.kh=S.kh||{})[key]=p;clearTimeout(tm);tm=setTimeout(save,700)}})},{threshold:[.3,.55,.8,1]});$$('#kp img').forEach(i=>io.observe(i));
 if(last>1)setTimeout(()=>ke(last),150)}
function kitabTeks(el,k,j,b,i,n){if(!b){el.innerHTML='<div class="card mut">Bab tidak ditemukan.</div>';return}$('#view h1').textContent=b.judul;
 el.innerHTML=kitabTeksIsi(k,j,b,i,n)}
/* Pratinjau bab sebelah saat digeser (isi kitab sudah termuat karena bab ini sedang dibaca) */
PRATINJAU.kitab=(id,juz,bab)=>{const k=KITAB_ISI[id];if(!k||bab==null)return null;const j=juz==null?k.juz[0]:k.juz.find(x=>x.no==+juz);const B=j&&j.bab||[],b=B[+bab];if(!b)return null;
 return head(b.judul,`#/kitab/${id}/${j.no}`,RS)+`<div id="kd">${kitabTeksIsi(k,j,b,+bab,B.length)}</div>`};
function kitabTeksIsi(k,j,b,i,n){return `<div class="kt-${k.id}">${b.isi.map((x,m)=>`<div class="ay2 kt-item"><span class="n">${x.no||m+1}</span>${x.ar?`<div class="ar2 kt-ar" style="font-size:${S.fs}px">${esc(x.ar)}</div>`:''}${x.lt?`<p class="lt kt-lt">${esc(x.lt)}</p>`:''}${x.id?`<p class="tr mut kt-id">${esc(x.id)}</p>`:''}</div>`).join('')}</div>${KOREKSI}`+pnav(i>0&&[`#/kitab/${k.id}/${j.no}/${i-1}`,(j.bab||[])[i-1]?j.bab[i-1].judul:'Sebelumnya'],i<n-1&&[`#/kitab/${k.id}/${j.no}/${i+1}`,(j.bab||[])[i+1]?j.bab[i+1].judul:'Berikutnya'])}
P.kitab=(id,juz,bab)=>({html:head('Kitab Kuning',bab!=null?`#/kitab/${id}/${juz}`:juz!=null?`#/kitab/${id}`:id?'#/'+((KITAB_DAFTAR.find(x=>x.id==id)||{}).di||'kitab'):'#/menu',bab!=null?RS:'')+(id?'<div id="kd"><p class="mut">Memuat kitab…</p></div>':kitabHub()),
 async init(){if(!id)return;const el=$('#kd');let k=null;try{k=await kitabAmbil(id)}catch(e){}
  if(!k){el.innerHTML='<div class="card mut">Kitab ini belum bisa dimuat. Periksa koneksi lalu coba lagi.</div>';return}
  const t=$('#view h1');if(juz==null&&!tanpaJuz(k)){t.textContent=k.judul;return kitabDetail(el,k)}
  const j=juz==null?k.juz[0]:k.juz.find(x=>x.no==+juz);if(!j){el.innerHTML='<div class="card mut">Juz ini belum tersedia.</div>';return}
  t.textContent=tanpaJuz(k)?k.judul:'Juz '+j.no;if(j.pola)return kitabHalaman(el,k,j);
  const B=j.bab||[];if(bab==null){el.innerHTML=`<div class="list">${B.map((b,i)=>`<a class="row" href="#/kitab/${k.id}/${j.no}/${i}"><span class="num">${i+1}</span><span class="t"><b>${esc(b.judul)}</b><br><small>${b.isi.length} bagian</small></span>${ic('next',18)}</a>`).join('')}</div>`;return}
  kitabTeks(el,k,j,B[+bab],+bab,B.length)}});
/* Cubit untuk memperbesar halaman kitab.
   - Layar penuh mode Geser: cubit dua jari memperbesar halaman yang sedang dibuka (1–5x, berpusat di titik cubitan) dan
     halaman bisa digeser bebas ke segala arah. Selama diperbesar halaman TERKUNCI (tidak pindah halaman), walau dicubit
     kembali kecil; ketuk dua kali untuk menstabilkan (kembali normal) lalu geser kanan/kiri untuk pindah halaman.
     Ketuk dua kali saat normal = langsung diperbesar di titik itu.
   - Mode Gulir (biasa maupun layar penuh): cubit seperti PDF; ukuran semua halaman ikut berubah dan titik yang dicubit
     tetap di bawah jari. Di komputer: Ctrl + roda tetikus. */
function kitabCubit(kp,zoomKe){if(!kp)return;const kpi=kp.querySelector('.kpi');
 const geser=()=>document.body.classList.contains('kfull')&&!document.body.classList.contains('kgulir');
 const vs=()=>document.body.classList.contains('kfull')?kp:$('#view');
 const jarak=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY),tengah=t=>({x:(t[0].clientX+t[1].clientX)/2,y:(t[0].clientY+t[1].clientY)/2});
 /* ---- mode Geser (satu halaman) ---- */
 let sk=1,tx=0,ty=0,img=null,awal=null,ketuk={t:0,x:0,y:0},hint=0,gerak=0;
 const kunci=on=>{kp.classList.toggle('kzum',on)};
 const terap=()=>{if(img)img.style.transform=sk>1||tx||ty?`translate(${tx}px,${ty}px) scale(${sk})`:''};
 const batas=()=>{if(!img)return;const w=Math.max(0,img.clientWidth*(sk-1)/2),h=Math.max(0,img.clientHeight*(sk-1)/2);tx=Math.max(-w,Math.min(w,tx));ty=Math.max(-h,Math.min(h,ty))};
 const stabil=()=>{if(img){img.style.transition='transform .22s ease';sk=1;tx=ty=0;terap();const i=img;setTimeout(()=>i.style.transition='',240)}img=null;kunci(false)};
 const halIni=()=>kp.querySelector(`img[data-p="${window.KBACA?KBACA.cur():1}"]`);
 /* Titik layar m tetap di bawah jari saat skala berubah dari s0 ke s1 (asal transformasi = tengah gambar) */
 const fokus=(m,s0,t0x,t0y,s1,m1=m)=>{const r=img.getBoundingClientRect(),cx=r.left+r.width/2-t0x,cy=r.top+r.height/2-t0y;
  /* r sudah memuat translate+scale; tengah tanpa transformasi = tengah r dikurangi translate */
  const px=(m.x-cx-t0x)/s0,py=(m.y-cy-t0y)/s0;tx=m1.x-cx-s1*px;ty=m1.y-cy-s1*py;sk=s1};
 const perbesarDi=(x,y,s)=>{img=halIni();if(!img)return;kunci(true);img.style.transition='transform .22s ease';fokus({x,y},1,0,0,s);batas();terap();const i=img;setTimeout(()=>i.style.transition='',240)};
 kp.addEventListener('touchstart',e=>{if(!geser())return;gerak=0;
  if(e.touches.length==2){const baru=img||halIni();if(img!=baru){img=baru;sk=1;tx=ty=0}kunci(true);awal={d:jarak(e.touches),m:tengah(e.touches),s:sk,tx,ty}}
  else if(e.touches.length==1){const t=e.touches[0];if(kp.classList.contains('kzum'))awal={x:t.clientX,y:t.clientY,tx,ty}}},{passive:true});
 kp.addEventListener('touchmove',e=>{if(!geser())return;gerak=1;
  if(e.touches.length==2&&awal&&awal.d){e.preventDefault();const s1=Math.max(1,Math.min(5,awal.s*jarak(e.touches)/awal.d));fokus(awal.m,awal.s,awal.tx,awal.ty,s1,tengah(e.touches));batas();terap()}
  else if(e.touches.length==1&&kp.classList.contains('kzum')&&awal&&awal.x!=null){e.preventDefault();
   if(sk<=1.01){if(Date.now()-hint>2500){hint=Date.now();toast('Ketuk 2× untuk menstabilkan halaman, lalu geser untuk pindah halaman')}return}
   tx=awal.tx+e.touches[0].clientX-awal.x;ty=awal.ty+e.touches[0].clientY-awal.y;batas();terap()}},{passive:false});
 kp.addEventListener('touchend',e=>{if(!geser())return;
  if(e.touches.length==1&&kp.classList.contains('kzum')){const t=e.touches[0];awal={x:t.clientX,y:t.clientY,tx,ty};return}
  if(e.touches.length)return;awal=null;
  /* Ketuk dua kali: stabilkan bila sedang diperbesar/terkunci, atau perbesar 2,5x di titik ketukan */
  const t=e.changedTouches[0],now=Date.now();if(gerak||e.changedTouches.length!=1){ketuk.t=0;return}
  if(now-ketuk.t<320&&Math.hypot(t.clientX-ketuk.x,t.clientY-ketuk.y)<40){ketuk.t=0;kp.dataset.dbl=now;if(kp.classList.contains('kzum'))stabil();else perbesarDi(t.clientX,t.clientY,2.5)}
  else ketuk={t:now,x:t.clientX,y:t.clientY}},{passive:true});
 /* Tetikus (komputer): Ctrl+roda memperbesar, seret untuk menggeser saat diperbesar, klik dua kali untuk menstabilkan */
 let seret=null;
 kp.addEventListener('mousedown',e=>{if(!geser()||!kp.classList.contains('kzum'))return;e.preventDefault();seret={x:e.clientX,y:e.clientY,tx,ty}});
 addEventListener('mousemove',e=>{if(!seret)return;tx=seret.tx+e.clientX-seret.x;ty=seret.ty+e.clientY-seret.y;batas();terap()});
 addEventListener('mouseup',()=>seret=null);
 kp.addEventListener('dblclick',e=>{if(!geser()||Date.now()-(+kp.dataset.dbl||0)<600)return;if(kp.classList.contains('kzum'))stabil();else perbesarDi(e.clientX,e.clientY,2.5)});
 /* ---- mode Gulir (semua halaman) ---- */
 let g=null;
 kp.addEventListener('touchstart',e=>{if(geser()||e.touches.length!=2)return;e.preventDefault();const m=tengah(e.touches),kr=kpi.getBoundingClientRect();
  g={d:jarak(e.touches),m,z0:S.kz||100,ox:m.x-kr.left,oy:m.y-kr.top,s:1,m1:m};kpi.style.transformOrigin=`${g.ox}px ${g.oy}px`},{passive:false});
 kp.addEventListener('touchmove',e=>{if(!g)return;if(e.touches.length<2)return;e.preventDefault();const m=tengah(e.touches);
  g.s=Math.max(60/g.z0,Math.min(400/g.z0,jarak(e.touches)/g.d));g.m1=m;kpi.style.transform=`translate(${m.x-g.m.x}px,${m.y-g.m.y}px) scale(${g.s})`},{passive:false});
 const gSelesai=()=>{if(!g)return;const G=g;g=null;kpi.style.transform='';kpi.style.transformOrigin='';
  /* Terapkan ukuran baru, lalu gulir agar titik yang dicubit tetap di bawah jari */
  const V=vs(),z1=Math.max(60,Math.min(400,Math.round(G.z0*G.s/5)*5)),r=z1/G.z0;if(z1==G.z0)return;
  const kr0=kpi.getBoundingClientRect(),vr=V.getBoundingClientRect(),hr=kp.getBoundingClientRect();zoomKe(z1);
  kp.scrollLeft=Math.max(0,G.ox*r-(G.m1.x-hr.left));const kr1=kpi.getBoundingClientRect();V.scrollTop+=kr1.top-kr0.top+G.oy*r-(G.m1.y-kr0.top)};
 kp.addEventListener('touchend',e=>{if(g&&e.touches.length<2)gSelesai()},{passive:true});kp.addEventListener('touchcancel',gSelesai,{passive:true});
 kp.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();if(geser()){img=img||halIni();if(!img)return;kunci(true);const s1=Math.max(1,Math.min(5,sk*(e.deltaY<0?1.15:1/1.15)));fokus({x:e.clientX,y:e.clientY},sk,tx,ty,s1);batas();terap();return}
  const z0=S.kz||100,z1=Math.max(60,Math.min(400,Math.round(z0*(e.deltaY<0?1.1:1/1.1)/5)*5));if(z1==z0)return;
  const V=vs(),kr0=kpi.getBoundingClientRect(),hr=kp.getBoundingClientRect(),ox=e.clientX-kr0.left,oy=e.clientY-kr0.top,r=z1/z0;zoomKe(z1);
  kp.scrollLeft=Math.max(0,ox*r-(e.clientX-hr.left));const kr1=kpi.getBoundingClientRect();V.scrollTop+=kr1.top-kr0.top+oy*r-(e.clientY-kr0.top)},{passive:false});
 /* Pindah halaman/mode: kunci & perbesaran mode Geser dilepas */
 window.KBACA&&(KBACA.stabil=stabil)}
