import { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  Users, DollarSign, CreditCard, Settings, UserCheck,
  Copy, TrendingUp, Menu, X, LogOut, Search, Bell,
} from "lucide-react";
import "./admin.css";

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

  // 登录验证
  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn") === "true";
    if (!isAdmin) navigate("/admin-login", { replace: true });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin-login", { replace: true });
  };

  // 面包屑
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
    <div className="admin-page">
      <div className="admin-container flex h-screen w-full overflow-hidden">
        {/* 侧边栏 */}
        <aside
          className={`admin-sidebar ${
            sidebarOpen ? "w-64" : "w-20"
          } text-slate-900 transition-all duration-300 flex flex-col shadow-2xl`}
        >
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              {sidebarOpen && (
                <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Ganesh Trade
                </h1>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* 菜单 */}
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
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                  >
                    {item.icon}
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                    {!sidebarOpen && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-xl transition-opacity">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 退出登录 */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all ${
                !sidebarOpen && "justify-center"
              }`}
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">退出登录</span>}
            </button>
          </div>
        </aside>

        {/* 主体 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="admin-header shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              {/* 面包屑 */}
              <nav className="flex items-center space-x-2 text-sm">
                <Link to="/admin" className="text-slate-500 hover:text-slate-700 font-medium">
                  控制台
                </Link>
                {breadcrumbs.map((crumb, idx) => (
                  <span key={crumb.path} className="flex items-center">
                    <span className="text-slate-400 mx-2">/</span>
                    {idx === breadcrumbs.length - 1 ? (
                      <span className="text-slate-900 font-semibold">{crumb.label}</span>
                    ) : (
                      <Link to={crumb.path} className="text-blue-600 hover:text-blue-800 font-medium">
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                ))}
              </nav>

              <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-all">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
