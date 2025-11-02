import React, { useEffect, useState } from "react";
import { Search, Bell, Globe, Send, UserPlus, Headphones } from "lucide-react";

export default function Home({ setTab }) {
  const [coins, setCoins] = useState([]);

  // ===== 获取币安 24小时前10成交量币种 =====
  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        const data = await res.json();
        // 按成交量排序取前10
        const top = data
          .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
          .slice(0, 10)
          .map((i) => ({
            name: i.symbol.replace("USDT", ""),
            price: parseFloat(i.lastPrice).toFixed(2),
            change:
              (parseFloat(i.priceChangePercent) >= 0 ? "+" : "") +
              parseFloat(i.priceChangePercent).toFixed(2) +
              "%",
          }));
        setCoins(top);
      } catch (e) {
        console.error("Binance API Error:", e);
      }
    };

    fetchTopCoins();
    const interval = setInterval(fetchTopCoins, 15000);
    return () => clearInterval(interval);
  }, []);

  const banners = [
    { id: 1, img: "https://i.imgur.com/4ZQZ4qG.png" },
    { id: 2, img: "https://i.imgur.com/EBUSlqk.png" },
  ];

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* ===== 搜索栏 ===== */}
      <div className="flex items-center gap-2 mt-3 mb-3">
        <div
          onClick={() => setTab("markets")}
          className="flex items-center flex-1 bg-slate-100 border border-slate-200 rounded-full pl-3 pr-3 py-2 text-slate-500 cursor-pointer"
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="text-sm text-slate-400">Search assets</span>
        </div>
        <div className="flex gap-2">
          <div className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm cursor-pointer">
            <Bell className="h-5 w-5 text-slate-500" />
          </div>
          <div className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm cursor-pointer">
            <Globe className="h-5 w-5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* ===== 顶部 Banner 区 ===== */}
      <div className="relative overflow-hidden rounded-2xl mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {banners.map((b) => (
            <img
              key={b.id}
              src={b.img}
              alt="banner"
              className="snap-center min-w-full object-cover cursor-pointer"
              onClick={() => setTab("trade")}
            />
          ))}
        </div>
      </div>

      {/* ===== Ganesh Futures 卡片 ===== */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 text-white px-4 py-3 mb-4 shadow">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Ganesh Futures</h2>
          <span className="text-sm opacity-90">India • IST</span>
        </div>
      </div>

      {/* ===== 资产总览 ===== */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-4">
        <div className="text-sm text-slate-500">Total Assets (USDT)</div>
        <div className="text-3xl font-bold text-slate-900 mt-1">10,012.06</div>
        <div className="text-xs text-slate-500 mt-1">
          Today's P&L: +0.00 / 0%
        </div>

        <button
          className="mt-3 w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-2.5 rounded-xl transition"
          onClick={() => setTab("trade")}
        >
          Start Trading
        </button>
      </div>

      {/* ===== 功能按钮 ===== */}
      <div className="grid grid-cols-4 gap-2 text-center text-sm text-slate-700 mb-5">
        <div onClick={() => setTab("me")} className="cursor-pointer">
          <Send className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
          <div>Recharge</div>
        </div>
        <div onClick={() => setTab("me")} className="cursor-pointer">
          <Send className="h-6 w-6 mx-auto text-orange-500 mb-1 rotate-180" />
          <div>Withdraw</div>
        </div>
        <div onClick={() => setTab("me")} className="cursor-pointer">
          <UserPlus className="h-6 w-6 mx-auto text-blue-500 mb-1" />
          <div>Invite</div>
        </div>
        <div
          onClick={() =>
            window.open("https://t.me/ganeshsupport", "_blank")
          }
          className="cursor-pointer"
        >
          <Headphones className="h-6 w-6 mx-auto text-green-500 mb-1" />
          <div>Support</div>
        </div>
      </div>

      {/* ===== 市场行情表（前10） ===== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-slate-800">Market Overview</h3>
          <button
            onClick={() => setTab("markets")}
            className="text-sm text-yellow-600 font-medium"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {coins.length === 0 ? (
            <div className="text-center text-slate-400 py-4 text-sm">
              Loading market data...
            </div>
          ) : (
            coins.map((c, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 text-sm"
              >
                <span className="font-medium text-slate-700">{c.name}</span>
                <span className="text-slate-800 font-semibold">
                  {c.price}
                </span>
                <span
                  className={`font-medium ${
                    c.change.startsWith("+")
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {c.change}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
