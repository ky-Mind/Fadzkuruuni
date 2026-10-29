/* js/pages/pengaturan/tentang.js - Pengaturan: Tentang dan Bantuan */
SETPAGES.tentang=()=>({html:head('Tentang & Bantuan','#/pengaturan')+`<div class="list sg">${lk('#/tentang','info','Tentang aplikasi')}${lk('#/lapor','flag','Laporkan bug atau kesalahan penulisan')}</div><p class="mut" style="text-align:center">Versi ${VER}</p>`});
