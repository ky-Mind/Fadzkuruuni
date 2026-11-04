/* js/pages/tutorial.js - Video tutorial cara memakai aplikasi. Tiap tutorial punya dua video: untuk HP (vertikal)
   dan untuk desktop/laptop (mendatar); bagian yang dibuka pertama mengikuti perangkat yang sedang dipakai.
   Berkas video dilayani GitHub Pages (seperti gambar kitab) agar tidak membebani deployment Vercel. */
const TUT_ASAL=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)?'':'https://ky-mind.github.io/Fadzkuruuni/';
/* Langkah: [teks HP, teks desktop]; teks yang sama untuk keduanya cukup satu */
const TUTOR=[{id:'lapor',judul:'Cara melaporkan bug',ket:'Menandai bagian yang bermasalah, menulis rincian, lalu mengirimnya ke tim Fadzkuruuni.',berkas:'video/tutorial/lapor-bug',durasi:'0:58',ke:['#/lapor','Laporkan bug sekarang'],
 langkah:[['Buka menu <b>Pengaturan</b>','Klik menu <b>Pengaturan</b> di samping kiri'],['Pilih <b>Tentang &amp; Bantuan</b>'],['Ketuk <b>Laporkan bug atau kesalahan penulisan</b>','Klik <b>Laporkan bug atau kesalahan penulisan</b>'],['Pilih jenis laporan <b>Bug / error</b>'],
  ['Ketuk <b>Tandai halaman</b>','Klik <b>Tandai halaman</b>'],['Buka halaman yang ada bug-nya, lalu ketuk <b>Tandai di sini</b>','Buka halaman yang ada bug-nya, lalu klik <b>Tandai di sini</b>'],['Ketuk bagian yang bermasalah','Klik bagian yang bermasalah'],['Setelah disorot merah, ketuk <b>Ya, laporkan</b>','Setelah disorot merah, klik <b>Ya, laporkan</b>'],
  ['Halaman, letak bug, dan gambarnya otomatis terisi'],['Tulis <b>rincian</b>: apa yang salah dan apa yang kamu lakukan sebelumnya'],['Boleh tambah foto atau tangkapan layar (maks. 3)'],['Pastikan sudah <b>masuk akun</b> dan nama terisi'],['Ketuk <b>Kirim laporan</b>','Klik <b>Kirim laporan</b>'],['Selesai, laporan diterima tim Fadzkuruuni']]}];
const TUTJ=[['hp','HP'],['desktop','Desktop / laptop']];
/* Bagian awal mengikuti perangkat: layar sentuh atau sempit → HP; pilihan terakhir diingat */
const tutJenis=()=>S.tutj||(matchMedia('(pointer:coarse)').matches||innerWidth<760?'hp':'desktop');
const tutVideo=(t,j)=>`<div class="tutv ${j}"><video controls playsinline preload="metadata" poster="${TUT_ASAL}${t.berkas}-${j}.jpg" src="${TUT_ASAL}${t.berkas}-${j}.mp4" aria-label="${esc(t.judul)}, video untuk ${j=='hp'?'HP':'desktop'}"></video></div>`;
const tutLangkah=(t,j)=>`<ol class="tutl">${t.langkah.map(l=>`<li>${j=='desktop'&&l[1]?l[1]:l[0]}</li>`).join('')}</ol>`;
P.tutorial=()=>{const j=tutJenis();return {html:head('Video tutorial','#/pengaturan/tentang')+`<p class="mut" style="margin:0 0 14px">Panduan singkat memakai aplikasi Fadzkuruuni. Pilih <b>HP</b> atau <b>Desktop / laptop</b> sesuai perangkat yang kamu pakai, karena letak tombolnya berbeda.</p>
${seg('tutj',TUTJ,j)}
${TUTOR.map((t,i)=>`<section class="tut" data-tut="${t.id}"><div class="tuth"><span class="tutn">${i+1}</span><div><b>${esc(t.judul)}</b><small class="mut">${esc(t.ket)} · ${t.durasi}</small></div></div>
<div class="tutis" data-j="hp"${j=='hp'?'':' hidden'}>${tutVideo(t,'hp')}<details class="tutd"><summary>Langkah-langkah (HP)</summary>${tutLangkah(t,'hp')}</details></div>
<div class="tutis" data-j="desktop"${j=='desktop'?'':' hidden'}>${tutVideo(t,'desktop')}<details class="tutd"><summary>Langkah-langkah (desktop)</summary>${tutLangkah(t,'desktop')}</details></div>
${t.ke?`<a class="btn" href="${t.ke[0]}" style="display:block;text-align:center;margin-top:12px">${t.ke[1]}</a>`:''}</section>`).join('')}
<p class="mut" style="font-size:13px;text-align:center;margin:18px 0 0">Tutorial lain akan menyusul.</p>`,
 init(){segBind('tutj',v=>{S.tutj=v;save();$$('.tutis').forEach(e=>{const on=e.dataset.j==v;e.hidden=!on;if(!on)e.querySelector('video')?.pause()})})}}};
