import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Recharge() {
  const navigate = useNavigate();

  const channels = [
    { name: "OKPay (三方钱包充值)", logo: "https://i.imgur.com/b5NYPsZ.png" },
    { name: "AAPay (三方钱包充值)", logo: "https://i.imgur.com/ThAc0qB.png" },
    { name: "KD (三方钱包充值)", logo: "https://i.imgur.com/DQb6LgZ.png" },
    { name: "MPay (三方钱包充值)", logo: "https://i.imgur.com/W1P7VYx.png" },
    { name: "TOPay (三方钱包充值)", logo: "https://i.imgur.com/Nq3FhUl.png" },
  ];

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Recharge</h2>
      </div>

      <div className="space-y-2">
        {channels.map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm cursor-pointer"
          >
            <img src={c.logo} className="w-8 h-8 rounded-full" />
            <div>
              <div className="font-medium text-slate-800 text-sm">{c.name}</div>
              <div className="text-[12px] text-slate-500">
                快捷到账，即时到账
              </div>
            </div>
          </div>
        ))}
      </div>

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

      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-slate-700">
        <strong>Important Reminder:</strong>
        <br />
        If it does not arrive for a long time, please refresh the page or
        contact customer service.
      </div>

      <button className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-xl">
        Continue
      </button>
    </div>
  );
}
