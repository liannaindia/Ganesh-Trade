// src/Backend/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
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
  LogOut,
} from "lucide-react";

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

  // 独立登录验证
  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn") === "true";
    if (!isAdmin) {
      navigate("/admin-login", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin-login", { replace: true });
  };

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
        } transition-all duration-300 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1
            className={`font-bold text-xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent ${
              sidebarOpen ? "block" : "hidden"
            }`}
          >
            后台管理
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-all"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 mt-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                    ${
                      location.pathname.startsWith(item.path)
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
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

        {/* 退出登录 */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-red-400 hover:bg-gray-700 hover:text-red-300 transition-all ${
              !sidebarOpen && "justify-center"
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span className={`${sidebarOpen ? "block" : "hidden"} text-sm font-medium`}>
              退出登录
            </span>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部面包屑 */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/admin" className="text-gray-500 hover:text-gray-700 font-medium">
                首页
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.path} className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-gray-900 font-semibold">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full"></div>
              <span className="font-medium">超级管理员</span>
            </div>
          </div>
        </header>

        {/* 子页面内容 */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
