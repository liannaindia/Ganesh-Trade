import React, { useEffect, useState } from "react";
import {
  Search,
  Wallet,
  Send,
  Headphones,
  Gift,
} from "lucide-react";

export default function Home({ setTab }) {
  const [coins, setCoins] = useState([]);
  const [activeTab, setActiveTab] = useState("favorites");
  const [bannerIndex, setBannerIndex] = useState(0);

  // ===== 轮播图数组（可后台配置） =====
  const banners = [
    "https://public.bnbstatic.com/image/banner/binance-futures.jpg",
    "https://public.bnbstatic.com/image/banner/spk-fixed-term.jpg",
    "https://public.bnbstatic.com/image/banner/binance-earn.jpg",
  ];

  // ===== 自动轮播逻辑 =====
  useEffect(() => {
    const timer = setInterval(
      () => setBannerIndex((prev) => (prev + 1) % banners.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  // ===== 获取币安实时数据 =====
  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        const data = await res.json();

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

  // ===== 标签过滤逻辑 =====
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
      {/* ===== 顶部欢迎与搜索 ===== */}
      <div className="px-4 pt-3">
        <h1 className="text-base font-semibold text-center mb-2">Welcome</h1>

        {/* ✅ 修改后的搜索栏 */}
        <div
          onClick={() => setTab("markets")}
          className="flex items-center gap-2 bg-white rounded-full border border-slate-200 shadow-sm px-3 py-2 cursor-pointer"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400 select-none">
            Enter the trading product name
          </span>
        </div>
      </div>

      {/* ===== 顶部 Banner ===== */}
      <div className="px-4 mt-3 relative">
        <div className="rounded-xl overflow-hidden shadow-sm">
          <img
            src={banners[bannerIndex]}
            alt="banner"
            className="w-full h-24 object-cover transition-all duration-700"
          />
        </div>
        <div className="flex justify-center mt-1 gap-1">
          {banners.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === bannerIndex ? "bg-yellow-500" : "bg-slate-300"
              }`}
            ></span>
          ))}
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

        <div className="grid grid-cols-4 mt-4 text-center text-xs text-slate-700">
          <div
            onClick={() => setTab("recharge")}  {/* 点击时切换为 Recharge 页面 */}
            className="cursor-pointer flex flex-col items-center gap-1"
          >
            <Wallet className="w-5 h-5 text-yellow-500" />
            <span>Recharge</span>
          </div>
          <div
            onClick={() => setTab("withdraw")}  {/* 点击时切换为 Withdraw 页面 */}
            className="cursor-pointer flex flex-col items-center gap-1"
          >
            <Send className="w-5 h-5 text-orange-500 rotate-180" />
            <span>Withdraw</span>
          </div>
          <div
            onClick={() => setTab("invite")}  {/* 点击时切换为 Invite 页面 */}
            className="cursor-pointer flex flex-col items-center gap-1"
          >
            <Gift className="w-5 h-5 text-indigo-500" />
            <span>Invite</span>
          </div>
        </div>
      </div>

      {/* ===== 市场行情 ===== */}
      <div className="bg-white rounded-2xl mx-4 mt-4 border border-slate-100 shadow-sm">
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
                  <span className="font-medium text-slate-800">
                    {c.symbol}
                  </span>
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
