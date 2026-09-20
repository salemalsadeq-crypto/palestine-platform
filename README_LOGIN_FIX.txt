إصلاح خطأ تسجيل الدخول - 2026-09-20

تم إصلاح الخطأ:
Cannot read properties of undefined (reading 'auth')

السبب:
platform.js كان يُحمّل في بعض الصفحات قبل مكتبة Supabase، وبالتالي كان window.ppClient غير موجود.

الإصلاح:
- تحميل @supabase/supabase-js قبل platform.js في الصفحات التي تعتمد عليه.
- إصلاح login.html ليحمّل Supabase ثم platform.js قبل استخدام ppClient.
- إصلاح register.html وaccount.html وmy-ads.html والصفحات الأخرى ذات ترتيب السكربتات غير الصحيح.

لا حاجة لتغيير SQL لهذا الإصلاح.
