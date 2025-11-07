import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function Recharge({ setTab, isLoggedIn, userId }) {
  const [amount, setAmount] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // ---------- 读取 channels ----------
  useEffect(() => {
    const fetchChannels = async () => {
      setFetching(true);
      const { data, error } = await supabase
        .from("channels")
        .select("id, currency_name, wallet_address")
        .eq("status", "active")
        .order("id", { ascending: true });

      if (error) {
        console.error("Load channels error:", error);
        setError("Failed to load payment channels.");
      } else {
        setChannels(data ?? []);
      }
      setFetching(false);
    };

    fetchChannels();
  }, []);

  // ---------- 提交充值 ----------
  const handleSubmit = async () => {
    if (!isLoggedIn || !userId) {
      alert("Please log in first.");
      setTab("login");
      return;
    }

    if (!selectedChannel) {
      setError("Please select a payment channel.");
      return;
    }

    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num < 1) {
      setError("Minimum recharge amount is 1 USDT.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.from("recharges").insert({
        user_id: userId,
        channel_id: selectedChannel.id,
        amount: num,
        status: "pending",
      });

      if (error) throw error;

      alert("Recharge request submitted successfully!");
      setAmount("");
      setSelectedChannel(null);
    } catch (err) {
      console.error("Recharge error:", err);
      setError("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="px-4 pt-10 text-center text-slate-600">
        Please log in to proceed with the recharge.
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Recharge</h2>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Select Payment Channel</h3>

        {fetching ? (
          <p className="text-center text-sm text-slate-500 py-4">Loading channels...</p>
        ) : channels.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-4">No active channels available.</p>
        ) : (
          channels.map((ch) => (
            <div
              key={ch.id}
              onClick={() => setSelectedChannel(ch)}
              className={`flex items-center justify-between bg-white border rounded-xl px-4 py-3 shadow-sm cursor-pointer transition-all ${
                selectedChannel?.id === ch.id
                  ? "border-yellow-400 bg-yellow-50 ring-2 ring-yellow-300"
                  : "border-slate-200"
              }`}
            >
              <div>
                <div className="font-medium text-slate-800 text-sm">{ch.currency_name}</div>
                <div className="text-xs text-slate-500 truncate max-w-[200px]">{ch.wallet_address}</div>
              </div>
              {selectedChannel?.id === ch.id && (
                <div className="w-5 h-5 rounded-full border-2 border-yellow-400 bg-yellow-400" />
              )}
            </div>
          ))
        )}
      </div>

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

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-slate-700">
        <strong>Important Reminder:</strong>
        <br />
        If the funds do not arrive after a long time, please refresh the page or contact customer service.
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !selectedChannel || !amount || fetching}
        className={`mt-4 w-full font-semibold py-3 rounded-xl transition ${
          loading || !selectedChannel || !amount || fetching
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-yellow-400 hover:bg-yellow-500 text-slate-900"
        }`}
      >
        {loading ? "Submitting..." : "Continue"}
      </button>
    </div>
  );
}
