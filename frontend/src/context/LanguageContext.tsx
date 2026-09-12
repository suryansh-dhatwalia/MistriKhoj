import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { LANGUAGE_OPTIONS, TRANSLATIONS, TranslationKey } from '../data/translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
  currentLanguageOption: typeof LANGUAGE_OPTIONS[0];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('mistrikhoj_lang');
      if (saved && (saved in TRANSLATIONS)) {
        return saved as SupportedLanguage;
      }
    } catch (e) {
      // ignore
    }
    return 'hi'; // Default to Hindi as shown in reference, or user preference
  });

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('mistrikhoj_lang', newLang);
    } catch (e) {
      // ignore
    }
  };

  const t = (key: string, fallback?: string, vars?: Record<string, string | number>): string => {
    const langDict = (TRANSLATIONS[language] || {}) as Record<string, string>;
    const enDict = (TRANSLATIONS.en || {}) as Record<string, string>;
    let result = (langDict && langDict[key]) || (enDict && enDict[key]) || fallback || key;
    // Interpolate {placeholder} tokens (e.g. dynamic counts driven by CMS data).
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        result = result.split(`{${name}}`).join(String(value));
      }
    }
    return result;
  };

  const currentLanguageOption = LANGUAGE_OPTIONS.find(l => l.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLanguageOption }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
