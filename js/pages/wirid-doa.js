/* js/pages/wirid-doa.js - Wirid dan Doa */
const card=x=>`<div class="card" style="margin-bottom:10px"><b>${x[0]}</b>${x[1]?`<div class="ar2">${x[1]}</div>`:''}${x[2]?`<p style="margin:6px 0 0">${x[2]}</p>`:''}${x[3]?`<a class="btn s" style="display:inline-block;margin-top:8px" href="${x[3]}">${/^http/.test(x[3])?'Buka di ':'Buka'}</a>`:''}</div>`;
const WN=MENU.wirid;
const wiridTab=()=>pisahBar('wirid',majelisDaftar(KITAB_MAJELIS('wirid'),'Wirid Fadzkuruuni segera hadir.'),catList('w',WN,WD));
P.wirid=()=>twoTabs('Wirid & Doa','Wirid','Doa',wiridTab(),catList('d',MENU.doa,DD));
P.doa=()=>twoTabs('Wirid & Doa','Wirid','Doa',wiridTab(),catList('d',MENU.doa,DD),'#/',1);
const doaCards=()=>DOA.map(d=>`<div class="card" style="margin-bottom:10px"><b>${d.j}</b><div class="ar2">${d.a}</div><p class="mut" style="margin:0"><i>${d.l}</i></p><p style="margin:6px 0 0">${d.t}</p>${d.s?`<small class="mut">${d.s}</small>`:''}</div>`).join('');
const items=(t,i)=>{const D=(t=='w'?WD:DD)[i]||[],U=t=='w'?SUB[i]:null;return U?U.map(n=>({n,j:D.findIndex(x=>x[0].toLowerCase().includes(n.toLowerCase()))})):D.map((x,j)=>({n:x[0],j}))};
const catList=(t,N)=>list(N,(n,i)=>{const L=items(t,i),as=t=='w'&&i==2,href=as?'#/asma':L.length?`#/baca/${t}/${i}`:`#/segera/${encodeURIComponent(n)}`;return `<a class="row" href="${href}"><span class="num">${i+1}</span><span class="t">${n}<br><small>${as?'99 nama':L.length?L.length+' bacaan':'Segera hadir'}</small></span>${ic('next',18)}</a>`});
P.baca=(t,i)=>{const N=t=='w'?WN:MENU.doa;if(!N[i])return P.wirid();const L=items(t,i),sh=t=='w'&&i==1;return {html:head(N[i],t=='w'?'#/wirid':'#/doa')+(sh?'<!--sh-->':'')+(L.length?list(L,(x,k)=>`<a class="row" href="${x.j>=0?`#/bacaan/${t}/${i}/${x.j}`:`#/segera/${encodeURIComponent(x.n)}`}"><span class="num">${k+1}</span><span class="t">${x.n}<br><small>${x.j>=0?'Ketuk untuk membaca':'Segera hadir'}</small></span>${ic('next',18)}</a>`):'<div class="card mut">Segera hadir.</div>')}};
/* Menu Sholawat (Semua Menu › Ibadah): daftar sholawat dari Wirid › Sholawat */
/* Wirid › Sholawat: bilah Fadzkuruuni | Umum */
{const B=P.baca;P.baca=(t,i)=>{const p=B(t,i);const k=p.html.indexOf('<!--sh-->');if(k<0)return p;p.html=p.html.slice(0,k)+pisahBar('sholawat',majelisDaftar(KITAB_MAJELIS('sholawat').concat(SHOLAWAT_FZ()),'Sholawat Fadzkuruuni segera hadir.'),p.html.slice(k+9));return p}}
P.sholawat=()=>{const p=P.baca('w',1);p.html=p.html.replace(/href="#\/wirid"/,'href="#/menu"');return p};
/* Bacaan sebelumnya / berikutnya dalam daftar yang sama (urutan seperti daftarnya): bisa digeser kiri-kanan seperti Maulid */
const bacaanNav=(t,i,j)=>{const L=items(t,i).filter(x=>x.j>=0),k=L.findIndex(x=>x.j==+j),D=(t=='w'?WD:DD)[i]||[],a=L[k-1],b=L[k+1];if(k<0)return '';
 return pnav(a&&[`#/bacaan/${t}/${i}/${a.j}`,D[a.j][0]],b&&[`#/bacaan/${t}/${i}/${b.j}`,D[b.j][0]])};
P.bacaan=(t,i,j)=>{const x=(t=='w'?WD:DD)[i]?.[j];if(!x)return P.wirid();
 /* Teks panjang belum dimuat: tampilkan judul, muat data/wirid/<i>.js lalu gambar ulang */
 if(x[1]===null)return {html:head(x[0],`#/baca/${t}/${i}`,RS)+'<div class="card mut">Memuat teks…</div>',init(){const h=location.hash;ldjs('data/wirid/'+i+'.js').then(()=>{if(location.hash==h)route()}).catch(()=>{const c=$('#view .card');if(c)c.textContent='Teks belum tersimpan. Sambungkan internet sekali untuk memuatnya.'})}};
 return {html:head(x[0],`#/baca/${t}/${i}`,RS)+`<div class="card">${x[1]?x[1].split('\n').filter(l=>l.trim()).map(l=>`<div class="ar2">${l}</div>`).join(''):''}<div id="ref"></div>${x[2]?`<p class="tr" style="margin:8px 0 0">${x[2]}</p>`:''}${x[3]=='#/tasbih'?`<a class="btn s" style="display:inline-block;margin-top:10px" href="#/tasbih">Buka penghitung tasbih</a>`:''}</div>${KOREKSI}${bacaanNav(t,i,j)}`,
 init(){const m=(x[3]||'').match(/quran\/(\d+)\/(\d+)/);if(m)AY(+m[1],+m[2],+m[2]).then(h=>{$('#ref').innerHTML=h}).catch(()=>{$('#ref').innerHTML='<p class="mut">Teks Al-Qur\'an belum tersimpan. Sambungkan internet sekali untuk mengunduhnya.</p>'})}}};
