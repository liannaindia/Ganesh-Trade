import { useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { supabase } from './supabaseClient' // 调整路径如果需要

const AdminDashboard = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !user.user_metadata?.isAdmin) {
        navigate('/me') // 或 '/login'，重定向到用户页或登录
        return
      }
    }
    checkAdmin()
  }, [navigate])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 text-xl font-bold text-blue-600 border-b">后台管理</div>
        <nav className="mt-6">
          <ul className="space-y-2">
            <li><a href="/admin/users" className="block px-4 py-2 text-gray-700 hover:bg-blue-100">用户信息</a></li>
            <li><a href="/admin/recharge" className="block px-4 py-2 text-gray-700 hover:bg-blue-100">充值管理</a></li>
            <li><a href="/admin/withdraw" className="block px-4 py-2 text-gray-700 hover:bg-blue-100">提款管理</a></li>
            <li><a href="/admin/channels" className="block px-4 py-2 text-gray-700 hover:bg-blue-100">充值通道</a></li>
            <li><a href="/admin/mentors" className="block px-4 py-2 text-gray-700 hover:bg-blue-100">导师管理</a></li>
            <li><a href="/admin/copytrade" className="block px-4 py-2 text-gray-700 hover:bg-blue-100">跟单审核</a></li>
            <li><a href="/admin/stocks" className="block px-4 py-2 text-gray-700 hover:bg-blue-100">上股管理</a></li>
          </ul>
        </nav>
      </div>
      {/* 主内容区 */}
      <div className="flex-1 p-8 overflow-auto">
        <Outlet /> {/* 子路由渲染这里 */}
      </div>
    </div>
  )
}

export default AdminDashboard
