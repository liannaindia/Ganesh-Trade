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
      const { data, error } = await supabase
        .from("recharges")
        .select("*, channels(currency_name)") // 获取通道的币种名称
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 将时间转换为中国时间
      const formattedData = data.map((recharge) => ({
        ...recharge,
        created_at: convertToChinaTime(recharge.created_at),
      }));

      setRecharges(formattedData || []);
    } catch (error) {
      console.error("获取充值记录失败:", error);
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
        return;
      }

      // 计算新的余额
      const newBalance = userData.balance + amount;

      // 更新用户余额
      const { error: balanceError } = await supabase
        .from("users")
        .update({ balance: newBalance })
        .eq("id", user_id);

      if (balanceError) throw balanceError;

      fetchRecharges(); // 刷新充值记录
    } catch (error) {
      console.error("批准充值时出错:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      // 拒绝充值并更新状态为 rejected
      const { error } = await supabase
        .from("recharges")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      fetchRecharges(); // 刷新充值记录
    } catch (error) {
      console.error("拒绝充值时出错:", error);
    }
  };

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
            {recharges.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 text-center align-middle">
                <td className="px-4 py-3">{r.id}</td>
                <td className="px-4 py-3">{r.user_id}</td>
                <td className="px-4 py-3 text-blue-600 font-semibold">${r.amount}</td>
                <td className="px-4 py-3">{r.channels?.currency_name}</td>
                <td className="px-4 py-3 text-gray-500">{r.created_at}</td> {/* 显示转换后的时间 */}
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
                        onClick={() => handleApprove(r.id, r.user_id, r.amount)} // 调用 handleApprove 函数
                        className="text-green-600 hover:text-green-800 mr-3"
                      >
                        批准
                      </button>
                      <button
                        onClick={() => handleReject(r.id)} // 调用 handleReject 函数
                        className="text-red-600 hover:text-red-800"
                      >
                        拒绝
                      </button>
                    </>
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
