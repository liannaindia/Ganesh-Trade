import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function Transactions({ setTab, userId, isLoggedIn }) {
  const [recharges, setRecharges] = useState([]);
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !userId) return;
    fetchTransactions();
  }, [isLoggedIn, userId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data: rechargeData, error: rechargeErr } = await supabase
        .from("recharges")
        .select("amount, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const { data: withdrawData, error: withdrawErr } = await supabase
        .from("withdraws")
        .select("amount, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (rechargeErr) throw rechargeErr;
      if (withdrawErr) throw withdrawErr;

      setRecharges(rechargeData || []);
      setWithdraws(withdrawData || []);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts) => {
    const date = new Date(ts);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* ===== Header ===== */}
      <div className="flex items-center mt-4 mb-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-600 cursor-pointer"
          onClick={() => setTab("me")}
        />
        <h2 className="flex-1 text-center text-lg font-bold text-slate-800">
          Transactions
        </h2>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 mt-10 animate-pulse">
          Loading history...
        </div>
      ) : (
        <div className="space-y-6">
          {/* ===== Recharges ===== */}
          <div>
            <h3 className="text-slate-700 font-semibold mb-2">Recharge History</h3>
            {recharges.length === 0 ? (
              <p className="text-slate-400 text-sm">No recharge records found.</p>
            ) : (
              recharges.map((r, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm mb-2"
                >
                  <div>
                    <div className="text-sm text-slate-600">{formatDate(r.created_at)}</div>
                    <div className={`text-xs font-medium ${getStatusColor(r.status)}`}>
                      {r.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-right font-bold text-slate-800">
                    +{Number(r.amount).toFixed(2)} USDT
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ===== Withdraws ===== */}
          <div>
            <h3 className="text-slate-700 font-semibold mb-2">Withdraw History</h3>
            {withdraws.length === 0 ? (
              <p className="text-slate-400 text-sm">No withdraw records found.</p>
            ) : (
              withdraws.map((w, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm mb-2"
                >
                  <div>
                    <div className="text-sm text-slate-600">{formatDate(w.created_at)}</div>
                    <div className={`text-xs font-medium ${getStatusColor(w.status)}`}>
                      {w.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-right font-bold text-slate-800">
                    -{Number(w.amount).toFixed(2)} USDT
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
