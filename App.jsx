import React, { useState, useEffect } from "react";
import HomePage from "./components/Home.jsx";
import MarketsPage from "./components/Markets.jsx";
import TradePage from "./components/Trade.jsx";
import PositionsPage from "./components/Positions.jsx";
import MePage from "./components/Me.jsx";
import RechargePage from "./components/Recharge.jsx";
import WithdrawPage from "./components/Withdraw.jsx"; // 引入 WithdrawPage
import InvitePage from "./components/Invite.jsx";
import LoginPage from "./components/Login.jsx"; 
import RegisterPage from "./components/Register.jsx"; 
import BottomNav from "./BottomNav"; 
import { supabase } from "./supabaseClient"; 

export default function App() {
  const [tab, setTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balance, setBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0); // 新增 availableBalance 状态
  const [userId, setUserId] = useState(null);

  // App.jsx（只替换下面两个 useEffect）

// 1. 恢复登录状态
useEffect(() => {
  const savedPhone = localStorage.getItem('phone_number');
  const savedUserId = localStorage.getItem('user_id');

  if (savedPhone && savedUserId) {
    setIsLoggedIn(true);
    setUserId(savedUserId);
  }
}, []);

// 2. 实时余额订阅
useEffect(() => {
  if (!isLoggedIn || !userId) {
    if (window.balanceChannel) {
      supabase.removeChannel(window.balanceChannel);
      window.balanceChannel = null;
    }
    return;
  }

  const channel = supabase
    .channel('user-balance')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'users',
      filter: `id=eq.${userId}`
    }, (payload) => {
      setBalance(payload.new.balance ?? 0);
      setAvailableBalance(payload.new.available_balance ?? 0);
    })
    .subscribe();

  window.balanceChannel = channel;

  return () => {
    if (window.balanceChannel) {
      supabase.removeChannel(window.balanceChannel);
      window.balanceChannel = null;
    }
  };
}, [isLoggedIn, userId]);

  const renderPage = () => {
    switch (tab) {
      case "markets":
        return <MarketsPage setTab={setTab} />;
      case "login":
        return <LoginPage setTab={setTab} setIsLoggedIn={setIsLoggedIn} />;
      case "register":
        return <RegisterPage setTab={setTab} setIsLoggedIn={setIsLoggedIn} />;
      case "trade":
        return <TradePage setTab={setTab} isLoggedIn={isLoggedIn} balance={balance} availableBalance={availableBalance} userId={userId} />;
      case "positions":
        return <PositionsPage setTab={setTab} isLoggedIn={isLoggedIn} balance={balance}  availableBalance={availableBalance} userId={userId}  />;
      case "me":
        return <MePage setTab={setTab} balance={balance} availableBalance={availableBalance} isLoggedIn={isLoggedIn} userId={userId} />;
      case "recharge":
        return <RechargePage setTab={setTab} balance={balance} isLoggedIn={isLoggedIn} userId={userId} />; // 传 userId
      case "withdraw":
        return <WithdrawPage setTab={setTab} balance={balance} availableBalance={availableBalance} isLoggedIn={isLoggedIn} userId={userId} />;
      case "invite":
        return <InvitePage setTab={setTab} isLoggedIn={isLoggedIn} />;
      default:
        return <HomePage setTab={setTab} isLoggedIn={isLoggedIn} balance={balance} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900">
        {renderPage()}
      </div>

      <div className="max-w-md mx-auto w-full fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-none">
        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}
