// App (4).jsx
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
import BottomNav from "./BottomNav"; 
import { supabase } from "./supabaseClient"; 

export default function App() {
  const [tab, setTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);

  // 1. 页面加载时恢复登录状态（修复：必须恢复 user_id）
  useEffect(() => {
    const savedPhone = localStorage.getItem('phone_number');
    const savedUserId = localStorage.getItem('user_id'); // 必须有

    console.log("App 启动 - localStorage:", { savedPhone, savedUserId });

    if (savedPhone && savedUserId) {
      setIsLoggedIn(true);
      setUserId(savedUserId);
    }
  }, []);

  // 2. 全局实时余额订阅（修复：只有登录后才订阅，避免 CLOSED 循环）
  useEffect(() => {
    let realtimeSubscription = null;

    const setupBalance = async () => {
      // 修复点：直接用 state 的 userId，不要再读 localStorage
      if (!isLoggedIn || !userId) {
        if (realtimeSubscription) {
          supabase.removeChannel(realtimeSubscription);
          realtimeSubscription = null;
        }
        return;
      }

      // 初始查询余额
      const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)  // 使用 state 的 userId
        .single();

      if (error) {
        console.error('Error fetching initial balance:', error);
      } else if (data) {
        setBalance(data.balance || 0);
      }

      // 实时订阅
      realtimeSubscription = supabase
        .channel('global-balance-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${userId}`,  // 使用 state 的 userId
          },
          (payload) => {
            console.log('Global balance updated via Realtime:', payload.new.balance);
            setBalance(payload.new.balance || 0);
          }
        )
        .subscribe((status) => {
          console.log('Global Realtime subscription status:', status);
        });
    };

    setupBalance();

    return () => {
      if (realtimeSubscription) {
        supabase.removeChannel(realtimeSubscription);
      }
    };
  }, [isLoggedIn, userId]); // 修复点：加上 userId 依赖

  const renderPage = () => {
    switch (tab) {
      case "markets":
        return <MarketsPage setTab={setTab} />;
      case "login":
        return <LoginPage setTab={setTab} setIsLoggedIn={setIsLoggedIn} />;
      case "register":
        return <RegisterPage setTab={setTab} setIsLoggedIn={setIsLoggedIn} />;
      case "trade":
        return <TradePage setTab={setTab} isLoggedIn={isLoggedIn} balance={balance} userId={userId} />;
      case "positions":
        return <PositionsPage setTab={setTab} isLoggedIn={isLoggedIn} balance={balance}  />;
      case "me":
        return <MePage setTab={setTab} isLoggedIn={isLoggedIn} balance={balance} />;
      case "recharge":
        return <RechargePage setTab={setTab} balance={balance} isLoggedIn={isLoggedIn} userId={userId} />; // 传 userId
      case "withdraw":
        return <WithdrawPage setTab={setTab} balance={balance} isLoggedIn={isLoggedIn} userId={userId} />;
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
