/* فلسطين بلاتفورم v15 - shared UX helpers */
(function(){
  'use strict';
  const path=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const excludedDock=new Set(['login.html','register.html','reels.html']);
  const progress=document.createElement('div'); progress.className='pp-progress'; document.body.appendChild(progress);
  const toastHost=document.createElement('div'); toastHost.className='pp-toast-host'; toastHost.setAttribute('aria-live','polite'); toastHost.setAttribute('aria-atomic','false'); document.body.appendChild(toastHost);
  window.ppToast=function(message,type='info',ms=3200){
    const el=document.createElement('div'); el.className='pp-toast '+(type||'info'); el.setAttribute('role',type==='error'?'alert':'status');
    const text=document.createElement('span'); text.textContent=String(message??''); text.style.display='block'; text.style.flex='1';
    const close=document.createElement('button'); close.type='button'; close.className='pp-toast-close'; close.setAttribute('aria-label','إغلاق الإشعار'); close.textContent='×';
    const remove=()=>{if(!el.isConnected)return;el.classList.add('hide');setTimeout(()=>el.remove(),220)};
    close.addEventListener('click',remove); el.append(text,close); toastHost.appendChild(el);
    while(toastHost.children.length>4)toastHost.firstElementChild.remove();
    const timer=setTimeout(remove,Math.max(1200,Number(ms)||3200)); el.addEventListener('mouseenter',()=>clearTimeout(timer),{once:true});
    return el;
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

  // V87: compact thumb-friendly mobile dock; desktop keeps the side drawer.
  function buildMobileDock(){
    if(excludedDock.has(path)||document.getElementById('ppMobileDock'))return;
    const items=[
      ['index.html','⌂','الرئيسية'],['ads.html','▦','الإعلانات'],['reels.html','▶','الريلز'],
      ['add-ad.html','＋','إضافة'],['messages.html','✉','الرسائل'],['notifications.html','♧','الإشعارات']
    ];
    const dock=document.createElement('nav');dock.id='ppMobileDock';dock.className='pp-mobile-dock';dock.setAttribute('aria-label','التنقل السريع');
    dock.innerHTML=items.map(([href,icon,label])=>{const active=path===href||(href==='ads.html'&&['search.html','ad-details.html','my-ads.html','favorites.html'].includes(path));return `<a class="pp-dock-item ${active?'active':''} ${href==='add-ad.html'?'pp-dock-add':''}" href="${href}" ${active?'aria-current="page"':''}><span class="pp-dock-icon" aria-hidden="true">${icon}</span><span class="pp-dock-label">${label}</span>${href==='messages.html'?'<span class="pp-dock-badge" id="ppDockMessages" hidden></span>':''}${href==='notifications.html'?'<span class="pp-dock-badge" id="ppDockNotifications" hidden></span>':''}</a>`}).join('');
    document.body.appendChild(dock);document.body.classList.add('pp-has-mobile-dock');
    const refreshBadges=async()=>{try{if(!window.ppClient)return;const {data:{user}}=await ppClient.auth.getUser();if(!user)return;const [n,m]=await Promise.all([ppClient.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',user.id).eq('is_read',false),ppClient.from('messages').select('id',{count:'exact',head:true}).neq('sender_id',user.id).eq('is_read',false)]);const set=(id,count)=>{const el=document.getElementById(id);if(!el)return;const value=count||0;el.hidden=!value;el.textContent=value>99?'99+':String(value)};set('ppDockNotifications',n.error?0:n.count);set('ppDockMessages',m.error?0:m.count)}catch(_){}};
    refreshBadges();window.addEventListener('pp:refresh-badges',refreshBadges);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshBadges()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',buildMobileDock,{once:true});else buildMobileDock();

  // Back/forward returns to the previous scroll position without restoring stale positions on normal navigation.
  const scrollKey='pp:scroll:'+location.pathname+location.search;
  window.addEventListener('pagehide',()=>{try{sessionStorage.setItem(scrollKey,String(window.scrollY))}catch(_){}});
  window.addEventListener('pageshow',e=>{document.body.classList.remove('pp-leaving');ppLoading(false);const nav=performance.getEntriesByType?.('navigation')?.[0];if(e.persisted||nav?.type==='back_forward'){try{const y=Number(sessionStorage.getItem(scrollKey));if(Number.isFinite(y))requestAnimationFrame(()=>window.scrollTo(0,y))}catch(_){}}});

  // Helpers for async actions: prevent double taps and restore the original button label.
  window.ppWithBusyButton=async function(button,work,label='جارٍ التنفيذ...'){
    if(!button||button.dataset.ppBusy==='1')return false;const old=button.innerHTML;button.dataset.ppBusy='1';button.disabled=true;button.setAttribute('aria-busy','true');if(label)button.textContent=label;
    try{return await work()}finally{button.innerHTML=old;button.disabled=false;button.removeAttribute('aria-busy');delete button.dataset.ppBusy}
  };
  document.addEventListener('submit',e=>{const form=e.target;if(!(form instanceof HTMLFormElement)||form.dataset.ppBusy!=='true')return;const button=form.querySelector('button[type="submit"],button:not([type]) ,input[type="submit"]');if(!button||button.dataset.ppBusy==='1')return;button.dataset.ppBusy='1';button.disabled=true;button.setAttribute('aria-busy','true');const old=button.dataset.ppOldText||button.textContent;button.dataset.ppOldText=old;if(button.tagName==='BUTTON')button.textContent=form.dataset.ppBusyLabel||'جارٍ التنفيذ...';setTimeout(()=>{if(!button.isConnected)return;button.disabled=false;button.removeAttribute('aria-busy');delete button.dataset.ppBusy;button.textContent=old},20000)},true);

  const top=document.createElement('button'); top.className='pp-top'; top.type='button'; top.textContent='↑'; top.setAttribute('aria-label','العودة إلى الأعلى'); document.body.appendChild(top);
  const updateTop=()=>top.classList.toggle('show',scrollY>420); window.addEventListener('scroll',updateTop,{passive:true}); updateTop();
  top.addEventListener('click',()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));

  // Make image errors graceful instead of broken-image icons.
  document.addEventListener('error',e=>{const el=e.target;if(el&&el.tagName==='IMG'&&!el.dataset.ppHandled){el.dataset.ppHandled='1';el.style.opacity='.45';el.alt=el.alt||'صورة غير متاحة'}},true);
})();
