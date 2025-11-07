import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";  // 引入箭头图标
import { supabase } from "../supabaseClient";  // 引入supabase客户端

export default function Recharge({ setTab }) {
  const [channels, setChannels] = useState([]); // 存储通道数据
  const [loading, setLoading] = useState(true);  // 加载状态

  useEffect(() => {
    // 获取通道数据
    const fetchChannels = async () => {
      try {
        const { data, error } = await supabase
          .from("channels")  // 从 channels 表获取数据
          .select("id, currency_name, wallet_address, status")
          .eq("status", "active");  // 只获取启用状态的通道

        if (error) throw error;
        setChannels(data);  // 将获取的数据存入 channels 状态
      } catch (error) {
        console.error("获取充值通道失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels(); // 页面加载时调用 fetchChannels 函数
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="px-4 pb-24 max-w-md mx-auto">
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")} 
        />
        <h2 className="font-semibold text-slate-800 text-lg">Recharge</h2>
      </div>

      {/* 充值页面的内容 */}
      <div className="space-y-2">
        {channels.length > 0 ? (
          channels.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm cursor-pointer"
            >
              <img
                src="https://i.imgur.com/b5NYPsZ.png" // 这里你可以根据 channel.currency_name 或其他数据动态加载图片
                className="w-8 h-8 rounded-full"
                alt="Payment Channel"
              />
              <div>
                <div className="font-medium text-slate-800 text-sm">{channel.currency_name}</div>
                <div className="text-[12px] text-slate-500">快捷到账，即时到账</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">没有可用的充值通道</div>
        )}
      </div>

      {/* 输入充值金额 */}
      <div className="mt-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="text-sm text-slate-500 mb-1">
          Recharge Amount <span className="text-slate-400">1 USDT = 1 USDT</span>
        </div>
        <input
          className="w-full border border-slate-200 rounded-xl p-2 text-sm outline-none"
          placeholder="Minimum recharge amount 1 USDT"
        />
        <div className="text-[12px] text-slate-500 mt-1 text-right">USDT</div>
      </div>

      {/* 提示信息 */}
      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-slate-700">
        <strong>Important Reminder:</strong>
        <br />
        If it does not arrive for a long time, please refresh the page or contact customer service.
      </div>

      {/* 继续按钮 */}
      <button className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-xl">
        Continue
      </button>
    </div>
  );
}
