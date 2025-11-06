// src/Backend/UserManagement.jsx
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { RefreshCw } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, phone_number, balance, created_at")
        .order("id", { ascending: true });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      alert("获取用户失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">用户信息管理</h2>
        <button onClick={fetchUsers} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
          <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">加载中...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">暂无用户数据</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>手机号</th>
                <th>余额 (USDT)</th>
                <th>注册时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td className="font-mono">{user.phone_number}</td>
                  <td className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ${user.balance?.toFixed(2) || "0.00"}
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString("zh-CN")}</td>
                  <td className="space-x-2">
                    <button className="btn-ghost text-xs">编辑</button>
                    <button className="btn-danger text-xs">删除</button>
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
