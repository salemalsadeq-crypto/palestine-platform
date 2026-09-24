// فلسطين بلاتفورم - طبقة مشتركة للنسخة الجديدة
window.PP_CONFIG={SUPABASE_URL:"https://sesbumfedusbjevbsyzl.supabase.co",SUPABASE_KEY:"sb_publishable_0sJrbh73jLip3O5OtJkc_A_9F6OPWqR"};
window.ppClient=window.supabase?.createClient(window.PP_CONFIG.SUPABASE_URL,window.PP_CONFIG.SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
window.ppEsc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
window.ppUser=async()=>{if(!window.ppClient)return null;const {data}=await ppClient.auth.getUser();return data?.user||null};
window.ppProfile=async(id)=>{const uid=id||(await ppUser())?.id;if(!uid)return null;const {data}=await ppClient.from('profiles').select('id,full_name,phone,city,avatar_url,role,status').eq('id',uid).maybeSingle();return data||null};
window.ppUnreadNotifications=async()=>{try{const u=await ppUser();if(!u)return 0;const {count,error}=await ppClient.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',u.id).eq('is_read',false);return error?0:(count||0)}catch(e){return 0}};
window.ppRoleLabel=r=>({admin:'مدير عام',manager:'مدير',editor:'محرر',moderator:'مشرف',places_manager:'مدير المواقع',ads_manager:'مدير الإعلانات',member:'عضو',user:'عضو'})[r]||'عضو';
window.ppCan=async permission=>{try{const {data,error}=await ppClient.rpc('has_permission',{permission_code:permission});return !error&&data===true}catch(e){return false}};
window.ppRequire=async permission=>{const u=await ppUser();if(!u){location.href='login.html';return null}if(permission && !(await ppCan(permission))){document.body.innerHTML='<main style="font-family:Arial;text-align:center;padding:60px"><h2>⛔ لا تملك الصلاحية</h2><a href="index.html">العودة للرئيسية</a></main>';return null}return u};
window.ppPublicVideo=async url=>{if(!url)return null;if(url.includes('/storage/v1/object/public/'))return url;const m=url.match(/\/storage\/v1\/object\/([^/]+)\/(.+)$/);if(!m)return url;const bucket=m[1],path=decodeURIComponent(m[2]);try{const {data,error}=await ppClient.storage.from(bucket).createSignedUrl(path,3600);return error?url:data?.signedUrl||url}catch(e){return url}};
window.ppSetupHeader=async()=>{const u=await ppUser();const login=document.getElementById('login');const account=document.getElementById('account');const myads=document.getElementById('myads');const admin=document.getElementById('adminLink');const logout=document.getElementById('logout');if(!u){if(login)login.style.display='inline-block';[account,myads,admin,logout].forEach(x=>x&&(x.style.display='none'));return null}if(login)login.style.display='none';[account,myads,logout].forEach(x=>x&&(x.style.display='inline-block'));const p=await ppProfile(u.id);if(admin)admin.style.display=p&&p.status==='active'&&p.role&&p.role!=='member'&&p.role!=='user'?'inline-block':'none';const n=(p?.full_name||u.email?.split('@')[0]||'المستخدم').trim();const name=document.getElementById('name');const initial=document.getElementById('initial');const avatar=document.getElementById('avatar');if(name)name.textContent=n;if(initial){initial.textContent=n[0]||'م';initial.style.display=avatar&&p?.avatar_url?'none':'flex'}if(avatar&&p?.avatar_url){avatar.src=p.avatar_url;avatar.style.display='block'}if(logout&&!logout.dataset.bound){logout.dataset.bound='1';logout.onclick=async e=>{e.preventDefault();await ppClient.auth.signOut();location.href='index.html'}}return {user:u,profile:p}};

(function(){
  function esc(v){return window.ppEsc?ppEsc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  function page(){return location.pathname.split('/').pop()||'index.html';}
  function link(h,icon,label){return '<a class="pp-menu-link" href="'+h+'"><span class="pp-menu-icon">'+icon+'</span><span>'+label+'</span></a>';}
  function quick(h,icon,label,cls){return '<a class="'+cls+'" href="'+h+'"><span style="font-size:25px">'+icon+'</span><span>'+label+'</span></a>';}

  async function buildProfileControl(){
    const header=document.querySelector('header,.header');
    if(!header || document.getElementById('ppProfileControl')) return;
    const accountHost=header.querySelector('.account,.account-area');
    const oldIds=['myads','adminLink','logout','login','name','initial','avatar'];
    oldIds.forEach(id=>{const el=document.getElementById(id);if(el){el.style.display='none';el.setAttribute('aria-hidden','true');}});
    if(accountHost){accountHost.style.display='flex';accountHost.style.alignItems='center';accountHost.style.marginInlineStart='auto';}
    const host=document.createElement('div'); host.id='ppProfileControl'; host.className='pp-profile-control';
    host.innerHTML='<button class="pp-profile-btn" id="ppProfileBtn" type="button" aria-expanded="false" aria-haspopup="menu" aria-label="حسابي"><span class="pp-profile-avatar" id="ppProfileAvatar"><span class="pp-profile-initial">م</span></span><span class="pp-profile-chevron">⌄</span></button><div class="pp-profile-menu" id="ppProfileMenu" role="menu" aria-hidden="true"></div>';
    const account=accountHost;
    if(account){account.replaceChildren(host)}else{header.querySelector('.head,.headin,.header')?.appendChild(host); if(!host.parentElement) header.appendChild(host)}
    // Remove legacy header navigation; the side drawer is the single navigation system.
    header.querySelectorAll('nav, .header-nav, .top-nav, .headin > div:not(.logo), .header > div:not(.logo):not(.account-area):not(#ppProfileControl)').forEach(el=>{
      if(!el.closest('#ppProfileControl')) el.remove();
    });
    const btn=host.querySelector('#ppProfileBtn'), menu=host.querySelector('#ppProfileMenu');
    const close=()=>{menu.classList.remove('open');menu.setAttribute('aria-hidden','true');btn.setAttribute('aria-expanded','false')};
    const placeMenu=()=>{if(!menu.classList.contains('open'))return;const r=btn.getBoundingClientRect();const gap=8;const vw=window.innerWidth;const vh=window.innerHeight;const mw=Math.min(menu.offsetWidth||270,vw-16);const mh=menu.offsetHeight||180;let left=r.left;let top=r.bottom+gap;if(left+mw>vw-8)left=vw-mw-8;if(left<8)left=8;if(top+mh>vh-8){const above=r.top-gap-mh;if(above>=8)top=above;else top=8}menu.style.left=Math.round(left)+'px';menu.style.top=Math.round(top)+'px';menu.style.right='auto'};
    const open=()=>{menu.classList.add('open');menu.setAttribute('aria-hidden','false');btn.setAttribute('aria-expanded','true');requestAnimationFrame(placeMenu)};
    btn.addEventListener('click',e=>{e.stopPropagation();menu.classList.contains('open')?close():open()});
    window.addEventListener('resize',placeMenu,{passive:true});
    window.addEventListener('scroll',placeMenu,{passive:true});
    document.addEventListener('click',e=>{if(!host.contains(e.target))close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    try{
      const u=window.ppUser?await ppUser():null;
      const avatar=host.querySelector('#ppProfileAvatar');
      if(u){
        const p=await ppProfile(u.id);
        const name=esc(p?.full_name||u.user_metadata?.name||u.user_metadata?.full_name||u.email?.split('@')[0]||'المستخدم');
        const avatarUrl=p?.avatar_url||u.user_metadata?.avatar_url||'';
        if(avatarUrl) avatar.innerHTML='<img src="'+esc(avatarUrl)+'" alt="" loading="eager"><span class="pp-profile-online"></span>';
        else avatar.innerHTML='<span class="pp-profile-initial">'+esc(name[0]||'م')+'</span><span class="pp-profile-online"></span>';
        const isAdmin=!!(p&&p.status==='active'&&p.role&&p.role!=='member'&&p.role!=='user');
        menu.innerHTML='<div class="pp-profile-head"><div><b>'+name+'</b><small>إدارة حسابك</small></div></div>'+link('account.html','👤','حسابي')+'<div class="pp-profile-divider"></div><button id="ppProfileLogout" class="pp-profile-link danger" type="button"><span>🚪</span><span>تسجيل الخروج</span></button>';
        menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
        menu.querySelector('#ppProfileLogout').onclick=async()=>{close();try{await ppClient.auth.signOut()}finally{location.href='index.html'}};
      }else{
        avatar.innerHTML='<span class="pp-profile-initial">👤</span>';
        menu.innerHTML='<div class="pp-profile-head"><div><b>زائر</b><small>سجّل الدخول للوصول إلى حسابك</small></div></div>'+link('login.html','🔐','تسجيل الدخول')+link('register.html','📝','إنشاء حساب');
        menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
      }
    }catch(e){
      menu.innerHTML=link('login.html','🔐','تسجيل الدخول');
    }
  }

  async function buildMenu(){
    if(document.getElementById('ppMenuBtn')) return;
    const btn=document.createElement('button');btn.id='ppMenuBtn';btn.className='pp-menu-btn';btn.type='button';btn.setAttribute('aria-label','فتح القائمة');btn.textContent='☰';
    const back=document.createElement('div');back.id='ppMenuBackdrop';back.className='pp-menu-backdrop';
    const drawer=document.createElement('aside');drawer.id='ppDrawer';drawer.className='pp-drawer';drawer.setAttribute('aria-label','القائمة الرئيسية');
    drawer.innerHTML='<div class="pp-drawer-head"><div class="pp-drawer-brand">فلسطين <span>بلاتفورم</span></div><button id="ppMenuClose" class="pp-drawer-close" aria-label="إغلاق">×</button></div>'+
      '<div id="ppMenuUser" class="pp-menu-user"><div class="initial">👤</div><div><b>مرحبًا بك</b><small>حسابك في فلسطين بلاتفورم</small></div></div>'+
      '<div class="pp-menu-section pp-main-menu">'+link('index.html','🏠','الرئيسية')+link('ads.html','📢','الإعلانات')+link('services.html','⚡','الخدمات')+link('map.html','🗺️','الخريطة والمواقع')+link('favorites.html','❤️','المفضلة')+link('messages.html','💬','المحادثات')+link('notifications.html','🔔','الإشعارات')+link('orders.html','🛍️','طلباتي ومشترياتي')+'</div>'+
      '<div id="ppMenuAdmin"></div>'+
      '<div class="pp-menu-divider"></div><div id="ppMenuAuth"></div>';
    document.body.appendChild(btn);document.body.appendChild(back);document.body.appendChild(drawer);
    const open=()=>{drawer.classList.add('open');back.classList.add('open');document.body.classList.add('pp-menu-open');btn.classList.add('is-hidden');btn.setAttribute('aria-label','إغلاق القائمة')};
    const close=()=>{drawer.classList.remove('open');back.classList.remove('open');document.body.classList.remove('pp-menu-open');btn.classList.remove('is-hidden');btn.setAttribute('aria-label','فتح القائمة')};
    btn.onclick=()=>drawer.classList.contains('open')?close():open();back.onclick=close;document.getElementById('ppMenuClose').onclick=close;
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
    try{
      const u=window.ppUser?await ppUser():null; const userBox=document.getElementById('ppMenuUser'),auth=document.getElementById('ppMenuAuth');
      if(u){const p=await ppProfile(u.id);const name=esc(p?.full_name||u.user_metadata?.name||u.user_metadata?.full_name||u.email?.split('@')[0]||'المستخدم');const avatar=p?.avatar_url||u.user_metadata?.avatar_url||'';userBox.innerHTML=(avatar?'<img class="avatar" src="'+esc(avatar)+'" alt="">':'<div class="initial">'+esc(name[0]||'م')+'</div>')+'<div><b>'+name+'</b><small>حسابك في فلسطين بلاتفورم</small></div>';
        const adminBox=document.getElementById('ppMenuAdmin');
        const isAdmin=!!(p&&p.status==='active'&&p.role&&p.role!=='member'&&p.role!=='user');
        adminBox.innerHTML=isAdmin?'<div class="pp-menu-section pp-admin-menu">'+link('admin.html','👑','لوحة المدير')+link('orders-admin.html','📦','إدارة الطلبات والتوصيل')+'</div>':'';
        auth.innerHTML='';
      }
      else{userBox.innerHTML='<div class="initial">👤</div><div><b>زائر</b><small>سجّل الدخول للاستفادة من جميع الخدمات</small></div>';document.getElementById('ppMenuAdmin').innerHTML='';auth.innerHTML=link('login.html','🔐','تسجيل الدخول')+link('register.html','📝','إنشاء حساب');}
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{buildMenu();buildProfileControl()});else{buildMenu();buildProfileControl()}
})();
