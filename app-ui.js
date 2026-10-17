/* فلسطين بلاتفورم v15 - shared UX helpers */
(function(){
  'use strict';
  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const excludedDock=new Set(['login.html','register.html','reels.html']);
  const progress=document.createElement('div'); progress.className='pp-progress'; document.body.appendChild(progress);
  const toastHost=document.createElement('div'); toastHost.className='pp-toast-host'; document.body.appendChild(toastHost);
  window.ppToast=function(message,type='info',ms=2800){
    const el=document.createElement('div'); el.className='pp-toast '+(type||''); el.textContent=message; toastHost.appendChild(el);
    setTimeout(()=>{el.classList.add('hide');setTimeout(()=>el.remove(),220)},ms);
  };
  window.ppLoading=function(on=true){progress.classList.toggle('show',!!on); if(!on){progress.classList.add('done');setTimeout(()=>progress.classList.remove('done'),220)}};
  window.addEventListener('load',()=>{ppLoading(false);document.body.classList.add('pp-ready')},{once:true});
  setTimeout(()=>ppLoading(false),7000);

  // Performance: defer offscreen images/videos without changing page behavior.
  document.querySelectorAll('img:not([loading])').forEach(img=>img.setAttribute('loading','lazy'));
  document.querySelectorAll('video:not([preload])').forEach(v=>v.setAttribute('preload','metadata'));

  // Consistent link transitions, without touching downloads/external links/forms.
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href]'); if(!a) return;
    if(a.target==='_blank'||a.hasAttribute('download')||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
    const href=a.getAttribute('href'); if(!href||href.startsWith('#')||href.startsWith('javascript:')||href.startsWith('tel:')||href.startsWith('mailto:')) return;
    try{const u=new URL(href,location.href);if(u.origin!==location.origin)return; if(u.pathname===location.pathname&&u.search===location.search)return; document.body.classList.add('pp-leaving');ppLoading(true);}catch(_){ }
  },{passive:true});

  // Native select polish: add a small accessible label when a select has no visible label.
  document.querySelectorAll('select').forEach(s=>{s.setAttribute('aria-label',s.getAttribute('aria-label')||s.previousElementSibling?.textContent?.trim()||'اختيار');});

  // v19: the side menu is the single navigation system; no generated bottom dock.

  const top=document.createElement('button'); top.className='pp-top'; top.type='button'; top.textContent='↑'; top.setAttribute('aria-label','العودة إلى الأعلى'); document.body.appendChild(top);
  const updateTop=()=>top.classList.toggle('show',scrollY>420); window.addEventListener('scroll',updateTop,{passive:true}); updateTop();
  top.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

  // Compact mobile navigation. Full navigation remains in the side drawer.
  const privatePages=new Set(['login.html','register.html','admin.html','orders-admin.html','subscriptions-admin.html','admin-subscriptions.html','moderation.html']);
  if(!privatePages.has(path)&&!document.querySelector('.pp-dock')){
    const dock=document.createElement('nav');dock.className='pp-dock';dock.setAttribute('aria-label','التنقل السريع');
    const items=[
      {href:'index.html',icon:'⌂',label:'الرئيسية',match:['index.html']},
      {href:'ads.html',icon:'▤',label:'الإعلانات',match:['ads.html','search.html','my-ads.html','add-ad.html','edit-ad.html','ad-details.html','favorites.html']},
      {href:'reels.html',icon:'▶',label:'الريلز',match:['reels.html']},
      {href:'messages.html',icon:'✉',label:'الرسائل',match:['messages.html']}
    ];
    items.forEach(item=>{
      const a=document.createElement('a');a.href=item.href;
      const icon=document.createElement('span');icon.className='pp-dock-icon';icon.setAttribute('aria-hidden','true');icon.textContent=item.icon;
      const label=document.createElement('span');label.textContent=item.label;a.append(icon,label);
      if(item.match.includes(path)){a.setAttribute('aria-current','page');a.classList.add('active')}
      dock.appendChild(a);
    });
    const menu=document.createElement('button');menu.type='button';menu.className='pp-dock-menu';menu.setAttribute('aria-label','فتح القائمة الكاملة');
    const mi=document.createElement('span');mi.className='pp-dock-icon';mi.setAttribute('aria-hidden','true');mi.textContent='☰';
    const ml=document.createElement('span');ml.textContent='المزيد';menu.append(mi,ml);
    menu.addEventListener('click',()=>{const opener=document.getElementById('ppMenuBtn');if(opener)opener.click();else window.location.href='index.html'});
    dock.appendChild(menu);document.body.appendChild(dock);document.body.classList.add('pp-has-dock');
  }

  // Make image errors graceful instead of broken-image icons.
  document.addEventListener('error',e=>{const el=e.target;if(el&&el.tagName==='IMG'&&!el.dataset.ppHandled){el.dataset.ppHandled='1';el.style.opacity='.45';el.alt=el.alt||'صورة غير متاحة'}},true);
})();
