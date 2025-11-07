// components/Recharge.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { ArrowLeft, Shield, Zap, CheckCircle } from "lucide-react";

export default function Recharge({ setTab, isLoggedIn, userId }) {
  const [amount, setAmount] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading UST] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // 快速金额（USDT）
  const quickAmounts = [10, 50, 100, 500];

  // 读取 channels
  useEffect(() => {
    const fetchChannels = async () => {
      setFetching(true);
      const { data, error } = await supabase
        .from("channels")
        .select("id, currency_name, wallet_address")
        .eq("status", "active")
        .order("id");

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

  const handleSubmit = async () => {
    if (!isLoggedIn || !userId) {
      alert("Please log in first.");
      setTab("login");
      return;
    }
    if (!selectedChannel) {
      setError("Please select a network.");
      return;
    }
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num < 1) {
      setError("Minimum 1 USDT.");
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

      alert("Recharge request submitted! Please complete payment.");
      setAmount("");
      setSelectedChannel(null);
    } catch (err) {
      setError("Submission failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="p-6 text-center">
        <div className="bg-orange-100 text-orange-700 p-4 rounded-xl">
          Please log in to recharge
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 max-w-md mx-auto bg-gradient-to-b from-orange-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 sticky top-0 bg-white/80 backdrop-blur z-10 border-b">
        <ArrowLeft
          className="h-6 w-6 text-orange-600 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="text-xl font-bold text-orange-800">Recharge USDT</h2>
      </div>

      {/* Trust Badges */}
      <div className="flex justify-center gap-4 my-4">
        <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
          <Shield className="w-4 h-4" /> 100% Safe
        </div>
        <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
          <Zap className="w-4 h-4" /> Instant Arrival
        </div>
      </div>

      {/* Channels */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span className="text-orange-600">Select Network</span>
        </h3>

        {fetching ? (
          <div className="text-center py-6 text-gray-500">Loading...</div>
        ) : channels.length === 0 ? (
          <div className="text-center py-6 text-gray-500">No channels</div>
        ) : (
          channels.map((ch) => (
            <div
              key={ch.id}
              onClick={() => setSelectedChannel(ch)}
              className={`relative bg-white rounded-2xl p-4 shadow-lg border-2 transition-all cursor-pointer transform hover:scale-[1.02] ${
                selectedChannel?.id === ch.id
                  ? "border-orange-500 ring-4 ring-orange-100"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {ch.currency_name.includes("TRC20") ? "T" : "E"}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">
                      {ch.currency_name}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[180px]">
                      {ch.wallet_address}
                    </div>
                  </div>
                </div>
                {selectedChannel?.id === ch.id && (
                  <CheckCircle className="w-6 h-6 text-orange-600" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Amounts */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Amount</h3>
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt)}
              className="bg-gradient-to-r from-orange-400 to-pink-400 text-white font-bold py-3 rounded-xl text-sm hover:scale-105 transition"
            >
              {amt} USDT
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div className="mt-5 bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
        <div className="text-sm text-gray-600 mb-2">Enter Amount</div>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 pr-20 border-2 border-orange-200 rounded-xl text-lg font-bold text-orange-700 outline-none focus:border-orange-500"
            placeholder="1.00"
            min="1"
            step="0.01"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-600 font-bold text-lg">
            USDT
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1 text-right">
          Min: 1 USDT
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 bg-red-100 border border-red-300 text-red-700 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Reminder */}
      <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 text-xs">
        <strong className="text-green-800">Important:</strong>
        <br />
        After payment, funds arrive in <strong>30 seconds</strong>. If delayed, refresh or contact support.
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !selectedChannel || !amount || fetching}
        className={`mt-6 w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl transform active:scale-95 ${
          loading || !selectedChannel || !amount || fetching
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600"
        }`}
      >
        {loading ? "Submitting..." : "Continue to Pay"}
      </button>
    </div>
  );
}
