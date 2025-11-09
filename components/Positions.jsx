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

    // 初始化从父组件传来的余额
    setTotalAssets(balance || 0);
    setAvailable(availableBalance || 0);

    const fetchCopytradeDetails = async () => {
      try {
        // 定义当天日期范围（UTC 0点 ~ 23:59:59）
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

        const { data: details, error: detailsError } = await supabase
          .from('copytrade_details')
          .select(`
            id,
            amount,
            order_profit_amount,
            order_status,
            status,
            created_at,
            mentor_id,
            mentors (name, years, img)
          `)
          .eq('user_id', userId)
          .gte('created_at', todayStart)
          .lte('created_at', todayEnd);

        if (detailsError) {
          console.error('Error fetching copytrade details:', detailsError);
          return;
        }

        // 初始化汇总变量
        let posAssets = 0;
        let floatPL = 0;
        let entrust = 0;
        const pend = [];
        const comp = [];

        details.forEach((detail) => {
          const amount = parseFloat(detail.amount) || 0;
          const profit = parseFloat(detail.order_profit_amount) || 0;
          const mentor = detail.mentors || {};
          const time = new Date(detail.created_at).toLocaleString();

          entrust += amount; // 累计委托金额

          // 判断订单状态
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
              img: mentor.img || 'https://randomuser.me/api/portraits/women/65.jpg',
            });
          } else if (detail.order_status === 'Settled' || detail.status === 'Reject') {
            // 处理 Settled 或 status 为 Reject 的订单
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
              status: 'Rejected', // 标记为已拒绝
              img: mentor.img || 'https://randomuser.me/api/portraits/men/51.jpg',
            });
          } else if (detail.order_status === 'Reject' || detail.status === 'Reject') {
            // 如果 status 为 Reject，也视为“已拒绝”状态
            comp.push({
              id: detail.id,
              name: mentor.name || 'Unknown',
              years: mentor.years || 0,
              type: 'Completed',
              amount,
              earnings: '---',
              time,
              status: 'Rejected',
              img: mentor.img || 'https://randomuser.me/api/portraits/men/51.jpg',
            });
          }
        });

        // 更新状态
        setPositionAssets(posAssets);
        setFloatingPL(floatPL);
        setEntrusted(entrust);
        setPendingOrders(pend);
        setCompletedOrders(comp);
      } catch (err) {
        console.error('Unexpected error in fetchCopytradeDetails:', err);
      }
    };

    // 初次加载
    fetchCopytradeDetails();

    // === 实时订阅（Supabase v2+ 正确写法）===
    const channel = supabase
      .channel(`copytrade-details-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // 监听所有变化：INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'copytrade_details',
          filter: `user_id=eq.${userId}`, // 只监听当前用户
        },
        (payload) => {
          console.log('Realtime change:', payload);
          fetchCopytradeDetails(); // 任一变化都重新拉取数据
        }
      )
      .subscribe((status, error) => {
        if (error) {
          console.error('Subscription error:', error);
        } else {
          console.log('Subscription status:', status); // subscribed, closed, etc.
        }
      });

    // === 清理函数：组件卸载时取消订阅 ===
    return () => {
      supabase.removeChannel(channel).catch((err) => {
        console.warn('Error removing channel:', err);
      });
    };
  }, [isLoggedIn, userId, balance, availableBalance]);

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
          <span className="text-slate-400 cursor-pointer">Eye</span>
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
        {list.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            No {tab === "pending" ? "pending" : "completed"} orders
          </div>
        ) : (
          list.map((o) => (
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
          ))
        )}
      </div>
    </div>
  );
}
