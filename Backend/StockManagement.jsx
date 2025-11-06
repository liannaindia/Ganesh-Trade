// src/Backend/StockManagement.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { RefreshCw } from 'lucide-react';

export default function StockManagement() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('stocks').select('*');
      if (error) throw error;
      setStocks(data || []);
    } catch (error) {
      alert('获取股票失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    await supabase.from('stocks').update({ status: 'published' }).eq('id', id);
    fetchStocks();
  };

  useEffect(() => { fetchStocks(); }, []);

  return (
    <div className="admin-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">上股管理</h2>
        <button onClick={fetchStocks} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
          <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">加载中...</div>
      ) : stocks.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">暂无股票数据</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="admin-table">
            <thead>
              <tr>
                <th>代码</th>
                <th>名称</th>
                <th>价格</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s) => (
                <tr key={s.id}>
                  <td className="font-mono">{s.code}</td>
                  <td>{s.name}</td>
                  <td className="font-semibold">${s.price}</td>
                  <td>
                    <span className={s.status === 'pending' ? 'status-pending' : 'status-approved'}>
                      {s.status === 'pending' ? '待上架' : '已上架'}
                    </span>
                  </td>
                  <td>
                    {s.status === 'pending' && (
                      <button onClick={() => handlePublish(s.id)} className="btn-success text-xs">上架</button>
                    )}
                    <button className="btn-ghost text-xs ml-2">编辑</button>
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
