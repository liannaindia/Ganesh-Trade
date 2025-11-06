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

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">跟单审核</h2>
        <button
          onClick={fetchAudits}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          刷新
        </button>
      </div>

      <div className="overflow-auto max-h-[80vh]">
        <table className="w-full table-fixed text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[80px] px-4 py-3 text-center font-semibold uppercase text-gray-600">ID</th>
              <th className="w-[140px] px-4 py-3 text-center font-semibold uppercase text-gray-600">用户</th>
              <th className="w-[140px] px-4 py-3 text-center font-semibold uppercase text-gray-600">导师</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">金额</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">状态</th>
              <th className="w-[180px] px-4 py-3 text-center font-semibold uppercase text-gray-600">操作</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {audits.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 text-center align-middle">
                <td className="px-4 py-3">{a.id}</td>
                <td className="px-4 py-3">{a.user_id}</td>
                <td className="px-4 py-3">{a.mentor_id}</td>
                <td className="px-4 py-3 text-blue-600 font-semibold">${a.amount}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    待审
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleApprove(a.id)}
                    className="text-green-600 hover:text-green-800 mr-3"
                  >
                    批准
                  </button>
                  <button
                    onClick={() => handleReject(a.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    拒绝
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
