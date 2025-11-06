// src/Backend/AdminDashboard.jsx
import { useEffect, useMemo } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  Users,
  DollarSign,
  CreditCard,
  Settings,
  UserCheck,
  Copy,
  TrendingUp,
  LogOut,
  Bell,
  ChevronDown,
} from "lucide-react";

const menuItems = [
  { label: "用户信息", path: "/admin/users", icon: Users },
  { label: "充值管理", path: "/admin/recharge", icon: DollarSign },
  { label: "提款管理", path: "/admin/withdraw", icon: CreditCard },
  { label: "充值通道", path: "/admin/channels", icon: Settings },
  { label: "导师管理", path: "/admin/mentors", icon: UserCheck },
  { label: "跟单审核", path: "/admin/copytrade", icon: Copy },
  { label: "上股管理", path: "/admin/stocks", icon: TrendingUp },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isAdmin = localStorage.getItem("adminLoggedIn") === "true";
    if (!isAdmin) navigate("/admin-login", { replace: true });
  }, [navigate]);

  const breadcrumbs = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    const idxAdmin = parts.indexOf("admin");
    const trail = parts.slice(idxAdmin + 1);
    return trail.map((seg, idx, arr) => {
      const matched = menuItems.find((m) => m.path.includes(seg));
      return {
        label: matched?.label || seg,
        path: "/admin/" + arr.slice(0, idx + 1).join("/"),
      };
    });
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin-login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* 固定左侧菜单栏 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Brand */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-bold grid place-items-center shadow">
              G
            </div>
            <h1 className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              Ganesh Trade
            </h1>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                      active
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? "text-indigo-600" : "text-gray-500"}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      {/* 主体内容 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航 */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm font-medium">
              <Link to="/admin" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                控制台
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.path} className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-gray-900 font-semibold">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="text-indigo-600 hover:text-indigo-700 font-medium">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>

            {/* 右上角用户区 */}
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-xl hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-bold grid place-items-center shadow">
                  A
                </div>
                <div>
                  <p className="text-sm font-semibold">超级管理员</p>
                  <p className="text-xs text-gray-500">admin@ganesh.com</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容区域 */}
        <main className="flex-1 overflow-auto bg-gray-50 px-8 py-6">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
