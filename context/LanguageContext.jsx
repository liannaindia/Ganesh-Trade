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

  // ✔ 修复版 t()
  const t = (key, params = {}) => {
    const keys = key.split(".");
    let text = locales[lang];

    for (const k of keys) {
      text = text?.[k];
      if (text === undefined) break;
    }

    // ❗Fallback：如果当前语言没有 → 查英文
    if (text === undefined) {
      text = en;
      for (const k of keys) {
        text = text?.[k];
        if (text === undefined) break;
      }
    }

    // ❗最终 fallback：使用 key 本体
    if (text === undefined) text = key;

    // ⚙ 替换 {params}
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
