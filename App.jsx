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
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 全局登录状态
  const [balance, setBalance] = useState(0); // 全局余额状态
  const [userId, setUserId] = useState(null); // 保存 user_id

  // 初始化登录状态，从 localStorage 恢复
  useEffect(() => {
    const savedPhone = localStorage.getItem('phone_number');
    const savedUserId = localStorage.getItem('user_id'); // 获取 user_id
    console.log("恢复登录状态:", { savedPhone, savedUserId }); // 调试用
    if (savedPhone && savedUserId) {
      setIsLoggedIn(true);
      setUserId(savedUserId); // 设置 user_id
    }
  }, []);

  // 新增：全局实时余额订阅和初始查询
  useEffect(() => {
    let realtimeSubscription = null;
    const phoneNumber = localStorage.getItem('phone_number');
    const user_id = localStorage.getItem('user_id'); // 获取 user_id

    const setupBalance = async () => {
      if (!phoneNumber || !user_id) return; // 确保用户已登录

      // 初始查询余额
      const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user_id)
        .single();

      if (error) {
        console.error('Error fetching initial balance:', error);
      } else {
        setBalance(data?.balance || 0);
      }

      // 实时订阅余额变化
      realtimeSubscription = supabase
        .channel('global-balance-updates') 
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user_id}`,
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
  }, []); 

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
        return <RechargePage setTab={setTab} balance={balance} userId={userId} />; // 传递 userId
      case "withdraw":
        return <WithdrawPage setTab={setTab} balance={balance} />;
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
