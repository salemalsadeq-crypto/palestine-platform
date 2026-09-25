/* فلسطين بلاتفورم - محرك موحد لأقسام الإعلانات */
(function(){
  'use strict';
  const cfg = window.PP_CATEGORY || {};
  const CATEGORY = cfg.category || '';
  const ICON = cfg.icon || '📢';
  const DETAIL = cfg.detail || 'الإعلان';
  const HAS_MAP = !!cfg.map;
  const $ = id => document.getElementById(id);
  const db = window.ppClient;
  const grid = $('grid');
  const count = $('count');
  let ads = [];
  let page = 0;
  const PAGE_SIZE = 60;
  let hasMore = false;
  let map = null;
  let markers = [];

  const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const money = v => v == null || v === '' ? 'السعر عند التواصل' : (Number.isFinite(Number(v)) ? Number(v).toLocaleString('ar-PS') + ' شيكل' : 'السعر عند التواصل');
  const date = v => { if(!v) return ''; try{return new Date(v).toLocaleDateString('ar-PS')}catch(_){return ''} };

  function showError(err){
    const msg = err?.message || String(err || 'خطأ غير متوقع');
    if(count) count.textContent = '❌ تعذر تحميل القسم';
    if(grid) grid.innerHTML = '<div class="msg error">❌ '+esc(msg)+'<br><small>جرّب تحديث الصفحة. إذا استمرت المشكلة سنفحص الاتصال والبيانات.</small></div>';
  }

  function render(list){
    if(!grid) return;
    if(count) count.textContent = 'عدد الإعلانات: ' + list.length;
    if(!list.length){ grid.innerHTML = '<div class="msg">'+ICON+' لا توجد إعلانات مطابقة حاليًا.</div>'; return; }
    grid.innerHTML = list.map(a=>{
      const im = Array.isArray(a.image_urls) && a.image_urls.length ? a.image_urls[0] : '';
      const media = a.video_url
        ? '<div class="video-wrap"><video class="pic" src="'+esc(a.video_url)+'" muted playsinline preload="metadata"></video><span>🎬 فيديو</span></div>'
        : (im ? '<img class="pic" loading="lazy" src="'+esc(im)+'" alt="'+esc(a.title||'')+'">' : '<div class="nop">'+ICON+'</div>');
      return '<article class="card">'+media+'<div class="body"><div class="title">'+esc(a.title||'إعلان')+'</div><span class="tag">'+esc(CATEGORY)+'</span><div class="desc">'+esc(String(a.description||'لا يوجد وصف').slice(0,150))+'</div><div class="info">💰 '+esc(money(a.price))+(a.city?'<br>📍 '+esc(a.city):'')+'<br>📅 '+esc(date(a.created_at))+'</div><a class="details" href="ad-details.html?id='+encodeURIComponent(a.id)+'">👁️ عرض تفاصيل '+DETAIL+'</a></div></article>';
    }).join('');
    if(HAS_MAP) updateMap(list);
  }

  function filter(){
    const q = ($('search')?.value || $('q')?.value || '').trim().toLowerCase();
    const city = ($('city')?.value || '').trim().toLowerCase();
    const type = ($('type')?.value || '').trim().toLowerCase();
    const minEl=$('min'), maxEl=$('max');
    const min=minEl&&minEl.value!==''?Number(minEl.value):null;
    const max=maxEl&&maxEl.value!==''?Number(maxEl.value):null;
    let list=ads.filter(a=>{
      const text=[a.title,a.description,a.city].filter(Boolean).join(' ').toLowerCase();
      return (!q||text.includes(q)) && (!city||String(a.city||'').toLowerCase()===city) && (!type||text.includes(type)) && (min===null||Number(a.price)>=min) && (max===null||Number(a.price)<=max);
    });
    const sort=$('sort')?.value||'new';
    list.sort((a,b)=>sort==='old'?new Date(a.created_at)-new Date(b.created_at):sort==='low'?(a.price==null?Infinity:Number(a.price))-(b.price==null?Infinity:Number(b.price)):sort==='high'?(b.price==null?-Infinity:Number(b.price))-(a.price==null?-Infinity:Number(a.price)):new Date(b.created_at)-new Date(a.created_at));
    render(list);
  }

  function ensureLoadMore(){
    let b=$('loadMore');
    if(!b && grid){ b=document.createElement('button'); b.id='loadMore'; b.type='button'; b.className='btn blue'; b.style.cssText='display:block;margin:18px auto;padding:10px 22px'; b.textContent='تحميل المزيد'; grid.parentElement?.appendChild(b); b.addEventListener('click',()=>load(true)); }
    if(b) b.style.display=hasMore?'block':'none';
  }

  async function load(more=false){
    if(!db) throw new Error('تعذر الاتصال بقاعدة البيانات');
    if(!more){ page=0; ads=[]; if(grid) grid.innerHTML='<div class="msg">⏳ جاري تحميل الإعلانات...</div>'; }
    const categories = cfg.aliases || [CATEGORY];
    const from=page*PAGE_SIZE, to=from+PAGE_SIZE-1;
    const r=await db.from('ads').select('id,title,category,description,price,city,created_at,image_urls,video_url,latitude,longitude,status').in('category',categories).eq('status','active').order('created_at',{ascending:false}).range(from,to);
    if(r.error) throw r.error;
    const batch=r.data||[];
    hasMore=batch.length===PAGE_SIZE;
    ads=more?ads.concat(batch):batch;
    page++;
    filter();
    ensureLoadMore();
  }

  function updateMap(list){
    const el=$('categoryMap');
    if(!el || typeof L==='undefined') return;
    if(!map){
      map=L.map(el).setView([31.9,35.2],9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
    }
    markers.forEach(m=>map.removeLayer(m)); markers=[];
    const rows=list.filter(a=>Number.isFinite(Number(a.latitude))&&Number.isFinite(Number(a.longitude)));
    rows.forEach(a=>{
      const m=L.marker([Number(a.latitude),Number(a.longitude)]).addTo(map).bindPopup('<b>'+esc(a.title||DETAIL)+'</b><br>'+esc(a.city||'')+'<br><a href="ad-details.html?id='+encodeURIComponent(a.id)+'">عرض التفاصيل</a>');
      markers.push(m);
    });
    if(rows.length) map.fitBounds(L.latLngBounds(rows.map(a=>[Number(a.latitude),Number(a.longitude)])),{padding:[25,25]});
    setTimeout(()=>map.invalidateSize(),150);
  }

  ['search','q','city','type','min','max','sort'].forEach(id=>{
    const el=$(id); if(!el) return;
    el.addEventListener(el.tagName==='INPUT'?'input':'change',filter);
  });
  ['searchBtn','go'].forEach(id=>{const el=$(id);if(el)el.addEventListener('click',filter)});

  load().catch(showError);
})();
