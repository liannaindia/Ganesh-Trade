// src/Backend/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "ganesh2025",
};

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem("adminLoggedIn", "true");
      navigate("/admin", { replace: true });
    } else {
      setError("用户名或密码错误");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="bg-white/90 backdrop-blur p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl mx-auto mb-4 grid place-items-center text-white font-bold text-xl shadow">
            GT
          </div>
          <h2 className="text-2xl font-bold text-gray-800">后台管理系统</h2>
          <p className="text-gray-500 mt-1">请输入管理员账号登录</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">用户名</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="请输入密码"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow"
          >
            立即登录
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">默认账号：admin / ganesh2025</p>
      </div>
    </div>
  );
}
