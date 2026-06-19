"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calculateBazi } from "@/engines/bazi";
import { calculateZiwei } from "@/engines/ziwei";
import { solarToLunar } from "@/engines/lunar";
import { addChart } from "@/lib/store";

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const b = branches[Math.floor((i + 1) / 2) % 12];
  return { value: i, label: `${String(i).padStart(2, "0")}:00 ${b}时` };
});

export default function ZiweiPage() {
  const router = useRouter();
  const today = new Date();
  const [form, setForm] = useState({
    name: "",
    gender: "male",
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
    hour: today.getHours(),
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const bazi = calculateBazi(form.year, form.month, form.day, form.hour);
      const lunar = solarToLunar(form.year, form.month, form.day);
      const yearStemIdx = bazi.yearStemIndex;
      const yearBranchIdx = ((form.year - 4) % 12 + 12) % 12;
      const hourBranchIdx = Math.floor((form.hour + 1) / 2) % 12;
      // Use actual lunar month & day for Zi Wei calculation
      const ziwei = calculateZiwei(yearStemIdx, yearBranchIdx, lunar.month, lunar.day, hourBranchIdx, form.gender);

      addChart({ type: "ziwei", name: form.name || "未命名", gender: form.gender, input: { ...form }, result: { bazi, ziwei, lunar } });
      setLoading(false);
      router.push("/result");
    }, 300);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-20">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">⭐</span>
        <h1 className="text-2xl font-black text-mystic-100 font-serif mb-2">紫微斗数</h1>
        <p className="text-mystic-500 text-sm">输入出生时间，展开你的十二命宫</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-mystic-300 mb-2">姓名（可选）</label>
          <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="输入姓名" className="input-mystic" />
        </div>

        <div>
          <label className="block text-sm font-medium text-mystic-300 mb-2">性别</label>
          <div className="flex gap-3">
            {[{ value: "male", label: "♂ 男" }, { value: "female", label: "♀ 女" }].map(g => (
              <button key={g.value} type="button" onClick={() => setForm(p => ({ ...p, gender: g.value }))}
                className={`flex-1 py-3 rounded-xl text-center font-medium transition-all ${
                  form.gender === g.value
                    ? "bg-mystic-600/40 border-2 border-mystic-500 text-mystic-200"
                    : "bg-mystic-900/40 border-2 border-mystic-800/50 text-mystic-500 hover:border-mystic-700"
                }`}>{g.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-mystic-300 mb-2">出生日期（公历）</label>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: +e.target.value }))} min={1900} max={2100} placeholder="年" className="input-mystic text-center" />
            <input type="number" value={form.month} onChange={e => setForm(p => ({ ...p, month: +e.target.value }))} min={1} max={12} placeholder="月" className="input-mystic text-center" />
            <input type="number" value={form.day} onChange={e => setForm(p => ({ ...p, day: +e.target.value }))} min={1} max={31} placeholder="日" className="input-mystic text-center" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-mystic-300 mb-2">出生时间</label>
          <select value={form.hour} onChange={e => setForm(p => ({ ...p, hour: +e.target.value }))} className="input-mystic appearance-none cursor-pointer">
            {HOURS.map(h => <option key={h.value} value={h.value} className="bg-mystic-900 text-white">{h.label}</option>)}
          </select>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-4 mt-6">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span>排盘中...</span> : "开始排盘 ✨"}
        </button>
      </form>
    </div>
  );
}
