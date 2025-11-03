import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Withdraw() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("request");

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Withdraw</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-3">
        <button
          onClick={() => setTab("request")}
          className={`flex-1 py-2 text-sm font-semibold border-b-2 ${
            tab === "request"
              ? "border-yellow-500 text-yellow-600"
              : "border-transparent text-slate-500"
          }`}
        >
          Request Withdraw
        </button>
        <button
          onClick={() => setTab("address")}
          className={`flex-1 py-2 text-sm font-semibold border-b-2 ${
            tab === "address"
              ? "border-yellow-500 text-yellow-600"
              : "border-transparent text-slate-500"
          }`}
        >
          Receiving Address
        </button>
      </div>

      {tab === "request" ? (
        <>
          {/* Balance */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-3">
            <div className="text-sm text-slate-500">Available Balance</div>
            <div className="text-2xl font-bold text-slate-900">
              8912.06<span className="text-sm ml-1 text-slate-500">USDT</span>
            </div>
          </div>

          {/* Withdraw Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div>
              <div className="text-sm text-slate-500 mb-1">
                Withdraw Account
              </div>
              <select className="w-full border border-slate-200 rounded-lg p-2 text-sm">
                <option>OKG 钱包: jljdjd***jjs</option>
              </select>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">
                Withdraw Amount <span className="text-slate-400">100–9999 USDT</span>
              </div>
              <input
                className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none"
                placeholder="Enter amount"
              />
            </div>

            <div className="text-xs text-slate-500">
              Withdraw Fee: <span className="font-semibold text-slate-800">0 USDT</span>
            </div>
          </div>

          {/* Reminder */}
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-slate-700">
            <strong>Important Reminder:</strong>
            <br />
            A withdraw fee will be deducted from the withdraw amount.
            The final amount depends on network conditions.
          </div>

          {/* Button */}
          <button className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-xl">
            Continue
          </button>
        </>
      ) : (
        <div className="text-center text-slate-500 mt-10">
          No saved address yet.
        </div>
      )}
    </div>
  );
}
