
import React from "react";

export default function Positions() {
  const positions = [
    {
      sym: "BTC/USDT",
      side: "LONG",
      size: 0.0025,
      entry: 110000,
      mark: 110480,
      pnl: +12.0,
    },
    {
      sym: "ETH/USDT",
      side: "SHORT",
      size: 0.120,
      entry: 3950,
      mark: 3890,
      pnl: +7.2,
    },
    {
      sym: "BNB/USDT",
      side: "LONG",
      size: 1.6,
      entry: 1050,
      mark: 1090,
      pnl: +64.0,
    },
  ];

  const pct = (a, b, side) => {
    const diff = ((b - a) / a) * 100 * (side === "LONG" ? 1 : -1);
    return `${diff > 0 ? "+" : ""}${diff.toFixed(2)}%`;
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="font-semibold text-slate-800 text-lg mb-4">Positions</h2>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y">
        {positions.map((p, i) => (
          <div key={i} className="p-3">
            <div className="flex justify-between items-center mb-1">
              <div className="font-semibold text-slate-800">{p.sym}</div>
              <div
                className={`text-xs font-bold px-2 py-[2px] rounded-full ${
                  p.side === "LONG"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-rose-100 text-rose-600"
                }`}
              >
                {p.side}
              </div>
            </div>
            <div className="flex justify-between text-[12px] text-slate-500 mb-1">
              <span>Size: {p.size}</span>
              <span>Entry: {p.entry}</span>
              <span>Mark: {p.mark}</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span
                  className={`font-semibold ${
                    p.pnl >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {p.pnl >= 0 ? "+" : ""}
                  {p.pnl.toFixed(2)} USDT
                </span>
                <span className="text-[12px] ml-2 text-slate-500">
                  {pct(p.entry, p.mark, p.side)}
                </span>
              </div>
              <button className="text-[12px] font-semibold text-white bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-700">
                Close
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-slate-500 text-sm">
        <p>Total Positions: {positions.length}</p>
      </div>
    </div>
  );
}
