/* js/pages/kitab.js - Kitab Kuning: daftar kitab (kitab/daftar.js) dan pembaca.
   Dua mode per juz: halaman gambar (juz.pola) untuk PDF seperti Al-Hawi, dan teks (juz.bab) untuk kitab yang ditempel sendiri.
   Kitab satu juz (tanpaJuz) langsung dibuka tanpa daftar juz; tombol unduhnya pindah ke bilah pembaca. */
const padn=n=>String(n).padStart(2,'0'),pgUrl=(j,n)=>j.pola.replace('{n}',padn(n));
const kitabCss=h=>{if(!h||document.querySelector('link[data-kc="'+h+'"]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=h;l.dataset.kc=h;document.head.append(l)};
const kitabAmbil=async id=>{const d=KITAB_DAFTAR.find(x=>x.id==id);if(!d||!d.berkas)return null;if(!KITAB_ISI[id])await ldjs(d.berkas);const k=KITAB_ISI[id];if(k&&k.css)kitabCss(k.css);return k||null};
const tanpaJuz=k=>(k.juzTotal||k.juz.length)==1;
const kitabHub=()=>Object.entries(KITAB_KELOMPOK).map(([g,nm])=>{const L=KITAB_DAFTAR.filter(k=>k.kelompok==g);return L.length?`<h2>${nm}</h2><div class="list">${L.map(k=>`<a class="row" href="${k.berkas?'#/kitab/'+k.id:'#/segera/'+encodeURIComponent(k.judul)}"><span class="si" style="width:46px;height:46px">${ic('lib',22)}</span><span class="t"><b>${k.judul}</b>${k.arab?`<br><span class="ar" style="font-size:18px">${k.arab}</span>`:''}<br><small>${k.ket||''}${k.berkas?(dlSudah('kitab:'+k.id)?' · Tersimpan offline':''):' · Segera hadir'}</small></span>${ic('next',18)}</a>`).join('')}</div>`:''}).join('');
function kitabDetail(el,k){const kh=S.kh||{};el.innerHTML=`<div class="card" style="text-align:center">${k.arab?`<div class="ar2" style="text-align:center">${k.arab}</div>`:''}<b>${esc(k.judul)}</b><p class="mut" style="margin:4px 0 0">${esc(k.pengarang||'')}</p><p class="mut" style="margin:6px 0 0">${esc(k.ket||'')}</p></div>
<h2>Daftar juz</h2><div class="list">${Array.from({length:k.juzTotal||k.juz.length},(_,i)=>{const n=i+1,j=k.juz.find(x=>x.no==n);return j?`<a class="row" href="#/kitab/${k.id}/${n}"><span class="num">${n}</span><span class="t"><b>Juz ${n}</b><br><small>${j.pola?j.halaman+' halaman':(j.bab||[]).length+' bab'}${kh[k.id+'-'+n]?' · terakhir hal. '+kh[k.id+'-'+n]:''}</small></span>${ic('next',18)}</a>`:`<a class="row" href="#/segera/${encodeURIComponent(k.judul+' Juz '+n)}"><span class="num">${n}</span><span class="t"><b>Juz ${n}</b><br><small>Segera hadir</small></span>${ic('next',18)}</a>`}).join('')}</div>
<div class="card dlk" style="margin-top:12px"><b>Unduh kitab ini</b><p class="mut" style="margin:4px 0 8px">Simpan semua halaman agar bisa dibaca tanpa internet, atau simpan PDF-nya ke perangkat untuk dicetak.</p>${dlW('kitab:'+k.id)}</div>`}
/* Paket unduhan per kitab: semua halaman gambar (offline) dan PDF tiap juz (ke perangkat) */
KITAB_DAFTAR.filter(d=>d.berkas).forEach(d=>paket('kitab:'+d.id,{judul:d.judul,kat:'kitab',
 urls:async()=>{const k=await kitabAmbil(d.id),U=[d.berkas];k.juz.forEach(j=>{if(j.pola)for(let i=1;i<=j.halaman;i++)U.push(pgUrl(j,i))});return U},
 berkas:async()=>{const k=await kitabAmbil(d.id);return k.juz.filter(j=>j.pdf).map(j=>({url:j.pdf,nama:k.judul+(k.juz.length>1?' - Juz '+j.no:'')+'.pdf'}))}}));
/* Warna halaman: tema (malam saat tema gelap), asli, sepia, malam. Nilai lama S.kinv===false dibaca sebagai "asli". */
const kwarna=()=>S.kw||(S.kinv===false?'asli':'tema'),kwKls=()=>({tema:'inv',sepia:'sep',malam:'mlm'})[kwarna()]||'';
/* Layar penuh pembaca kitab: menyembunyikan menu dan tasbih melayang, dan memakai layar penuh peramban bila didukung.
   Saat halaman dibuka ulang (tanpa ketukan) hanya tampilannya yang dipulihkan, karena peramban menolak layar penuh tanpa ketukan. */
function kitabFull(on,pulih){S.kfull=on;save();document.body.classList.toggle('kfull',on);const b=$('[data-kfs]');if(b)b.classList.toggle('on',on);if(pulih)return;
 const de=document.documentElement,fe=document.fullscreenElement||document.webkitFullscreenElement;
 if(on&&!fe)(de.requestFullscreen||de.webkitRequestFullscreen||(()=>Promise.reject())).call(de).catch(()=>{});else if(!on&&fe)(document.exitFullscreen||document.webkitExitFullscreen).call(document).catch(()=>{})}
/* Keluar layar penuh lewat tombol Esc/kembali di perangkat: tampilan ikut kembali normal */
addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('kfull'))kitabFull(false,1)});
function kitabHalaman(el,k,j){const key=k.id+'-'+j.no,last=S.klj===false?1:(S.kh||{})[key]||1,jn=x=>k.juz.find(y=>y.no==x),z=()=>S.kz||100;
 el.innerHTML=`<div class="ktb"><div class="ktr"><div class="kzg"><button class="sb" data-kz="-15" aria-label="Perkecil">−</button><b id="kzv">${z()}%</b><button class="sb" data-kz="15" aria-label="Perbesar">+</button></div>
<form class="kgo" id="kgf" title="Ketik nomor halaman lalu Enter"><input class="in" id="kgo" type="number" inputmode="numeric" enterkeyhint="go" min="1" max="${j.halaman}" value="${last}" aria-label="Nomor halaman"><span class="mut">/ ${j.halaman}</span></form></div>
<div class="kpr"><i id="kpb" style="width:${last/j.halaman*100}%"></i></div></div>
<div class="kp ${kwKls()}" id="kp" style="--r:${k.rasio||.7606}">${Array.from({length:j.halaman},(_,i)=>`<img loading="lazy" decoding="async" data-p="${i+1}" src="${pgUrl(j,i+1)}" alt="Halaman ${i+1}" style="width:${z()}%">`).join('')}</div>
${pnav(jn(j.no-1)&&[`#/kitab/${k.id}/${j.no-1}`,'Juz '+(j.no-1)],jn(j.no+1)&&[`#/kitab/${k.id}/${j.no+1}`,'Juz '+(j.no+1)])}`;
 const zoom=v=>{S.kz=Math.max(60,Math.min(300,v));save();$$('#kp img').forEach(i=>i.style.width=S.kz+'%');$('#kzv').textContent=S.kz+'%';const r=$('#kzr');if(r){r.value=S.kz;$('#kzrv').textContent=S.kz+'%'}};
 const ke=n=>{const t=$('#kp img[data-p="'+n+'"]');if(!t)return toast('Halaman tidak ada');t.scrollIntoView({block:'start'});setTimeout(()=>{y0=vw.scrollTop;ktb.classList.remove('smb')},60)};
 $$('[data-kz]').forEach(b=>b.onclick=()=>zoom(z()+ +b.dataset.kz));
 $('#kgf').onsubmit=e=>{e.preventDefault();ke(+$('#kgo').value);$('#kgo').blur()};$('#kgo').onchange=()=>ke(+$('#kgo').value);$('#kgo').onfocus=e=>e.target.select();
 /* Judul, tombol layar penuh, dan pengaturan ikut menempel di atas bersama bilah halaman */
 const bar=$('#view .bar'),ktb=$('.ktb',el);if(bar)ktb.prepend(bar);$('.ktr',ktb).insertAdjacentHTML('afterend',`<div class="kib"><button class="ib" data-kfs aria-label="Layar penuh" title="Layar penuh">${ic('full',18)}</button><button class="ib" data-ks aria-label="Pengaturan kitab" title="Pengaturan">${ic('sliders',18)}</button></div>`);
 $('[data-kfs]').onclick=()=>kitabFull(!document.body.classList.contains('kfull'));kitabFull(!!S.kfull,1);
 /* Bilah bersembunyi saat menggulir ke bawah (membaca) dan muncul lagi saat menggulir ke atas */
 /* Hanya guliran oleh pengguna (jari, roda, tombol) yang menyembunyikan bilah; geseran karena gambar dimuat atau lompat halaman tidak */
 const vw=$('#view');let y0=vw.scrollTop,usr=0;['touchmove','wheel','keydown'].forEach(n=>vw.addEventListener(n,()=>usr=Date.now(),{passive:true}));
 vw.onscroll=()=>{const y=vw.scrollTop,d=y-y0;ktb.classList.toggle('lyg',y>4);if(Math.abs(d)>6){if(Date.now()-usr<400)ktb.classList.toggle('smb',d>0&&y>140&&!ktb.contains(document.activeElement));else if(d<0)ktb.classList.remove('smb');y0=y}};
 $('[data-ks]').onclick=()=>{const e=document.createElement('div');e.className='back-d';e.innerHTML=`<div class="sheet ksh" role="dialog" aria-label="Pengaturan kitab">
<div class="ksh-h"><span class="si">${ic('lib',20)}</span><div><b>Pengaturan kitab</b><small class="mut">${esc(k.judul)}</small></div><button type="button" class="ksh-x" id="kok" aria-label="Tutup">×</button></div>
<div class="ksh-b">
<div class="ksh-l">Ukuran halaman</div>
<div class="ksh-c ksz"><button type="button" class="sb" data-kzs="-10" aria-label="Perkecil">−</button><input type="range" id="kzr" min="60" max="300" step="5" value="${z()}" aria-label="Ukuran halaman"><button type="button" class="sb" data-kzs="10" aria-label="Perbesar">+</button><b id="kzrv">${z()}%</b><button type="button" class="sb" id="kzf" title="Pas lebar layar">Pas layar</button></div>
<div class="ksh-l">Warna halaman</div>
<div class="kwc" id="kwr">${[['tema','Ikuti tema'],['asli','Asli'],['sepia','Sepia'],['malam','Malam']].map(x=>`<button type="button" data-v="${x[0]}" class="${x[0]==kwarna()?'on':''}"><i class="kwp kw-${x[0]}"><u></u><u></u><u></u><u></u></i><small>${x[1]}</small></button>`).join('')}</div>
<div class="ksh-l">Tema aplikasi</div>
${seg('kth',[['auto','Perangkat'],['light','Terang'],['dark','Gelap'],['blue','Biru']],S.theme||'auto')}
<div class="ksh-l">Membaca</div>
<div class="list sg ksh-c">${row('book','Lanjutkan dari halaman terakhir','Buka kitab di halaman yang terakhir dibaca',tg('klj',S.klj!==false))}${row('full','Mode layar penuh','Sembunyikan menu dan tombol melayang',tg('kfs',!!S.kfull))}</div>
${tanpaJuz(k)?`<div class="ksh-l">Unduh</div><div class="ksh-c kdl"><div class="kdl-t"><span class="si">${ic('down',18)}</span><span><b>Simpan kitab ini</b><small class="mut">Baca tanpa internet, atau simpan PDF-nya ke perangkat untuk dicetak.</small></span></div>${dlW('kitab:'+k.id)}</div>`:''}
</div></div>`;document.body.append(e);
  e.onclick=x=>{if(x.target==e||x.target.id=='kok')e.remove()};
  $('#kzr',e).oninput=x=>zoom(+x.target.value);$('#kzf',e).onclick=()=>zoom(100);$$('[data-kzs]',e).forEach(b=>b.onclick=()=>zoom(z()+ +b.dataset.kzs));
  segBind('kwr',v=>{S.kw=v;delete S.kinv;save();$('#kp').className='kp '+kwKls()});segBind('kth',v=>{S.theme=v;save();theme()});
  $('#klj',e).onchange=x=>{S.klj=x.target.checked;save()};$('#kfs',e).onchange=x=>kitabFull(x.target.checked)};
 let tm=0;const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const p=+e.target.dataset.p;if(document.activeElement!=$('#kgo'))$('#kgo').value=p;$('#kpb').style.width=p/j.halaman*100+'%';(S.kh=S.kh||{})[key]=p;clearTimeout(tm);tm=setTimeout(save,700)}}),{threshold:.55});$$('#kp img').forEach(i=>io.observe(i));
 if(last>1)setTimeout(()=>ke(last),150)}
function kitabTeks(el,k,j,b,i,n){if(!b){el.innerHTML='<div class="card mut">Bab tidak ditemukan.</div>';return}$('#view h1').textContent=b.judul;
 el.innerHTML=`<div class="kt-${k.id}">${b.isi.map((x,m)=>`<div class="ay2 kt-item"><span class="n">${x.no||m+1}</span>${x.ar?`<div class="ar2 kt-ar">${esc(x.ar)}</div>`:''}${x.lt?`<p class="lt kt-lt">${esc(x.lt)}</p>`:''}${x.id?`<p class="tr mut kt-id">${esc(x.id)}</p>`:''}</div>`).join('')}</div>${k.sumber?`<p class="mut">Sumber: ${esc(k.sumber)}</p>`:''}`+pnav(i>0&&[`#/kitab/${k.id}/${j.no}/${i-1}`,(j.bab||[])[i-1]?j.bab[i-1].judul:'Sebelumnya'],i<n-1&&[`#/kitab/${k.id}/${j.no}/${i+1}`,(j.bab||[])[i+1]?j.bab[i+1].judul:'Berikutnya']);
 $$('#kd .ar2').forEach(e=>e.style.fontSize=S.fs+'px')}
P.kitab=(id,juz,bab)=>({html:head('Kitab Kuning',bab!=null?`#/kitab/${id}/${juz}`:juz!=null?`#/kitab/${id}`:id?'#/kitab':'#/menu',bab!=null?RS:'')+(id?'<div id="kd"><p class="mut">Memuat kitab…</p></div>':'<p class="mut">Kitab karya pondok dan kitab umum. Ketuk sebuah kitab untuk membacanya.</p>'+kitabHub()),
 async init(){if(!id)return;const el=$('#kd');let k=null;try{k=await kitabAmbil(id)}catch(e){}
  if(!k){el.innerHTML='<div class="card mut">Kitab ini belum bisa dimuat. Periksa koneksi lalu coba lagi.</div>';return}
  const t=$('#view h1');if(juz==null&&!tanpaJuz(k)){t.textContent=k.judul;return kitabDetail(el,k)}
  const j=juz==null?k.juz[0]:k.juz.find(x=>x.no==+juz);if(!j){el.innerHTML='<div class="card mut">Juz ini belum tersedia.</div>';return}
  t.textContent=tanpaJuz(k)?k.judul:'Juz '+j.no;if(j.pola)return kitabHalaman(el,k,j);
  const B=j.bab||[];if(bab==null){el.innerHTML=`<div class="list">${B.map((b,i)=>`<a class="row" href="#/kitab/${k.id}/${j.no}/${i}"><span class="num">${i+1}</span><span class="t"><b>${esc(b.judul)}</b><br><small>${b.isi.length} bagian</small></span>${ic('next',18)}</a>`).join('')}</div>`;return}
  kitabTeks(el,k,j,B[+bab],+bab,B.length)}});
