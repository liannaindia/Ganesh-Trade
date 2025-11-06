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

  if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">用户信息管理</h2>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          刷新
        </button>
      </div>

      <div className="overflow-auto max-h-[80vh]">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[80px] px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider">ID</th>
              <th className="w-[180px] px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider">手机号</th>
              <th className="w-[100px] px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider">余额</th>
              <th className="w-[200px] px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider">创建时间</th>
              <th className="w-[120px] px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wider">操作</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 text-center align-middle">
                <td className="px-6 py-3">{user.id}</td>
                <td className="px-6 py-3">{user.phone_number}</td>
                <td className="px-6 py-3 text-blue-600 font-semibold">${user.balance || 0}</td>
                <td className="px-6 py-3 text-gray-500">
                  {new Date(user.created_at).toLocaleString("zh-CN")}
                </td>
                <td className="px-6 py-3">
                  <button className="text-blue-600 hover:text-blue-800 mr-3">编辑</button>
                  <button className="text-red-600 hover:text-red-800">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
