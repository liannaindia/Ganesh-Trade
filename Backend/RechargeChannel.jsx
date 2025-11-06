// src/Backend/RechargeChannel.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { RefreshCw } from 'lucide-react';

export default function RechargeChannel() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('channels').select('*');
      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      alert('获取通道失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChannels(); }, []);

  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">充值通道管理</h2>
        <button onClick={fetchChannels} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
          <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">加载中...</div>
      ) : channels.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">暂无充值通道</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="admin-table">
            <thead>
              <tr>
                <th>通道名</th>
                <th>费率</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td>{c.rate}%</td>
                  <td>
                    <span className={c.status === 'active' ? 'status-approved' : 'status-rejected'}>
                      {c.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="space-x-2">
                    <button className="btn-ghost text-xs">编辑</button>
                    <button className="btn-success text-xs">启用</button>
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
