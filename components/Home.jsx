import React, { useState } from "react";
import { Search, Bell, Globe, Wallet, IndianRupee, Users, MessageCircle, Settings } from "lucide-react";

export default function Home() {
  const [hideBalance, setHideBalance] = useState(false);
  const [lang, setLang] = useState("en");
  const [listTab, setListTab] = useState("watch");

  const T = {
    en: {
      welcome: "Welcome",
      search: "Search assets",
      totalAssets: "Total Assets (USDT)",
      todaysPnL: "Today's P&L",
      startTrading: "Start Trading",
      deposit: "Deposit",
      withdraw: "Withdraw",
      invite: "Invite",
      support: "Support",
      watchlist: "Watchlist",
      hot: "Hot",
      topGainers: "Top Gainers",
      topLosers: "Top Losers",
      name: "Name",
      lastPrice: "Last Price",
      change24h: "24h Change %",
    },
    hi: {
      welcome: "स्वागत है",
      search: "एसेट खोजें",
      totalAssets: "कुल संपत्ति (USDT)",
      todaysPnL: "आज का लाभ/हानि",
      startTrading: "ट्रेड शुरू करें",
      deposit: "जमा",
      withdraw: "निकासी",
      invite: "आमंत्रित करें",
      support: "सपोर्ट",
      watchlist: "पसंदीदा",
      hot: "लोकप्रिय",
      topGainers: "शीर्ष बढ़त",
      topLosers: "शीर्ष गिरावट",
      name: "नाम",
      lastPrice: "नवीनतम मूल्य",
      change24h: "24घं बदलाव %",
    },
  };

  const t = (key) => T[lang][key] || key;

  const demoAssets = [
    { sym: "BTC", name: "Bitcoin", price: 110395.6, chg: +0.2890 },
    { sym: "BCH", name: "Bitcoin Cash", price: 547.5, chg: -0.4555 },
    { sym: "LTC", name: "Litecoin", price: 100.05, chg: +4.2733 },
    { sym: "ETH", name: "Ethereum", price: 3550.12, chg: +0.6578 },
    { sym: "XRP", name: "XRP", price: 0.58, chg: -1.2481 },
  ];

  const pct = (v) => `${v > 0 ? "+" : ""}${v.toFixed(4)}%`;

  return (
    <div className="px-4 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center">
          <div className="mx-auto font-black">{t("welcome")}</div>
        </div>
      </header>

      {/* Search */}
      <div className="mt-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full rounded-full bg-slate-100 border border-slate-200 pl-9 pr-4 py-2 text-sm outline-none"
            placeholder={t("search")}
          />
        </div>
        <button className="p-2 rounded-full bg-white border border-slate-200">
          <Bell className="h-5 w-5 text-slate-600" />
        </button>
        <button
          className="p-2 rounded-full bg-white border border-slate-200"
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          title="Language"
        >
          <Globe className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* Banner */}
      <div className="mt-3">
        <div className="h-24 rounded-2xl bg-gradient-to-r from-orange-300 to-pink-400 flex items-center px-4 text-slate-900 shadow-md justify-between">
          <div className="font-extrabold text-lg">Ganesh Futures</div>
          <div className="text-xs font-semibold">India • IST</div>
        </div>
      </div>

      {/* Asset Card */}
      <div className="mt-4 rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
        <div className="flex items-center text-sm text-slate-500 justify-between">
          <span>{t("totalAssets")}</span>
          <button onClick={() => setHideBalance((v) => !v)} className="text-slate-400">
            {hideBalance ? "🙈" : "👁️"}
          </button>
        </div>
        <div className="mt-1 text-3xl font-extrabold tracking-tight">
          {hideBalance ? "•••••" : "10,012.06"}
        </div>
        <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
          <span>{t("todaysPnL")}:</span>
          <span className="font-semibold text-emerald-600">+0.00 / 0%</span>
        </div>

        <button className="w-full mt-3 rounded-xl bg-amber-400 text-slate-900 font-bold py-2">
          {t("startTrading")}
        </button>

        {/* Quick actions */}
        <div className="mt-3 grid grid-cols-4 text-center text-xs">
          <div className="flex flex-col items-center">
            <Wallet className="h-5 w-5 mb-1 text-slate-700" />
            <span>{t("deposit")}</span>
          </div>
          <div className="flex flex-col items-center">
            <IndianRupee className="h-5 w-5 mb-1 text-slate-700" />
            <span>{t("withdraw")}</span>
          </div>
          <div className="flex flex-col items-center">
            <Users className="h-5 w-5 mb-1 text-slate-700" />
            <span>{t("invite")}</span>
          </div>
          <div className="flex flex-col items-center">
            <MessageCircle className="h-5 w-5 mb-1 text-slate-700" />
            <span>{t("support")}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-3 flex items-center border-b border-slate-200 gap-4 text-sm font-semibold justify-around">
        {["watchlist", "hot", "topGainers", "topLosers"].map((key) => (
          <button
            key={key}
            onClick={() => setListTab(key)}
            className={`pb-2 transition ${
              listTab === key
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-slate-500"
            }`}
          >
            {t(key)}
          </button>
        ))}
        <Settings className="h-4 w-4 text-slate-500" />
      </div>

      {/* Asset List */}
      <div className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-sm divide-y">
        {demoAssets.map((a) => (
          <div key={a.sym} className="grid grid-cols-12 items-center px-3 py-3">
            <div className="col-span-4">
              <div className="font-bold text-slate-900">{a.sym}</div>
              <div className="text-[11px] text-slate-500">{a.name}</div>
            </div>
            <div className="col-span-4 text-right font-semibold">
              {a.price.toLocaleString()}
            </div>
            <div className="col-span-4 text-right">
              <span
                className={`inline-flex px-2 py-1 rounded-full text-[11px] font-bold ${
                  a.chg >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                }`}
              >
                {pct(a.chg)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
