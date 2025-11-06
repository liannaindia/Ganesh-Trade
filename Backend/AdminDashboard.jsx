// src/Backend/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  Users,
  DollarSign,
  CreditCard,
  Settings,
  UserCheck,
  Copy,
  TrendingUp,
  Menu,
  X,
} from "lucide-react";

// 直接定义菜单数据（无需 interface）
const menuItems = [
  { label: "用户信息", path: "/admin/users", icon: <Users className="w-5 h-5" /> },
  { label: "充值管理", path: "/admin/recharge", icon: <DollarSign className="w-5 h-5" /> },
  { label: "提款管理", path: "/admin/withdraw", icon: <CreditCard className="w-5 h-5" /> },
  { label: "充值通道", path: "/admin/channels", icon: <Settings className="w-5 h-5" /> },
  { label: "导师管理", path: "/admin/mentors", icon: <UserCheck className="w-5 h-5" /> },
  { label: "跟单审核", path: "/admin/copytrade", icon: <Copy className="w-5 h-5" /> },
  { label: "上股管理", path: "/admin/stocks", icon: <TrendingUp className="w-5 h-5" /> },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 权限检查
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !user.user_metadata?.isAdmin) {
        navigate("/me", { replace: true });
      }
    };
    checkAdmin();
  }, [navigate]);

  // 面包屑导航
  const breadcrumbs = location.pathname
    .split("/")
    .filter((p) => p && p !== "admin")
    .map((segment, idx, arr) => {
      const matched = menuItems.find((m) => m.path.includes(segment));
      return {
        label: matched?.label || segment,
        path: "/admin/" + arr.slice(0, idx + 1).join("/"),
      };
    });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 bg-white shadow-lg flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1
            className={`font-bold text-xl text-blue-600 ${
              sidebarOpen ? "block" : "hidden"
            }`}
          >
            后台管理
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 mt-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                    ${
                      location.pathname.startsWith(item.path)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {item.icon}
                  <span
                    className={`${
                      sidebarOpen ? "block" : "hidden"
                    } text-sm font-medium`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部面包屑 */}
        <header className="bg-white shadow-sm border-b px-6 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/admin" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.path}>
                <span className="text-gray-400 mx-1">/</span>
                {idx === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </header>

        {/* 子页面内容 */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
