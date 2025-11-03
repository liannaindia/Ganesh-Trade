import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // 引入 Router 来管理路由
import HomePage from "./components/Home"; // 导入主页组件
import MarketsPage from "./components/Markets";
import RechargePage from "./components/Recharge";
import WithdrawPage from "./components/Withdraw";
import TradePage from "./components/Trade";
import PositionsPage from "./components/Positions";
import MePage from "./components/Me";
import { Home, BarChart2, PlusCircle, ClipboardList, User } from "lucide-react"; // 底部导航图标

export default function App() {
  const [tab, setTab] = useState("home"); // 维护当前选中的 tab

  return (
    <Router> {/* 只在这里使用 Router */}
      <div className="min-h-screen bg-slate-100 text-slate-900">
        {/* 页面内容 */}
        <div className="max-w-md mx-auto pb-20">
          <Routes>
            {/* 路由配置 */}
            <Route path="/" element={<HomePage setTab={setTab} />} />
            <Route path="/markets" element={<MarketsPage setTab={setTab} />} />
            <Route path="/recharge" element={<RechargePage setTab={setTab} />} />
            <Route path="/withdraw" element={<WithdrawPage setTab={setTab} />} />
            <Route path="/trade" element={<TradePage setTab={setTab} />} />
            <Route path="/positions" element={<PositionsPage setTab={setTab} />} />
            <Route path="/me" element={<MePage setTab={setTab} />} />
          </Routes>
        </div>

        {/* 底部导航栏 */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-sm">
          <div className="max-w-md mx-auto flex">
            {/* 遍历 tabs，渲染底部导航栏按钮 */}
            {[
              { id: "home", icon: <Home size={20} />, label: "Home", path: "/" },
              { id: "markets", icon: <BarChart2 size={20} />, label: "Markets", path: "/markets" },
              { id: "trade", icon: <PlusCircle size={20} />, label: "Trade", path: "/trade" },
              { id: "positions", icon: <ClipboardList size={20} />, label: "Positions", path: "/positions" },
              { id: "me", icon: <User size={20} />, label: "Me", path: "/me" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)} // 切换 tab 状态
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
