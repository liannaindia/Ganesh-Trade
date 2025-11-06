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
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
      {/* 标题 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full" />
          用户信息管理
        </h2>
        <p className="text-sm text-gray-400">共 {users.length} 位用户</p>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-8 py-4 text-left font-semibold text-gray-600 w-20">ID</th>
              <th className="px-8 py-4 text-left font-semibold text-gray-600">手机号</th>
              <th className="px-8 py-4 text-left font-semibold text-gray-600 w-32">余额</th>
              <th className="px-8 py-4 text-left font-semibold text-gray-600 w-40">创建时间</th>
              <th className="px-8 py-4 text-left font-semibold text-gray-600 w-40">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {users.map((user, index) => (
              <tr
                key={user.id}
                className={`hover:bg-indigo-50/40 transition-all ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <td className="px-8 py-4 font-medium text-gray-800">{user.id}</td>
                <td className="px-8 py-4">{user.phone_number}</td>
                <td className="px-8 py-4 font-semibold text-emerald-600">
                  ${Number(user.balance || 0).toLocaleString()}
                </td>
                <td className="px-8 py-4 text-gray-500">
                  {new Date(user.created_at).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs hover:bg-indigo-700 shadow-sm transition">
                      编辑
                    </button>
                    <button className="px-4 py-1.5 bg-rose-500 text-white rounded-full text-xs hover:bg-rose-600 shadow-sm transition">
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 底部提示 */}
      {users.length === 0 && (
        <div className="text-center text-gray-400 py-8 text-sm">暂无用户数据</div>
      )}
    </div>
  );
}
