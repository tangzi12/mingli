"use client";

import { useState, useRef, useEffect } from "react";

interface Message { role: "user" | "assistant"; content: string; }

export default function AiChat({ chart }: { chart: any }) {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: genInit(chart) }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]); setLoading(true);
    try {
      const ctx = buildCtx(chart);
      const sys = `你是一位精通八字命理和紫微斗数的AI命理师。以下是用户的命盘信息：\n\n${ctx}\n\n请根据以上命盘信息，用专业但温暖的口吻回答用户的问题。结合具体的干支、十神、星曜进行分析。`;
      const resp = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${(typeof window !== "undefined" && localStorage.getItem("deepseek_key")) || ""}` },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sys }, { role: "user", content: userMsg }], temperature: 0.7, max_tokens: 1000 }),
      });
      if (!resp.ok) throw new Error("API error");
      const d = await resp.json();
      setMessages(prev => [...prev, { role: "assistant", content: d.choices?.[0]?.message?.content || "抱歉，暂时无法回复。" }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: ruleBased(userMsg, chart) }]);
    } finally { setLoading(false); }
  };

  const keyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div className="card-mystic flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-mystic-600/60 text-white" : "bg-mystic-800/60 text-mystic-200"}`}>
              {m.role === "assistant" && <span className="text-xs text-mystic-500 block mb-1">🤖 AI命理师</span>}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-mystic-800/60 rounded-2xl px-4 py-3"><span className="animate-pulse text-mystic-400 text-sm">正在分析命盘...</span></div></div>}
        <div ref={bottomRef} />
      </div>

      {!(typeof window !== "undefined" && localStorage.getItem("deepseek_key")) && (
        <div className="px-4 py-2 bg-mystic-800/40 border-t border-mystic-700/30">
          <p className="text-xs text-mystic-500">
            💡 设置 DeepSeek API Key 可获得更精准的AI解读。
            <button onClick={() => { const key = prompt("请输入 DeepSeek API Key:"); if (key) localStorage.setItem("deepseek_key", key); }} className="text-mystic-400 underline ml-1">点击设置</button>
          </p>
        </div>
      )}

      <div className="p-4 border-t border-mystic-800/50">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={keyDown} placeholder="输入你的问题..." className="input-mystic flex-1" disabled={loading} />
          <button onClick={send} disabled={loading || !input.trim()} className="btn-primary px-5">发送</button>
        </div>
      </div>
    </div>
  );
}

function genInit(chart: any): string {
  if (chart.type === "bazi") {
    const r = chart.result;
    return `你好！我已经排出了你的八字命盘：\n\n🎯 **日主：${r.dayMaster}**（${r.fiveElements?.day}·${r.yinYang}）\n\n📋 **四柱**：\n· 年柱 ${r.yearPillar}（${r.tenGods?.年}）\n· 月柱 ${r.monthPillar}（${r.tenGods?.月}）\n· 日柱 ${r.dayPillar}（日主）\n· 时柱 ${r.hourPillar}（${r.tenGods?.时}）\n\n有什么关于你命盘的问题，尽管问我！`;
  }
  if (chart.type === "meihua") {
    const m = chart.result;
    return `你好！${chart.question ? `针对"${chart.question}"，` : ""}我已为你起卦：\n\n🌸 **本卦：${m.ben.name}**（动爻第${m.dongYao}爻）\n🔄 **变卦：${m.bian.name}**\n⚖️ **体用：${m.relation.type} · ${m.relation.luck}**\n\n${m.relation.desc}\n\n想深入解读这一卦，问我吧！`;
  }
  const z = chart.result.ziwei;
  return `你好！我已经排出了你的紫微斗数命盘：\n\n🌟 **命宫：${z.minggong?.stem}${z.minggong?.branch}**\n🎵 **五行局：${z.bureauElement}${z.bureau}局**\n\n有关于命盘的任何问题，随时问我！`;
}

function buildCtx(chart: any): string {
  if (chart.type === "bazi") {
    const r = chart.result;
    return `八字四柱：\n年柱: ${r.yearPillar} 天干${r.stems?.year} 地支${r.branches?.year} 十神: ${r.tenGods?.年}\n月柱: ${r.monthPillar} 天干${r.stems?.month} 地支${r.branches?.month} 十神: ${r.tenGods?.月}\n日柱: ${r.dayPillar} 天干${r.stems?.day} 地支${r.branches?.day} 日主\n时柱: ${r.hourPillar} 天干${r.stems?.hour} 地支${r.branches?.hour} 十神: ${r.tenGods?.时}\n日主: ${r.dayMaster}(${r.fiveElements?.day}·${r.yinYang})`;
  }
  if (chart.type === "meihua") {
    const m = chart.result;
    return `梅花易数排盘：\n所占之事：${chart.question || "未注明"}\n本卦：${m.ben.name}（${m.ben.upper.name}上${m.ben.lower.name}下），动爻第${m.dongYao}爻\n互卦：${m.hu.name}\n变卦：${m.bian.name}\n体卦：${m.ti.name}(${m.ti.element})，用卦：${m.yong.name}(${m.yong.element})\n体用关系：${m.relation.type}（${m.relation.luck}）— ${m.relation.desc}\n本卦卦辞：${m.benText}\n变卦卦辞：${m.bianText}`;
  }
  const z = chart.result.ziwei;
  return `紫微斗数:\n命宫: ${z.minggong?.stem}${z.minggong?.branch}\n五行局: ${z.bureauElement}${z.bureau}局\n${z.palaces?.map((p: any) => `${p.name}(${p.stem}${p.branch}): ${[...p.majorStars.map((s: any) => typeof s === "string" ? s : s.name), ...(p.minorStars || [])].join("、")}${p.sihuaType ? ` [${p.sihuaType}]` : ""}`).join("\n")}`;
}

function ruleBased(question: string, chart: any): string {
  if (chart.type === "bazi") {
    const r = chart.result;
    if (question.includes("五行") || question.includes("喜用"))
      return `根据您的日主 **${r.dayMaster}${r.fiveElements?.day}${r.yinYang}**，五行喜忌需综合整个八字分析。\n\n四柱为：${r.yearPillar} ${r.monthPillar} ${r.dayPillar} ${r.hourPillar}\n\n⚠️ 设置 DeepSeek API Key 可获得更精准的分析。`;
    return `感谢您的问题。您的日主 **${r.dayMaster}${r.fiveElements?.day}${r.yinYang}**（${r.dayPillar}）。\n\n设置 DeepSeek API Key 后可获得更深入的解答。`;
  }
  if (chart.type === "meihua") {
    const m = chart.result;
    return `本卦 **${m.ben.name}**，体用为 **${m.relation.type}（${m.relation.luck}）**。\n\n${m.relation.desc}\n\n变卦 ${m.bian.name} 提示事情趋向：${m.bianText}\n\n⚠️ 设置 DeepSeek API Key 可获得更详尽的卦象解读。`;
  }
  return `您的命宫在 **${chart.result.ziwei.minggong?.stem}${chart.result.ziwei.minggong?.branch}**。设置 DeepSeek API Key 可获得更精准的解读。`;
}
