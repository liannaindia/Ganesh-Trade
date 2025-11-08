import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function WithdrawManagement() {
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdraws();
  }, []);

  const fetchWithdraws = async () => {
    try {
      const { data, error } = await supabase
        .from("withdraws")
        .select(`
          id, user_id, amount, status, created_at, wallet_address, channel,
          users (phone_number)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const formatted = data.map(w => ({
        ...w,
        phone_number: w.users?.phone_number || "未知",
        created_at: formatChinaTime(w.created_at),
      }));

      setWithdraws(formatted);
    } catch (error) {
      console.error("获取提款记录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatChinaTime = (utcTime) => {
    const date = new Date(utcTime);
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai",
    }).format(date);
  };

  const handleApprove = async (id, amount, userId) => {
    try {
      // 1. 更新提款状态
      const { error: statusError } = await supabase
        .from("withdraws")
        .update({ status: "approved" })
        .eq("id", id);
      if (statusError) throw statusError;

      // 2. 扣减用户余额
      const { error: balanceError } = await supabase
        .rpc("decrement_balance", { user_id: userId, amount });
      if (balanceError) throw balanceError;

      alert("提款已批准！");
      fetchWithdraws();
    } catch (error) {
      console.error("批准提款失败:", error);
      alert("操作失败: " + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from("withdraws")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;

      alert("提款已拒绝！");
      fetchWithdraws();
    } catch (error) {
      console.error("拒绝提款失败:", error);
      alert("操作失败: " + error.message);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">提款管理</h2>
        <button
          onClick={fetchWithdraws}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          刷新
        </button>
      </div>

      <div className="overflow-auto max-h-[80vh]">
        <table className="w-full text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[80px] px-4 py-3 text-center font-semibold uppercase text-gray-600">ID</th>
              <th className="w-[140px] px-4 py-3 text-center font-semibold uppercase text-gray-600">手机号</th>
              <th className="w-[100px] px-4 py-3 text-center font-semibold uppercase text-gray-600">用户ID</th>
              <th className="w-[100px] px-4 py-3 text-center font-semibold uppercase text-gray-600">金额</th>
              <th className="w-[160px] px-4 py-3 text-center font-semibold uppercase text-gray-600">时间</th>
              <th className="w-[100px] px-4 py-3 text-center font-semibold uppercase text-gray-600">状态</th>
              <th className="w-[180px] px-4 py-3 text-center font-semibold uppercase text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {withdraws.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500">
                  暂无提款记录
                </td>
              </tr>
            ) : (
              withdraws.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 text-center align-middle">
                  <td className="px-4 py-3">{item.id}</td>
                  <td className="px-4 py-3 font-medium text-blue-600">{item.phone_number}</td>
                  <td className="px-4 py-3">{item.user_id}</td>
                  <td className="px-4 py-3 text-red-600 font-semibold">-${item.amount}</td>
                  <td className="px-4 py-3 text-gray-500">{item.created_at}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : item.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status === "pending" ? "待审" : item.status === "approved" ? "已批准" : "已拒绝"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(item.id, item.amount, item.user_id)}
                          className="text-green-600 hover:text-green-800 mr-3"
                        >
                          批准
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          拒绝
                        </button>
                      </>
                    )}
                    {item.status !== "pending" && (
                      <span className="text-gray-500">操作已完成</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
