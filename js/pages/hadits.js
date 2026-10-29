/* js/pages/hadits.js - Hadits Nabi: daftar kitab, daftar hadis (dengan judul dan pencarian), detail, dan info sanad. Data: data/hadits.js (judul, field j) dan data/hadits-bab.js (nama bab Indonesia). */
const KIT=id=>HADIS_KITAB.find(k=>k.id==id);
const TERJ_NOTE='Terjemahan: sumber belum terverifikasi; lihat lisensi/SUMBER-DAN-ATRIBUSI.md.';
/* Nama bab Indonesia; bila belum ada, pakai nama asli dari dataset */
const babNama=(k,id)=>{const en=k.bab[id];return en?((HADIS_BAB[k.id]||{})[en]||en):''};
/* Judul hadis: judul ringkas dari data; bila belum ada (terjemahan tidak tersedia) pakai nomor hadis */
const judulHadis=(k,x)=>x[4]||'Hadis no. '+x[0];

const HADIS_INDEX=()=>({html:head('Hadits Nabi')+`<p class="mut">Kitab hadis utama. Tiap kitab dibuka dengan 100 hadis pertama; seluruh hadis bisa dimuat dari internet.</p><div class="list">${HADIS_KITAB.map(k=>`<a class="row" href="#/hadits/${k.id}"><span class="t"><b>${esc(k.nama)}</b><br><small>${esc(k.penyusun)} · ${k.jumlah.toLocaleString('id-ID')} hadis</small></span>${ic('next',18)}</a>`).join('')}</div><a class="card" href="#/hadits/info" style="display:flex;gap:12px;align-items:center;margin-top:12px">${ic('info',22)}<span><b>Info sanad &amp; istilah hadis</b><br><small class="mut">Arti sanad, rawi, sahih, hasan, dan daif</small></span></a><p class="mut hd-note">${TERJ_NOTE}</p>`});

/* Seluruh hadis diambil saat diminta, dari dataset domain publik (fawazahmed0/hadith-api), lalu disimpan di memori halaman */
const HADIS_SRC='https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/';
const loadFull=async k=>{const [a,i]=await Promise.all(['ara','ind'].map(l=>fetch(`${HADIS_SRC}${l}-${k.id}.min.json`).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})));
 const ind={};i.hadiths.forEach(h=>ind[h.hadithnumber]=h.text.replace(/\s+/g,' ').trim());
 const sd=a.metadata.section_details;const bab=n=>{for(const id in sd){const d=sd[id];if(id!='0'&&d.hadithnumber_first<=n&&n<=d.hadithnumber_last)return id}return ''};
 k.h=a.hadiths.map(h=>[h.hadithnumber,bab(h.hadithnumber),h.text.trim(),ind[h.hadithnumber]||'']);
 k.bab=Object.fromEntries(Object.entries(a.metadata.sections).filter(([id])=>id!='0'));k.full=true};

const HADIS_LIST=k=>({html:head(k.nama,'#/hadits',`<a class="ib" href="#/hadits/info" aria-label="Info hadis">${ic('info',20)}</a>`)+`${k.full||k.jumlah<=k.h.length?'':`<button class="btn s" id="hfull" style="width:100%;margin-bottom:12px">Muat seluruh ${k.jumlah.toLocaleString('id-ID')} hadis (butuh internet)</button>`}<div class="srch">${ic('search',18)}<input id="hq" type="search" placeholder="Cari nomor, judul, atau isi hadis"></div><div id="hl"></div><p class="mut hd-note">${TERJ_NOTE}</p>`,
 init(){const hb=$('#hfull');if(hb)hb.onclick=async()=>{hb.disabled=true;hb.textContent='Memuat…';try{await loadFull(k);toast('Seluruh hadis dimuat');route()}catch(e){hb.disabled=false;hb.textContent='Gagal memuat. Periksa koneksi lalu coba lagi'}};
  const draw=q=>{const t=q.trim().toLowerCase();const L=k.h.filter(x=>!t||String(x[0])==t||(x[4]||'').toLowerCase().includes(t)||x[3].toLowerCase().includes(t)).slice(0,60);$('#hl').innerHTML=L.length?list(L,x=>`<a class="row" href="#/hadits/${k.id}/${x[0]}"><span class="num">${x[0]}</span><span class="t"><b>${esc(judulHadis(k,x))}</b><br><small>${esc(x[3].slice(0,120))}${x[3].length>120?'…':''}</small></span>${ic('next',18)}</a>`):'<div class="card mut">Tidak ada hadis yang cocok.</div>'};draw('');$('#hq').oninput=e=>draw(e.target.value)}});

const HADIS_DETAIL=(k,n)=>{const i=k.h.findIndex(x=>x[0]==n);if(i<0)return HADIS_LIST(k);const x=k.h[i],p=k.h[i-1],q=k.h[i+1];
 return {html:head(`${k.nama} · ${x[0]}`,`#/hadits/${k.id}`)+`<div class="card"><div class="ah"><b class="hd-judul">${esc(judulHadis(k,x))}</b><span class="mut">${esc(babNama(k,x[1]))}</span></div><div class="ar2">${x[2]}</div><div class="hd-lbl">Terjemahan (sanad &amp; matan)</div><p class="hd-tr">${esc(x[3])}</p></div><div class="hd-nav">${p?`<a class="sb" href="#/hadits/${k.id}/${p[0]}">← Sebelumnya</a>`:'<span></span>'}${q?`<a class="sb" href="#/hadits/${k.id}/${q[0]}">Berikutnya →</a>`:''}</div><div class="act"><button class="sb" data-copy="${esc(x[2]+'\n'+x[3]+'\n(HR. '+k.nama+' no. '+x[0]+')')}">Salin hadis</button></div><p class="mut hd-note">Rujukan: HR. ${esc(k.nama)} no. ${x[0]}. Judul ringkas disusun Fadzkuruuni, bukan bagian dari teks hadis. ${TERJ_NOTE}</p>`}};

const HADIS_INFO=()=>({html:head('Info sanad & istilah hadis','#/hadits')+[
 ['Sanad','Rangkaian perawi yang meriwayatkan hadis, dari orang yang terakhir menerimanya sampai ke Nabi ﷺ.'],
 ['Matan','Isi atau redaksi hadis itu sendiri, setelah bagian sanad.'],
 ['Rawi (perawi)','Orang yang meriwayatkan hadis dalam sanad. Keadaan tiap rawi (adil, kuat hafalannya, dan lainnya) ikut menentukan derajat hadis.'],
 ['Sahih','Sanad bersambung, para perawinya adil dan kuat hafalannya, serta hadisnya tidak janggal (syadz) dan tidak cacat tersembunyi (illat).'],
 ['Hasan','Seperti sahih, tetapi kekuatan hafalan sebagian perawinya lebih ringan.'],
 ['Daif (lemah)','Tidak memenuhi syarat sahih maupun hasan, misalnya sanadnya terputus atau ada perawi yang lemah.'],
 ['Mursal','Hadis yang sanadnya gugur pada perawi sahabat, langsung dari tabi\'in kepada Nabi ﷺ.'],
 ['Muttasil & munqathi\'','Muttasil: sanad bersambung dari awal sampai akhir. Munqathi\': ada perawi yang gugur di tengah sanad.'],
 ['Mu\'an\'an','Hadis dengan lafaz "dari fulan dari fulan" (عن). Ulama menilainya bersambung bila perawinya bukan mudallis.'],
 ['Marfu\' & mauquf','Marfu\': sanadnya sampai kepada Nabi ﷺ. Mauquf: berhenti pada sahabat.']
].map(([t,d])=>`<div class="card" style="margin-bottom:10px"><b>${t}</b><p class="mut" style="margin:6px 0 0">${d}</p></div>`).join('')+`<p class="mut hd-note">Penjelasan ini ringkas untuk pengenalan. Untuk menetapkan derajat sebuah hadis, rujuklah kitab syarah dan ulama hadis.</p>`});

P.hadits=(b,c)=>{if(b=='info')return HADIS_INFO();const k=b&&KIT(b);if(!k)return HADIS_INDEX();return c?HADIS_DETAIL(k,+c):HADIS_LIST(k)};
