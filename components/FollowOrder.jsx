import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function FollowOrder({ setTab, userId, isLoggedIn }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;
    fetchOrders();

    // ✅ 实时订阅 copytrade_details 表
    const orderSub = supabase
      .channel(`follow-orders-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "copytrade_details",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSub);
    };
  }, [isLoggedIn, userId]);

  // ✅ 获取结算订单
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("copytrade_details")
        .select(
          `
          id,
          amount,
          mentor_commission,
          order_profit_amount,
          status,
          created_at,
          updated_at,
          mentor_id,
          mentors(name)
        `
        )
        .eq("user_id", userId)
        .eq("status", "settled")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  const formatDate = (ts) => {
    const date = new Date(ts);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* ===== Header ===== */}
      <div className="flex items-center mt-4 mb-3 relative">
        <ArrowLeft
          className="h-5 w-5 text-slate-600 cursor-pointer"
          onClick={() => setTab("me")}
        />
        <h2 className="flex-1 text-center text-lg font-bold text-slate-800">
          Follow Orders
        </h2>
        <RefreshCw
          className={`h-5 w-5 absolute right-0 cursor-pointer ${
            refreshing ? "animate-spin text-blue-500" : "text-slate-600"
          }`}
          onClick={handleRefresh}
        />
      </div>

      {/* ===== Orders List ===== */}
      {loading ? (
        <div className="text-center text-slate-500 mt-10 animate-pulse">
          Loading...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-slate-400 text-sm mt-10">
          No settled orders found.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-500">Order ID: {order.id}</span>
                <span
                  className={`text-xs font-bold ${
                    order.order_profit_amount >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {order.order_profit_amount >= 0 ? "+" : ""}
                  {Number(order.order_profit_amount).toFixed(2)} USDT
                </span>
              </div>

              <div className="text-sm font-semibold text-slate-800">
                Mentor: {order.mentors?.name || "Unknown"}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mt-2 text-slate-600">
                <div>Amount: {Number(order.amount).toFixed(2)} USDT</div>
                <div>Commission: {order.mentor_commission}%</div>
                <div>Status: 
                  <span className="ml-1 text-green-600 font-medium">
                    {order.status}
                  </span>
                </div>
                <div>Created: {formatDate(order.created_at)}</div>
                <div>Updated: {formatDate(order.updated_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== 手动刷新提示 ===== */}
      {refreshing && (
        <div className="text-center text-blue-500 text-sm mt-3 animate-pulse">
          Refreshing...
        </div>
      )}
    </div>
  );
}
