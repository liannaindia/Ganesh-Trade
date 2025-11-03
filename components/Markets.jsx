import React, { useState, useEffect, useRef } from "react";

// 使用币安 API 实时获取市场数据
const Markets = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // 用于搜索的查询
  const [page, setPage] = useState(1); // 页码
  const observer = useRef(null); // 用于 IntersectionObserver

  // 获取币安市场数据
  const fetchBinanceData = async (page) => {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr`);
      const data = await response.json();

      // 只保留以 USDT 结尾的币种，并按照交易量从大到小排序
      const filteredData = data
        .filter((coin) => coin.symbol.endsWith("USDT"))  // 只保留以 USDT 结尾的币种
        .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));  // 按照交易量从大到小排序

      // 获取当前页码的币种数据，分页加载
      const startIndex = (page - 1) * 20; // 每页 20 个币种
      const endIndex = startIndex + 20;
      const pageData = filteredData.slice(startIndex, endIndex);

      setMarketData((prevData) => [...prevData, ...pageData]); // 合并现有数据与新数据
      setLoading(false);  // 停止加载状态
    } catch (error) {
      console.error("Error fetching data from Binance:", error);
    }
  };

  useEffect(() => {
    fetchBinanceData(page); // 初次加载时获取数据
  }, [page]);  // 每当页码更新时重新获取数据

  // 处理币种名称：去除交易对后缀（如 USDT）
  const getBaseCurrency = (symbol) => {
    return symbol.replace(/USDT$/, '').replace(/BUSD$/, '').replace(/BTC$/, '').replace(/ETH$/, '');
  };

  // 监控滚动到页面底部时触发懒加载
  useEffect(() => {
    if (observer.current) {
      const callback = (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading) {
          setPage((prevPage) => prevPage + 1); // 当滚动到底部时，加载下一页数据
        }
      };

      const options = {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      };

      const observerInstance = new IntersectionObserver(callback, options);
      observerInstance.observe(observer.current);

      return () => observerInstance.disconnect();
    }
  }, [loading]);

  // 过滤市场数据（根据搜索输入）
  const filteredData = marketData.filter((coin) =>
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && page === 1) {
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 outline-none"
          />
        </div>
      </div>

      {/* ===== 市场行情表 ===== */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
        {/* 标签行 */}
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-slate-600">Name</span>
          <span className="font-medium text-slate-600">Last Price</span>
          <span className="font-medium text-slate-600">24chg%</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredData.length > 0 ? (
            filteredData.map((coin) => (
              <div key={coin.symbol} className="flex justify-between items-center py-2 text-sm">
                {/* 显示币种名称 */}
                <span className="font-medium text-slate-700">{getBaseCurrency(coin.symbol)}</span>

                {/* 最新价格 */}
                <span className="text-slate-800 font-semibold">{coin.lastPrice}</span>

                {/* 24小时涨幅 */}
                <span
                  className={`font-medium ${
                    parseFloat(coin.priceChangePercent) >= 0
                      ? "text-emerald-600"  // Green for positive change
                      : "text-rose-600"  // Red for negative change
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

      {/* ===== 悬浮返回顶部按钮 ===== */}
      <button
        ref={observer}
        onClick={() => window.scrollTo(0, 0)}
        className="fixed bottom-10 right-10 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
      >
        ↑
      </button>
    </div>
  );
};

export default Markets;
