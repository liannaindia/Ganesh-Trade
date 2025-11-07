import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../supabaseClient"; // 引入 supabase

export default function Withdraw({ setTab, userId, balance }) {
  const [tab, setTabState] = useState("request");
  const [walletAddress, setWalletAddress] = useState(""); // 当前保存的用户钱包地址
  const [newAddress, setNewAddress] = useState(""); // 用户输入的新钱包地址
  const [withdrawAmount, setWithdrawAmount] = useState(""); // 提现金额
  const [error, setError] = useState("");

  // 1. 获取用户的钱包地址
  useEffect(() => {
    const fetchWalletAddress = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("wallet_address")
        .eq("id", userId)
        .single();

      if (error) {
        setError("Failed to fetch wallet address.");
        console.error(error);
      } else if (data) {
        setWalletAddress(data.wallet_address); // 设置当前保存的钱包地址
      }
    };

    if (userId) {
      fetchWalletAddress(); // 获取用户钱包地址
    }
  }, [userId]);

  // 2. 提交提款请求
  const handleRequestWithdraw = async () => {
    console.log("Continue button clicked");

    // 验证提款金额和钱包地址
    if (!newAddress) {
      setError("Please enter a valid address.");
      return;
    }

    // 简单验证地址格式（确保是 TRC20 地址）
    const isValidTRC20Address = newAddress.startsWith("T") && newAddress.length === 34;
    if (!isValidTRC20Address) {
      setError("Invalid USDT (TRC20) address.");
      return;
    }

    if (!withdrawAmount || withdrawAmount <= 0 || withdrawAmount > balance) {
      setError("Invalid withdraw amount.");
      return;
    }

    console.log("Proceeding with withdraw request...");

    // 插入提款记录到数据库
    const { data, error } = await supabase
      .from("withdraws")
      .insert([
        {
          user_id: userId,
          amount: withdrawAmount,
          wallet_address: newAddress, // 保存钱包地址
          status: "pending", // 初始状态为 pending
        },
      ]);

    if (error) {
      setError("Failed to request withdraw.");
      console.error(error);
    } else {
      setError(""); // 清除错误
      setWithdrawAmount(""); // 清空金额输入框
      setNewAddress(""); // 清空钱包地址输入框
      setWalletAddress(newAddress); // 更新钱包地址
      console.log("Withdraw request submitted successfully.");
      alert("Withdraw request submitted successfully.");
    }
  };

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Withdraw</h2>
      </div>

      <div className="flex border-b border-slate-200 mb-3">
        <button
          onClick={() => setTabState("request")}
          className={`flex-1 py-2 text-sm font-semibold border-b-2 ${
            tab === "request"
              ? "border-yellow-500 text-yellow-600"
              : "border-transparent text-slate-500"
          }`}
        >
          Request Withdraw
        </button>
        <button
          onClick={() => setTabState("address")}
          className={`flex-1 py-2 text-sm font-semibold border-b-2 ${
            tab === "address"
              ? "border-yellow-500 text-yellow-600"
              : "border-transparent text-slate-500"
          }`}
        >
          Receiving Address
        </button>
      </div>

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
              <div className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900">
                {walletAddress || "No wallet address available"}
              </div>
            </div>

            <div>
              <div className="text-sm text-slate-500 mb-1">
                Withdraw Amount <span className="text-slate-400">100–9999 USDT</span>
              </div>
              <input
                className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
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
            className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-xl"
          >
            Continue
          </button>
        </>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="text-sm text-slate-500 mb-1">Receiving Address</div>
          <div className="text-sm font-semibold text-slate-700 mb-2">USDT (TRC20)</div>
          <div className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-900">
            {walletAddress || "No wallet address available"}
          </div>

          <div className="mt-4">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none"
              placeholder="Enter new wallet address (USDT TRC20)"
            />
            <button
              onClick={handleRequestWithdraw}
              className="mt-2 w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-xl"
            >
              Save Address
            </button>
          </div>

          {/* 显示错误消息 */}
          {error && <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">{error}</div>}
        </div>
      )}
    </div>
  );
}
