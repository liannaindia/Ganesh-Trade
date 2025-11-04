import React from "react";
import { ArrowLeft, Copy } from "lucide-react";

export default function Invite({ setTab }) {
  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Invite</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
          <div className="text-sm text-slate-600">Registered Users</div>
          <div className="text-2xl font-bold text-yellow-500">1</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
          <div className="text-sm text-slate-600">Effective Users</div>
          <div className="text-2xl font-bold text-yellow-500">1</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-3">
        <div className="text-sm text-slate-600 mb-1">My Referral Link</div>
        <div className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2">
          <span className="text-sm text-slate-700 truncate">
            https://google.com/?InviteCode=39795579
          </span>
          <Copy className="h-4 w-4 text-slate-400 cursor-pointer" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="text-sm text-slate-600 mb-1">My Invitation Code</div>
        <div className="flex items-center justify-between border border-slate-100 rounded-lg px-3 py-2">
          <span className="text-sm text-slate-700">39795579</span>
          <Copy className="h-4 w-4 text-slate-400 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
