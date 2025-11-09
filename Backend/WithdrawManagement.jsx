// components/WithdrawManagement.jsx
import { useState, useEffect } from "react";
import { supabase, call } from "../supabaseClient";

export default function WithdrawManagement() {
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdraws();
  }, []);

  const fetchWithdraws = async () => {
    try {
      const { data } = await call(
        supabase
          .from("withdraws")
          .select(`
            id, user_id, amount, status, created_at, wallet_address, channel,
            users (phone_number)
          `)
          .order("created_at", { ascending: false })
      );

      const formatted = data.map(w => ({
        ...w,
        phone_number: w.users?.phone_number || "Unknown",
        created_at: new Date(w.created_at).toLocaleString("en-IN"),
      }));

      setWithdraws(formatted);
    } catch (error) {
      alert("Failed to load withdrawals: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, amount, userId) => {
    try {
      await call(supabase.rpc("approve_withdraw", { p_withdraw_id: id }));
      alert("Withdrawal approved!");
      fetchWithdraws();
    } catch (error) {
      alert("Approval failed: " + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await call(supabase.from("withdraws").update({ status: "rejected" }).eq("id", id));
      alert("Withdrawal rejected!");
      fetchWithdraws();
    } catch (error) {
      alert("Rejection failed: " + error.message);
    }
  };

  return (
    <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 min-h-screen">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">Withdraw Management</h2>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Address</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {withdraws.map((item) => (
                <tr key={item.id} className="hover:bg-orange-50">
                  <td className="px-4 py-3 font-medium text-orange-700">{item.phone_number}</td>
                  <td className="px-4 py-3 text-red-600 font-bold">-${item.amount}</td>
                  <td className="px-4 py-3 text-xs text-gray-700 font-mono truncate max-w-xs">
                    {item.wallet_address}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{item.created_at}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      item.status === "approved" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleApprove(item.id, item.amount, item.user_id)}
                          className="text-green-600 hover:text-green-800 mr-3 font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
