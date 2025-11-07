// components/Recharge.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function Recharge({ setTab, isLoggedIn, userId }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    // 登录校验
    if (!isLoggedIn || !userId) {
      alert("Please log in to recharge.");
      setTab("login");
      return;
    }

    // 金额校验
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount < 1) {
      setError("Minimum recharge amount is 1 USDT.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.from("recharges").insert({
        user_id: userId,
        amount: numAmount,
        status: "pending",
        method: "manual", // 可扩展为实际支付方式
      });

      if (error) throw error;

      alert("Recharge request submitted successfully!");
      setAmount("");
      setTab("home"); // 返回首页
    } catch (err) {
      console.error("Recharge error:", err);
      setError("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 未登录提示
  if (!isLoggedIn) {
    return (
      <div className="px-4 pt-10 text-center text-slate-600">
        Please log in to proceed with the recharge.
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Recharge</h2>
      </div>

      {/* Amount Input */}
      <div className="mt-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="text-sm text-slate-500 mb-1">
          Recharge Amount{" "}
          <span className="text-slate-400">1 USDT = 1 USDT</span>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-slate-200 rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Minimum recharge amount 1 USDT"
          min="1"
          step="0.01"
        />
        <div className="text-[12px] text-slate-500 mt-1 text-right">USDT</div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Important Reminder */}
      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-slate-700">
        <strong>Important Reminder:</strong>
        <br />
        If the funds do not arrive after a long time, please refresh the page or contact customer service.
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !amount}
        className={`mt-4 w-full font-semibold py-3 rounded-xl transition ${
          loading || !amount
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-yellow-400 hover:bg-yellow-500 text-slate-900"
        }`}
      >
        {loading ? "Submitting..." : "Continue"}
      </button>
    </div>
  );
}
