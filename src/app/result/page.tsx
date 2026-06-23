"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCharts } from "@/lib/store";
import BaziResult from "@/components/BaziResult";
import ZiweiResult from "@/components/ZiweiResult";
import MeihuaResult from "@/components/MeihuaResult";
import AiChat from "@/components/AiChat";

export default function ResultPage() {
  const router = useRouter();
  const [chart, setChart] = useState<ReturnType<typeof getCharts>[0] | null>(null);
  const [tab, setTab] = useState("chart");

  useEffect(() => {
    const charts = getCharts();
    if (!charts.length) { router.push("/"); return; }
    setChart(charts[0]);
    setTab("chart");
  }, [router]);

  if (!chart) return null;

  const type = (chart as any).type;
  const chartLabel = type === "bazi" ? "🔮 八字命盘" : type === "ziwei" ? "⭐ 紫微命盘" : "🌸 梅花卦象";
  const tabs = [
    { id: "chart", label: chartLabel },
    ...(type === "meihua" ? [] : [{ id: "luck", label: "📅 大运流年" }]),
    { id: "ai", label: "🤖 AI解读" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-20">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="text-mystic-400 hover:text-mystic-200 transition-colors text-sm flex items-center gap-1">
          ← 返回
        </button>
        <h1 className="text-xl font-black text-mystic-100 font-serif">{(chart as any).name || "命盘"}</h1>
        <div className="w-16" />
      </div>

      <div className="flex border-b border-mystic-800/50 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-medium transition-all ${tab === t.id ? "tab-active" : "tab-inactive"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "chart" && type === "bazi" && <BaziResult data={(chart as any).result} lunar={(chart as any).lunar} />}
      {tab === "chart" && type === "ziwei" && <ZiweiResult data={(chart as any).result} />}
      {tab === "chart" && type === "meihua" && <MeihuaResult data={(chart as any).result} question={(chart as any).question} />}
      {tab === "luck" && <LuckPillarsView data={(chart as any).result} type={type} />}
      {tab === "ai" && <AiChat chart={chart as any} />}
    </div>
  );
}

function LuckPillarsView({ data, type }: { data: any; type: string }) {
  if (type === "bazi") {
    return (
      <div className="space-y-6">
        <div className="card-mystic p-6">
          <h3 className="text-lg font-bold text-mystic-200 mb-4">📅 大运排盘</h3>
          <p className="text-sm text-mystic-500 mb-4">
            日主：<span className="text-mystic-300 font-bold">{data.dayMaster}</span> · 元男/元女每十年一换运
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {data.luckPillars?.map((lp: any, i: number) => (
              <div key={i} className="card-mystic p-4 text-center min-w-[80px] flex flex-col items-center gap-1">
                <span className="pillar-label">{lp.age}岁起</span>
                <span className="pillar-stem text-lg">{lp.stem}</span>
                <span className="pillar-branch text-base">{lp.branch}</span>
                <span className="text-xs text-mystic-600">{lp.age}-{lp.age + 9}岁</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-mystic p-6">
          <h3 className="text-lg font-bold text-mystic-200 mb-4">🔄 当前流年</h3>
          <div className="flex items-center gap-4">
            <div className="card-mystic p-4 text-center min-w-[80px] flex flex-col items-center gap-1">
              <span className="pillar-label">流年</span>
              <span className="pillar-stem text-2xl">{data.currentYearPillar}</span>
              <span className="text-xs text-mystic-500">{new Date().getFullYear()}年</span>
            </div>
            <p className="text-mystic-500 text-sm">每年立春后更换流年干支。结合大运和原局分析当年运势。</p>
          </div>
        </div>
      </div>
    );
  }
  return <div className="card-mystic p-6 text-center text-mystic-400"><p>紫微斗数大运（大限）功能开发中...</p></div>;
}
