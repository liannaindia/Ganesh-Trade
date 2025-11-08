import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Positions({ isLoggedIn, balance, availableBalance, userId }) {
  const [tab, setTab] = useState("pending");
  const [totalAssets, setTotalAssets] = useState(0);
  const [positionAssets, setPositionAssets] = useState(0);
  const [floatingPL, setFloatingPL] = useState(0);
  const [available, setAvailable] = useState(0);
  const [entrusted, setEntrusted] = useState(0);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    setTotalAssets(balance || 0);
    setAvailable(availableBalance || 0);
    fetchCopytradeDetails();

    // 实时订阅 copytrade_details 变化
    const subscription = supabase
      .channel(`positions-user-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "copytrade_details",
          filter: `user_id=eq.${userId}`,
        },
        () => fetchCopytradeDetails()
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [isLoggedIn, userId, balance, availableBalance]);

  const fetchCopytradeDetails = async () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

    const { data: details, error } = await supabase
      .from("copytrade_details")
      .select(`
        id, amount, order_profit_amount, order_status, created_at, mentor_id,
        mentors (name, years, img)
      `)
      .eq("user_id", userId)
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd);

    if (error) {
      console.error("获取订单失败:", error);
      return;
    }

    let posAssets = 0;
    let floatPL = 0;
    let entrust = 0;
    const pend = [];
    const comp = [];

    details.forEach((detail) => {
      const amount = parseFloat(detail.amount) || 0;
      const profit = parseFloat(detail.order_profit_amount) || 0;
      const mentor = detail.mentors || { name: "未知导师", years: 0, img: "" };
      const status = detail.order_status || "Pending";

      entrust += amount;
      posAssets += amount;
      floatPL += profit;

      const time = new Date(detail.created_at).toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      const earnings = profit > 0
        ? `+${profit.toFixed(2)}`
        : profit < 0
        ? `${profit.toFixed(2)}`
        : "0.00";

      const order = {
        img: mentor.img || "/default-avatar.png",
        name: mentor.name,
        years: mentor.years,
        type: "Copy Trade",
        amount,
        earnings,
        time,
        status: status,
        rawStatus: status, // 用于分类
      };

      // 分类逻辑：pending/Following → Pending；Settled/rejected → Completed
      if (["pending", "Following"].includes(status)) {
        pend.push(order);
      } else {
        comp.push(order);
      }
    });

    setPositionAssets(posAssets);
    setFloatingPL(floatPL);
    setEntrusted(entrust);
    setPendingOrders(pend);
    setCompletedOrders(comp);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Following":
        return "text-yellow-500";
      case "Settled":
        return "text-emerald-600";
      case "rejected":
        return "text-rose-600"; // 拒绝红色
      default:
        return "text-slate-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending": return "Pending";
      case "Following": return "Following";
      case "Settled": return "Settled";
      case "rejected": return "Rejected";
      default: return status;
    }
  };

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      <div className="flex justify-between items-center mt-4 mb-3">
        <h2 className="text-lg font-bold text-slate-800">Positions</h2>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm p-4 mb-5">
        <div className="text-sm text-slate-500 mb-1">Total Assets (USDT)</div>
        <div className="text-3xl font-extrabold text-slate-900">
          {totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-[13px] text-slate-600">
          <div>
            <div>Position Assets</div>
            <div className="font-bold text-slate-800">{positionAssets.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div>Floating P/L</div>
            <div className={`font-bold ${floatingPL >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {floatingPL >= 0 ? "+" : ""}{floatingPL.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div>Available</div>
            <div className="font-bold text-slate-800">{available.toLocaleString()}</div>
          </div>
          <div className="col-span-3 text-center mt-2">
            <div>Entrusted</div>
            <div className="font-bold text-slate-800">{entrusted.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="flex mb-5 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <button
          onClick={() => setTab("pending")}
          className={`flex-1 py-3 text-sm font-medium transition ${
            tab === "pending" ? "bg-orange-500 text-white" : "text-slate-600"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`flex-1 py-3 text-sm font-medium transition ${
            tab === "completed" ? "bg-orange-500 text-white" : "text-slate-600"
          }`}
        >
          Completed
        </button>
      </div>

      <div className="space-y-4">
        {(tab === "pending" ? pendingOrders : completedOrders).map((o, i) => (
          <div key={i} className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <img
                  src={o.img}
                  alt={o.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                />
                <div>
                  <div className="font-semibold text-slate-800">{o.name}</div>
                  <div className="text-[12px] text-slate-500">
                    {o.years} years experience
                  </div>
                </div>
              </div>
              <span className="text-[11px] bg-yellow-100 text-yellow-600 px-2 py-[2px] rounded-md font-medium">
                {o.type}
              </span>
            </div>

            <div className="grid grid-cols-2 mt-2 text-[12px] text-slate-500">
              <div>
                <div>Investment</div>
                <div className="font-semibold text-slate-800">
                  {o.amount.toLocaleString()} <span className="text-[11px]">USDT</span>
                </div>
              </div>
              <div className="text-right">
                <div>Earnings</div>
                <div className={`font-semibold ${o.earnings.startsWith("+") ? "text-emerald-600" : o.earnings.startsWith("-") ? "text-rose-600" : "text-slate-700"}`}>
                  {o.earnings}
                </div>
              </div>
              <div className="col-span-2 flex justify-between mt-2 text-[12px]">
                <div>
                  Time <br />
                  <span className="text-slate-700">{o.time}</span>
                </div>
                <div className="text-right">
                  Status <br />
                  <span className={`font-semibold ${getStatusColor(o.rawStatus)}`}>
                    {getStatusLabel(o.rawStatus)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
