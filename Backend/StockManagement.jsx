// components/StockManagement.jsx
import { useState, useEffect } from "react";
import { supabase, call } from "../supabaseClient";

export default function StockManagement() {
  const [stocks, setStocks] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newStock, setNewStock] = useState({
    mentor_id: "", crypto_name: "", buy_price: "", sell_price: ""
  });
  const [selectedStock, setSelectedStock] = useState(null);
  const [copytradeDetails, setCopytradeDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editStock, setEditStock] = useState({
    id: "", mentor_id: "", crypto_name: "", buy_price: "", sell_price: ""
  });

  useEffect(() => {
    fetchMentors();
    fetchStocks();
  }, []);

  const fetchMentors = async () => {
    try {
      const data = await call(supabase.from("mentors").select("id, name"));
      setMentors(data || []);
    } catch (error) {
      alert("Failed to load mentors: " + error.message);
    }
  };

  const fetchStocks = async () => {
    try {
      const data = await call(supabase.from("stocks").select("*"));
      const stocksWithCount = await Promise.all(
        data.map(async (stock) => {
          if (!stock.mentor_id) return { ...stock, copytrade_count: 0 };
          const { count } = await call(
            supabase
              .from("copytrades")
              .select("id", { count: "exact", head: true })
              .eq("mentor_id", stock.mentor_id)
              .eq("status", "approved")
          );
          return { ...stock, copytrade_count: count || 0 };
        })
      );
      setStocks(stocksWithCount);
    } catch (error) {
      alert("Failed to load stocks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addStock = async () => {
    try {
      await call(supabase.from("stocks").insert([newStock]));
      fetchStocks();
      setNewStock({ mentor_id: "", crypto_name: "", buy_price: "", sell_price: "" });
      setIsAdding(false);
    } catch (error) {
      alert("Add failed: " + error.message);
    }
  };

  const updateStock = async () => {
    try {
      await call(supabase.from("stocks").update(editStock).eq("id", editStock.id));
      fetchStocks();
      setIsEditing(false);
      setEditStock({ id: "", mentor_id: "", crypto_name: "", buy_price: "", sell_price: "" });
    } catch (error) {
      alert("Update failed: " + error.message);
    }
  };

  const deleteStock = async (id) => {
    if (!confirm("Delete this stock signal?")) return;
    try {
      await call(supabase.from("stocks").delete().eq("id", id));
      fetchStocks();
    } catch (error) {
      alert("Delete failed: " + error.message);
    }
  };

  const fetchDetails = async (stock) => {
    setSelectedStock(stock);
    setDetailsLoading(true);
    setIsModalOpen(true);
    try {
      const data = await call(
        supabase
          .from("copytrades")
          .select(`
            id, user_id, amount, mentor_commission, created_at,
            users (phone_number)
          `)
          .eq("mentor_id", stock.mentor_id)
          .eq("status", "approved")
      );
      const formatted = data.map(d => ({
        ...d,
        phone_number: d.users?.phone_number || "Unknown",
        created_at: new Date(d.created_at).toLocaleString("en-IN"),
      }));
      setCopytradeDetails(formatted);
    } catch (error) {
      alert("Failed to load details: " + error.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
    setCopytradeDetails([]);
  };

  return (
    <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-orange-700">Stock Signal Management</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium hover:scale-105 transition-all"
        >
          Add Signal
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
              <tr>
                <th className="px-4 py-3 text-center">Crypto</th>
                <th className="px-4 py-3 text-center">Buy Price</th>
                <th className="px-4 py-3 text-center">Sell Price</th>
                <th className="px-4 py-3 text-center">Mentor</th>
                <th className="px-4 py-3 text-center">Followers</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {stocks.map((s) => {
                const mentor = mentors.find(m => m.id === s.mentor_id);
                return (
                  <tr key={s.id} className="hover:bg-orange-50 text-center">
                    <td className="px-4 py-3 font-bold text-orange-700">{s.crypto_name}</td>
                    <td className="px-4 py-3 text-green-600">${s.buy_price}</td>
                    <td className="px-4 py-3 text-red-600">${s.sell_price}</td>
                    <td className="px-4 py-3">{mentor?.name || "Unknown"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => fetchDetails(s)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {s.copytrade_count} followers
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setEditStock(s);
                          setIsEditing(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-3 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteStock(s.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(isAdding || isEditing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-orange-700 mb-4">
              {isAdding ? "Add New Signal" : "Edit Signal"}
            </h3>
            <select
              value={isAdding ? newStock.mentor_id : editStock.mentor_id}
              onChange={(e) => isAdding
                ? setNewStock({ ...newStock, mentor_id: e.target.value })
                : setEditStock({ ...editStock, mentor_id: e.target.value })
              }
              className="w-full mb-3 p-3 rounded-lg border-2 border-orange-200 focus:border-orange-500"
            >
              <option value="">Select Mentor</option>
              {mentors.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <input
              placeholder="Crypto Name"
              value={isAdding ? newStock.crypto_name : editStock.crypto_name}
              onChange={(e) => isAdding
                ? setNewStock({ ...newStock, crypto_name: e.target.value })
                : setEditStock({ ...editStock, crypto_name: e.target.value })
              }
              className="w-full mb-3 p-3 rounded-lg border-2 border-orange-200 focus:border-orange-500"
            />
            <input
              type="number"
              placeholder="Buy Price"
              value={isAdding ? newStock.buy_price : editStock.buy_price}
              onChange={(e) => isAdding
                ? setNewStock({ ...newStock, buy_price: e.target.value })
                : setEditStock({ ...editStock, buy_price: e.target.value })
              }
              className="w-full mb-3 p-3 rounded-lg border-2 border-orange-200 focus:border-orange-500"
            />
            <input
              type="number"
              placeholder="Sell Price"
              value={isAdding ? newStock.sell_price : editStock.sell_price}
              onChange={(e) => isAdding
                ? setNewStock({ ...newStock, sell_price: e.target.value })
                : setEditStock({ ...editStock, sell_price: e.target.value })
              }
              className="w-full mb-4 p-3 rounded-lg border-2 border-orange-200 focus:border-orange-500"
            />
            <div className="flex gap-2">
              <button
                onClick={isAdding ? addStock : updateStock}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-bold"
              >
                {isAdding ? "Add" : "Update"}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setIsEditing(false);
                }}
                className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isModalOpen && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-orange-700">
                Followers for {selectedStock.crypto_name}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {detailsLoading ? (
              <div className="text-center py-8 text-gray-600">Loading...</div>
            ) : copytradeDetails.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No followers</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Commission</th>
                    <th className="px-4 py-2 text-left">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {copytradeDetails.map((d) => (
                    <tr key={d.id} className="hover:bg-orange-50">
                      <td className="px-4 py-2 font-medium text-blue-600">{d.phone_number}</td>
                      <td className="px-4 py-2 text-green-600">${d.amount}</td>
                      <td className="px-4 py-2">{d.mentor_commission}%</td>
                      <td className="px-4 py-2 text-gray-500">{d.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
