// src/Backend/UserManagement.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, phone_number, balance, created_at")
        .order("id", { ascending: true });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("获取用户失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">加载中...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          用户信息管理
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left font-medium w-20">ID</th>
              <th className="px-6 py-3 text-left font-medium">手机号</th>
              <th className="px-6 py-3 text-left font-medium w-32">余额</th>
              <th className="px-6 py-3 text-left font-medium w-40">创建时间</th>
              <th className="px-6 py-3 text-left font-medium w-32">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-blue-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">{user.id}</td>
                <td className="px-6 py-4">{user.phone_number}</td>
                <td className="px-6 py-4 font-semibold">${user.balance || 0}</td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(user.created_at).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs hover:bg-indigo-700 shadow">
                      编辑
                    </button>
                    <button className="px-3 py-1.5 bg-rose-500 text-white rounded-full text-xs hover:bg-rose-600 shadow">
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
