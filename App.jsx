import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // 只在根组件中使用 Router
import HomePage from "./components/Home.jsx";
import MarketsPage from "./components/Markets.jsx";
import TradePage from "./components/Trade.jsx";
import PositionsPage from "./components/Positions.jsx";
import MePage from "./components/Me.jsx";
import RechargePage from "./components/Recharge.jsx";
import WithdrawPage from "./components/Withdraw.jsx";
import InvitePage from "./components/Invite.jsx";

export default function App() {
  const [tab, setTab] = useState("home");

  return (
    <Router> {/* 只在这里使用 Router */}
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
            {/* Add your bottom navigation here */}
          </div>
        </nav>
      </div>
    </Router>
  );
}
