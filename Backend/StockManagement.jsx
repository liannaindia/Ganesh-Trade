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
      const { data, error } = await supabase
        .from("mentors")
        .select("id, name, commission");
      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error("Failed to load mentors:", error);
      alert("Failed to load mentors");
    }
  };

  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase.from("stocks").select("*");
      if (error) throw error;

      const stocksWithCount = await Promise.all(
        data.map(async (stock) => {
          // Count ALL follow-records for this stock (Unsettled + Settled)
          const { count } = await supabase
            .from("copytrade_details")
            .select("id", { count: "exact", head: true })
            .eq("stock_id", stock.id);

          return { ...stock, copytrade_count: count || 0 };
        })
      );

      setStocks(stocksWithCount);
    } catch (error) {
      console.error("Failed to load stocks:", error);
      alert("Load failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!newStock.mentor_id || !newStock.crypto_name || !newStock.buy_price || !newStock.sell_price) {
      alert("Please fill in all fields");
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
      alert("Stock added successfully");
      setNewStock({ mentor_id: "", crypto_name: "", buy_price: "", sell_price: "" });
      setIsAdding(false);
      fetchStocks();
    } catch (error) {
      alert("Add failed: " + error.message);
    }
  };

  const handlePublish = async (id) => {
    try {
      const { error } = await supabase
        .from("stocks")
        .update({ status: "published" })
        .eq("id", id);
      if (error) throw error;
      alert("Stock published");
      fetchStocks();
    } catch (error) {
      alert("Operation failed: " + error.message);
    }
  };

  const handleSettle = async (stock) => {
    if (stock.status !== "published") {
      alert("Only published stocks can be settled");
      return;
    }

    if (!window.confirm(`Confirm settlement for ${stock.crypto_name}?\nThis action cannot be undone!`)) return;

    try {
      // 1. Fetch unsettled follow details for this stock
      const { data: details, error: fetchError } = await supabase
        .from("copytrade_details")
        .select(`
          id, user_id, amount, mentor_commission, stock_id,
          users!inner (id, balance, available_balance)
        `)
        .eq("stock_id", stock.id)
        .eq("order_status", "Unsettled");

      if (fetchError) throw fetchError;
      if (!details || details.length === 0) {
        alert("No follow records, no settlement needed");
        return;
      }

      const priceDiff = parseFloat(stock.sell_price) - parseFloat(stock.buy_price);
      const updates = [];
      const userUpdates = {};

      for (const detail of details) {
        const amount = parseFloat(detail.amount);
        const commissionRate = detail.mentor_commission / 100;

        const totalProfit = priceDiff * amount;
        const userProfit = totalProfit * (1 - commissionRate);
        const finalAmount = amount + userProfit;

        updates.push({
          id: detail.id,
          order_profit_amount: userProfit,
          order_status: "Settled",
        });

        const uid = detail.user_id;
        if (!userUpdates[uid]) userUpdates[uid] = { balance: 0, available_balance: 0 };
        userUpdates[uid].balance += finalAmount;
        userUpdates[uid].available_balance += finalAmount;
      }

      // 2. Batch update copytrade_details
      const { error: detailError } = await supabase
        .from("copytrade_details")
        .upsert(updates);
      if (detailError) throw detailError;

      // 3. Batch update user balances
      const userBalancePromises = Object.entries(userUpdates).map(([uid, change]) =>
        supabase
          .from("users")
          .update({
            balance: supabase.raw(`balance + ${change.balance}`),
            available_balance: supabase.raw(`available_balance + ${change.available_balance}`),
          })
          .eq("id", uid)
      );
      const results = await Promise.all(userBalancePromises);
      const failed = results.find((r) => r.error);
      if (failed) throw failed.error;

      // 4. Update stock status
      const { error: stockError } = await supabase
        .from("stocks")
        .update({ status: "settled" })
        .eq("id", stock.id);
      if (stockError) throw stockError;

      // 5. Success message
      const totalReleased = details.reduce((s, d) => s + parseFloat(d.amount), 0);
      const totalUserProfit = details.reduce((s, d) => {
        const profit =
          (priceDiff * parseFloat(d.amount)) * (1 - d.mentor_commission / 100);
        return s + profit;
      }, 0);

      alert(
        `Settlement successful!\n` +
          `Followers: ${details.length}\n` +
          `Released frozen funds: ${totalReleased.toFixed(2)} USD\n` +
          `User net P/L: ${totalUserProfit.toFixed(2)} USD\n` +
          `Total credited: ${(totalReleased + totalUserProfit).toFixed(2)} USD`
      );

      fetchStocks();
    } catch (error) {
      console.error("Settlement failed:", error);
      alert("Settlement failed: " + error.message);
    }
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm("Delete this stock?")) return;
    try {
      const { error } = await supabase.from("stocks").delete().eq("id", id);
      if (error) throw error;
      fetchStocks();
    } catch (error) {
      alert("Delete failed");
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
      alert("Update successful");
      setIsEditing(false);
      fetchStocks();
    } catch (error) {
      alert("Update failed");
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
          phone_number: d.users?.phone_number || "Unknown",
        }))
      );
    } catch (error) {
      alert("Failed to load details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
    setCopytradeDetails([]);
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="admin-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Stock Management</h2>
        <button onClick={() => setIsAdding(true)} className="btn-primary text-sm">
          Add Stock
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
            <option value="">Select Mentor</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Crypto Name"
            value={newStock.crypto_name}
            onChange={(e) => setNewStock({ ...newStock, crypto_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Buy Price"
            value={newStock.buy_price}
            onChange={(e) => setNewStock({ ...newStock, buy_price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Sell Price"
            value={newStock.sell_price}
            onChange={(e) => setNewStock({ ...newStock, sell_price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              Submit
            </button>
            <button type="button" onClick={() => setIsAdding(false)} className="btn-danger">
              Cancel
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
          <h3 className="text-lg font-semibold">Edit Stock</h3>
          <select
            value={editStock.mentor_id}
            onChange={(e) => setEditStock({ ...editStock, mentor_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Mentor</option>
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
              Update
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-danger">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-auto max-h-[80vh]">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table th">ID</th>
              <th className="admin-table th">Mentor</th>
              <th className="admin-table th">Crypto</th>
              <th className="admin-table th">Buy Price</th>
              <th className="admin-table th">Sell Price</th>
              <th className="admin-table th">Status</th>
              <th className="admin-table th">Followers</th>
              <th className="admin-table th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => {
              const mentor = mentors.find((m) => m.id === stock.mentor_id);
              return (
                <tr key={stock.id} className="hover:bg-gray-50 transition">
                  <td className="admin-table td">{stock.id}</td>
                  <td className="admin-table td">{mentor?.name || "Unknown"}</td>
                  <td className="admin-table td font-medium">{stock.crypto_name}</td>
                  <td className="admin-table td text-green-600">${stock.buy_price}</td>
                  <td className="admin-table td text-red-600">${stock.sell_price}</td>
                  <td className="admin-table td">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        stock.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : stock.status === "published"
                          ? "bg-blue-100 text-blue-800"
                          : stock.status === "settled"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {stock.status === "settled"
                        ? "Settled"
                        : stock.status === "pending"
                        ? "Pending"
                        : stock.status === "published"
                        ? "Published"
                        : "Unknown"}
                    </span>
                  </td>
                  <td className="admin-table td">
                    <button
                      onClick={() => openDetails(stock)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {stock.copytrade_count} users
                    </button>
                  </td>
                  <td className="admin-table td space-x-1">
                    {stock.status === "pending" && (
                      <button onClick={() => handlePublish(stock.id)} className="btn-primary text-xs">
                        Publish
                      </button>
                    )}
                    {stock.status === "published" && (
                      <button onClick={() => handleSettle(stock)} className="btn-primary text-xs">
                        Settle
                      </button>
                    )}
                    <button onClick={() => handleEditStock(stock)} className="btn-primary text-xs">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteStock(stock.id)} className="btn-danger text-xs">
                      Delete
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
                Follow Details - {selectedStock?.crypto_name}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {detailsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : copytradeDetails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No follow records</div>
            ) : (
              <div className="overflow-auto">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="admin-table th">Phone</th>
                      <th className="admin-table th">Amount</th>
                      <th className="admin-table th">Commission</th>
                      <th className="admin-table th">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {copytradeDetails.map((detail) => (
                      <tr key={detail.id} className="hover:bg-gray-50">
                        <td className="admin-table td font-medium text-blue-600">{detail.phone_number}</td>
                        <td className="admin-table td text-green-600">${detail.amount}</td>
                        <td className="admin-table td">{detail.mentor_commission}%</td>
                        <td className="admin-table td text-gray-500">
                          {new Date(detail.created_at).toLocaleString()}
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
