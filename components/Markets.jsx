import React, { useState } from "react";
import { Search } from "lucide-react";

export default function Markets() {
  const [query, setQuery] = useState("");

  const markets = [
    { sym: "BTC", name: "Bitcoin", price: 110478.6, chg: +0.253 },
    { sym: "ETH", name: "Ethereum", price: 3892.53, chg: +0.768 },
    { sym: "BNB", name: "BNB", price: 1091.46, chg: +0.402 },
    { sym: "LTC", name: "Litecoin", price: 100.3, chg: +2.284 },
    { sym: "BCH", name: "Bitcoin Cash", price: 549.4, chg: +0.384 },
    { sym: "AAVE", name: "Aave", price: 225.44, chg: -0.389 },
    { sym: "AVAX", name: "Avalanche", price: 18.87, chg: +2.110 },
    { sym: "DOGE", name: "Dogecoin", price: 0.127, chg: +1.245 },
    { sym: "SOL", name: "Solana", price: 167.23, chg: +4.280 },
    { sym: "CVC", name: "Civic", price: 0.0583, chg: +0.865 },
  ];

  const filtered = markets.filter(
    (m) =>
      m.sym.toLowerCase().includes(query.toLowerCase()) ||
      m.name.toLowerCase().includes(query.toLowerCase())
  );

  const pct = (v) => `${v > 0 ? "+" : ""}${v.toFixed(3)}%`;
  const icon = (sym) => `https://cryptoicons.org/api/icon/${sym.toLowerCase()}/64`;

  return (
    <div className="p-4 pb-20">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter the trading product name"
          className="w-full rounded-full bg-slate-100 border border-slate-200 pl-9 pr-4 py-2 text-sm outline-none"
        />
      </div>

      <div className="flex items-center mb-2">
        <h2 className="font-semibold text-slate-700 text-lg">Markets</h2>
        <div className="h-[2px] w-10 bg-amber-400 ml-2 rounded-full"></div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y">
        {filtered.map((a) => (
          <div key={a.sym} className="flex items-center justify-between px-3 py-3 hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <img src={icon(a.sym)} alt={a.sym} className="h-6 w-6 rounded-full" />
              <div>
                <div className="font-semibold text-slate-800">{a.sym}</div>
                <div className="text-[11px] text-slate-500">{a.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[13px] font-bold text-slate-900">{a.price.toLocaleString()}</div>
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
