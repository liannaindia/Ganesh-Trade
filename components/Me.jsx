import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Eye,
  Settings,
  Wallet,
  ArrowDownCircle,
  FileText,
  UserCheck,
  Bell,
  Download,
} from "lucide-react";
import { supabase } from "../supabaseClient";

export default function Me({ setTab, userId, isLoggedIn }) {
  const [balance, setBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [pnlToday, setPnlToday] = useState(0); // ✅ 当天利润
  const [installPromptEvent, setInstallPromptEvent] = useState(null); // ✅ PWA 事件对象

  // ✅ 监听 beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e); // 保存事件对象
      console.log("✅ PWA 安装提示已捕获，可在按钮点击时触发安装");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // ✅ 点击立即触发安装
  const handleInstallApp = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt(); // 触发系统安装弹窗
      const { outcome } = await installPromptEvent.userChoice;
      console.log(`📲 用户选择结果: ${outcome}`);
      setInstallPromptEvent(null); // 防止重复触发
    } else {
      console.log("⚠️ 未捕获安装事件，请通过浏览器菜单手动添加到主屏幕");
    }
  };

  // ✅ 计算当天利润（印度时区）
  const calculateTodayPnL = async (uid) => {
    try {
      const indiaTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });
      const indiaDate = new Date(indiaTime);
      const startOfDay = new Date(indiaDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(indiaDate);
      endOfDay.setHours(23, 59, 59, 999);

      const startUTC = new Date(startOfDay.toISOString());
      const endUTC = new Date(endOfDay.toISOString());

      const { data, error } = await supabase
        .from("copytrade_details")
        .select("order_profit_amount")
        .eq("user_id", uid)
        .eq("status", "settled")
        .gte("created_at", startUTC.toISOString())
        .lte("created_at", endUTC.toISOString());

      if (error) {
        console.error("Error fetching today's PnL:", error);
        return;
      }

      const totalProfit = data.reduce(
        (sum, row) => sum + (parseFloat(row.order_profit_amount) || 0),
        0
      );
      setPnlToday(totalProfit);
    } catch (err) {
      console.error("Error calculating today's PnL:", err);
    }
  };

  // ✅ 实时获取用户余额 + PnL
  useEffect(() => {
    if (!isLoggedIn || !userId) {
      setLoading(false);
      return;
    }

    const fetchBalance = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("balance, available_balance")
          .eq("id", userId)
          .single();

        if (error) throw error;

        setBalance(data.balance || 0);
        setAvailableBalance(data.available_balance || 0);

        // 首次计算当天利润
        await calculateTodayPnL(userId);
      } catch (err) {
        console.error("Failed to fetch balance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // ✅ 实时订阅用户余额变化
    const balanceSub = supabase
      .channel(`user-balance-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setBalance(payload.new.balance || 0);
          setAvailableBalance(payload.new.available_balance || 0);
        }
      )
      .subscribe();

    // ✅ 实时订阅 copytrade_details 表，当状态为 settled 时更新 PnL
    const pnlSub = supabase
      .channel(`pnl-today-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "copytrade_details",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.new?.status === "settled") {
            await calculateTodayPnL(userId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(balanceSub);
      supabase.removeChannel(pnlSub);
    };
  }, [userId, isLoggedIn]);

  const handleRefresh = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("balance, available_balance")
        .eq("id", userId)
        .single();
      if (error) throw error;
      setBalance(data.balance || 0);
      setAvailableBalance(data.available_balance || 0);
      await calculateTodayPnL(userId);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    return Number(num).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* ===== Header ===== */}
      <div className="flex justify-center items-center mt-4 mb-3 relative">
        <h2 className="text-lg font-bold text-slate-800 text-center">Me</h2>
        <div className="absolute right-0 flex items-center gap-3 text-slate-500">
          <RefreshCw
            className="h-5 w-5 cursor-pointer hover:text-slate-700 transition"
            onClick={handleRefresh}
          />
          <Settings className="h-5 w-5 cursor-pointer hover:text-slate-700 transition" />
        </div>
      </div>

      {/* ===== Assets Card ===== */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm p-4 mb-5">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
          <span>Total Assets (USDT)</span>
          <Eye
            className={`h-4 w-4 cursor-pointer transition ${
              showBalance ? "text-slate-600" : "text-slate-400"
            }`}
            onClick={() => setShowBalance(!showBalance)}
          />
        </div>

        <div className="text-3xl font-extrabold tracking-tight text-slate-900">
          {loading ? (
            <span className="animate-pulse">...</span>
          ) : showBalance ? (
            formatNumber(balance)
          ) : (
            "••••••"
          )}
        </div>

        <div className="flex justify-between mt-3 text-[13px] text-slate-600">
          <div>
            <div>Available Balance</div>
            <div className="font-bold text-slate-800">
              {loading ? "..." : showBalance ? formatNumber(availableBalance) : "••••••"}
            </div>
          </div>
          <div className="text-right">
            <div>PnL Today</div>
            <div
              className={`font-bold ${
                pnlToday > 0
                  ? "text-emerald-600"
                  : pnlToday < 0
                  ? "text-rose-600"
                  : "text-slate-800"
              }`}
            >
              {loading
                ? "..."
                : showBalance
                ? `${pnlToday >= 0 ? "+" : ""}${formatNumber(pnlToday)}`
                : "••••••"}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Recharge / Withdraw Buttons ===== */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => setTab("recharge")}
          className="flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-200 py-4 shadow-sm hover:bg-slate-50 transition"
        >
          <Wallet className="h-6 w-6 text-blue-500 mb-1" />
          <span className="text-sm font-semibold text-slate-800">Recharge</span>
        </button>

        <button
          onClick={() => setTab("withdraw")}
          className="flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-200 py-4 shadow-sm hover:bg-slate-50 transition"
        >
          <ArrowDownCircle className="h-6 w-6 text-orange-500 mb-1" />
          <span className="text-sm font-semibold text-slate-800">Withdraw</span>
        </button>
      </div>

      {/* ===== Menu List ===== */}
      <div className="space-y-2">
        {[
          {
            icon: <FileText className="h-5 w-5 text-slate-600" />,
            label: "Follow Order",
            tab: "positions",
          },
          {
            icon: <FileText className="h-5 w-5 text-slate-600" />,
            label: "Transactions",
            tab: null,
          },
          {
            icon: <UserCheck className="h-5 w-5 text-yellow-600" />,
            label: "Agent Center",
            tab: "invite",
          },
          {
            icon: <Bell className="h-5 w-5 text-slate-600" />,
            label: "Notification",
            tab: null,
          },
          {
            icon: <Download className="h-5 w-5 text-slate-600" />,
            label: "Download APP",
            onClick: handleInstallApp, // ✅ 点击立即触发安装
          },
        ].map((item, i) => (
          <div
            key={i}
            onClick={item.onClick || (() => item.tab && setTab(item.tab))}
            className={`flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:bg-slate-50 cursor-pointer transition ${
              item.tab ? "" : "opacity-70"
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-sm font-medium text-slate-800">{item.label}</span>
            </div>
            <span className="text-slate-400">{">"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
