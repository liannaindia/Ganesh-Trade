import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

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
      const { count } = await supabase
        .from("copytrades")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      setTotalCount(count || 0);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from("copytrades")
        .select(`
          id, user_id, mentor_id, amount, status, created_at, mentor_commission,
          users (phone_number)
        `)
        .eq("status", "pending")
        .range(from, to)
        .order("id", { ascending: false });

      if (error) throw error;

      const formatted = data.map((item) => ({
        ...item,
        phone_number: item.users?.phone_number || "Unknown",
      }));

      setAudits(formatted);
    } catch (error) {
      alert("Failed to load data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (copytrade) => {
    const { id, user_id, mentor_id, amount, mentor_commission } = copytrade;
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Invalid amount");
      return;
    }

    try {
      // 1. Check user balance
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("available_balance")
        .eq("id", user_id)
        .single();
      if (userError) throw userError;
      if (user.available_balance < parsedAmount) {
        alert("Insufficient user balance");
        return;
      }

      // 2. Get current published stock for this mentor
      const { data: stock, error: stockError } = await supabase
        .from("stocks")
        .select("id")
        .eq("mentor_id", mentor_id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (stockError || !stock) {
        alert("No active trading signal for this mentor");
        return;
      }

      // 3. Deduct balance + create detail + update status
      const newBalance = user.available_balance - parsedAmount;

      const { error: balanceError } = await supabase
        .from("users")
        .update({ available_balance: newBalance })
        .eq("id", user_id);
      if (balanceError) throw balanceError;

      const { error: detailError } = await supabase
        .from("copytrade_details")
        .insert({
          user_id,
          mentor_id,
          amount: parsedAmount,
          mentor_commission,
          stock_id: stock.id,
          order_status: "Unsettled",
          order_profit_amount: 0,
          created_at: new Date().toISOString(),
        });
      if (detailError) throw detailError;

      const { error: statusError } = await supabase
        .from("copytrades")
        .update({ status: "approved" })
        .eq("id", id);
      if (statusError) throw statusError;

      alert("Follow approved! Balance deducted and record created.");
      fetchAudits(currentPage);
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Operation failed: " + error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from("copytrades")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;
      alert("Follow rejected");
      fetchAudits(currentPage);
    } catch (error) {
      alert("Operation failed: " + error.message);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="admin-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Follow Requests</h2>
        <button onClick={() => fetchAudits(currentPage)} className="btn-primary text-sm">
          Refresh
        </button>
      </div>

      <div className="overflow-auto max-h-[80vh]">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-table th">ID</th>
              <th className="admin-table th">Phone</th>
              <th className="admin-table th">User ID</th>
              <th className="admin-table th">Mentor ID</th>
              <th className="admin-table th">Amount</th>
              <th className="admin-table th">Commission</th>
              <th className="admin-table th">Action</th>
            </tr>
          </thead>
          <tbody>
            {audits.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500">
                  No pending requests
                </td>
              </tr>
            ) : (
              audits.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="admin-table td">{a.id}</td>
                  <td className="admin-table td font-medium text-blue-600">{a.phone_number}</td>
                  <td className="admin-table td">{a.user_id}</td>
                  <td className="admin-table td">{a.mentor_id}</td>
                  <td className="admin-table td text-green-600 font-semibold">${a.amount}</td>
                  <td className="admin-table td">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {a.mentor_commission}%
                    </span>
                  </td>
                  <td className="admin-table td space-x-2">
                    <button
                      onClick={() => handleApprove(a)}
                      className="btn-primary text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(a.id)}
                      className="btn-danger text-xs"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalCount > pageSize && (
        <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-primary text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} / {totalPages} (Total {totalCount})
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn-primary text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
