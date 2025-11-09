import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function CopyTradeAudit() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchAudits(currentPage);
  }, [currentPage]);

  // 获取跟单数据 + 关联用户手机号
  const fetchAudits = async (page) => {
    try {
      setLoading(true);

      // 1. 获取总条数
      const { count, error: countError } = await supabase
        .from("copytrades")
        .select("*", { count: "exact", head: true });
      if (countError) throw countError;
      setTotalCount(count || 0);

      // 2. 分页 + JOIN users 表获取 phone_number
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from("copytrades")
        .select(`
          id,
          user_id,
          mentor_id,
          amount,
          status,
          created_at,
          updated_at,
          mentor_commission,
          users (phone_number)
        `)
        .range(from, to)
        .order("id", { ascending: false });

      if (error) throw error;

      // 3. 格式化数据（展开 users.phone_number）
      const formattedData = data.map((item) => ({
        ...item,
        phone_number: item.users?.phone_number || "未知",
      }));

      setAudits(formattedData);
    } catch (error) {
      console.error("获取跟单审核失败:", error);
      alert("获取数据失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 批准跟单
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

      // 更新 copytrades 状态
      const { error: updateError } = await supabase
        .from("copytrades")
        .update({ status: "approved" })
        .eq("id", id);
      if (updateError) throw updateError;

      // 更新用户可用余额
      const { error: updateUserError } = await supabase
        .from("users")
        .update({ available_balance: newBalance })
        .eq("id", userId);
      if (updateUserError) throw updateUserError;

      alert("跟单已批准！");
      fetchAudits(currentPage); // 刷新当前页
    } catch (error) {
      console.error("批准失败:", error);
      alert("操作失败: " + error.message);
    }
  };

  // 拒绝跟单
  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from("copytrades")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;

      alert("跟单已拒绝！");
      fetchAudits(currentPage); // 刷新当前页
    } catch (error) {
      console.error("拒绝失败:", error);
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
        <h2 className="text-xl font-bold text-gray-800">跟

单审核管理</h2>
        <button
          onClick={() => fetchAudits(currentPage)}
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
              <th className="w-[100px] px-4 py-3 text-center font-semibold uppercase text-gray-600">导师ID</th>
              <th className="w-[100px] px-4 py-3 text-center font-semibold uppercase text-gray-600">金额</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">状态</th>
              <th className="w-[100px] px-4 py-3 text-center font-semibold uppercase text-gray-600">佣金率</th>
              <th className="w-[180px] px-4 py-3 text-center font-semibold uppercase text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {audits.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500">
                  暂无待审核跟单
                </td>
              </tr>
            ) : (
              audits.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 text-center align-middle">
                  <td className="px-4 py-3">{a.id}</td>
                  <td className="px-4 py-3 font-medium text-blue-600">
                    {a.phone_number}
                  </td>
                  <td className="px-4 py-3">{a.user_id}</td>
                  <td className="px-4 py-3">{a.mentor_id}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">${a.amount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : a.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {a.status === "pending" ? "待审" : a.status === "approved" ? "已批准" : "已拒绝"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {a.mentor_commission}%
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

      {/* 分页 */}
      {totalCount > pageSize && (
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
      )}
    </div>
  );
}
