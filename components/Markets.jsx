import React, { useState, useEffect, useRef } from "react";
import { createClient } from '@supabase/supabase-js';

// 使用你的 Supabase URL 和匿名密钥
const supabase = createClient('https://your-project-id.supabase.co', 'your-anon-key');

export default function Markets() {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const observer = useRef(null);

  // 获取市场数据
  const fetchMarketData = async (page) => {
    let { data, error } = await supabase
      .from('market_data') // 使用你的表名
      .select('*')
      .range((page - 1) * 10, page * 10 - 1); // 每页10个数据

    if (error) {
      console.log("Error fetching market data", error);
    } else {
      setMarketData((prevData) => [...prevData, ...data]); // 合并现有数据与新数据
    }
    setLoading(false); // 数据加载完成
  };

  // 使用 useEffect 在组件加载时获取数据
  useEffect(() => {
    fetchMarketData(page);
  }, [page]);

  // 当用户滚动到底部时加载更多数据
  useEffect(() => {
    if (observer.current) {
      const callback = (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      };

      const options = {
        root: null, // 默认是浏览器视口
        rootMargin: "0px",
        threshold: 1.0,
      };

      const observerInstance = new IntersectionObserver(callback, options);
      observerInstance.observe(observer.current);
      return () => observerInstance.disconnect(); // 清理观察者
    }
  }, [loading]);

  if (loading && page === 1) {
    return <div>Loading market data...</div>;
  }

  // 过滤市场数据（根据搜索输入）
  const filteredData = marketData.filter((coin) =>
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* ===== 搜索栏 ===== */}
      <div className="flex items-center gap-2 mt-3 mb-3">
        <div className="flex items-center flex-1 bg-slate-100 border border-slate-200 rounded-full pl-3 pr-3 py-2 text-slate-500 cursor-pointer">
          <input
            type="text"
            placeholder="Search for a coin"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 outline-none"
          />
        </div>
      </div>

      {/* ===== 市场行情表 ===== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-slate-800">Market Overview</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredData.length > 0 ? (
            filteredData.map((coin) => (
              <div
                key={coin.id}
                className="flex justify-between items-center py-2 text-sm"
              >
                <span className="font-medium text-slate-700">{coin.symbol}</span>
                <span className="text-slate-800 font-semibold">{coin.last_price}</span>
                <span
                  className={`font-medium ${
                    coin.price_change_percent.startsWith("+") ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {coin.price_change_percent}%
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-500 py-4">No data available</div>
          )}
        </div>
      </div>

      {/* ===== 加载更多/返回顶部按钮 ===== */}
      <div ref={observer} className="flex justify-center mt-4">
        {loading && <div>Loading more...</div>}
      </div>

      {/* 返回顶部按钮 */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => window.scrollTo(0, 0)}
          className="text-sm text-slate-600 hover:text-slate-800"
        >
          Back to top
        </button>
      </div>
    </div>
  );
}
