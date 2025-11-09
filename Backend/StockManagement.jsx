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
  const [selectedStock, setSelectedStock] = useState(null);
  const [copytradeDetails, setCopytradeDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editStock, setEditStock] = useState({
    id: "",
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
        status: "pending", // 默认状态
      });

      if (error) throw error;
      alert("上股添加成功");
      setNewStock({
        mentor_id: "",
        crypto_name: "",
        buy_price: "",
        sell_price: "",
      });
      setIsAdding(false);
      fetchStocks();
    } catch (error) {
      console.error("添加上股失败:", error);
      alert("添加失败: " + error.message);
    }
  };

  const handleCancelAdd = () => {
    setNewStock({
      mentor_id: "",
      crypto_name: "",
      buy_price: "",
      sell_price: "",
    });
    setIsAdding(false);
  };

  const handlePublish = async (id) => {
    try {
      const { error } = await supabase
        .from("stocks")
        .update({ status: "published" })
        .eq("id", id);
      if (error) throw error;
      alert("上股已上架");
      fetchStocks();
    } catch (error) {
      console.error("上架失败:", error);
      alert("操作失败: " + error.message);
    }
  };

  const handleSettle = async (stock) => {
    try {
      const profit = stock.sell_price - stock.buy_price;
      const isProfit = profit > 0;

      const { error: updateError } = await supabase
        .from("stocks")
        .update({ status: "settled" })
        .eq("id", stock.id);
      if (updateError) throw updateError;

      const { data: copytrades, error: copyError } = await supabase
        .from("copytrades")
        .select("id, user_id, amount, mentor_commission")
        .eq("mentor_id", stock.mentor_id)
        .eq("status", "approved");
      if (copyError) throw copyError;

      await Promise.all(
        copytrades.map(async (trade) => {
          const userProfit = (trade.amount / stock.buy_price) * profit;
          const commission = (userProfit * trade.mentor_commission) / 100;
          const netProfit = userProfit - commission;

          const { error: updateUserError } = await supabase
            .rpc("update_balance", {
              p_user_id: trade.user_id,
              p_amount: netProfit,
            });
          if (updateUserError) throw updateUserError;
        })
      );

      alert("结算完成");
      fetchStocks();
    } catch (error) {
      console.error("结算失败:", error);
      alert("操作失败: " + error.message);
    }
  };

  const handleViewCopytrades = async (stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
    setDetailsLoading(true);

    try {
      const { data, error } = await supabase
        .from("copytrades")
        .select(`
          id, user_id, amount, status, mentor_commission, created_at,
          users (phone_number)
        `)
        .eq("mentor_id", stock.mentor_id)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = data.map(item => ({
        ...item,
        phone_number: item.users?.phone_number || "未知",
      }));

      setCopytradeDetails(formatted);
    } catch (error) {
      console.error("获取跟单详情失败:", error);
      alert("加载失败: " + error.message);
      setCopytradeDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEditStock = (stock) => {
    setEditStock({
      id: stock.id,
      mentor_id: stock.mentor_id.toString(),
      crypto_name: stock.crypto_name,
      buy_price: stock.buy_price.toString(),
      sell_price: stock.sell_price.toString(),
    });
    setIsEditing(true);
  };

  const handleUpdateStock = async () => {
    if (!editStock.mentor_id || !editStock.crypto_name || !editStock.buy_price || !editStock.sell_price) {
      alert("请填写所有字段");
      return;
    }

    try {
      const { error } = await supabase
        .from("stocks")
        .update({
          mentor_id: parseInt(editStock.mentor_id),
          crypto_name: editStock.crypto_name.trim(),
          buy_price: parseFloat(editStock.buy_price),
          sell_price: parseFloat(editStock.sell_price),
        })
        .eq("id", editStock.id);

      if (error) throw error;
      alert("上股更新成功");
      setEditStock({
        id: "",
        mentor_id: "",
        crypto_name: "",
        buy_price: "",
        sell_price: "",
      });
      setIsEditing(false);
      fetchStocks();
    } catch (error) {
      console.error("更新上股失败:", error);
      alert("更新失败: " + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditStock({
      id: "",
      mentor_id: "",
      crypto_name: "",
      buy_price: "",
      sell_price: "",
    });
    setIsEditing(false);
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm("确定删除此上股记录吗？这将无法恢复。")) return;

    try {
      const { error } = await supabase
        .from("stocks")
        .delete()
        .eq("id", id);

      if (error) throw error;
      alert("删除成功");
      fetchStocks();
    } catch (error) {
      console.error("删除失败:", error);
      alert("操作失败: " + error.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
    setCopytradeDetails([]);
  };

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">上股管理</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
        >
          添加上股
        </button>
      </div>

      {/* 添加表单 */}
      {isAdding && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-4">添加新上股</h3>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={newStock.mentor_id}
              onChange={(e) => setNewStock({ ...newStock, mentor_id: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">选择导师</option>
              {mentors.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="币种名称"
              value={newStock.crypto_name}
              onChange={(e) => setNewStock({ ...newStock, crypto_name: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="买入价格"
              value={newStock.buy_price}
              onChange={(e) => setNewStock({ ...newStock, buy_price: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="卖出价格"
              value={newStock.sell_price}
              onChange={(e) => setNewStock({ ...newStock, sell_price: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />
            <button onClick={handleAddStock} className="py-2 bg-blue-600 text-white rounded-lg">
              添加
            </button>
            <button onClick={handleCancelAdd} className="py-2 bg-gray-300 text-gray-800 rounded-lg">
              取消
            </button>
          </div>
        </div>
      )}

      {/* 编辑表单 */}
      {isEditing && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-4">编辑上股</h3>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={editStock.mentor_id}
              onChange={(e) => setEditStock({ ...editStock, mentor_id: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">选择导师</option>
              {mentors.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="币种名称"
              value={editStock.crypto_name}
              onChange={(e) => setEditStock({ ...editStock, crypto_name: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="买入价格"
              value={editStock.buy_price}
              onChange={(e) => setEditStock({ ...editStock, buy_price: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="卖出价格"
              value={editStock.sell_price}
              onChange={(e) => setEditStock({ ...editStock, sell_price: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />
            <button onClick={handleUpdateStock} className="py-2 bg-blue-600 text-white rounded-lg">
              更新
            </button>
            <button onClick={handleCancelEdit} className="py-2 bg-gray-300 text-gray-800 rounded-lg">
              取消
            </button>
          </div>
        </div>
      )}

      <div className="overflow-auto max-h-[80vh]">
        <table className="w-full text-sm text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[160px] px-4 py-3 text-center font-semibold uppercase text-gray-600">币种</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">买入价</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">卖出价</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">跟单数量</th>
              <th className="w-[120px] px-4 py-3 text-center font-semibold uppercase text-gray-600">状态</th>
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
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleViewCopytrades(stock)}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      {stock.copytrade_count}
                    </button>
                  </td>
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
                    <button 
                      onClick={() => handleEditStock(stock)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      编辑
                    </button>
                    <button 
                      onClick={() => handleDeleteStock(stock.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 跟单详情模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-4/5 max-w-4xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">跟单详情 - {selectedStock?.crypto_name}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {detailsLoading ? (
              <div className="text-center py-8 text-gray-500">加载中...</div>
            ) : copytradeDetails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无跟单记录</div>
            ) : (
              <div className="overflow-auto max-h-[60vh]">
                <table className="w-full text-sm text-gray-800">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">手机号</th>     
                      <th className="px-4 py-2 text-left">金额</th>
                      <th className="px-4 py-2 text-left">佣金率</th>
                      <th className="px-4 py-2 text-left">创建时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {copytradeDetails.map((detail) => (
                      <tr key={detail.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-blue-600">{detail.phone_number}</td>
                        <td className="px-4 py-2 text-green-600">${detail.amount}</td>
                        <td className="px-4 py-2">{detail.mentor_commission}%</td>
                        <td className="px-4 py-2 text-gray-500">{new Date(detail.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
