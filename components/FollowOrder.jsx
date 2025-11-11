import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function FollowOrder({ setTab, userId, isLoggedIn }) {
  const [activeTab, setActiveTab] = useState("completed"); // "active" | "completed"
  const [activeOrders, setActiveOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [mentorsMap, setMentorsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchOrders(), fetchMentorsMap()]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    loadAll();

    // realtime: copytrade_details for this user
    const sub = supabase
      .channel(`follow-orders-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "copytrade_details", filter: `user_id=eq.${userId}` },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [isLoggedIn, userId]);

  // fetch mentors and build map
  const fetchMentorsMap = async () => {
    const { data, error } = await supabase.from("mentors").select("id, name");
    if (error) {
      console.error("Error fetching mentors:", error);
      return;
    }
    const map = {};
    (data || []).forEach((m) => (map[m.id] = m.name));
    setMentorsMap(map);
  };

  // fetch orders (active + completed)
  const fetchOrders = async () => {
    try {
      const [
        { data: act, error: e1 },
        { data: comp, error: e2 },
      ] = await Promise.all([
        supabase
          .from("copytrade_details")
          .select("id, amount, mentor_id, mentor_commission, order_profit_amount, status, created_at, updated_at, stock_id, copytrade_id")
          .eq("user_id", userId)
          .in("status", ["pending", "approved"])
          .order("updated_at", { ascending: false }),
        supabase
          .from("copytrade_details")
          .select("id, amount, mentor_id, mentor_commission, order_profit_amount, status, created_at, updated_at, stock_id, copytrade_id")
          .eq("user_id", userId)
          .in("status", ["settled", "rejected"])
          .order("updated_at", { ascending: false }),
      ]);

      if (e1) throw e1;
      if (e2) throw e2;

      setActiveOrders(act || []);
      setCompletedOrders(comp || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchOrders(), fetchMentorsMap()]);
    setRefreshing(false);
  };

  const formatDate = (ts) =>
    new Date(ts).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusPill = (status) => {
    const base = "text-xs px-2 py-0.5 rounded-full font-semibold";
    if (status === "settled") return `${base} bg-emerald-50 text-emerald-600 border border-emerald-200`;
    if (status === "approved") return `${base} bg-blue-50 text-blue-600 border border-blue-200`;
    if (status === "pending") return `${base} bg-amber-50 text-amber-600 border border-amber-200`;
    if (status === "rejected") return `${base} bg-rose-50 text-rose-600 border border-rose-200`;
    return `${base} bg-slate-50 text-slate-600 border border-slate-200`;
  };

  const rows = useMemo(() => (activeTab === "active" ? activeOrders : completedOrders), [activeTab, activeOrders, completedOrders]);

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mt-4 mb-3 relative">
        <ArrowLeft className="h-5 w-5 text-slate-600 cursor-pointer" onClick={() => setTab("me")} />
        <h2 className="flex-1 text-center text-lg font-bold text-slate-800">Follow Orders</h2>
        <RefreshCw
          className={`h-5 w-5 absolute right-0 cursor-pointer ${refreshing ? "animate-spin text-blue-500" : "text-slate-600"}`}
          onClick={handleRefresh}
        />
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-0 mb-4">
        <button
          className={`py-2 text-sm font-semibold border rounded-l-xl ${
            activeTab === "active" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-300"
          }`}
          onClick={() => setActiveTab("active")}
        >
          Active
        </button>
        <button
          className={`py-2 text-sm font-semibold border rounded-r-xl ${
            activeTab === "completed" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-300"
          }`}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center text-slate-500 mt-10 animate-pulse">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="text-center text-slate-400 text-sm mt-10">
          No {activeTab === "active" ? "active" : "completed"} orders.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((o) => (
            <div key={o.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              {/* 顶部：订单ID & 盈亏 */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Order ID: {o.id}</span>
                <span
                  className={`text-sm font-bold ${
                    (o.status === "settled" ? o.order_profit_amount : 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                  title="PnL"
                >
                  {o.status === "settled" ? `${o.order_profit_amount >= 0 ? "+" : ""}${Number(o.order_profit_amount).toFixed(2)} USDT` : "--"}
                </span>
              </div>

              {/* 导师名 & 状态 */}
              <div className="mt-1 flex justify-between items-center">
                <div className="text-sm font-semibold text-slate-800">
                  Mentor: {mentorsMap[o.mentor_id] || "Unknown"}
                </div>
                <span className={statusPill(o.status)}>{o.status.toUpperCase()}</span>
              </div>

              {/* 基础信息 */}
              <div className="grid grid-cols-2 gap-2 text-sm mt-3 text-slate-700">
                <div>Amount: <span className="font-semibold">{Number(o.amount).toFixed(2)} USDT</span></div>
                <div>Commission: <span className="font-semibold">{o.mentor_commission}%</span></div>
                <div>Created: {formatDate(o.created_at)}</div>
                <div>Updated: {formatDate(o.updated_at)}</div>
              </div>

              {/* 关联标识（可选显示） */}
              <div className="mt-2 text-xs text-slate-500">
                {o.copytrade_id ? <span className="mr-3">Copytrade ID: {o.copytrade_id}</span> : null}
                {o.stock_id ? <span>Stock ID: {o.stock_id}</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
