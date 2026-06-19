"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUser, setUser, logout, getCharts, removeChart, subscribe } from "@/lib/store";

export default function ProfilePage() {
  const [user, setU] = useState(getUser());
  const [charts, setCharts] = useState(getCharts());
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  useEffect(() => subscribe(() => {
    setU(getUser());
    setCharts([...getCharts()]);
  }), []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ username: loginForm.username || "命理爱好者", joinedAt: new Date().toISOString() });
    setShowLogin(false);
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 pb-20">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">👤</span>
          <h1 className="text-2xl font-black text-mystic-100 font-serif mb-2">个人中心</h1>
        </div>
        {!showLogin ? (
          <div className="card-mystic p-8 text-center">
            <p className="text-mystic-400 mb-6">登录以保存你的排盘记录</p>
            <button onClick={() => setShowLogin(true)} className="btn-primary w-full">登录 / 注册</button>
          </div>
        ) : (
          <div className="card-mystic p-6">
            <h2 className="text-lg font-bold text-mystic-200 mb-4 text-center">登录</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="text" value={loginForm.username} onChange={e => setLoginForm(p => ({ ...p, username: e.target.value }))} placeholder="用户名" className="input-mystic" />
              <input type="password" value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} placeholder="密码" className="input-mystic" />
              <button type="submit" className="btn-primary w-full">登录</button>
              <button type="button" onClick={() => setShowLogin(false)} className="text-sm text-mystic-500 hover:text-mystic-400 w-full text-center">返回</button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-20">
      <div className="card-mystic p-6 mb-6 text-center">
        <div className="w-16 h-16 rounded-full bg-mystic-700 flex items-center justify-center text-2xl mx-auto mb-3">👤</div>
        <p className="text-lg font-bold text-mystic-200">{(user as any).username}</p>
        <p className="text-xs text-mystic-500 mt-1">加入于 {new Date((user as any).joinedAt).toLocaleDateString("zh-CN")}</p>
        <button onClick={logout} className="text-xs text-mystic-500 hover:text-mystic-400 mt-3 underline">退出登录</button>
      </div>

      <div>
        <h2 className="text-lg font-bold text-mystic-200 mb-4">📋 排盘历史</h2>
        {charts.length === 0 ? (
          <div className="card-mystic p-8 text-center text-mystic-500">
            <p className="text-3xl mb-2">🔮</p><p>还没有排盘记录</p>
            <Link href="/bazi" className="text-mystic-400 underline text-sm mt-2 inline-block">开始排盘 →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(charts as any[]).map((chart: any) => (
              <div key={chart.id} className="card-mystic p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{chart.type === "bazi" ? "🔮" : "⭐"}</span>
                  <div>
                    <p className="text-sm font-medium text-mystic-300">{chart.name}</p>
                    <p className="text-xs text-mystic-500">
                      {chart.type === "bazi" ? "八字" : "紫微"} · {chart.input?.year}-{chart.input?.month}-{chart.input?.day}
                    </p>
                  </div>
                </div>
                <button onClick={() => removeChart(chart.id)} className="text-xs text-red-400/50 hover:text-red-400">删除</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-mystic p-4 mt-6">
        <h3 className="text-sm font-semibold text-mystic-300 mb-2">🔑 API 设置</h3>
        <p className="text-xs text-mystic-500 mb-3">设置 DeepSeek API Key 以启用AI命理师功能</p>
        <button onClick={() => {
          const current = (typeof window !== "undefined" && localStorage.getItem("deepseek_key")) || "";
          const key = prompt("DeepSeek API Key (留空清除):", current);
          if (key !== null) { if (key) localStorage.setItem("deepseek_key", key); else localStorage.removeItem("deepseek_key"); window.location.reload(); }
        }} className="text-xs text-mystic-400 underline">
          {typeof window !== "undefined" && localStorage.getItem("deepseek_key") ? "已设置 ✅ 点击修改" : "点击设置"}
        </button>
      </div>
    </div>
  );
}
