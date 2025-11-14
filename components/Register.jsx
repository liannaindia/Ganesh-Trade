// components/Register.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { ArrowLeft, Copy } from "lucide-react";
import { useLanguage } from "../context/LanguageContext"; // 新增

export default function Register({ setTab, setIsLoggedIn, setUserId }) {
  const { t } = useLanguage(); // 新增

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralInput, setReferralInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  /** 生成 7 位唯一邀请码 */
  const generateReferralCode = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code;
    let exists = true;
    let attempts = 0;
    const maxAttempts = 100;

    while (exists && attempts < maxAttempts) {
      code = Array.from({ length: 7 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");

      const { data } = await supabase
        .from("users")
        .select("id")
        .eq("referral_code", code)
        .maybeSingle();

      exists = !!data;
      attempts++;
    }

    if (exists) throw new Error(t("register.errors.codeGeneration"));
    return code;
  };

  /** 根据邀请码查找邀请人 id */
  const getInviterId = async (code) => {
    if (!code.trim()) return null;
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("referral_code", code.trim().toUpperCase())
      .single();

    if (error || !data) {
      throw new Error(t("register.errors.invalidReferral"));
    }
    return data.id;
  };

  const handleRegister = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    setGeneratedCode("");

    // 基础校验
    if (password !== confirmPassword) {
      setError(t("register.errors.passwordMismatch"));
      setIsLoading(false);
      return;
    }
    if (phoneNumber.length < 10) {
      setError(t("register.errors.phoneLength"));
      setIsLoading(false);
      return;
    }

    try {
      // 1. 生成自己的邀请码
      const myReferralCode = await generateReferralCode();

      // 2. 若填写了邀请码，校验并获取邀请人 id
      let invitedBy = null;
      if (referralInput) {
        invitedBy = await getInviterId(referralInput);
      }

      // 3. 插入用户
      const { data, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            phone_number: phoneNumber,
            password_hash: password,
            balance: 0.0,
            available_balance: 0.0,
            referral_code: myReferralCode,
            invited_by: invitedBy,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      if (!data) throw new Error(t("register.errors.noUserReturned"));

      // 4. 登录状态 & 本地存储
      localStorage.setItem("phone_number", phoneNumber);
      localStorage.setItem("user_id", data.id);

      setGeneratedCode(myReferralCode);
      setIsLoggedIn(true);
      setUserId(data.id);
      setTab("home");
    } catch (err) {
      console.error(err);
      setError(err.message || t("register.errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  // 复制自己的邀请码
  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    alert(t("register.copied"));
  };

  return (
    <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900">
      <div className="flex items-center gap-3 py-3 px-4">
        <ArrowLeft
          className="h-5 w-5 text-slate-700 cursor-pointer"
          onClick={() => setTab("home")}
        />
        <h2 className="font-semibold text-slate-800 text-lg">{t("register.title")}</h2>
      </div>

      <div className="px-4 mt-8 space-y-4">
        {/* 手机号 */}
        <div>
          <label className="text-sm text-slate-500">{t("register.labels.phone")}</label>
          <input
            type="text"
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            placeholder={t("register.placeholders.phone")}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* 密码 */}
        <div>
          <label className="text-sm text-slate-500">{t("register.labels.password")}</label>
          <input
            type="password"
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            placeholder={t("register.placeholders.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* 确认密码 */}
        <div>
          <label className="text-sm text-slate-500">{t("register.labels.confirmPassword")}</label>
          <input
            type="password"
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            placeholder={t("register.placeholders.confirmPassword")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* 邀请码（可选） */}
        <div>
          <label className="text-sm text-slate-500">
            {t("register.labels.referralCode")}{" "}
            <span className="text-xs text-slate-400">({t("register.optional")})</span>
          </label>
          <input
            type="text"
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none uppercase"
            placeholder={t("register.placeholders.referralCode")}
            value={referralInput}
            onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
            disabled={isLoading}
            maxLength={7}
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* 注册按钮 */}
        <button
          onClick={handleRegister}
          disabled={isLoading}
          className={`w-full text-slate-900 font-semibold py-3 rounded-xl mt-4 transition duration-200 ${
            isLoading 
              ? "bg-yellow-300 cursor-not-allowed opacity-80" 
              : "bg-yellow-400 hover:bg-yellow-500 active:scale-95"
          }`}
        >
          {isLoading ? t("register.registering") : t("register.register")}
        </button>

        {/* 注册成功后显示自己的邀请码 */}
        {generatedCode && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-sm text-green-800 mb-2">{t("register.success")}</p>
            <div className="flex items-center justify-center gap-2">
              <code className="font-mono text-lg text-green-900">{generatedCode}</code>
              <button onClick={copyCode} className="text-green-600 hover:text-green-700">
                <Copy className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-green-700 mt-1">{t("register.sharePrompt")}</p>
          </div>
        )}

        {/* 去登录 */}
        <div className="mt-6 text-center text-sm text-slate-500">
          {t("register.haveAccount")}{" "}
          <button
            onClick={() => setTab("login")}
            className="text-yellow-500 font-semibold hover:underline"
            disabled={isLoading}
          >
            {t("register.login")}
          </button>
        </div>
      </div>
    </div>
  );
}
