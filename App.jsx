import React, { useState } from "react";
import HomePage from "./components/Home.jsx";
import MarketsPage from "./components/Markets.jsx";
import TradePage from "./components/Trade.jsx";
import PositionsPage from "./components/Positions.jsx";
import MePage from "./components/Me.jsx";
import RechargePage from "./components/Recharge.jsx";
import WithdrawPage from "./components/Withdraw.jsx";
import InvitePage from "./components/Invite.jsx";
import BottomNav from "./BottomNav";  // 引入底部导航栏

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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* 页面内容 */}
      <div className="max-w-md mx-auto pb-20">{renderPage()}</div>

      {/* 在每个页面中嵌入底部导航栏，并限制宽度 */}
      <div className="max-w-md mx-auto w-full">
        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}
