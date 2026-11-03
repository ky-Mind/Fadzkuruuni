/* js/pages/tasbih.js - Tasbih dan tombol hitung melayang (bisa digeser ke mana saja di layar). Pengaturan ada di tombol kecil di layang dan di Tampilan & Bacaan. */
S.tt=S.tt||33;
/* Getar: tiap hitungan getar singkat; saat target tercapai getar sesuai pola pilihan (S.vpola) */
const VPOLA={pendek:[140],panjang:[550],ganda:[160,90,160,90,320]};
const VPOLAS=[['pendek','Pendek'],['panjang','Panjang'],['ganda','Berpola']];
const buzz=p=>{if(S.vib!==false&&navigator.vibrate)try{navigator.vibrate(p)}catch(e){}};
/* Tasbih melayang: lingkaran manik-manik (33 butir) yang terisi sesuai hitungan, angka di tengah, rumbai di bawah */
const MANIK=33,MANIKSVG=Array.from({length:MANIK},(_,i)=>{const a=(i/MANIK)*2*Math.PI-Math.PI/2;return `<circle class="mk" cx="${(50+42*Math.cos(a)).toFixed(2)}" cy="${(50+42*Math.sin(a)).toFixed(2)}" r="3.7"/>`}).join('');
const tUpd=()=>{const f=$('#fc');if(f){const n=Math.round(S.tas/S.tt*MANIK);$('#fcn').textContent=S.tas;$('#fct').textContent=S.tas+'/'+S.tt;$$('#fc .mk').forEach((m,i)=>m.classList.toggle('on',i<n))}const c=$('#c');if(c){c.textContent=S.tas;$('#tg').textContent=S.tas+' / '+S.tt}};
const tap=()=>{S.tas++;const f=$('#fc');let kls='tk';if(S.tas>=S.tt){buzz(VPOLA[S.vpola]||VPOLA.ganda);toast('Target '+S.tt+' tercapai');S.tas=0;kls='penuh'}else buzz(18);
 if(f){f.classList.remove('tk','penuh');void f.offsetWidth;f.classList.add(kls)}save();tUpd()};
const ftb=mk('',`<button id="fc" aria-label="Tasbih: tambah hitungan"><svg class="fcr" viewBox="0 0 100 100" aria-hidden="true">${MANIKSVG}</svg><b id="fcn">0</b><small id="fct">0/33</small></button><svg class="rumbai" viewBox="0 0 20 34" aria-hidden="true"><circle cx="10" cy="4" r="3.6"/><path d="M8 7h4l1 4h-6z"/><path d="M6.5 11h7l3 21H3.5z"/></svg><button id="fg" aria-label="Pengaturan tasbih">${ic('more',18)}</button>`);
/* Disembunyikan sampai halaman pertama siap (ftUpd), agar tidak sempat muncul sekilas saat aplikasi dimuat ulang */
ftb.id='ftb';ftb.hidden=true;
$('#fc').onclick=tap;

/* Posisi disimpan dalam piksel dan dijepit agar tetap di dalam layar */
/* x,y dalam koordinat layar; dibagi skala tampilan (zoom di HP) saat dipasang sebagai left/top */
const place=(x,y)=>{const z=zmKini();x=Math.min(Math.max(0,x),innerWidth-ftb.offsetWidth*z);y=Math.min(Math.max(0,y),innerHeight-ftb.offsetHeight*z);Object.assign(ftb.style,{left:x/z+'px',top:y/z+'px',right:'auto',bottom:'auto'});return {x,y}};

/* Geser dilacak di dokumen (bukan di tombol), jadi tetap jalan walau kursor atau jari keluar dari tombol.
   Ketukan biasa tidak diubah: klik tetap sampai ke tombol. */
let dg=null;
const mv=e=>{if(!dg)return;if(!dg.moved){if(Math.hypot(e.clientX-dg.sx,e.clientY-dg.sy)<6)return;dg.moved=true}place(e.clientX-dg.dx,e.clientY-dg.dy);ftpLetak()};
const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);if(dg&&dg.moved){const r=ftb.getBoundingClientRect();S.ftp=place(r.left,r.top);save();ftb.dataset.drag=1}dg=null};
ftb.addEventListener('pointerdown',e=>{if(e.target.closest('#fg'))return;delete ftb.dataset.drag;const r=ftb.getBoundingClientRect();dg={dx:e.clientX-r.left,dy:e.clientY-r.top,sx:e.clientX,sy:e.clientY,moved:false};addEventListener('pointermove',mv);addEventListener('pointerup',up)});
ftb.addEventListener('click',e=>{if(ftb.dataset.drag){delete ftb.dataset.drag;e.stopPropagation();e.preventDefault()}},true);
addEventListener('resize',()=>{if(S.ftp)place(S.ftp.x,S.ftp.y)});

/* Pengaturan tasbih melayang: panel kecil yang ikut melayang di samping tombol (getar, target, reset, sembunyikan).
   Tutup dengan ketuk di luar panel, tombol pengaturan lagi, atau Esc. */
const ftpTutup=()=>{const p=$('#ftp');if(!p)return;p.classList.add('out');setTimeout(()=>p.remove(),140)};
const ftpLetak=()=>{const p=$('#ftp');if(!p)return;const z=zmKini(),r=ftb.getBoundingClientRect(),w=p.offsetWidth*z,h=p.offsetHeight*z;
 let x=Math.min(Math.max(8,r.right-w),innerWidth-w-8),y=r.top-h-10;if(y<8)y=Math.min(r.bottom+10,innerHeight-h-8);
 p.style.left=x/z+'px';p.style.top=y/z+'px';p.style.transformOrigin=`${(r.left+r.width/2-x)/z}px ${y<r.top?h/z:0}px`};
ftb.querySelector('#fg').onclick=e=>{e.stopPropagation();if($('#ftp'))return ftpTutup();
 const p=mk('ftp',`<div class="ftph"><b>Tasbih</b><button class="ib2" data-fx aria-label="Tutup">×</button></div><div class="ftpr"><span>Getar saat menghitung</span>${tg('fvb',S.vib!==false)}</div><small class="mut">Getar saat target tercapai</small>${seg('fvp',VPOLAS,S.vpola||'ganda')}<small class="mut">Target</small>${seg('ftt',[[33,'33'],[99,'99'],[100,'100'],[1000,'1000']],S.tt)}<div class="ftpa"><button class="sb" id="frz">Reset</button><button class="sb dng" id="fhd">Sembunyikan</button></div>`);
 p.id='ftp';p.setAttribute('role','dialog');p.setAttribute('aria-label','Pengaturan tasbih melayang');ftpLetak();
 $('#fvb').onchange=e=>{S.vib=e.target.checked;save();S.vib&&buzz(18)};segBind('fvp',v=>{S.vpola=v;save();buzz(VPOLA[v])});
 segBind('ftt',v=>{S.tt=+v;S.tas=0;save();tUpd()});
 $('#frz').onclick=()=>{S.tas=0;save();tUpd();toast('Hitungan direset')};
 $('#fhd').onclick=()=>{S.ft=false;save();ftUpd();ftpTutup();toast('Tasbih melayang disembunyikan')};
 $('[data-fx]',p).onclick=ftpTutup;
};
document.addEventListener('pointerdown',e=>{if($('#ftp')&&!e.target.closest('#ftp,#fg'))ftpTutup()},true);
addEventListener('keydown',e=>{if(e.key=='Escape')ftpTutup()});
addEventListener('resize',ftpLetak);
addEventListener('hashchange',ftpTutup);

const ftUpd=()=>{if(S.ft===false)ftpTutup();ftb.hidden=S.ft===false||location.hash.slice(2).split('/')[0]=='tasbih';if(S.ftp)place(S.ftp.x,S.ftp.y);tUpd()};
P.tasbih=()=>({html:head('Tasbih')+`<button class="cnt" id="c">0</button><div class="mut" style="text-align:center" id="tg"></div><div class="mut" style="text-align:center;margin:16px 0 6px">Target hitungan</div>${seg('tt',[[33,'33'],[99,'99'],[100,'100'],[1000,'1000']],S.tt)}<div style="text-align:center;margin-top:14px"><button class="btn s" id="rz">Reset</button></div>`,
 init(){tUpd();$('#c').onclick=tap;$('#rz').onclick=()=>{S.tas=0;save();tUpd()};segBind('tt',v=>{S.tt=+v;S.tas=0;save();tUpd()})}});
