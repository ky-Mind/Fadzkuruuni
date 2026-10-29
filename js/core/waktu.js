/* js/core/waktu.js - Perhitungan waktu salat, Hijriah, lokasi */
function waktu(d,{lat,lng,tz:TZ}){
  const r=Math.PI/180,tz=TZ??-d.getTimezoneOffset()/60,n=v=>((v+12)%24+24)%24-12;
  const j=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),12)/864e5+2440587.5-2451545;
  const g=(357.529+.98560028*j)*r,q=280.459+.98564736*j,L=(q+1.915*Math.sin(g)+.02*Math.sin(2*g))*r,e=23.439*r;
  const ra=Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L))/r/15,dec=Math.asin(Math.sin(e)*Math.sin(L));
  const noon=12+tz-lng/15-n(q/15-ra),sL=Math.sin(lat*r),cL=Math.cos(lat*r),sD=Math.sin(dec),cD=Math.cos(dec);
  const h=a=>Math.acos(Math.max(-1,Math.min(1,(Math.sin(a*r)-sL*sD)/(cL*cD))))/r/15;
  const asr=Math.atan(1/(1+Math.tan(Math.abs(lat*r-dec))))/r;
  return [['Subuh',noon-h(-20)],['Terbit',noon-h(-.833)],['Zuhur',noon+.0333],['Asar',noon+h(asr)],['Magrib',noon+h(-.833)+.0333],['Isya',noon+h(-18)]];
}
const hm=h=>{const m=Math.round(((h%24)+24)%24*60)%1440;return String(m/60|0).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const hijri=(d=new Date())=>new Intl.DateTimeFormat('id-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(d);
const gps=cb=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>{S.loc={lat:p.coords.latitude,lng:p.coords.longitude,n:'Lokasi saya',tz:-new Date().getTimezoneOffset()/60};save();toast('Lokasi diperbarui');cb()},()=>toast('Izin lokasi ditolak. Aktifkan GPS dan izinkan akses.'),{timeout:10000}):toast('Perangkat tidak mendukung lokasi');
const hf=(d,o)=>new Intl.DateTimeFormat('id-u-ca-islamic-umalqura',o).format(d);
const tzl=()=>({7:'WIB',8:'WITA',9:'WIT'}[S.loc.tz??-new Date().getTimezoneOffset()/60]||'');
const locNow=()=>{const n=new Date(),tz=S.loc.tz??-n.getTimezoneOffset()/60,u=n.getUTCHours()+n.getUTCMinutes()/60+n.getUTCSeconds()/3600+tz+(S.kor||0)/60;return((u%24)+24)%24};
const locCard=()=>`<div class="card lc"><span class="si">${ic('pin',20)}</span><span class="t"><b>${S.loc.n}</b><br><small class="mut">${S.loc.lat.toFixed(3)}, ${S.loc.lng.toFixed(3)} · ${tzl()}</small></span><button class="btn s" data-loc>Ubah</button></div>`;
function lsheet(){const e=document.createElement('div');e.className='back-d';let tz=S.loc.tz??7;e.innerHTML=`<div class="sheet" style="max-height:88vh;overflow:auto" role="dialog"><b>Atur lokasi</b><button class="btn" id="lg" style="width:100%;margin:10px 0">${ic('pin',16)} Gunakan lokasi saya (GPS)</button><input class="in" id="lq" type="search" placeholder="Cari kota…"><div id="ll" class="list" style="max-height:200px;overflow:auto;margin-bottom:10px"></div><h2>Atau isi manual</h2><input class="in" id="ln" placeholder="Nama lokasi"><div style="display:flex;gap:8px"><input class="in" id="la" inputmode="decimal" placeholder="Lintang (-6.9175)"><input class="in" id="lo" inputmode="decimal" placeholder="Bujur (107.6191)"></div>${seg('lz',[[7,'WIB'],[8,'WITA'],[9,'WIT']],tz)}<button class="btn" id="ls" style="width:100%;margin-top:12px">Simpan lokasi</button></div>`;document.body.append(e);
 const set=l=>{S.loc=l;save();e.remove();toast('Lokasi: '+l.n);route()},draw=()=>{const q=$('#lq',e).value.toLowerCase(),L=CITIES.map((c,i)=>[c,i]).filter(x=>x[0][0].toLowerCase().includes(q));$('#ll',e).innerHTML=L.length?L.map(x=>`<div class="row" data-c="${x[1]}"><span class="t">${x[0][0]}</span><small class="mut">${{7:'WIB',8:'WITA',9:'WIT'}[x[0][3]]}</small></div>`).join(''):'<div class="row mut">Kota tidak ditemukan. Isi manual di bawah.</div>'};
 draw();$('#lq',e).oninput=draw;segBind('lz',v=>tz=+v);$('#lg',e).onclick=()=>gps(()=>{e.remove();route()});
 $('#ls',e).onclick=()=>{const la=parseFloat($('#la',e).value.replace(',','.')),lo=parseFloat($('#lo',e).value.replace(',','.'));if(!(la>=-90&&la<=90&&lo>=-180&&lo<=180))return toast('Lintang dan bujur belum valid');set({n:$('#ln',e).value.trim()||'Lokasi manual',lat:la,lng:lo,tz})};
 e.onclick=x=>{const r=x.target.closest('[data-c]');if(r){const c=CITIES[+r.dataset.c];return set({n:c[0],lat:c[1],lng:c[2],tz:c[3]})}if(x.target==e)e.remove()}}
