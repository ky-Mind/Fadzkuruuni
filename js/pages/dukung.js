/* js/pages/dukung.js - Dukung kami: satu-satunya tempat pembayaran di aplikasi (donasi untuk pengembangan Fadzkuruuni).
   Fitur bayar zakat/infak/kurban/fidyah dan riwayat pembayaran sudah dihapus; menu Zakat & sedekah kini mengarah ke sini.
   Nomor tujuan bisa disalin (data-copy, js/core/events.js); konfirmasi donasi lewat WhatsApp tim. */
const BANK=[['BSI','7283603126'],['Dana','089652243480'],['GoPay','089652243480'],['OVO','030037791453'],['SeaBank','901696052778'],['Bank Saqu','10088196215']];
P.dukung=()=>({html:head('Dukung kami','back')+`<div class="card dkh"><span class="dki">${ic('heart',26)}</span><b>Bantu Fadzkuruuni terus berkembang</b>
<p class="mut">Fadzkuruuni gratis dan tanpa iklan, dikembangkan oleh <b>KyMind</b> bersama tim Pondok Pesantren Fadzkuruuni. Dukunganmu dipakai untuk biaya server dan Fadz AI, membuat fitur-fitur baru, dan menyemangati pengembang agar terus memperbaiki aplikasi ini.</p></div>
<h3 class="sec">Donasi untuk pengembangan</h3>
<div class="list">${BANK.map(b=>`<div class="row dkr"><span class="t">${b[0]}<br><b>${b[1]}</b></span><button type="button" class="sb" data-copy="${b[1]}">${ic('copy',14)} Salin</button></div>`).join('')}</div>
<p class="mut" style="font-size:13px;margin:8px 0 0">Berapa pun nominalnya sangat berarti. Nama penerima yang muncul saat transfer adalah nama pengembang Fadzkuruuni.</p>
<a class="btn" id="dkwa" href="#" style="display:block;text-align:center;margin-top:12px">Sudah berdonasi? Kabari kami</a>
<h3 class="sec">Dukungan tanpa biaya</h3>
<div class="list"><a class="srw" href="#" id="dkbg"><span class="si">${ic('share',20)}</span><span class="t">Bagikan aplikasi ke teman dan keluarga</span>${ic('next',18)}</a>${lk('#/lapor','flag','Laporkan bug atau beri saran')}<div class="srw"><span class="si">${ic('moon',20)}</span><span class="t">Doakan tim Fadzkuruuni agar istikamah</span></div></div>
<p class="mut tkred">Jazakumullahu khairan atas dukunganmu</p>`,
 init(){
  $('#dkwa').onclick=e=>{e.preventDefault();const u='https://wa.me/'+REPORT.wa+'?text='+encodeURIComponent("Assalamu'alaikum, saya sudah berdonasi untuk pengembangan aplikasi Fadzkuruuni.");if(!open(u,'_blank'))location.href=u};
  $('#dkbg').onclick=async e=>{e.preventDefault();const d={title:'Fadzkuruuni',text:'Aplikasi ibadah Fadzkuruuni: Al-Qur\'an, jadwal salat, kitab, doa, dan Fadz AI. Gratis tanpa iklan.',url:'https://fadzkuruuni.vercel.app'};
   try{if(navigator.share)await navigator.share(d);else{await navigator.clipboard.writeText(d.text+' '+d.url);toast('Tautan aplikasi disalin')}}catch(x){}}}});
