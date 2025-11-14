// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../locales/en.json";
import hi from "../locales/hi.json";

const locales = { en, hi };

const LanguageContext = createContext();
export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("appLanguage") || "en";
  });

  useEffect(() => {
    localStorage.setItem("appLanguage", lang);
  }, [lang]);

  // 支持嵌套键：t("invite.stats.totalUsers")
  const t = (key, params = {}) => {
    const keys = key.split(".");
    let text = locales[lang];

    for (const k of keys) {
      text = text?.[k];
      if (text === undefined) break;
    }

    text = text ?? locales.en;
    for (const k of keys) {
      text = text?.[k];
      if (text === undefined) break;
    }

    text = text ?? key; // 最终 fallback

    if (params && typeof text === "string") {
      Object.keys(params).forEach((k) => {
        text = text.replace(`{${k}}`, params[k]);
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
