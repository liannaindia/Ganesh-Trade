import React, { useState } from "react";
import { supabase } from "../supabaseClient"; // 引入supabase客户端

export default function Login({ setTab }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      // 使用 Supabase 验证用户
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("phone_number", phoneNumber)
        .eq("password", password);

      if (error) {
        setError(error.message);
      } else if (data.length > 0) {
        setTab("home");  // 登录成功后跳转到主页
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      setError("An error occurred during login");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900">
      <div className="flex items-center gap-3 py-3">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="font-semibold text-slate-800 text-lg">Welcome to Login</h2>
      </div>

      <div className="px-4 mt-8">
        <div className="mb-4">
          <label className="text-sm text-slate-500">Phone Number</label>
          <input
            type="text"
            className="w-full py-2 px-3 text-sm text-slate-700"
            placeholder="Enter the phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-slate-500">Password</label>
          <input
            type="password"
            className="w-full border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-700"
            placeholder="Enter the password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <button
          onClick={handleLogin}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-xl"
        >
          Login
        </button>
      </div>
    </div>
  );
}
