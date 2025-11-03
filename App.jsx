import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";  // 引入路由相关组件
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
  return (
    <Router>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        {/* 页面内容 */}
        <div className="max-w-md mx-auto pb-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/trade" element={<TradePage />} />
            <Route path="/positions" element={<PositionsPage />} />
            <Route path="/me" element={<MePage />} />
            <Route path="/recharge" element={<RechargePage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
            <Route path="/invite" element={<InvitePage />} />
          </Routes>
        </div>

        {/* 底部导航栏 */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-sm">
          <div className="max-w-md mx-auto flex">
            <TabLink to="/" icon={<Home size={20} />} label="Home" />
            <TabLink to="/markets" icon={<BarChart2 size={20} />} label="Markets" />
            <TabLink to="/trade" icon={<PlusCircle size={20} />} label="Trade" />
            <TabLink to="/positions" icon={<ClipboardList size={20} />} label="Positions" />
            <TabLink to="/me" icon={<User size={20} />} label="Me" />
          </div>
        </nav>
      </div>
    </Router>
  );
}

function TabLink({ to, icon, label }) {
  const navigate = useNavigate();  // 使用 navigate 来进行跳转
  return (
    <button
      onClick={() => navigate(to)}  // 点击按钮后跳转到相应的路由
      className={`flex-1 flex flex-col items-center py-2`}
    >
      {icon}
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  );
}
