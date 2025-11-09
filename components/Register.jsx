import React, { useState } from "react";
import { supabase } from "../supabaseClient"; // 引入supabase客户端
import { ArrowLeft } from "lucide-react"; // 引入返回箭头组件

export default function Register({ setTab, setIsLoggedIn }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 加载状态

  const handleRegister = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(""); // 清空旧错误

    // Prop 检查（调试用）
    if (typeof setIsLoggedIn !== 'function') {
      console.error('setIsLoggedIn is not a function!', setIsLoggedIn);
      setError('Internal error: Invalid login state handler');
      setIsLoading(false);
      return;
    }
    if (typeof setTab !== 'function') {
      console.error('setTab is not a function!', setTab);
      setError('Internal error: Invalid tab handler');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (phoneNumber.length < 10) { // 简单验证手机号
      setError("Phone number must be at least 10 digits");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            phone_number: phoneNumber,
            password_hash: password,  // TODO: 生产环境用哈希 (e.g., bcrypt)
            balance: 0.00,
            available_balance: 0.00,  // 可用余额
          }
        ])
        .select(); // 返回插入数据，便于调试

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        setError(insertError.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      console.log("Registration successful:", data); // 调试日志
      // 注册成功后保存 phone_number 和 user_id 到 localStorage
      localStorage.setItem('phone_number', phoneNumber);
      localStorage.setItem('user_id', data[0].id); // 保存用户 ID

      // 更新应用的登录状态
      setIsLoggedIn(true);
      setTab("home"); // 跳转到首页
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      setError("An error occurred during registration: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900">
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Register</h2>
      </div>

      <div className="px-4 mt-8 space-y-4">
        <div>
          <label className="text-sm text-slate-500">Phone Number</label>
          <input
            type="text"
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm text-slate-500">Password</label>
          <input
            type="password"
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm text-slate-500">Confirm Password</label>
          <input
            type="password"
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {error && <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">{error}</div>}

        <button
          onClick={handleRegister}
          disabled={isLoading}
          className={`w-full text-slate-900 font-semibold py-3 rounded-xl mt-4 transition ${
            isLoading ? 'bg-yellow-300 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500'
          }`}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <button
            onClick={() => setTab("login")}
            className="text-yellow-500 font-semibold"
            disabled={isLoading}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
