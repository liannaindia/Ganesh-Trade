// src/Backend/RechargeChannel.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function RechargeChannel() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase.from("channels").select("*");
      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error("获取通道失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          充值通道管理
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left font-medium">通道名</th>
              <th className="px-6 py-3 text-left font-medium">费率</th>
              <th className="px-6 py-3 text-left font-medium">状态</th>
              <th className="px-6 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {channels.map((channel) => (
              <tr key={channel.id} className="hover:bg-blue-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">{channel.name}</td>
                <td className="px-6 py-4">{channel.rate}%</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      channel.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {channel.status === "active" ? "已启用" : "已停用"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs hover:bg-indigo-700 shadow">
                      编辑
                    </button>
                    <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-full text-xs hover:bg-emerald-700 shadow">
                      启用
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
