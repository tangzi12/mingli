"use client";

export default function BaziResult({ data, lunar }: { data: any; lunar?: any }) {
  const pillars = [
    { label: "年柱", pillar: data.yearPillar, stem: data.stems.year, branch: data.branches.year, god: data.tenGods?.年, element: data.fiveElements?.year, naYin: data.naYin?.year, hidden: data.hiddenStems?.year },
    { label: "月柱", pillar: data.monthPillar, stem: data.stems.month, branch: data.branches.month, god: data.tenGods?.月, element: data.fiveElements?.month, naYin: data.naYin?.month, hidden: data.hiddenStems?.month },
    { label: "日柱", pillar: data.dayPillar, stem: data.stems.day, branch: data.branches.day, god: "日主", element: data.fiveElements?.day, naYin: data.naYin?.day, hidden: data.hiddenStems?.day, isDay: true },
    { label: "时柱", pillar: data.hourPillar, stem: data.stems.hour, branch: data.branches.hour, god: data.tenGods?.时, element: data.fiveElements?.hour, naYin: data.naYin?.hour, hidden: data.hiddenStems?.hour },
  ];

  return (
    <div className="space-y-6">
      <div className="card-mystic p-6 text-center">
        <p className="text-sm text-mystic-500 mb-2">日主</p>
        <p className="text-4xl font-black text-gold-glow font-serif mb-2" style={{ color: "var(--color-gold-400)" }}>
          {data.dayMaster}
        </p>
        <p className="text-mystic-400 text-sm">{data.dayMaster}{data.fiveElements?.day}·{data.yinYang} · {data.dayPillar}</p>
        {lunar && (
          <p className="text-mystic-500 text-xs mt-1">
            农历 {lunar.yearStem}{lunar.yearBranch}年 {lunar.monthName}{lunar.dayName}
            {lunar.isLeap && <span className="text-amber-400 ml-1">(闰月)</span>}
          </p>
        )}
      </div>

      <div className="card-mystic p-6">
        <h3 className="text-sm font-semibold text-mystic-400 mb-4 tracking-wider uppercase text-center">📋 四柱八字</h3>
        <div className="grid grid-cols-4 gap-3">
          {pillars.map((p: any, i: number) => (
            <div key={i} className={`card-mystic p-4 text-center min-w-[80px] flex flex-col items-center gap-1 ${p.isDay ? "ring-1" : ""}`}
              style={p.isDay ? { boxShadow: "0 0 0 1px color-mix(in srgb, var(--color-gold-400) 50%, transparent)" } : {}}>
              <span className="pillar-label">{p.label}</span>
              <span className="pillar-stem" style={p.isDay ? { color: "var(--color-gold-400)" } : {}}>{p.stem}</span>
              <span className="pillar-branch">{p.branch}</span>
              <span className="text-xs text-mystic-600 mt-1">{p.element}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-mystic p-6">
        <h3 className="text-sm font-semibold text-mystic-400 mb-4 tracking-wider uppercase text-center">👤 十神</h3>
        <div className="grid grid-cols-4 gap-3">
          {pillars.map((p: any, i: number) => (
            <div key={i} className="text-center">
              <span className="text-xs text-mystic-600">{p.label}</span>
              <p className="text-sm font-semibold mt-1" style={p.isDay ? { color: "var(--color-gold-400)" } : { color: "var(--color-mystic-300)" }}>{p.god}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-mystic p-6">
          <h3 className="text-sm font-semibold text-mystic-400 mb-4">🎵 纳音五行</h3>
          <div className="space-y-2">
            {pillars.map((p: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-mystic-500">{p.label}</span>
                <span className="text-mystic-300">{p.naYin}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-mystic p-6">
          <h3 className="text-sm font-semibold text-mystic-400 mb-4">🌿 地支藏干</h3>
          <div className="space-y-2">
            {pillars.map((p: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-mystic-500">{p.label} ({p.branch})</span>
                <span className="text-mystic-300">{p.hidden?.join(" · ") || "-"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
