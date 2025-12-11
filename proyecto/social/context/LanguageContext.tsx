import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations } from '../translations';

type Language = 'es' | 'en' | 'va';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, replacements?: { [key: string]: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('es');

  const t = (key: string, replacements?: { [key: string]: string }): string => {
    let translation = key.split('.').reduce((acc, currentKey) => {
      // @ts-ignore
      return acc?.[currentKey];
    }, translations[lang]);

    if (!translation) {
      // Fallback to Spanish if translation not found
      translation = key.split('.').reduce((acc, currentKey) => {
        // @ts-ignore
        return acc?.[currentKey];
      }, translations['es']);
    }
    
    if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
        });
    }

    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslations = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslations must be used within a LanguageProvider');
  }
  return context;
};
