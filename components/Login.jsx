import React, { useState } from "react";
import { supabase } from "../supabaseClient"; // 引入supabase客户端
import { ArrowLeft } from "lucide-react"; // 引入返回箭头组件

export default function Login({ setTab }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      // 将手机号转化为符合电子邮件格式的地址
      const email = `${phoneNumber.replace(/\s+/g, '')}@sms.com`;  // 确保手机号没有空格，并转化为有效邮箱格式

      // 使用 supabase.auth.signInWithPassword 来登录用户
      const { user, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,  // 使用转化后的手机号作为电子邮件
        password: password,
      });

      if (loginError) {
        setError(loginError.message);
      } else {
        // 登录成功后跳转到主页
        setTab("home");
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
