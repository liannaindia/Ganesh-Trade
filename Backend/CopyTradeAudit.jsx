import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function CopyTradeAudit() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10; // 每页显示10条数据

  useEffect(() => {
    fetchAudits(currentPage);
  }, [currentPage]);

  // 从 copytrades 表获取分页的跟单数据
  const fetchAudits = async (page) => {
    try {
      setLoading(true);
      // 获取总条数
      const { count, error: countError } = await supabase
        .from("copytrades")
        .select("*", { count: "exact", head: true });
      if (countError) throw countError;
      setTotalCount(count || 0);

      // 获取分页数据
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from("copytrades")
        .select("*")
        .range(from, to)
        .order("id", { ascending: false }); // 可选：按ID降序排序，新数据在前
      if (error) throw error;
      setAudits(data || []);
    } catch (error) {
      console.error("获取跟单审核失败:", error);
      alert("获取数据失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 批准跟单操作
  const handleApprove = async (id, userId, amount) => {
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("无效的金额");
      }

      // 获取用户可用余额
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("available_balance")
        .eq("id", userId)
        .single();
      if (userError) throw userError;

      if (userData.available_balance < parsedAmount) {
        alert("用户余额不足，无法批准");
        return;
      }

      const newBalance = userData.available_balance - parsedAmount;

      // 更新 copytrades 表中的 status 为 "approved"
      const { error: updateError } = await supabase
        .from("copytrades")
        .update({ status: "approved" })
        .eq("id", id);
      if (updateError) throw updateError;

      // 更新用户的 available_balance 和 follow_status
      const { error: updateUserError } = await supabase
        .from("users")
        .update({ available_balance: newBalance, follow_status: "following" })
        .eq("id", userId);
      if (updateUserError) throw updateUserError;

      // 成功后刷新当前页
      fetchAudits(currentPage);
      alert("批准成功");
    } catch (error) {
      console.error("批准操作失败:", error);
      alert("操作失败: " + error.message);
    }
  };

  // 拒绝跟单操作
  const handleReject = async (id) => {
    try {
      // 先获取 copytrades 的 user_id 和 mentor_id
      const { data: copytradeData, error: fetchError } = await supabase
        .from("copytrades")
        .select("user_id, mentor_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (!copytradeData) throw new Error("跟单记录不存在");

      const { user_id, mentor_id } = copytradeData;

      // 更新 copytrades 表中的 status 为 "rejected"
      const { error: rejectError } = await supabase
        .from("copytrades")
        .update({ status: "rejected" })
        .eq("id", id);
      if (rejectError) throw rejectError;

      // 更新 copytrade_details 表中的 order_status 为 "rejected"（匹配 user_id 和 mentor_id）
      const { error: detailsError } = await supabase
        .from("copytrade_details")
        .update({ order_status: "rejected" })
        .eq("user_id", user_id)
        .eq("mentor_id", mentor_id);

      if (detailsError) throw detailsError;

      // 刷新当前页
      fetchAudits(currentPage);
      alert("拒绝成功");
    } catch (error) {
      console.error("拒绝操作失败:", error);
      alert("操作失败: " + error.message);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">跟单审核</h2>
        <button
          onClick={() => fetchAudits(currentPage)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          刷新
        </button>
      </div>
      <div className="overflow-auto max-h-[80vh]">
        <table className="w-full table-fixed text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[140px] px-4 py-3 text-center font-semibold uppercase text-gray-600">用户</th>
              <th className="w-[140px] px-4 py-3 text-center font-semibold uppercase text-gray-600">导师</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">金额</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">状态</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">佣金</th>
              <th className="w-[180px] px-4 py-3 text-center font-semibold uppercase text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {audits.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-3 text-center text-gray-500">无数据</td>
              </tr>
            ) : (
              audits.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 text-center align-middle">
                  <td className="px-4 py-3">{a.user_phone_number || "无"}</td>
                  <td className="px-4 py-3">{a.mentor_id}</td>
                  <td className="px-4 py-3 text-blue-600 font-semibold">{a.amount}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      {a.status === "pending" ? "待审" : a.status === "approved" ? "已批准" : a.status === "rejected" ? "已拒绝" : "未知"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {a.mentor_commission}% {/* 显示导师佣金 */}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleApprove(a.id, a.user_id, a.amount)}
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
                      </>
                    ) : (
                      <span className="text-gray-400">操作已完成</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* 分页控件 */}
      <div className="p-4 border-t border-gray-200 flex justify-center items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          上一页
        </button>
        <span className="text-sm text-gray-600">
          第 {currentPage} 页 / 共 {totalPages} 页 (总 {totalCount} 条)
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          下一页
        </button>
      </div>
    </div>
  );
}
