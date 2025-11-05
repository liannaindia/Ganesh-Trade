import React, { useState, useEffect } from "react";
import HomePage from "./components/Home.jsx";
import MarketsPage from "./components/Markets.jsx";
import TradePage from "./components/Trade.jsx";
import PositionsPage from "./components/Positions.jsx";
import MePage from "./components/Me.jsx";
import RechargePage from "./components/Recharge.jsx";
import WithdrawPage from "./components/Withdraw.jsx";
import InvitePage from "./components/Invite.jsx";
import LoginPage from "./components/Login.jsx"; 
import RegisterPage from "./components/Register.jsx"; 
import BottomNav from "./BottomNav";  // 引入底部导航栏

export default function App() {
  const [tab, setTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 新增：全局登录状态

  // 新增：初始化登录状态，从 localStorage 恢复
  useEffect(() => {
    const savedPhone = localStorage.getItem('phone_number');
    if (savedPhone) {
      setIsLoggedIn(true);
    }
  }, []);

  // 页面渲染逻辑
  const renderPage = () => {
    switch (tab) {
      case "markets":
        return <MarketsPage setTab={setTab} />;
      case "login":
        return <LoginPage setTab={setTab} setIsLoggedIn={setIsLoggedIn} />; // 新增：传递 setIsLoggedIn
      case "register":
        return <RegisterPage setTab={setTab} setIsLoggedIn={setIsLoggedIn} />; // 新增：传递 setIsLoggedIn
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
        return <HomePage setTab={setTab} isLoggedIn={isLoggedIn} />; // 新增：传递 isLoggedIn
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* 页面内容 */}
      <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900">
        {renderPage()}
      </div>

      {/* 固定底部导航栏，并对齐内容 */}
      <div className="max-w-md mx-auto w-full fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-none">
        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}
