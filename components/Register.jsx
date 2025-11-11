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
      // 生成唯一的7位邀请码，默认邀请码为 Ganesh
      const newReferralCode = referralCode || "Ganesh"; // 如果没有填写邀请码，则默认使用 "Ganesh"

      // 如果填写了有效的邀请码，则验证其有效性
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

      // 插入用户信息到数据库
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            phone_number: phoneNumber,
            password_hash: password, // 您可以添加密码加密逻辑
            referral_code: newReferralCode, // 保存生成的邀请码
            invited_by: invitedById, // 如果有填写邀请码，则关联邀请人
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
