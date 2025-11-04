import React from "react";
import { ArrowLeft } from "lucide-react";  // 引入箭头图标

export default function Recharge({ setTab }) {
  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      <div className="flex items-center gap-3 py-3">
       
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")} 
        />
        <h2 className="font-semibold text-slate-800 text-lg">Recharge</h2>
      </div>

      {/* 充值页面的内容 */}
      <div className="space-y-2">
        <div
          className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm cursor-pointer"
        >
          <img
            src="https://i.imgur.com/b5NYPsZ.png"
            className="w-8 h-8 rounded-full"
            alt="Payment Channel"
          />
          <div>
            <div className="font-medium text-slate-800 text-sm">OKPay (三方钱包充值)</div>
            <div className="text-[12px] text-slate-500">快捷到账，即时到账</div>
          </div>
        </div>

        <div
          className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm cursor-pointer"
        >
          <img
            src="https://i.imgur.com/ThAc0qB.png"
            className="w-8 h-8 rounded-full"
            alt="Payment Channel"
          />
          <div>
            <div className="font-medium text-slate-800 text-sm">AAPay (三方钱包充值)</div>
            <div className="text-[12px] text-slate-500">快捷到账，即时到账</div>
          </div>
        </div>

        {/* 更多支付方式... */}
      </div>

      {/* 输入充值金额 */}
      <div className="mt-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="text-sm text-slate-500 mb-1">
          Recharge Amount <span className="text-slate-400">1 USDT = 1 USDT</span>
        </div>
        <input
          className="w-full border border-slate-200 rounded-xl p-2 text-sm outline-none"
          placeholder="Minimum recharge amount 1 USDT"
        />
        <div className="text-[12px] text-slate-500 mt-1 text-right">USDT</div>
      </div>

      {/* 提示信息 */}
      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-slate-700">
        <strong>Important Reminder:</strong>
        <br />
        If it does not arrive for a long time, please refresh the page or contact customer service.
      </div>

      {/* 继续按钮 */}
      <button className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-xl">
        Continue
      </button>
    </div>
  );
}
