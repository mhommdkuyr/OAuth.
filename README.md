# يمن كومرس AI — WhatsApp Commerce Agent 🇾🇪

منصة MVP عربية لبناء وكيل تجارة إلكترونية يعمل عبر WhatsApp Cloud API للمتاجر اليمنية.

## ما تم بناؤه

- لوحة تحكم RTL متجاوبة.
- محادثة تجريبية لوكيل المتجر.
- Rule Engine للطلبات الشائعة قبل استدعاء Gemini.
- تكامل اختياري مع @google/genai للردود وتحليل سندات الدفع.
- Webhook للتحقق من WhatsApp واستقبال الرسائل النصية والصور.
- التحقق من توقيع Webhook عبر HMAC عند ضبط WHATSAPP_APP_SECRET.
- ربط رقم WhatsApp بالمتجر داخل Supabase عبر whatsapp_phone_number_id.
- تحميل كتالوج المتجر الحي من Supabase داخل الوكيل عند وضع التشغيل الحقيقي.
- منع تكرار رسائل WhatsApp بالاعتماد على wa_message_id.
- إرسال رسائل نصية وقوائم منتجات عبر WhatsApp Cloud API.
- تحليل صور سندات الدفع عبر Gemini Vision.
- دورة Human-in-the-loop لتأكيد أو رفض الطلب.
- مسارات API لاعتماد ورفض الطلب.
- حماية نقطة الإرسال الداخليّة عبر INTERNAL_API_TOKEN.
- وضع Demo يعمل بدون مفاتيح خارجية.
- مخطط Supabase/PostgreSQL للمتجر والكتالوج والسلات والطلبات والدفع وسجل التدقيق.
- دالة PostgreSQL ذرّية لخصم المخزون عند اعتماد الطلب.
- بحث دلالي للمنتجات عبر pgvector.
- PWA manifest أساسي.
- GitHub Actions للتحقق من TypeScript وبناء الإنتاج.

## التشغيل

1. ثبّت الاعتماديات: npm install
2. انسخ .env.example إلى .env.local
3. شغّل npm run dev
4. افتح http://localhost:3000

الوضع الافتراضي تجريبي؛ لا تحتاج مفاتيح Gemini أو Supabase أو WhatsApp لعرض الواجهة واختبار تدفقها.

## Gemini

ضع في .env.local:

GEMINI_API_KEY=...
GEMINI_MODEL=gemini-flash-latest

لا تضع المفتاح في كود المتصفح أو داخل المستودع.

## Supabase

ضع:

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_DEMO_MODE=false

ثم نفّذ supabase/schema.sql في SQL Editor داخل مشروع Supabase.

مفتاح SUPABASE_SERVICE_ROLE_KEY مخصص للخادم فقط.

أضف للمتجر قيمة whatsapp_phone_number_id التي تطابق phone_number_id القادم من Webhook.

## WhatsApp Cloud API

ضع:

WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_APP_SECRET=...
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_GRAPH_VERSION=...

واجعل عنوان Webhook:

https://YOUR-DOMAIN.com/api/whatsapp/webhook

مسار GET موجود لتحقق Meta، وPOST يتحقق من توقيع x-hub-signature-256 إذا كان WHATSAPP_APP_SECRET مضبوطًا.

نقطة الإرسال الداخليّة:

POST /api/whatsapp/send

وتتطلب Authorization: Bearer <INTERNAL_API_TOKEN> عند تعطيل Demo Mode.

## تحليل سند الدفع

النقطة:

POST /api/payments/analyze-receipt

وترسل لها صورة باسم file بصيغة multipart/form-data.

كما أن Webhook يتعامل مع رسائل الصور ويقرأ بيانات السند عبر Gemini Vision.

يتم استخراج:
- المبلغ الظاهر.
- الرقم المرجعي.
- درجة الثقة.
- ملاحظة تحليلية.

التحليل لا يعني إثبات الدفع؛ اعتماد الدفع النهائي يبقى قرارًا بشريًا.

## المسار التجاري

عميل → WhatsApp → Webhook → Rule Engine / Gemini → الكتالوج والمخزون → السلة والطلب → سند الدفع → تحليل AI → مراجعة التاجر → تأكيد وخصم المخزون أو رفض دون خصم.

## الاختبار في GitHub

الـCI ينفذ npm install ثم npm run typecheck ثم npm run build مع فحص ملفات التشغيل الأساسية.

آخر تحقق ناجح يتطلب أن يكون commit الحالي متوافقًا مع هذا الـworkflow.

## قبل الإنتاج

لا يزال يلزم:
- مصادقة التجار وإضافة RLS متعددة المستأجرين في Supabase.
- ربط التخزين السحابي الدائم للصور والفواتير.
- تنفيذ إصدار PDF الفعلي للفواتير بدل invoiceQueued فقط.
- إنشاء سلة وطلب فعليين من محادثة WhatsApp وربطهما آليًا بالدفع.
- ربط مزود دفع محلي بعد توفر API أو Webhooks موثقة.
- إضافة جدولة السلات المتروكة والرسائل المسموح بها وفق سياسة حساب WhatsApp.
- إضافة اختبارات تكامل حقيقية مع Meta وGemini وSupabase.

## البنية

app/ يحتوي الواجهة ومسارات API.
lib/ يحتوي منطق الوكيل وWhatsApp وSupabase والمنطق التجاري.
supabase/schema.sql يحتوي مخطط قاعدة البيانات والدوال الذرّية.
.github/workflows/ci.yml يحتوي فحص البناء الآلي.
