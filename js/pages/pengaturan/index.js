/* js/pages/pengaturan/index.js - Pengaturan: pusat kelompok (tiap kelompok ada di berkas sendiri)
   Urutan menurut seberapa sering dibuka: akun paling atas, lalu pengaturan harian, pengetahuan, lalu Tentang & Bantuan paling bawah.
   Kunci berawalan '#' adalah tautan ke halaman lain, bukan kelompok Pengaturan. */
const SETGROUPS=[['akun','user','Akun & Profil','Masuk dengan Google atau Facebook, dan nama panggilan'],['salat','bell','Waktu Salat & Notifikasi','Lokasi, izin, adzan, dan pengingat'],['tampilan','moon','Tampilan & Bacaan','Tema, ukuran teks, terjemah, tasbih melayang'],['offline','down','Offline & Data','Mode offline: unduh Al-Qur\'an, audio, kitab, maulid'],['izin','shield','Izin Aplikasi','Notifikasi, lokasi, mikrofon, kamera, penyimpanan'],['beranda','home','Beranda','Kata-kata yang bergulir di bawah jam'],['#/hadits/info','book','Info sanad & derajat hadis','Arti sanad, rawi, sahih, hasan, dan daif'],['tentang','info','Tentang & Bantuan','Tentang aplikasi dan laporan masalah']];
const SETPAGES={};
/* Kelompok seperti Pengaturan Instagram: judul kecil abu-abu, pemisah tebal antar kelompok. Urutan kelompok mengikuti urutan item (bisa diatur admin). */
const SETKEL=[['Akun Anda',['akun']],['Ibadah & pengingat',['salat']],['Tampilan & konten',['tampilan','beranda']],['Data & perangkat',['offline','izin']],['Info & bantuan',['#/hadits/info','tentang']]];
const setBaris=x=>`<a class="row${(TATA.sembunyiSet||[]).includes(x[0])?' tah':''}" data-ta="set:${x[0]}" href="${x[0][0]=='#'?x[0]:'#/pengaturan/'+x[0]}"><span class="si">${ic(x[1],20)}</span><span class="t">${esc(x[2])}<br><small>${x[3]}</small></span>${ic('next',18)}</a>`;
function setKelompok(L){const kel=k=>(SETKEL.find(g=>g[1].includes(k))||['Lainnya'])[0],G=[];L.forEach(x=>{const n=kel(x[0]);let g=G.find(y=>y[0]==n);if(!g)G.push(g=[n,[]]);g[1].push(x)});
 return G.map(g=>`<section class="setg"><h3>${esc(g[0])}</h3><div class="list">${g[1].map(setBaris).join('')}</div></section>`).join('')}
P.pengaturan=g=>{if(SETPAGES[g])return SETPAGES[g]();const adm=TADMON&&TDRAF;
 return {html:head('Pengaturan','#/')+`<label class="setcari">${ic('search',18)}<input type="search" id="setq" placeholder="Cari" autocomplete="off"></label>`+(adm?`<div class="list">${SETGROUPS.slice().sort((p,q)=>(TATA.setelan||SETGROUPS.map(x=>x[0])).indexOf(p[0])-(TATA.setelan||SETGROUPS.map(x=>x[0])).indexOf(q[0])).map(setBaris).join('')}</div>`:setKelompok(tataSetelan()))+'<p class="mut setkosong" hidden>Tidak ada pengaturan yang cocok.</p>',
  /* Cari: saring item menurut judul & keterangan; kelompok yang kosong disembunyikan */
  init(){const q=$('#setq');if(!q)return;q.oninput=()=>{const t=q.value.trim().toLowerCase();let ada=0;$$('#view .row[data-ta]').forEach(r=>{const ok=!t||r.textContent.toLowerCase().includes(t);r.hidden=!ok;ada+=ok});
   $$('#view .setg').forEach(s=>s.hidden=!$$('.row[data-ta]:not([hidden])',s).length);$('#view .setkosong').hidden=!!ada}}}};
