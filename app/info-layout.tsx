import Link from "next/link";
import "./marketing.css";

type Props = { eyebrow: string; title: string; description: string; children: React.ReactNode };

export default function InfoLayout({ eyebrow, title, description, children }: Props) {
  return <main className="info-page" dir="rtl">
    <header className="info-header">
      <Link href="/" className="site-brand"><span className="brand-symbol">ي</span><span><strong>يمن كومرس AI</strong><small>مساعد التجارة عبر واتساب</small></span></Link>
      <Link href="/" className="button button-secondary">العودة إلى الرئيسية ←</Link>
    </header>
    <div className="info-main">
      <section className="info-hero"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></section>
      <article className="info-content">{children}</article>
    </div>
    <footer className="info-footer"><Link href="/guide">دليل الاستخدام والربط</Link><Link href="/privacy">سياسة الخصوصية</Link><Link href="/terms">الشروط والأحكام</Link><Link href="/security">الأمان</Link><Link href="/">الرئيسية</Link></footer>
  </main>;
}
