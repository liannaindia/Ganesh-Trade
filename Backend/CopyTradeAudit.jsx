// src/Backend/CopyTradeAudit.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function CopyTradeAudit() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const { data, error } = await supabase
        .from("copytrades")
        .select("*")
        .eq("status", "pending");
      if (error) throw error;
      setAudits(data || []);
    } catch (error) {
      console.error("获取跟单审核失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await supabase.from("copytrades").update({ status: "approved" }).eq("id", id);
    fetchAudits();
  };

  const handleReject = async (id) => {
    await supabase.from("copytrades").update({ status: "rejected" }).eq("id", id);
    fetchAudits();
  };

  if (loading) return <div className="p-6">加载中...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          跟单审核
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left font-medium">ID</th>
              <th className="px-6 py-3 text-left font-medium">用户</th>
              <th className="px-6 py-3 text-left font-medium">导师</th>
              <th className="px-6 py-3 text-left font-medium">金额</th>
              <th className="px-6 py-3 text-left font-medium">状态</th>
              <th className="px-6 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {audits.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">{item.id}</td>
                <td className="px-6 py-4">{item.user_id}</td>
                <td className="px-6 py-4">{item.mentor_id}</td>
                <td className="px-6 py-4 font-semibold">${item.amount}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                    待审
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-full text-xs hover:bg-emerald-700 shadow"
                    >
                      批准
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="px-3 py-1.5 bg-rose-500 text-white rounded-full text-xs hover:bg-rose-600 shadow"
                    >
                      拒绝
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
