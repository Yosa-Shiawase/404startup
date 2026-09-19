const C='n404-v9';
const PRECACHE=['/','/index.html','/dashboard.html','/404.html',
'/assets/n404-core.js','/assets/game-art.js','/assets/library-manifest.js','/assets/favicon.svg',
'/library/index.html',
'/library/fox/fox.html','/library/fox/fox_page.html',
'/library/orbit/orbit.html','/library/orbit/orbit_page.html',
'/library/snake/snake.html','/library/snake/snake_page.html',
'/library/sonar/sonar.html','/library/sonar/sonar_page.html','/library/sonar/idle.html',
'/library/vapor/vapor.html','/library/vapor/vapor_page.html',
'/library/matrix/matrix.html','/library/matrix/matrix_page.html','/library/matrix/rain.html',
'/library/cab/cab.html','/library/cab/cab_page.html',
'/library/deep/deep.html','/library/deep/deep_page.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.mode!=='navigate')return;
  e.respondWith(fetch(e.request).then(res=>{
    if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{});}
    return res;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match('/404.html'))));});
