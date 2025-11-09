// components/RechargeManagement.jsx
import { useState, useEffect } from "react";
import { supabase, call } from "../supabaseClient";

export default function RechargeManagement() {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchRecharges();
  }, [currentPage]);

  const fetchRecharges = async () => {
    try {
      setLoading(true);
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count } = await call(
        supabase
          .from("recharges")
          .select(`
            id, user_id, amount, channel_id, status, created_at,
            users (phone_number),
            channels (currency_name)
          `, { count: "exact" })
          .range(from, to)
          .order("created_at", { ascending: false })
      );

      const formatted = data.map(r => ({
        ...r,
        phone_number: r.users?.phone_number || "Unknown",
        currency_name: r.channels?.currency_name || "Unknown",
        created_at: new Date(r.created_at).toLocaleString("en-IN"),
      }));

      setRecharges({ data: formatted, total: count || 0 });
    } catch (error) {
      alert("Load failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, user_id, amount) => {
    try {
      await call(supabase.rpc("approve_recharge", { p_recharge_id: id }));
      alert("Approved!");
      fetchRecharges();
    } catch (error) {
      alert("Failed: " + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await call(supabase.from("recharges").update({ status: "rejected" }).eq("id", id));
      alert("Rejected!");
      fetchRecharges();
    } catch (error) {
      alert("Failed: " + error.message);
    }
  };

  const totalPages = Math.ceil(recharges.total / pageSize) || 1;

  return (
    <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 min-h-screen">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">Recharge Management</h2>

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Network</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {recharges.data.map((r) => (
                  <tr key={r.id} className="hover:bg-orange-50">
                    <td className="px-4 py-3 font-medium text-orange-700">{r.phone_number}</td>
                    <td className="px-4 py-3 text-green-600 font-bold">${r.amount}</td>
                    <td className="px-4 py-3 text-gray-700">{r.currency_name}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{r.created_at}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        r.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        r.status === "approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApprove(r.id, r.user_id, r.amount)}
                            className="text-green-600 hover:text-green-800 mr-3 font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
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

          {/* 分页 */}
          {recharges.total > pageSize && (
            <div className="mt-4 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-orange-700">
                Page {currentPage} / {totalPages} (Total {recharges.total})
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
