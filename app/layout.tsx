import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "يمن كومرس AI | مساعد التجارة عبر واتساب",
  description: "منصة عربية تساعد المتاجر اليمنية على تنظيم المحادثات والكتالوج والطلبات عبر واتساب، مع دليل الاستخدام والخصوصية والأمان.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
