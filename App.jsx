import React, { useMemo, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Bell,
  ChevronRight,
  Globe,
  IndianRupee,
  MessageCircle,
  Search,
  Settings,
  Users,
  Wallet,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";

/**
 * =============================
 * Ganesh Trade — UI Prototype
 * Tech: React + Tailwind + Supabase
 * Scope: Pure UI (no real data yet). IST/₹ focus, EN/HI i18n.
 * =============================
 * How to use in CRA/Vite:
 * - Ensure Tailwind is installed & configured.
 * - Place this file as App.jsx (or any route) and render.
 * - No backend logic yet. Supabase client is initialized but unused.
 */

// ====== Supabase (placeholder) ======
const supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL || "https://YOUR-PROJECT.supabase.co";
const supabaseKey = import.meta?.env?.VITE_SUPABASE_ANON_KEY || "public-anon-key";
export const supabase = createClient(supabaseUrl, supabaseKey);

// ====== i18n minimal ======
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
    home: "Home",
    markets: "Markets",
    trade: "Trade",
    positions: "Positions",
    me: "Me",
    inOtherLangs: "in 100 other languages",
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
    home: "होम",
    markets: "मार्केट",
    trade: "ट्रेड",
    positions: "पोज़िशन",
    me: "मेरा",
    inOtherLangs: "अन्य 100 भाषाओं में",
  },
};

const useI18n = () => {
  const [lang, setLang] = useState("en");
  const t = (k) => T[lang][k] || k;
  return { lang, setLang, t };
};

// ====== helpers ======
const inr = (v) => v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (v) => `${v > 0 ? "+" : ""}${v.toFixed(4)}%`;

// ====== demo data ======
const demoAssets = [
  { sym: "BTC", name: "Bitcoin", price: 110395.6, chg: +0.2890 },
  { sym: "BCH", name: "Bitcoin Cash", price: 547.5, chg: -0.4555 },
  { sym: "LTC", name: "Litecoin", price: 100.05, chg: +4.2733 },
  { sym: "ETH", name: "Ethereum", price: 3550.12, chg: +0.6578 },
  { sym: "XRP", name: "XRP", price: 0.58, chg: -1.2481 },
];

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-3 text-sm font-semibold border-b-2 transition ${
      active ? "text-indigo-600 border-indigo-600" : "text-slate-500 border-transparent"
    }`}
  >
    {children}
  </button>
);

const BottomItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 py-2 text-xs ${
      active ? "text-indigo-600" : "text-slate-500"
    }`}
  >
    {icon}
    <span className="mt-1">{label}</span>
  </button>
);

const Banner = () => (
  <div className="relative w-full">
    <div className="h-24 rounded-2xl bg-gradient-to-r from-orange-300 to-pink-400 flex items-center px-4 text-slate-900 shadow-md">
      <div className="font-extrabold text-lg">Ganesh Futures</div>
      <div className="ml-auto text-xs font-semibold">India • IST</div>
    </div>
  </div>
);

const AssetRow = ({ a }) => (
  <div className="flex items-center py-3 border-b last:border-b-0 border-slate-200">
    <div className="w-14 text-sm font-bold text-slate-800">{a.sym}</div>
    <div className="flex-1 text-slate-600 text-xs truncate">{a.name}</div>
    <div className="w-28 text-right text-slate-900 font-semibold">{a.price}</div>
    <div className="ml-2">
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${
          a.chg >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        }`}
      >
        {pct(a.chg)}
      </span>
    </div>
  </div>
);

export default function App() {
  const { t, lang, setLang } = useI18n();
  const [tab, setTab] = useState("home");
  const [listTab, setListTab] = useState("watch");

  // demo state for card
  const [hideBalance, setHideBalance] = useState(false);
  const totalUSDT = 10012.06;
  const todays = 0.0;

  useEffect(() => {
    document.documentElement.style.background = "#f5f7fb";
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center">
          <div className="mx-auto font-black">{t("welcome")}</div>
        </div>
      </header>

      {/* Content container (mobile width) */}
      <div className="max-w-md mx-auto px-4 pb-20">
        {/* Search + actions */}
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
          <Banner />
        </div>

        {/* Asset Card */}
        <div className="mt-4 rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="flex items-center text-sm text-slate-500">
            <span>{t("totalAssets")}</span>
            <button className="ml-2 text-slate-400" onClick={() => setHideBalance((v) => !v)}>
              {hideBalance ? "🙈" : "👁️"}
            </button>
          </div>
          <div className="mt-1 text-3xl font-extrabold tracking-tight">
            {hideBalance ? "•••••" : totalUSDT.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
            <span>{t("todaysPnL")}: </span>
            <span className={`font-semibold ${todays >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {todays >= 0 ? "+" : ""}
              {todays.toFixed(2)} / 0%
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="flex-1 rounded-xl bg-amber-400 text-slate-900 font-bold py-2">
              {t("startTrading")}
            </button>
          </div>

          {/* quick actions */}
          <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-xl bg-slate-100 grid place-items-center"><Wallet className="h-5 w-5"/></div>
              <span>{t("deposit")}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-xl bg-slate-100 grid place-items-center"><IndianRupee className="h-5 w-5"/></div>
              <span>{t("withdraw")}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-xl bg-slate-100 grid place-items-center"><Users className="h-5 w-5"/></div>
              <span>{t("invite")}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-xl bg-slate-100 grid place-items-center"><MessageCircle className="h-5 w-5"/></div>
              <span>{t("support")}</span>
            </div>
          </div>
        </div>

        {/* notice / languages row */}
        <button className="mt-3 w-full rounded-2xl bg-white border border-slate-200 shadow-sm py-3 px-4 flex items-center text-sm">
          <span className="inline-flex items-center gap-2 text-slate-700">
            <Globe className="h-4 w-4"/>
            {t("inOtherLangs")}
          </span>
          <ChevronRight className="ml-auto h-4 w-4 text-slate-400"/>
        </button>

        {/* tabs list */}
        <div className="mt-2 border-b border-slate-200 flex items-center">
          <TabBtn active={listTab === "watch"} onClick={() => setListTab("watch")}>{t("watchlist")}</TabBtn>
          <TabBtn active={listTab === "hot"} onClick={() => setListTab("hot")}>{t("hot")}</TabBtn>
          <TabBtn active={listTab === "gainers"} onClick={() => setListTab("gainers")}>{t("topGainers")}</TabBtn>
          <TabBtn active={listTab === "losers"} onClick={() => setListTab("losers")}>{t("topLosers")}</TabBtn>
          <button className="ml-auto text-slate-500"><Settings className="h-4 w-4"/></button>
        </div>

        {/* list header */}
        <div className="grid grid-cols-12 text-[11px] text-slate-500 mt-2 px-1">
          <div className="col-span-4">{t("name")}</div>
          <div className="col-span-4 text-right">{t("lastPrice")}</div>
          <div className="col-span-4 text-right">{t("change24h")}</div>
        </div>

        {/* rows */}
        <div className="mt-1 rounded-2xl bg-white border border-slate-200 shadow-sm divide-y">
          {demoAssets.map((a) => (
            <div key={a.sym} className="grid grid-cols-12 items-center px-3 py-3">
              <div className="col-span-4">
                <div className="font-bold text-slate-900">{a.sym}</div>
                <div className="text-[11px] text-slate-500">{a.name}</div>
              </div>
              <div className="col-span-4 text-right font-semibold">{a.price}</div>
              <div className="col-span-4 text-right">
                <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-bold ${
                  a.chg >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                }`}>
                  {pct(a.chg)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200">
        <div className="max-w-md mx-auto flex">
          <BottomItem
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7"/><path d="M9 22V12h6v10"/></svg>}
            label={t("home")}
            active={tab === "home"}
            onClick={() => setTab("home")}
          />
          <BottomItem icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} label={t("markets")} active={tab === "markets"} onClick={() => setTab("markets")} />
          <BottomItem icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>} label={t("trade")} active={tab === "trade"} onClick={() => setTab("trade")} />
          <BottomItem icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="9" width="7" height="11" rx="1"/></svg>} label={t("positions")} active={tab === "positions"} onClick={() => setTab("positions")} />
          <BottomItem icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} label={t("me")} active={tab === "me"} onClick={() => setTab("me")} />
        </div>
      </nav>
    </div>
  );
}
