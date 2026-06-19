"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCharts } from "@/lib/store";

export default function HomePage() {
  const [recentChart, setRecentChart] = useState<ReturnType<typeof getCharts>[0] | null>(null);

  useEffect(() => {
    const charts = getCharts();
    setRecentChart(charts[0] || null);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 pb-20">
      <section className="text-center py-16 md:py-24">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-mystic-800/60 border border-mystic-600/30 mb-6">
          <span className="text-4xl">☯️</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-mystic-100 font-serif mb-4 tracking-tight">
          探索你的<span className="text-glow text-mystic-300">命运密码</span>
        </h1>
        <p className="text-mystic-400 text-lg md:text-xl max-w-lg mx-auto mb-10 leading-relaxed">
          八字排盘 · 紫微斗数 · AI命理师<br />
          <span className="text-sm text-mystic-500">千年命理智慧，为你揭示人生轨迹</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/bazi" className="btn-primary text-center text-lg px-10 py-4 inline-block">
            🔮 八字排盘
          </Link>
          <Link href="/ziwei" className="btn-ghost text-center text-lg px-10 py-4 inline-block">
            ⭐ 紫微斗数
          </Link>
        </div>
      </section>

      {recentChart && (
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-mystic-300 mb-4">📋 最近排盘</h2>
          <Link href="/result" className="card-mystic p-5 flex items-center justify-between hover:border-mystic-500/50 transition-colors block">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{(recentChart as any).type === "bazi" ? "🔮" : "⭐"}</span>
              <div>
                <p className="text-mystic-200 font-semibold">{(recentChart as any).name || "未命名"}</p>
                <p className="text-mystic-500 text-sm">
                  {(recentChart as any).type === "bazi" ? "八字" : "紫微"} ·{" "}
                  {new Date((recentChart as any).createdAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
            </div>
            <span className="text-mystic-500 text-sm">查看 →</span>
          </Link>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-mystic-300 mb-4">✨ 核心功能</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: "🔮", title: "八字排盘", desc: "精准四柱八字，十神、大运、流年全解", href: "/bazi" },
            { icon: "⭐", title: "紫微斗数", desc: "十二宫位、十四主星、四化飞星", href: "/ziwei" },
            { icon: "🤖", title: "AI命理师", desc: "智能解读命盘，解答你的人生疑问", href: "/ai" },
            { icon: "💬", title: "命理社区", desc: "分享命盘，和同好交流探讨", href: "/community" },
            { icon: "📊", title: "排盘历史", desc: "保存所有排盘记录，随时回顾", href: "/profile" },
            { icon: "📱", title: "随时随地", desc: "支持PWA安装，像原生App一样使用" },
          ].map(item =>
            "href" in item ? (
              <Link key={item.title} href={item.href!} className="card-mystic p-5 hover:border-mystic-500/50 hover:bg-mystic-800/40 transition-all group">
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="text-mystic-200 font-semibold mb-1 group-hover:text-mystic-100">{item.title}</h3>
                <p className="text-mystic-500 text-sm">{item.desc}</p>
              </Link>
            ) : (
              <div key={item.title} className="card-mystic p-5 opacity-70">
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="text-mystic-200 font-semibold mb-1">{item.title}</h3>
                <p className="text-mystic-500 text-sm">{item.desc}</p>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}
