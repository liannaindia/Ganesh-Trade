import React, { useState, useEffect } from "react";

// 使用币安 API 实时获取市场数据
const Markets = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取币安市场数据
  const fetchBinanceData = async () => {
    try {
      const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");
      const data = await response.json();
      
      // 更新市场数据状态
      setMarketData(data);  
      setLoading(false);  // 停止加载状态
    } catch (error) {
      console.error("Error fetching data from Binance:", error);
    }
  };

  useEffect(() => {
    // 初次加载时获取数据
    fetchBinanceData();
    
    // 每 10 秒钟请求一次最新数据
    const interval = setInterval(() => {
      fetchBinanceData();
    }, 10000); // 每 10 秒请求一次数据

    return () => clearInterval(interval); // 清除定时器
  }, []);  // 只在组件首次加载时触发一次

  if (loading) {
    return <div>Loading market data...</div>;
  }

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* ===== 搜索栏 ===== */}
      <div className="flex items-center gap-2 mt-3 mb-3">
        <div className="flex items-center flex-1 bg-slate-100 border border-slate-200 rounded-full pl-3 pr-3 py-2 text-slate-500 cursor-pointer">
          <input
            type="text"
            placeholder="Search for a coin"
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
          {marketData.length > 0 ? (
            marketData.map((coin) => (
              <div
                key={coin.symbol}
                className="flex justify-between items-center py-2 text-sm"
              >
                <span className="font-medium text-slate-700">{coin.symbol}</span>
                <span className="text-slate-800 font-semibold">{coin.lastPrice}</span>
                <span
                  className={`font-medium ${
                    coin.priceChangePercent.startsWith("+")
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {coin.priceChangePercent}%
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-500 py-4">No data available</div>
          )}
        </div>
      </div>

      {/* ===== 加载更多/返回顶部按钮 ===== */}
      <div className="flex justify-center mt-4">
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
};

export default Markets;
