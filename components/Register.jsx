import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";  // 引入supabase客户端
import { ArrowLeft } from "lucide-react";  // 引入ArrowLeft组件

export default function Recharge({ setTab, balance, isLoggedIn }) {
  const [amount, setAmount] = useState(""); // 充值金额
  const [selectedChannel, setSelectedChannel] = useState(null); // 选择的充值通道
  const [loading, setLoading] = useState(false);

  // 充值通道列表
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const fetchChannels = async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .eq("status", "active"); // 获取启用的充值通道

      if (error) {
        console.error("Error fetching channels:", error);
      } else {
        setChannels(data); // 存储通道数据
      }
    };

    fetchChannels();
  }, []);

  // 提交充值请求
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChannel || !amount || isNaN(amount) || amount <= 0) {
      alert("Please select a channel and enter a valid amount.");
      return;
    }

    try {
      setLoading(true);

      // 从 localStorage 获取用户ID
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        alert("User is not logged in.");
        return;
      }

      // 提交充值数据到后台
      const { data, error } = await supabase.from("recharges").insert([
        {
          user_id: user_id, // 使用从 localStorage 获取的 user_id
          channel_id: selectedChannel.id,
          amount: parseFloat(amount),
          status: "pending", // 初始状态为 pending
        },
      ]);

      if (error) throw error;

      alert("Recharge request submitted successfully.");
      setAmount(""); // 清空金额
      setSelectedChannel(null); // 重置选中的通道
    } catch (error) {
      console.error("Error submitting recharge:", error);
      alert("Failed to submit recharge request.");
    } finally {
      setLoading(false);
    }
  };

  // 如果没有登录，显示登录提示
  if (!isLoggedIn) {
    return <div>Please log in to proceed with the recharge.</div>;
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

      {/* 选择充值通道 */}
      <div className="space-y-2">
        <h3 className="text-gray-700">Select Recharge Channel</h3>
        {channels.map((channel) => (
          <div
            key={channel.id}
            onClick={() => setSelectedChannel(channel)}
            className={`flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm cursor-pointer ${
              selectedChannel?.id === channel.id ? "bg-gray-100" : ""
            }`}
          >
            <div className="font-medium text-slate-800 text-sm">
              {channel.currency_name}
            </div>
            <div className="text-xs text-slate-500">{channel.wallet_address}</div>
          </div>
        ))}
      </div>

      {/* 输入充值金额 */}
      <div className="mt-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="text-sm text-slate-500 mb-1">Amount</div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-slate-200 rounded-xl p-2 text-sm outline-none"
          placeholder="Enter amount"
        />
      </div>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-xl ${
          loading ? "cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
