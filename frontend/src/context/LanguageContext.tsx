import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { TRANSLATIONS, Translations } from "../i18n/translations";

const LANGUAGE_KEY = "vlogplanner.language";
export type Language = "nl" | "en";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  return stored === "en" ? "en" : "nl";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: TRANSLATIONS[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
