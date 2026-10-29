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

/* V88: سرعة عامة — تحميل كسول للصور + تحميل مسبق للصفحات عند اللمس */
;(()=>{try{
  const lazy=r=>r.querySelectorAll&&r.querySelectorAll('img:not([loading])').forEach(i=>{i.loading='lazy';i.decoding='async'});
  lazy(document);
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{
    if(n.nodeType!==1)return;
    if(n.tagName==='IMG'&&!n.hasAttribute('loading')){n.loading='lazy';n.decoding='async'}else lazy(n);
  }))).observe(document.documentElement,{childList:true,subtree:true});
  if(window.HTMLScriptElement&&HTMLScriptElement.supports&&HTMLScriptElement.supports('speculationrules')&&!document.querySelector('script[type=speculationrules]')){
    const s=document.createElement('script');s.type='speculationrules';
    s.textContent=JSON.stringify({prefetch:[{where:{href_matches:'/*'},eagerness:'moderate'}]});
    document.head.appendChild(s);
  }
}catch(e){}})();

/* V116: نوافذ تأكيد منبثقة في منتصف الشاشة + منع التكرار + ppBusy */
;(()=>{try{
  const h=document.head,E=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  if(!document.querySelector('link[rel=manifest]')){const l=document.createElement('link');l.rel='manifest';l.href='manifest.json';h.appendChild(l)}
  if(!document.querySelector('meta[name=theme-color]')){const m=document.createElement('meta');m.name='theme-color';m.content='#123b68';h.appendChild(m)}
  const ai=document.createElement('link');ai.rel='apple-touch-icon';ai.href='icon-192.png';h.appendChild(ai);
  if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
  let dip=null;
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;
    const p=location.pathname;if(!(p.endsWith('/')||p.endsWith('index.html')))return;
    try{if(Date.now()<Number(localStorage.getItem('pp_install_snooze')||0))return}catch(_){}
    setTimeout(()=>{if(!dip)return;const b=document.createElement('div');b.className='pp-install';
      b.innerHTML='<span>📲 ثبّت التطبيق على هاتفك</span><button class="pp-sb primary" id="ppIns">تثبيت</button><button class="pp-x" aria-label="إغلاق">✕</button>';
      document.body.appendChild(b);
      b.querySelector('#ppIns').onclick=async()=>{dip.prompt();await dip.userChoice;dip=null;b.remove()};
      b.querySelector('.pp-x').onclick=()=>{try{localStorage.setItem('pp_install_snooze',String(Date.now()+7*864e5))}catch(_){}b.remove()};
    },6000)});
  addEventListener('appinstalled',()=>{const x=document.querySelector('.pp-install');if(x)x.remove()});
  const dialogStyle=document.createElement('style');dialogStyle.textContent=`.pp-sheet-ov{position:fixed!important;inset:0!important;z-index:2147483647!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:18px!important;box-sizing:border-box!important;background:rgba(8,20,35,.62)!important;backdrop-filter:blur(4px)!important;-webkit-backdrop-filter:blur(4px)!important;opacity:0;transition:opacity .18s!important}.pp-sheet-ov.on{opacity:1!important}.pp-sheet-ov .pp-sheet{position:relative!important;margin:auto!important;width:min(100%,390px)!important;max-height:calc(100dvh - 36px)!important;overflow:auto!important;border-radius:22px!important;transform:scale(.96)!important;opacity:0;transition:transform .18s,opacity .18s!important;box-shadow:0 24px 70px rgba(0,0,0,.32)!important}.pp-sheet-ov.on .pp-sheet{transform:scale(1)!important;opacity:1!important}.pp-sheet-ov{touch-action:manipulation}.pp-sheet-ov .pp-sheet-act{display:flex!important;gap:10px!important}.pp-sheet-ov .pp-sheet-act button{flex:1!important;min-height:46px!important}`;h.appendChild(dialogStyle);
  const sheet=html=>{const o=document.createElement('div');o.className='pp-sheet-ov';o.innerHTML='<div class="pp-sheet" role="dialog" aria-modal="true" tabindex="-1">'+html+'</div>';o.setAttribute('role','presentation');document.body.appendChild(o);document.body.style.overflow='hidden';requestAnimationFrame(()=>o.classList.add('on'));return o};
  const shut=o=>{o.classList.remove('on');setTimeout(()=>{o.remove();if(!document.querySelector('.pp-sheet-ov'))document.body.style.overflow=''},180)};
  let ppConfirmOpen=false,ppPromptOpen=false;
  window.ppConfirm=(msg,{ok='تأكيد',cancel='إلغاء',danger=false,icon=''}={})=>{
    if(ppConfirmOpen || ppPromptOpen || document.querySelector('.pp-sheet-ov')) return Promise.resolve(false);
    ppConfirmOpen=true;
    return new Promise(res=>{
      const o=sheet('<div class="pp-sheet-ic '+(danger?'danger':'')+'">'+E(icon||(danger?'⚠️':'❓'))+'</div><p class="pp-sheet-msg">'+E(msg)+'</p><div class="pp-sheet-act"><button type="button" class="pp-sb '+(danger?'danger':'primary')+'" data-v="1">'+E(ok)+'</button><button type="button" class="pp-sb" data-v="0">'+E(cancel)+'</button></div>');
      let settled=false;
      const done=v=>{if(settled)return;settled=true;ppConfirmOpen=false;shut(o);removeEventListener('keydown',kd);res(v)};
      const kd=e=>{if(e.key==='Escape')done(false)};addEventListener('keydown',kd);
      o.onclick=e=>{const b=e.target.closest('[data-v]');if(b)done(b.dataset.v==='1');else if(e.target===o)done(false)};
    });
  };
  window.ppPrompt=(msg,{placeholder='',value='',ok='إرسال',cancel='إلغاء',multiline=false,type='text'}={})=>{if(ppConfirmOpen||ppPromptOpen||document.querySelector('.pp-sheet-ov'))return Promise.resolve(null);ppPromptOpen=true;return new Promise(res=>{
    const f=multiline?'<textarea class="pp-sheet-in" rows="3" placeholder="'+E(placeholder)+'">'+E(value)+'</textarea>':'<input class="pp-sheet-in" type="'+E(type)+'" inputmode="'+(type==='number'?'decimal':'text')+'" placeholder="'+E(placeholder)+'" value="'+E(value)+'">';
    const o=sheet('<p class="pp-sheet-msg">'+E(msg)+'</p>'+f+'<div class="pp-sheet-act"><button class="pp-sb primary" data-v="1">'+E(ok)+'</button><button class="pp-sb" data-v="0">'+E(cancel)+'</button></div>');
    const inp=o.querySelector('.pp-sheet-in');setTimeout(()=>inp.focus(),250);
    const done=v=>{ppPromptOpen=false;shut(o);removeEventListener('keydown',kd);res(v)};
    const kd=e=>{if(e.key==='Escape')done(null);else if(e.key==='Enter'&&!multiline)done(inp.value)};addEventListener('keydown',kd);
    o.onclick=e=>{const b=e.target.closest('[data-v]');if(b)done(b.dataset.v==='1'?inp.value:null);else if(e.target===o)done(null)}})};
  window.ppBusy=async(btn,fn)=>{if(btn){btn.disabled=true;btn.classList.add('is-busy')}try{return await fn()}finally{if(btn){btn.disabled=false;btn.classList.remove('is-busy')}}};
  document.addEventListener('click',e=>{const b=e.target.closest('.btn-primary,.abtn,.od-btn,.pp-sb,.cta,.tile,.sv-card');if(b&&!b.disabled&&navigator.vibrate)navigator.vibrate(8)},{passive:true});
}catch(e){console.warn('ppui',e)}})();

/* V88: زر "أضف إعلانًا" عائم (الرئيسية والإعلانات) + مساعد الحالات الفارغة */
;(()=>{try{
  const pg=location.pathname.split('/').pop()||'index.html';
  if(['index.html','ads.html'].includes(pg)&&!document.querySelector('.pp-fab')){
    const f=document.createElement('a');f.className='pp-fab';f.href='add-ad.html';f.setAttribute('aria-label','أضف إعلانًا');
    f.innerHTML='<span>＋</span><b>أضف إعلانًا</b>';document.body.appendChild(f);
    let last=0;addEventListener('scroll',()=>{const y=scrollY;f.classList.toggle('mini',y>160&&y>last);last=y},{passive:true});
  }
  window.ppEmpty=(icon,title,text,href,label)=>'<div class="pp-empty"><div class="pp-empty-ic">'+icon+'</div><b>'+title+'</b><p>'+(text||'')+'</p>'+(href?'<a class="btn btn-primary" href="'+href+'">'+label+'</a>':'')+'</div>';
}catch(e){}})();

/* V88: أيقونة الموقع (favicon) */
;(()=>{try{if(!document.querySelector('link[rel~=icon]')){const l=document.createElement('link');l.rel='icon';l.type='image/png';l.href='favicon-64.png';document.head.appendChild(l)}}catch(e){}})();

/* V105: استبدال alert() بإشعار غير حاجب (toast) */
;(()=>{try{const native=window.alert.bind(window);window.alert=function(m){const t=String(m==null?'':m);if(!window.ppToast){native(t);return}const bad=/(❌|⛔|تعذر|تعذّر|فشل|خطأ|غير مسموح|لا يمكن|لا تملك)/.test(t);const ok=/(✅|✓|تم )/.test(t);window.ppToast(t,bad?'error':ok?'success':'info',bad?4500:3200)}}catch(e){}})();
