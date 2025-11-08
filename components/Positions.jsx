import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient"; // 引入supabase客户端

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
    if (!isLoggedIn || !userId) {
      return;
    }

    // 使用从App传递的balance和availableBalance
    setTotalAssets(balance || 0);
    setAvailable(availableBalance || 0);

    const fetchCopytradeDetails = async () => {
      // 定义当天日期范围（使用当前日期动态计算）
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

      // 查询copytrade_details，当天数据，联表mentors
      const { data: details, error: detailsError } = await supabase
        .from('copytrade_details')
        .select(`id, amount, order_profit_amount, order_status, created_at, mentor_id, mentors (name, years, img)`)
        .eq('user_id', userId)
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      if (detailsError) {
        console.error('Error fetching copytrade details:', detailsError);
        return;
      }

      // 计算汇总
      let posAssets = 0;
      let floatPL = 0;
      let entrust = 0; // 假设entrusted为所有amount总和
      const pend = [];
      const comp = [];

      details.forEach((detail) => {
        const amount = parseFloat(detail.amount) || 0;
        const profit = parseFloat(detail.order_profit_amount) || 0;
        const mentor = detail.mentors || { name: "未知导师", years: 0, img: "" };

        // 计算汇总值
        entrust += amount;
        posAssets += amount;
        floatPL += profit;

        // 格式化时间
        const time = new Date(detail.created_at).toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        // 格式化收益显示
        const earnings = profit > 0 
          ? `+${profit.toFixed(2)} (+${((profit / amount) * 100).toFixed(2)}%)`
          : profit < 0 
          ? `${profit.toFixed(2)} (${((profit / amount) * 100).toFixed(2)}%)`
          : "0.00 (0.00%)";

        const order = {
          img: mentor.img,
          name: mentor.name,
          years: mentor.years,
          type: "Following", // 假设类型
          amount,
          earnings,
          time,
          status: detail.order_status || "Pending", // 使用 order_status
        };

        // 分类逻辑：pending/Following → Pending；其他（包括 rejected/Settled）→ Completed
        if (["pending", "Following"].includes(detail.order_status)) {
          pend.push(order);
        } else {
          comp.push(order); // rejected, Settled, etc.
        }
      });

      setPositionAssets(posAssets);
      setFloatingPL(floatPL);
      setEntrusted(entrust);

      setPendingOrders(pend);
      setCompletedOrders(comp);
    };

    fetchCopytradeDetails();

    // 实时订阅 copytrade_details 变化
    const subscription = supabase
      .channel('copytrade_details_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'copytrade_details',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('Copytrade details changed:', payload);
        fetchCopytradeDetails(); // 刷新数据
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [isLoggedIn, userId, balance, availableBalance]);

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      <div className="flex justify-between items-center mt-4 mb-3">
        <h2 className="text-lg font-bold text-slate-800">Positions</h2>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm p-4 mb-5">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
          <span>Total Assets (USDT)</span>
        </div>
        <div className="text-3xl font-extrabold tracking-tight text-slate-900">
          {totalAssets.toLocaleString()}
        </div>
        <div className="flex justify-between mt-3 text-[13px] text-slate-600">
          <div>
            <div>Available Balance</div>
            <div className="font-bold text-slate-800">{available.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div>PnL Today</div>
            <div className="font-bold text-slate-800">{floatingPL.toFixed(2)} / 0%</div>
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
          Pending Orders
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`flex-1 py-3 text-sm font-medium transition ${
            tab === "completed" ? "bg-orange-500 text-white" : "text-slate-600"
          }`}
        >
          Completed Orders
        </button>
      </div>

      <div className="space-y-4">
        {(tab === "pending" ? pendingOrders : completedOrders).map((o, i) => (
          <div
            key={i}
            className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <img
                  src={o.img}
                  alt={o.name}
                  className="w-10 h-10 rounded-full border border-slate-300"
                />
                <div>
                  <div className="font-semibold text-slate-800">{o.name}</div>
                  <div className="text-[12px] text-slate-500">
                    Investment Experience {o.years} years
                  </div>
                </div>
              </div>
              <span className="text-[11px] bg-yellow-100 text-yellow-600 px-2 py-[2px] rounded-md font-medium">
                {o.type}
              </span>
            </div>

            <div className="grid grid-cols-2 mt-2 text-[12px] text-slate-500">
              <div>
                <div>Investment Amount</div>
                <div className="font-semibold text-slate-800">
                  {o.amount.toLocaleString()} <span className="text-[11px]">USDT</span>
                </div>
              </div>
              <div className="text-right">
                <div>Order Earnings</div>
                <div
                  className={`font-semibold ${
                    o.earnings.startsWith("+")
                      ? "text-emerald-600"
                      : o.earnings.startsWith("-")
                      ? "text-rose-600"
                      : "text-slate-700"
                  }`}
                >
                  {o.earnings}
                </div>
              </div>
              <div className="col-span-2 flex justify-between mt-2 text-[12px]">
                <div>
                  Application time <br />
                  <span className="text-slate-700">{o.time}</span>
                </div>
                <div className="text-right">
                  Order status <br />
                  <span
                    className={`font-semibold ${
                      o.status === "Following"
                        ? "text-yellow-500"
                        : o.status === "rejected"
                        ? "text-rose-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {o.status === "rejected" ? "Rejected" : o.status}
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
