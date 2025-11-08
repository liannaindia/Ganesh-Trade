import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Positions({ userId }) {
  const [tab, setTab] = useState("pending");
  const [totalAssets, setTotalAssets] = useState(0); // 总资产
  const [available, setAvailable] = useState(0); // 可用余额
  const [entrusted, setEntrusted] = useState(0); // 跟单金额
  const [positionAssets, setPositionAssets] = useState(0); // 仓位资产
  const [pendingOrders, setPendingOrders] = useState([]); // 待处理订单
  const [completedOrders, setCompletedOrders] = useState([]); // 已完成订单

  // 获取用户资产信息
  useEffect(() => {
    const fetchUserAssets = async () => {
      try {
        // 从 users 表获取用户的余额信息
        const { data, error } = await supabase
          .from("users")
          .select("balance, available_balance")
          .eq("id", userId)
          .single(); // 获取单条记录

        if (error) {
          console.error("获取用户资产失败:", error);
        } else {
          setTotalAssets(data.balance || 0); // 设置总资产
          setAvailable(data.available_balance || 0); // 设置可用余额
        }
      } catch (error) {
        console.error("获取用户资产失败:", error);
      }
    };

    // 获取用户的跟单信息
    const fetchCopyTrades = async () => {
      try {
        // 从 copytrades 表获取用户的跟单信息
        const { data, error } = await supabase
          .from("copytrades")
          .select("*")
          .eq("user_id", userId); // 按用户ID获取数据

        if (error) {
          console.error("获取跟单信息失败:", error);
        } else {
          // 计算跟单金额（Entrusted Amount）和仓位资产（Position Assets）
          const entrustedAmount = data.reduce((total, item) => {
            return total + (item.status === "approved" ? item.amount : 0); // 仅计算已批准的金额
          }, 0);

          const positionAssets = data.reduce((total, item) => {
            return total + (item.status === "approved" && item.settled === false ? item.amount : 0); // 已批准未结算的金额
          }, 0);

          setEntrusted(entrustedAmount); // 设置委托金额
          setPositionAssets(positionAssets); // 设置仓位资产
          setPendingOrders(data.filter((item) => item.status === "pending")); // 设置待处理订单
          setCompletedOrders(data.filter((item) => item.status === "completed")); // 设置已完成订单
        }
      } catch (error) {
        console.error("获取跟单信息失败:", error);
      }
    };

    // 执行数据获取
    fetchUserAssets();
    fetchCopyTrades();
  }, [userId]);

  const list = tab === "pending" ? pendingOrders : completedOrders;

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* ===== 顶部标题 ===== */}
      <div className="mt-3 mb-3 text-center">
        <h2 className="text-lg font-bold text-slate-800 border-b-2 border-yellow-400 inline-block pb-1">
          Positions
        </h2>
      </div>

      {/* ===== 总资产卡片 ===== */}
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
            <div>Entrusted Amount</div>
            <div className="font-bold text-slate-800">{entrusted.toFixed(2)}</div>
          </div>
          <div>
            <div>Available Balance</div>
            <div className="font-bold text-slate-800">{available.toFixed(2)}</div>
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
          Completed Orders
        </button>
      </div>

      {/* ===== 订单列表 ===== */}
      <div className="space-y-3">
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
                    {o.user_phone_number || "无"}
                  </div>
                  <div className="text-[12px] text-slate-500">
                    Investment Experience {o.mentor_id} years
                  </div>
                </div>
              </div>
              <span className="text-[11px] bg-yellow-100 text-yellow-600 px-2 py-[2px] rounded-md font-medium">
                {o.status}
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
                <div className="font-semibold text-slate-700">
                  {o.earnings || "---"}
                </div>
              </div>
              <div className="col-span-2 flex justify-between mt-2 text-[12px]">
                <div>
                  Application time <br />
                  <span className="text-slate-700">{o.created_at}</span>
                </div>
                <div className="text-right">
                  Order status <br />
                  <span
                    className={`font-semibold ${
                      o.status === "pending"
                        ? "text-yellow-500"
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
