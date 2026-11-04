/* js/pages/pengaturan/tentang.js - Pengaturan: Tentang dan Bantuan */
SETPAGES.tentang=()=>({html:head('Tentang & Bantuan','#/pengaturan')+`<div class="list sg">${lk('#/tentang','info','Tentang aplikasi')}${lk('#/tutorial','play','Video tutorial')}${lk('#/lapor','flag','Laporkan bug atau kesalahan penulisan')}</div>
<h2>Privasi</h2><div class="list sg">${row('count','Bantu kembangkan aplikasi','Kirim hitungan pemakaian tanpa data pribadi (fitur yang dibuka, kota jadwal salat)',tg('stt',S.stat!==false))}</div><p class="mut" style="text-align:center">Versi ${VER}</p>`,
 init(){$('#stt').onchange=e=>{S.stat=e.target.checked;save()}}});
