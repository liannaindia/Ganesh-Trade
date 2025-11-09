// components/Login.jsx
import React, { useState } from "react";
import { login } from "../supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function Login({ setTab, setIsLoggedIn }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    if (phoneNumber.length < 10) {
      setError("Phone number must be at least 10 digits");
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await login(phoneNumber, password);
      localStorage.setItem('user_id', data.user.id);
      localStorage.setItem('phone_number', phoneNumber);
      setIsLoggedIn(true);
      setTab("home");
    } catch (err) {
      setError(err.message.includes('Invalid') ? "Invalid phone or password" : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-orange-50 to-yellow-50 pb-24 min-h-screen text-slate-900">
      {/* 顶部导航栏 - 印度风格橙色渐变 */}
      <div className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <ArrowLeft className="h-5 w-5 cursor-pointer" onClick={() => setTab("home")} />
        <h2 className="font-bold text-lg">Login</h2>
      </div>

      <div className="px-4 mt-8 space-y-4">
        {/* 手机号输入框 */}
        <div>
          <label className="text-sm font-medium text-orange-700">Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
            className="w-full py-3 px-4 text-sm rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            placeholder="Enter your phone number"
          />
        </div>

        {/* 密码输入框 */}
        <div>
          <label className="text-sm font-medium text-orange-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full py-3 px-4 text-sm rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            placeholder="Enter your password"
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* 登录按钮 - 印度风格渐变 */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
            isLoading
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600 hover:scale-105'
          }`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {/* 注册链接 */}
        <div className="mt-6 text-center text-sm text-orange-700">
          Don't have an account?{" "}
          <button onClick={() => setTab("register")} className="font-bold text-orange-600 hover:underline" disabled={isLoading}>
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}
