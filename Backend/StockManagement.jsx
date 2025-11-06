import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const StockManagement = () => {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStocks()
  }, [])

  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase.from('stocks').select('*')
      if (error) throw error
      setStocks(data || [])
    } catch (error) {
      console.error('获取股票失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (id) => {
    await supabase.from('stocks').update({ status: 'published' }).eq('id', id)
    fetchStocks()
  }

  if (loading) return <div className="p-6">加载中...</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">上股管理</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">代码</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">价格</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stocks.map((stock) => (
              <tr key={stock.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${stock.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${stock.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {stock.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {stock.status === 'pending' && (
                    <button onClick={() => handlePublish(stock.id)} className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600">上架</button>
                  )}
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">编辑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StockManagement
