// src/components/Home.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import banner1 from '../image/1.png';
import banner2 from '../image/2.png';
import { useNavigate } from "react-router-dom";
import { Search, Wallet, Send, Headphones, Gift } from "lucide-react";

// 国际化
import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

const Banner = ({ banners, bannerIndex }) => (
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
);

const MarketDataSection = ({ setTab }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-2xl shadow-sm mx-4 mt-3 p-4 border border-slate-100">
      <div className="grid grid-cols-4 mt-4 text-center text-xs text-slate-700">
        <div onClick={() => setTab("recharge")} className="cursor-pointer flex flex-col items-center gap-1">
          <Wallet className="w-5 h-5 text-yellow-500" />
          <span>{t("home.recharge")}</span>
        </div>
        <div onClick={() => setTab("withdraw")} className="cursor-pointer flex flex-col items-center gap-1">
          <Send className="w-5 h-5 text-orange-500 rotate-180" />
          <span>{t("home.withdraw")}</span>
        </div>
        <div onClick={() => setTab("invite")} className="cursor-pointer flex flex-col items-center gap-1">
          <Gift className="w-5 h-5 text-indigo-500" />
          <span>{t("home.invite")}</span>
        </div>
        <div onClick={() => window.open("https://t.me/ganeshsupport", "_blank")} className="cursor-pointer flex flex-col items-center gap-1">
          <Headphones className="w-5 h-5 text-green-500" />
          <span>{t("home.support")}</span>
        </div>
      </div>
    </div>
  );
};

const BalanceSection = ({ isLoggedIn, balance, handleLoginRedirect, setTab, pnlToday }) => {
  const { t } = useLanguage();

  return (
    <div className="text-center mt-1">
      {!isLoggedIn ? (
        <>
          <div className="mb-4">
            <p className="text-base text-slate-500">{t("home.welcome")}</p>
          </div>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-sm font-medium text-slate-900 rounded-full px-4 py-1.5 transition"
            onClick={handleLoginRedirect}
          >
            {t("home.loginRegister")}
          </button>
        </>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm mx-4 mt-3 p-4 border border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-slate-500">{t("home.totalAssets")}</div>
                <div className="text-2xl font-bold mt-1">{balance.toFixed(2)}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {t("home.pnlToday", { amount: pnlToday.toFixed(2) })}
                </div>
              </div>
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-sm font-medium text-slate-900 rounded-full px-4 py-1.5 transition"
                onClick={() => setTab("trade")}
              >
                {t("home.goTrade")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function Home({ setTab, isLoggedIn: propIsLoggedIn }) {
  const { t } = useLanguage(); // 全局 t 函数
  const [coins, setCoins] = useState([]);
  const [activeTab, setActiveTab] = useState("favorites");
  const [bannerIndex, setBannerIndex] = useState(0);
  const [localBalance, setLocalBalance] = useState(0);
  const [localIsLoggedIn, setLocalIsLoggedIn] = useState(false);
  const [pnlToday, setPnlToday] = useState(0);
  const isLoggedIn = propIsLoggedIn !== undefined ? propIsLoggedIn : localIsLoggedIn;
  const balance = localBalance;
  const navigate = useNavigate();

  const banners = [banner1, banner2];

  // ============= 实时余额 & PnL =============
  useEffect(() => {
    let realtimeSubscription = null;

    const fetchSession = async () => {
      const phoneNumber = localStorage.getItem('phone_number');
      if (!phoneNumber) return;

      setLocalIsLoggedIn(true);

      const { data, error } = await supabase
        .from('users')
        .select('balance, id')
        .eq('phone_number', phoneNumber)
        .single();

      if (error) {
        console.error('Error fetching user balance:', error);
        return;
      }

      setLocalBalance(data?.balance || 0);
      const userId = data?.id;
      calculateTodayPnL(userId);

      // PnL 实时监听
      const pnlSub = supabase
        .channel('pnl-today-sub')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'copytrade_details',
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            if (payload.new?.status === 'settled') {
              await calculateTodayPnL(userId);
            }
          }
        )
        .subscribe();

      realtimeSubscription = pnlSub;

      // 余额实时监听
      const balanceSub = supabase
        .channel('user-balance-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `phone_number=eq.${phoneNumber}`,
          },
          (payload) => {
            setLocalBalance(payload.new.balance || 0);
          }
        )
        .subscribe();

      realtimeSubscription = balanceSub;
    };

    fetchSession();

    return () => {
      if (realtimeSubscription) supabase.removeChannel(realtimeSubscription);
    };
  }, []);

  const calculateTodayPnL = async (userId) => {
    try {
      const indiaTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      const indiaDate = new Date(indiaTime);
      const startOfDay = new Date(indiaDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(indiaDate);
      endOfDay.setHours(23, 59, 59, 999);

      const startUTC = startOfDay.toISOString();
      const endUTC = endOfDay.toISOString();

      const { data, error } = await supabase
        .from("copytrade_details")
        .select("order_profit_amount")
        .eq("user_id", userId)
        .eq("status", "settled")
        .gte("created_at", startUTC)
        .lte("created_at", endUTC);

      if (error) throw error;

      const totalProfit = data.reduce((sum, row) => sum + (parseFloat(row.order_profit_amount) || 0), 0);
      setPnlToday(totalProfit);
    } catch (err) {
      console.error("Error calculating today's PnL:", err);
    }
  };

  // ============= Banner 轮播 =============
  useEffect(() => {
    const timer = setInterval(() => setBannerIndex((prev) => (prev + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // ============= Binance 行情 =============
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
      case "favorites": return coins.slice(0, 10);
      case "hot":       return coins.slice().sort((a, b) => b.price - a.price).slice(0, 10);
      case "gainers":   return coins.slice().sort((a, b) => b.change - a.change).slice(0, 10);
      case "losers":    return coins.slice().sort((a, b) => a.change - b.change).slice(0, 10);
      default:          return coins.slice(0, 10);
    }
  };

  const displayed = getFilteredCoins();
  const handleLoginRedirect = () => setTab("login");

  return (
    <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900">
      {/* 搜索 + 语言切换 */}
      <div className="px-4 mt-4 flex items-center justify-between">
        <div
          className="flex items-center bg-white rounded-full shadow-sm py-2 px-4 cursor-pointer flex-1 mr-2"
          onClick={() => setTab("markets")}
        >
          <Search className="w-5 h-5 text-slate-500" />
          <input
            type="text"
            className="ml-2 w-full bg-transparent border-none outline-none"
            placeholder={t("home.searchPlaceholder")}
            readOnly
          />
        </div>
        <LanguageSwitcher />
      </div>

      {/* 轮播图 */}
      <Banner banners={banners} bannerIndex={bannerIndex} />

      {/* 余额 / 登录 */}
      <BalanceSection
        isLoggedIn={isLoggedIn}
        balance={balance}
        handleLoginRedirect={handleLoginRedirect}
        setTab={setTab}
        pnlToday={pnlToday}
      />

      {/* 快捷功能 */}
      <MarketDataSection setTab={setTab} />

      {/* 行情 Tab */}
      <div className="bg-white rounded-2xl mx-4 mt-4 border border-slate-100 shadow-sm">
        <div className="flex text-sm border-b border-slate-100">
          {[
            { id: "favorites", label: t("home.favorites") },
            { id: "hot",       label: t("home.hot") },
            { id: "gainers",   label: t("home.gainers") },
            { id: "losers",    label: t("home.losers") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-center font-medium ${
                activeTab === tab.id
                  ? "text-yellow-600 border-b-2 border-yellow-400"
                  : "text-slate-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-3">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>{t("home.name")}</span>
            <span>{t("home.lastPrice")}</span>
            <span>{t("home.24chg")}</span>
          </div>

          <div className="divide-y divide-slate-100">
            {displayed.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-sm">
               {t("loading") ?? "Loading market data..."}
              </div>
            ) : (
              displayed.map((c, i) => (
                <div key={i} className="flex justify-between items-center py-2 text-sm">
                  <span className="font-medium text-slate-800">{c.symbol}</span>
                  <span className="text-slate-700">{c.price}</span>
                  <span className={`font-semibold ${c.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {c.change}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
