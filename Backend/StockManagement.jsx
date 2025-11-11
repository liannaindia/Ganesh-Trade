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

  useEffect(() => {
    fetchMentors();
    fetchStocks();
  }, []);

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase.from("mentors").select("id, name, commission");
      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error("Error fetching mentors:", error.message);
    }
  };

  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase.from("stocks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setStocks(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stocks:", error.message);
    }
  };

  const handleAddStock = async () => {
    try {
      const { error } = await supabase.from("stocks").insert([newStock]);
      if (error) throw error;
      fetchStocks();
      setIsAdding(false);
      setNewStock({ mentor_id: "", crypto_name: "", buy_price: "", sell_price: "" });
    } catch (error) {
      console.error("Error adding stock:", error.message);
    }
  };

  const handleEditStock = (stock) => {
    setSelectedStock(stock);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateStock = async () => {
    try {
      const { error } = await supabase
        .from("stocks")
        .update({
          crypto_name: selectedStock.crypto_name,
          buy_price: selectedStock.buy_price,
          sell_price: selectedStock.sell_price,
          status: selectedStock.status,
        })
        .eq("id", selectedStock.id);

      if (error) throw error;
      fetchStocks();
      setIsModalOpen(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating stock:", error.message);
    }
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock?")) return;
    try {
      const { error } = await supabase.from("stocks").delete().eq("id", id);
      if (error) throw error;
      fetchStocks();
    } catch (error) {
      console.error("Error deleting stock:", error.message);
    }
  };

  const handleViewDetails = async (stockId) => {
    setDetailsLoading(true);
    setIsModalOpen(true);
    setSelectedStock(stockId);
    try {
      const { data, error } = await supabase
        .from("copytrade_details")
        .select("*, users(phone_number)")
        .eq("stock_id", stockId);
      if (error) throw error;
      setCopytradeDetails(data || []);
    } catch (error) {
      console.error("Error fetching copytrade details:", error.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ✅ 修正版结算逻辑
  const handleSettle = async (stock) => {
    if (!window.confirm(`Confirm to settle ${stock.crypto_name}?`)) return;

    try {
      // 获取导师佣金率
      const mentor = mentors.find((m) => m.id === stock.mentor_id);
      const commissionRate = mentor ? mentor.commission / 100 : 0;

      // 获取所有 approved 跟单详情
      const { data: details, error: detailsError } = await supabase
        .from("copytrade_details")
        .select("id, user_id, amount")
        .eq("stock_id", stock.id)
        .eq("status", "approved");

      if (detailsError) throw detailsError;
      if (!details || details.length === 0) {
        alert("No approved copytrade orders to settle.");
        return;
      }

      const buyPrice = parseFloat(stock.buy_price);
      const sellPrice = parseFloat(stock.sell_price);
      if (buyPrice <= 0 || sellPrice <= 0) {
        alert("Invalid buy/sell price.");
        return;
      }

      // ✅ 正确的收益计算逻辑
      const profitRatio = (sellPrice - buyPrice) / buyPrice; // 涨幅比例
      console.log("Profit ratio:", profitRatio);

      for (const detail of details) {
        const amount = parseFloat(detail.amount);

        // 用户总利润（含导师分成前）
        const totalProfit = amount * profitRatio;

        // 用户净利润（扣除导师佣金）
        const userProfit = totalProfit * (1 - commissionRate);

        // 导师佣金金额
        const mentorProfit = totalProfit * commissionRate;

        // 更新用户余额
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("balance, available_balance")
          .eq("id", detail.user_id)
          .single();

        if (userError) throw userError;

        const newBalance = parseFloat(userData.balance) + amount + userProfit;
        const newAvailable = parseFloat(userData.available_balance) + amount + userProfit;

        await supabase
          .from("users")
          .update({
            balance: newBalance,
            available_balance: newAvailable,
          })
          .eq("id", detail.user_id);

        // 更新 copytrade_details 状态与收益
        await supabase
          .from("copytrade_details")
          .update({
            order_profit_amount: userProfit,
            status: "settled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", detail.id);

        // 可选：记录导师收益
        await supabase
          .from("copytrade_details")
          .update({ mentor_commission: mentorProfit })
          .eq("id", detail.id);
      }

      // 更新股票状态
      await supabase.from("stocks").update({ status: "settled" }).eq("id", stock.id);

      alert(`✅ ${stock.crypto_name} settled successfully.`);
      fetchStocks();
    } catch (error) {
      console.error("Error during settlement:", error.message);
      alert("Settlement failed.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Stock Management</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Crypto</th>
              <th className="p-2 border">Buy Price</th>
              <th className="p-2 border">Sell Price</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.id}>
                <td className="p-2 border">{stock.crypto_name}</td>
                <td className="p-2 border">{stock.buy_price}</td>
                <td className="p-2 border">{stock.sell_price}</td>
                <td className="p-2 border">{stock.status}</td>
                <td className="p-2 border space-x-2">
                  <button onClick={() => handleViewDetails(stock.id)} className="text-blue-600">
                    Details
                  </button>
                  <button onClick={() => handleEditStock(stock)} className="text-yellow-600">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteStock(stock.id)} className="text-red-600">
                    Delete
                  </button>
                  <button onClick={() => handleSettle(stock)} className="text-green-600">
                    Settle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
