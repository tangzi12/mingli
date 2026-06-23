"use client";

const YAO_FULL = "▬▬▬▬▬▬▬";
const YAO_BROKEN = "▬▬▬　▬▬▬";

function Hexagram({ lines, dongYao }: { lines: number[]; dongYao?: number }) {
  // lines 自下而上，显示时自上而下
  return (
    <div className="flex flex-col gap-1 items-center font-mono">
      {[...lines].reverse().map((line, i) => {
        const yaoIndex = lines.length - i; // 1-6 自下而上
        const isDong = yaoIndex === dongYao;
        return (
          <div key={i} className={`text-lg leading-none tracking-tight ${isDong ? "text-gold-400" : "text-mystic-300"}`}>
            {line === 1 ? "━━━━━" : "━━ ━━"}
            {isDong && <span className="text-gold-400 text-xs ml-1">○动</span>}
          </div>
        );
      })}
    </div>
  );
}

function GuaCard({ title, gua, highlight, dongYao }: { title: string; gua: any; highlight?: boolean; dongYao?: number }) {
  return (
    <div className={`card-mystic p-4 text-center ${highlight ? "ring-1" : ""}`}
      style={highlight ? { boxShadow: "0 0 0 1px color-mix(in srgb, var(--color-gold-400) 50%, transparent)" } : {}}>
      <p className="text-xs text-mystic-500 mb-2">{title}</p>
      <p className="text-2xl mb-1">{gua.upper?.symbol}{gua.lower?.symbol}</p>
      <p className={`font-bold font-serif ${highlight ? "text-gold-400" : "text-mystic-200"}`}>{gua.name}</p>
      {gua.upper && gua.lower && (
        <p className="text-xs text-mystic-500 mt-1">{gua.upper.nature}{gua.upper.name} / {gua.lower.nature}{gua.lower.name}</p>
      )}
      {gua.lines && (
        <div className="mt-3">
          <Hexagram lines={gua.lines} dongYao={dongYao} />
        </div>
      )}
    </div>
  );
}

export default function MeihuaResult({ data, question }: { data: any; question?: string }) {
  const luckColor: Record<string, string> = {
    大吉: "text-green-400", 吉: "text-emerald-400", 小吉: "text-teal-400",
    平: "text-mystic-300", 小凶: "text-orange-400", 凶: "text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* 占问 */}
      {question && (
        <div className="card-mystic p-5 text-center">
          <p className="text-xs text-mystic-500 mb-1">所占之事</p>
          <p className="text-mystic-200 font-medium">{question}</p>
        </div>
      )}

      {/* 体用断语 */}
      <div className="card-mystic p-6 text-center">
        <p className="text-xs text-mystic-500 mb-2">体用关系 · 吉凶</p>
        <p className="text-3xl font-black font-serif mb-2">
          <span className={luckColor[data.relation.luck] || "text-mystic-300"}>{data.relation.luck}</span>
        </p>
        <p className="text-sm text-mystic-300 mb-1">{data.relation.type}</p>
        <p className="text-sm text-mystic-400 leading-relaxed">{data.relation.desc}</p>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div>
            <span className="text-mystic-500">体卦 </span>
            <span className="text-mystic-200 font-bold">{data.ti.name}</span>
            <span className="text-mystic-500"> ({data.ti.element})</span>
          </div>
          <div>
            <span className="text-mystic-500">用卦 </span>
            <span className="text-gold-400 font-bold">{data.yong.name}</span>
            <span className="text-mystic-500"> ({data.yong.element})</span>
          </div>
        </div>
      </div>

      {/* 三卦 */}
      <div>
        <h3 className="text-sm font-semibold text-mystic-400 mb-4 tracking-wider uppercase text-center">📜 本卦 · 互卦 · 变卦</h3>
        <div className="grid grid-cols-3 gap-3">
          <GuaCard title="本卦（现状）" gua={data.ben} highlight dongYao={data.dongYao} />
          <GuaCard title="互卦（过程）" gua={data.hu} />
          <GuaCard title="变卦（结果）" gua={data.bian} dongYao={data.dongYao} />
        </div>
      </div>

      {/* 卦辞 */}
      <div className="card-mystic p-6">
        <h3 className="text-sm font-semibold text-mystic-400 mb-3">🔮 本卦卦辞 · {data.ben.name}</h3>
        <p className="text-mystic-300 text-sm leading-relaxed mb-4">{data.benText}</p>
        <div className="border-t border-mystic-800/40 pt-4">
          <h3 className="text-sm font-semibold text-mystic-400 mb-3">🔄 变卦卦辞 · {data.bian.name}（事情发展趋向）</h3>
          <p className="text-mystic-300 text-sm leading-relaxed">{data.bianText}</p>
        </div>
      </div>

      {/* 起卦信息 */}
      <div className="card-mystic p-4 text-xs text-mystic-500 text-center">
        起卦方式：
        {data.method === "time" && `时间起卦（${data.meta.yearBranch}年 ${data.meta.lunarMonth}月 ${data.meta.lunarDay}日 ${data.meta.hourBranch}时）`}
        {data.method === "number" && `数字起卦（${data.meta.num1}、${data.meta.num2}）`}
        {data.method === "random" && "随机起卦"}
        {" · 动爻第"}{data.dongYao}{"爻"}
      </div>
    </div>
  );
}
