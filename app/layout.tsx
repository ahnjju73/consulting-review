import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoldenGate 수업/상담일지",
  description: "GoldenGate Consulting 수업일지 · 상담일지 관리 시스템",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
