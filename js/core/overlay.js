/* js/core/overlay.js - Tombol kembali bertahap: satu lapisan per tekan (lembar/dialog, lalu layar penuh, baru halaman). Plus dialog konfirmasi. */
let OVN=0,OVSKIP=0,OVPOP=0,FSPUSH=0;
new MutationObserver(ms=>ms.forEach(m=>{
 m.addedNodes.forEach(n=>{if(n.classList&&n.classList.contains('back-d')){history.pushState({ov:1},'');OVN++}});
 m.removedNodes.forEach(n=>{if(n.classList&&n.classList.contains('back-d')&&OVN>0){OVN--;if(OVPOP>0){OVPOP--;return}if(history.state&&history.state.ov){OVSKIP++;history.back()}}})
})).observe(document.body,{childList:true});
addEventListener('popstate',e=>{
 if(OVSKIP>0){OVSKIP--;return}
 const o=document.querySelectorAll('.back-d');if(o.length){OVPOP++;o[o.length-1].remove();return}
 if(FSPUSH&&document.body.classList.contains('full')){FSPUSH=0;fsSet(false,null,true)}});
function fsSet(on,n,viaBack){S.full=on;save();document.body.classList.toggle('full',on);if(window.QA&&$('#ay'))drawAy($('#ay'),window.QA,n||+location.hash.split('/')[2]);
 if(on){history.pushState({fs:1},'');FSPUSH=1}else if(!viaBack&&FSPUSH&&history.state&&history.state.fs){FSPUSH=0;OVSKIP++;history.back()}}
function konfirmasi(t,m,ya,fn){const e=document.createElement('div');e.className='back-d';e.innerHTML=`<div class="sheet" role="alertdialog" aria-label="${esc(t)}"><b>${esc(t)}</b><p class="mut" style="margin:6px 0 14px">${esc(m)}</p><div class="act"><button class="btn" data-ya style="flex:1">${esc(ya)}</button><button class="btn s" data-x>Batal</button></div></div>`;document.body.append(e);e.onclick=x=>{if(x.target==e||x.target.closest('[data-x]'))e.remove();else if(x.target.closest('[data-ya]')){e.remove();fn()}}}
