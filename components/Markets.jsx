import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Markets() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCoins, setFilteredCoins] = useState([]);

  // ===== 获取币安实时数据 =====
  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        const data = await res.json();

        const all = data
          .filter((i) => i.symbol.endsWith("USDT"))
          .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
          .slice(0, 10) // 仅获取前10个
          .map((i) => ({
            symbol: i.symbol.replace("USDT", ""),
            price: parseFloat(i.lastPrice).toFixed(2),
            change: parseFloat(i.priceChangePercent).toFixed(2),
          }));

        setCoins(all);
        setFilteredCoins(all); // 默认显示前10
      } catch (e) {
        console.error("Binance API Error:", e);
      }
    };

    fetchTopCoins();
    const timer = setInterval(fetchTopCoins, 15000); // 每15秒更新一次
    return () => clearInterval(timer);
  }, []);

  // ===== 搜索过滤 =====
  useEffect(() => {
    if (searchQuery) {
      setFilteredCoins(
        coins.filter((coin) =>
          coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredCoins(coins); // 如果没有搜索，则显示所有
    }
  }, [searchQuery, coins]);

  return (
    <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900">
      {/* ===== 搜索框 ===== */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 bg-white rounded-full border border-slate-200 shadow-sm px-3 py-2 cursor-pointer">
          <input
            type="text"
            className="w-full text-sm text-slate-500 outline-none"
            placeholder="Enter the trading product name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // 更新搜索框内容
          />
        </div>
      </div>

      {/* ===== 市场数据表格 ===== */}
      <div className="px-4 mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-slate-700">Markets</h2>
        </div>

        {/* ===== 虚拟货币列表 ===== */}
        <div className="divide-y divide-slate-100">
          {filteredCoins.length === 0 ? (
            <div className="text-center py-4 text-slate-400 text-sm">
              Loading market data...
            </div>
          ) : (
            filteredCoins.map((c, i) => (
              <div key={i} className="flex justify-between items-center py-3 text-sm">
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

      {/* ===== 返回按钮 ===== */}
      <div className="px-4 mt-4">
        <button
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-2.5 rounded-xl transition"
          onClick={() => navigate("/")} // 返回首页
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
