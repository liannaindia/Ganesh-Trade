// src/Backend/WithdrawManagement.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { RefreshCw } from 'lucide-react';

export default function WithdrawManagement() {
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdraws = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('withdraws').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setWithdraws(data || []);
    } catch (error) {
      alert('获取提款记录失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    await supabase.from('withdraws').update({ status: 'approved' }).eq('id', id);
    fetchWithdraws();
  };

  useEffect(() => { fetchWithdraws(); }, []);

  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">提款管理</h2>
        <button onClick={fetchWithdraws} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
          <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">加载中...</div>
      ) : withdraws.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">暂无提款记录</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户ID</th>
                <th>金额</th>
                <th>时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {withdraws.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>{item.user_id}</td>
                  <td className="font-semibold text-rose-600">${item.amount}</td>
                  <td>{new Date(item.created_at).toLocaleString("zh-CN")}</td>
                  <td>
                    <span className={item.status === 'pending' ? 'status-pending' : 'status-approved'}>
                      {item.status === 'pending' ? '待审' : '已完成'}
                    </span>
                  </td>
                  <td>
                    {item.status === 'pending' && (
                      <button onClick={() => handleApprove(item.id)} className="btn-success text-xs">批准</button>
                    )}
                    <button className="btn-ghost text-xs ml-2">详情</button>
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
