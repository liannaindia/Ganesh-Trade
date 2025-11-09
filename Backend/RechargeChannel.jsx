// components/RechargeChannel.jsx
import { useState, useEffect } from "react";
import { supabase, call } from "../supabaseClient";

export default function RechargeChannel() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newChannel, setNewChannel] = useState({
    currency_name: "", wallet_address: "", status: "active"
  });
  const [editingChannel, setEditingChannel] = useState(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const data = await call(
        supabase
          .from("channels")
          .select("id, currency_name, wallet_address, status, created_at")
          .order("created_at", { ascending: false })
      );
      setChannels(data || []);
    } catch (error) {
      alert("Failed to load channels: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChannel = async (e) => {
    e.preventDefault();
    if (!newChannel.currency_name || !newChannel.wallet_address) {
      alert("Please enter currency and address");
      return;
    }
    try {
      await call(supabase.from("channels").insert([newChannel]));
      setNewChannel({ currency_name: "", wallet_address: "", status: "active" });
      setShowAddForm(false);
      fetchChannels();
    } catch (error) {
      alert("Add failed: " + error.message);
    }
  };

  const handleUpdateChannel = async (e) => {
    e.preventDefault();
    try {
      await call(
        supabase
          .from("channels")
          .update({
            currency_name: editingChannel.currency_name,
            wallet_address: editingChannel.wallet_address,
            status: editingChannel.status
          })
          .eq("id", editingChannel.id)
      );
      setShowEditForm(false);
      setEditingChannel(null);
      fetchChannels();
    } catch (error) {
      alert("Update failed: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this channel?")) return;
    try {
      await call(supabase.from("channels").delete().eq("id", id));
      fetchChannels();
    } catch (error) {
      alert("Delete failed: " + error.message);
    }
  };

  const handleEditChannel = (ch) => {
    setEditingChannel({ ...ch });
    setShowEditForm(true);
  };

  return (
    <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-orange-700">Recharge Channels</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium hover:scale-105 transition-all"
        >
          Add Channel
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
              <tr>
                <th className="px-4 py-3 text-center">Currency</th>
                <th className="px-4 py-3 text-center">Wallet Address</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {channels.map((ch) => (
                <tr key={ch.id} className="hover:bg-orange-50 text-center">
                  <td className="px-4 py-3 font-medium text-orange-700">{ch.currency_name}</td>
                  <td className="px-4 py-3 text-xs text-gray-700 font-mono break-all">
                    {ch.wallet_address}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      ch.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {ch.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(ch.id)}
                      className="text-red-600 hover:text-red-800 mr-3 font-medium"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleEditChannel(ch)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {channels.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-6 text-gray-400 text-center">
                    No channels. Add a new one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-orange-700 mb-4">
              {showAddForm ? "Add New Channel" : "Edit Channel"}
            </h3>
            <form onSubmit={showAddForm ? handleAddChannel : handleUpdateChannel}>
              <input
                placeholder="Currency Name"
                value={showAddForm ? newChannel.currency_name : editingChannel?.currency_name || ""}
                onChange={(e) => showAddForm
                  ? setNewChannel({ ...newChannel, currency_name: e.target.value })
                  : setEditingChannel({ ...editingChannel, currency_name: e.target.value })
                }
                className="w-full mb-3 p-3 rounded-lg border-2 border-orange-200 focus:border-orange-500"
                required
              />
              <input
                placeholder="Wallet Address"
                value={showAddForm ? newChannel.wallet_address : editingChannel?.wallet_address || ""}
                onChange={(e) => showAddForm
                  ? setNewChannel({ ...newChannel, wallet_address: e.target.value })
                  : setEditingChannel({ ...editingChannel, wallet_address: e.target.value })
                }
                className="w-full mb-3 p-3 rounded-lg border-2 border-orange-200 focus:border-orange-500"
                required
              />
              <select
                value={showAddForm ? newChannel.status : editingChannel?.status || "active"}
                onChange={(e) => showAddForm
                  ? setNewChannel({ ...newChannel, status: e.target.value })
                  : setEditingChannel({ ...editingChannel, status: e.target.value })
                }
                className="w-full mb-4 p-3 rounded-lg border-2 border-orange-200 focus:border-orange-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-bold"
                >
                  {showAddForm ? "Add" : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
                    setEditingChannel(null);
                  }}
                  className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
