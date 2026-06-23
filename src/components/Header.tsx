"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser } from "@/lib/store";

const NAV = [
  { path: "/", label: "首页", icon: "🏠" },
  { path: "/bazi", label: "八字", icon: "🔮" },
  { path: "/ziwei", label: "紫微", icon: "⭐" },
  { path: "/meihua", label: "梅花", icon: "🌸" },
  { path: "/community", label: "社区", icon: "💬" },
  { path: "/profile", label: "我的", icon: "👤" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = getUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-mystic-950/90 backdrop-blur-md border-b border-mystic-800/50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl">☯️</span>
          <span className="text-lg font-bold text-mystic-200 font-serif tracking-wide group-hover:text-mystic-100 transition-colors">
            命理
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(item => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === item.path
                  ? "bg-mystic-800/60 text-mystic-200"
                  : "text-mystic-400 hover:text-mystic-200 hover:bg-mystic-800/30"
              }`}
            >
              <span className="mr-1.5">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <button className="md:hidden text-mystic-300 p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden bg-mystic-950/95 backdrop-blur-md border-b border-mystic-800/50 px-4 pb-4">
          {NAV.map(item => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                pathname === item.path
                  ? "bg-mystic-800/60 text-mystic-200"
                  : "text-mystic-400 hover:text-mystic-200"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
