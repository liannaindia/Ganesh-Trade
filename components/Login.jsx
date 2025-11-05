import React, { useState } from "react";
import { supabase } from "../supabaseClient"; // 引入supabase客户端
import { ArrowLeft } from "lucide-react"; // 引入返回箭头组件

export default function Login({ setTab, setIsLoggedIn }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('phone_number', phoneNumber)
        .single(); // 获取单一用户

      if (queryError || !data) {
        setError("User not found");
        return;
      }

      // 在这里直接比对密码
      if (password === data.password_hash) {
        // 登录成功，将手机号码存储到 localStorage
        localStorage.setItem('phone_number', phoneNumber);

        // 登录成功后，设置登录状态
        setIsLoggedIn(true);
        setTab("home"); // 跳转到主页
      } else {
        setError("Incorrect password");
      }
    } catch (error) {
      setError("An error occurred during login");
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900">
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Login</h2>
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
          />
        </div>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

        <button
          onClick={handleLogin}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-xl mt-4"
        >
          Login
        </button>

        <div className="mt-6 text-center text-sm text-slate-500">
          <span>
            Don't have an account?{" "}
            <button
              onClick={() => setTab("register")}  // 设置 tab 为 register
              className="text-yellow-500 font-semibold"
            >
              Create an account
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
