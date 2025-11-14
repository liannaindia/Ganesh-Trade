// components/LanguageSwitcher.jsx
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();

  const languages = [
    { code: "en", flag: "EN", name: "English" },
    { code: "hi", flag: "HI", name: "हिंदी" },
  ];

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 text-slate-600 hover:text-slate-800 transition">
        <Globe className="w-5 h-5" />
        <span className="text-xs font-medium">{languages.find(l => l.code === lang)?.flag}</span>
      </button>
      <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition ${
              lang === l.code ? "text-yellow-600 font-medium" : "text-slate-700"
            }`}
          >
            <span className="mr-2">{l.flag}</span>
            {l.name}
          </button>
        ))}
      </div>
    </div>
  );
}
