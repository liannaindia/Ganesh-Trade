<DOCUMENT filename="UserManagement.jsx">
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

  if (loading) return <div className="p-12 text-center text-lg">加载中...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 min-h-full">
      {/* 标题区 */}
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span className="w-2 h-8 bg-indigo-600 rounded-full" />
          用户信息管理
        </h2>
        <p className="text-base text-gray-500">共 {users.length} 位用户</p>
      </div>

      {/* 表格 - PC 端固定列宽，无横向滚动 */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full text-base text-gray-700">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="px-10 py-5 text-left font-bold text-gray-700 min-w-24">ID</th>
              <th className="px-10 py-5 text-left font-bold text-gray-700 min-w-48">手机号</th>
              <th className="px-10 py-5 text-left font-bold text-gray-700 min-w-32">余额</th>
              <th className="px-10 py-5 text-left font-bold text-gray-700 min-w-40">创建时间</th>
              <th className="px-10 py-5 text-left font-bold text-gray-700 min-w-48">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user, index) => (
              <tr
                key={user.id}
                className={`transition-all hover:bg-indigo-50/60 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <td className="px-10 py-5 font-semibold text-gray-900">{user.id}</td>
                <td className="px-10 py-5 font-mono text-gray-700">{user.phone_number}</td>
                <td className="px-10 py-5 font-bold text-emerald-600">
                  ${Number(user.balance || 0).toLocaleString()}
                </td>
                <td className="px-10 py-5 text-gray-600">
                  {new Date(user.created_at).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>
                <td className="px-10 py-5">
                  <div className="flex items-center gap-4">
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition">
                      编辑
                    </button>
                    <button className="px-6 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 shadow-sm transition">
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center text-gray-400 py-16 text-base">暂无用户数据</div>
      )}
    </div>
  );
}
</DOCUMENT>
