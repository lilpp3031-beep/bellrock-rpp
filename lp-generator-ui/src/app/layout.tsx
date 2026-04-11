import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LP Generator | Amazon ASIN から自動 LP 生成",
  description: "Amazon や Alibaba の商品ページから自動で LP を生成",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
