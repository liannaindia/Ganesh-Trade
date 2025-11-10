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
      alert("加载导师列表失败");
    }
  };

  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase.from("stocks").select("*");
      if (error) throw error;

      const stocksWithCount = await Promise.all(
        data.map(async (stock) => {
          if (!stock.mentor_id) return { ...stock, copytrade_count: 0 };
          const { count } = await supabase
            .from("copytrades")
            .select("id", { count: "exact", head: true })
            .eq("mentor_id", stock.mentor_id)
            .eq("status", "approved");
          return { ...stock, copytrade_count: count || 0 };
        })
      );

      setStocks(stocksWithCount);
    } catch (error) {
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
      alert("上股添加成功");
      setNewStock({ mentor_id: "", crypto_name: "", buy_price: "", sell_price: "" });
      setIsAdding(false);
      fetchStocks();
    } catch (error) {
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
      alert("上股已上架");
      fetchStocks();
    } catch (error) {
      alert("操作失败: " + error.message);
    }
  };

  const handleSettle = async (stock) => {
    try {
      const profit = stock.sell_price - stock.buy_price;
      const { error } = await supabase
        .from("stocks")
        .update({ status: "settled", profit })
        .eq("id", stock.id);
      if (error) throw error;
      alert(`结算完成，${profit > 0 ? "盈利" : "亏损"} $${Math.abs(profit).toFixed(2)}`);
      fetchStocks();
    } catch (error) {
      alert("结算失败");
    }
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm("确定删除该上股？")) return;
    try {
      const { error } = await supabase.from("stocks").delete().eq("id", id);
      if (error) throw error;
      fetchStocks();
    } catch (error) {
      alert("删除失败");
    }
  };

  const handleEditStock = (stock) => {
    setEditStock({
      id: stock.id,
      mentor_id: stock.mentor_id,
      crypto_name: stock.crypto_name,
      buy_price: stock.buy_price,
      sell_price: stock.sell_price,
    });
    setIsEditing(true);
  };

  const handleUpdateStock = async () => {
    try {
      const { error } = await supabase
        .from("stocks")
        .update({
          mentor_id: parseInt(editStock.mentor_id),
          crypto_name: editStock.crypto_name,
          buy_price: parseFloat(editStock.buy_price),
          sell_price: parseFloat(editStock.sell_price),
        })
        .eq("id", editStock.id);
      if (error) throw error;
      alert("更新成功");
      setIsEditing(false);
      fetchStocks();
    } catch (error) {
      alert("更新失败");
    }
  };

  const openDetails = async (stock) => {
    setSelectedStock(stock);
    setDetailsLoading(true);
    setIsModalOpen(true);

    try {
      const { data, error } = await supabase
        .from("copytrades")
        .select(`
          id, amount, mentor_commission, created_at,
          users (phone_number)
        `)
        .eq("mentor_id", stock.mentor_id)
        .eq("status", "approved");

      if (error) throw error;
      setCopytradeDetails(
        data.map((d) => ({
          ...d,
          phone_number: d.users?.phone_number || "未知",
        }))
      );
    } catch (error) {
      alert("加载详情失败");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
    setCopytradeDetails([]);
  };

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="admin-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">上股管理</h2>
        <button onClick={() => setIsAdding(true)} className="btn-primary text-sm">
          添加上股
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddStock();
          }}
          className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
        >
          <select
            value={newStock.mentor_id}
            onChange={(e) => setNewStock({ ...newStock, mentor_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">选择导师</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="币种名称"
            value={newStock.crypto_name}
            onChange={(e) => setNewStock({ ...newStock, crypto_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            step="0.01"
            placeholder="买入价"
            value={newStock.buy_price}
            onChange={(e) => setNewStock({ ...newStock, buy_price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            step="0.01"
            placeholder="卖出价"
            value={newStock.sell_price}
            onChange={(e) => setNewStock({ ...newStock, sell_price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              提交
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="btn-danger"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {isEditing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateStock();
          }}
          className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4"
        >
          <h3 className="text-lg font-semibold">编辑上股</h3>
          <select
            value={editStock.mentor_id}
            onChange={(e) => setEditStock({ ...editStock, mentor_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">选择导师</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={editStock.crypto_name}
            onChange={(e) => setEditStock({ ...editStock, crypto_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            step="0.01"
            value={editStock.buy_price}
            onChange={(e) => setEditStock({ ...editStock, buy_price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            step="0.01"
            value={editStock.sell_price}
            onChange={(e) => setEditStock({ ...editStock, sell_price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              更新
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-danger"
            >
              取消
            </button>
          </div>
        </form>
      )}

      <div className="overflow-auto max-h-[80vh]">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table th">ID</th>
              <th className="admin-table th">导师</th>
              <th className="admin-table th">币种</th>
              <th className="admin-table th">买入价</th>
              <th className="admin-table th">卖出价</th>
              <th className="admin-table th">状态</th>
              <th className="admin-table th">跟单数</th>
              <th className="admin-table th">操作</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => {
              const mentor = mentors.find((m) => m.id === stock.mentor_id);
              return (
                <tr key={stock.id} className="hover:bg-gray-50 transition">
                  <td className="admin-table td">{stock.id}</td>
                  <td className="admin-table td">{mentor?.name || "未知"}</td>
                  <td className="admin-table td font-medium">{stock.crypto_name}</td>
                  <td className="admin-table td text-green-600">${stock.buy_price}</td>
                  <td className="admin-table td text-red-600">${stock.sell_price}</td>
                  <td className="admin-table td">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        stock.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : stock.status === "published"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {stock.status}
                    </span>
                  </td>
                  <td className="admin-table td">
                    <button
                      onClick={() => openDetails(stock)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {stock.copytrade_count} 人
                    </button>
                  </td>
                  <td className="admin-table td space-x-1">
                    {stock.status === "pending" && (
                      <button
                        onClick={() => handlePublish(stock.id)}
                        className="btn-primary text-xs"
                      >
                        上架
                      </button>
                    )}
                    {stock.status === "published" && (
                      <button
                        onClick={() => handleSettle(stock)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs"
                      >
                        结算
                      </button>
                    )}
                    <button
                      onClick={() => handleEditStock(stock)}
                      className="btn-primary text-xs"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDeleteStock(stock.id)}
                      className="btn-danger text-xs"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                跟单详情 - {selectedStock?.crypto_name}
              </h3>
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
              <div className="overflow-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="admin-table th">手机号</th>
                      <th className="admin-table th">金额</th>
                      <th className="admin-table th">佣金率</th>
                      <th className="admin-table th">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {copytradeDetails.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="admin-table td font-medium text-blue-600">
                          {d.phone_number}
                        </td>
                        <td className="admin-table td text-green-600">${d.amount}</td>
                        <td className="admin-table td">{d.mentor_commission}%</td>
                        <td className="admin-table td text-gray-500">
                          {new Date(d.created_at).toLocaleString()}
                        </td>
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
