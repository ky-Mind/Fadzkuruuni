const V='fz-v212',A=['./','index.html','manifest.json','img/logo.png','img/pondok.jpg','img/icon-192.png','img/icon-512.png','img/icon-maskable.png','img/favicon-48.png','img/favicon-192.png','img/apple-touch-icon.png','img/badge-96.png','css/app.css','data/content.js','data/ibadah.js','data/wirid/3.js','data/wirid/4.js','data/wirid/5.js','data/wirid/6.js','data/wirid/7.js','data/asma.js','data/pustaka.js','data/quran-meta.js','data/menu.js','data/kota.js','data/maulid/daftar.js','data/zakat-ilmu.js','data/hadits.js','data/hadits-bab.js','kitab/daftar.js','data/kitab-indeks.js','kitab/alhawi/alhawi.js','kitab/safinatun-najah/safinatun-najah.js','kitab/fathul-qarib/fathul-qarib.js','kitab/talim-mutaallim/talim-mutaallim.js','kitab/aqidatul-awam/aqidatul-awam.js','kitab/riyadhus-shalihin/riyadhus-shalihin.js','kitab/nashaihul-ibad/nashaihul-ibad.js','kitab/aqidatul-awam-fadzkuruuni/aqidatul-awam-fadzkuruuni.js','kitab/ma-fil-wujud/ma-fil-wujud.js','kitab/ratib-alhaddad/ratib-alhaddad.js','js/core/state.js','js/core/icons.js','js/core/ui.js','js/core/waktu.js','js/core/quran-api.js','js/core/cloud.js','js/core/adzan.js','js/core/android.js','js/core/overlay.js','js/core/unduh.js','js/core/tata.js','js/pages/kata-kata.js','js/pages/beranda.js','js/pages/quran.js','js/pages/wirid-doa.js','js/pages/asmaul-husna.js','js/pages/tahlil.js','js/pages/maulid.js','js/pages/salat.js','js/pages/zakat.js','js/pages/dukung.js','js/pages/waris.js','js/pages/kalender.js','js/pages/kelas-mesh.js','js/pages/kelas.js','js/pages/tasbih.js','js/pages/kitab.js','js/pages/hadits.js','js/pages/ai.js','js/ai-worker.js','js/pages/menu.js','js/pages/segera.js','js/pages/tentang.js','js/pages/lapor.js','data/tutorial.js','js/pages/tutorial.js','js/pages/pengaturan/index.js','js/pages/pengaturan/akun-profil.js','js/pages/pengaturan/beranda-kata.js','js/pages/pengaturan/tampilan.js','js/pages/pengaturan/salat-notifikasi.js','js/pages/pengaturan/offline-data.js','js/pages/pengaturan/izin.js','js/pages/pengaturan/tentang.js','js/core/events.js','js/router.js','audio/adzan.mp3','audio/adzan-subuh.mp3'];
/* Halaman gambar & PDF kitab/maulid tidak disimpan otomatis; disimpan lewat tombol Unduh (cache 'fz-off', js/core/unduh.js) */
const BESAR=/\/(kitab\/[^/]+\/(hal|pdf)\/|data\/maulid\/[^/]+\.pdf$)/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(A.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V&&x!='fz-data'&&x!='fz-off'&&x!='fz-font').map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!='GET')return;
  /* Audio ayat yang sudah diunduh (cache 'fz-off') diputar dari cache; permintaan range dipotong dari berkas tersimpan */
  if(new URL(r.url).hostname=='everyayah.com'){e.respondWith(caches.match(r.url).then(async h=>{if(!h)return fetch(r);if(!r.headers.has('range'))return h;const b=await h.blob(),m=/bytes=(\d*)-(\d*)/.exec(r.headers.get('range')),st=m[1]?+m[1]:0,en=m[2]?+m[2]+1:b.size;return new Response(b.slice(st,en),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':'bytes '+st+'-'+(en-1)+'/'+b.size,'Content-Length':en-st}})}));return}
  if(r.headers.has('range')&&new URL(r.url).origin==location.origin){e.respondWith(caches.match(r.url).then(async h=>{if(!h)return fetch(r);const b=await h.blob(),m=/bytes=(\d*)-(\d*)/.exec(r.headers.get('range')),st=m[1]?+m[1]:0,en=m[2]?+m[2]+1:b.size;return new Response(b.slice(st,en),{status:206,headers:{'Content-Type':h.headers.get('Content-Type')||'audio/mpeg','Content-Range':'bytes '+st+'-'+(en-1)+'/'+b.size,'Content-Length':en-st}})}));return}
  /* Pustaka AI offline (WebLLM dari jsDelivr) disimpan saat pertama dimuat agar bisa dipakai tanpa internet */
  if(new URL(r.url).hostname=='cdn.jsdelivr.net'&&r.url.includes('@mlc-ai/web-llm')){e.respondWith(caches.match(r).then(h=>h||fetch(r).then(n=>{if(n.ok){const c=n.clone();caches.open('fz-off').then(x=>x.put(r,c))}return n})));return}
  /* Huruf dari Google Fonts (mis. Amiri, huruf Arab bawaan) disimpan setelah pertama dimuat agar tetap tampil tanpa internet */
  if(/^fonts\.(googleapis|gstatic)\.com$/.test(new URL(r.url).hostname)){e.respondWith(caches.match(r).then(h=>h||fetch(r).then(n=>{if(n.ok||n.type=='opaque'){const c=n.clone();caches.open('fz-font').then(x=>x.put(r,c))}return n})));return}
  /* Gambar halaman & PDF kitab di GitHub Pages: dari cache bila sudah diunduh untuk offline, selain itu langsung dari jaringan */
  if(new URL(r.url).hostname=='ky-mind.github.io'){e.respondWith(caches.match(r.url).then(h=>h||caches.match(location.origin+new URL(r.url).pathname.replace(/^\/Fadzkuruuni/,''))).then(h=>h||fetch(r)));return}
  const u=new URL(r.url),api=u.hostname=='api.alquran.cloud';
  /* Dashboard admin dan api/ (mis. suara api/tts) selalu dari jaringan, tidak disimpan offline */
  if(u.origin!=location.origin&&!api||/\/(admin|masuk-app)\.html$|^\/api\//.test(u.pathname))return;
  /* Kode aplikasi (halaman, JS, CSS, data) diambil dari jaringan dulu: cukup buka ulang/refresh, pembaruan langsung terpakai
     tanpa unduh APK. Cache dipakai saat offline, atau bila jaringan lambat (> 4 detik) dan versi tersimpan ada. */
  if(u.origin==location.origin&&!BESAR.test(u.pathname)&&(r.mode=='navigate'||/(\/|\.(html|js|css|json))$/.test(u.pathname))){
    const jar=fetch(r,{cache:'no-cache'}).then(n=>{if(n.ok){const c=n.clone();caches.open(V).then(x=>x.put(r,c))}return n});
    const simpan=()=>caches.match(r).then(h=>h||(r.mode=='navigate'?caches.match('index.html'):undefined));
    e.respondWith(new Promise(ok=>{let t=setTimeout(()=>simpan().then(h=>{if(h){t=0;ok(h)}}),4000);
      jar.then(n=>{if(t!==0){clearTimeout(t);ok(n)}}).catch(()=>{clearTimeout(t);simpan().then(h=>ok(h||Response.error()))})}));return}
  e.respondWith(caches.match(r,{ignoreSearch:false}).then(h=>{
    if(h)return h;
    return fetch(r).then(n=>{if(n.ok&&!BESAR.test(u.pathname)){const c=n.clone();caches.open(api?'fz-data':V).then(x=>x.put(r,c))}return n})
      .catch(()=>r.mode=='navigate'?caches.match('index.html'):Response.error())}));
});

self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>l[0]?l[0].focus():clients.openWindow('./')))});
