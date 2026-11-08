/* js/pages/tahlil.js - Tahlil dan Yasin */
/* Ayat 1 tiap surah (kecuali Al-Fatihah) di data diawali Basmalah: dipisah jadi judul sendiri, seperti di pembaca Al-Qur'an */
const AY=async(n,a,b)=>{const A=await qGet(n);let bsm='';const L=A.slice(a?a-1:0,b||A.length).map((x,i)=>{let t=x.a.replace(/^\ufeff/,'');
  if(n!=1&&(a||1)+i==1&&t.startsWith('بِسْمِ')){t=t.split(' ').slice(4).join(' ');bsm=`<div class="bsm" style="font-size:${Math.round(S.fs*.85)}px">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`}return {...x,a:t}});
 return bsm+L.map((x,i)=>`<div class="ay2"><span class="n">${(a||1)+i}</span><div class="ar" style="font-size:${S.fs}px">${x.a}</div>${x.l?`<p class="lt">${x.l}</p>`:''}<p class="mut tr" style="margin:4px 0 0">${x.t}</p></div>`).join('')};
const TREF={'Hadiah Al-Fatihah':[[1,0,0,'']],'Al-Ikhlas, Al-Falaq, An-Nas':[[112,0,0,'Al-Ikhlas (dibaca 3×)'],[113,0,0,'Al-Falaq'],[114,0,0,'An-Nas']],'Ayat Kursi':[[2,255,255,'']],'Akhir Surah Al-Baqarah':[[2,285,286,'']]};
const tahlilHtml=()=>TH.filter(x=>x[0]!='Surah Yasin'&&(x[1]||TREF[x[0]])).map(x=>`<h3 class="sec">${x[0]}</h3>${x[1]?`<div class="ar2">${x[1]}</div>`:''}${TREF[x[0]]?TREF[x[0]].map(r=>(r[3]?`<h4 class="sub">${r[3]}</h4>`:'')+`<div data-ref="${r[0]}:${r[1]}:${r[2]}"></div>`).join(''):`<p class="mut">${x[2]}</p>`}`).join('');
/* Isi Tahlil & Yasin yang sudah lengkap disimpan per ukuran huruf: pindah tab atau geser langsung menampilkan isi utuh (tanpa "Memuat…" lalu meloncat) */
const THC={};
const thYasin=async()=>{const k='y'+S.fs;if(!THC[k])THC[k]='<h3 class="sec">Surah Yasin</h3>'+await AY(36);return THC[k]};
const thTahlil=async()=>{const k='t'+S.fs;if(THC[k])return THC[k];const d=document.createElement('div');d.innerHTML=tahlilHtml();for(const e of d.querySelectorAll('[data-ref]')){const [n,a,b]=e.dataset.ref.split(':').map(Number);e.innerHTML=await AY(n,a,b)}return THC[k]=d.innerHTML};
P.tahlil=()=>({html:head('Tahlil & Yasin','#/',RS)+tabs(['Tahlil','Yasin'])+'<div id="tb"></div>',init(){let tok=0;const show=async k=>{const t=$('#tb'),my=++tok,c=THC[(k?'y':'t')+S.fs];if(c){t.innerHTML=c;return}t.innerHTML=k?'<p class="mut">Memuat Surah Yasin…</p>':tahlilHtml();try{if(k){const h=await thYasin();if(my==tok)t.innerHTML=h}else{const h=await thTahlil();if(my==tok)t.innerHTML=h}
 /* Tab sebelah disiapkan juga, agar pratinjau geser langsung berisi */
 (k?thTahlil():thYasin()).then(()=>window.tabSiapkan&&tabSiapkan(1)).catch(()=>{})}catch(x){if(my==tok)t.insertAdjacentHTML('beforeend','<div class="card mut" style="margin-top:12px">Teks Al-Qur\'an belum tersimpan di perangkat. Sambungkan internet sekali, atau unduh dari menu Al-Qur\'an.</div>')}};$$('[data-tab]').forEach(b=>b.onclick=()=>{$$('[data-tab]').forEach(x=>x.classList.toggle('on',x==b));show(+b.dataset.tab)});show(0)}});
