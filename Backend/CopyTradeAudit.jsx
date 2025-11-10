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
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      setTotalCount(count || 0);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from("copytrades")
        .select(`
          id, user_id, mentor_id, amount, status, created_at, mentor_commission,
          users (phone_number)
        `)
        .eq("status", "pending")
        .range(from, to)
        .order("id", { ascending: false });

      if (error) throw error;

      const formatted = data.map((item) => ({
        ...item,
        phone_number: item.users?.phone_number || "未知",
      }));

      setAudits(formatted);
    } catch (error) {
      alert("加载数据失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (copytrade) => {
    const { id, user_id, mentor_id, amount, mentor_commission } = copytrade;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("金额无效");
      return;
    }

    try {
      // 1. 检查用户余额
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("available_balance")
        .eq("id", user_id)
        .single();
      if (userError) throw userError;
      if (user.available_balance < parsedAmount) {
        alert("用户余额不足");
        return;
      }

      // 2. 获取该导师当前进行中的上股（status = published）
      const { data: stock, error: stockError } = await supabase
        .from("stocks")
        .select("id")
        .eq("mentor_id", mentor_id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (stockError || !stock?.id) {
        alert("该导师暂无进行中的交易信号，无法批准跟单");
        return;
      }

      // 安全提取 UUID 字符串（防御 Supabase 返回 { value: '...' } 的情况）
      let stockId;
      if (typeof stock.id === "string") {
        stockId = stock.id;
      } else if (stock.id && typeof stock.id === "object" && stock.id.value) {
        stockId = stock.id.value;
      } else {
        console.error("Invalid stock.id format:", stock.id);
        alert("系统错误：无法获取交易信号ID");
        return;
      }

      // 3. 扣减余额 + 创建跟单明细 + 更新状态
      const newBalance = user.available_balance - parsedAmount;

      const { error: balanceError } = await supabase
        .from("users")
        .update({ available_balance: newBalance })
        .eq("id", user_id);
      if (balanceError) throw balanceError;

      const { error: detailError } = await supabase
        .from("copytrade_details")
        .insert({
          user_id,
          mentor_id,
          amount: parsedAmount,
          mentor_commission,
          stock_id: stockId, // 确保是正确的 UUID 字符串
          order_status: "Unsettled",
          order_profit_amount: 0,
          created_at: new Date().toISOString(),
        });
      if (detailError) throw detailError;

      const { error: statusError } = await supabase
        .from("copytrades")
        .update({ status: "approved" })
        .eq("id", id);
      if (statusError) throw statusError;

      alert("跟单已批准！已扣除用户余额并创建跟单记录");
      fetchAudits(currentPage);
    } catch (error) {
      console.error("审批失败:", error);
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
      alert("跟单已拒绝");
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
              <th className="admin-table th">佣金率</th>
              <th className="admin-table th">操作</th>
            </tr>
          </thead>
          <tbody>
            {audits.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500">
                  暂无待审核跟单
                </td>
              </tr>
            ) : (
              audits.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="admin-table td">{a.id}</td>
                  <td className="admin-table td font-medium text-blue-600">{a.phone_number}</td>
                  <td className="admin-table td">{a.user_id}</td>
                  <td className="admin-table td">{a.mentor_id}</td>
                  <td className="admin-table td text-green-600 font-semibold">${a.amount}</td>
                  <td className="admin-table td">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {a.mentor_commission}%
                    </span>
                  </td>
                  <td className="admin-table td space-x-2">
                    <button
                      onClick={() => handleApprove(a)}
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
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-primary text-sm disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            第 {currentPage} / {totalPages} 页（共 {totalCount} 条）
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
