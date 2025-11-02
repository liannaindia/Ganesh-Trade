import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Globe, Send, UserPlus, Headphones } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const fetchTopCoins = async () => {
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const targetUrl = "https://api.binance.com/api/v3/ticker/24hr?limit=10";
      
      try {
        const res = await fetch(proxyUrl + targetUrl);
        const data = await res.json();
        const topCoins = data.map((coin) => ({
          name: coin.symbol.replace("USDT", ""),
          price: parseFloat(coin.lastPrice).toFixed(2),
          change: parseFloat(coin.priceChangePercent).toFixed(2),
        }));
        setCoins(topCoins);
      } catch (e) {
        console.error("Error fetching Binance data:", e);
      }
    };

    fetchTopCoins();
    const interval = setInterval(fetchTopCoins, 15000);
    return () => clearInterval(interval);
  }, []);

  const banners = [
    { id: 1, img: "https://i.imgur.com/4ZQZ4qG.png", link: "/trade" },
    { id: 2, img: "https://i.imgur.com/EBUSlqk.png", link: "/trade" },
  ];

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* Search Bar */}
      <div className="flex items-center gap-2 mt-3 mb-3">
        <div
          onClick={() => navigate("/markets")}
          className="flex items-center flex-1 bg-slate-100 border border-slate-200 rounded-full pl-3 pr-3 py-2 text-slate-500 cursor-pointer"
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="text-sm text-slate-400">Search assets</span>
        </div>
        <div className="flex gap-2">
          <div className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm cursor-pointer">
            <Bell className="h-5 w-5 text-slate-500" />
          </div>
          <div className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm cursor-pointer">
            <Globe className="h-5 w-5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Banners */}
      <div className="relative overflow-hidden rounded-2xl mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {banners.map((b) => (
            <img
              key={b.id}
              src={b.img}
              alt="banner"
              className="snap-center min-w-full object-cover cursor-pointer"
              onClick={() => navigate(b.link)}
            />
          ))}
        </div>
      </div>

      {/* Ganesh Futures */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 text-white px-4 py-3 mb-4 shadow">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Ganesh Futures</h2>
          <span className="text-sm opacity-90">India • IST</span>
        </div>
      </div>

      {/* Total Assets */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-4">
        <div className="text-sm text-slate-500">Total Assets (USDT)</div>
        <div className="text-3xl font-bold text-slate-900 mt-1">10012.06</div>
        <div className="text-xs text-slate-500 mt-1">Today's P&L: +0.00 / 0%</div>

        <button className="mt-3 w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-2.5 rounded-xl transition">
          Start Trading
        </button>
      </div>

      {/* Functional Buttons */}
      <div className="grid grid-cols-4 gap-2 text-center text-sm text-slate-700 mb-5">
        <div onClick={() => navigate("/recharge")} className="cursor-pointer">
          <Send className="h-6 w-6 mx-auto text-yellow-500 mb-1" />
          <div>Recharge</div>
        </div>
        <div onClick={() => navigate("/withdraw")} className="cursor-pointer">
          <Send className="h-6 w-6 mx-auto text-orange-500 mb-1 rotate-180" />
          <div>Withdraw</div>
        </div>
        <div onClick={() => navigate("/invite")} className="cursor-pointer">
          <UserPlus className="h-6 w-6 mx-auto text-blue-500 mb-1" />
          <div>Invite</div>
        </div>
        <div
          onClick={() =>
            (window.location.href =
              "https://t.me/ganeshsupport" /* 或 WhatsApp 链接 */)
          }
          className="cursor-pointer"
        >
          <Headphones className="h-6 w-6 mx-auto text-green-500 mb-1" />
          <div>Support</div>
        </div>
      </div>

      {/* Market Data */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-slate-800">Market Overview</h3>
          <button
            onClick={() => navigate("/markets")}
            className="text-sm text-yellow-600 font-medium"
          >
            View All
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {coins.length === 0 ? (
            <div className="text-center py-3 text-slate-500">Loading market data...</div>
          ) : (
            coins.map((c, i) => (
              <div key={i} className="flex justify-between items-center py-2 text-sm">
                <span className="font-medium text-slate-700">{c.name}</span>
                <span className="text-slate-800 font-semibold">{c.price}</span>
                <span
                  className={`font-medium ${
                    c.change.startsWith("+") ? "text-emerald-600" : "text-rose-600"
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
  );
}
