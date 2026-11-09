/* js/pages/tutorial.js - Video tutorial cara memakai aplikasi (daftar di data/tutorial.js, dibuat video-tutorial/daftar.py).
   Tiap tutorial punya dua video ringan (~0,5 MB): untuk HP (tegak) dan desktop/laptop (mendatar), kecuali yang khusus HP (hp:1); bagian yang dibuka
   pertama mengikuti perangkat. Video baru dimuat saat kartunya dibuka. #/tutorial/<id> langsung membuka tutorial itu.
   Berkas video dilayani GitHub Pages (seperti gambar kitab) agar tidak membebani deployment Vercel. */
const TUT_ASAL=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)?'':'https://ky-mind.github.io/Fadzkuruuni/';
const TUTJ=[['hp','HP'],['desktop','Desktop / laptop']];
/* Kecepatan video tutorial (diingat) dan geser maju/mundur 10 detik; bilah waktu video juga bisa digeser bebas */
const TUTSPD=[0.75,1,1.25,1.5,2];
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-tutg],[data-tutsp]');if(!b)return;const v=b.closest('.tutb')?.querySelector('video');if(!v)return;
 if(b.dataset.tutg){v.currentTime=Math.max(0,Math.min((v.duration||1e9)-0.2,v.currentTime+ +b.dataset.tutg));return}
 const sp=+b.dataset.tutsp;S.tutSpd=sp;save();v.playbackRate=sp;b.parentElement.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x==b))});
document.addEventListener('play',e=>{if(e.target.matches&&e.target.matches('.tutv video'))e.target.playbackRate=S.tutSpd||1},true);
/* Bagian awal mengikuti perangkat: layar sentuh atau sempit → HP; pilihan terakhir diingat */
const tutJenis=()=>S.tutj||(matchMedia('(pointer:coarse)').matches||innerWidth<760?'hp':'desktop');
const tutIsi=(t,j)=>{const b=`${TUT_ASAL}video/tutorial/${t.id}-${j}`;return `<div class="tutv ${j}"><video controls playsinline preload="metadata" poster="${b}.jpg?v=${t.ver}" src="${b}.mp4?v=${t.ver}" aria-label="${esc(t.judul)}, video untuk ${j=='hp'?'HP':'desktop'}"></video></div>
<div class="tutk" role="group" aria-label="Kontrol video"><button type="button" data-tutg="-10" aria-label="Mundur 10 detik">${ic('back',15)} 10 dtk</button><button type="button" data-tutg="10" aria-label="Maju 10 detik">10 dtk ${ic('next',15)}</button><span class="tutsp">${TUTSPD.map(v=>`<button type="button" data-tutsp="${v}"${v==(S.tutSpd||1)?' class="on"':''}>${String(v).replace('.',',')}×</button>`).join('')}</span></div>
<details class="tutd"><summary>Langkah-langkah (${j=='hp'?'HP':'desktop'})</summary><ol class="tutl">${t.langkah.map(l=>`<li>${j=='desktop'&&l[1]?l[1]:l[0]}</li>`).join('')}</ol></details>
${(t.id=='kelas'&&typeof TUT_KE!='undefined'&&TUT_KE||t.ke)?`<a class="btn" href="${(t.id=='kelas'&&TUT_KE||t.ke)[0]}" style="display:block;text-align:center;margin-top:12px">${esc((t.id=='kelas'&&TUT_KE||t.ke)[1])}</a>`:''}`};
P.tutorial=buka=>{const j=tutJenis(),L=typeof TUTOR!='undefined'?TUTOR:[];buka=L.some(t=>t.id==buka)?buka:'';return {html:head('Video tutorial','#/pengaturan/tentang')+`<p class="mut" style="margin:0 0 14px">Panduan singkat memakai aplikasi Fadzkuruuni. Pilih <b>HP</b> atau <b>Desktop / laptop</b> sesuai perangkat yang kamu pakai, karena letak tombolnya berbeda.</p>
${seg('tutj',TUTJ,j)}
${L.map(t=>`<section class="tut${t.id==buka?' buka':''}" data-tut="${t.id}"${t.hp?` data-hp="1"${j=='desktop'?' hidden':''}`:''}><button type="button" class="tuth" aria-expanded="${t.id==buka}"><span class="tutn"></span><span><b>${esc(t.judul)}</b><small class="mut">${esc(t.ket)} · ${t.durasi}</small></span>${ic('next',18)}</button><div class="tutb">${t.id==buka?tutIsi(t,j):''}</div></section>`).join('')}`,
 init(){let jj=j;
  const tutup=s=>{s.classList.remove('buka');s.querySelector('.tuth').setAttribute('aria-expanded','false');s.querySelector('.tutb').innerHTML=''};
  const isi=s=>{s.querySelector('.tutb').innerHTML=tutIsi(L.find(t=>t.id==s.dataset.tut),jj)};
  /* Tutorial khusus HP (mis. widget layar utama Android) disembunyikan di pilihan Desktop; nomor urut mengikuti yang tampil */
  const nomor=()=>{let n=0;$$('.tut').forEach(s=>{if(!s.hidden)s.querySelector('.tutn').textContent=++n})};
  const saring=()=>{$$('.tut[data-hp]').forEach(s=>{s.hidden=jj=='desktop';if(s.hidden&&s.classList.contains('buka'))tutup(s)});nomor()};saring();
  segBind('tutj',v=>{S.tutj=jj=v;save();saring();$$('.tut.buka').forEach(isi)});
  /* Satu tutorial terbuka pada satu waktu; video lain dihentikan dengan mengosongkan kartunya */
  $$('.tuth').forEach(b=>b.onclick=()=>{const s=b.closest('.tut'),on=!s.classList.contains('buka');$$('.tut.buka').forEach(tutup);
   if(on){s.classList.add('buka');b.setAttribute('aria-expanded','true');isi(s);s.scrollIntoView({behavior:gerakOff()?'auto':'smooth',block:'start'})}});
  if(buka)setTimeout(()=>$(`.tut[data-tut="${buka}"]`)?.scrollIntoView({block:'start'}),60)}}};
