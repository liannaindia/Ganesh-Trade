import React, { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Register({ setTab, setIsLoggedIn, setUserId }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(""); // 邀请码字段
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!phoneNumber || !password) {
      setError("Please enter all required fields.");
      return;
    }

    setLoading(true);
    setError("");

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
        setLoading(false);
        return;
      }

      // 验证邀请码，如果填写了邀请码，则获取上级ID
      let invitedById = null;
      if (referralCode) {
        const { data, error: referralError } = await supabase
          .from("users")
          .select("id")
          .eq("referral_code", referralCode)
          .single();

        if (referralError) {
          throw referralError;
        }

        if (data) {
          invitedById = data.id; // 获取邀请人的 ID
        } else {
          setError("Invalid referral code.");
          setLoading(false);
          return;
        }
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
            referral_code: newReferralCode, // 保存用户生成的唯一邀请码
            invited_by: invitedById, // 如果填写了邀请码，则关联邀请人
            created_at: new Date(),
          },
        ]);

      if (error) throw error;

      // 成功注册后，更新状态并跳转
      setIsLoggedIn(true);
      setUserId(data[0].id);
      localStorage.setItem("user_id", data[0].id);
      setTab("home");
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>Register</h2>
      {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
      </div>
      <div style={{ marginBottom: "16px" }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
      </div>
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Referral Code (Optional)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
      </div>
      <button
        onClick={handleRegister}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "8px",
          backgroundColor: "#f97316",
          color: "white",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}
