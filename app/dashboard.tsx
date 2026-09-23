"use client";

import { useMemo, useState } from "react";

type PaymentStatus = "معلق" | "جاهز للمراجعة" | "مؤكد" | "مرفوض";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
};

type PaymentReview = {
  id: string;
  customer: string;
  amount: number;
  reference: string;
  status: PaymentStatus;
  orderId: string;
};

const products: Product[] = [
  { id: "p1", name: "بيبسي 330 مل", category: "مشروبات", price: 450, stock: 42 },
  { id: "p2", name: "ماء شملان 330 مل", category: "مياه", price: 180, stock: 8 },
  { id: "p3", name: "عصير راني", category: "عصائر", price: 600, stock: 19 },
  { id: "p4", name: "بسكويت أبو ولد", category: "بسكويت", price: 350, stock: 4 },
  { id: "p5", name: "شاي الكبوس 250 جم", category: "مواد غذائية", price: 1750, stock: 27 },
];

const paymentReviews: PaymentReview[] = [
  { id: "pay-1042", customer: "أحمد محمد", amount: 7200, reference: "JIB-843921", status: "جاهز للمراجعة", orderId: "#1042" },
  { id: "pay-1041", customer: "محمد علي", amount: 3500, reference: "KRM-882103", status: "معلق", orderId: "#1041" },
  { id: "pay-1039", customer: "عبدالله صالح", amount: 5400, reference: "ONE-330812", status: "مؤكد", orderId: "#1039" },
];

const formatYER = (value: number) =>
  new Intl.NumberFormat("ar-YE", {
    style: "currency",
    currency: "YER",
    maximumFractionDigits: 0,
  }).format(value);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [reviews, setReviews] = useState(paymentReviews);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("اكتب رسالة تجريبية وسأحاكي وكيل المتجر.");
  const [busy, setBusy] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState("967700000000");

  const lowStock = useMemo(() => products.filter((product) => product.stock <= 8), []);

  async function testAgent() {
    if (!message.trim()) return;
    setBusy(true);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, products, customerName: "عميل تجريبي" }),
      });
      const data = await response.json();
      setReply(data.reply ?? "تعذر الحصول على رد.");
    } catch {
      setReply("حدث خطأ في الاتصال بالوكيل.");
    } finally {
      setBusy(false);
    }
  }

  async function approvePayment(review: PaymentReview) {
    setBusy(true);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(review.orderId)}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentReviewId: review.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "approval failed");
      setReviews((items) => items.map((item) => item.id === review.id ? { ...item, status: "مؤكد" } : item));
    } catch (error) {
      setReply(error instanceof Error ? error.message : "تعذر تأكيد العملية.");
    } finally {
      setBusy(false);
    }
  }

  async function rejectPayment(review: PaymentReview) {
    setBusy(true);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(review.orderId)}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentReviewId: review.id, reason: "السند يحتاج إلى مراجعة بشرية." }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "rejection failed");
      setReviews((items) => items.map((item) => item.id === review.id ? { ...item, status: "مرفوض" } : item));
    } catch (error) {
      setReply(error instanceof Error ? error.message : "تعذر رفض العملية.");
    } finally {
      setBusy(false);
    }
  }

  const tabs = [
    ["overview", "لوحة التحكم"],
    ["whatsapp", "محادثات واتساب"],
    ["catalog", "الكتالوج والمخزون"],
    ["payments", "سندات الدفع"],
    ["automation", "الأتمتة"],
  ];

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">ي</div>
          <div><strong>يمن كومرس AI</strong><span>وكيل التجارة عبر واتساب</span></div>
        </div>
        <nav>
          {tabs.map(([key, label]) => (
            <button key={key} className={activeTab === key ? "nav-item active" : "nav-item"} onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="status-dot" />
          الوضع التجريبي نشط
          <small>أضف المفاتيح من متغيرات البيئة لتفعيل الخدمات الحقيقية.</small>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div><span className="eyebrow">متجر نموذجي</span><h1>{tabs.find(([key]) => key === activeTab)?.[1]}</h1></div>
          <div className="phone-chip">
            <span>رقم واتساب</span>
            <select value={selectedPhone} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setSelectedPhone(event.target.value)}>
              <option value="967700000000">+967 700 000 000</option>
              <option value="967711111111">+967 711 111 111</option>
            </select>
          </div>
        </header>

        {activeTab === "overview" && (
          <>
            <section className="kpis">
              <article className="kpi"><span>محادثات اليوم</span><strong>128</strong><small>+18% عن أمس</small></article>
              <article className="kpi"><span>طلبات مؤكدة</span><strong>34</strong><small>7,200,000 ر.ي تقريبًا</small></article>
              <article className="kpi warning"><span>مخزون منخفض</span><strong>{lowStock.length}</strong><small>تحتاج متابعة</small></article>
              <article className="kpi alert"><span>سندات للمراجعة</span><strong>{reviews.filter((item) => item.status === "جاهز للمراجعة").length}</strong><small>Human-in-the-loop</small></article>
            </section>

            <section className="grid two">
              <article className="card">
                <div className="card-head"><div><span className="eyebrow">وكيل المتجر</span><h2>جرّب الذكاء الاصطناعي</h2></div><span className="badge">Gemini</span></div>
                <div className="chat-preview">
                  <div className="bubble user">هل عندكم شاي الكبوس؟</div>
                  <div className="bubble bot">{reply}</div>
                </div>
                <div className="composer">
                  <input
                    value={message}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setMessage(event.target.value)}
                    onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter") void testAgent(); }}
                    placeholder="مثال: كم سعر شاي الكبوس؟"
                  />
                  <button onClick={() => void testAgent()} disabled={busy}>{busy ? "جارٍ..." : "إرسال"}</button>
                </div>
              </article>

              <article className="card">
                <div className="card-head"><div><span className="eyebrow">Human-in-the-loop</span><h2>سندات الدفع</h2></div><span className="badge orange">مراجعة بشرية</span></div>
                <div className="review-list">
                  {reviews.map((review) => (
                    <div className="review-row" key={review.id}>
                      <div><strong>{review.customer}</strong><span>{review.orderId} · {review.reference}</span></div>
                      <div className="review-actions">
                        <strong>{formatYER(review.amount)}</strong>
                        <span className={`status ${review.status === "مؤكد" ? "ok" : review.status === "مرفوض" ? "danger" : "pending"}`}>{review.status}</span>
                        {review.status === "جاهز للمراجعة" && (
                          <div className="button-group">
                            <button className="success" disabled={busy} onClick={() => void approvePayment(review)}>تأكيد وخصم</button>
                            <button className="ghost danger-text" disabled={busy} onClick={() => void rejectPayment(review)}>رفض</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="grid two">
              <article className="card">
                <div className="card-head"><div><span className="eyebrow">مخزون</span><h2>تنبيهات النفاد</h2></div></div>
                <div className="product-table">
                  {lowStock.map((product) => (
                    <div className="product-row" key={product.id}>
                      <div><strong>{product.name}</strong><span>{product.category}</span></div>
                      <div className="stock-low">{product.stock} متبقي</div>
                    </div>
                  ))}
                </div>
              </article>
              <article className="card">
                <div className="card-head"><div><span className="eyebrow">المسار</span><h2>كيف تعمل العملية</h2></div></div>
                <ol className="timeline">
                  <li><span>1</span> العميل يسأل عبر واتساب.</li>
                  <li><span>2</span> الوكيل يبحث في الكتالوج والمخزون.</li>
                  <li><span>3</span> الطلب يدخل السلة دون خصم فوري.</li>
                  <li><span>4</span> العميل يرسل سند الدفع.</li>
                  <li><span>5</span> AI يفحص السند، والتاجر يعتمد القرار.</li>
                  <li><span>6</span> عند الاعتماد يُخصم المخزون وتصدر الفاتورة.</li>
                </ol>
              </article>
            </section>
          </>
        )}

        {activeTab === "whatsapp" && (
          <section className="card">
            <div className="card-head"><div><span className="eyebrow">WhatsApp Cloud API</span><h2>محادثات العملاء</h2></div><span className="badge">Webhook جاهز</span></div>
            <div className="conversation-list">
              {[
                ["+967 777 123 456", "أريد كرتون ماء شملان", "منذ دقيقتين"],
                ["+967 733 204 881", "هل عندكم شاي الكبوس؟", "منذ 7 دقائق"],
                ["+967 711 558 230", "أرسلت سند التحويل", "منذ 12 دقيقة"],
              ].map(([phone, text, time]) => (
                <div className="conversation" key={phone}>
                  <div className="avatar">م</div>
                  <div><strong>{phone}</strong><span>{text}</span></div>
                  <small>{time}</small>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "catalog" && (
          <section className="card">
            <div className="card-head"><div><span className="eyebrow">Catalog</span><h2>الكتالوج والمخزون</h2></div><span className="badge">بحث دلالي جاهز للتكامل</span></div>
            <div className="product-table">
              {products.map((product) => (
                <div className="product-row" key={product.id}>
                  <div><strong>{product.name}</strong><span>{product.category}</span></div>
                  <div><strong>{formatYER(product.price)}</strong><span>المخزون: {product.stock}</span></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "payments" && (
          <section className="card">
            <div className="card-head"><div><span className="eyebrow">Payment Review</span><h2>مراجعة سندات الدفع</h2></div><span className="badge orange">قرار التاجر نهائي</span></div>
            <div className="review-list">
              {reviews.map((review) => (
                <div className="review-row" key={review.id}>
                  <div><strong>{review.customer}</strong><span>{review.orderId} · {review.reference}</span></div>
                  <div className="review-actions">
                    <strong>{formatYER(review.amount)}</strong>
                    <span className={`status ${review.status === "مؤكد" ? "ok" : review.status === "مرفوض" ? "danger" : "pending"}`}>{review.status}</span>
                    {review.status === "جاهز للمراجعة" && (
                      <div className="button-group">
                        <button className="success" disabled={busy} onClick={() => void approvePayment(review)}>تأكيد وخصم المخزون</button>
                        <button className="ghost danger-text" disabled={busy} onClick={() => void rejectPayment(review)}>رفض السند</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "automation" && (
          <section className="grid two">
            <article className="card"><span className="eyebrow">الأتمتة</span><h2>السلات المتروكة</h2><p className="muted">التصميم يضع تذكيرًا بعد 30 دقيقة ثم يلغي السلة بعد ساعتين، مع ترك قواعد التواصل قابلة للضبط حسب سياسة WhatsApp وحساب التاجر.</p></article>
            <article className="card"><span className="eyebrow">تكلفة AI</span><h2>Semantic Cache + Rule Engine</h2><p className="muted">الإجابات الثابتة تمر أولًا عبر قواعد محلية، والطلبات المتكررة يمكن تخزينها دلاليًا قبل استدعاء النموذج.</p></article>
          </section>
        )}
      </section>
    </main>
  );
}
