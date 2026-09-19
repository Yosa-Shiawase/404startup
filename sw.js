const C='n404-v3';
const PRECACHE=['/','/index.html','/404.html'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.mode!=='navigate')return;
  e.respondWith(
    fetch(e.request).then(res=>{
      if(res&&res.ok){
        const copy=res.clone();
        caches.open(C).then(c=>c.put(e.request,copy)).catch(()=>{});
      }
      return res;
    }).catch(()=>caches.match(e.request).then(r=>r||caches.match('/404.html')))
  );
});
