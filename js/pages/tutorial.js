/* js/pages/tutorial.js - Video tutorial cara memakai aplikasi (daftar di data/tutorial.js, dibuat video-tutorial/daftar.py).
   Tiap tutorial punya dua video ringan (~0,5 MB): untuk HP (tegak) dan desktop/laptop (mendatar), kecuali yang khusus HP (hp:1); bagian yang dibuka
   pertama mengikuti perangkat. Video baru dimuat saat kartunya dibuka. #/tutorial/<id> langsung membuka tutorial itu.
   Berkas video dilayani GitHub Pages (seperti gambar kitab) agar tidak membebani deployment Vercel. */
const TUT_ASAL=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)?'':'https://ky-mind.github.io/Fadzkuruuni/';
const TUTJ=[['hp','HP'],['desktop','Desktop / laptop']];
/* Bagian awal mengikuti perangkat: layar sentuh atau sempit → HP; pilihan terakhir diingat */
const tutJenis=()=>S.tutj||(matchMedia('(pointer:coarse)').matches||innerWidth<760?'hp':'desktop');
const tutIsi=(t,j)=>{const b=`${TUT_ASAL}video/tutorial/${t.id}-${j}`;return `<div class="tutv ${j}"><video controls playsinline preload="metadata" poster="${b}.jpg?v=${t.ver}" src="${b}.mp4?v=${t.ver}" aria-label="${esc(t.judul)}, video untuk ${j=='hp'?'HP':'desktop'}"></video></div>
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
