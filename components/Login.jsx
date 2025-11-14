// components/Login.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../context/LanguageContext"; // 新增

export default function Login({ setTab, setIsLoggedIn, setUserId }) {
  const { t } = useLanguage(); // 新增

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    if (phoneNumber.length < 10) {
      setError(t("login.errors.phoneLength"));
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: queryError } = await supabase
        .from('users')
        .select('id, password_hash')
        .eq('phone_number', phoneNumber)
        .single();

      if (queryError || !data) {
        setError(t("login.errors.userNotFound"));
        setIsLoading(false);
        return;
      }

      if (password !== data.password_hash) {
        setError(t("login.errors.incorrectPassword"));
        setIsLoading(false);
        return;
      }

      // 关键：保存到 localStorage + 同步设置状态
      localStorage.setItem('phone_number', phoneNumber);
      localStorage.setItem('user_id', data.id);

      console.log("Login successful, user_id saved:", data.id);

      setIsLoggedIn(true);
      setUserId(data.id);
      setTab("home");
    } catch (error) {
      setError(t("login.errors.generic"));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#f5f7fb] pb-24 min-h-screen text-slate-900">
      <div className="flex items-center gap-3 py-3 px-4">
        <ArrowLeft 
          className="h-5 w-5 text-slate-700 cursor-pointer" 
          onClick={() => setTab("home")} 
        />
        <h2 className="font-semibold text-slate-800 text-lg">{t("login.title")}</h2>
      </div>

      <div className="px-4 mt-8 space-y-4">
        <div>
          <label className="text-sm text-slate-500">{t("login.labels.phone")}</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isLoading}
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            placeholder={t("login.placeholders.phone")}
          />
        </div>

        <div>
          <label className="text-sm text-slate-500">{t("login.labels.password")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full py-2 px-3 text-sm text-slate-700 rounded-lg border focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            placeholder={t("login.placeholders.password")}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={`w-full text-slate-900 font-semibold py-3 rounded-xl mt-4 transition duration-200 ${
            isLoading 
              ? 'bg-yellow-300 cursor-not-allowed opacity-80' 
              : 'bg-yellow-400 hover:bg-yellow-500 active:scale-95'
          }`}
        >
          {isLoading ? t("login.buttons.loggingIn") : t("login.buttons.login")}
        </button>

        <div className="mt-6 text-center text-sm text-slate-500">
          {t("login.noAccount")}{" "}
          <button 
            onClick={() => setTab("register")} 
            className="text-yellow-500 font-semibold hover:underline" 
            disabled={isLoading}
          >
            {t("login.createAccount")}
          </button>
        </div>
      </div>
    </div>
  );
}
