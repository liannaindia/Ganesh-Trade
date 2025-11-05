import React, { useState } from "react";
import { supabase } from "../supabaseClient"; // 引入supabase客户端
import { ArrowLeft } from "lucide-react"; // 引入返回箭头组件

export default function Login({ setTab }) {
  const [email, setEmail] = useState(""); // 这里改为 email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      // 使用supabase.auth.signInWithPassword来登录用户
      const { user, error: loginError } = await supabase.auth.signInWithPassword({
        email: email,  // 直接使用电子邮件
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
          <label className="text-sm text-slate-500">Email</label>
          <input
            type="email"
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
