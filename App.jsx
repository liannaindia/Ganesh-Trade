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
import { supabase } from "./supabaseClient"; // 新增：引入 supabase（调整路径如果不同）

export default function App() {
  const [tab, setTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 全局登录状态
  const [balance, setBalance] = useState(0); // 新增：全局余额状态

  // 初始化登录状态，从 localStorage 恢复
  useEffect(() => {
    const savedPhone = localStorage.getItem('phone_number');
    if (savedPhone) {
      setIsLoggedIn(true);
    }
  }, []);

  // 新增：全局实时余额订阅和初始查询
  useEffect(() => {
    let realtimeSubscription = null;
    const phoneNumber = localStorage.getItem('phone_number');

    const setupBalance = async () => {
      if (!phoneNumber) return;

      // 初始查询余额
      const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('phone_number', phoneNumber)
        .single();

      if (error) {
        console.error('Error fetching initial balance:', error);
      } else {
        setBalance(data?.balance || 0);
      }

      // 实时订阅余额变化
      realtimeSubscription = supabase
        .channel('global-balance-updates') // 全局 channel 名
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `phone_number=eq.${phoneNumber}`,
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

    // 清理订阅
    return () => {
      if (realtimeSubscription) {
        supabase.removeChannel(realtimeSubscription);
      }
    };
  }, []); // 空依赖：只订阅一次

  // 页面渲染逻辑
  const renderPage = () => {
    switch (tab) {
      case "markets":
        return <MarketsPage setTab={setTab} />;
      case "login":
        return <LoginPage setTab={setTab} setIsLoggedIn={setIsLoggedIn} />;
      case "register":
        return <RegisterPage setTab={setTab} setIsLoggedIn={setIsLoggedIn} />;
      case "trade":
        return <TradePage setTab={setTab} isLoggedIn={isLoggedIn} balance={balance}/>;
      case "positions":
        return <PositionsPage setTab={setTab} isLoggedIn={isLoggedIn} balance={balance}  />;
      case "me":
        return <MePage setTab={setTab} isLoggedIn={isLoggedIn} balance={balance} />;
      case "recharge":
        return <RechargePage setTab={setTab} isLoggedIn={isLoggedIn} balance={balance} />; // 示例：如果 Recharge 需要余额
      case "withdraw":
        return <WithdrawPage setTab={setTab} isLoggedIn={isLoggedIn} balance={balance} />; // 示例：如果 Withdraw 需要余额
      case "invite":
        return <InvitePage setTab={setTab} isLoggedIn={isLoggedIn} />;
      default:
        return <HomePage setTab={setTab} isLoggedIn={isLoggedIn} balance={balance} />; // 新增：传递 balance
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
