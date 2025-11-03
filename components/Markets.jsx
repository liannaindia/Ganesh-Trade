import React, { useState, useEffect } from "react";

// 使用币安 API 实时获取市场数据
const Markets = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // 用于搜索的查询

  // 获取币安市场数据
  const fetchBinanceData = async () => {
    try {
      const response = await fetch("https://api.binance.com/api/v3/ticker/24hr");
      const data = await response.json();

      // 过滤出以 USDT 结尾的币种，并按照交易量从大到小排序
      const filteredData = data
        .filter((coin) => coin.symbol.endsWith("USDT"))  // 只保留以 USDT 结尾的币种
        .sort((a, b) => {
          return parseFloat(b.volume) - parseFloat(a.volume);  // 按照交易量从大到小排序
        });

      setMarketData(filteredData);  // 更新数据到状态
      setLoading(false);  // 停止加载状态
    } catch (error) {
      console.error("Error fetching data from Binance:", error);
    }
  };

  useEffect(() => {
    fetchBinanceData(); // 初次加载时获取数据
    const interval = setInterval(() => {
      fetchBinanceData(); // 每 10 秒请求一次数据
    }, 10000);  // 每 10 秒请求一次数据

    return () => clearInterval(interval);  // 清除定时器
  }, []);  // 空依赖数组，意味着只会在组件加载时启动一次

  // 过滤市场数据（根据搜索输入）
  const filteredData = marketData.filter((coin) =>
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 函数：从交易对名称中提取币种基础名称（去掉USDT等后缀）
  const getBaseCurrency = (symbol) => {
    // 去掉USDT及其他后缀，只保留币种名称（例如PEPE）
    return symbol.replace(/USDT$/, '').replace(/BUSD$/, '').replace(/BTC$/, '').replace(/ETH$/, '');
  };

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
              <div
                key={coin.symbol}
                className="flex justify-between items-center py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  {/* 显示币种名称（去掉USDT等后缀） */}
                  <span className="font-medium text-slate-700">{getBaseCurrency(coin.symbol)}</span>
                </div>

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
    </div>
  );
};

export default Markets;
