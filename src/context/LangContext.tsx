"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "es" | "en";

interface LangContextProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (es: string, en?: string) => string;
  isEn: boolean;
}

const LangContext = createContext<LangContextProps | undefined>(undefined);

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedLang = localStorage.getItem("lc_lang") as Lang;
    if (storedLang === "en" || storedLang === "es") {
      setLangState(storedLang);
      document.documentElement.setAttribute("lang", storedLang);
      document.documentElement.setAttribute("data-lang", storedLang);
    } else {
      document.documentElement.setAttribute("lang", "es");
      document.documentElement.setAttribute("data-lang", "es");
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("lc_lang", newLang);
    document.documentElement.setAttribute("lang", newLang);
    document.documentElement.setAttribute("data-lang", newLang);
  };

  const t = (es: string, en?: string) => {
    if (!mounted) return es;
    return lang === "en" && en ? en : es;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t, isEn: lang === "en" }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LangContext);
  if (context === undefined) {
    throw new Error("useLang must be used within a LangProvider");
  }
  return context;
};
