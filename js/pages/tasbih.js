/* js/pages/tasbih.js - Tasbih dan tombol tasbih melayang */
S.tt=S.tt||33;
const tUpd=()=>{const f=$('#fc');if(f)f.textContent=S.tas;const c=$('#c');if(c){c.textContent=S.tas;$('#tg').textContent=S.tas+' / '+S.tt}};
const tap=()=>{S.tas++;if(S.tas>=S.tt){navigator.vibrate?.(80);toast('Target '+S.tt+' tercapai');S.tas=0}else navigator.vibrate?.(12);save();tUpd()};
const ftb=mk('','<button id="fc" aria-label="Tasbih: tambah hitungan">0</button><button id="fr" aria-label="Reset tasbih">↺</button>');
ftb.id='ftb';
$('#fc').onclick=tap;
$('#fr').onclick=()=>{S.tas=0;save();tUpd()};
const ftUpd=()=>{ftb.hidden=S.ft===false||location.hash.slice(2).split('/')[0]=='tasbih';tUpd()};
P.tasbih=()=>({html:head('Tasbih')+`<button class="cnt" id="c">0</button><div class="mut" style="text-align:center" id="tg"></div><div class="mut" style="text-align:center;margin:16px 0 6px">Target hitungan</div>${seg('tt',[[33,'33'],[99,'99'],[100,'100'],[1000,'1000']],S.tt)}<div style="text-align:center;margin-top:14px"><button class="btn s" id="rz">Reset</button></div>`,
 init(){tUpd();$('#c').onclick=tap;$('#rz').onclick=()=>{S.tas=0;save();tUpd()};segBind('tt',v=>{S.tt=+v;S.tas=0;save();tUpd()})}});
