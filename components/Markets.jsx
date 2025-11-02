import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Markets() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const listRef = useRef(null);

  // ===== 获取币安实时数据 =====
  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?limit=100&offset=${(page - 1) * 100}`
        );
        const data = await res.json();

        const newCoins = data
          .filter((i) => i.symbol.endsWith("USDT"))
          .map((i) => ({
            symbol: i.symbol.replace("USDT", ""),
            price: parseFloat(i.lastPrice).toFixed(2),
            change: parseFloat(i.priceChangePercent).toFixed(2),
          }));

        if (newCoins.length > 0) {
          setCoins((prev) => [...prev, ...newCoins]);
        } else {
          setHasMore(false); // 如果没有更多数据了
        }
        setLoading(false);
      } catch (e) {
        console.error("Binance API Error:", e);
        setLoading(false);
      }
    };

    fetchTopCoins();
  }, [page]);

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

  // ===== 滚动加载更多 =====
  const handleScroll = () => {
    if (listRef.current) {
      const bottom =
        listRef.current.scrollHeight === listRef.current.scrollTop + listRef.current.clientHeight;
      if (bottom && !loading && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  };

  // ===== 返回顶部按钮 =====
  const scrollToTop = () => {
    listRef.current.scrollTo(0, 0);
  };

  return (
    <div
      className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900"
      ref={listRef}
      onScroll={handleScroll}
    >
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
                    c.change.startsWith("+") ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {c.change}%
                </span>
              </div>
            ))
          )}
        </div>

        {/* ===== 正在加载数据提示 ===== */}
        {loading && (
          <div className="text-center py-4 text-slate-400 text-sm">Loading more data...</div>
        )}
      </div>

      {/* ===== 返回顶部按钮 ===== */}
      {filteredCoins.length > 10 && (
        <button
          className="fixed bottom-10 right-10 bg-yellow-400 text-white p-2 rounded-full"
          onClick={scrollToTop}
        >
          ↑
        </button>
      )}
    </div>
  );
}
