/* js/core/state.js - Keadaan aplikasi, penyimpanan, tema, registri halaman (P) */
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const S=Object.assign({theme:'auto',fs:32,tr:true,gold:'',loc:{lat:-6.9175,lng:107.6191,n:'Bandung',tz:7},hist:[],tas:0},JSON.parse(localStorage.fz||'{}'));
const save=()=>{localStorage.fz=JSON.stringify(S);window.cloudPush&&window.cloudPush()};
const rp=n=>'Rp '+Math.round(n).toLocaleString('id-ID');
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2200)};
const theme=()=>{const d=S.theme=='dark'||(S.theme=='auto'&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'};
theme();
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',theme);
const P={};
const VER='1.6.0';
const REPORT={wa:'6289506138191',url:'',nocors:false};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let LAST='#/';
const setSz=()=>{const r=document.documentElement.style;r.setProperty('--lt',(S.fl||15)+'px');r.setProperty('--tr',(S.fi||14)+'px')};
setSz();
