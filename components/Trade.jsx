import React, { useState } from "react";
import { Search, Filter } from "lucide-react";

export default function Trade() {
  const [query, setQuery] = useState("");

  // === 模拟导师数据 ===
  const mentors = [
    {
      id: 1,
      name: "刘半仙",
      years: 9,
      assets: 15368,
      img: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "特朗朗",
      years: 11,
      assets: 652122,
      img: "https://randomuser.me/api/portraits/men/51.jpg",
    },
    {
      id: 3,
      name: "上官熊二",
      years: 9,
      assets: 995219,
      img: "https://randomuser.me/api/portraits/men/44.jpg",
    },
    {
      id: 4,
      name: "alessia1",
      years: 14,
      assets: 123134134,
      img: "https://randomuser.me/api/portraits/women/33.jpg",
    },
    {
      id: 5,
      name: "alessia",
      years: 15,
      assets: 54654445,
      img: "https://randomuser.me/api/portraits/women/65.jpg",
    },
  ];

  const filtered = mentors.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* 搜索框 */}
      <div className="relative flex items-center mt-4 mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for Traders"
          className="w-full rounded-full bg-slate-100 border border-slate-200 pl-9 pr-20 py-2 text-sm outline-none"
        />
        <button className="absolute right-14 text-sm text-slate-600">Search</button>
        <button className="absolute right-3 p-1">
          <Filter className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      {/* 导师列表 */}
      <div className="space-y-3">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="flex items-center bg-white border border-slate-200 rounded-2xl p-3 shadow-sm"
          >
            <img
              src={m.img}
              alt={m.name}
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex-1 ml-3">
              <div className="font-semibold text-slate-800">{m.name}</div>
              <div className="text-[12px] text-slate-500">
                Investment Experience {m.years} years
              </div>
              <div className="mt-1 text-[12px] text-slate-400">
                Cumulative Assets
              </div>
              <div className="text-[12px] font-semibold text-slate-700">
                {m.assets.toLocaleString()} <span className="text-[11px]">USDT</span>
              </div>
            </div>

            <button className="ml-auto bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold text-sm px-4 py-1.5 rounded-lg shadow">
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
