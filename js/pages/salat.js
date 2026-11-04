/* js/pages/salat.js - Jadwal salat dan arah kiblat */
/* Piringan kompas kiblat: arah mata angin, garis derajat, dan jarum dengan Ka'bah di ujungnya (berputar mengikuti kompas) */
const kiblatDial=b=>{let t='';for(let a=0;a<360;a+=5){const p=a%90==0,m=a%30==0;t+=`<line x1="120" y1="${p?14:m?16:18}" x2="120" y2="${p?30:m?26:23}" class="${p?'tkp':m?'tkm':'tk'}" transform="rotate(${a} 120 120)"/>`}
 const A=[['U',0],['T',90],['S',180],['B',270]].map(([h,a])=>`<text x="120" y="48" class="${h=='U'?'mau':'ma'}" transform="rotate(${a} 120 120)">${h}</text>`).join('');
 return `<div class="kbl"><span class="kbm" aria-hidden="true"></span><div class="kbd" id="nd"><svg viewBox="0 0 240 240" aria-label="Kompas kiblat"><circle cx="120" cy="120" r="112" class="kbc"/><circle cx="120" cy="120" r="80" class="kbi"/>${t}${A}
 <g transform="rotate(${b.toFixed(1)} 120 120)"><path d="M120 120 L112 70 L120 52 L128 70 Z" class="kbj"/><path d="M120 120 L114 150 L120 160 L126 150 Z" class="kbe"/>
 <g transform="translate(120 32)"><rect x="-13" y="-13" width="26" height="26" rx="3" class="kka"/><rect x="-13" y="-6" width="26" height="4.5" class="kkb"/><rect x="-3" y="2" width="6" height="11" rx="1" class="kkb"/></g></g>
 <circle cx="120" cy="120" r="9" class="kbp"/><circle cx="120" cy="120" r="3.5" class="kbq"/></svg></div></div>`};
/* Arah kiblat dari titik (lat,lng) ke Ka'bah, derajat dari utara sejati */
const KAABA=[21.4225,39.8262];
const arahKiblat=(lat,lng)=>{const r=Math.PI/180,dl=(KAABA[1]-lng)*r;return ((Math.atan2(Math.sin(dl),Math.cos(lat*r)*Math.tan(KAABA[0]*r)-Math.sin(lat*r)*Math.cos(dl))/r)+360)%360};
const jarakKaabah=(lat,lng)=>{const r=Math.PI/180,a=Math.sin((KAABA[0]-lat)*r/2)**2+Math.cos(lat*r)*Math.cos(KAABA[0]*r)*Math.sin((KAABA[1]-lng)*r/2)**2;return 6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))};
/* Garis lingkaran besar (jalur terpendek di bumi) dari lokasi ke Ka'bah: arah garis ini = arah kiblat */
const garisBesar=(a,b,n=96)=>{const r=Math.PI/180,[p1,l1]=[a[0]*r,a[1]*r],[p2,l2]=[b[0]*r,b[1]*r],d=2*Math.asin(Math.sqrt(Math.sin((p2-p1)/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin((l2-l1)/2)**2));if(!d)return [a,b];
 const P=[];for(let k=0;k<=n;k++){const f=k/n,A=Math.sin((1-f)*d)/Math.sin(d),B=Math.sin(f*d)/Math.sin(d),x=A*Math.cos(p1)*Math.cos(l1)+B*Math.cos(p2)*Math.cos(l2),y=A*Math.cos(p1)*Math.sin(l1)+B*Math.cos(p2)*Math.sin(l2),z=A*Math.sin(p1)+B*Math.sin(p2);P.push([Math.atan2(z,Math.hypot(x,y))/r,Math.atan2(y,x)/r])}return P};
const LEAFLET='https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/';
const leafletMuat=()=>window.L&&L.map?Promise.resolve():(kitabCss(LEAFLET+'leaflet.min.css'),ldjs(LEAFLET+'leaflet.min.js'));
P.kiblat=()=>{let b=arahKiblat(S.loc.lat,S.loc.lng);
 return {html:head('Arah kiblat')+locCard()+`<div class="card" style="text-align:center"><b style="font-size:30px" id="kbd0">${b.toFixed(1)}°</b><br><small class="mut" id="kbn">dari utara sejati · ${esc(S.loc.n)}</small><div id="kbw">${kiblatDial(b)}</div><p class="mut" id="kh">Atur lokasi lebih dulu, lalu aktifkan kompas dan goyangkan ponsel membentuk angka 8 agar akurat.</p><button class="btn" id="cmp">Aktifkan kompas</button></div>
<div class="card kmap"><div class="kmh"><span><b>Peta arah kiblat</b><small class="mut" id="kmj"></small></span>${seg('kml',[['peta','Peta'],['satelit','Satelit']],S.kml||'peta')}</div>
<div class="kmp" id="kmp"><p class="mut kmm">Memuat peta…</p></div>
<div class="kmf"><button type="button" class="sb" data-kmgps>${ic('pin',14)} Lokasi saya</button><button type="button" class="sb" data-kmsaya>${ic('compass',14)} Ke titikku</button><button type="button" class="sb" data-kmkb>${ic('kaaba',14)} Ka'bah</button></div>
<small class="mut kmk">Garis hijau adalah arah kiblat (jalur terpendek ke Ka'bah). Geser penanda <b>titikmu</b> atau ketuk lama di peta untuk memindahkan lokasi.</small></div>`,
 init(){let pas=0;$('#cmp').onclick=async()=>{try{if(DeviceOrientationEvent.requestPermission&&await DeviceOrientationEvent.requestPermission()!='granted')throw 0}catch(e){return toast('Izin sensor ditolak')}
  const f=e=>{const h=e.webkitCompassHeading??(e.alpha!=null?360-e.alpha:null);if(h==null||!$('#nd'))return;$('#nd').style.transform=`rotate(${-h}deg)`;
   /* Lurus ke kiblat (selisih < 4°): jarum & Ka'bah menyala, getar sekali */
   const d=Math.abs(((b-h)%360+540)%360-180),ok=d<4;$('.kbl')?.classList.toggle('pas',ok);if(ok&&!pas)buzz&&buzz(40);pas=ok;
   $('#kh').textContent=ok?'Sudah menghadap kiblat.':'Putar badan hingga Ka\'bah di ujung jarum berada di penanda atas.'};
  addEventListener('deviceorientationabsolute',f,true);addEventListener('deviceorientation',f,true);toast('Kompas aktif')};
  /* Peta (Leaflet + OpenStreetMap / citra satelit Esri): bisa digeser & dicubit seperti Google Maps */
  const kmp=$('#kmp');let M=null,lap={},saya=null,kb=null,gr=null;
  const info=()=>{$('#kmj').textContent=' · '+Math.round(jarakKaabah(S.loc.lat,S.loc.lng)).toLocaleString('id-ID')+' km ke Ka\'bah'};info();
  const lapis=v=>{if(!M)return;Object.values(lap).forEach(l=>M.removeLayer(l));lap[v].addTo(M);kmp.classList.toggle('sat',v=='satelit')};
  const gambarGaris=()=>{const a=[S.loc.lat,S.loc.lng];saya.setLatLng(a);gr.setLatLngs(garisBesar(a,KAABA))};
  /* Pindah titik: lokasi aplikasi (jadwal salat & kiblat) ikut diperbarui tanpa memuat ulang halaman */
  const pindah=(lat,lng,nama)=>{S.loc={...S.loc,lat:+lat.toFixed(5),lng:+(((lng+540)%360)-180).toFixed(5),n:nama||'Titik di peta'};save();b=arahKiblat(S.loc.lat,S.loc.lng);
   $('#kbd0').textContent=b.toFixed(1)+'°';$('#kbn').textContent='dari utara sejati · '+S.loc.n;$('#kbw').innerHTML=kiblatDial(b);const lc=$('.lc .t');if(lc)lc.innerHTML=`<b>${esc(S.loc.n)}</b><br><small class="mut">${S.loc.lat.toFixed(3)}, ${S.loc.lng.toFixed(3)} · ${tzl()}</small>`;
   info();if(M)gambarGaris();window.androidAdzan&&androidAdzan();if(!nama)lokasiNama(S.loc.lat,S.loc.lng)};
  segBind('kml',v=>{S.kml=v;save();lapis(v)});
  $('[data-kmgps]').onclick=()=>gps(()=>{pindah(S.loc.lat,S.loc.lng,'Lokasi saya');M&&M.flyTo([S.loc.lat,S.loc.lng],15,{duration:1})});
  $('[data-kmsaya]').onclick=()=>M&&M.flyTo([S.loc.lat,S.loc.lng],Math.max(M.getZoom(),13),{duration:.8});
  $('[data-kmkb]').onclick=()=>M&&M.flyTo(KAABA,17,{duration:1.2});
  if(!navigator.onLine){kmp.innerHTML='<p class="mut kmm">Peta butuh internet. Kompas di atas tetap bisa dipakai tanpa internet.</p>';return}
  leafletMuat().then(()=>{if(!$('#kmp'))return;kmp.innerHTML='';
   M=L.map(kmp,{zoomControl:true,attributionControl:true,worldCopyJump:true,tap:true}).setView([S.loc.lat,S.loc.lng],5);
   lap.peta=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'});
   lap.satelit=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Citra © Esri'});
   lapis(S.kml||'peta');
   const ikon=(k,h)=>L.divIcon({className:'kmi '+k,html:h,iconSize:[34,34],iconAnchor:[17,17]});
   kb=L.marker(KAABA,{icon:ikon('kmi-kb',ic('kaaba',20)),title:"Ka'bah",keyboard:false}).addTo(M);
   gr=L.polyline([],{color:'#16a34a',weight:4,opacity:.9,dashArray:'10 7'}).addTo(M);
   saya=L.marker([S.loc.lat,S.loc.lng],{icon:ikon('kmi-sy',ic('user',18)),draggable:true,title:'Titikmu',autoPan:true}).addTo(M);
   saya.on('drag',e=>{const p=e.target.getLatLng();gr.setLatLngs(garisBesar([p.lat,p.lng],KAABA))});
   saya.on('dragend',e=>{const p=e.target.getLatLng();pindah(p.lat,p.lng);toast('Lokasi dipindah ke titik ini')});
   M.on('contextmenu',e=>{pindah(e.latlng.lat,e.latlng.lng);buzz(25);toast('Lokasi dipindah ke titik ini')});
   gambarGaris();M.fitBounds(L.latLngBounds([[S.loc.lat,S.loc.lng],KAABA]),{padding:[30,30]});setTimeout(()=>M&&M.invalidateSize(),250)})
  .catch(()=>{kmp.innerHTML='<p class="mut kmm">Peta belum bisa dimuat. Periksa internet lalu buka lagi halaman ini.</p>'})}}};
const AZMODE={adzan:['Adzan','Suara adzan dan notifikasi','play'],beduk:['Beduk','Suara pukulan beduk dan notifikasi','bell'],alarm:['Alarm','Nada alarm HP dan notifikasi','clock'],bunyi:['Bunyi','Notifikasi dengan bunyi notifikasi biasa, tanpa adzan','bell'],senyap:['Senyap','Notifikasi saja, tanpa suara','eye'],mati:['Mati','Tidak ada pengingat untuk waktu ini','stop']};
/* Pengaturan pengingat satu waktu salat: jenis pengingat + suara muadzin (bisa didengar dulu) */
const WSN=k=>k==5?'Terbit':WS[k];
function jnSheet(k,ulang){if($('.back-d'))return;const e=document.createElement('div');e.className='back-d';let coba='';
 const henti=()=>{stopAdzan();coba='';$$('[data-coba]',e).forEach(b=>{b.classList.remove('on');b.innerHTML=ic('play',14)+' Coba'})};
 const umum=k==0?suaraPilih('subuh'):suaraPilih('adzan'),nmS=v=>(SUARA.find(x=>x[0]==v)||[0,'Bawaan aplikasi'])[1];
 const isi=()=>{const md=S.az.on?azMode(k):'mati',sv=azSuara(k);
  return `<div class="am-h"><b>Pengingat ${WSN(k)}</b><button class="ib2" data-x aria-label="Tutup">×</button></div>
<small class="mut jnh">Jenis pengingat</small><div class="am-l jnl">${Object.entries(AZMODE).filter(([v])=>!(k==5&&v=='adzan')).map(([v,[n,d,i]])=>`<button data-v="${v}" class="${v==md?'on':''}">${ic(i,20)}<span><b>${n}</b><small class="mut">${d}</small></span>${v==md?ic('check',18):v=='beduk'?`<i class="sb jnc" data-coba="beduk">${ic('play',14)} Coba</i>`:v=='bunyi'||v=='alarm'?`<i class="sb jnc" data-coba="bunyi">${ic('play',14)} Coba</i>`:''}</button>`).join('')}</div>
${md=='adzan'?`<small class="mut jnh">Suara adzan ${WSN(k)}</small><div class="am-l jnl jns">${[['','Ikuti pengaturan umum ('+nmS(umum)+')'],...SUARA.filter(x=>x[0]!='sendiri')].map(([v,n])=>`<button data-sv="${v}" class="${v==sv?'on':''}"><span><b>${esc(n)}</b></span><i class="sb jnc" data-coba="${v||umum}">${ic('play',14)} Coba</i>${v==sv?ic('check',18):''}</button>`).join('')}</div>`:''}
<button class="btn" data-x style="width:100%;margin-top:12px">Selesai</button>
<a class="mut jnk" href="#/pengaturan/salat">Pengaturan adzan lainnya (rekaman sendiri, pengingat sebelum waktu) ›</a>`};
 const gambar=()=>{const sc=e.querySelector('.sheet')?.scrollTop||0;e.innerHTML=`<div class="sheet am jns-s" role="dialog" aria-label="Pengingat ${WSN(k)}">${isi()}</div>`;e.querySelector('.sheet').scrollTop=sc};
 gambar();document.body.append(e);
 e.onclick=x=>{if(x.target==e||x.target.closest('[data-x]')){henti();e.remove();return ulang()}
  const c=x.target.closest('[data-coba]');if(c){x.stopPropagation();const v=c.dataset.coba;if(coba==v)return henti();henti();if(v=='bunyi'){beep();return}coba=v;c.classList.add('on');c.innerHTML=ic('stop',14)+' Henti';
   suaraSrc(k==0?'subuh':'adzan',v).then(src=>{putarSuara(src);if(ADZ)ADZ.onended=henti});return}
  const b=x.target.closest('[data-v]');if(b){const v=b.dataset.v;azSetMode(k,v);henti();gambar();ulang();toast(`${WSN(k)}: ${AZMODE[v][0].toLowerCase()=='mati'?'pengingat dimatikan':AZMODE[v][1].toLowerCase()}`);
   if(v!='mati'&&!window.ANDROID&&'Notification'in window&&Notification.permission!='granted')askNotif();return}
  const s=x.target.closest('[data-sv]');if(s){azSetSuara(k,s.dataset.sv);gambar();ulang()}}}
P.jadwal=()=>({html:head('Jadwal salat')+`<div class="hero jh"><small id="jn"></small><div class="big" id="jc">--</div><small id="jl"></small></div><div style="margin-top:12px">${locCard()}</div><div id="jt" style="margin-top:12px"></div><p class="mut">${hijri()}. Waktu dihitung di perangkat (Subuh 20°, Isya 18°), sehingga tetap bekerja tanpa internet. Selisih 1–3 menit dari jadwal resmi wajar; tambahkan ihtiyat bila perlu.</p>`,
 init(){const tick=()=>{if(!$('#jt'))return clearInterval(P.tj);const T=waktu(new Date(),S.loc),c=locNow(),idx=T.findIndex((x,i)=>i!=1&&x[1]>c),k=idx<0?0:idx;let df=T[k][1]-c;if(idx<0)df+=24;const D=Math.max(0,Math.round(df*60)),h=D/60|0,m=D%60;
  $('#jn').textContent='Menuju waktu '+T[k][0];$('#jc').textContent=(h?h+' jam ':'')+m+' menit';$('#jl').textContent=T[k][0]+' pukul '+hm(T[k][1])+' '+tzl()+' · '+S.loc.n;
  $('#jt').innerHTML=list(T,(x,i)=>{const w=i==1?5:WI.indexOf(i),md=w<0?'':S.az.on?azMode(w):'mati';return `<div class="row ${i==k?'nx':''}"><span class="t">${x[0]}</span><b>${hm(x[1])}</b>${w<0?'<span class="jnb jnx"></span>':`<button type="button" class="jnb jn-${md}" data-jn="${w}" aria-label="Pengingat ${x[0]}: ${AZMODE[md][0]}">${ic(AZMODE[md][2],14)}<span>${AZMODE[md][0]}</span></button>`}</div>`})};
  /* Ketuk tombol di tiap waktu: pilih Adzan / Notifikasi saja / Mati */
  $('#jt').onclick=e=>{const b=e.target.closest('[data-jn]');if(b)jnSheet(+b.dataset.jn,tick)};tick();clearInterval(P.tj);P.tj=setInterval(tick,15000)}});
