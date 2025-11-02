import React, { useEffect, useState } from "react";

export default function Markets() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
        const data = await res.json();

        // 只筛选主要币种（节省加载时间）
        const filtered = data
          .filter((item) =>
            ["BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "SOLUSDT", "DOGEUSDT"].includes(item.symbol)
          )
          .map((item) => ({
            symbol: item.symbol,
            lastPrice: parseFloat(item.lastPrice).toFixed(2),
            change: parseFloat(item.priceChangePercent).toFixed(2),
          }));

        setCoins(filtered);
        setLoading(false);
      } catch (err) {
        console.error("Binance API Error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // 每15秒刷新
    return () => clearInterval(interval);
  }, []);

  const filteredCoins = coins.filter((c) =>
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      <h2 className="text-lg font-semibold text-slate-800 mt-4 mb-2">Markets</h2>

      {/* 搜索框 */}
      <div className="relative mb-3">
        <input
          className="w-full border border-slate-200 bg-slate-50 rounded-full px-4 py-2 text-sm outline-none"
          placeholder="Enter the trading product name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 表格 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
        <div className="grid grid-cols-3 text-xs text-slate-500 mb-2">
          <div>Name</div>
          <div className="text-right">Last Price</div>
          <div className="text-right">24h Chg%</div>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-5 text-sm">
            Loading live market data...
          </div>
        ) : (
          filteredCoins.map((coin) => (
            <div
              key={coin.symbol}
              className="grid grid-cols-3 items-center text-sm py-2 border-t border-slate-100 first:border-t-0"
            >
              <div className="font-semibold text-slate-800">{coin.symbol.replace("USDT", "")}</div>
              <div className="text-right text-slate-700">{coin.lastPrice}</div>
              <div
                className={`text-right font-semibold ${
                  coin.change >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {coin.change >= 0 ? "+" : ""}
                {coin.change}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
