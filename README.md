# يمن كومرس AI — WhatsApp Commerce Agent 🇾🇪

منصة عربية لبناء وكيل تجارة إلكترونية يعمل عبر WhatsApp Cloud API للمتاجر اليمنية.

## الحالة الحالية

- Next.js + React + TypeScript + RTL.
- Dashboard للتاجر.
- Rule Engine + Gemini.
- WhatsApp Cloud API webhook/send.
- Supabase PostgreSQL + pgvector.
- كتالوج ومخزون حي.
- سلات وطلبات وسندات دفع.
- تحليل سندات الدفع عبر Gemini Vision.
- Human-in-the-loop لاعتماد/رفض الدفع.
- خصم مخزون ذري عند اعتماد الطلب.
- منع تكرار رسائل WhatsApp.
- PWA manifest.
- GitHub Actions للتحقق من TypeScript والبناء.

## خدمات الإنتاج

Vercel يشغّل التطبيق.
Supabase يحفظ بيانات المتاجر والمنتجات والطلبات والدفع.
Gemini يعالج المحادثات وتحليل الصور.
WhatsApp Cloud API يستقبل ويرسل رسائل العملاء.

## متغيرات البيئة

ضع الأسرار في Vercel Environment Variables فقط:

NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_APP_NAME=Yemen Commerce AI
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-flash-latest
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_APP_SECRET=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...
INTERNAL_API_TOKEN=...

لا تضع الأسرار في GitHub.

## Webhook

بعد نجاح Deployment:

https://YOUR-DOMAIN/api/whatsapp/webhook

GET يستخدم للتحقق من Meta، وPOST يستقبل أحداث WhatsApp ويتحقق من x-hub-signature-256 عند ضبط WHATSAPP_APP_SECRET.

## الاختبار

GET /api/health يعرض حالة التكاملات الحالية.

في الوضع الحقيقي يجب أن تظهر:

mode: live
gemini: true
supabase: true
whatsapp: true

## قاعدة البيانات

supabase/schema.sql هو مصدر مخطط قاعدة البيانات، ويحتوي على:
merchants, customers, products, carts, cart_items, orders, order_items, payment_receipts, whatsapp_messages, audit_logs.

كما يحتوي على approve_order وreject_order وmatch_products.

## قبل الإنتاج التجاري

يلزم إكمال:
- مصادقة التجار وRLS متعددة المستأجرين.
- التخزين الدائم للصور والفواتير.
- PDF فعلي للفواتير.
- إنشاء السلة والطلب تلقائيًا من محادثة WhatsApp.
- جدولة السلات المتروكة.
- تكامل مزودي الدفع المحليين عندما تتوفر واجهات API/Webhooks.
- اختبارات تكامل فعلية مع حساب Meta وGemini.

هذه العناصر لا تُعتبر مكتملة لمجرد وجود واجهة لها؛ يجب اختبارها مع الخدمات الحقيقية.
