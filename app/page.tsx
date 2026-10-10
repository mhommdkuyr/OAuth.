import Link from "next/link";

const features = [
  { icon: "✦", title: "مساعد ذكي عبر واتساب", text: "يرد على الأسئلة المتكررة، يفهم طلبات العملاء بالعربية، ويساعدهم في الوصول إلى المنتجات المناسبة." },
  { icon: "▦", title: "كتالوج ومخزون منظم", text: "اعرض المنتجات والأسعار والكميات من مصدر واحد، مع تصميم قابل للتوسع حسب احتياجات المتجر." },
  { icon: "⌁", title: "طلبات أوضح وأسرع", text: "حوّل المحادثة إلى طلب منظم للمراجعة، مع إظهار التفاصيل قبل اعتماد أي إجراء مؤثر." },
  { icon: "✓", title: "مراجعة بشرية للعمليات الحساسة", text: "تظل الموافقة على الدفع والطلبات والإجراءات التي تؤثر في المخزون بيد التاجر وفق إعدادات النظام." },
  { icon: "▤", title: "لوحة متابعة للتاجر", text: "تابع المحادثات والمنتجات والطلبات وحالات المراجعة من واجهة عربية مناسبة للهاتف والكمبيوتر." },
  { icon: "◈", title: "مصمم لواقع التجارة اليمنية", text: "يراعي احتياجات المتاجر المحلية، والاتصال المتفاوت، وإمكانية التوسع لاحقًا نحو مزودي الدفع المحليين." },
];

const steps = [
  ["01", "جهّز نشاطك", "أنشئ ملف متجرك وأضف بيانات النشاط والمنتجات والأسعار وسياسة التوصيل والاستبدال."],
  ["02", "اربط واتساب للأعمال", "جهّز حساب Meta Business وWhatsApp Business Platform، ثم أضف بيانات الربط السرية في إعدادات الخادم."],
  ["03", "اختبر قبل الإطلاق", "تحقق من استقبال الرسائل والرد عليها، وصحة الكتالوج، وصلاحيات الموظفين، وسيناريوهات الطلب والدفع."],
  ["04", "راقب وراجع", "تابع المحادثات والطلبات، وراجع الحالات التي تتطلب قرارًا بشريًا قبل تأكيدها."],
];

export default function Home() {
  return (
    <main className="marketing" dir="rtl">
      <header className="site-header">
        <Link href="/" className="site-brand"><span className="brand-symbol">ي</span><span><strong>يمن كومرس AI</strong><small>تجارة أذكى عبر واتساب</small></span></Link>
        <nav className="site-nav" aria-label="التنقل الرئيسي">
          <a href="#features">المزايا</a><a href="#how-it-works">كيف يعمل</a><a href="#security">الأمان</a><Link href="/guide">دليل الربط</Link>
        </nav>
        <Link className="button button-primary header-cta" href="/dashboard">لوحة التاجر <span>←</span></Link>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow-pill"><span className="pulse-dot" /> مساعد تجارة إلكترونية للمتاجر اليمنية</div>
          <h1>حوّل محادثات واتساب<br /><em>إلى تجربة تسوّق منظمة.</em></h1>
          <p className="hero-lead">مساعد ذكي يساعد متجرك على عرض المنتجات، والإجابة عن استفسارات العملاء، وتنظيم الطلبات — مع بقاء القرارات الحساسة تحت إشرافك.</p>
          <div className="hero-actions"><Link className="button button-primary" href="/guide">ابدأ دليل الإعداد <span>←</span></Link><a className="button button-secondary" href="#how-it-works">اكتشف طريقة العمل</a></div>
          <div className="trust-line"><span>✓</span> واجهة عربية من اليمين إلى اليسار <span>✓</span> مراجعة بشرية للعمليات الحساسة</div>
        </div>
        <div className="hero-visual" aria-label="تصور توضيحي لمحادثة متجر">
          <div className="visual-glow" />
          <div className="chat-window">
            <div className="chat-top"><div className="chat-avatar">ي</div><div><strong>متجر اليمن · المساعد الذكي</strong><small><span className="pulse-dot" /> جاهز لمساعدة العملاء</small></div><span className="chat-menu">•••</span></div>
            <div className="chat-body">
              <div className="chat-date">اليوم</div>
              <div className="chat-bubble customer-bubble">السلام عليكم، هل عندكم قهوة؟ وكم السعر؟</div>
              <div className="chat-bubble assistant-bubble">وعليكم السلام! أهلاً بك 👋<br />هذه المنتجات المتاحة في كتالوج المتجر:</div>
              <div className="product-mini"><div className="product-art coffee-art">☕</div><div className="product-info"><strong>قهوة عربية</strong><small>متوفر حسب المخزون المسجل</small><b>السعر يحدده المتجر</b></div></div>
              <div className="chat-bubble customer-bubble">أريد طلب كيسين.</div>
              <div className="order-note"><span>▣</span><div><strong>طلب مقترح للمراجعة</strong><small>الكمية والتفاصيل تُراجع قبل التأكيد</small></div><span className="mini-status">مراجعة</span></div>
              <div className="chat-input">اكتب رسالة... <span>＋　➤</span></div>
            </div>
          </div>
          <div className="floating-card floating-secure"><span className="float-icon">✓</span><div><strong>تحكّم بقراراتك</strong><small>الموافقة قبل الإجراء الحساس</small></div></div>
          <div className="floating-card floating-catalog"><span className="float-icon amber">▦</span><div><strong>كتالوج موحّد</strong><small>منتجات وأسعار ومخزون</small></div></div>
        </div>
      </section>

      <section className="metrics-strip" aria-label="مبادئ المنصة">
        <div><span className="metric-icon">◉</span><strong>واتساب أولاً</strong><small>في قناة يتواصل العملاء عبرها</small></div>
        <div><span className="metric-icon">⌘</span><strong>ذكاء مساعد</strong><small>لا بديل عن قرار التاجر</small></div>
        <div><span className="metric-icon">▤</span><strong>إدارة منظمة</strong><small>منتجات ومحادثات وطلبات</small></div>
        <div><span className="metric-icon">◇</span><strong>خصوصية وأمان</strong><small>تقليل البيانات وصلاحيات محددة</small></div>
      </section>

      <section className="section-wrap" id="features">
        <div className="section-heading"><span className="eyebrow">ما الذي يقدمه يمن كومرس AI؟</span><h2>أدوات عملية لتنظيم البيع،<br /><em>لا مجرد روبوت محادثة.</em></h2><p>تجمع المنصة بين قناة تواصل مألوفة وبيانات المتجر وسير عمل يساعد على تقليل الفوضى والأخطاء.</p></div>
        <div className="feature-grid">{features.map((feature) => <article className="feature-card" key={feature.title}><span className="feature-icon">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div>
      </section>

      <section className="workflow-section" id="how-it-works">
        <div className="workflow-inner"><div className="section-heading align-right"><span className="eyebrow">من الرسالة إلى الطلب</span><h2>سير عمل واضح،<br /><em>والقرار النهائي للتاجر.</em></h2><p>يُفترض أن تمر العمليات التجارية بخطوات قابلة للتتبع بدل تنفيذها بناءً على تخمين النموذج وحده.</p><Link className="text-link" href="/guide">اقرأ دليل الاستخدام والربط ←</Link></div>
          <div className="steps-list">{steps.map(([number, title, text]) => <article className="step-row" key={number}><span className="step-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        </div>
      </section>

      <section className="security-section" id="security"><div className="security-copy"><span className="eyebrow">الأمان جزء من التصميم</span><h2>بياناتك التجارية<br /><em>ليست مادة للتجربة.</em></h2><p>نهدف إلى تقليل البيانات التي تُجمع، وحماية مفاتيح التكامل، وفصل بيانات المتاجر، وتسجيل العمليات المهمة. مستوى الحماية الفعلي يعتمد على اكتمال الإعدادات والاختبارات قبل الإطلاق التجاري.</p><Link className="text-link" href="/security">اقرأ ضوابط الأمان ←</Link></div><div className="security-list"><div><span>01</span><section><strong>حماية مفاتيح الربط</strong><p>تُخزن رموز WhatsApp ومفاتيح الذكاء الاصطناعي في إعدادات الخادم، لا في الواجهة العامة أو مستودع الكود.</p></section></div><div><span>02</span><section><strong>التحقق من أحداث WhatsApp</strong><p>التحقق من توقيع Webhook ومنع تكرار الأحداث جزء أساسي من التكامل الآمن.</p></section></div><div><span>03</span><section><strong>صلاحيات وفصل بيانات المتاجر</strong><p>يجب اختبار المصادقة وسياسات الوصول لكل متجر قبل استخدام بيانات حقيقية.</p></section></div><div><span>04</span><section><strong>مراجعة الدفع والمخزون</strong><p>لا ينبغي اعتبار صورة سند الدفع أو رد الذكاء الاصطناعي وحده دليلاً نهائياً على استلام المال.</p></section></div></div></section>

      <section className="cta-section"><div><span className="eyebrow">ابدأ بطريقة صحيحة</span><h2>جهّز متجرك خطوة بخطوة.</h2><p>راجع المتطلبات، ثم اختبر الربط والطلبات والأمان قبل استقبال العملاء.</p></div><Link href="/guide" className="button button-dark">افتح دليل الإعداد <span>←</span></Link></section>

      <footer className="site-footer"><div className="footer-top"><Link href="/" className="site-brand"><span className="brand-symbol">ي</span><span><strong>يمن كومرس AI</strong><small>مساعد التجارة عبر واتساب</small></span></Link><p>أدوات مساعدة للتجار لتنظيم التواصل والبيع الإلكتروني.</p></div><div className="footer-links"><Link href="/guide">دليل الاستخدام والربط</Link><Link href="/privacy">سياسة الخصوصية</Link><Link href="/terms">الشروط والأحكام</Link><Link href="/security">الأمان</Link><a href="https://github.com/mhommdkuyr/OAuth.">المستودع التقني</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} يمن كومرس AI</span><span>يجب مراجعة النصوص القانونية واعتمادها وفق جهة التشغيل والقوانين المنطبقة قبل الإطلاق التجاري.</span></div></footer>
    </main>
  );
}
