import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function RechargeManagement() {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchRecharges();
  }, [currentPage]);

  const fetchRecharges = async () => {
    try {
      setLoading(true);

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      // 1. 分页 + JOIN users 和 channels
      const { data: rechargeData, error: rechargeError, count } = await supabase
        .from("recharges")
        .select(`
          id, user_id, amount, channel_id, status, created_at,
          users (phone_number),
          channels (currency_name)
        `, { count: "exact" })
        .range(from, to)
        .order("created_at", { ascending: false });

      if (rechargeError) throw rechargeError;

      // 2. 格式化数据
      const formattedData = rechargeData.map(r => ({
        ...r,
        phone_number: r.users?.phone_number || "未知",
        currency_name: r.channels?.currency_name || "未知通道",
        created_at: formatChinaTime(r.created_at),
      }));

      setRecharges({ data: formattedData, total: count || 0 });
    } catch (error) {
      console.error("获取充值记录失败:", error);
      alert("加载失败，请刷新重试。");
      setRecharges({ data: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  // 中国时间格式化
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

  const handleApprove = async (id, user_id, amount) => {
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) throw new Error("金额无效");

      // 更新充值状态
      const { error: statusError } = await supabase
        .from("recharges")
        .update({ status: "approved" })
        .eq("id", id);
      if (statusError) throw statusError;

      // 更新用户余额
      const { error: balanceError } = await supabase
        .rpc("increment_balance", { user_id, amount: parsedAmount });
      if (balanceError) throw balanceError;

      alert("充值已批准！");
      fetchRecharges();
    } catch (error) {
      console.error("批准失败:", error);
      alert("操作失败: " + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from("recharges")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;

      alert("充值已拒绝！");
      fetchRecharges();
    } catch (error) {
      console.error("拒绝失败:", error);
      alert("操作失败: " + error.message);
    }
  };

  const totalPages = Math.ceil(recharges.total / pageSize);

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">充值管理</h2>
        <button
          onClick={fetchRecharges}
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
              <th className="w-[100px] px-4 py-3 text-center font-semibold uppercase text-gray-600">通道</th>
              <th className="w-[160px] px-4 py-3 text-center font-semibold uppercase text-gray-600">时间</th>
              <th className="w-[100px] px-4 py-3 text-center font-semibold uppercase text-gray-600">状态</th>
              <th className="w-[180px] px-4 py-3 text-center font-semibold uppercase text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recharges.data.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-gray-500">
                  暂无充值记录
                </td>
              </tr>
            ) : (
              recharges.data.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 text-center align-middle">
                  <td className="px-4 py-3">{r.id}</td>
                  <td className="px-4 py-3 font-medium text-blue-600">{r.phone_number}</td>
                  <td className="px-4 py-3">{r.user_id}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">${r.amount}</td>
                  <td className="px-4 py-3">{r.currency_name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.created_at}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : r.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {r.status === "pending" ? "待审批" : r.status === "approved" ? "已批准" : "已拒绝"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleApprove(r.id, r.user_id, r.amount)}
                          className="text-green-600 hover:text-green-800 mr-3"
                        >
                          批准
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          拒绝
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500">已完成</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {recharges.total > pageSize && (
        <div className="p-4 border-t border-gray-200 flex justify-center items-center space-x-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            第 {currentPage} 页 / 共 {totalPages} 页 (总 {recharges.total} 条)
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
