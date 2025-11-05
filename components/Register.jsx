import React, { useState } from "react";
import { supabase } from "../supabaseClient"; // 引入 supabase 客户端

export default function Register({ setTab }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (password !== retypePassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // 使用 Supabase 创建用户
      const { data, error } = await supabase
        .from("users")
        .insert([
          { phone_number: phoneNumber, password: password }
        ]);

      if (error) {
        setError(error.message);
      } else {
        // 注册成功后自动登录
        const { user, error: loginError } = await supabase.auth.signInWithPassword({
          email: phoneNumber, // 假设 phone_number 是邮箱字段
          password: password,
        });

        if (loginError) {
          setError("Login failed: " + loginError.message);
        } else {
          setTab("home"); // 登录成功后跳转到主页
        }
      }
    } catch (error) {
      setError("An error occurred during registration");
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
          />
        </div>

        <div>
          <label className="text-sm text-slate-500">Set Login Password</label>
          <input
            type="password"
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400"
            placeholder="Set your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-slate-500">Retype Password</label>
          <input
            type="password"
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400"
            placeholder="Retype your password"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
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
              onClick={() => setTab("login")}
              className="text-yellow-500 font-semibold"
            >
              Login now
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
