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

      // 1. 查询当前页的充值记录
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: rechargesData, error: rechargeError, count } = await supabase
        .from("recharges")
        .select("id, user_id, amount, channel_id, status, created_at", { count: "exact" })
        .range(from, to)
        .order("created_at", { ascending: false });

      if (rechargeError) throw rechargeError;

      // 2. 提取 channel_id 去重
      const channelIds = [...new Set(rechargesData.map(r => r.channel_id).filter(Boolean))];

      // 3. 批量查询 channels
      let channelMap = {};
      if (channelIds.length > 0) {
        const { data: channelsData, error: channelError } = await supabase
          .from("channels")
          .select("id, currency_name")
          .in("id", channelIds);

        if (channelError) throw channelError;

        channelMap = Object.fromEntries(
          channelsData.map(c => [c.id, c.currency_name])
        );
      }

      // 4. 合并 + 格式化时间
      const formattedData = rechargesData.map((r) => ({
        ...r,
        currency_name: channelMap[r.channel_id] || "未知通道",
        created_at: convertToChinaTime(r.created_at),
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
  const convertToChinaTime = (utcTime) => {
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
      const { error: updateError } = await supabase
        .from("recharges")
        .update({ status: "approved" })
        .eq("id", id);
      if (updateError) throw updateError;

      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("balance")
        .eq("id", user_id)
        .single();
      if (fetchError) throw fetchError;

      const { error: balanceError } = await supabase
        .from("users")
        .update({ balance: userData.balance + amount })
        .eq("id", user_id);
      if (balanceError) throw balanceError;

      fetchRecharges();
      alert("已批准充值");
    } catch (error) {
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

      fetchRecharges();
      alert("已拒绝充值");
    } catch (error) {
      alert("操作失败: " + error.message);
    }
  };

  const totalPages = Math.ceil(recharges.total / pageSize) || 1;

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">加载中...</p>
      </div>
    );
  }

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
        <table className="w-full table-fixed text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[140px] px-4 py-3 text-center font-semibold uppercase text-gray-600">用户ID</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">金额</th>
              <th className="w-[200px] px-4 py-3 text-center font-semibold uppercase text-gray-600">通道</th>
              <th className="w-[200px] px-4 py-3 text-center font-semibold uppercase text-gray-600">时间</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">状态</th>
              <th className="w-[180px] px-4 py-3 text-center font-semibold uppercase text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recharges.data.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  暂无充值记录
                </td>
              </tr>
            ) : (
              recharges.data.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 text-center align-middle">
                  <td className="px-4 py-3">{r.user_id}</td>
                  <td className="px-4 py-3 text-blue-600 font-semibold">${r.amount}</td>
                  <td className="px-4 py-3">{r.currency_name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.created_at}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            第 {currentPage} 页 / 共 {totalPages} 页 (总 {recharges.total} 条)
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
