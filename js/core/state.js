/* js/core/state.js - Keadaan aplikasi, penyimpanan, tema, registri halaman (P) */
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const S=Object.assign({theme:'auto',fs:32,tr:true,gold:'',loc:{lat:-6.9175,lng:107.6191,n:'Bandung',tz:7},hist:[],tas:0},JSON.parse(localStorage.fz||'{}'));
const save=()=>{localStorage.fz=JSON.stringify(S);window.cloudPush&&window.cloudPush()};
const rp=n=>'Rp '+Math.round(n).toLocaleString('id-ID');
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2200)};
/* Tema: auto (ikut perangkat), light, dark, blue */
const theme=()=>{const t=S.theme=='blue'?'blue':S.theme=='dark'||(S.theme=='auto'&&matchMedia('(prefers-color-scheme:dark)').matches)?'dark':'light';document.documentElement.dataset.theme=t;accent()};
/* Warna aksen: [terang utama, terang turunan, gelap utama, gelap turunan] */
const ACC={emerald:['#24584a','#3a7363','#7fb5a2','#9fcdbb'],teal:['#0f5f63','#2b7f83','#7cc7cb','#a6dadd'],blue:['#24497d','#3b68a6','#8fb6e6','#adcbf0']};
const ARF={times:"'Times New Roman',Times,serif",amiri:"'Amiri',serif",scheh:"'Scheherazade New',serif"};
const accent=()=>{const t=document.documentElement.dataset.theme,a=t=='blue'?ACC.blue:ACC[S.ac]||ACC.emerald,r=document.documentElement.style,dk=t=='dark';r.setProperty('--g',dk?a[2]:a[0]);r.setProperty('--g2',dk?a[3]:a[1]);r.setProperty('--ar',ARF[S.af]||ARF.times);
 const m=$('meta[name=theme-color]');m&&m.setAttribute('content',dk?'#121413':t=='blue'?'#24497d':'#1f5a43')};
theme();
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',theme);
const P={};
const VER='1.6.0';
const REPORT={wa:'6289506138191',url:'',nocors:false};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let LAST='#/',LASTT='';
/* Warna teks bacaan (Arab, latin, terjemah): 'auto' = hitam (putih di tema gelap); selain itu kode warna pilihan pengguna */
const WTEKS=[['auto','Hitam'],['#1f5a43','Hijau'],['#1f4f8f','Biru'],['#6b3f1d','Coklat'],['#7a1f2b','Merah tua']];
const setSz=()=>{const r=document.documentElement.style;r.setProperty('--lt',(S.fl||15)+'px');r.setProperty('--tr',(S.fi||14)+'px');S.tc&&S.tc!='auto'?r.setProperty('--tc',S.tc):r.removeProperty('--tc')};
/* Pilihan warna teks: bulatan warna + pemilih warna bebas; dipakai di Tampilan & Bacaan dan pengaturan baca */
const wteksUI=()=>`<div class="wtk" id="wtk">${WTEKS.map(([v,n])=>`<button type="button" data-tc="${v}" class="${(S.tc||'auto')==v?'on':''}" style="--c:${v=='auto'?'var(--ink)':v}" aria-label="${n}"><i></i><small>${n}</small></button>`).join('')}<label class="wtkb" aria-label="Warna lain"><input type="color" id="tcx" value="${S.tc&&S.tc[0]=='#'?S.tc:'#333333'}"><small>Lainnya</small></label></div>`;
const wteksBind=()=>{const pasang=v=>{S.tc=v;save();setSz();$$('#wtk [data-tc]').forEach(b=>b.classList.toggle('on',b.dataset.tc==v))};$$('#wtk [data-tc]').forEach(b=>b.onclick=()=>pasang(b.dataset.tc));const x=$('#tcx');if(x)x.oninput=e=>pasang(e.target.value)};
setSz();
