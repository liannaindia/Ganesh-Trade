import React, { useState } from "react";

export default function Positions() {
  const [tab, setTab] = useState("pending");

  // ===== 模拟资产总览数据 =====
  const totalAssets = 10012.06;
  const positionAssets = 0.0;
  const floatingPL = 0.0;
  const available = 8912.06;
  const entrusted = 1100.0;

  // ===== 模拟订单数据 =====
  const pendingOrders = [
    {
      id: 1,
      name: "alessia",
      years: 15,
      type: "Daily Follow",
      amount: 100.0,
      earnings: "---",
      time: "2025-11-02 00:38:13",
      status: "Following",
      img: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      id: 2,
      name: "alessia",
      years: 15,
      type: "Daily Follow",
      amount: 1000.0,
      earnings: "---",
      time: "2025-11-01 16:00:12",
      status: "Following",
      img: "https://randomuser.me/api/portraits/women/65.jpg",
    },
  ];

  const completedOrders = [
    {
      id: 3,
      name: "特朗朗",
      years: 11,
      type: "Completed",
      amount: 500.0,
      earnings: "+25.00",
      time: "2025-10-30 18:42:33",
      status: "Completed",
      img: "https://randomuser.me/api/portraits/men/51.jpg",
    },
  ];

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
          Pending Order
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
                  Application time <br />
                  <span className="text-slate-700">{o.time}</span>
                </div>
                <div className="text-right">
                  Order status <br />
                  <span
                    className={`font-semibold ${
                      o.status === "Following"
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
