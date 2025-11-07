import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function WithdrawManagement() {
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdraws();
  }, []);

  // 获取提款记录
  const fetchWithdraws = async () => {
    try {
      const { data, error } = await supabase
        .from("withdraws")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setWithdraws(data || []);
    } catch (error) {
      console.error("获取提款记录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 批准提款并扣除金额
  const handleApprove = async (id, amount, userId) => {
    try {
      // 批准提款
      const { error: updateError } = await supabase
        .from("withdraws")
        .update({ status: "approved" })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }

      // 扣除金额
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("balance")
        .eq("id", userId)
        .single();

      if (userError) {
        throw userError;
      }

      const newBalance = userData.balance - amount;

      // 更新用户余额
      const { error: balanceError } = await supabase
        .from("users")
        .update({ balance: newBalance })
        .eq("id", userId);

      if (balanceError) {
        throw balanceError;
      }

      // 刷新数据
      fetchWithdraws();
    } catch (error) {
      console.error("批准提款失败:", error);
    }
  };

  // 拒绝提款
  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from("withdraws")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) {
        throw error;
      }

      // 刷新数据
      fetchWithdraws();
    } catch (error) {
      console.error("拒绝提款失败:", error);
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
        <table className="w-full table-fixed text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[140px] px-4 py-3 text-center font-semibold uppercase text-gray-600">用户ID</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">金额</th>
              <th className="w-[200px] px-4 py-3 text-center font-semibold uppercase text-gray-600">时间</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">状态</th>
              <th className="w-[180px] px-4 py-3 text-center font-semibold uppercase text-gray-600">操作</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {withdraws.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 text-center align-middle">
                <td className="px-4 py-3">{item.user_id}</td>
                <td className="px-4 py-3 text-blue-600 font-semibold">${item.amount}</td>
                <td className="px-4 py-3 text-gray-500">{item.created_at}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : item.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.status}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
