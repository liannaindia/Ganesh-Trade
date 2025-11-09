// components/Markets.jsx
import { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

export default function Markets({ setTab }) {
  const [search, setSearch] = useState("");
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  // WebSocket 连接 Binance
  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const formatted = data.map(t => ({
        symbol: t.s.replace('USDT', '/USDT'),
        price: parseFloat(t.c).toFixed(2),
        change: parseFloat(t.P).toFixed(2),
      }));
      setCoins(formatted);
      setLoading(false);
    };
    return () => ws.close();
  }, []);

  const filtered = coins.filter(c => c.symbol.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-orange-50 to-yellow-50 pb-24 min-h-screen">
      {/* 顶部导航 */}
      <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-yellow-500 text-white z-10">
        <div className="flex items-center gap-3 py-3 px-4">
          <h2 className="font-bold text-lg flex-1 text-center">Markets</h2>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-orange-200" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              placeholder="Search coins..."
            />
          </div>
        </div>
      </div>

      {/* 行情列表 */}
      <div className="px-4 pt-2">
        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading real-time data...</div>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, 50).map((c, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-3 shadow-sm border border-orange-100 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-orange-700">{c.symbol}</p>
                  <p className="text-sm text-gray-600">${c.price}</p>
                </div>
                <div className={`flex items-center gap-1 font-bold ${
                  parseFloat(c.change) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {parseFloat(c.change) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {Math.abs(c.change)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
