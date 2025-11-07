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
      const { data, error } = await supabase
        .from("channels")
        .select("id, currency_name, wallet_address, status, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error("获取虚拟币通道失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">虚拟币充值通道管理</h2>
        <button
          onClick={fetchChannels}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          刷新
        </button>
      </div>

      <div className="overflow-auto max-h-[80vh]">
        <table className="w-full table-fixed text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[160px] px-4 py-3 text-center font-semibold uppercase text-gray-600">币种名称</th>
              <th className="w-[400px] px-4 py-3 text-center font-semibold uppercase text-gray-600">充值地址</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">状态</th>
              <th className="w-[160px] px-4 py-3 text-center font-semibold uppercase text-gray-600">操作</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {channels.map((ch) => (
              <tr key={ch.id} className="hover:bg-gray-50 text-center align-middle">
                <td className="px-4 py-3">{ch.currency_name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700 break-all">{ch.wallet_address}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      ch.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ch.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">编辑</button>
                  <button className="text-green-600 hover:text-green-800">启用</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
