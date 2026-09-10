## 1. تفعيل Lovable Cloud

تفعيل قاعدة البيانات والمصادقة المدمجة (بدون إعداد خارجي).

## 2. قاعدة البيانات (Migrations)

**جداول:**

- `profiles` (id → auth.users, full_name, phone, address, city, created_at) + RLS: كل مستخدم يقرأ/يعدّل ملفه فقط.
- `products` (id, name, description, price, image_url, category, stock, is_featured, created_at) + RLS: قراءة عامة (anon).
- `orders` (id, user_id, total, status, shipping_address, phone, created_at) + RLS: المستخدم يرى طلباته فقط.
- `order_items` (id, order_id, product_id, quantity, price) + RLS: مرتبط بطلبات المستخدم.
- `user_roles` + enum `app_role` + دالة `has_role` (لدعم admin لاحقاً).

**Trigger:** إنشاء صف `profiles` تلقائياً عند التسجيل.

**Seed:** إدخال 8-12 منتج (صابونة كركم، مزيل عرق، كريم تفتيح، دلكة سودانية…) بأسعار وصور.

## 3. المصادقة

- صفحة `/auth`: تسجيل دخول + إنشاء حساب (Email/Password + Google).
- زر "تسجيل دخول" في الهيدر يوجّه لـ `/auth`.
- بعد الدخول: الزر يتحوّل لقائمة حساب (اسم المستخدم + طلباتي + خروج).
- تفعيل HIBP لحماية كلمات المرور.

## 4. هيكل الصفحات (Routes منفصلة)

```
src/routes/
  index.tsx              → / (الصفحة الرئيسية — كما هي مع منتجات من DB)
  products.tsx           → /products (كل المنتجات + فلترة)
  products.$id.tsx       → /products/:id (تفاصيل المنتج + زر إضافة للسلة)
  offers.tsx             → /offers (عروض وتخفيضات)
  boxes.tsx              → /boxes (بوكسات العناية)
  cart.tsx               → /cart (السلة)
  auth.tsx               → /auth (تسجيل دخول/اشتراك)
  _authenticated/
    route.tsx            → gate
    account.tsx          → /account (ملف المستخدم)
    orders.tsx           → /orders (طلباتي)
    checkout.tsx         → /checkout (إتمام الطلب)
```

روابط الهيدر تصبح `<Link>` حقيقية بدل `#anchors`، ولكل صفحة `head()` خاص (title/description/og).

## 5. Server Functions

- `listProducts` / `getProduct` (عامة، publishable client)
- `listOffers`, `listBoxes` (عامة)
- `getMyProfile`, `updateMyProfile` (auth)
- `createOrder({items, shipping})` (auth) — يُنشئ order + order_items، ينظّف السلة
- `listMyOrders` (auth)

## 6. السلة

مخزّنة في `localStorage` (خفيفة وسريعة)، مع hook `useCart` وأيقونة عدد في الهيدر. عند Checkout ترسل للـ Server Function.

## 7. الواجهة

- الحفاظ على نفس هوية Moonflower (لون بنفسجي، خط Cairo، RTL).
- إضافة toast للنجاح/الفشل.
- Zod للتحقق من كل النماذج (auth، profile، checkout).

## 8. تحقق نهائي

- بناء ناجح، اختبار تسجيل + إنشاء طلب فعلياً، تشغيل فحص الأمان.

---

**ملاحظات تقنية:** استخدام `createServerFn` (وليس Edge Functions)، `requireSupabaseAuth` للمسارات المحمية، جميع الجداول تحتوي RLS + GRANT الصريحة، لا تخزين أدوار على `profiles`.
