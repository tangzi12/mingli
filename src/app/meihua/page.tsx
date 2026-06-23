"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { divineByTime, divineByNumber, divineRandom } from "@/engines/meihua";
import { solarToLunar } from "@/engines/lunar";
import { addChart } from "@/lib/store";

type Mode = "time" | "number" | "random";

export default function MeihuaPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("time");
  const [question, setQuestion] = useState("");
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      let result;
      if (mode === "time") {
        const now = new Date();
        const lunar = solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate());
        const hourBranchIdx = Math.floor((now.getHours() + 1) / 2) % 12;
        result = divineByTime(lunar.yearBranchIdx, lunar.month, lunar.day, hourBranchIdx);
      } else if (mode === "number") {
        const n1 = parseInt(num1) || Math.floor(Math.random() * 999) + 1;
        const n2 = parseInt(num2) || Math.floor(Math.random() * 999) + 1;
        result = divineByNumber(n1, n2);
      } else {
        result = divineRandom();
      }
      addChart({ type: "meihua", name: question || "梅花易数", question, result });
      setLoading(false);
      router.push("/result");
    }, 400);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-20">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">🌸</span>
        <h1 className="text-2xl font-black text-mystic-100 font-serif mb-2">梅花易数</h1>
        <p className="text-mystic-500 text-sm">心动则有数，万物皆可占</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 占问 */}
        <div>
          <label className="block text-sm font-medium text-mystic-300 mb-2">你想占问什么？</label>
          <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="例：今日运势 / 这笔投资 / 这段感情..." className="input-mystic" />
        </div>

        {/* 起卦方式 */}
        <div>
          <label className="block text-sm font-medium text-mystic-300 mb-2">起卦方式</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "time", label: "⏰ 时间", desc: "以当下时间起卦" },
              { value: "number", label: "🔢 数字", desc: "报两个数字" },
              { value: "random", label: "🎲 随机", desc: "心诚则灵" },
            ].map(m => (
              <button key={m.value} type="button" onClick={() => setMode(m.value as Mode)}
                className={`py-3 px-2 rounded-xl text-center transition-all ${
                  mode === m.value
                    ? "bg-mystic-600/40 border-2 border-mystic-500 text-mystic-200"
                    : "bg-mystic-900/40 border-2 border-mystic-800/50 text-mystic-500 hover:border-mystic-700"
                }`}>
                <div className="text-sm font-medium">{m.label}</div>
                <div className="text-[10px] mt-1 opacity-80">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 数字输入 */}
        {mode === "number" && (
          <div>
            <label className="block text-sm font-medium text-mystic-300 mb-2">心中默念问题，报两个数字</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={num1} onChange={e => setNum1(e.target.value)} placeholder="第一个数（上卦）" className="input-mystic text-center" />
              <input type="number" value={num2} onChange={e => setNum2(e.target.value)} placeholder="第二个数（下卦）" className="input-mystic text-center" />
            </div>
            <p className="text-xs text-mystic-600 mt-2">留空则随机生成</p>
          </div>
        )}

        {mode === "time" && (
          <div className="card-mystic p-4 text-sm text-mystic-500">
            将以当下的农历年、月、日、时辰起卦。起卦前请静心默想所占之事。
          </div>
        )}

        {mode === "random" && (
          <div className="card-mystic p-4 text-sm text-mystic-500">
            系统随机生成两数起卦。心诚则灵，专注于你的问题。
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-4 mt-6">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">🌸</span>起卦中...</span> : "起卦 ✨"}
        </button>
      </form>

      <div className="mt-8 card-mystic p-4 text-sm text-mystic-500 leading-relaxed">
        <p className="font-semibold text-mystic-400 mb-1">💡 关于梅花易数</p>
        <p>北宋邵雍所创，以先天八卦数起卦，分体用、观生克、断吉凶。本卦看现状，互卦看过程，变卦看结果。占事须心诚、专一。</p>
      </div>
    </div>
  );
}
