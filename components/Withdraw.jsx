import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function Withdraw({ setTab, userId, balance }) {
  const [tab, setTabState] = useState("request");
  const [walletAddress, setWalletAddress] = useState(""); // 已保存的地址
  const [newAddress, setNewAddress] = useState("");       // 新输入地址（仅用于保存）
  const [withdrawAmount, setWithdrawAmount] = useState(""); // 提现金额（字符串输入）
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // 防止重复点击

  // 1. 获取用户钱包地址
  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("users")
        .select("wallet_address")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Failed to fetch wallet:", error);
        setError("Failed to load wallet address.");
      } else if (data?.wallet_address) {
        setWalletAddress(data.wallet_address);
      }
    };

    fetchWalletAddress();
  }, [userId]);

  // 2. 提交提款请求
  const handleRequestWithdraw = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      // 必须有已保存的地址
      if (!walletAddress) {
        setError("No wallet address saved. Please set it in 'Receiving Address'.");
        return;
      }

      const isValidTRC20 = walletAddress.startsWith("T") && walletAddress.length === 34;
      if (!isValidTRC20) {
        setError("Saved wallet address is invalid (must be TRC20).");
        return;
      }

      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount < 100 || amount > 9999 || amount > balance) {
        setError("Amount must be 100–9999 USDT and not exceed your balance.");
        return;
      }

      console.log("Submitting withdraw:", { userId, amount, walletAddress });

      const { error } = await supabase
        .from("withdraws")
        .insert({
          user_id: userId,
          amount: amount,
          wallet_address: walletAddress, // 使用已保存地址
          status: "pending",
        });

      if (error) {
        console.error("Withdraw error:", error);
        setError("Failed to submit request. Please try again.");
      } else {
        setWithdrawAmount("");
        alert("Withdraw request submitted successfully!");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // 3. 保存新钱包地址
  const handleSaveAddress = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    const trimmed = newAddress.trim();
    if (!trimmed) {
      setError("Please enter a wallet address.");
      setLoading(false);
      return;
    }

    const isValidTRC20 = trimmed.startsWith("T") && trimmed.length === 34;
    if (!isValidTRC20) {
      setError("Invalid TRC-20 address. Must start with 'T' and be 34 characters.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ wallet_address: trimmed })
        .eq("id", userId);

      if (error) {
        console.error("Save address error:", error);
        setError("Failed to save address. Please try again.");
      } else {
        setWalletAddress(trimmed);
        setNewAddress("");
        alert("Wallet address saved successfully!");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Withdraw</h2>
      </div>

      {/* 标签页切换 */}
      <div className="flex border-b border-slate-200 mb-3">
        <button
          onClick={() => setTabState("request")}
          className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors ${
            tab === "request"
              ? "border-yellow-500 text-yellow-600"
              : "border-transparent text-slate-500"
          }`}
        >
          Request Withdraw
        </button>
        <button
          onClick={() => setTabState("address")}
          className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors ${
            tab === "address"
              ? "border-yellow-500 text-yellow-600"
              : "border-transparent text-slate-500"
          }`}
        >
          Receiving Address
        </button>
      </div>

      {/* 统一错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Request Withdraw 页面 */}
      {tab === "request" ? (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-3">
            <div className="text-sm text-slate-500">Available Balance</div>
            <div className="text-2xl font-bold text-slate-900">
              {balance} <span className="text-sm ml-1 text-slate-500">USDT</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div>
              <div className="text-sm text-slate-500 mb-1">Withdraw Account</div>
              <div className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900 break-all">
                {walletAddress || "No wallet address saved"}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">
                Withdraw Amount <span className="text-slate-400">100–9999 USDT</span>
              </div>
              <input
                type="number"
                className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="100"
                max="9999"
                step="0.01"
              />
            </div>

            <div className="text-xs text-slate-500">
              Withdraw Fee: <span className="font-semibold text-slate-800">0 USDT</span>
            </div>
          </div>

          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-slate-700">
            <strong>Important Reminder:</strong>
            <br />
            A withdraw fee will be deducted from the withdraw amount.
            The final amount depends on network conditions.
          </div>

          <button
            onClick={handleRequestWithdraw}
            disabled={loading || !walletAddress}
            className={`mt-4 w-full font-semibold py-3 rounded-xl transition-colors ${
              loading || !walletAddress
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-slate-900"
            }`}
          >
            {loading ? "Submitting..." : "Continue"}
          </button>
        </>
      ) : (
        /* Receiving Address 页面 */
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="text-sm text-slate-500 mb-1">Current Receiving Address</div>
          <div className="text-sm font-semibold text-slate-700 mb-2">USDT (TRC20)</div>
          <div className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900 break-all">
            {walletAddress || "No address saved yet"}
          </div>

          <div className="mt-4">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none"
              placeholder="Enter new USDT TRC20 address (starts with T)"
              maxLength="34"
            />
            <button
              onClick={handleSaveAddress}
              disabled={loading}
              className={`mt-2 w-full font-semibold py-3 rounded-xl transition-colors ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500 text-slate-900"
              }`}
            >
              {loading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
