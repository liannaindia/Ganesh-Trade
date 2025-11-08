import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function StockManagement() {
  const [stocks, setStocks] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newStock, setNewStock] = useState({
    mentor_id: "",
    crypto_name: "",
    buy_price: "",
    sell_price: "",
  });

  useEffect(() => {
    fetchMentors();
    fetchStocks();
  }, []);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase.from("mentors").select("id, name");
      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error("获取导师失败:", error);
      alert("加载导师列表失败");
    }
  };

  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase.from("stocks").select("*");
      if (error) throw error;

      // 为每个 stock 计算跟单数量（approved 状态）
      const stocksWithCount = await Promise.all(
        data.map(async (stock) => {
          if (!stock.mentor_id) return { ...stock, copytrade_count: 0 };

          const { count, error: countError } = await supabase
            .from("copytrades")
            .select("id", { count: "exact", head: true })
            .eq("mentor_id", stock.mentor_id)
            .eq("status", "approved");

          if (countError) console.error("计算跟单数量失败:", countError);

          return { ...stock, copytrade_count: count || 0 };
        })
      );

      setStocks(stocksWithCount);
    } catch (error) {
      console.error("获取上股信息失败:", error);
      alert("加载失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!newStock.mentor_id || !newStock.crypto_name || !newStock.buy_price || !newStock.sell_price) {
      alert("请填写所有字段");
      return;
    }

    try {
      const { error } = await supabase.from("stocks").insert({
        mentor_id: parseInt(newStock.mentor_id),
        crypto_name: newStock.crypto_name.trim(),
        buy_price: parseFloat(newStock.buy_price),
        sell_price: parseFloat(newStock.sell_price),
        status: "pending",
      });

      if (error) throw error;

      setNewStock({ mentor_id: "", crypto_name: "", buy_price: "", sell_price: "" });
      setIsAdding(false);
      fetchStocks();
      alert("上股添加成功");
    } catch (error) {
      console.error("添加失败:", error);
      alert("添加失败: " + error.message);
    }
  };

  const handlePublish = async (id) => {
    try {
      const { error } = await supabase
        .from("stocks")
        .update({ status: "published" })
        .eq("id", id);

      if (error) throw error;
      fetchStocks();
      alert("上架成功");
    } catch (error) {
      alert("上架失败: " + error.message);
    }
  };

  const handleSettle = async (stock) => {
    if (!window.confirm(`确认结算【${stock.crypto_name}】？`)) return;

    try {
      // 1. 获取导师佣金率
      const { data: mentor, error: mentorError } = await supabase
        .from("mentors")
        .select("commission")
        .eq("id", stock.mentor_id)
        .single();

      if (mentorError || !mentor) throw new Error("导师不存在");

      const commissionRate = mentor.commission / 100;

      // 2. 获取该导师所有 approved 跟单
      const { data: copytrades, error: ctError } = await supabase
        .from("copytrades")
        .select("id, user_id, amount")
        .eq("mentor_id", stock.mentor_id)
        .eq("status", "approved");

      if (ctError) throw ctError;
      if (!copytrades || copytrades.length === 0) {
        alert("无待结算跟单");
        return;
      }

      // 3. 逐个结算
      for (const ct of copytrades) {
        const profit = ct.amount * (stock.sell_price - stock.buy_price) / stock.buy_price;
        const commission = profit * commissionRate;
        const netProfit = profit - commission;

        // 更新用户余额
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("balance, available_balance")
          .eq("id", ct.user_id)
          .single();

        if (userError) throw userError;

        const newBalance = user.balance + ct.amount + netProfit;
        const newAvailableBalance = user.available_balance + ct.amount + netProfit;

        await supabase
          .from("users")
          .update({ balance: newBalance, available_balance: newAvailableBalance })
          .eq("id", ct.user_id);

        // 更新 copytrade_details
        await supabase
          .from("copytrade_details")
          .update({
            order_profit_amount: netProfit,
            order_status: "Settled",
          })
          .eq("user_id", ct.user_id)
          .eq("mentor_id", stock.mentor_id);

        // 更新 copytrades 状态
        await supabase
          .from("copytrades")
          .update({ status: "settled" })
          .eq("id", ct.id);
      }

      // 4. 更新 stock 状态
      await supabase.from("stocks").update({ status: "settled" }).eq("id", stock.id);

      fetchStocks();
      alert(`结算完成！共处理 ${copytrades.length} 条跟单`);
    } catch (error) {
      console.error("结算失败:", error);
      alert("结算失败: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2">加载中...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">上股管理</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
          >
            {isAdding ? "取消" : "添加上股"}
          </button>
          <button
            onClick={fetchStocks}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            刷新
          </button>
        </div>
      </div>

      {/* 添加表单 */}
      {isAdding && (
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">选择导师</label>
              <select
                value={newStock.mentor_id}
                onChange={(e) => setNewStock({ ...newStock, mentor_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- 选择导师 --</option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (ID: {m.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">币种名称</label>
              <input
                type="text"
                value={newStock.crypto_name}
                onChange={(e) => setNewStock({ ...newStock, crypto_name: e.target.value })}
                placeholder="e.g., Bitcoin (BTC)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">买入价格</label>
              <input
                type="number"
                step="0.00000001"
                value={newStock.buy_price}
                onChange={(e) => setNewStock({ ...newStock, buy_price: e.target.value })}
                placeholder="e.g., 50000.12345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">卖出价格</label>
              <input
                type="number"
                step="0.00000001"
                value={newStock.sell_price}
                onChange={(e) => setNewStock({ ...newStock, sell_price: e.target.value })}
                placeholder="e.g., 55000.87654321"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleAddStock}
            className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            确认添加
          </button>
        </div>
      )}

      {/* 表格 */}
      <div className="overflow-auto max-h-[80vh]">
        <table className="w-full table-fixed text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[180px] px-4 py-3 text-center font-semibold uppercase text-gray-600">币种</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">买入价</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">卖出价</th>
              <th className="w-[100px] px-4 py-3 text-center font-semibold uppercase text-gray-600">跟单数</th>
              <th className="w-[100px] px-4 py-3 text-center font-semibold uppercase text-gray-600">状态</th>
              <th className="w-[200px] px-4 py-3 text-center font-semibold uppercase text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stocks.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500">
                  暂无上股记录
                </td>
              </tr>
            ) : (
              stocks.map((stock) => (
                <tr key={stock.id} className="hover:bg-gray-50 text-center align-middle">
                  <td className="px-4 py-3 font-medium">{stock.crypto_name}</td>
                  <td className="px-4 py-3 text-blue-600 font-semibold">${stock.buy_price}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">${stock.sell_price}</td>
                  <td className="px-4 py-3">{stock.copytrade_count}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        stock.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : stock.status === "published"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {stock.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-1">
                    {stock.status === "pending" && (
                      <button
                        onClick={() => handlePublish(stock.id)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        上架
                      </button>
                    )}
                    {stock.status === "published" && (
                      <button
                        onClick={() => handleSettle(stock)}
                        className="text-purple-600 hover:text-purple-800 text-sm"
                      >
                        结算
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-800 text-sm">编辑</button>
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
