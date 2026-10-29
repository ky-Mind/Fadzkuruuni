/* js/core/ui.js - Komponen antarmuka bersama (daftar, tab, segmen, tombol, dialog) */
const list=(a,fn)=>`<div class="list">${a.map(fn).join('')}</div>`;
const head=(t,back='#/',x='')=>`<div class="bar"><a class="bk" href="${back=='back'?'javascript:history.back()':back}" aria-label="Kembali">${ic('back',22)}</a><h1>${t}</h1>${x}</div>`;
const tabs=(a,i=0)=>`<div class="tabs">${a.map((x,k)=>`<button data-tab="${k}" class="${k==i?'on':''}">${x}</button>`).join('')}</div>`;
const soon=a=>list(a,(x,i)=>`<a class="row" href="#/segera/${encodeURIComponent(x)}"><span class="num">${i+1}</span><span class="t">${x}<br><small>Segera hadir</small></span>${ic('next',18)}</a>`);
function twoTabs(t,l,r,A,B,back='#/'){return {html:head(t,back)+tabs([l,r])+`<div id="tb">${A}</div>`,init(){$$('[data-tab]').forEach(b=>b.onclick=()=>{$$('[data-tab]').forEach(x=>x.classList.toggle('on',x==b));$('#tb').innerHTML=b.dataset.tab==0?A:B})}}}
const row=(i,t,sb,r)=>`<div class="srw"><span class="si">${ic(i,20)}</span><span class="t">${t}${sb?`<br><small class="mut">${sb}</small>`:''}</span>${r}</div>`;
const tg=(id,on)=>`<label class="tg"><input type="checkbox" id="${id}" ${on?'checked':''}><i></i></label>`;
const lk=(h,i,t)=>`<a class="srw" href="${h}"><span class="si">${ic(i,20)}</span><span class="t">${t}</span>${ic('next',18)}</a>`;
const seg=(id,o,v)=>`<div class="seg" id="${id}">${o.map(x=>`<button type="button" data-v="${x[0]}" class="${x[0]==v?'on':''}">${x[1]}</button>`).join('')}</div>`;
const segBind=(id,fn)=>$$('#'+id+' button').forEach(b=>b.onclick=()=>{$$('#'+id+' button').forEach(x=>x.classList.toggle('on',x==b));fn(b.dataset.v)});
const stp=(k,v,max)=>`<span class="stp" data-k="${k}" data-max="${max}"><button type="button" data-s="-1" aria-label="Kurangi">−</button><b>${v}</b><button type="button" data-s="1" aria-label="Tambah">+</button></span>`;
function msheet(t,h){const e=document.createElement('div');e.className='back-d';e.innerHTML=`<div class="sheet" role="dialog"><b>${t}</b><div style="margin:8px 0">${h}</div><button class="btn" style="width:100%" data-x>Mengerti</button></div>`;document.body.append(e);e.onclick=x=>{if(x.target==e||x.target.closest('[data-x]'))e.remove()}}
const zoomBar=()=>`<div class="zb"><span class="mut">Ukuran teks</span><button type="button" data-z="-2" aria-label="Perkecil">A−</button><b>${S.fs}</b><button type="button" data-z="2" aria-label="Perbesar">A+</button></div>`;
const NOTE=`<div class="note">${ic('info',18)}<span>Aplikasi masih dalam masa pengembangan. Bila ada yang keliru, mohon konfirmasi lewat <a href="#/tentang">Laporkan bug</a>.</span><button class="ib2" data-nb aria-label="Tutup">×</button></div>`;
const mk=(c,h)=>{const e=document.createElement('div');e.className=c;e.innerHTML=h;document.body.append(e);return e};
function dlg(t,m,fn){const e=mk('dlg',`<div role="dialog"><div class="ok">${ic('check',30)}</div><b style="font-size:18px">${t}</b><p class="mut" style="margin:8px 0 16px">${m}</p><button class="btn" style="width:100%">Tutup</button></div>`);e.onclick=x=>{if(x.target==e||x.target.tagName=='BUTTON'){e.remove();fn&&fn()}}}
const RS=`<button class="ib" data-rs aria-label="Pengaturan baca">${ic('sliders',20)}</button>`;
