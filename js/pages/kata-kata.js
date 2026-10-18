/* js/pages/kata-kata.js - Kata-kata di Beranda (data yang bisa diedit) dan halaman Kata Mutiara */
let QEDIT=-1;
const QA=()=>{if(!S.qa){S.qa=QUOTES.map(q=>({t:q[1],p:q[0]}));if(S.qs){S.qs.forEach(t=>S.qa.push({t,p:'any'}));delete S.qs}}return S.qa};
const PNM={pagi:'Pagi',siang:'Siang',sore:'Sore',malam:'Malam',any:'Kapan saja'};
P.mutiara=()=>({html:head('Kata Mutiara')+(QA().length?QA().map(q=>`<div class="card" style="margin-bottom:10px"><p style="margin:0 0 8px">“${esc(q.t)}”</p><button class="sb" data-copy="${esc(q.t)}">Salin</button></div>`).join(''):'<div class="card mut">Belum ada kata-kata. Tambahkan di Pengaturan.</div>')});
function qrot(){const el=$('#qtx');if(!el)return;let i=Math.floor(Math.random()*97);const show=()=>{const e=$('#qtx');if(!e)return clearInterval(P.tq);const p=periode(),A=QA(),L=A.filter(q=>q.p==p||q.p=='any').map(q=>q.t),M=L.length?L:A.map(q=>q.t);e.classList.remove('qs2');void e.offsetWidth;e.textContent=M[i++%M.length]||'';e.classList.add('qs2')};show();clearInterval(P.tq);P.tq=setInterval(show,9000)}
