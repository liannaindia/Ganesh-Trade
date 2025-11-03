import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // 引入路由组件
import HomePage from "./components/Home.jsx";
import MarketsPage from "./components/Markets.jsx";
import TradePage from "./components/Trade.jsx";
import PositionsPage from "./components/Positions.jsx";
import MePage from "./components/Me.jsx";
import RechargePage from "./components/Recharge.jsx";
import WithdrawPage from "./components/Withdraw.jsx";
import InvitePage from "./components/Invite.jsx";
import { Home, BarChart2, PlusCircle, ClipboardList, User } from "lucide-react";

export default function App() {
  const [tab, setTab] = useState("home");

  // 底部导航栏
  const tabs = [
    { id: "home", icon: <Home size={20} />, label: "Home", path: "/" },
    { id: "markets", icon: <BarChart2 size={20} />, label: "Markets", path: "/markets" },
    { id: "trade", icon: <PlusCircle size={20} />, label: "Trade", path: "/trade" },
    { id: "positions", icon: <ClipboardList size={20} />, label: "Positions", path: "/positions" },
    { id: "me", icon: <User size={20} />, label: "Me", path: "/me" },
  ];

  return (
    <Router> {/* 只在根组件中使用 BrowserRouter */}
      <div className="min-h-screen bg-slate-100 text-slate-900">
        {/* 页面内容 */}
        <div className="max-w-md mx-auto pb-20">
          <Routes>
            <Route path="/" element={<HomePage setTab={setTab} />} />
            <Route path="/markets" element={<MarketsPage setTab={setTab} />} />
            <Route path="/trade" element={<TradePage setTab={setTab} />} />
            <Route path="/positions" element={<PositionsPage setTab={setTab} />} />
            <Route path="/me" element={<MePage setTab={setTab} />} />
            <Route path="/recharge" element={<RechargePage setTab={setTab} />} />
            <Route path="/withdraw" element={<WithdrawPage setTab={setTab} />} />
            <Route path="/invite" element={<InvitePage setTab={setTab} />} />
          </Routes>
        </div>

        {/* 底部导航栏 */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-sm">
          <div className="max-w-md mx-auto flex">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)} // 切换tab状态
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
    </Router>
  );
}
