import React, { useState } from "react";
import { supabase } from "../supabaseClient"; // 引入supabase客户端
import bcrypt from 'bcryptjs'; // 引入bcrypt进行密码哈希
import { ArrowLeft } from "lucide-react"; // 引入返回箭头组件

export default function Register({ setTab }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // 使用 bcrypt 加密密码
      const hashedPassword = await bcrypt.hash(password, 10); // 10 为盐的强度，越高越安全

      // 将注册信息插入到 `users` 表
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            phone_number: phoneNumber,
            password_hash: hashedPassword,  // 存储加密后的密码
            balance: 0.00,  // 默认余额
          }
        ]);

      if (insertError) {
        setError(insertError.message);
        return;
      }

      console.log('User successfully added to users table:', data);
      setTab("home"); // 注册成功后跳转到主页
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
