// components/CopyTradeAudit.jsx
import { useState, useEffect } from "react";
import { supabase, call } from "../supabaseClient";

export default function CopyTradeAudit() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchAudits(currentPage);
  }, [currentPage]);

  const fetchAudits = async (page) => {
    try {
      setLoading(true);

      const { count } = await call(
        supabase.from("copytrades").select("*", { count: "exact", head: true })
      );
      setTotalCount(count || 0);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data } = await call(
        supabase
          .from("copytrades")
          .select(`
            id, user_id, mentor_id, amount, status, created_at, updated_at, mentor_commission,
            users (phone_number)
          `)
          .range(from, to)
          .order("id", { ascending: false })
      );

      const formatted = data.map((item) => ({
        ...item,
        phone_number: item.users?.phone_number || "Unknown",
        created_at: new Date(item.created_at).toLocaleString("en-IN"),
      }));

      setAudits(formatted);
    } catch (error) {
      alert("Failed to load copy trades: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, userId, amount) => {
    try {
      await call(supabase.rpc("approve_copytrade", { p_copytrade_id: id }));
      alert("Copy trade approved!");
      fetchAudits(currentPage);
    } catch (error) {
      alert("Approval failed: " + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await call(supabase.from("copytrades").update({ status: "rejected" }).eq("id", id));
      alert("Copy trade rejected!");
      fetchAudits(currentPage);
    } catch (error) {
      alert("Rejection failed: " + error.message);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 min-h-screen">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">Copy Trade Audit</h2>

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
                  <th className="px-4 py-3 text-left">Commission</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {audits.map((a) => (
                  <tr key={a.id} className="hover:bg-orange-50">
                    <td className="px-4 py-3 font-medium text-orange-700">{a.phone_number}</td>
                    <td className="px-4 py-3 text-green-600 font-bold">${a.amount}</td>
                    <td className="px-4 py-3 text-orange-600">{a.mentor_commission}%</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{a.created_at}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        a.status === "approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {a.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApprove(a.id, a.user_id, a.amount)}
                            className="text-green-600 hover:text-green-800 mr-3 font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(a.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="mt-4 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-orange-700">
                Page {currentPage} / {totalPages} (Total {totalCount})
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
