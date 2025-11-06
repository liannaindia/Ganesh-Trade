// src/Backend/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  Users, DollarSign, CreditCard, Settings, UserCheck, Copy, TrendingUp,
  Menu, X, LogOut, Search, Bell, ChevronDown, Sun, Moon
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
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn") === "true";
    if (!isAdmin) navigate("/admin-login", { replace: true });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin-login", { replace: true });
  };

  const breadcrumbs = location.pathname
    .split("/")
    .filter(p => p && p !== "admin")
    .map((seg, i, arr) => {
      const match = menuItems.find(m => m.path.includes(seg));
      return { label: match?.label || seg, path: "/admin/" + arr.slice(0, i + 1).join("/") };
    });

  return (
    <div className={`admin-container ${darkMode ? 'dark bg-slate-900' : ''}`}>
      {/* 侧边栏 */}
      <aside className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} sidebar`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200/50">
          <h1 className={`font-bold text-xl text-indigo-600 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
            Ganesh Admin
          </h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''} ${!sidebarOpen && 'justify-center'}`}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-5 border-t border-slate-200/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">退出登录</span>}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* 顶部导航 */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              {breadcrumbs.map((b, i) => (
                <span key={i}>
                  {i > 0 && <span className="mx-2">/</span>}
                  <Link to={b.path} className="hover:text-indigo-600">{b.label}</Link>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {/* 搜索 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索用户、订单..."
                  className={`pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${searchOpen ? 'w-64' : 'w-10'} ${searchOpen ? 'block' : 'hidden md:block'}`}
                />
                <button onClick={() => setSearchOpen(!searchOpen)} className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Search className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* 通知 + 主题 + 用户 */}
              <button className="relative p-2 rounded-xl hover:bg-slate-100"><Bell className="w-5 h-5" /></button>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-slate-100">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">A</div>
                {sidebarOpen && <div className="hidden lg:block text-right">
                  <p className="text-sm font-semibold">超级管理员</p>
                  <p className="text-xs text-slate-500">admin@ganesh.com</p>
                </div>}
              </div>
            </div>
          </div>
        </header>

        {/* 子页面 */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
