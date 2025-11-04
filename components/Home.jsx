import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Wallet, Send, Headphones, Gift } from "lucide-react";
import { supabase } from "../supabaseClient"; // 引入supabase客户端

export default function Home({ setTab }) {
  const [coins, setCoins] = useState([]);
  const [activeTab, setActiveTab] = useState("favorites");
  const [bannerIndex, setBannerIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);  // 存储用户信息
  const navigate = useNavigate();

  // 轮播图
  const banners = [
    "https://public.bnbstatic.com/image/banner/binance-futures.jpg",
    "https://public.bnbstatic.com/image/banner/spk-fixed-term.jpg",
    "https://public.bnbstatic.com/image/banner/binance-earn.jpg",
  ];

  // 检查用户是否登录
  useEffect(() => {
    const session = supabase.auth.session();
    if (session) {
      setIsLoggedIn(true);
      setUser(session.user);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setBannerIndex((prev) => (prev + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

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

  const getFilteredCoins = () => {
    switch (activeTab) {
      case "favorites":
        return coins.slice(0, 10);
      case "hot":
        return coins.slice().sort((a, b) => b.price - a.price).slice(0, 10);
      case "gainers":
        return coins.slice().sort((a, b) => b.change - a.change).slice(0, 10);
      case "losers":
        return coins.slice().sort((a, b) => a.change - b.change).slice(0, 10);
      default:
        return coins.slice(0, 10);
    }
  };

  const displayed = getFilteredCoins();

  // 点击登录跳转到登录页面
  const handleLoginRedirect = () => {
    setTab("login");  // 设置当前tab为login
    navigate("/login");  // 跳转到Login页面
  };

  const handleSearchClick = () => {
    setTab("markets");
    navigate("/markets");
  };

  return (
    <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900">
      <div className="px-4 mt-4">
        <div
          className="flex items-center bg-white rounded-full shadow-sm py-2 px-4 cursor-pointer"
          onClick={handleSearchClick}
        >
          <Search className="w-5 h-5 text-slate-500" />
          <input
            type="text"
            className="ml-2 w-full bg-transparent border-none outline-none"
            placeholder="Search for digital assets..."
            readOnly
          />
        </div>
      </div>

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
              className={`w-2 h-2 rounded-full ${i === bannerIndex ? "bg-yellow-500" : "bg-slate-300"}`}
            ></span>
          ))}
        </div>
      </div>

      <div className="text-center mt-1">
        {!isLoggedIn ? (
          <>
            <div className="mb-4">
              <p className="text-base text-slate-500">Welcome To Explore The World of Digital Ganesh.</p>
            </div>
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-sm font-medium text-slate-900 rounded-full px-4 py-1.5 transition"
              onClick={handleLoginRedirect}
            >
              Login / Register
            </button>
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm mx-4 mt-3 p-4 border border-slate-100">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-500">Total Assets (USDT)</div>
                  <div className="text-2xl font-bold mt-1">9900.06</div>
                  <div className="text-xs text-slate-500 mt-1">Pnl Today 0.00 / 0%</div>
                </div>
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-sm font-medium text-slate-900 rounded-full px-4 py-1.5 transition"
                  onClick={() => setTab("trade")}
                >
                  Go Trade
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm mx-4 mt-3 p-4 border border-slate-100">
        {/* Market Data Section */}
      </div>
    </div>
  );
}
