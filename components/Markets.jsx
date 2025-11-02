import React, { useState } from "react";
import { Search } from "lucide-react";

export default function Markets() {
  const [query, setQuery] = useState("");

  const assets = [
    { sym: "BTC", name: "Bitcoin", price: 110478.6, chg: +0.253 },
    { sym: "BCH", name: "Bitcoin Cash", price: 549.4, chg: +0.384 },
    { sym: "LTC", name: "Litecoin", price: 100.3, chg: +2.284 },
    { sym: "BNB", name: "Binance Coin", price: 1091.46, chg: +0.402 },
    { sym: "ETH", name: "Ethereum", price: 3892.53, chg: +0.768 },
    { sym: "AAVE", name: "Aave", price: 225.44, chg: -0.389 },
    { sym: "YFI", name: "Yearn Finance", price: 4718.0, chg: +0.426 },
    { sym: "AVAX", name: "Avalanche", price: 18.87, chg: +2.110 },
    { sym: "CVC", name: "Civic", price: 0.0583, chg: +0.865 },
    { sym: "DUSK", name: "Dusk", price: 0.0509, chg: +9.462 },
    { sym: "VELODROME", name: "Velodrome", price: 0.0371, chg: -5.115 },
  ];

  const filtered = assets.filter(
    (a) =>
      a.sym.toLowerCase().includes(query.toLowerCase()) ||
      a.name.toLowerCase().includes(query.toLowerCase())
  );

  const pct = (v) => `${v > 0 ? "+" : ""}${v.toFixed(3)}%`;

  const getIcon = (sym) => {
    const base = "https://cryptoicons.org/api/icon";
    return `${base}/${sym.toLowerCase()}/64`;
  };

  return (
    <div className="px-4 pt-3 pb-20">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter the trading product name"
          className="w-full rounded-full bg-slate-100 border border-slate-200 pl-9 pr-4 py-2 text-sm outline-none"
        />
      </div>

      <h2 className="font-bold text-slate-700 mb-2">Markets</h2>

      {/* Market List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y">
        {filtered.map((a) => (
          <div
            key={a.sym}
            className="flex items-center justify-between px-3 py-3 hover:bg-slate-50 transition"
          >
            {/* left */}
            <div className="flex items-center gap-3">
              <img
                src={getIcon(a.sym)}
                alt={a.sym}
                className="h-6 w-6 rounded-full"
                onError={(e) => (e.target.style.display = "none")}
              />
              <div>
                <div className="font-semibold text-slate-800">{a.sym}</div>
                <div className="text-[11px] text-slate-500">{a.name}</div>
              </div>
            </div>

            {/* right */}
            <div className="text-right">
              <div className="text-[13px] font-bold text-slate-900">
                {a.price.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div>
                <span
                  className={`inline-flex px-2 py-[2px] rounded-full text-[11px] font-semibold ${
                    a.chg >= 0
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {pct(a.chg)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
