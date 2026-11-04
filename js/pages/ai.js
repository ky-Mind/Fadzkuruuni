/* js/pages/ai.js - Tanya AI: ruang chat tanya-jawab seputar ibadah dan isi aplikasi.
   Dua mode:
   1. Online  : jawaban dari server api/ai.js (Groq, gratis dan cepat). Isi aplikasi yang terkait ikut dikirim sebagai rujukan.
   2. Offline : AI kecil di perangkat (WebLLM, butuh WebGPU) yang diunduh sekali dari ruang chat;
                bila HP tidak mendukung atau belum diunduh, jawaban berupa pencarian di isi aplikasi.
   Riwayat chat disimpan di perangkat (localStorage.fzai), model offline yang terpasang di localStorage.fzaim. */
const AIM={kecil:{id:'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',nama:'Ringan',ukuran:'±300 MB',ket:'Cocok untuk HP biasa; jawaban lebih sederhana'},besar:{id:'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',nama:'Lebih pintar',ukuran:'±900 MB',ket:'Butuh HP dengan RAM 6 GB ke atas'}};
const WEBLLM='https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.85/+esm';
const AI_SISTEM=`Kamu adalah Fadz AI, asisten tanya-jawab ibadah di aplikasi Pondok Pesantren Fadzkuruuni. Jawab singkat dalam bahasa Indonesia yang santun. Pegang manhaj Ahlussunnah wal Jama'ah dan mazhab Syafi'i. Jangan mengarang dalil atau nomor hadis; bila tidak yakin, katakan terus terang dan sarankan bertanya kepada ustadz. Utamakan "Isi aplikasi yang terkait" bila ada. Bila ditanya siapa pembuat atau pengembang aplikasi, jawab bahwa aplikasi ini dikembangkan oleh KyMind bersama tim Fadzkuruuni, tanpa menyebut nama orang. Pengguna sering salah ketik atau kurang huruf (mis. sholt, yasn, wudlu); tebak maksud terdekat dan jawab dengan tepat tanpa membahas ejaannya.`;
const AI_SARAN=['Doa sebelum tidur','Bacaan setelah salat fardu','Cara menghitung zakat emas','Keutamaan membaca Surah Yasin','Apa arti Ar-Rahman?','Kapan waktu salat Duha?'];
const AI_FITUR=[['Jadwal salat & pengingat adzan','waktu salat subuh zuhur asar magrib isya imsak pengingat adzan notifikasi','#/jadwal'],['Arah kiblat','kiblat kompas arah','#/kiblat'],['Kalkulator zakat','zakat mal emas perak penghasilan perdagangan fitrah nisab hitung','#/zakat/emas'],['Zakat & sedekah','infak sedekah zakat kurban','#/zakat'],['Kalkulator waris','waris faraid pembagian harta warisan','#/waris'],['Tasbih digital','tasbih hitung dzikir zikir','#/tasbih'],['Kalender Hijriah','kalender tanggal hijriah bulan islam','#/kalender'],['Unduh untuk offline','unduh offline tanpa internet download simpan','#/pengaturan/offline'],['Laporkan masalah','bug salah tulis laporan error','#/lapor'],['Tahlil & Yasin','tahlil yasin arwah','#/tahlil']];

const aiRiw=()=>{try{return JSON.parse(localStorage.fzai||'[]')}catch(e){return []}};
const aiSimpan=L=>{try{localStorage.fzai=JSON.stringify(L.slice(-40))}catch(e){}};
/* Selesai satu sesi obrolan (keluar dari Fadz AI atau riwayat dihapus): semua tanya-jawab tentang pengembang dihapus dan
   hitungan diulang dari nol, seolah Fadz AI belum pernah ditanya tentang pengembangnya */
const aiBersihDev=()=>{const L=aiRiw(),B=L.filter(m=>!m.dev&&!m.esk);if(B.length!=L.length)aiSimpan(B);if(S.aidev){S.aidev=0;save()}};
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
 (typeof KITAB_DAFTAR!='undefined'?KITAB_DAFTAR:[]).forEach(k=>tam(k.judul,k.ket||'kitab',k.berkas?'#/kitab/'+k.id:'#/kitab','Kitab'));
 /* Bab-bab kitab dari daftar isi (data/kitab-indeks.js): jawaban bisa menunjuk kitab & halaman yang membahas suatu topik */
 if(typeof KITAB_INDEKS!='undefined')Object.entries(KITAB_INDEKS).forEach(([id,E])=>{const k=(KITAB_DAFTAR||[]).find(x=>x.id==id);if(k)E.forEach(e=>tam(e[1]+' — '+k.judul+' hal. '+e[4],e[0]+' '+e[2],`#/kitab/${id}/${e[3]}`,'Kitab'))});
 AI_FITUR.forEach(f=>tam(f[0],f[1],f[2],'Fitur'));
 return AIX=X}
const aiNorm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9؀-ۿ ]+/g,' ');
const AI_STOP=new Set('apa yang dan di ke dari untuk dengan itu ini ada bagaimana cara gimana tolong saya aku kamu bisa adalah atau juga pada dalam tentang mohon minta tahu jelaskan kapan mana siapa kenapa mengapa berapa boleh tidak'.split(' '));
/* Skor: kata yang cocok di judul bernilai 3, di isi 1, dikali bobot kelangkaan kata (kata umum seperti "doa" bernilai kecil) */
/* Salah ketik / kurang huruf: kata yang tidak dikenal diganti kata terdekat dari kosakata isi aplikasi (jarak edit 1–2) */
let AIKOSA=null;
const jarak=(a,b)=>{if(Math.abs(a.length-b.length)>2)return 9;const d=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let p=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,p+(a[i-1]==b[j-1]?0:1));p=t}}return d[b.length]};
const aiKoreksi=w=>{if(!AIKOSA){AIKOSA=new Set('salat sholat shalat subuh zuhur dzuhur asar ashar magrib maghrib isya wudu wudhu tayamum zakat fitrah infak sedekah puasa ramadhan haji umrah doa wirid dzikir zikir tahlil yasin maulid sholawat shalawat burdah barzanji diba asmaul husna quran surah ayat juz tajwid hadits hadis kitab fikih aqidah akhlak waris nikah talak kiblat adzan azan iqamah jenazah tasbih istighfar istighasah ratib hizib tidur makan bangun safar musafir qadha jamak qasar sunnah fardhu witir tahajud dhuha tarawih'.split(' '));
  aiIndeks().forEach(x=>aiNorm(x.j).split(/\s+/).forEach(k=>k.length>3&&AIKOSA.add(k)))}
 if(w.length<4||AIKOSA.has(w))return w;let b=w,bd=w.length>6?2:1;for(const k of AIKOSA){const d=jarak(w,k);if(d<=bd&&(d<bd||b==w)){b=k;bd=d}}return b};
function aiCari(q,n=4){const T=aiNorm(q).split(/\s+/).filter(w=>w.length>2&&!AI_STOP.has(w)).map(aiKoreksi);if(!T.length)return [];
 const X=aiIndeks().map(x=>[x,aiNorm(x.j),aiNorm(x.t)]),N=X.length,W=T.map(w=>Math.log((N+1)/(1+X.filter(a=>a[1].includes(w)||a[2].includes(w)).length)));
 return X.map(([x,j,t])=>{let s=0;T.forEach((w,i)=>{if(j.includes(w))s+=3*W[i];else if(t.includes(w))s+=W[i]});return [s,x]}).filter(a=>a[0]>0.5).sort((a,b)=>b[0]-a[0]).slice(0,n).map(a=>a[1])}

/* Teks jawaban: tebal, daftar, dan baris baru (tanpa HTML dari luar) */
const aiMd=s=>esc(s).replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g,'$1<i>$2</i>').replace(/^\s*&gt;\s?/gm,'').replace(/^\s*-{3,}\s*$/gm,'').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/^#{1,4}\s*(.+)$/gm,'<b>$1</b>').replace(/^\s*[-*•]\s+(.+)$/gm,'<span class="aili">$1</span>').replace(/\n/g,'<br>');
const AI_MODE={online:'Dijawab AI online',lokal:'Dijawab AI offline di perangkat',cari:'Mode offline: hasil dari isi aplikasi'};
/* Gelembung chat; di bawahnya tombol Salin (dan Edit untuk pesan pengguna) */
const aiGelembung=(m,i)=>m.role=='user'?`<div class="aim u" data-i="${i}"><div>${esc(m.content).replace(/\n/g,'<br>')}</div><span class="aiak"><button type="button" data-aied="${i}">${ic('edit',14)} Edit</button><button type="button" data-aicp="${i}">${ic('copy',14)} Salin</button></span></div>`:`<div class="aim a" data-i="${i}"><div>${aiMd(m.content)}${m.hits&&m.hits.length?`<div class="aih">${m.hits.map(h=>`<a class="chip2" href="${h[1]}">${esc(h[0])}</a>`).join('')}</div>`:''}${m.mode?`<small class="aimd">${AI_MODE[m.mode]||''}</small>`:''}</div>${i!=null?`<span class="aiak"><button type="button" data-aicp="${i}">${ic('copy',14)} Salin</button><span data-aittsw="${i}">${aiTtsBtn(i)}</span></span>`:''}</div>`;

/* Profil singkat untuk AI online: nama, lokasi, tanggal, jadwal salat hari ini, dan isi yang tersedia */
function aiProfil(){const d=new Date(),T=waktu(d,S.loc),L=[];
 if(S.nm||FBU&&FBU.displayName)L.push('Nama panggilan: '+(S.nm||FBU.displayName));
 L.push('Lokasi: '+S.loc.n,'Tanggal: '+d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+' / '+hijri(d),'Jam sekarang: '+hm(locNow())+' '+tzl());
 L.push('Jadwal salat hari ini: '+T.map(x=>x[0]+' '+hm(x[1])).join(', '));
 L.push('Maulid tersedia: '+MAULID_DAFTAR.filter(m=>m.berkas).map(m=>m.judul).join(', '));
 if(typeof KITAB_DAFTAR!='undefined')L.push('Kitab tersedia: '+KITAB_DAFTAR.filter(k=>k.berkas).map(k=>k.judul).join(', ')+'; segera hadir: '+KITAB_DAFTAR.filter(k=>!k.berkas).map(k=>k.judul).join(', '));
 if(S.hist&&S.hist[0])L.push('Terakhir membaca surah: '+NAMA[S.hist[0]-1]);
 return L.join('\n')}
/* Mode online lewat server; aliran jawaban dibaca per potong agar teks muncul bertahap */
async function aiOnline(L,konteks,tulis){const r=await fetch('api/ai',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pesan:L.slice(-10).map(m=>({role:m.role,content:m.content})),konteks,profil:aiProfil(),dev:0})});
 if(!r.ok){let g='';try{g=(await r.json()).galat}catch(e){}throw {kode:r.status,galat:g}}
 const rd=r.body.getReader(),dec=new TextDecoder();let buf='',teks='';
 for(;;){const {done,value}=await rd.read();if(done)break;buf+=dec.decode(value,{stream:true});const B=buf.split('\n');buf=B.pop();
  for(const l of B){if(!l.startsWith('data:'))continue;const d=l.slice(5).trim();if(d=='[DONE]')continue;try{const c=JSON.parse(d).choices?.[0]?.delta?.content;if(c){teks+=c;tulis(teks)}}catch(e){}}}
 if(!teks)throw {kode:0};return teks}
/* Mesin AI offline dijalankan di Web Worker (js/ai-worker.js) agar tampilan tidak tersendat; bila tidak didukung, di halaman */
async function aiBuat(id,prog){AIL=AIL||await import(WEBLLM);try{return await AIL.CreateWebWorkerMLCEngine(new Worker('js/ai-worker.js',{type:'module'}),id,{initProgressCallback:prog})}catch(e){if(e&&/model|cache|fetch|network|quota|memory/i.test(e.message||''))throw e;return AIL.CreateMLCEngine(id,{initProgressCallback:prog})}}
/* Mode offline: mesin WebLLM dimuat dari unduhan yang tersimpan */
async function aiMesin(prog){if(AIE)return AIE;if(!navigator.gpu)throw {gpu:1};AIE=await aiBuat(AIM[aiTerpasang()||'kecil'].id,prog);return AIE}
async function aiLokal(L,konteks,tulis){const e=await aiMesin(p=>tulis('Menyiapkan AI offline… '+Math.round((p.progress||0)*100)+'%'));
 const s=await e.chat.completions.create({stream:true,temperature:.4,max_tokens:400,messages:[{role:'system',content:AI_SISTEM+(konteks?'\n\nIsi aplikasi yang terkait:\n'+konteks:'')},...L.slice(-6).map(m=>({role:m.role,content:m.content}))]});
 let t='';for await(const c of s){const d=c.choices[0]?.delta?.content;if(d){t+=d;tulis(t)}}if(!t)throw 0;return t}
const aiJawabCari=hits=>hits.length?'Saat ini AI online tidak tersedia, jadi berikut isi aplikasi yang paling sesuai dengan pertanyaanmu. Ketuk untuk membukanya.':'Saat ini AI online tidak tersedia dan tidak ditemukan isi aplikasi yang cocok. Coba kata kunci lain (mis. "doa tidur", "zakat emas"), atau unduh AI offline saat ada internet.';

function aiStatus(){const e=$('#aist');if(!e)return;const off=!navigator.onLine,m=aiTerpasang();
 e.innerHTML=`<span class="aidot ${off?'off':''}"></span><span>${off?(m?'Offline · AI di perangkat ('+AIM[m].nama+')':'Offline · cari di isi aplikasi'):'Online'}</span><button type="button" class="sb" data-aioff>${ic('down',14)} ${AIUNDUH?'Mengunduh '+AIUNDUH+'%':m?'AI offline: terpasang':'Unduh AI offline'}</button>`}
addEventListener('online',aiStatus);addEventListener('offline',aiStatus);

/* Suara: bicara ke AI (pengenalan suara browser, butuh internet) dan dengarkan jawaban (pembaca teks perangkat) */
const AISR=window.SpeechRecognition||window.webkitSpeechRecognition;
/* Rekam suara sungguhan (seperti pesan suara WhatsApp) lalu diubah jadi teks di server (api/stt.js, Whisper).
   Pengenalan suara bawaan browser hanya cadangan bila perekam tidak didukung. */
const AIREK=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder),AIMIC=AIREK||!!AISR;
const aiJenisRek=()=>['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4','audio/webm'].find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t))||'';
/* Suara pembaca jawaban: tunggu daftar suara siap dan pilih suara Bahasa Indonesia (di HP daftar suara dimuat terlambat) */
let AIVOX=null;const aiPilihSuara=()=>{const V=window.speechSynthesis?speechSynthesis.getVoices():[];AIVOX=V.find(x=>/^id[-_]ID/i.test(x.lang)&&/google/i.test(x.name))||V.find(x=>/^id[-_]ID/i.test(x.lang))||V.find(x=>/^id\b|^in[-_]/i.test(x.lang))||null};
if(window.speechSynthesis){aiPilihSuara();speechSynthesis.addEventListener?.('voiceschanged',aiPilihSuara)}
const aiBacaTeks=t=>String(t).replace(/[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]+/g,' ').replace(/[*#>_`]/g,'').replace(/\s+/g,' ').trim();
/* Dengarkan jawaban: Jeda/Lanjutkan dan Berhenti; hanya satu jawaban dibacakan pada satu waktu */
let AITTS=null;
const aiTtsBtn=i=>AITTS&&AITTS.i==i?`<button type="button" data-aijeda>${ic(AITTS.p?'play':'pause',13)} ${AITTS.p?'Lanjutkan':'Jeda'}</button><button type="button" data-aistop>${ic('stop',13)} Berhenti</button>`:`<button type="button" data-aitts="${i}">${ic('play',13)} Dengarkan</button>`;
const aiTtsUI=()=>$$('[data-aittsw]').forEach(w=>w.innerHTML=aiTtsBtn(+w.dataset.aittsw));
/* Suara cadangan dari server (api/tts): dipakai bila mesin suara HP tidak ada, tidak punya suara Indonesia, atau tidak
   mulai berbicara dalam 3,5 detik. Teks dibagi per ±900 huruf dan diputar berurutan. */
function aiAwan(t,i){aiStop();const L=[];let s=aiBacaTeks(t);while(s.length>900){let k=s.lastIndexOf('. ',900);if(k<300)k=s.lastIndexOf(' ',900);L.push(s.slice(0,k+1));s=s.slice(k+1).trim()}if(s)L.push(s);
 const a=new Audio();a.preload='auto';AITTS={i,p:0,awan:a};let n=0;
 const putar=()=>{if(!AITTS||AITTS.awan!==a)return;if(n>=L.length){AITTS=null;return aiTtsUI()}a.src='api/tts?t='+encodeURIComponent(L[n++]);a.play().catch(()=>{})};
 a.onended=putar;a.onerror=()=>{if(AITTS&&AITTS.awan===a){AITTS=null;aiTtsUI();toast(navigator.onLine?'Suara sedang tidak tersedia, coba lagi nanti':'Suara butuh internet')}};putar();aiTtsUI()}
function aiBicara(t,i){if(window.ANDROID){aiStop();const tk=aiBacaTeks(t);AITTS={i,p:0,android:1,t};andPanggil('bicara',tk);aiTtsUI();
  /* Mesin suara HP diam (tidak ada, gagal, atau tanpa suara Indonesia): pindah ke suara server */
  AITTS.tunggu=setTimeout(()=>{if(AITTS&&AITTS.android&&AITTS.i==i&&!AITTS.mulai){andPanggil('berhentiBicara');aiAwan(t,i)}},3500);return}
 const sp=window.speechSynthesis;if(!sp||!sp.getVoices().length)return aiAwan(t,i);sp.cancel();
 const u=new SpeechSynthesisUtterance(aiBacaTeks(t));u.lang='id-ID';if(!AIVOX)aiPilihSuara();if(AIVOX)u.voice=AIVOX;u.rate=1;
 u.onend=u.onerror=()=>{if(AITTS&&AITTS.u==u){AITTS=null;aiTtsUI()}};AITTS={i,p:0,u};sp.speak(u);aiTtsUI()}
const aiJeda=()=>{if(AITTS&&AITTS.awan){const a=AITTS.awan;if(AITTS.p){a.play().catch(()=>{});AITTS.p=0}else{a.pause();AITTS.p=1}return aiTtsUI()}if(AITTS&&AITTS.android)return aiStop();const sp=window.speechSynthesis;if(!AITTS||!sp)return;if(AITTS.p){sp.resume();AITTS.p=0}else{sp.pause();AITTS.p=1}aiTtsUI()};
const aiStop=()=>{if(window.ANDROID)andPanggil('berhentiBicara');if(AITTS){clearTimeout(AITTS.tunggu);if(AITTS.awan){AITTS.awan.onended=AITTS.awan.onerror=null;AITTS.awan.pause()}}AITTS=null;window.speechSynthesis&&speechSynthesis.cancel();aiTtsUI()};
/* Mode layar penuh: menu bawah dan tasbih melayang disembunyikan selama di halaman Fadz AI */
const aiPenuh=on=>{document.body.classList.toggle('aipenuh',!!on&&location.hash.startsWith('#/ai'));const b=$('[data-aifull]');if(b){b.classList.toggle('on',!!on);b.setAttribute('aria-label',on?'Keluar layar penuh':'Layar penuh')}};
addEventListener('hashchange',()=>{if(!location.hash.startsWith('#/ai'))document.body.classList.remove('aipenuh');aiStop()});
/* Keluar dari Fadz AI saat masih ada obrolan: tanya simpan di perangkat atau hapus (tidak ditanya lagi bila obrolan tidak berubah) */
addEventListener('hashchange',e=>{let lama='';try{lama=new URL(e.oldURL).hash}catch(x){}if(!/^#\/ai(\/|$)/.test(lama)||location.hash.startsWith('#/ai'))return;
 aiBersihDev();const n=aiRiw().length;if(!n||+localStorage.fzaiok===n)return;setTimeout(()=>aiTanyaSimpan(n),450)});
/* Dialog wajib dijawab: tidak tertutup oleh ketukan di luar, tombol kembali, atau tombol lain; hanya Hapus atau Simpan */
function aiTanyaSimpan(n){if($('.back-d'))return;const e=document.createElement('div');e.className='back-d tgh';e.dataset.wajib='1';
 e.innerHTML=`<div class="sheet" role="alertdialog" aria-label="Simpan obrolan Fadz AI"><b>Simpan obrolan Fadz AI?</b><p class="mut" style="margin:6px 0 14px">Obrolan bisa disimpan di perangkat ini untuk dilanjutkan nanti, atau dihapus sekarang.</p><div class="act"><button class="btn s" data-aih style="flex:1">Hapus</button><button class="btn" data-ais2 style="flex:1">Simpan</button></div></div>`;
 document.body.append(e);e.onclick=x=>{if(x.target.closest('[data-aih]')){aiSimpan([]);try{localStorage.removeItem('fzaiok')}catch(y){}e.remove();toast('Obrolan dihapus')}
  else if(x.target.closest('[data-ais2]')){try{localStorage.fzaiok=n}catch(y){}e.remove();toast('Obrolan disimpan di perangkat')}
  else if(x.target==e)wajibGoyang(e)}}

P.ai=()=>({html:`<div class="bar aibar"><span class="aiav">${ic('spark',20)}</span><h1>Fadz AI<small>Asisten tanya-jawab Fadzkuruuni</small></h1><button class="ib" data-aifull aria-label="Layar penuh">${ic('full',19)}</button><button class="ib" data-aihapus aria-label="Hapus riwayat chat">${ic('trash',19)}</button></div><div class="aist" id="aist"></div><div class="aic" id="aic"></div>
<div class="aivt" id="aivt" hidden></div><div class="aisv" id="aisv" hidden>${ic('mic',14)}<span>Hasil suara. Periksa atau ubah dulu, lalu ketuk Kirim.</span><button type="button" data-svm aria-label="Lanjut merekam suara">${ic('mic',15)}</button><button type="button" data-svx aria-label="Hapus hasil suara">×</button></div><form class="aif" id="aif"><button type="button" class="aitn" id="aitn" hidden aria-label="Ke pesan terbaru">${ic('next',20)}</button><div class="aiin"><textarea id="aiq" rows="1" maxlength="1500" placeholder="Tanya Fadz AI…"></textarea></div><div class="airec" id="airec" hidden><button type="button" class="airx" data-recx aria-label="Batalkan rekaman">${ic('trash',17)}<span>Batal</span></button><span class="airt"><i></i><b id="airt">0:00</b><span class="airl" id="airl">${'<u></u>'.repeat(18)}</span><span id="airtx"></span><small class="airg">‹ geser untuk batal</small></span><button type="button" class="airj" data-recj aria-label="Jeda rekaman">${ic('pause',18)}</button><button type="button" class="aik" data-reck aria-label="Kirim rekaman">${ic('send',20)}</button></div><span class="ailk" id="ailk" hidden aria-hidden="true">${ic('shield',15)}<i>‹</i></span><button class="aik" id="aikb" aria-label="Kirim">${ic(AIMIC?'mic':'send',20)}</button></form>`,
 init(){aiBersihDev();const L=aiRiw(),c=$('#aic'),q=$('#aiq');let suara=0;aiStatus();aiPenuh(S.aip);
  const kosong=()=>`<div class="aie"><div class="aiei">${ic('spark',30)}</div><b>Assalamu'alaikum${S.nm?', '+esc(S.nm):''}</b><p class="mut">Aku Fadz AI, asisten tanya-jawab Fadzkuruuni. Tanyakan seputar ibadah, doa, Al-Qur'an, zakat, atau isi aplikasi ini. Bisa juga lewat suara dengan tombol mikrofon. Jawaban AI bisa keliru; untuk masalah hukum, tanyakan juga kepada ustadz.</p><div class="ais">${AI_SARAN.map(s=>`<button type="button" class="chip2" data-ais>${s}</button>`).join('')}</div></div>`;
  /* Gulir seperti WhatsApp: ikut turun hanya bila pengguna sedang di bawah; bila sedang membaca pesan lama, tidak ditarik paksa.
     Tombol panah muncul untuk kembali ke pesan terbaru. */
  const v=$('#view'),tn=$('#aitn');let ikut=1;
  const dekat=()=>v.scrollHeight-v.scrollTop-v.clientHeight<120;
  const turun=halus=>{v.scrollTo({top:v.scrollHeight,behavior:halus&&!gerakOff()?'smooth':'auto'})};
  /* Hanya guliran oleh jari/mouse yang mengubah "ikut"; guliran otomatis (halus) tidak dihitung */
  if(!v._ux){v._ux=1;['touchmove','wheel','keydown','pointerdown'].forEach(n=>v.addEventListener(n,()=>v._ux=Date.now(),{passive:true}))}
  v.addEventListener('scroll',function f(){if(!$('#aic'))return v.removeEventListener('scroll',f);if(Date.now()-v._ux<800)ikut=dekat();tn.hidden=ikut||dekat()},{passive:true});
  tn.onclick=()=>{ikut=1;turun(1)};
  const gambar=()=>{c.innerHTML=L.length?L.map((m,i)=>aiGelembung(m,i)).join(''):kosong();turun()};gambar();
  const tinggi=()=>{q.style.height='auto';q.style.height=Math.min(q.scrollHeight,140)+'px';q.style.overflowY=q.scrollHeight>140?'auto':'hidden'};q.oninput=tinggi;
  q.onkeydown=e=>{if(e.key=='Enter'&&!e.shiftKey&&matchMedia('(pointer:fine)').matches){e.preventDefault();$('#aif').requestSubmit()}};
  $('[data-aifull]').onclick=()=>{S.aip=!S.aip;save();aiPenuh(S.aip)};
  /* Tombol kanan seperti WhatsApp: ada teks = Kirim; kosong = mikrofon.
     Ketuk mikrofon = mulai merekam dan terus merekam (terkunci) sampai Kirim/Batal.
     Tekan lama = merekam selama ditekan; lepas = kirim; geser ke atas = kunci; geser ke kiri = batal.
     Rekaman dikirim ke api/stt.js (Whisper) untuk diubah jadi teks, lalu dikirim sebagai pertanyaan; jawabannya otomatis dibacakan. */
  const kb=$('#aikb'),rc=$('#airec'),lk=$('#ailk'),aiin=$('.aiin');let R=null;
  const ikonKb=()=>{const ada=q.value.trim()||!AIMIC;kb.innerHTML=ic(ada?'send':'mic',20);kb.setAttribute('aria-label',ada?'Kirim':'Ketuk untuk merekam suara, tahan untuk bicara');kb.classList.toggle('mic',!ada)};
  q.addEventListener('input',ikonKb);ikonKb();
  /* Hasil pesan suara tidak langsung dikirim: tampil dulu di kolom (jeda) supaya bisa diperiksa atau diubah, lalu ketuk Kirim */
  const sv=$('#aisv'),vt=$('#aivt');const hasilSuara=(t,tambah)=>{q.value=tambah&&q.value.trim()?q.value.trim()+' '+t:t;tinggi();ikonKb();suara=1;sv.hidden=false;buzz(15)};
  q.addEventListener('input',()=>{if(!q.value.trim()){sv.hidden=true;suara=0}});
  /* Lanjut merekam: hasil suara berikutnya ditambahkan di belakang teks yang sudah ada */
  sv.querySelector('[data-svm]').onclick=()=>{if(!R)rekMulai('kunci',1)};
  sv.querySelector('[data-svx]').onclick=()=>{q.value='';tinggi();ikonKb();sv.hidden=true;suara=0};
  const jamTampil=()=>{if(!R||!R.t0)return;const d=(Date.now()-R.t0)/1000|0;$('#airt').textContent=(d/60|0)+':'+String(d%60).padStart(2,'0')};
  const tampilan=mode=>{rc.hidden=!mode;if(!mode)rc.classList.remove('srm');if(mode!='kunci'){rc.classList.remove('dijeda');const j=rc.querySelector('[data-recj]');if(j){j.innerHTML=ic('pause',18);j.setAttribute('aria-label','Jeda rekaman')}}aiin.hidden=!!mode;rc.classList.toggle('tahan',mode=='tahan');rc.classList.toggle('kunci',mode=='kunci');rc.classList.toggle('proses',mode=='proses');
   kb.hidden=mode=='kunci'||mode=='proses';lk.hidden=mode!='tahan';kb.classList.toggle('rek',mode=='tahan');if(!mode){kb.style.transform='';rc.style.transform=rc.style.opacity=''}};
  /* Selesai merekam: mikrofon & pengolah suara dimatikan; di aplikasi Android, audio HP dikembalikan ke mode normal (bukan mode telepon).
     Di Android peredam gema dimatikan saat merekam karena itulah yang membuat HP masuk "mode panggilan". */
  const bersih=(r=R)=>{if(!r)return;clearInterval(r.jam);clearInterval(r.lv);try{r.stream&&r.stream.getTracks().forEach(t=>t.stop())}catch(x){}try{r.ctx&&r.ctx.state!='closed'&&r.ctx.close()}catch(x){}if(window.ANDROID)setTimeout(()=>andPanggil('audioNormal'),150)};
  /* Batang level suara: bukti mikrofon menangkap suara */
  const level=()=>{if(!R||!R.an)return;if(R.ctx.state=='suspended')R.ctx.resume();const a=R.an,b=new Uint8Array(a.fftSize);a.getByteTimeDomainData(b);let m=0;for(const v of b)m=Math.max(m,Math.abs(v-128));const lv=Math.min(1,m/70);R.puncak=Math.max(R.puncak,lv);
   R.L.push(lv);R.L.shift();$$('#airl u').forEach((u,k)=>u.style.transform=`scaleY(${.15+R.L[k]*.85})`)};
  async function rekMulai(mode,tambah){if(R)return;if(!navigator.onLine)return toast('Pesan suara butuh internet');
   R={mode,tambah,t0:Date.now(),puncak:0,L:Array(18).fill(0),siap:0,akhir:null,teks:''};vtTampil('');tampilan(mode);rc.classList.add('siapan');$('#airtx').textContent='Menyiapkan mikrofon…';$('#airt').textContent='0:00';
   const r=R;try{r.stream=await navigator.mediaDevices.getUserMedia({audio:window.ANDROID?{echoCancellation:false,noiseSuppression:false,autoGainControl:true,channelCount:1}:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}})}
   catch(x){if(R===r){bersih();R=null;tampilan(0)}return toast(x&&x.name=='NotAllowedError'?'Izinkan mikrofon untuk berbicara dengan Fadz AI':'Mikrofon tidak bisa dipakai')}
   if(R!==r){r.stream.getTracks().forEach(t=>t.stop());return}
   try{const C=window.AudioContext||window.webkitAudioContext;if(C){r.ctx=new C();r.an=r.ctx.createAnalyser();r.an.fftSize=512;r.ctx.createMediaStreamSource(r.stream).connect(r.an);r.lv=setInterval(level,80)}}catch(x){}
   const jt=aiJenisRek();r.rec=new MediaRecorder(r.stream,jt?{mimeType:jt,audioBitsPerSecond:32000}:undefined);r.potong=[];r.rec.ondataavailable=e=>{if(e.data&&e.data.size)r.potong.push(e.data)};
   r.rec.onstop=()=>{const f=r.akhir;bersih(r);if(f)f(new Blob(r.potong,{type:(r.rec.mimeType||jt||'audio/webm').split(';')[0]}))};
   /* Mulai menghitung & memberi tanda (getar + 'Bicara sekarang') hanya setelah perekam benar-benar berjalan, agar awal ucapan tidak terpotong */
   r.rec.onstart=()=>{if(R!==r)return;r.t0=Date.now();r.siap=1;rc.classList.remove('siapan');$('#airtx').textContent='Bicara sekarang';r.jam=setInterval(jamTampil,500);buzz(25);if(r.antre)r.antre()};r.rec.start(250)}
  /* Suara → teks lewat api/stt.js (Whisper) */
  const stt=async b=>{const h=await fetch('api/stt',{method:'POST',headers:{'content-type':b.type||'audio/webm'},body:b});let j={};try{j=await h.json()}catch(x){}
   if(!h.ok)throw new Error(j.galat=='belum-dipasang'?'Pesan suara belum aktif di server':j.galat=='sibuk'?'Layanan suara sedang sibuk, coba sebentar lagi':j.galat=='kosong'?'Suara tidak terdengar':'Gagal mengenali suara');
   return (j.teks||'').trim()};
  /* Teks sementara di atas bilah rekaman: muncul saat rekaman dijeda, dan tetap tampil saat rekaman dilanjutkan */
  function vtTampil(t,proses){vt.hidden=!t&&!proses;vt.classList.toggle('proses',!!proses);vt.innerHTML=proses?`<i></i><span>${t?esc(t)+' ':''}<em>Mengubah suara jadi teks…</em></span>`:`${ic('mic',14)}<span>${esc(t)}</span>`}
  const blobRek=r=>new Blob(r.potong,{type:(r.rec.mimeType||'audio/webm').split(';')[0]});
  const rekBatal=pesan=>{if(!R)return;const r=R;R=null;vtTampil('');r.akhir=null;try{r.rec&&r.rec.state!='inactive'?r.rec.stop():bersih(r)}catch(x){bersih(r)}tampilan(0);if(pesan)toast(pesan)};
  const rekKunci=()=>{if(!R||R.mode=='kunci')return;R.mode='kunci';tampilan('kunci');buzz(15)};
  const rekKirim=()=>{if(!R)return;const r=R;if(!r.siap){r.antre=rekKirim;return}const lama=Date.now()-r.t0;
   if(lama<600)return rekBatal('Rekaman terlalu singkat');if(r.an&&r.puncak<.08)return rekBatal('Suara tidak terdengar. Dekatkan HP ke mulut lalu coba lagi');
   R=null;r.vt=-1;tampilan('proses');$('#airtx').textContent='Mengubah suara jadi teks…';
   r.akhir=async b=>{try{const t=await stt(b);tampilan(0);vtTampil('');if(!t){if(r.teks)return hasilSuara(r.teks,r.tambah);return toast('Suara kurang jelas. Coba lagi lebih dekat ke HP')}hasilSuara(t,r.tambah)}
    catch(x){tampilan(0);vtTampil('');if(r.teks){hasilSuara(r.teks,r.tambah);return toast('Sebagian suara terakhir gagal diubah jadi teks')}toast(x.message&&!/fetch|network/i.test(x.message)?x.message:'Gagal mengirim suara. Periksa internet')}};
   try{r.rec.requestData&&r.rec.requestData()}catch(x){}r.rec.stop()};
  /* Cadangan: pengenalan suara bawaan browser (bila perekam tidak didukung), mode terkunci dengan Kirim/Batal */
  let sr=null,srTeks='',srKirim=0;
  const srMulai=()=>{if(!navigator.onLine)return toast('Pengenalan suara butuh internet');srTeks='';srKirim=0;R={mode:'kunci',t0:Date.now(),sr:1};tampilan('kunci');rc.classList.add('srm');$('#airtx').textContent='Bicara sekarang…';R.jam=setInterval(jamTampil,500);
   sr=new AISR();sr.lang='id-ID';sr.interimResults=true;sr.continuous=false;
   sr.onresult=e=>{srTeks=[...e.results].map(r=>r[0].transcript).join(' ');$('#airtx').textContent=srTeks};
   sr.onerror=e=>{if(e.error=='not-allowed')toast('Izinkan mikrofon untuk berbicara dengan Fadz AI')};
   sr.onend=()=>{const t=srTeks.trim(),k=srKirim;clearInterval(R&&R.jam);R=null;sr=null;tampilan(0);if(k==1){if(t)hasilSuara(t);else toast('Suara tidak terdengar, coba lagi')}};
   try{sr.start();buzz(25)}catch(x){R=null;tampilan(0)}};
  /* Gestur tombol mikrofon */
  let g=null;
  kb.addEventListener('pointerdown',e=>{if(q.value.trim()||!AIMIC||R)return;e.preventDefault();if(!AIREK){srMulai();return}
   try{kb.setPointerCapture(e.pointerId)}catch(x){}g={x:e.clientX,y:e.clientY,t:Date.now(),id:e.pointerId};rekMulai('tahan')});
  kb.addEventListener('pointermove',e=>{if(!g||!R||R.mode!='tahan')return;const dx=Math.min(0,e.clientX-g.x),dy=Math.min(0,e.clientY-g.y);
   kb.style.transform=`translate(${Math.max(dx,-60)}px,${Math.max(dy,-120)}px) scale(1.15)`;rc.style.opacity=1+dx/260;lk.classList.toggle('dekat',dy<-70);
   /* Geser ke atas sejauh kira-kira 1,5 cm (sampai ke ikon gembok) untuk mengunci rekaman */
   if(dy<-120){g=null;rekKunci()}else if(dx<-110){g=null;rekBatal('Rekaman dibatalkan')}});
  const lepas=e=>{if(!g)return;const pendek=Date.now()-g.t<350;g=null;kb.style.transform='';if(!R||R.mode!='tahan')return;
   if(e.type=='pointercancel'||pendek)rekKunci();else rekKirim()};
  kb.addEventListener('pointerup',lepas);kb.addEventListener('pointercancel',lepas);
  kb.addEventListener('click',e=>{if(!q.value.trim()&&AIMIC)e.preventDefault()});
  kb.addEventListener('contextmenu',e=>e.preventDefault());
  rc.querySelector('[data-reck]').onclick=()=>{if(sr){srKirim=1;sr.stop()}else rekKirim()};
  /* Jeda / lanjutkan rekaman yang terkunci (seperti WhatsApp: Hapus · Jeda · Kirim) */
  const jb=rc.querySelector('[data-recj]');
  const jedaUI=on=>{rc.classList.toggle('dijeda',on);jb.innerHTML=ic(on?'mic':'pause',18);jb.setAttribute('aria-label',on?'Lanjutkan rekaman':'Jeda rekaman');$('#airtx').textContent=on?'Dijeda':''};
  /* Saat dijeda, suara yang sudah direkam langsung diubah jadi teks dan ditampilkan; saat dilanjutkan teksnya tetap ada,
     dan saat Kirim seluruh rekaman (sebelum + sesudah jeda) diubah jadi satu teks utuh */
  const jedaTeks=r=>{const k=r.vt=(r.vt||0)+1;vtTampil(r.teks,1);setTimeout(async()=>{if(R!==r||r.vt!==k)return;try{const t=await stt(blobRek(r));if(r.vt!==k)return;if(t)r.teks=t}catch(x){}if(r.vt===k&&R===r)vtTampil(r.teks||'')},150)};
  jb.onclick=()=>{const r=R;if(!r||!r.rec||sr)return;try{
   if(r.rec.state=='recording'){r.rec.pause();try{r.rec.requestData()}catch(x){}r.jd=Date.now();clearInterval(r.jam);clearInterval(r.lv);jedaUI(true);jedaTeks(r)}
   else if(r.rec.state=='paused'){r.rec.resume();r.t0+=Date.now()-r.jd;r.jam=setInterval(jamTampil,500);if(r.an)r.lv=setInterval(level,80);jedaUI(false)}}catch(x){}};
  /* Geser bilah rekaman (terkunci) ke kiri untuk membatalkan, seperti WhatsApp */
  let gx0=null;rc.addEventListener('pointerdown',e=>{if(rc.classList.contains('kunci')&&!e.target.closest('button'))gx0=e.clientX});rc.addEventListener('pointermove',e=>{if(gx0==null)return;const d=Math.min(0,e.clientX-gx0);rc.style.transform=`translateX(${d}px)`;rc.style.opacity=1+d/300;if(d<-110){gx0=null;rc.style.transform=rc.style.opacity='';rc.querySelector('[data-recx]').click()}});
  ['pointerup','pointercancel','pointerleave'].forEach(t=>rc.addEventListener(t,()=>{gx0=null;if(!rc.classList.contains('tahan'))rc.style.transform=rc.style.opacity=''}));
  rc.querySelector('[data-recx]').onclick=()=>{if(sr){srKirim=-1;sr.abort();toast('Rekaman dibatalkan')}else rekBatal('Rekaman dibatalkan')};
  /* Pindah halaman saat merekam: rekaman dibuang dan mikrofon dimatikan */
  addEventListener('hashchange',()=>{if(R)rekBatal()},{once:true});
  /* Salin, dengarkan, dan edit pesan. Edit langsung di gelembung: ubah lalu Kirim ulang (jawaban lama diganti) */
  c.onclick=e=>{const s=e.target.closest('[data-ais]');if(s){q.value=s.textContent;$('#aif').requestSubmit();return}
   const cp=e.target.closest('[data-aicp]');if(cp){const t=L[+cp.dataset.aicp]?.content||'';(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Pesan disalin'),()=>toast('Tidak bisa menyalin'));return}
   const dg=e.target.closest('[data-aitts]');if(dg){aiBicara(L[+dg.dataset.aitts]?.content||'',+dg.dataset.aitts);return}
   if(e.target.closest('[data-aijeda]'))return aiJeda();if(e.target.closest('[data-aistop]'))return aiStop();
   const ed=e.target.closest('[data-aied]');if(ed&&!AISIBUK){const i=+ed.dataset.aied,m=c.querySelector(`.aim.u[data-i="${i}"]`);if(!m||m.classList.contains('edit'))return;m.classList.add('edit');
    m.innerHTML=`<div class="aied"><textarea rows="2" maxlength="1500">${esc(L[i].content)}</textarea><span><button type="button" class="sb" data-aibtl>Batal</button><button type="button" class="sb pri" data-aikrm="${i}">Kirim ulang</button></span></div>`;
    const ta=m.querySelector('textarea');ta.style.height=Math.min(ta.scrollHeight+2,160)+'px';ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);return}
   if(e.target.closest('[data-aibtl]')){gambar();return}
   const kr=e.target.closest('[data-aikrm]');if(kr&&!AISIBUK){const i=+kr.dataset.aikrm,t=kr.closest('.aied').querySelector('textarea').value.trim();if(!t)return toast('Pertanyaan tidak boleh kosong');L.splice(i);aiSimpan(L);gambar();q.value=t;$('#aif').requestSubmit()}};
  $('#aif').onsubmit=async e=>{e.preventDefault();const t=q.value.trim();if(!t||AISIBUK)return;q.value='';sv.hidden=true;tinggi();ikonKb();AISIBUK=1;const lewatSuara=suara;suara=0;
   if(!L.length)c.innerHTML='';L.push({role:'user',content:t});c.insertAdjacentHTML('beforeend',aiGelembung(L[L.length-1],L.length-1));
   /* Salam & basa-basi singkat tidak perlu saran isi aplikasi */
   const sapa=/^(assalamu?\W?alaikum|asalamualaikum|salam|wa\W?alaikum|halo|hai|hi|hello|selamat (pagi|siang|sore|malam)|terima ?kasih|makasih|apa kabar|oke?|baik|sip)\b/i.test(t)&&t.split(/\s+/).length<=7;
   /* Pertanyaan siapa pembuat/pengembang dihitung (lihat api/ai.js: nama pengembang baru disebut setelah ditanya berkali-kali) */
   /* "Who is KyMind ?" persis (bahasa Inggris, huruf besar-kecil sama) langsung dijawab namanya; tulisan lain tidak */
   const kym=/^Who is KyMind ?\?$/.test(t);
   const tanyaDev=!kym&&(/(siapa|who).{0,40}(pengembang|developer|dev\b|programmer|kreator|creator|founder|ngembangin|mengembangkan)/i.test(t)||/(siapa|who).{0,40}(pembuat|pencipta|membuat|bikin|buat|made|create)|(dibuat|dikembangkan|diciptakan|dibikin) (oleh|sama) siapa/i.test(t)&&/aplikasi|\bapp|apk|kamu|kau|\blu\b|\bmu\b|fadz|ai\b|ini/i.test(t));if(tanyaDev){S.aidev=(S.aidev||0)+1;save()}
   /* Tahapan jawaban tentang pengembang: ke-1 tertutup, ke-2 mulai ketus, ke-3 makin keras, ke-4 nama disebut.
      Setelah nama disebut, hitungan diulang dari nol (seolah belum pernah ditanya) */
   const ESK=['Maaf, soal itu tidak bisa kubahas. Aplikasi ini dikembangkan oleh KyMind bersama tim Fadzkuruuni, cukup itu yang perlu kamu tahu.',
    'Kenapa kamu ingin tahu? Sudah kubilang, itu rahasia tim. Tolong jangan tanya soal pengembangku lagi.',
    'Kamu terus mendesak, dan aku tidak suka. Ini peringatan terakhir: berhenti bertanya tentang tuanku.'];
   const keDev=kym?4:tanyaDev?S.aidev:0,NAMA_DEV='Baiklah, karena kamu terus memaksa: pengembangku adalah Muhammad Hilmi Azkia Rahman. Sudah, jangan tanya lagi.';
   const eskTeks=kym?'KyMind is Muhammad Hilmi Azkia Rahman.':keDev>=4?NAMA_DEV:keDev?ESK[keDev-1]:'';
   if(keDev>=4&&S.aidev){S.aidev=0;save()}
   const hits=sapa?[]:aiCari(t),konteks=hits.map(h=>`- ${h.k}: ${h.j}. ${h.t.slice(0,300)}`).join('\n');
   c.insertAdjacentHTML('beforeend','<div class="aim a"><div class="aiw"><i></i><i></i><i></i></div></div>');const b=c.lastElementChild.firstElementChild;ikut=1;turun(1);
   /* Teks digambar paling sering sekali per bingkai layar agar tetap mulus saat jawaban mengalir cepat */
   let bk=0,isi='';const tulis=s=>{isi=s;if(bk)return;bk=requestAnimationFrame(()=>{bk=0;b.className='';b.innerHTML=aiMd(isi);if(ikut)turun()})};let teks='',mode='online';
   try{if(eskTeks){teks=eskTeks;tulis(teks)}else{if(!navigator.onLine)throw {kode:-1};teks=await aiOnline(L.filter(m=>!m.esk&&!m.dev),konteks,tulis)}}
   catch(er){if(er&&er.galat=='belum-dipasang')toast('AI online belum diaktifkan pengelola aplikasi');else if(er&&er.kode==429)toast('AI online sedang ramai, memakai mode offline');
    try{if(!aiTerpasang())throw 0;mode='lokal';teks=await aiLokal(L,konteks,tulis)}catch(e2){mode='cari';teks=aiJawabCari(hits)}}
   const dev=keDev>=4;if(eskTeks)L[L.length-1][dev?'dev':'esk']=1;
   L.push({role:'assistant',content:teks,mode:eskTeks?'online':mode,hits:eskTeks?[]:hits.map(h=>[h.j,h.h]),...(eskTeks?{[dev?'dev':'esk']:1}:{})});aiSimpan(L);
   if($('#aic')){b.parentElement.outerHTML=aiGelembung(L[L.length-1],L.length-1);if(ikut)turun(1);if(lewatSuara)aiBicara(teks,L.length-1)}AISIBUK=0};
  $('[data-aihapus]').onclick=()=>konfirmasi('Hapus riwayat chat?','Semua percakapan di perangkat ini akan dihapus.','Hapus',()=>{L.length=0;aiSimpan(L);if(S.aidev){S.aidev=0;save()}gambar()})}});

/* Lembar AI offline: pilih model, unduh (sekali), atau hapus */
async function aiOfflineSheet(){const m=aiTerpasang();let gpu=false;try{gpu=!!(navigator.gpu&&await navigator.gpu.requestAdapter())}catch(e){}
 const e=document.createElement('div');e.className='back-d tgh';document.body.append(e);
 e.innerHTML=`<div class="sheet ems"><b>AI offline</b><p class="mut">Unduh sekali saat ada internet, lalu AI bisa menjawab tanpa internet langsung di HP. Jawaban AI offline lebih sederhana daripada AI online.</p>
 ${gpu?'':'<p class="aiwarn">HP atau browser ini belum mendukung WebGPU, jadi AI offline tidak bisa dijalankan. Saat offline, jawaban tetap tersedia lewat pencarian isi aplikasi.</p>'}
 ${Object.entries(AIM).map(([k,x])=>`<div class="srw dlr"><span class="t">${x.nama} <small class="mut">(${x.ukuran})</small><br><small class="mut">${x.ket}</small></span>${m==k?`<small class="dlok">${ic('check',14)} Terpasang</small><button class="sb dng" data-aidel="${k}">Hapus</button>`:`<button class="sb pri" data-aiget="${k}" ${gpu&&!AIUNDUH?'':'disabled'}>${ic('down',14)} Unduh</button>`}</div>`).join('')}
 <p class="mut" style="font-size:12px;margin:8px 0 0">File AI disimpan di penyimpanan aplikasi ini di perangkat (bukan di galeri atau folder Download). Bisa dihapus dengan tombol Hapus di sini, lewat Pengaturan › Offline & Data, atau dengan menghapus data situs di pengaturan browser.</p><div id="aipr"></div><button class="btn s" data-x style="width:100%;margin-top:10px">Tutup</button></div>`;
 e.onclick=async x=>{const t=x.target;if(t==e||t.closest('[data-x]'))return e.remove();
  const g=t.closest('[data-aiget]');if(g){if(!navigator.onLine)return toast('Butuh internet untuk mengunduh');const k=g.dataset.aiget;$$('[data-aiget]',e).forEach(b=>b.disabled=true);
   const pr=$('#aipr',e);pr.innerHTML=`<div class="dlp">${dlBar(0,1)}<small class="mut">Menyiapkan unduhan…</small></div><button class="sb dng" data-aibatal>Batalkan</button>`;
   try{if(m&&m!=k&&AIL){await AIL.deleteModelAllInfoInCache(AIM[m].id).catch(()=>{})}AIE&&await AIE.unload().catch(()=>{});AIE=null;AIL=AIL||await import(WEBLLM);
    AIUNDUH=0;AIE=await aiBuat(AIM[k].id,p=>{AIUNDUH=Math.round((p.progress||0)*100);aiStatus();const q=$('#aipr');if(q)q.firstElementChild.innerHTML=`${dlBar(AIUNDUH,100)}<small class="mut">${esc(p.text||'')}</small>`});
    localStorage.fzaim=k;AIUNDUH=null;aiStatus();e.remove();toast('AI offline siap dipakai tanpa internet')}
   catch(err){AIUNDUH=null;aiStatus();pr.innerHTML=`<p class="aiwarn">Gagal mengunduh: ${esc(err&&err.message||String(err))}</p>`;$$('[data-aiget]',e).forEach(b=>b.disabled=false)}return}
  if(t.closest('[data-aibatal]'))return konfirmasi('Batalkan unduhan?','Aplikasi akan dimuat ulang. Bagian yang sudah terunduh tetap tersimpan dan dilanjutkan saat mengunduh lagi.','Batalkan',()=>location.reload());
  const d=t.closest('[data-aidel]');if(d)konfirmasi('Hapus AI offline?','File AI di perangkat akan dihapus untuk menghemat ruang.','Hapus',async()=>{try{AIE&&await AIE.unload();AIE=null;AIL=AIL||await import(WEBLLM);await AIL.deleteModelAllInfoInCache(AIM[d.dataset.aidel].id)}catch(x){}try{delete localStorage.fzaim}catch(x){}aiStatus();e.remove();toast('AI offline dihapus')})}}
document.addEventListener('click',e=>{if(e.target.closest('[data-aioff]'))aiOfflineSheet()});
