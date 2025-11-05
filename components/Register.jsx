import React, { useState } from "react";
import { supabase } from "../supabaseClient"; // 引入supabase客户端
import { ArrowLeft } from "lucide-react"; // 引入返回箭头组件

export default function Register({ setTab }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // 使用supabase.auth.signUp进行注册
      const { user, error: signupError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signupError) {
        setError(signupError.message);
      } else {
        // 注册成功后跳转到主页
        setTab("home");
      }
    } catch (error) {
      setError("An error occurred during registration");
      console.error("Error during registration:", error);
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

        <div>
          <label className="text-sm text-slate-500">Confirm Password</label>
          <input
            type="password"
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

        <button
          onClick={handleRegister}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-xl mt-4"
        >
          Register
        </button>

        <div className="mt-6 text-center text-sm text-slate-500">
          <span>
            Already have an account?{" "}
            <button
              onClick={() => setTab("login")}  // 设置 tab 为 login
              className="text-yellow-500 font-semibold"
            >
              Login
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
