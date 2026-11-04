/* js/pages/salat.js - Jadwal salat dan arah kiblat */
/* Piringan kompas kiblat: arah mata angin, garis derajat, dan jarum dengan Ka'bah di ujungnya (berputar mengikuti kompas) */
const kiblatDial=b=>{let t='';for(let a=0;a<360;a+=5){const p=a%90==0,m=a%30==0;t+=`<line x1="120" y1="${p?14:m?16:18}" x2="120" y2="${p?30:m?26:23}" class="${p?'tkp':m?'tkm':'tk'}" transform="rotate(${a} 120 120)"/>`}
 const A=[['U',0],['T',90],['S',180],['B',270]].map(([h,a])=>`<text x="120" y="48" class="${h=='U'?'mau':'ma'}" transform="rotate(${a} 120 120)">${h}</text>`).join('');
 return `<div class="kbl"><span class="kbm" aria-hidden="true"></span><div class="kbd" id="nd"><svg viewBox="0 0 240 240" aria-label="Kompas kiblat"><circle cx="120" cy="120" r="112" class="kbc"/><circle cx="120" cy="120" r="80" class="kbi"/>${t}${A}
 <g transform="rotate(${b.toFixed(1)} 120 120)"><path d="M120 120 L112 70 L120 52 L128 70 Z" class="kbj"/><path d="M120 120 L114 150 L120 160 L126 150 Z" class="kbe"/>
 <g transform="translate(120 32)"><rect x="-13" y="-13" width="26" height="26" rx="3" class="kka"/><rect x="-13" y="-6" width="26" height="4.5" class="kkb"/><rect x="-3" y="2" width="6" height="11" rx="1" class="kkb"/></g></g>
 <circle cx="120" cy="120" r="9" class="kbp"/><circle cx="120" cy="120" r="3.5" class="kbq"/></svg></div></div>`};
P.kiblat=()=>{const r=Math.PI/180,{lat,lng}=S.loc,dl=(39.8262-lng)*r,b=((Math.atan2(Math.sin(dl),Math.cos(lat*r)*Math.tan(21.4225*r)-Math.sin(lat*r)*Math.cos(dl))/r)+360)%360;
 return {html:head('Arah kiblat')+locCard()+`<div class="card" style="text-align:center"><b style="font-size:30px">${b.toFixed(1)}°</b><br><small class="mut">dari utara sejati · ${S.loc.n}</small>${kiblatDial(b)}<p class="mut" id="kh">Atur lokasi lebih dulu, lalu aktifkan kompas dan goyangkan ponsel membentuk angka 8 agar akurat.</p><button class="btn" id="cmp">Aktifkan kompas</button></div>`,
 init(){let pas=0;$('#cmp').onclick=async()=>{try{if(DeviceOrientationEvent.requestPermission&&await DeviceOrientationEvent.requestPermission()!='granted')throw 0}catch(e){return toast('Izin sensor ditolak')}
  const f=e=>{const h=e.webkitCompassHeading??(e.alpha!=null?360-e.alpha:null);if(h==null||!$('#nd'))return;$('#nd').style.transform=`rotate(${-h}deg)`;
   /* Lurus ke kiblat (selisih < 4°): jarum & Ka'bah menyala, getar sekali */
   const d=Math.abs(((b-h)%360+540)%360-180),ok=d<4;$('.kbl')?.classList.toggle('pas',ok);if(ok&&!pas)buzz&&buzz(40);pas=ok;
   $('#kh').textContent=ok?'Sudah menghadap kiblat.':'Putar badan hingga Ka\'bah di ujung jarum berada di penanda atas.'};
  addEventListener('deviceorientationabsolute',f,true);addEventListener('deviceorientation',f,true);toast('Kompas aktif')}}}};
P.jadwal=()=>({html:head('Jadwal salat')+`<div class="hero jh"><small id="jn"></small><div class="big" id="jc">--</div><small id="jl"></small></div><div style="margin-top:12px">${locCard()}</div><div id="jt" style="margin-top:12px"></div><p class="mut">${hijri()}. Waktu dihitung di perangkat (Subuh 20°, Isya 18°), sehingga tetap bekerja tanpa internet. Selisih 1–3 menit dari jadwal resmi wajar; tambahkan ihtiyat bila perlu.</p>`,
 init(){const tick=()=>{if(!$('#jt'))return clearInterval(P.tj);const T=waktu(new Date(),S.loc),c=locNow(),idx=T.findIndex((x,i)=>i!=1&&x[1]>c),k=idx<0?0:idx;let df=T[k][1]-c;if(idx<0)df+=24;const D=Math.max(0,Math.round(df*60)),h=D/60|0,m=D%60;
  $('#jn').textContent='Menuju waktu '+T[k][0];$('#jc').textContent=(h?h+' jam ':'')+m+' menit';$('#jl').textContent=T[k][0]+' pukul '+hm(T[k][1])+' '+tzl()+' · '+S.loc.n;
  $('#jt').innerHTML=list(T,(x,i)=>`<div class="row ${i==k?'nx':''}"><span class="t">${x[0]}</span><b>${hm(x[1])}</b></div>`)};tick();clearInterval(P.tj);P.tj=setInterval(tick,15000)}});
