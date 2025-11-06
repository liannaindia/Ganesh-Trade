import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const CopyTradeAudit = () => {
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAudits()
  }, [])

  const fetchAudits = async () => {
    try {
      const { data, error } = await supabase.from('copytrades').select('*').eq('status', 'pending')
      if (error) throw error
      setAudits(data || [])
    } catch (error) {
      console.error('获取跟单审核失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    await supabase.from('copytrades').update({ status: 'approved' }).eq('id', id)
    fetchAudits()
  }

  const handleReject = async (id) => {
    await supabase.from('copytrades').update({ status: 'rejected' }).eq('id', id)
    fetchAudits()
  }

  if (loading) return <div className="p-6">加载中...</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">跟单审核</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">导师</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {audits.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.mentor_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">待审</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleApprove(item.id)} className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600">批准</button>
                  <button onClick={() => handleReject(item.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">拒绝</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CopyTradeAudit
