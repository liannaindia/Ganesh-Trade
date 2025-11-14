// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
// src/context/LanguageContext.jsx
import { locales } from "../locales/language";  // 正确！指向 language.js 文件

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("appLanguage") || "en";
  });

  useEffect(() => {
    localStorage.setItem("appLanguage", lang);
  }, [lang]);

  const t = (key, params = {}) => {
    let text = locales[lang][key] || locales.en[key] || key;
    Object.keys(params).forEach((k) => {
      text = text.replace(`{${k}}`, params[k]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
