// فلسطين بلاتفورم — Service Worker v90: cache busting + current shared assets
const V='pp-v92';
const CORE=['index.html','login.html','app.css','theme-v60.css','theme-v61.css','theme-v87.css','theme-v88.css','ui-polish.css','ui-polish-v91.css','platform.js','app-ui.js','manifest.json','icon-192.png'];
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
