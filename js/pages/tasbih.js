/* js/pages/tasbih.js - Tasbih dan tombol hitung melayang (bisa digeser ke mana saja di layar). Pengaturan ada di tombol kecil di layang dan di Tampilan & Bacaan. */
S.tt=S.tt||33;
const tUpd=()=>{const f=$('#fc');if(f)f.textContent=S.tas;const c=$('#c');if(c){c.textContent=S.tas;$('#tg').textContent=S.tas+' / '+S.tt}};
const buzz=ms=>{if(S.vib!==false)navigator.vibrate?.(ms)};
const tap=()=>{S.tas++;if(S.tas>=S.tt){buzz(80);toast('Target '+S.tt+' tercapai');S.tas=0}else buzz(12);save();tUpd()};
const ftb=mk('','<button id="fc" aria-label="Tasbih: tambah hitungan">0</button><button id="fg" aria-label="Pengaturan tasbih">'+ic('sliders',13)+'</button>');
ftb.id='ftb';
$('#fc').onclick=tap;

/* Posisi disimpan dalam piksel dan dijepit agar tetap di dalam layar */
const place=(x,y)=>{x=Math.min(Math.max(0,x),innerWidth-ftb.offsetWidth);y=Math.min(Math.max(0,y),innerHeight-ftb.offsetHeight);Object.assign(ftb.style,{left:x+'px',top:y+'px',right:'auto',bottom:'auto'});return {x,y}};

/* Geser dilacak di dokumen (bukan di tombol), jadi tetap jalan walau kursor atau jari keluar dari tombol.
   Ketukan biasa tidak diubah: klik tetap sampai ke tombol. */
let dg=null;
const mv=e=>{if(!dg)return;if(!dg.moved){if(Math.hypot(e.clientX-dg.sx,e.clientY-dg.sy)<6)return;dg.moved=true}place(e.clientX-dg.dx,e.clientY-dg.dy)};
const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);if(dg&&dg.moved){const r=ftb.getBoundingClientRect();S.ftp=place(r.left,r.top);save();ftb.dataset.drag=1}dg=null};
ftb.addEventListener('pointerdown',e=>{if(e.target.closest('#fg'))return;delete ftb.dataset.drag;const r=ftb.getBoundingClientRect();dg={dx:e.clientX-r.left,dy:e.clientY-r.top,sx:e.clientX,sy:e.clientY,moved:false};addEventListener('pointermove',mv);addEventListener('pointerup',up)});
ftb.addEventListener('click',e=>{if(ftb.dataset.drag){delete ftb.dataset.drag;e.stopPropagation();e.preventDefault()}},true);
addEventListener('resize',()=>{if(S.ftp)place(S.ftp.x,S.ftp.y)});

/* Pengaturan tasbih melayang: getar, target, reset, dan sembunyikan */
ftb.querySelector('#fg').onclick=()=>{
 msheet('Tasbih melayang',`<div class="sw"><span>Getar saat menghitung</span>${tg('fvb',S.vib!==false)}</div><h2>Target hitungan</h2>${seg('ftt',[[33,'33'],[99,'99'],[100,'100'],[1000,'1000']],S.tt)}<div class="act"><button class="sb" id="frz">Reset hitungan</button><button class="sb dng" id="fhd">Sembunyikan tasbih</button></div>`);
 $('#fvb').onchange=e=>{S.vib=e.target.checked;save()};
 segBind('ftt',v=>{S.tt=+v;S.tas=0;save();tUpd()});
 $('#frz').onclick=()=>{S.tas=0;save();tUpd()};
 $('#fhd').onclick=()=>{S.ft=false;save();ftUpd();$('.back-d')?.remove();toast('Tasbih melayang disembunyikan')};
};

const ftUpd=()=>{ftb.hidden=S.ft===false||location.hash.slice(2).split('/')[0]=='tasbih';if(S.ftp)place(S.ftp.x,S.ftp.y);tUpd()};
P.tasbih=()=>({html:head('Tasbih')+`<button class="cnt" id="c">0</button><div class="mut" style="text-align:center" id="tg"></div><div class="mut" style="text-align:center;margin:16px 0 6px">Target hitungan</div>${seg('tt',[[33,'33'],[99,'99'],[100,'100'],[1000,'1000']],S.tt)}<div style="text-align:center;margin-top:14px"><button class="btn s" id="rz">Reset</button></div>`,
 init(){tUpd();$('#c').onclick=tap;$('#rz').onclick=()=>{S.tas=0;save();tUpd()};segBind('tt',v=>{S.tt=+v;S.tas=0;save();tUpd()})}});
