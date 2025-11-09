// components/Recharge.jsx
import React, { useState, useEffect } from "react";
import { supabase, call } from "../supabaseClient";
import { ArrowLeft, Shield, Zap, CheckCircle } from "lucide-react";

export default function Recharge({ setTab, isLoggedIn, userId }) {
  const [amount, setAmount] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const quickAmounts = [10, 50, 100, 500];

  useEffect(() => {
    const fetchChannels = async () => {
      setFetching(true);
      try {
        const data = await call(
          supabase
            .from("channels")
            .select("id, currency_name, wallet_address")
            .eq("status", "active")
            .order("id")
        );
        setChannels(data ?? []);
      } catch (err) {
        setError("Failed to load payment channels");
      } finally {
        setFetching(false);
      }
    };
    fetchChannels();
  }, []);

  const handleSubmit = async () => {
    if (!isLoggedIn || !userId) {
      setError("Please login first");
      setTab("login");
      return;
    }
    if (!selectedChannel) {
      setError("Please select a network");
      return;
    }
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num < 1) {
      setError("Minimum 1 USDT");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await call(
        supabase.from("recharges").insert({
          user_id: userId,
          channel_id: selectedChannel.id,
          amount: num,
          status: "pending",
        })
      );
      alert("Recharge request submitted! Please complete payment.");
      setAmount("");
      setSelectedChannel(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-orange-50 to-yellow-50 pb-24 min-h-screen">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <ArrowLeft className="h-5 w-5 cursor-pointer" onClick={() => setTab("me")} />
        <h2 className="font-bold text-lg flex-1 text-center">Recharge</h2>
      </div>

      <div className="p-4 space-y-5">
        {/* 快速金额 */}
        <div>
          <p className="text-sm font-medium text-orange-700 mb-2">Quick Amounts (USDT)</p>
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt.toString())}
                className={`py-3 rounded-xl font-bold transition-all ${
                  amount === amt.toString()
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg scale-105"
                    : "bg-white border-2 border-orange-200 text-orange-700 hover:border-orange-400"
                }`}
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        {/* 自定义金额 */}
        <div>
          <label className="text-sm font-medium text-orange-700">Custom Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-1 py-3 px-4 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            placeholder="Enter amount"
          />
        </div>

        {/* 支付通道 */}
        <div>
          <p className="text-sm font-medium text-orange-700 mb-2">Select Network</p>
          {fetching ? (
            <div className="text-center py-4 text-gray-600">Loading channels...</div>
          ) : channels.length === 0 ? (
            <div className="text-center py-4 text-gray-600">No active channels</div>
          ) : (
            <div className="space-y-2">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedChannel?.id === ch.id
                      ? "border-orange-500 bg-orange-50 shadow-lg"
                      : "border-orange-200 bg-white hover:border-orange-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-orange-700">{ch.currency_name}</p>
                      <p className="text-xs text-gray-600 truncate">{ch.wallet_address}</p>
                    </div>
                    {selectedChannel?.id === ch.id && <CheckCircle className="h-5 w-5 text-orange-600" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* 安全提示 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-green-600 mt-0.5" />
          <p className="text-xs text-green-800">
            <strong>Secure:</strong> Funds arrive in <strong>30 seconds</strong>. Contact support if delayed.
          </p>
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={loading || !selectedChannel || !amount || fetching}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
            loading || !selectedChannel || !amount || fetching
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 hover:scale-105'
          }`}
        >
          {loading ? 'Submitting...' : 'Continue to Pay'}
        </button>
      </div>
    </div>
  );
}
