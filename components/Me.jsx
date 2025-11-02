import React, { useState } from "react";
import { Globe, LogOut, Wallet, Settings, HelpCircle } from "lucide-react";

export default function Me() {
  const [lang, setLang] = useState("en");
  const user = {
    name: "Ganesh Trader",
    email: "user@example.com",
    balance: 10012.06,
  };

  const T = {
    en: {
      title: "Account",
      balance: "Total Balance",
      settings: "Settings",
      support: "Support Center",
      language: "Switch Language",
      logout: "Log Out",
    },
    hi: {
      title: "खाता",
      balance: "कुल शेष राशि",
      settings: "सेटिंग्स",
      support: "सहायता केंद्र",
      language: "भाषा बदलें",
      logout: "लॉग आउट",
    },
  };

  const t = (k) => T[lang][k] || k;

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="text-center mb-6">
        <img
          src="https://cdn-icons-png.flaticon.com/512/147/147144.png"
          alt="avatar"
          className="w-20 h-20 rounded-full mx-auto mb-2 shadow"
        />
        <h2 className="font-bold text-slate-800 text-lg">{user.name}</h2>
        <p className="text-slate-500 text-sm">{user.email}</p>
      </div>

      {/* Balance Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-500 text-sm">{t("balance")}</span>
          <Wallet className="h-4 w-4 text-amber-400" />
        </div>
        <div className="text-2xl font-extrabold text-slate-800 tracking-tight">
          {user.balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}{" "}
          USDT
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y">
        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
          <Settings className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">
            {t("settings")}
          </span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
          <HelpCircle className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">
            {t("support")}
          </span>
        </button>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
        >
          <Globe className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">
            {t("language")}
          </span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50">
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-semibold">{t("logout")}</span>
        </button>
      </div>
    </div>
  );
}
