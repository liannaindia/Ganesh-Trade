import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function RechargeManagement() {
  const [recharges, setRecharges] = useState([]);
  const [channels, setChannels] = useState([]); // 存储充值通道信息
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecharges();
    fetchChannels(); // 获取充值通道数据
  }, []);

  const fetchRecharges = async () => {
    try {
      setLoading(true);
      // 1. 查询所有充值记录
      const { data: rechargesData, error: rechargeError } = await supabase
        .from("recharges")
        .select("id, user_id, amount, channel_id, status, created_at")
        .order("created_at", { ascending: false });

      if (rechargeError) throw rechargeError;

      // 2. 提取所有 channel_id（去重）
      const channelIds = [...new Set(rechargesData.map(r => r.channel_id).filter(Boolean))];

      // 3. 批量查询 channels
      let channelMap = {};
      if (channelIds.length > 0) {
        const { data: channelsData, error: channelError } = await supabase
          .from("channels")
          .select("id, currency_name")
          .in("id", channelIds);

        if (channelError) throw channelError;

        // 构建 id → name 映射
        channelMap = Object.fromEntries(
          channelsData.map(c => [c.id, c.currency_name])
        );
      }

      // 4. 合并数据 + 格式化时间
      const formattedData = rechargesData.map((r) => ({
        ...r,
        currency_name: channelMap[r.channel_id] || "未知通道",
        created_at: convertToChinaTime(r.created_at),
      }));

      setRecharges(formattedData || []);
    } catch (error) {
      console.error("获取充值记录失败:", error);
      alert("加载充值记录失败，请刷新页面重试。");
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("channels")
        .select("*");
      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error("获取充值通道失败:", error);
    }
  };

  // 将UTC时间转换为中国时间
  const convertToChinaTime = (utcTime) => {
    const date = new Date(utcTime); // 将 UTC 时间转换为 Date 对象
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Shanghai", // 设置时区为中国时间
    };
    return new Intl.DateTimeFormat("zh-CN", options).format(date);
  };

  const handleApprove = async (id, user_id, amount) => {
    try {
      // 批准充值并更新状态为 approved
      const { error: updateError } = await supabase
        .from("recharges")
        .update({ status: "approved" })
        .eq("id", id);

      if (updateError) throw updateError;

      // 获取当前用户的余额
      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("balance")
        .eq("id", user_id)
        .single();

      if (fetchError) {
        console.error("获取用户余额失败:", fetchError);
        alert("获取用户余额失败，请重试。");
        return;
      }

      // 计算新的余额
      const newBalance = userData.balance + amount;

      // 更新用户余额
      const { error: balanceError } = await supabase
        .from("users")
        .update({ balance: newBalance })
        .eq("id", user_id);

      if (balanceError) {
        console.error("更新用户余额失败:", balanceError);
        alert("更新余额失败，请重试。");
        return;
      }

      // 刷新充值记录
      fetchRecharges();
      alert("充值批准成功！");
    } catch (error) {
      console.error("批准充值失败:", error);
      alert("批准失败: " + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from("recharges")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      // 刷新充值记录
      fetchRecharges();
      alert("充值已拒绝！");
    } catch (error) {
      console.error("拒绝充值失败:", error);
      alert("拒绝失败: " + error.message);
    }
  };

  // 计算总页数
  const totalPages = Math.ceil(recharges.length / 10); // 假设每页10条

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">加载充值记录中...</p>
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
            {recharges.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  暂无充值记录
                </td>
              </tr>
            ) : (
              recharges.map((r) => (
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
                      {r.status === "pending"
                        ? "待审批"
                        : r.status === "approved"
                        ? "已批准"
                        : "已拒绝"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "pending" && (
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
                    )}
                    {r.status !== "pending" && (
                      <span className="text-gray-500">操作已完成</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页控件（如果需要） */}
      {recharges.length > 10 && (
        <div className="p-4 border-t border-gray-200 flex justify-center items-center space-x-2">
          <button
            onClick={() => {/* 上一页逻辑 */}}
            disabled={/* 当前页 === 1 */}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            第 {1} 页 / 共 {totalPages} 页 (总 {recharges.length} 条)
          </span>
          <button
            onClick={() => {/* 下一页逻辑 */}}
            disabled={/* 当前页 === totalPages */}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
