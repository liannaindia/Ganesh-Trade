// components/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
- import {
-   Users, DollarSign, CreditCard, Settings, UserCheck,
-   Copy, TrendingUp, Menu, X, LogOut, Search, Bell, ChevronDown,
- } from "lucide-react";
+ import {
+   Users, DollarSign, CreditCard, Settings, UserCheck,
+   Copy, TrendingUp, Menu, X, LogOut, Search, Bell, ChevronDown,
+   ArrowLeft,
+ } from "lucide-react";

const menuItems = [
  { label: "Users", path: "/admin/users", icon: <Users className="w-5 h-5" /> },
  { label: "Recharge", path: "/admin/recharge", icon: <DollarSign className="w-5 h-5" /> },
  { label: "Withdraw", path: "/admin/withdraw", icon: <CreditCard className="w-5 h-5" /> },
  { label: "Channels", path: "/admin/channels", icon: <Settings className="w-5 h-5" /> },
  { label: "Mentors", path: "/admin/mentors", icon: <UserCheck className="w-5 h-5" /> },
  { label: "Copy Trade", path: "/admin/copytrade", icon: <Copy className="w-5 h-5" /> },
  { label: "Stocks", path: "/admin/stocks", icon: <TrendingUp className="w-5 h-5" /> },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    .filter((p) => p && p !== "admin")
    .map((segment, idx, arr) => {
      const matched = menuItems.find((m) => m.path.includes(segment));
      return {
        label: matched?.label || segment,
        path: "/admin/" + arr.slice(0, idx + 1).join("/"),
      };
    });
// 渲染面包屑时加上 key
<div className="flex items-center gap-2 text-sm text-orange-700">
  <Link to="/admin" className="hover:underline">Home</Link>
  {breadcrumbs.map((b, i) => (
    <span key={i} className="flex items-center">
      <span className="mx-2">/</span>
      <Link to={b.path} className="hover:underline font-medium">{b.label}</Link>
    </span>
  ))}
</div>
  
  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-orange-50 to-yellow-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? "w-64" : "w-20"
      } bg-gradient-to-b from-orange-600 to-yellow-600 text-white transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between">
          <h1 className={`font-bold text-xl ${sidebarOpen ? "block" : "hidden"}`}>Ganesh Admin</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        <nav className="mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 transition-all ${
                location.pathname.includes(item.path)
                  ? "bg-white/20 border-l-4 border-yellow-300"
                  : "hover:bg-white/10"
              }`}
            >
              {item.icon}
              <span className={`${sidebarOpen ? "block" : "hidden"}`}>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-orange-700">
            <Link to="/admin" className="hover:underline">Home</Link>
            {breadcrumbs.map((b, i) => (
              <span key={i}>
                <span className="mx-2">/</span>
                <Link to={b.path} className="hover:underline font-medium">{b.label}</Link>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              {searchOpen && (
                <input
                  type="text"
                  placeholder="Search users, orders..."
                  className="w-64 pl-10 pr-4 py-2 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-400"
                />
              )}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-orange-600 p-2"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            <button className="relative p-2 rounded-xl hover:bg-orange-50 transition-all">
              <Bell className="w-5 h-5 text-orange-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold">A</span>
              </div>
              <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
                <p className="text-sm font-semibold text-orange-800">Super Admin</p>
                <p className="text-xs text-orange-600">admin@ganesh.com</p>
              </div>
              <button onClick={handleLogout} className="text-orange-600 hover:text-orange-800">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-orange-50 to-yellow-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
