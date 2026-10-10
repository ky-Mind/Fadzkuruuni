const V='fz-v15',A=['./','index.html','manifest.json','img/logo.png','img/icon-192.png','img/icon-512.png','img/icon-maskable.png','css/app.css','js/app.js','data/content.js','data/ibadah.js','data/asma.js','data/pustaka.js','audio/adzan.mp3','audio/adzan-subuh.mp3'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V&&x!='fz-data').map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!='GET')return;
  if(r.headers.has('range')&&new URL(r.url).origin==location.origin){e.respondWith(caches.match(r.url).then(async h=>{if(!h)return fetch(r);const b=await h.blob(),m=/bytes=(\d*)-(\d*)/.exec(r.headers.get('range')),st=m[1]?+m[1]:0,en=m[2]?+m[2]+1:b.size;return new Response(b.slice(st,en),{status:206,headers:{'Content-Type':h.headers.get('Content-Type')||'audio/mpeg','Content-Range':'bytes '+st+'-'+(en-1)+'/'+b.size,'Content-Length':en-st}})}));return}
  const u=new URL(r.url),api=u.hostname=='api.alquran.cloud';
  if(u.origin!=location.origin&&!api)return;
  e.respondWith(caches.match(r,{ignoreSearch:false}).then(h=>{
    if(h&&!(u.origin==location.origin&&navigator.onLine&&0))return h;
    return fetch(r).then(n=>{if(n.ok){const c=n.clone();caches.open(api?'fz-data':V).then(x=>x.put(r,c))}return n})
      .catch(()=>r.mode=='navigate'?caches.match('index.html'):Response.error())}));
});

self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>l[0]?l[0].focus():clients.openWindow('./')))});
