// فلسطين بلاتفورم — Service Worker (الشبكة أولًا؛ لا نخزّن إلا ملفات موقعنا، فتصل التحديثات فورًا)
const V='pp-v88';
self.addEventListener('install',e=>{self.skipWaiting();
  e.waitUntil(caches.open(V).then(c=>Promise.allSettled(['index.html','app.css','theme-v61.css','ui-polish.css','platform.js','app-ui.js','manifest.json','icon-192.png'].map(u=>c.add(u)))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==location.origin)return;
  e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res})
    .catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('index.html'):Response.error()))));
});
