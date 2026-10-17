# فلسطين بلاتفورم — المرجع الموحّد للسكيما (حتى V53 + إصلاحات ما بعد المراجعة)

> هذا الملف يجمع كل ملفات SQL المتراكمة (V19 → V53) بحالتها **النهائية** الفعلية،
> بدل الاعتماد على قراءة 15 ملف منفصل. احتفظ فيه كنسخة مرجعية، وحدّثه يدويًا
> كل ما تضيف عمود أو دالة جديدة مستقبلاً.
>
> ⚠️ ملاحظة مهمة: الجداول `profiles`, `ads`, `messages`, `conversations`,
> `favorites`, `ad_reviews`, `ad_reports`, `ad_video_likes`, `ad_video_views`,
> `ad_views` أُنشئت مباشرة من لوحة Supabase وليس من ملف SQL متتبَّع — أعمدتها
> هنا مأخوذة من استعلام `information_schema.columns` الفعلي بتاريخ المراجعة،
> وليس من ملف تقدر ترجع له لاحقًا. يُفضّل تصديرها كملف `CREATE TABLE` حقيقي
> وحفظه بمستودعك.

---

## 1) الجداول

### profiles
| عمود | نوع | ملاحظة |
|---|---|---|
| id | uuid | PK، يطابق auth.users.id |
| full_name | text | |
| phone | text | |
| city | text | |
| avatar_url | text | |
| role | text | افتراضي 'user' |
| status | text | افتراضي 'active' |
| created_at / updated_at | timestamptz | |

### ads
| عمود | نوع | ملاحظة |
|---|---|---|
| id, user_id, title, category, description, price, city, phone | — | أساسية |
| image_urls | text[] | |
| latitude, longitude, location_name | — | موقع الإعلان |
| video_url | text | |
| status | text | افتراضي 'active' — **كل البيانات الحالية بحالة active فقط** |
| delivery_available, delivery_fee, allow_cod, allow_online_payment | — | خيارات الشراء (V19) |

### conversations
id, ad_id (nullable — null لمحادثة مباشرة بدون إعلان), buyer_id, seller_id, created_at, last_message_at

### messages
id, conversation_id, sender_id, body, is_read (افتراضي false), created_at

### favorites
id, user_id, ad_id, created_at

### ad_reviews
id, ad_id, reviewer_id, owner_id, rating, review, status (افتراضي 'visible'), created_at

### ad_reports
id, reporter_id, ad_id, reason, details, status (افتراضي 'pending'), admin_note, resolved_at, created_at

### ad_video_likes / ad_video_views / ad_views
كلها: id, ad_id, user_id/viewer_id (nullable بـ views), created_at

### places (SUPABASE_UPDATE.sql)
id, user_id, name, category (افتراضي 'أخرى'), city, address, description, phone, website,
latitude, longitude, image_urls,
**status** CHECK IN ('pending','published','hidden','rejected'),
created_at, updated_at

### orders (SUPABASE_UPDATE.sql — تجارة V19)
id, ad_id, buyer_id, seller_id, quantity (1-100), unit_price, delivery_fee, total_amount,
delivery_method IN ('pickup','delivery'), payment_method IN ('cash_on_delivery','online'),
payment_provider IN ('bank_of_palestine','palpay'|null),
payment_status IN ('pending','awaiting_gateway','paid','failed','refunded','cancelled'),
order_status IN ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled'),
customer_name, customer_phone, city, address, notes, provider_reference, created_at, updated_at
> السعر يُحسب **داخل** دالة `create_order` من `ads.price` مباشرة — لا يُستقبل من العميل. ✅

### notifications
id, user_id, type (افتراضي 'system'), title, message,
related_ad_id, related_order_id, related_conversation_id (روابط اختيارية), is_read, created_at

### service_providers (SUPABASE_SERVICES.sql + إضافات V24/V32/V33/V38)
id, user_id (UNIQUE), service_type IN ('taxi','delivery','home','food','transport'), city,
is_active (افتراضي true), is_available,
display_name, vehicle_type, vehicle_number, contact_phone, base_price,
latitude, longitude, last_latitude, last_longitude, last_location_at,
specialization, passenger_capacity (1-100),
provider_kind IN ('individual','company') افتراضي individual, company_name, coverage_area, description,
created_at, updated_at

### service_requests (SUPABASE_SERVICES.sql + إضافات V36/V38)
id, requester_id, provider_id, type IN ('taxi','delivery','home','food','transport'),
status IN ('pending','accepted','in_progress','completed','cancelled'),
city, phone, from_location, to_location, details, budget,
from_lat, from_lng, to_lat, to_lng (إحداثيات الرحلة — V36),
people_count (1-20), scheduled_at, provider_note, created_at, updated_at

### taxi_reviews (SUPABASE_TAXI_V39.sql — النسخة النهائية)
id, request_id (UNIQUE), requester_id, provider_id, rating (1-5), comment, created_at

### subscription_plans / subscription_orders / subscriptions / subscription_payments (V49)
- **plans**: id (text PK), name, audience IN ('user','provider','company'), billing_period IN ('monthly','yearly'), duration_days, price, currency (افتراضي ILS), description, features (jsonb), is_active, sort_order
- **orders**: id, user_id, plan_id, amount, currency, status IN ('pending','paid','failed','cancelled'), payment_method, gateway_reference, notes
- **subscriptions**: id, user_id, plan_id, order_id, status IN ('active','expired','cancelled'), starts_at, ends_at, auto_renew
- **payments**: id, order_id, user_id, amount, currency, method, status IN ('paid','failed','refunded'), gateway_reference, paid_at

### subscription_cancellation_requests (V53)
id, subscription_id, user_id, reason, status IN ('pending','approved','rejected','cancelled'), admin_note, handled_by, handled_at, created_at

### platform_permissions / platform_role_permissions
- permissions: code (PK), label
- role_permissions: role, permission_code (PK مركّب)

### profile_follows
follower_id, following_id (PK مركّب), created_at، CHECK لمنع متابعة النفس

---

## 2) سياسات RLS الحالية (بعد التنظيف)

| جدول | العملية | الشرط المختصر |
|---|---|---|
| ads | SELECT | `status='active' OR owner OR has_permission('manage_ads')` ✅ (مُصلَح) |
| ads | INSERT/UPDATE/DELETE | المالك فقط، أو admin لـ UPDATE |
| places | SELECT | `status='published' OR owner OR has_permission('manage_places')` |
| places | INSERT/UPDATE/DELETE | المالك، أو manage_places للحذف/تعديل الإدارة |
| profiles | SELECT/UPDATE | حسب profiles_select/update + admin_select/manage_profiles |
| messages | SELECT/INSERT/UPDATE | لأطراف المحادثة فقط (لا يوجد DELETE مباشر — انظر §3) |
| conversations | SELECT/INSERT/UPDATE | لأطراف المحادثة فقط (لا يوجد DELETE مباشر — انظر §3) |
| favorites | الكل | المالك فقط |
| notifications | SELECT/UPDATE | `user_id=auth.uid()` فقط (بعد حذف التكرار) |
| ad_reports | INSERT/SELECT | المُبلِّغ فقط، أو admin |
| orders | SELECT/UPDATE | الطرفين، أو manage_orders |
| subscriptions/orders/payments | SELECT | المالك فقط، ALL لـ admin |
| subscription_cancellation_requests | SELECT/INSERT | المالك، أو manage_subscriptions |

---

## 3) الدوال (RPC) الأساسية

| الدالة | الغرض |
|---|---|
| `has_permission(code)` / `is_admin()` | فحص الصلاحيات — تُستخدم داخل كل سياسة إدارية |
| `admin_set_user_role` / `admin_set_user_status` | إدارة المستخدمين |
| `create_order(...)` | إنشاء طلب شراء — يحسب السعر من `ads.price` بالخادم (آمن) |
| `create_service_request` / `accept_service_request` / `update_my_service_request` / `cancel_my_service_request` | دورة حياة طلب خدمة عام (غير التاكسي) |
| `create_taxi_request` / `accept_taxi_service_request` / `cancel_my_taxi_request` / `update_my_provider_location` / `add_taxi_review` | دورة حياة خاصة بالتاكسي (V38/V39) |
| `request_subscription` / `admin_activate_subscription` | طلب وتفعيل اشتراك يدويًا |
| `request_subscription_cancellation` / `admin_handle_subscription_cancellation` | تدفق طلب إلغاء الاشتراك (V53) |
| `admin_list_subscription_cancellations` / `admin_list_active_subscriptions` / `admin_list_subscription_orders` / `admin_cancel_active_subscription` | أدوات لوحة المدير (V53) |
| `delete_my_conversation(id)` | **جديدة** — تحذف المحادثة ورسائلها بأمان بعد التحقق من الملكية (أُضيفت لإصلاح بگ زر الحذف) |

---

## 4) عناصر لسا مفتوحة / يُنصح بمتابعتها
- [ ] تصدير `CREATE TABLE` حقيقي للجداول العشرة غير المتتبَّعة (قسم ⚠️ بالأعلى) وحفظه كملف.
- [ ] التحقق من قيم `ON DELETE` الفعلية للـ Foreign Keys على `messages.conversation_id` (غير معروفة من الملفات).
- [ ] حذف أحد ملفي `theme-v47.css` / `theme-v48.css` من الصفحات الست بعد اختبار بصري.
- [ ] تحديث `messages.html` (تم ✅) ليستخدم `delete_my_conversation` بدل الحذف المباشر.
