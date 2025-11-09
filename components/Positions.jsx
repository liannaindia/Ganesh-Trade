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
        const mentor = detail.mentors || {};
        const time = new Date(detail.created_at).toLocaleString(); // 格式化时间

        entrust += amount; // 累加所有amount作为entrusted

        if (detail.order_status === 'Unsettled') {
          posAssets += amount;
          pend.push({
            id: detail.id,
            name: mentor.name || 'Unknown',
            years: mentor.years || 0,
            type: 'Daily Follow',
            amount,
            earnings: '---',
            time,
            status: 'Following',
            img: mentor.img || 'https://randomuser.me/api/portraits/women/65.jpg', // Default image
          });
        } else if (detail.order_status === 'Settled') {
          floatPL += profit;
          const earnings = profit >= 0 ? `+${profit.toFixed(2)}` : profit.toFixed(2);
          comp.push({
            id: detail.id,
            name: mentor.name || 'Unknown',
            years: mentor.years || 0,
            type: 'Completed',
            amount,
            earnings,
            time,
            status: 'Completed',
            img: mentor.img || 'https://randomuser.me/api/portraits/men/51.jpg', // Default image
          });
        } else if (detail.order_status === 'Reject') {
          comp.push({
            id: detail.id,
            name: mentor.name || 'Unknown',
            years: mentor.years || 0,
            type: 'Completed',
            amount,
            earnings: '---', // No earnings for rejected orders
            time,
            status: 'Rejected',
            img: mentor.img || 'https://randomuser.me/api/portraits/men/51.jpg', // Default image
          });
        }
      });

      setPositionAssets(posAssets);
      setFloatingPL(floatPL);
      setEntrusted(entrust);
      setPendingOrders(pend);
      setCompletedOrders(comp);
    };

    fetchCopytradeDetails();

    // 设置实时订阅，监听copytrade_details表的变化
    const subscription = supabase
      .from('copytrade_details')
      .on('INSERT', (payload) => {
        fetchCopytradeDetails();  // 数据插入时重新获取数据
      })
      .on('UPDATE', (payload) => {
        fetchCopytradeDetails();  // 数据更新时重新获取数据
      })
      .on('DELETE', (payload) => {
        fetchCopytradeDetails();  // 数据删除时重新获取数据
      })
      .subscribe();

    // 清理订阅
    return () => {
      supabase.removeSubscription(subscription);
    };

  }, [isLoggedIn, userId, balance, availableBalance]); // 依赖isLoggedIn, userId, balance, availableBalance

  const list = tab === "pending" ? pendingOrders : completedOrders;

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* ===== Title ===== */}
      <div className="mt-3 mb-3 text-center">
        <h2 className="text-lg font-bold text-slate-800 border-b-2 border-yellow-400 inline-block pb-1">
          Positions
        </h2>
      </div>

      {/* ===== Total Assets Card ===== */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
          <span>Total Assets (USDT)</span>
          <span className="text-slate-400 cursor-pointer">👁️</span>
        </div>
        <div className="text-3xl font-extrabold tracking-tight text-slate-900">
          {totalAssets.toLocaleString()}
        </div>

        <div className="grid grid-cols-2 gap-4 text-[13px] text-slate-600 mt-3">
          <div>
            <div>Position Assets</div>
            <div className="font-bold text-slate-800">{positionAssets.toFixed(2)}</div>
          </div>
          <div>
            <div>Floating Profit / Loss</div>
            <div className="font-bold text-slate-800">{floatingPL.toFixed(2)}</div>
          </div>
          <div>
            <div>Available Balance</div>
            <div className="font-bold text-slate-800">{available.toFixed(2)}</div>
          </div>
          <div>
            <div>Entrusted Amount</div>
            <div className="font-bold text-slate-800">{entrusted.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* ===== Tabs: Pending / Completed ===== */}
      <div className="flex items-center border-b border-slate-200 mb-3">
        <button
          onClick={() => setTab("pending")}
          className={`flex-1 text-center py-2 text-sm font-semibold border-b-2 transition ${
            tab === "pending"
              ? "text-yellow-500 border-yellow-500"
              : "text-slate-500 border-transparent"
          }`}
        >
          Pending Orders
        </button>
        <button
          onClick={() => setTab("completed")}
          className={`flex-1 text-center py-2 text-sm font-semibold border-b-2 transition ${
            tab === "completed"
              ? "text-yellow-500 border-yellow-500"
              : "text-slate-500 border-transparent"
          }`}
        >
          Completed
        </button>
      </div>

      {/* ===== Orders List ===== */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {list.map((o) => (
          <div
            key={o.id}
            className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={o.img}
                  alt={o.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-slate-800 text-sm">
                    {o.name}
                  </div>
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
                  Application Time <br />
                  <span className="text-slate-700">{o.time}</span>
                </div>
                <div className="text-right">
                  Order Status <br />
                  <span
                    className={`font-semibold ${
                      o.status === "Following"
                        ? "text-yellow-500"
                        : o.status === "Rejected"
                        ? "text-rose-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {o.status}
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
