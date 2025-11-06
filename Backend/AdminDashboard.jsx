// src/Backend/AdminDashboard.jsx (修复布局 + 完全对齐 + 现代设计)
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
  Search,
  Bell,
  ChevronDown,
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
  const [searchOpen, setSearchOpen] = useState(false);

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
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 - 固定宽度 + 完全对齐 */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col shadow-2xl z-50`}
      >
        {/* Logo 区域 */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700">
          <div className={`flex items-center gap-3 ${sidebarOpen ? "block" : "justify-center"}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <h1 className={`font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 ${sidebarOpen ? "block" : "hidden"}`}>
              Ganesh Trade
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-700 transition-all"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 mt-4 px-3 pb-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                    ${
                      location.pathname.startsWith(item.path)
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                >
                  <div className="relative z-10">
                    {item.icon}
                  </div>
                  <span className={`font-medium transition-opacity ${sidebarOpen ? "block" : "hidden"}`}>
                    {item.label}
                  </span>
                  {/* 折叠时悬停提示 */}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                      {item.label}
                    </div>
                  )}
                  {/* 当前页指示条 */}
                  {location.pathname.startsWith(item.path) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 退出登录 */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-slate-700 hover:text-red-300 transition-all ${
              !sidebarOpen && "justify-center"
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span className={`${sidebarOpen ? "block" : "hidden"} font-medium`}>退出登录</span>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部栏 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            {/* 面包屑 */}
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/admin" className="text-gray-500 hover:text-gray-700 font-medium">
                控制台
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.path} className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-gray-900 font-semibold">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="text-blue-600 hover:text-blue-800 font-medium">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>

            {/* 右侧操作区 */}
            <div className="flex items-center gap-4">
              {/* 全局搜索 */}
              <div className={`relative transition-all duration-300 ${searchOpen ? "w-64" : "w-10"}`}>
                <input
                  type="text"
                  placeholder="搜索用户、订单、导师..."
                  className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    searchOpen ? "block" : "hidden"
                  }`}
                />
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* 通知 */}
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-all">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* 用户信息 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">超级管理员</p>
                  <p className="text-xs text-gray-500">admin@ganesh.com</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </header>

        {/* 子页面内容区 - 完全对齐 */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
