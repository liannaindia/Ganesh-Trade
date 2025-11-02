import React, { useEffect, useState } from "react";
import {
  Search,
  Mail,
  Wallet,
  Send,
  Headphones,
  Gift,
} from "lucide-react";

export default function Home({ setTab }) {
  const [coins, setCoins] = useState([]);
  const [activeTab, setActiveTab] = useState("favorites");

  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        const data = await res.json();

        // 按交易量排序，获取前 50，后面再分组使用
        const all = data
          .filter((i) => i.symbol.endsWith("USDT"))
          .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
          .slice(0, 50)
          .map((i) => ({
            symbol: i.symbol.replace("USDT", ""),
            price: parseFloat(i.lastPrice).toFixed(2),
            change: parseFloat(i.priceChangePercent).toFixed(2),
          }));

        setCoins(all);
      } catch (e) {
        console.error("Binance API Error:", e);
      }
    };

    fetchTopCoins();
    const timer = setInterval(fetchTopCoins, 15000);
    return () => clearInterval(timer);
  }, []);

  // 四个标签数据切换
  const getFilteredCoins = () => {
    switch (activeTab) {
      case "favorites":
        return coins.slice(0, 10);
      case "hot":
        return coins
          .slice()
          .sort((a, b) => b.price - a.price)
          .slice(0, 10);
      case "gainers":
        return coins
          .slice()
          .sort((a, b) => b.change - a.change)
          .slice(0, 10);
      case "losers":
        return coins
          .slice()
          .sort((a, b) => a.change - b.change)
          .slice(0, 10);
      default:
        return coins.slice(0, 10);
    }
  };

  const displayed = getFilteredCoins();

  return (
    <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900">
      {/* ===== 顶部 ===== */}
      <div className="flex justify-between items-center px-4 pt-3">
        <h1 className="text-base font-semibold">Welcome</h1>
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-500 cursor-pointer" />
          <Mail className="w-5 h-5 text-slate-500 cursor-pointer" />
        </div>
      </div>

      {/* ===== 顶部 Banner ===== */}
      <div className="px-4 mt-3">
        <div className="rounded-xl overflow-hidden shadow-sm">
          <img
            src="https://www.binance.com/banners/futures.jpg"
            alt="banner"
            className="w-full object-cover"
          />
        </div>
      </div>

      {/* ===== 资产卡片 ===== */}
      <div className="bg-white rounded-2xl shadow-sm mx-4 mt-3 p-4 border border-slate-100">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-slate-500">Total Assets (USDT)</div>
            <div className="text-2xl font-bold mt-1">9900.06</div>
            <div className="text-xs text-slate-500 mt-1">
              Pnl Today 0.00 / 0%
            </div>
          </div>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-sm font-medium text-slate-900 rounded-full px-4 py-1.5 transition"
            onClick={() => setTab("trade")}
          >
            Go Trade
          </button>
        </div>

        {/* ===== 功能按钮 ===== */}
        <div className="grid grid-cols-4 mt-4 text-center text-xs text-slate-700">
          <div
            onClick={() => setTab("recharge")}
            className="cursor-pointer flex flex-col items-center gap-1"
          >
            <Wallet className="w-5 h-5 text-yellow-500" />
            <span>Recharge</span>
          </div>
          <div
            onClick={() => setTab("withdraw")}
            className="cursor-pointer flex flex-col items-center gap-1"
          >
            <Send className="w-5 h-5 text-orange-500 rotate-180" />
            <span>Withdraw</span>
          </div>
          <div
            onClick={() => setTab("invite")}
            className="cursor-pointer flex flex-col items-center gap-1"
          >
            <Gift className="w-5 h-5 text-indigo-500" />
            <span>Invite</span>
          </div>
          <div
            onClick={() =>
              window.open("https://t.me/ganeshsupport", "_blank")
            }
            className="cursor-pointer flex flex-col items-center gap-1"
          >
            <Headphones className="w-5 h-5 text-green-500" />
            <span>Support</span>
          </div>
        </div>
      </div>

      {/* ===== 市场行情表 ===== */}
      <div className="bg-white rounded-2xl mx-4 mt-4 border border-slate-100 shadow-sm">
        {/* Tabs */}
        <div className="flex text-sm border-b border-slate-100">
          {[
            { id: "favorites", label: "Favorites" },
            { id: "hot", label: "Hot" },
            { id: "gainers", label: "Gainers" },
            { id: "losers", label: "Losers" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-center font-medium ${
                activeTab === tab.id
                  ? "text-yellow-600 border-b-2 border-yellow-400"
                  : "text-slate-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 表格 */}
        <div className="p-3">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Name</span>
            <span>Last Price</span>
            <span>24chg%</span>
          </div>

          <div className="divide-y divide-slate-100">
            {displayed.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-sm">
                Loading market data...
              </div>
            ) : (
              displayed.map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-2 text-sm"
                >
                  <span className="font-medium text-slate-800">{c.symbol}</span>
                  <span className="text-slate-700">{c.price}</span>
                  <span
                    className={`font-semibold ${
                      c.change >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {c.change}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
