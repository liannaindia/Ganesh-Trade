// src/Backend/CopyTradeAudit.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { RefreshCw } from 'lucide-react';

export default function CopyTradeAudit() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('copytrades').select('*').eq('status', 'pending');
      if (error) throw error;
      setAudits(data || []);
    } catch (error) {
      alert('获取跟单审核失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    await supabase.from('copytrades').update({ status }).eq('id', id);
    fetchAudits();
  };

  useEffect(() => { fetchAudits(); }, []);

  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">跟单审核</h2>
        <button onClick={fetchAudits} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
          <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">加载中...</div>
      ) : audits.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">暂无待审核跟单</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>用户</th>
                <th>导师</th>
                <th>金额</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td>{item.user_id}</td>
                  <td>{item.mentor_id}</td>
                  <td className="font-semibold text-indigo-600">${item.amount}</td>
                  <td><span className="status-pending">待审</span></td>
                  <td className="space-x-2">
                    <button onClick={() => handleAction(item.id, 'approved')} className="btn-success text-xs">批准</button>
                    <button onClick={() => handleAction(item.id, 'rejected')} className="btn-danger text-xs">拒绝</button>
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
