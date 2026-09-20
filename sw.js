const C='n404-v20';
const PRECACHE=['/','/index.html','/dashboard.html','/about.html','about.html','/404.html',
'/assets/n404-core.js','/assets/game-art.js','/assets/library-manifest.js','/assets/favicon.svg','/assets/nav.js',
'/library/index.html',
'/library/fox/fox.html','/library/fox/fox_page.html',
'/library/orbit/orbit.html','/library/orbit/orbit_page.html',
'/library/snake/snake.html','/library/snake/snake_page.html',
'/library/sonar/sonar.html','/library/sonar/sonar_page.html','/library/sonar/idle.html',
'/library/vapor/vapor.html','/library/vapor/vapor_page.html','/library/vapor/radio.html',
'/library/matrix/matrix.html','/library/matrix/matrix_page.html','/library/matrix/rain.html',
'/library/cab/cab.html','/library/cab/cab_page.html',
'/library/deep/deep.html','/library/deep/deep_page.html',
'/library/stack/stack.html','/library/stack/stack_page.html',
'/library/dial/dial.html','/library/dial/dial_page.html',
'/library/echo/echo.html','/library/echo/echo_page.html',
'/library/pong/pong.html','/library/pong/pong_page.html',
'/work/index.html','/work/nirakshan/nirakshan.html','/work/nirakshan/demo.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method==='GET'&&u.origin===location.origin&&u.pathname.startsWith('/assets/')){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));return;}
  if(e.request.mode!=='navigate')return;
  e.respondWith(fetch(e.request).then(res=>{
    if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{});}
    return res;
  }).catch(()=>caches.match(e.request).then(r=>r||caches.match('/404.html'))));});
