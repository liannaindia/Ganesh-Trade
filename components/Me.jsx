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
  const [pnlToday, setPnlToday] = useState(0); // ✅ 新增：当天利润
  const [installPromptEvent, setInstallPromptEvent] = useState(null);

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

    // 捕获安装提示事件
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);  // 保存事件对象
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      supabase.removeChannel(balanceSub);
      supabase.removeChannel(pnlSub);
    };
  }, [userId, isLoggedIn]);

  // 处理安装点击
  const handleInstallClick = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();  // 触发安装提示
      const { outcome } = await installPromptEvent.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setInstallPromptEvent(null); // 清空事件，防止多次弹出
    }
  };

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
      </div>

      {/* ===== Assets Card ===== */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm p-4 mb-5">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
          <span>Total Assets (USDT)</span>
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
      </div>

      {/* ===== Install Banner ===== */}
      {installPromptEvent && (
        <div className="bg-yellow-500 text-white text-center py-2 rounded-lg mb-4">
          <span>📱 Add TradyFi to your Home Screen for full app experience</span>
          <button
            className="ml-3 text-sm font-semibold underline"
            onClick={handleInstallClick}
          >
            Install
          </button>
        </div>
      )}

      {/* ===== Menu List ===== */}
      <div className="space-y-2">
        <div
          className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:bg-slate-50 cursor-pointer transition"
        >
          <Download className="h-5 w-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-800">Download APP</span>
        </div>
      </div>
    </div>
  );
}
