import React, { useState } from "react";

export default function Trade() {
  const [side, setSide] = useState("buy");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");

  const total = () =>
    price && amount ? (parseFloat(price) * parseFloat(amount)).toFixed(2) : "0.00";

  return (
    <div className="p-4 pb-20">
      <h2 className="font-semibold text-slate-800 text-lg mb-4">Trade</h2>

      {/* Buy / Sell Tabs */}
      <div className="flex mb-4 rounded-xl overflow-hidden border border-slate-200">
        <button
          onClick={() => setSide("buy")}
          className={`flex-1 py-2 font-bold ${
            side === "buy" ? "bg-emerald-500 text-white" : "bg-white text-slate-600"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`flex-1 py-2 font-bold ${
            side === "sell" ? "bg-rose-500 text-white" : "bg-white text-slate-600"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Input fields */}
      <div className="space-y-3">
        <div>
          <label className="text-sm text-slate-500 font-medium">Price (USDT)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-slate-500 font-medium">Amount (BTC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="flex justify-between text-sm text-slate-500 mt-1">
          <span>Total</span>
          <span className="font-bold text-slate-800">{total()} USDT</span>
        </div>

        <button
          className={`w-full py-3 mt-3 rounded-xl font-bold text-white shadow-md transition ${
            side === "buy" ? "bg-emerald-500" : "bg-rose-500"
          }`}
        >
          {side === "buy" ? "Buy BTC" : "Sell BTC"}
        </button>
      </div>
    </div>
  );
}
