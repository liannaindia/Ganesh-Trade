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

  const fetchAudits = async (page) => {
    try {
      setLoading(true);
      const { count } = await supabase
        .from("copytrades")
        .select("*", { count: "exact", head: true });
      setTotalCount(count || 0);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from("copytrades")
        .select(`
          id, user_id, mentor_id, amount, status, created_at, updated_at, mentor_commission,
          users (phone_number)
        `)
        .range(from, to)
        .order("id", { ascending: false });

      if (error) throw error;

      const formatted = data.map((item) => ({
        ...item,
        phone_number: item.users?.phone_number || "未知",
      }));

      setAudits(formatted);
    } catch (error) {
      alert("获取数据失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, userId, amount) => {
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) throw new Error("无效的金额");

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

      const { error: updateError } = await supabase
        .from("copytrades")
        .update({ status: "approved" })
        .eq("id", id);
      if (updateError) throw updateError;

      const { error: updateUserError } = await supabase
        .from("users")
        .update({ available_balance: newBalance })
        .eq("id", userId);
      if (updateUserError) throw updateUserError;

      alert("跟单已批准！");
      fetchAudits(currentPage);
    } catch (error) {
      alert("操作失败: " + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from("copytrades")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;
      alert("跟单已拒绝！");
      fetchAudits(currentPage);
    } catch (error) {
      alert("操作失败: " + error.message);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="admin-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">跟单审核</h2>
        <button onClick={() => fetchAudits(currentPage)} className="btn-primary text-sm">
          刷新
        </button>
      </div>

      <div className="overflow-auto max-h-[80vh]">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table th">ID</th>
              <th className="admin-table th">手机号</th>
              <th className="admin-table th">用户ID</th>
              <th className="admin-table th">导师ID</th>
              <th className="admin-table th">金额</th>
              <th className="admin-table th">状态</th>
              <th className="admin-table th">佣金</th>
              <th className="admin-table th">操作</th>
            </tr>
          </thead>
          <tbody>
            {audits.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500">
                  暂无待审核跟单
                </td>
              </tr>
            ) : (
              audits.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="admin-table td">{a.id}</td>
                  <td className="admin-table td font-medium text-blue-600">
                    {a.phone_number}
                  </td>
                  <td className="admin-table td">{a.user_id}</td>
                  <td className="admin-table td">{a.mentor_id}</td>
                  <td className="admin-table td text-green-600 font-semibold">
                    ${a.amount}
                  </td>
                  <td className="admin-table td">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : a.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {a.status === "pending"
                        ? "待审"
                        : a.status === "approved"
                        ? "已批准"
                        : "已拒绝"}
                    </span>
                  </td>
                  <td className="admin-table td">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {a.mentor_commission}%
                    </span>
                  </td>
                  <td className="admin-table td space-x-2">
                    {a.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleApprove(a.id, a.user_id, a.amount)}
                          className="btn-primary text-xs"
                        >
                          批准
                        </button>
                        <button
                          onClick={() => handleReject(a.id)}
                          className="btn-danger text-xs"
                        >
                          拒绝
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">操作已完成</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalCount > pageSize && (
        <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-primary text-sm disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            第 {currentPage} / {totalPages} 页 (总 {totalCount} 条)
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn-primary text-sm disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
