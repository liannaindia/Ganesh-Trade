// App.jsx
import React, { useState, useEffect } from "react";
import HomePage from "./components/Home.jsx";
import RechargePage from "./components/Recharge.jsx";
import LoginPage from "./components/Login.jsx";
import BottomNav from "./BottomNav";
import { supabase } from "./supabaseClient";

export default function App() {
  const [tab, setTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);
  const [realtimeChannel, setRealtimeChannel] = useState(null);

  // 恢复登录状态
  useEffect(() => {
    const phone = localStorage.getItem('phone_number');
    const uid = localStorage.getItem('user_id');

    console.log("App 启动，localStorage:", { phone, uid });

    if (phone && uid) {
      setIsLoggedIn(true);
      setUserId(uid);
    }
  }, []);

  // 只有登录后才订阅余额
  useEffect(() => {
    if (!isLoggedIn || !userId) {
      // 清理旧订阅
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        setRealtimeChannel(null);
      }
      return;
    }

    let channel = null;

    const setupRealtime = async () => {
      // 初始余额
      const { data } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

      if (data) setBalance(data.balance || 0);

      // 实时订阅
      channel = supabase
        .channel(`balance-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${userId}`,
          },
          (payload) => {
            console.log("Realtime 余额更新:", payload.new.balance);
            setBalance(payload.new.balance || 0);
          }
        )
        .subscribe((status) => {
          console.log("Realtime 订阅状态:", status);
        });

      setRealtimeChannel(channel);
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isLoggedIn, userId]);

  const renderPage = () => {
    switch (tab) {
      case "recharge":
        return <RechargePage setTab={setTab} balance={balance} isLoggedIn={isLoggedIn} userId={userId} />;
      case "login":
        return <LoginPage setTab={setTab} setIsLoggedIn={setIsLoggedIn} />;
      default:
        return <HomePage setTab={setTab} isLoggedIn={isLoggedIn} balance={balance} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen">
        {renderPage()}
      </div>
      <div className="max-w-md mx-auto w-full fixed bottom-0 left-0 right-0 bg-white border-t">
        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </div>
  );
}
