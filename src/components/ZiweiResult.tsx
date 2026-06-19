"use client";

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const PALACE_ORDER = ["命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄", "迁移", "交友", "官禄", "田宅", "福德", "父母"];

const STAR_COLORS: Record<string, string> = {
  "紫微": "text-purple-400", "天府": "text-yellow-400", "天机": "text-green-400", "太阳": "text-orange-400",
  "武曲": "text-amber-400", "天同": "text-teal-400", "廉贞": "text-red-400", "太阴": "text-cyan-400",
  "贪狼": "text-lime-400", "巨门": "text-indigo-400", "天相": "text-rose-400", "天梁": "text-emerald-400",
  "七杀": "text-pink-400", "破军": "text-sky-400",
};
const SIHUA_COLORS: Record<string, string> = { "化禄": "text-green-400", "化权": "text-purple-400", "化科": "text-cyan-400", "化忌": "text-red-500" };

const gridOrder: (number | null)[] = [4, 5, 6, 7, 3, null, 8, 2, null, 9, 1, 0, 11, 10];

export default function ZiweiResult({ data }: { data: any }) {
  const { bazi, ziwei } = data;
  const palaces = ziwei?.palaces || [];

  return (
    <div className="space-y-6">
      <div className="card-mystic p-6 text-center">
        <p className="text-sm text-mystic-500 mb-2">
          {STEMS[bazi?.yearStemIndex]}{BRANCHES[bazi?.yearBranchIndex]}年 · 五行{ziwei?.bureauElement}{ziwei?.bureau}局 · 命宫在{ziwei?.minggong?.branch}
        </p>
        <p className="text-2xl font-black text-mystic-200 font-serif">命宫：{ziwei?.minggong?.stem}{ziwei?.minggong?.branch}</p>
      </div>

      <div className="card-mystic p-4">
        <h3 className="text-sm font-semibold text-mystic-400 mb-4 tracking-wider uppercase text-center">⭐ 十二宫命盘</h3>
        <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
          {gridOrder.map((branchIdx, i) => {
            if (branchIdx === null) return <div key={`empty-${i}`} className="aspect-square flex items-center justify-center"><span className="text-3xl">☯️</span></div>;
            const palace = palaces.find((p: any) => p.branchIdx === branchIdx);
            if (!palace) return <div key={i} />;
            const isMing = palace.name === "命宫";
            return (
              <div key={i} className={`rounded-xl p-2 text-center border transition-all ${isMing ? "border-gold-400/60 bg-gold-400/5" : "border-mystic-800/50 bg-mystic-900/30"}`}>
                <p className={`text-[10px] font-bold mb-1 ${isMing ? "text-gold-400" : "text-mystic-500"}`}>{palace.name}</p>
                <p className="text-xs text-mystic-600 mb-1">{palace.stem}{palace.branch}</p>
                <div className="space-y-0.5">
                  {palace.majorStars.map((star: any, si: number) => {
                    const starName = typeof star === "string" ? star : star.name;
                    const sColor = STAR_COLORS[starName] || "text-mystic-300";
                    const brightness = typeof star === "string" ? "" : star.brightness;
                    return (
                      <p key={si} className={`text-xs font-semibold ${sColor} leading-tight`}>
                        {starName}
                        {brightness && <span className={`ml-0.5 text-[9px] ${brightness === "庙" ? "text-green-400" : brightness === "旺" ? "text-emerald-400" : brightness === "陷" ? "text-red-400" : "text-mystic-500"}`}>[{brightness}]</span>}
                      </p>
                    );
                  })}
                </div>
                {palace.minorStars?.length > 0 && (
                  <div className="mt-1 pt-1 border-t border-mystic-800/30">
                    {palace.minorStars.map((star: string, si: number) => <p key={si} className="text-[9px] text-mystic-500 leading-tight">{star}</p>)}
                  </div>
                )}
                {palace.sihuaType && <p className={`text-[10px] font-bold mt-1 ${SIHUA_COLORS[palace.sihuaType] || "text-mystic-400"}`}>{palace.sihuaType}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-mystic p-6">
        <h3 className="text-sm font-semibold text-mystic-400 mb-4 tracking-wider uppercase text-center">📋 十二宫详情</h3>
        <div className="space-y-3">
          {PALACE_ORDER.map(name => {
            const palace = palaces.find((p: any) => p.name === name);
            if (!palace) return null;
            return (
              <div key={name} className="flex items-start gap-3 py-2 border-b border-mystic-800/30 last:border-0">
                <div className="w-16 shrink-0">
                  <p className={`text-sm font-bold ${name === "命宫" ? "text-gold-400" : "text-mystic-300"}`}>{name}</p>
                  <p className="text-xs text-mystic-600">{palace.stem}{palace.branch}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1">
                    {palace.majorStars.map((star: any, si: number) => {
                      const starName = typeof star === "string" ? star : star.name;
                      return <span key={si} className={`text-xs px-1.5 py-0.5 rounded bg-mystic-800/40 ${STAR_COLORS[starName] || "text-mystic-300"}`}>{starName}</span>;
                    })}
                    {palace.minorStars?.map((star: string, si: number) => <span key={`m-${si}`} className="text-xs px-1.5 py-0.5 rounded bg-mystic-800/20 text-mystic-500">{star}</span>)}
                  </div>
                  {palace.sihuaType && <p className={`text-xs mt-1 ${SIHUA_COLORS[palace.sihuaType]}`}>{palace.sihuaType}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
