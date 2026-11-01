const V='fz-v71',A=['./','index.html','manifest.json','img/logo.png','img/icon-192.png','img/icon-512.png','img/icon-maskable.png','img/favicon-48.png','img/favicon-192.png','img/apple-touch-icon.png','img/badge-96.png','css/app.css','data/content.js','data/ibadah.js','data/asma.js','data/pustaka.js','data/quran-meta.js','data/menu.js','data/kota.js','data/maulid/daftar.js','data/zakat-ilmu.js','data/hadits.js','data/hadits-bab.js','kitab/daftar.js','kitab/alhawi/alhawi.js','js/core/state.js','js/core/icons.js','js/core/ui.js','js/core/waktu.js','js/core/quran-api.js','js/core/cloud.js','js/core/adzan.js','js/core/overlay.js','js/core/unduh.js','js/pages/kata-kata.js','js/pages/beranda.js','js/pages/quran.js','js/pages/wirid-doa.js','js/pages/asmaul-husna.js','js/pages/tahlil.js','js/pages/maulid.js','js/pages/salat.js','js/pages/zakat.js','js/pages/waris.js','js/pages/kalender.js','js/pages/tasbih.js','js/pages/kitab.js','js/pages/hadits.js','js/pages/menu.js','js/pages/segera.js','js/pages/tentang.js','js/pages/lapor.js','js/pages/pengaturan/index.js','js/pages/pengaturan/akun-profil.js','js/pages/pengaturan/beranda-kata.js','js/pages/pengaturan/tampilan.js','js/pages/pengaturan/salat-notifikasi.js','js/pages/pengaturan/offline-data.js','js/pages/pengaturan/tentang.js','js/core/events.js','js/router.js','audio/adzan.mp3','audio/adzan-subuh.mp3'];
/* Halaman gambar & PDF kitab/maulid tidak disimpan otomatis; disimpan lewat tombol Unduh (cache 'fz-off', js/core/unduh.js) */
const BESAR=/\/(kitab\/[^/]+\/(hal|pdf)\/|data\/maulid\/[^/]+\.pdf$)/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(A.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V&&x!='fz-data'&&x!='fz-off').map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!='GET')return;
  /* Audio ayat yang sudah diunduh (cache 'fz-off') diputar dari cache; permintaan range dipotong dari berkas tersimpan */
  if(new URL(r.url).hostname=='everyayah.com'){e.respondWith(caches.match(r.url).then(async h=>{if(!h)return fetch(r);if(!r.headers.has('range'))return h;const b=await h.blob(),m=/bytes=(\d*)-(\d*)/.exec(r.headers.get('range')),st=m[1]?+m[1]:0,en=m[2]?+m[2]+1:b.size;return new Response(b.slice(st,en),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':'bytes '+st+'-'+(en-1)+'/'+b.size,'Content-Length':en-st}})}));return}
  if(r.headers.has('range')&&new URL(r.url).origin==location.origin){e.respondWith(caches.match(r.url).then(async h=>{if(!h)return fetch(r);const b=await h.blob(),m=/bytes=(\d*)-(\d*)/.exec(r.headers.get('range')),st=m[1]?+m[1]:0,en=m[2]?+m[2]+1:b.size;return new Response(b.slice(st,en),{status:206,headers:{'Content-Type':h.headers.get('Content-Type')||'audio/mpeg','Content-Range':'bytes '+st+'-'+(en-1)+'/'+b.size,'Content-Length':en-st}})}));return}
  const u=new URL(r.url),api=u.hostname=='api.alquran.cloud';
  /* Dashboard admin selalu diambil dari jaringan (tidak disimpan offline) */
  if(u.origin!=location.origin&&!api||/\/admin\.html$/.test(u.pathname))return;
  e.respondWith(caches.match(r,{ignoreSearch:false}).then(h=>{
    if(h&&!(u.origin==location.origin&&navigator.onLine&&0))return h;
    return fetch(r).then(n=>{if(n.ok&&!BESAR.test(u.pathname)){const c=n.clone();caches.open(api?'fz-data':V).then(x=>x.put(r,c))}return n})
      .catch(()=>r.mode=='navigate'?caches.match('index.html'):Response.error())}));
});

self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>l[0]?l[0].focus():clients.openWindow('./')))});
