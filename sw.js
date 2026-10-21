// فلسطين بلاتفورم — V107: cache version + essential shared assets
const V='pp-v107';
const CORE=[
 'index.html', 'login.html', 'register.html', 'account.html',
 'ads.html', 'services.html', 'taxi.html', 'messages.html',
 'app.css', 'theme-v61.css', 'theme-v88.css', 'ui-polish.css',
 'ui-polish-v91.css', 'home-v94.css', 'platform-theme-v101.css', 'ui-system-v102.css',
 'platform-redesign-v104.css', 'platform-stability-v107.css', 'jerusalem-home-hero.jpg', 'hero-quds.jpg',
 'platform.js', 'app-ui.js', 'category-page.js', 'travel.js',
 'travel.css', 'manifest.json', 'icon-192.png', 'icon-512.png'
];
self.addEventListener('install',e=>{
 self.skipWaiting();
 e.waitUntil(caches.open(V).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
 const r=e.request;
 if(r.method!=='GET')return;
 const u=new URL(r.url);
 if(u.origin!==location.origin)return;
 e.respondWith(fetch(r).then(res=>{
   if(res.ok){const copy=res.clone();caches.open(V).then(c=>c.put(r,copy)).catch(()=>{});}
   return res;
 }).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):Response.error()))));
});
