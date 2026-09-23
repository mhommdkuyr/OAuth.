import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "يمن كومرس AI",
  description: "وكيل تجارة وذكاء اصطناعي عبر واتساب للمتاجر اليمنية",
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
