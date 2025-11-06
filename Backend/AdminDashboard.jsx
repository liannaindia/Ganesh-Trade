<DOCUMENT filename="AdminDashboard.jsx">
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
  ChevronDown
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
    <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden">
      {/* 固定左侧菜单栏 */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-xl grid place-items-center shadow-lg">
              G
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              Ganesh Trade
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const active = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all text-base font-medium ${
                      active
                        ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200 shadow-sm"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${active ? "text-indigo-600" : "text-gray-500"}`} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-red-600 hover:bg-red-50 transition-all text-base font-medium"
          >
            <LogOut className="w-6 h-6" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <nav className="flex items-center text-base font-medium">
              <Link to="/admin" className="text-indigo-600 hover:text-indigo-700 font-bold">
                控制台
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.path} className="flex items-center">
                  <span className="text-gray-400 mx-3">/</span>
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-gray-900 font-bold">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="text-indigo-600 hover:text-indigo-700 font-medium">
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>

            <div className="flex items-center gap-6">
              <button className="relative p-3 rounded-xl hover:bg-gray-100 transition">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              </button>
              <div className="flex items-center gap-4 pr-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-bold text-lg grid place-items-center shadow">
                  A
                </div>
                <div>
                  <p className="text-base font-bold">超级管理员</p>
                  <p className="text-sm text-gray-500">admin@ganesh.com</p>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 px-10 py-8">
          <div className="max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
</DOCUMENT>
