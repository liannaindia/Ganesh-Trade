import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { ArrowLeft } from "lucide-react";

export default function Register({ setTab, setIsLoggedIn, setUserId }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 生成7位唯一邀请码的函数
  const generateReferralCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let referralCode = "";
    for (let i = 0; i < 7; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      referralCode += characters[randomIndex];
    }
    return referralCode;
  };

  const handleRegister = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    // 密码确认
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // 手机号长度检查
    if (phoneNumber.length < 10) {
      setError("Phone number must be at least 10 digits");
      setIsLoading(false);
      return;
    }

    try {
      // 检查手机号是否已存在
      const { data: existingUser, error: phoneError } = await supabase
        .from("users")
        .select("id")
        .eq("phone_number", phoneNumber)
        .single();

      if (phoneError) throw phoneError;

      if (existingUser) {
        setError("This phone number is already registered.");
        setIsLoading(false);
        return;
      }

      // 为用户生成唯一的7位邀请码
      const newReferralCode = generateReferralCode();

      // 插入用户信息到数据库
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            phone_number: phoneNumber,
            password_hash: password, // 密码哈希（应加密处理）
            referral_code: newReferralCode, // 保存用户生成的邀请码
            invited_by: null, // 目前不关联邀请人
            created_at: new Date(),
          },
        ])
        .select(); // 必须加 .select() 才能返回 id

      if (error) throw error;

      // 成功注册后，更新状态并跳转
      const newUserId = data[0].id;
      localStorage.setItem("phone_number", phoneNumber);
      localStorage.setItem("user_id", newUserId);

      setIsLoggedIn(true);
      setUserId(newUserId); // 关键：同步设置 userId
      setTab("home");
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error("Unexpected error during registration:", err);
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
          <span>
            Already have an account?{" "}
            <button
              onClick={() => setTab("login")}
              className="text-yellow-500 font-semibold"
              disabled={isLoading}
            >
              Login
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
