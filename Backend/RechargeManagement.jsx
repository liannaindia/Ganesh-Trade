import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const RechargeManagement = () => {
  const [recharges, setRecharges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecharges()
  }, [])

  const fetchRecharges = async () => {
    try {
      const { data, error } = await supabase.from('recharges').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setRecharges(data || [])
    } catch (error) {
      console.error('获取充值记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    await supabase.from('recharges').update({ status: 'approved' }).eq('id', id)
    fetchRecharges() // 刷新
  }

  if (loading) return <div className="p-6">加载中...</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">充值管理</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recharges.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.created_at}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {item.status === 'pending' && (
                    <button onClick={() => handleApprove(item.id)} className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600">批准</button>
                  )}
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">详情</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RechargeManagement
