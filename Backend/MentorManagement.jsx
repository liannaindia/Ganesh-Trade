import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const MentorManagement = () => {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMentors()
  }, [])

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase.from('mentors').select('*')
      if (error) throw error
      setMentors(data || [])
    } catch (error) {
      console.error('获取导师失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6">加载中...</div>

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">导师管理</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">粉丝数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">佣金率</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mentors.map((mentor) => (
              <tr key={mentor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mentor.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mentor.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mentor.followers}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mentor.commission}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600">编辑</button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">移除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MentorManagement
