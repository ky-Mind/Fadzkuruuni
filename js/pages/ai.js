/* js/pages/ai.js - Tanya AI: ruang chat tanya-jawab seputar ibadah dan isi aplikasi.
   Dua mode:
   1. Online  : jawaban dari server api/ai.js (Groq, gratis dan cepat). Isi aplikasi yang terkait ikut dikirim sebagai rujukan.
   2. Offline : AI kecil di perangkat (WebLLM, butuh WebGPU) yang diunduh sekali dari ruang chat;
                bila HP tidak mendukung atau belum diunduh, jawaban berupa pencarian di isi aplikasi.
   Riwayat chat disimpan di perangkat (localStorage.fzai), model offline yang terpasang di localStorage.fzaim. */
const AIM={kecil:{id:'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',nama:'Ringan',ukuran:'±300 MB',ket:'Cocok untuk HP biasa; jawaban lebih sederhana'},besar:{id:'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',nama:'Lebih pintar',ukuran:'±900 MB',ket:'Butuh HP dengan RAM 6 GB ke atas'}};
const WEBLLM='https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.85/+esm';
const AI_SISTEM=`Kamu adalah Asisten Fadzkuruuni, asisten tanya-jawab ibadah di aplikasi Pondok Pesantren Fadzkuruuni. Jawab singkat dalam bahasa Indonesia yang santun. Pegang manhaj Ahlussunnah wal Jama'ah dan mazhab Syafi'i. Jangan mengarang dalil atau nomor hadis; bila tidak yakin, katakan terus terang dan sarankan bertanya kepada ustadz. Utamakan "Isi aplikasi yang terkait" bila ada.`;
const AI_SARAN=['Doa sebelum tidur','Bacaan setelah salat fardu','Cara menghitung zakat emas','Keutamaan membaca Surah Yasin','Apa arti Ar-Rahman?','Kapan waktu salat Duha?'];
const AI_FITUR=[['Jadwal salat & pengingat adzan','waktu salat subuh zuhur asar magrib isya imsak pengingat adzan notifikasi','#/jadwal'],['Arah kiblat','kiblat kompas arah','#/kiblat'],['Kalkulator zakat','zakat mal emas perak penghasilan perdagangan fitrah nisab hitung','#/zakat/emas'],['Zakat & sedekah','infak sedekah zakat kurban','#/zakat'],['Kalkulator waris','waris faraid pembagian harta warisan','#/waris'],['Tasbih digital','tasbih hitung dzikir zikir','#/tasbih'],['Kalender Hijriah','kalender tanggal hijriah bulan islam','#/kalender'],['Unduh untuk offline','unduh offline tanpa internet download simpan','#/pengaturan/offline'],['Laporkan masalah','bug salah tulis laporan error','#/lapor'],['Tahlil & Yasin','tahlil yasin arwah','#/tahlil']];

const aiRiw=()=>{try{return JSON.parse(localStorage.fzai||'[]')}catch(e){return []}};
const aiSimpan=L=>{try{localStorage.fzai=JSON.stringify(L.slice(-40))}catch(e){}};
const aiTerpasang=()=>{try{return localStorage.fzaim||''}catch(e){return ''}};
let AIE=null,AIL=null,AIX=null,AISIBUK=0,AIUNDUH=null;

/* Indeks pencarian isi aplikasi (dibuat sekali saat dibutuhkan) */
function aiIndeks(){if(AIX)return AIX;const X=[],tam=(j,t,h,k)=>X.push({j,t:String(t||'').replace(/<[^>]+>/g,' '),h,k});
 WD.forEach((g,i)=>g.forEach((x,j)=>tam(x[0],x[2],`#/bacaan/w/${i}/${j}`,'Wirid')));
 DD.forEach((g,i)=>g.forEach((x,j)=>tam(x[0],x[2],`#/bacaan/d/${i}/${j}`,'Doa')));
 TH.forEach(x=>tam(x[0],x[2],x[3]||'#/tahlil','Tahlil'));
 ASMA.forEach((a,i)=>tam(a[1]+' ('+a[2]+')',(ASMX[i]||'').split('|').slice(1).join(' '),'#/asma/'+(i+1),'Asmaul Husna'));
 HADITS.forEach(h=>tam(String(h[1]).slice(0,70),h[1]+' '+(h[2]||''),'#/hadits','Hadis'));
 NAMA.forEach((n,i)=>tam('Surah '+n,ARTI[i]+' · '+AYAT[i]+' ayat','#/quran/'+(i+1),"Al-Qur'an"));
 MAULID_DAFTAR.forEach(m=>tam(m.judul,'maulid shalawat sholawat',m.berkas?'#/maulid/'+m.id:'#/maulid','Maulid'));
 (window.KITAB_DAFTAR||[]).forEach(k=>tam(k.judul,k.ket||'kitab',k.berkas?'#/kitab/'+k.id:'#/kitab','Kitab'));
 AI_FITUR.forEach(f=>tam(f[0],f[1],f[2],'Fitur'));
 return AIX=X}
const aiNorm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9؀-ۿ ]+/g,' ');
const AI_STOP=new Set('apa yang dan di ke dari untuk dengan itu ini ada bagaimana cara gimana tolong saya aku kamu bisa adalah atau juga pada dalam tentang mohon minta tahu jelaskan kapan mana siapa kenapa mengapa berapa boleh tidak'.split(' '));
/* Skor: kata yang cocok di judul bernilai 3, di isi 1, dikali bobot kelangkaan kata (kata umum seperti "doa" bernilai kecil) */
function aiCari(q,n=4){const T=aiNorm(q).split(/\s+/).filter(w=>w.length>2&&!AI_STOP.has(w));if(!T.length)return [];
 const X=aiIndeks().map(x=>[x,aiNorm(x.j),aiNorm(x.t)]),N=X.length,W=T.map(w=>Math.log((N+1)/(1+X.filter(a=>a[1].includes(w)||a[2].includes(w)).length)));
 return X.map(([x,j,t])=>{let s=0;T.forEach((w,i)=>{if(j.includes(w))s+=3*W[i];else if(t.includes(w))s+=W[i]});return [s,x]}).filter(a=>a[0]>0.5).sort((a,b)=>b[0]-a[0]).slice(0,n).map(a=>a[1])}

/* Teks jawaban: tebal, daftar, dan baris baru (tanpa HTML dari luar) */
const aiMd=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/^#{1,4}\s*(.+)$/gm,'<b>$1</b>').replace(/^\s*[-*•]\s+(.+)$/gm,'<span class="aili">$1</span>').replace(/\n/g,'<br>');
const AI_MODE={online:'Dijawab AI online',lokal:'Dijawab AI offline di perangkat',cari:'Mode offline: hasil dari isi aplikasi'};
const aiGelembung=m=>m.role=='user'?`<div class="aim u"><div>${esc(m.content).replace(/\n/g,'<br>')}</div></div>`:`<div class="aim a"><div>${aiMd(m.content)}${m.hits&&m.hits.length?`<div class="aih">${m.hits.map(h=>`<a class="chip2" href="${h[1]}">${esc(h[0])}</a>`).join('')}</div>`:''}${m.mode?`<small class="aimd">${AI_MODE[m.mode]||''}</small>`:''}</div></div>`;

/* Mode online lewat server; aliran jawaban dibaca per potong agar teks muncul bertahap */
async function aiOnline(L,konteks,tulis){const r=await fetch('api/ai',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pesan:L.slice(-10).map(m=>({role:m.role,content:m.content})),konteks})});
 if(!r.ok){let g='';try{g=(await r.json()).galat}catch(e){}throw {kode:r.status,galat:g}}
 const rd=r.body.getReader(),dec=new TextDecoder();let buf='',teks='';
 for(;;){const {done,value}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});const B=buf.split('\n');buf=B.pop();
  for(const l of B){if(!l.startsWith('data:'))continue;const d=l.slice(5).trim();if(d=='[DONE]')continue;try{const c=JSON.parse(d).choices?.[0]?.delta?.content;if(c){teks+=c;tulis(teks)}}catch(e){}}}
 if(!teks)throw {kode:0};return teks}
/* Mode offline: mesin WebLLM dimuat dari unduhan yang tersimpan */
async function aiMesin(prog){if(AIE)return AIE;if(!navigator.gpu)throw {gpu:1};AIL=AIL||await import(WEBLLM);AIE=await AIL.CreateMLCEngine(AIM[aiTerpasang()||'kecil'].id,{initProgressCallback:prog});return AIE}
async function aiLokal(L,konteks,tulis){const e=await aiMesin(p=>tulis('Menyiapkan AI offline… '+Math.round((p.progress||0)*100)+'%'));
 const s=await e.chat.completions.create({stream:true,temperature:.4,max_tokens:600,messages:[{role:'system',content:AI_SISTEM+(konteks?'\n\nIsi aplikasi yang terkait:\n'+konteks:'')},...L.slice(-6).map(m=>({role:m.role,content:m.content}))]});
 let t='';for await(const c of s){const d=c.choices[0]?.delta?.content;if(d){t+=d;tulis(t)}}if(!t)throw 0;return t}
const aiJawabCari=hits=>hits.length?'Saat ini AI online tidak tersedia, jadi berikut isi aplikasi yang paling sesuai dengan pertanyaanmu. Ketuk untuk membukanya.':'Saat ini AI online tidak tersedia dan tidak ditemukan isi aplikasi yang cocok. Coba kata kunci lain (mis. "doa tidur", "zakat emas"), atau unduh AI offline saat ada internet.';

function aiStatus(){const e=$('#aist');if(!e)return;const off=!navigator.onLine,m=aiTerpasang();
 e.innerHTML=`<span class="aidot ${off?'off':''}"></span><span>${off?(m?'Offline · AI di perangkat ('+AIM[m].nama+')':'Offline · cari di isi aplikasi'):'Online'}</span><button type="button" class="sb" data-aioff>${ic('down',14)} ${AIUNDUH?'Mengunduh '+AIUNDUH+'%':m?'AI offline: terpasang':'Unduh AI offline'}</button>`}
addEventListener('online',aiStatus);addEventListener('offline',aiStatus);

P.ai=()=>({html:`<div class="bar"><h1>Tanya AI</h1><button class="ib" data-aihapus aria-label="Hapus riwayat chat">${ic('trash',19)}</button></div><div class="aist" id="aist"></div><div class="aic" id="aic"></div>
<form class="aif" id="aif"><textarea id="aiq" rows="1" maxlength="1500" placeholder="Tanya tentang ibadah, doa, Al-Qur'an…"></textarea><button class="aik" aria-label="Kirim">${ic('send',20)}</button></form>`,
 init(){const L=aiRiw(),c=$('#aic'),q=$('#aiq');aiStatus();
  const kosong=()=>`<div class="aie"><div class="aiei">${ic('spark',30)}</div><b>Assalamu'alaikum${S.nm?', '+esc(S.nm):''}</b><p class="mut">Tanyakan seputar ibadah, doa, Al-Qur'an, zakat, atau isi aplikasi ini. Jawaban AI bisa keliru; untuk masalah hukum, tanyakan juga kepada ustadz.</p><div class="ais">${AI_SARAN.map(s=>`<button type="button" class="chip2" data-ais>${s}</button>`).join('')}</div></div>`;
  const gambar=()=>{c.innerHTML=L.length?L.map(aiGelembung).join(''):kosong();$('#view').scrollTop=1e9};gambar();
  const tinggi=()=>{q.style.height='auto';q.style.height=Math.min(q.scrollHeight,140)+'px'};q.oninput=tinggi;
  q.onkeydown=e=>{if(e.key=='Enter'&&!e.shiftKey&&matchMedia('(pointer:fine)').matches){e.preventDefault();$('#aif').requestSubmit()}};
  c.onclick=e=>{const s=e.target.closest('[data-ais]');if(s){q.value=s.textContent;$('#aif').requestSubmit()}};
  $('#aif').onsubmit=async e=>{e.preventDefault();const t=q.value.trim();if(!t||AISIBUK)return;q.value='';tinggi();AISIBUK=1;
   if(!L.length)c.innerHTML='';L.push({role:'user',content:t});c.insertAdjacentHTML('beforeend',aiGelembung(L[L.length-1]));
   const hits=aiCari(t),konteks=hits.map(h=>`- ${h.k}: ${h.j}. ${h.t.slice(0,300)}`).join('\n');
   c.insertAdjacentHTML('beforeend','<div class="aim a"><div class="aiw"><i></i><i></i><i></i></div></div>');const b=c.lastElementChild.firstElementChild,v=$('#view');v.scrollTop=1e9;
   const tulis=s=>{b.className='';b.innerHTML=aiMd(s);v.scrollTop=1e9};let teks='',mode='online';
   try{if(!navigator.onLine)throw {kode:-1};teks=await aiOnline(L,konteks,tulis)}
   catch(er){if(er&&er.galat=='belum-dipasang')toast('AI online belum diaktifkan pengelola aplikasi');else if(er&&er.kode==429)toast('AI online sedang ramai, memakai mode offline');
    try{if(!aiTerpasang())throw 0;mode='lokal';teks=await aiLokal(L,konteks,tulis)}catch(e2){mode='cari';teks=aiJawabCari(hits)}}
   L.push({role:'assistant',content:teks,mode,hits:hits.map(h=>[h.j,h.h])});aiSimpan(L);
   if($('#aic')){b.parentElement.outerHTML=aiGelembung(L[L.length-1]);$('#view').scrollTop=1e9}AISIBUK=0};
  $('[data-aihapus]').onclick=()=>konfirmasi('Hapus riwayat chat?','Semua percakapan di perangkat ini akan dihapus.','Hapus',()=>{L.length=0;aiSimpan(L);gambar()})}});

/* Lembar AI offline: pilih model, unduh (sekali), atau hapus */
async function aiOfflineSheet(){const m=aiTerpasang();let gpu=false;try{gpu=!!(navigator.gpu&&await navigator.gpu.requestAdapter())}catch(e){}
 const e=document.createElement('div');e.className='back-d tgh';document.body.append(e);
 e.innerHTML=`<div class="sheet ems"><b>AI offline</b><p class="mut">Unduh sekali saat ada internet, lalu AI bisa menjawab tanpa internet langsung di HP. Jawaban AI offline lebih sederhana daripada AI online.</p>
 ${gpu?'':'<p class="aiwarn">HP atau browser ini belum mendukung WebGPU, jadi AI offline tidak bisa dijalankan. Saat offline, jawaban tetap tersedia lewat pencarian isi aplikasi.</p>'}
 ${Object.entries(AIM).map(([k,x])=>`<div class="srw dlr"><span class="t">${x.nama} <small class="mut">(${x.ukuran})</small><br><small class="mut">${x.ket}</small></span>${m==k?`<small class="dlok">${ic('check',14)} Terpasang</small><button class="sb dng" data-aidel="${k}">Hapus</button>`:`<button class="sb pri" data-aiget="${k}" ${gpu&&!AIUNDUH?'':'disabled'}>${ic('down',14)} Unduh</button>`}</div>`).join('')}
 <div id="aipr"></div><button class="btn s" data-x style="width:100%;margin-top:10px">Tutup</button></div>`;
 e.onclick=async x=>{const t=x.target;if(t==e||t.closest('[data-x]'))return e.remove();
  const g=t.closest('[data-aiget]');if(g){if(!navigator.onLine)return toast('Butuh internet untuk mengunduh');const k=g.dataset.aiget;$$('[data-aiget]',e).forEach(b=>b.disabled=true);
   const pr=$('#aipr',e);pr.innerHTML=`<div class="dlp">${dlBar(0,1)}<small class="mut">Menyiapkan unduhan…</small></div><button class="sb dng" data-aibatal>Batalkan</button>`;
   try{if(m&&m!=k&&AIL){await AIL.deleteModelAllInfoInCache(AIM[m].id).catch(()=>{})}AIE&&await AIE.unload().catch(()=>{});AIE=null;AIL=AIL||await import(WEBLLM);
    AIUNDUH=0;AIE=await AIL.CreateMLCEngine(AIM[k].id,{initProgressCallback:p=>{AIUNDUH=Math.round((p.progress||0)*100);aiStatus();const q=$('#aipr');if(q)q.firstElementChild.innerHTML=`${dlBar(AIUNDUH,100)}<small class="mut">${esc(p.text||'')}</small>`}});
    localStorage.fzaim=k;AIUNDUH=null;aiStatus();e.remove();toast('AI offline siap dipakai tanpa internet')}
   catch(err){AIUNDUH=null;aiStatus();pr.innerHTML=`<p class="aiwarn">Gagal mengunduh: ${esc(err&&err.message||String(err))}</p>`;$$('[data-aiget]',e).forEach(b=>b.disabled=false)}return}
  if(t.closest('[data-aibatal]'))return konfirmasi('Batalkan unduhan?','Aplikasi akan dimuat ulang. Bagian yang sudah terunduh tetap tersimpan dan dilanjutkan saat mengunduh lagi.','Batalkan',()=>location.reload());
  const d=t.closest('[data-aidel]');if(d)konfirmasi('Hapus AI offline?','File AI di perangkat akan dihapus untuk menghemat ruang.','Hapus',async()=>{try{AIE&&await AIE.unload();AIE=null;AIL=AIL||await import(WEBLLM);await AIL.deleteModelAllInfoInCache(AIM[d.dataset.aidel].id)}catch(x){}try{delete localStorage.fzaim}catch(x){}aiStatus();e.remove();toast('AI offline dihapus')})}}
document.addEventListener('click',e=>{if(e.target.closest('[data-aioff]'))aiOfflineSheet()});
