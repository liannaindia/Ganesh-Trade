import React, { useState } from "react";
import HomePage from "./components/Home.jsx";
import MarketsPage from "./components/Markets.jsx";
import TradePage from "./components/Trade.jsx";
import PositionsPage from "./components/Positions.jsx";
import MePage from "./components/Me.jsx";
import RechargePage from "./components/Recharge.jsx";
import WithdrawPage from "./components/Withdraw.jsx";
import InvitePage from "./components/Invite.jsx";
import {
  Home,
  BarChart2,
  PlusCircle,
  ClipboardList,
  User,
} from "lucide-react";

export default function App() {
  const [tab, setTab] = useState("home");

  // 页面渲染逻辑
  const renderPage = () => {
    switch (tab) {
      case "markets":
        return <MarketsPage setTab={setTab} />;
      case "trade":
        return <TradePage setTab={setTab} />;
      case "positions":
        return <PositionsPage setTab={setTab} />;
      case "me":
        return <MePage setTab={setTab} />;
      case "recharge":
        return <RechargePage setTab={setTab} />;
      case "withdraw":
        return <WithdrawPage setTab={setTab} />;
      case "invite":
        return <InvitePage setTab={setTab} />;
      default:
        return <HomePage setTab={setTab} />;
    }
  };

  // 底部导航栏
  const tabs = [
    { id: "home", icon: <Home size={20} />, label: "Home" },
    { id: "markets", icon: <BarChart2 size={20} />, label: "Markets" },
    { id: "trade", icon: <PlusCircle size={20} />, label: "Trade" },
    { id: "positions", icon: <ClipboardList size={20} />, label: "Positions" },
    { id: "me", icon: <User size={20} />, label: "Me" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* 页面内容 */}
      <div className="max-w-md mx-auto pb-20">{renderPage()}</div>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-sm">
        <div className="max-w-md mx-auto flex">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center py-2 ${
                tab === t.id ? "text-indigo-600" : "text-slate-500"
              }`}
            >
              {t.icon}
              <span className="text-xs mt-1 font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
