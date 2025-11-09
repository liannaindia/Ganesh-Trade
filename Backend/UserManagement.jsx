// components/UserManagement.jsx
import { useState, useEffect } from "react";
import { supabase, call } from "../supabaseClient";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await call(
        supabase
          .from("users")
          .select("id, phone_number, balance, created_at")
          .order("id", { ascending: true })
      );
      setUsers(data || []);
    } catch (error) {
      alert("Failed to load users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-orange-200">
      <div className="p-6 border-b-2 border-orange-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-yellow-50">
        <h2 className="text-xl font-bold text-orange-800">User Management</h2>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-auto max-h-[80vh]">
        <table className="w-full border-collapse">
          <thead className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
            <tr>
              <th className="w-20 px-6 py-3 text-center font-semibold uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-center font-semibold uppercase tracking-wider">Phone</th>
              <th className="w-32 px-6 py-3 text-center font-semibold uppercase tracking-wider">Balance</th>
              <th className="px-6 py-3 text-center font-semibold uppercase tracking-wider">Created</th>
              <th className="w-32 px-6 py-3 text-center font-semibold uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-orange-100 text-sm">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-orange-50 text-center">
                <td className="px-6 py-3">{user.id}</td>
                <td className="px-6 py-3 font-medium text-orange-700">{user.phone_number}</td>
                <td className="px-6 py-3 text-blue-600 font-bold">${user.balance || 0}</td>
                <td className="px-6 py-3 text-gray-600">
                  {new Date(user.created_at).toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-3">
                  <button className="text-blue-600 hover:text-blue-800 mr-3 font-medium">Edit</button>
                  <button className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
