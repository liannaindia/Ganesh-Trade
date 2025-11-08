import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function StockManagement() {
  const [stocks, setStocks] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStock, setNewStock] = useState({
    mentor_id: "",
    crypto_code: "",
    buy_price: "",
    sell_price: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchStocks();
    fetchMentors();
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

      // 为每个 stock 计算跟单数量
      const stocksWithCounts = await Promise.all(
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

      setStocks(stocksWithCounts);
    } catch (error) {
      console.error("获取上股信息失败:", error);
      alert("加载上股列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!newStock.mentor_id || !newStock.crypto_code || !newStock.buy_price || !newStock.sell_price) {
      alert("请填写所有字段");
      return;
    }

    try {
      const { error } = await supabase.from("stocks").insert({
        mentor_id: parseInt(newStock.mentor_id),
        crypto_code: newStock.crypto_code,
        buy_price: parseFloat(newStock.buy_price),
        sell_price: parseFloat(newStock.sell_price),
        status: "pending",
        // 可选：name = crypto_code, price = sell_price 等
        name: newStock.crypto_code,
        price: parseFloat(newStock.sell_price),
      });

      if (error) throw error;

      setNewStock({ mentor_id: "", crypto_code: "", buy_price: "", sell_price: "" });
      setIsAdding(false);
      fetchStocks();
      alert("上股添加成功");
    } catch (error) {
      console.error("添加上股失败:", error);
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
      console.error("上架失败:", error);
      alert("上架失败: " + error.message);
    }
  };

  const handleSettle = async (stock) => {
    if (!window.confirm(`确认结算导师ID ${stock.mentor_id} 的所有跟单？`)) return;

    try {
      // 1. 获取导师佣金率
      const { data: mentor, error: mentorError } = await supabase
        .from("mentors")
        .select("commission")
        .eq("id", stock.mentor_id)
        .single();

      if (mentorError || !mentor) throw new Error("导师信息不存在");

      const commissionRate = mentor.commission / 100;

      // 2. 获取该导师的所有 approved 跟单
      const { data: copytrades, error: copyError } = await supabase
        .from("copytrades")
        .select("id, user_id, amount")
        .eq("mentor_id", stock.mentor_id)
        .eq("status", "approved");

      if (copyError) throw copyError;
      if (copytrades.length === 0) {
        alert("无待结算跟单");
        return;
      }

      // 3. 批量结算每个跟单
      for (const ct of copytrades) {
        // 计算利润和佣金
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

        const { error: updateUserError } = await supabase
          .from("users")
          .update({ balance: newBalance, available_balance: newAvailableBalance })
          .eq("id", ct.user_id);

        if (updateUserError) throw updateUserError;

        // 更新 copytrade_details (假设 id 对应，或通过 copytrade_id 关联；这里假设 copytrade_details.user_id 和 mentor_id 匹配)
        const { error: detailError } = await supabase
          .from("copytrade_details")
          .update({
            order_profit_amount: netProfit,
            order_status: "Settled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", ct.user_id)
          .eq("mentor_id", stock.mentor_id);

        if (detailError) throw detailError;

        // 更新 copytrades 状态
        const { error: ctError } = await supabase
          .from("copytrades")
          .update({ status: "settled" })
          .eq("id", ct.id);

        if (ctError) throw ctError;
      }

      // 4. 更新 stock 状态为 settled 或删除
      await supabase.from("stocks").update({ status: "settled" }).eq("id", stock.id);

      fetchStocks();
      alert("结算完成，所有跟单已处理");
    } catch (error) {
      console.error("结算失败:", error);
      alert("结算失败: " + error.message);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">上股管理</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
        >
          {isAdding ? "取消添加" : "添加上股"}
        </button>
      </div>

      {/* 添加上股表单 */}
      {isAdding && (
        <div className="p-6 border-b border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">选择导师</label>
              <select
                value={newStock.mentor_id}
                onChange={(e) => setNewStock({ ...newStock, mentor_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">虚拟货币代码</label>
              <input
                type="text"
                value={newStock.crypto_code}
                onChange={(e) => setNewStock({ ...newStock, crypto_code: e.target.value })}
                placeholder="e.g., BTC"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">买入价格</label>
                <input
                  type="number"
                  value={newStock.buy_price}
                  onChange={(e) => setNewStock({ ...newStock, buy_price: e.target.value })}
                  placeholder="e.g., 50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">卖出价格</label>
                <input
                  type="number"
                  value={newStock.sell_price}
                  onChange={(e) => setNewStock({ ...newStock, sell_price: e.target.value })}
                  placeholder="e.g., 55000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleAddStock}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              添加上股
            </button>
          </div>
        </div>
      )}

      <div className="overflow-auto max-h-[80vh]">
        <table className="w-full table-fixed text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">代码</th>
              <th className="w-[200px] px-4 py-3 text-center font-semibold uppercase text-gray-600">名称</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">买入价</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">卖出价</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">跟单数量</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">状态</th>
              <th className="w-[200px] px-4 py-3 text-center font-semibold uppercase text-gray-600">操作</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {stocks.map((stock) => (
              <tr key={stock.id} className="hover:bg-gray-50 text-center align-middle">
                <td className="px-4 py-3">{stock.code || stock.crypto_code}</td>
                <td className="px-4 py-3">{stock.name}</td>
                <td className="px-4 py-3 text-blue-600 font-semibold">${stock.buy_price}</td>
                <td className="px-4 py-3 text-blue-600 font-semibold">${stock.sell_price}</td>
                <td className="px-4 py-3">{stock.copytrade_count}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
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
                <td className="px-4 py-3">
                  {stock.status === "pending" && (
                    <button
                      onClick={() => handlePublish(stock.id)}
                      className="text-green-600 hover:text-green-800 mr-3"
                    >
                      上架
                    </button>
                  )}
                  {stock.status === "published" && (
                    <button
                      onClick={() => handleSettle(stock)}
                      className="text-purple-600 hover:text-purple-800 mr-3"
                    >
                      结算
                    </button>
                  )}
                  <button className="text-blue-600 hover:text-blue-800">编辑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
