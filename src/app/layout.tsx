import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "命理 - 探索你的命运密码",
  description: "八字排盘、紫微斗数、AI命理师，探索你的命运密码",
  appleWebApp: { capable: true, title: "命理", statusBarStyle: "black" },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#08061a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </head>
      <body className="min-h-full flex flex-col bg-mystic-950 text-white">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
      </body>
    </html>
  );
}
