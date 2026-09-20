// فلسطين بلاتفورم - طبقة مشتركة للنسخة الجديدة
window.PP_CONFIG={SUPABASE_URL:"https://sesbumfedusbjevbsyzl.supabase.co",SUPABASE_KEY:"sb_publishable_0sJrbh73jLip3O5OtJkc_A_9F6OPWqR"};
window.ppClient=window.supabase?.createClient(window.PP_CONFIG.SUPABASE_URL,window.PP_CONFIG.SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
window.ppEsc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
window.ppUser=async()=>{if(!window.ppClient)return null;const {data}=await ppClient.auth.getUser();return data?.user||null};
window.ppProfile=async(id)=>{const uid=id||(await ppUser())?.id;if(!uid)return null;const {data}=await ppClient.from('profiles').select('id,full_name,phone,city,avatar_url,role,status').eq('id',uid).maybeSingle();return data||null};
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
  async function buildMenu(){
    if(document.getElementById('ppMenuBtn')) return;
    const p=page();
    const btn=document.createElement('button');btn.id='ppMenuBtn';btn.className='pp-menu-btn';btn.type='button';btn.setAttribute('aria-label','فتح القائمة');btn.textContent='☰';
    const back=document.createElement('div');back.id='ppMenuBackdrop';back.className='pp-menu-backdrop';
    const drawer=document.createElement('aside');drawer.id='ppDrawer';drawer.className='pp-drawer';drawer.setAttribute('aria-label','القائمة الرئيسية');
    drawer.innerHTML='<div class="pp-drawer-head"><div class="pp-drawer-brand">فلسطين <span>بلاتفورم</span></div><button id="ppMenuClose" class="pp-drawer-close" aria-label="إغلاق">×</button></div>'+
      '<div id="ppMenuUser" class="pp-menu-user"><div class="initial">👤</div><div><b>مرحبًا بك</b><small>استكشف المنصة</small></div></div>'+
      '<div class="pp-quick">'+
      quick('ads.html','📢','الإعلانات','q-blue')+
      quick('add-ad.html','➕','إضافة إعلان','q-red')+
      quick('map.html','🗺️','الخريطة','q-green')+
      quick('add-place.html','📍','إضافة مكان','q-gold')+
      '</div>'+
      '<div class="pp-menu-section"><div class="pp-menu-title">استكشف</div>'+
      link('index.html','🏠','الرئيسية')+link('ads.html','📢','كل الإعلانات')+link('reels.html','🎬','الريلز')+
      link('places.html','📍','دليل الأماكن')+link('map.html','🗺️','الخريطة')+
      link('shops.html','🛍️','المتاجر')+link('restaurants.html','🍽️','المطاعم')+
      link('services.html','🛠️','الخدمات')+link('jobs.html','💼','الوظائف')+link('realestate.html','🏠','العقارات')+link('cars.html','🚗','السيارات')+
      '</div><div class="pp-menu-divider"></div>'+
      '<div class="pp-menu-section"><div class="pp-menu-title">حسابك</div>'+
      link('account.html','👤','حسابي')+link('my-ads.html','📋','إعلاناتي')+link('my-places.html','📍','أماكني')+
      link('messages.html','💬','الرسائل')+link('favorites.html','❤️','المفضلة')+
      '</div><div class="pp-menu-divider"></div>'+
      '<div id="ppMenuAuth"></div>';
    document.body.appendChild(btn);document.body.appendChild(back);document.body.appendChild(drawer);
    const open=()=>{drawer.classList.add('open');back.classList.add('open');document.body.classList.add('pp-menu-open');btn.textContent='×';btn.setAttribute('aria-label','إغلاق القائمة')};
    const close=()=>{drawer.classList.remove('open');back.classList.remove('open');document.body.classList.remove('pp-menu-open');btn.textContent='☰';btn.setAttribute('aria-label','فتح القائمة')};
    btn.onclick=()=>drawer.classList.contains('open')?close():open();back.onclick=close;document.getElementById('ppMenuClose').onclick=close;
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>close()));
    try{
      const u=window.ppUser?await ppUser():null;
      const userBox=document.getElementById('ppMenuUser'), auth=document.getElementById('ppMenuAuth');
      if(u){
        const name=esc(u.user_metadata?.name||u.user_metadata?.full_name||u.email?.split('@')[0]||'المستخدم');
        userBox.innerHTML='<div class="initial">👤</div><div><b>'+name+'</b><small>حسابك في فلسطين بلاتفورم</small></div>';
        auth.innerHTML=link('add-ad.html','➕','إضافة إعلان')+link('add-place.html','📍','إضافة مكان')+
          '<button id="ppLogoutMenu" class="pp-menu-link" type="button"><span class="pp-menu-icon">🚪</span><span>تسجيل الخروج</span></button>';
        document.getElementById('ppLogoutMenu').onclick=async()=>{await ppClient.auth.signOut();location.href='index.html'};
      }else{
        userBox.innerHTML='<div class="initial">👤</div><div><b>زائر</b><small>سجّل الدخول للاستفادة من جميع الخدمات</small></div>';
        auth.innerHTML=link('login.html','🔐','تسجيل الدخول')+link('register.html','📝','إنشاء حساب');
      }
    }catch(e){}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',buildMenu);else buildMenu();
})();
