import React from "react";
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

export default function Me() {
  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center mt-4 mb-3">
        <h2 className="text-lg font-bold text-slate-800">Me</h2>
        <div className="flex items-center gap-3 text-slate-500">
          <RefreshCw className="h-5 w-5 cursor-pointer" />
          <Settings className="h-5 w-5 cursor-pointer" />
        </div>
      </div>

      {/* ===== Assets Card ===== */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm p-4 mb-5">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
          <span>Total Assets (USDT)</span>
          <Eye className="h-4 w-4 text-slate-400 cursor-pointer" />
        </div>
        <div className="text-3xl font-extrabold tracking-tight text-slate-900">
          10012.06
        </div>
        <div className="flex justify-between mt-3 text-[13px] text-slate-600">
          <div>
            <div>Available Balance</div>
            <div className="font-bold text-slate-800">8912.06</div>
          </div>
          <div className="text-right">
            <div>PnL Today</div>
            <div className="font-bold text-slate-800">0.00 / 0%</div>
          </div>
        </div>
      </div>

      {/* ===== Recharge / Withdraw Buttons ===== */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button className="flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-200 py-4 shadow-sm hover:bg-slate-50">
          <Wallet className="h-6 w-6 text-blue-500 mb-1" />
          <span className="text-sm font-semibold text-slate-800">Recharge</span>
        </button>
        <button className="flex flex-col items-center justify-center rounded-2xl bg-white border border-slate-200 py-4 shadow-sm hover:bg-slate-50">
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
          },
          {
            icon: <FileText className="h-5 w-5 text-slate-600" />,
            label: "Transactions",
          },
          {
            icon: <UserCheck className="h-5 w-5 text-yellow-600" />,
            label: "Agent Center",
          },
          {
            icon: <Bell className="h-5 w-5 text-slate-600" />,
            label: "Notification",
          },
          {
            icon: <Download className="h-5 w-5 text-slate-600" />,
            label: "Download APP",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-sm font-medium text-slate-800">
                {item.label}
              </span>
            </div>
            <span className="text-slate-400">{">"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
