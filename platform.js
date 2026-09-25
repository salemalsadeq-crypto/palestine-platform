/* ============================================================
   فلسطين بلاتفورم
   platform.js - Shared Layer / Stable V56.x
   ============================================================ */

(function () {
  'use strict';

  /* ------------------------------------------------------------
     Configuration
     ------------------------------------------------------------ */

  window.PP_CONFIG = window.PP_CONFIG || {
    SUPABASE_URL: "https://sesbumfedusbjevbsyzl.supabase.co",
    SUPABASE_KEY: "sb_publishable_0sJrbh73jLip3O5OtJkc_A_9F6OPWqR"
  };

  /* ------------------------------------------------------------
     Supabase client
     ------------------------------------------------------------ */

  function getClient() {
    if (window.ppClient) return window.ppClient;

    if (
      window.supabase &&
      typeof window.supabase.createClient === 'function'
    ) {
      try {
        window.ppClient = window.supabase.createClient(
          window.PP_CONFIG.SUPABASE_URL,
          window.PP_CONFIG.SUPABASE_KEY,
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true
            }
          }
        );

        return window.ppClient;
      } catch (e) {
        console.error('Supabase initialization failed:', e);
        return null;
      }
    }

    console.error(
      'Supabase library is not loaded. Make sure @supabase/supabase-js is loaded before platform.js.'
    );

    return null;
  }

  window.ppGetClient = getClient;

  /* ------------------------------------------------------------
     Helpers
     ------------------------------------------------------------ */

  window.ppEsc = function (value) {
    return String(value ?? '').replace(
      /[&<>"']/g,
      function (m) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        }[m];
      }
    );
  };

  function safeElement(id) {
    return document.getElementById(id);
  }

  function showElement(el, display) {
    if (!el) return;
    el.style.display = display;
    el.removeAttribute('aria-hidden');
  }

  function hideElement(el) {
    if (!el) return;
    el.style.display = 'none';
    el.setAttribute('aria-hidden', 'true');
  }

  /* ------------------------------------------------------------
     Auth
     ------------------------------------------------------------ */

  window.ppUser = async function () {
    const client = getClient();
    if (!client) return null;

    try {
      const result = await client.auth.getUser();

      if (result.error) {
        console.warn('ppUser:', result.error.message);
        return null;
      }

      return result.data?.user || null;
    } catch (e) {
      console.error('ppUser failed:', e);
      return null;
    }
  };

  /* ------------------------------------------------------------
     Profile
     ------------------------------------------------------------ */

  window.ppProfile = async function (id) {
    const client = getClient();
    if (!client) return null;

    try {
      let uid = id;

      if (!uid) {
        const user = await window.ppUser();
        uid = user?.id;
      }

      if (!uid) return null;

      const { data, error } = await client
        .from('profiles')
        .select(
          'id,full_name,phone,city,avatar_url,role,status'
        )
        .eq('id', uid)
        .maybeSingle();

      if (error) {
        console.warn('ppProfile:', error.message);
        return null;
      }

      return data || null;
    } catch (e) {
      console.error('ppProfile failed:', e);
      return null;
    }
  };

  /* ------------------------------------------------------------
     Notifications count
     ------------------------------------------------------------ */

  window.ppUnreadNotifications = async function () {
    const client = getClient();
    if (!client) return 0;

    try {
      const user = await window.ppUser();

      if (!user) return 0;

      const { count, error } = await client
        .from('notifications')
        .select('id', {
          count: 'exact',
          head: true
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.warn('Notification count:', error.message);
        return 0;
      }

      return count || 0;
    } catch (e) {
      return 0;
    }
  };

  /* ------------------------------------------------------------
     Roles
     ------------------------------------------------------------ */

  window.ppRoleLabel = function (role) {
    const labels = {
      admin: 'مدير عام',
      manager: 'مدير',
      editor: 'محرر',
      moderator: 'مشرف',
      places_manager: 'مدير المواقع',
      ads_manager: 'مدير الإعلانات',
      member: 'عضو',
      user: 'عضو'
    };

    return labels[role] || 'عضو';
  };

  /* ------------------------------------------------------------
     Permission
     ------------------------------------------------------------ */

  window.ppCan = async function (permission) {
    const client = getClient();

    if (!client || !permission) return false;

    try {
      const { data, error } = await client.rpc(
        'has_permission',
        {
          permission_code: permission
        }
      );

      if (error) {
        console.warn(
          'Permission check failed:',
          permission,
          error.message
        );
        return false;
      }

      return data === true;
    } catch (e) {
      console.error('ppCan failed:', e);
      return false;
    }
  };

  /* ------------------------------------------------------------
     Require permission
     ------------------------------------------------------------ */

  window.ppRequire = async function (permission) {
    const user = await window.ppUser();

    if (!user) {
      window.location.href = 'login.html';
      return null;
    }

    if (permission) {
      const allowed = await window.ppCan(permission);

      if (!allowed) {
        document.body.innerHTML = `
          <main
            style="
              font-family:Arial,sans-serif;
              text-align:center;
              padding:60px 20px;
              direction:rtl;
            "
          >
            <div
              style="
                max-width:520px;
                margin:auto;
                padding:35px;
                border-radius:20px;
                background:#fff;
                box-shadow:0 10px 40px rgba(0,0,0,.08);
              "
            >
              <div style="font-size:50px">⛔</div>
              <h2>لا تملك الصلاحية</h2>
              <p>ليس لديك الإذن للوصول إلى هذه الصفحة.</p>
              <a
                href="index.html"
                style="
                  display:inline-block;
                  margin-top:15px;
                  padding:12px 22px;
                  border-radius:12px;
                  background:#176b45;
                  color:#fff;
                  text-decoration:none;
                "
              >
                العودة للرئيسية
              </a>
            </div>
          </main>
        `;

        return null;
      }
    }

    return user;
  };

  /* ------------------------------------------------------------
     Public / signed video URL
     ------------------------------------------------------------ */

  window.ppPublicVideo = async function (url) {
    const client = getClient();

    if (!url) return null;

    if (
      url.includes('/storage/v1/object/public/')
    ) {
      return url;
    }

    const match = url.match(
      /\/storage\/v1\/object\/([^/]+)\/(.+)$/
    );

    if (!match || !client) return url;

    const bucket = match[1];
    const path = decodeURIComponent(match[2]);

    try {
      const { data, error } = await client.storage
        .from(bucket)
        .createSignedUrl(path, 3600);

      return error
        ? url
        : data?.signedUrl || url;
    } catch (e) {
      return url;
    }
  };

  /* ------------------------------------------------------------
     Old header compatibility
     ------------------------------------------------------------ */

  window.ppSetupHeader = async function () {
    const user = await window.ppUser();

    const login = safeElement('login');
    const account = safeElement('account');
    const myads = safeElement('myads');
    const admin = safeElement('adminLink');
    const logout = safeElement('logout');

    if (!user) {
      showElement(login, 'inline-block');

      hideElement(account);
      hideElement(myads);
      hideElement(admin);
      hideElement(logout);

      return null;
    }

    hideElement(login);

    showElement(account, 'inline-block');
    showElement(myads, 'inline-block');
    showElement(logout, 'inline-block');

    const profile = await window.ppProfile(user.id);

    if (admin) {
      const adminAllowed =
        profile &&
        profile.status === 'active' &&
        profile.role &&
        profile.role !== 'member' &&
        profile.role !== 'user';

      admin.style.display =
        adminAllowed ? 'inline-block' : 'none';
    }

    const nameValue =
      (
        profile?.full_name ||
        user.email?.split('@')[0] ||
        'المستخدم'
      ).trim();

    const name = safeElement('name');
    const initial = safeElement('initial');
    const avatar = safeElement('avatar');

    if (name) {
      name.textContent = nameValue;
    }

    if (initial) {
      initial.textContent =
        nameValue[0] || 'م';

      if (avatar && profile?.avatar_url) {
        initial.style.display = 'none';
      } else {
        initial.style.display = 'flex';
      }
    }

    if (avatar && profile?.avatar_url) {
      avatar.src = profile.avatar_url;
      avatar.style.display = 'block';
    }

    if (
      logout &&
      !logout.dataset.ppBound
    ) {
      logout.dataset.ppBound = '1';

      logout.addEventListener(
        'click',
        async function (event) {
          event.preventDefault();

          const client = getClient();

          try {
            if (client) {
              await client.auth.signOut();
            }
          } finally {
            window.location.href = 'index.html';
          }
        }
      );
    }

    return {
      user: user,
      profile: profile
    };
  };

  /* ============================================================
     UI
     ============================================================ */

  function escape(value) {
    return window.ppEsc
      ? window.ppEsc(value)
      : String(value ?? '');
  }

  function menuLink(href, icon, label) {
    return `
      <a
        class="pp-menu-link"
        href="${escape(href)}"
      >
        <span class="pp-menu-icon">${icon}</span>
        <span>${escape(label)}</span>
      </a>
    `;
  }

  /* ------------------------------------------------------------
     Profile control
     ------------------------------------------------------------ */

  async function buildProfileControl() {
    try {
      const header =
        document.querySelector(
          'header,.header'
        );

      if (!header) return;

      if (
        document.getElementById(
          'ppProfileControl'
        )
      ) {
        return;
      }

      /*
       * لا نحذف عناصر الصفحة القديمة.
       * فقط نخفيها إذا كانت موجودة.
       */
      [
        'account',
        'myads',
        'adminLink',
        'logout',
        'login',
        'name',
        'initial',
        'avatar'
      ].forEach(function (id) {
        hideElement(
          document.getElementById(id)
        );
      });

      const host =
        document.createElement('div');

      host.id = 'ppProfileControl';
      host.className =
        'pp-profile-control';

      host.innerHTML = `
        <button
          class="pp-profile-btn"
          id="ppProfileBtn"
          type="button"
          aria-expanded="false"
          aria-haspopup="menu"
          aria-label="حسابي"
        >
          <span
            class="pp-profile-avatar"
            id="ppProfileAvatar"
          >
            <span class="pp-profile-initial">
              م
            </span>
          </span>

          <span class="pp-profile-chevron">
            ⌄
          </span>
        </button>

        <div
          class="pp-profile-menu"
          id="ppProfileMenu"
          role="menu"
          aria-hidden="true"
        ></div>
      `;

      const accountHost =
        header.querySelector(
          '.account'
        );

      if (accountHost) {
        accountHost.appendChild(host);
      } else {
        const container =
          header.querySelector(
            '.head,.headin'
          );

        if (container) {
          container.appendChild(host);
        } else {
          header.appendChild(host);
        }
      }

      const btn =
        host.querySelector(
          '#ppProfileBtn'
        );

      const menu =
        host.querySelector(
          '#ppProfileMenu'
        );

      if (!btn || !menu) return;

      function closeMenu() {
        menu.classList.remove('open');
        menu.setAttribute(
          'aria-hidden',
          'true'
        );
        btn.setAttribute(
          'aria-expanded',
          'false'
        );
      }

      function positionMenu() {
        if (
          !menu.classList.contains('open')
        ) {
          return;
        }

        const rect =
          btn.getBoundingClientRect();

        const vw =
          window.innerWidth ||
          document.documentElement.clientWidth;

        const vh =
          window.innerHeight ||
          document.documentElement.clientHeight;

        const width =
          Math.min(
            menu.offsetWidth || 270,
            vw - 16
          );

        const height =
          menu.offsetHeight || 180;

        let left = rect.left;
        let top =
          rect.bottom + 8;

        if (
          left + width >
          vw - 8
        ) {
          left =
            vw - width - 8;
        }

        if (left < 8) {
          left = 8;
        }

        if (
          top + height >
          vh - 8
        ) {
          const above =
            rect.top - height - 8;

          top =
            above >= 8
              ? above
              : 8;
        }

        menu.style.left =
          Math.round(left) + 'px';

        menu.style.top =
          Math.round(top) + 'px';

        menu.style.right = 'auto';
      }

      function openMenu() {
        menu.classList.add('open');

        menu.setAttribute(
          'aria-hidden',
          'false'
        );

        btn.setAttribute(
          'aria-expanded',
          'true'
        );

        requestAnimationFrame(
          positionMenu
        );
      }

      btn.addEventListener(
        'click',
        function (event) {
          event.stopPropagation();

          if (
            menu.classList.contains('open')
          ) {
            closeMenu();
          } else {
            openMenu();
          }
        }
      );

      window.addEventListener(
        'resize',
        positionMenu,
        { passive: true }
      );

      window.addEventListener(
        'scroll',
        positionMenu,
        { passive: true }
      );

      document.addEventListener(
        'click',
        function (event) {
          if (
            !host.contains(event.target)
          ) {
            closeMenu();
          }
        }
      );

      document.addEventListener(
        'keydown',
        function (event) {
          if (
            event.key === 'Escape'
          ) {
            closeMenu();
          }
        }
      );

      const user =
        await window.ppUser();

      const avatar =
        host.querySelector(
          '#ppProfileAvatar'
        );

      if (user) {
        const profile =
          await window.ppProfile(
            user.id
          );

        const name =
          escape(
            profile?.full_name ||
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            'المستخدم'
          );

        const avatarUrl =
          profile?.avatar_url ||
          user.user_metadata?.avatar_url ||
          '';

        if (avatarUrl) {
          avatar.innerHTML = `
            <img
              src="${escape(avatarUrl)}"
              alt=""
              loading="eager"
            >
            <span
              class="pp-profile-online"
            ></span>
          `;
        } else {
          avatar.innerHTML = `
            <span
              class="pp-profile-initial"
            >
              ${escape(name[0] || 'م')}
            </span>
            <span
              class="pp-profile-online"
            ></span>
          `;
        }

        menu.innerHTML = `
          <div class="pp-profile-head">
            <div>
              <b>${name}</b>
              <small>إدارة حسابك</small>
            </div>
          </div>

          ${menuLink(
            'account.html',
            '👤',
            'حسابي'
          )}

          ${menuLink(
            'messages.html',
            '💬',
            'المحادثات'
          )}

          ${menuLink(
            'notifications.html',
            '🔔',
            'الإشعارات'
          )}

          <div class="pp-profile-divider"></div>

          <button
            id="ppProfileLogout"
            class="pp-profile-link danger"
            type="button"
          >
            <span>🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        `;

        menu
          .querySelectorAll('a')
          .forEach(function (a) {
            a.addEventListener(
              'click',
              closeMenu
            );
          });

        const logout =
          menu.querySelector(
            '#ppProfileLogout'
          );

        if (logout) {
          logout.addEventListener(
            'click',
            async function () {
              closeMenu();

              const client =
                getClient();

              try {
                if (client) {
                  await client.auth.signOut();
                }
              } finally {
                window.location.href =
                  'index.html';
              }
            }
          );
        }
      } else {
        avatar.innerHTML = `
          <span class="pp-profile-initial">
            👤
          </span>
        `;

        menu.innerHTML = `
          <div class="pp-profile-head">
            <div>
              <b>زائر</b>
              <small>
                سجّل الدخول للوصول إلى حسابك
              </small>
            </div>
          </div>

          ${menuLink(
            'login.html',
            '🔐',
            'تسجيل الدخول'
          )}

          ${menuLink(
            'register.html',
            '📝',
            'إنشاء حساب'
          )}
        `;

        menu
          .querySelectorAll('a')
          .forEach(function (a) {
            a.addEventListener(
              'click',
              closeMenu
            );
          });
      }
    } catch (error) {
      console.error(
        'Profile control failed:',
        error
      );
    }
  }

  /* ------------------------------------------------------------
     Main menu
     ------------------------------------------------------------ */

  async function buildMenu() {
    if (
      document.getElementById(
        'ppMenuBtn'
      )
    ) {
      return;
    }

    const btn =
      document.createElement(
        'button'
      );

    btn.id = 'ppMenuBtn';
    btn.className =
      'pp-menu-btn';
    btn.type = 'button';
    btn.setAttribute(
      'aria-label',
      'فتح القائمة'
    );
    btn.textContent = '☰';

    const backdrop =
      document.createElement(
        'div'
      );

    backdrop.id =
      'ppMenuBackdrop';

    backdrop.className =
      'pp-menu-backdrop';

    const drawer =
      document.createElement(
        'aside'
      );

    drawer.id = 'ppDrawer';
    drawer.className =
      'pp-drawer';

    drawer.setAttribute(
      'aria-label',
      'القائمة الرئيسية'
    );

    drawer.innerHTML = `
      <div class="pp-drawer-head">
        <div class="pp-drawer-brand">
          فلسطين
          <span>بلاتفورم</span>
        </div>

        <button
          id="ppMenuClose"
          class="pp-drawer-close"
          type="button"
          aria-label="إغلاق"
        >
          ×
        </button>
      </div>

      <div
        id="ppMenuUser"
        class="pp-menu-user"
      >
        <div class="initial">
          👤
        </div>

        <div>
          <b>مرحبًا بك</b>
          <small>
            حسابك في فلسطين بلاتفورم
          </small>
        </div>
      </div>

      <div
        class="pp-menu-section pp-main-menu"
      >
        ${menuLink(
          'index.html',
          '🏠',
          'الرئيسية'
        )}

        ${menuLink(
          'ads.html',
          '📢',
          'الإعلانات'
        )}

        ${menuLink(
          'reels.html',
          '🎬',
          'الريلز'
        )}

        ${menuLink(
          'my-ads.html',
          '📋',
          'إعلاناتي'
        )}

        ${menuLink(
          'favorites.html',
          '❤️',
          'المفضلة'
        )}

        ${menuLink(
          'messages.html',
          '💬',
          'المحادثات'
        )}

        ${menuLink(
          'notifications.html',
          '🔔',
          'الإشعارات'
        )}

        ${menuLink(
          'orders.html',
          '🛍️',
          'طلباتي ومشترياتي'
        )}

        ${menuLink(
          'service-center.html',
          '⚡',
          'مركز الخدمات'
        )}
      </div>

      <div id="ppMenuAdmin"></div>

      <div
        class="pp-menu-divider"
      ></div>

      <div id="ppMenuAuth"></div>
    `;
    document.body.appendChild(btn);
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    function openMenu() {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.classList.add(
        'pp-menu-open'
      );

      btn.classList.add(
        'is-hidden'
      );

      btn.setAttribute(
        'aria-label',
        'إغلاق القائمة'
      );
    }

    function closeMenu() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.classList.remove(
        'pp-menu-open'
      );

      btn.classList.remove(
        'is-hidden'
      );

      btn.setAttribute(
        'aria-label',
        'فتح القائمة'
      );
    }

    btn.addEventListener(
      'click',
      function () {
        drawer.classList.contains(
          'open'
        )
          ? closeMenu()
          : openMenu();
      }
    );

    backdrop.addEventListener(
      'click',
      closeMenu
    );

    const closeButton =
      drawer.querySelector(
        '#ppMenuClose'
      );

    if (closeButton) {
      closeButton.addEventListener(
        'click',
        closeMenu
      );
    }

    document.addEventListener(
      'keydown',
      function (event) {
        if (
          event.key === 'Escape'
        ) {
          closeMenu();
        }
      }
    );

    drawer
      .querySelectorAll('a')
      .forEach(function (a) {
        a.addEventListener(
          'click',
          closeMenu
        );
      });

    try {
      const user =
        await window.ppUser();

      const userBox =
        document.getElementById(
          'ppMenuUser'
        );

      const auth =
        document.getElementById(
          'ppMenuAuth'
        );

      const adminBox =
        document.getElementById(
          'ppMenuAdmin'
        );

      if (!user) {
        if (userBox) {
          userBox.innerHTML = `
            <div class="initial">
              👤
            </div>

            <div>
              <b>زائر</b>
              <small>
                سجّل الدخول للاستفادة من جميع الخدمات
              </small>
            </div>
          `;
        }
        if (adminBox) {
          adminBox.innerHTML = '';
        }

        if (auth) {
          auth.innerHTML =
            menuLink(
              'login.html',
              '🔐',
              'تسجيل الدخول'
            ) +
            menuLink(
              'register.html',
              '📝',
              'إنشاء حساب'
            );
        }

        return;
      }

      const profile =
        await window.ppProfile(
          user.id
        );

      const name =
        escape(
          profile?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'المستخدم'
        );

      const avatar =
        profile?.avatar_url ||
        user.user_metadata?.avatar_url ||
        '';

      if (userBox) {
        userBox.innerHTML =
          (
            avatar
              ? `
                <img
                  class="avatar"
                  src="${escape(avatar)}"
                  alt=""
                >
              `
              : `
                <div class="initial">
                  ${escape(
                    name[0] || 'م'
                  )}
                </div>
              `
          ) +
          `
            <div>
              <b>${name}</b>
              <small>
                حسابك في فلسطين بلاتفورم
              </small>
            </div>
          `;
      }

      /*
       * الإدارة تظهر فقط للمستخدم النشط
       * صاحب دور إداري.
       *
       * الأمان الحقيقي يبقى في RLS/RPC.
       */
      const isAdmin =
        !!(
          profile &&
          profile.status === 'active' &&
          profile.role &&
          ![
            'member',
            'user'
          ].includes(profile.role)
        );

      if (adminBox) {
        adminBox.innerHTML =
          isAdmin
            ? `
              <div
                class="pp-menu-section pp-admin-menu"
              >
                ${menuLink(
                  'admin.html',
                  '👑',
                  'لوحة المدير'
                )}

                ${menuLink(
                  'orders-admin.html',
                  '📦',
                  'إدارة الطلبات والتوصيل'
                )}

                ${menuLink(
                  'admin-subscriptions.html',
                  '💳',
                  'إدارة الاشتراكات'
                )}

                ${menuLink(
                  'moderation.html',
                  '🛡️',
                  'الثقة والسلامة'
                )}
              </div>
            `
            : '';
      } 
    if (auth) {
        auth.innerHTML = '';
      }
    } catch (error) {
      console.error(
        'Main menu initialization failed:',
        error
      );
    }
  }

  /* ============================================================
     Notifications
     ============================================================ */

  let notificationChannel = null;

  window.ppNotificationListener =
    async function () {
      const client =
        getClient();

      if (!client) return;

      if (notificationChannel) {
        return;
      }

      try {
        const user =
          await window.ppUser();

        if (!user) return;

        notificationChannel =
          client
            .channel(
              'pp-notifications-' +
              user.id
            )
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter:
                  'user_id=eq.' +
                  user.id
              },
              function () {
                playNotificationSound();

                window.dispatchEvent(
                  new CustomEvent(
                    'pp:new-notification'
                  )
                );
              }
            );

        await notificationChannel.subscribe();
      } catch (error) {
        notificationChannel = null;

        console.warn(
          'Notification realtime failed:',
          error
        );
      }
    };

  /* ------------------------------------------------------------
     Notification sound
     ------------------------------------------------------------ */

  function playNotificationSound() {
    try {
      if (
        localStorage.getItem(
          'pp_notification_sound'
        ) !== '1'
      ) {
        return;
      }

      const AudioCtx =
        window.AudioContext ||
        window.webkitAudioContext;
      if (!AudioCtx) return;

      const context =
        new AudioCtx();

      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      oscillator.frequency.value =
        880;

      gain.gain.value =
        0.06;

      oscillator.connect(gain);
      gain.connect(
        context.destination
      );

      oscillator.start();

      oscillator.stop(
        context.currentTime + 0.15
      );

      oscillator.onended =
        function () {
          try {
            context.close();
          } catch (_) {}
        };
    } catch (_) {}
  }

  window.ppPlayNotificationSound =
    playNotificationSound;

  /* ============================================================
     Initialization
     ============================================================ */

  async function initializePlatform() {
    try {
      await buildMenu();
    } catch (e) {
      console.error(
        'Platform menu error:',
        e
      );
    }

    try {
      await buildProfileControl();
    } catch (e) {
      console.error(
        'Platform profile error:',
        e
      );
    }

    /*
     * نؤجل Realtime قليلًا حتى نتأكد
     * أن Supabase والصفحة تم تحميلهما.
     */
    setTimeout(
      function () {
        if (
          typeof window.ppNotificationListener ===
          'function'
        ) {
          window.ppNotificationListener();
        }
      },
      1000
    );
  }
  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      initializePlatform,
      { once: true }
    );
  } else {
    initializePlatform();
  }

})();
