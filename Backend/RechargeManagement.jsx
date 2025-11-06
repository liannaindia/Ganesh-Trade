// src/Backend/RechargeManagement.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function RechargeManagement() {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecharges();
  }, []);

  const fetchRecharges = async () => {
    try {
      const { data, error } = await supabase
        .from("recharges")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRecharges(data || []);
    } catch (error) {
      console.error("获取充值记录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await supabase.from("recharges").update({ status: "approved" }).eq("id", id);
    fetchRecharges();
  };

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="p-1">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
            充值管理
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left font-medium">ID</th>
                <th className="px-6 py-3 text-left font-medium">用户ID</th>
                <th className="px-6 py-3 text-left font-medium">金额</th>
                <th className="px-6 py-3 text-left font-medium">时间</th>
                <th className="px-6 py-3 text-left font-medium">状态</th>
                <th className="px-6 py-3 text-left font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {recharges.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{item.id}</td>
                  <td className="px-6 py-4">{item.user_id}</td>
                  <td className="px-6 py-4 font-semibold">${item.amount}</td>
                  <td className="px-6 py-4">{item.created_at}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.status === "pending" ? "待处理" : "已批准"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {item.status === "pending" && (
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-full text-xs hover:bg-emerald-700 shadow"
                        >
                          批准
                        </button>
                      )}
                      <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs hover:bg-indigo-700 shadow">
                        详情
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
