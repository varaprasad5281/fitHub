import React, { createContext, useContext } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

// Language selection is intentionally disabled — the app is English-only for now.
// Re-enable by restoring the previous LanguageProvider implementation and the
// Profile dropdown.
const LOCKED_LANGUAGE = 'en';

export function LanguageProvider({ children }) {
  // Clear any stale persisted preference from earlier multi-language builds so
  // returning users don't see partially-translated UI.
  if (typeof window !== 'undefined' && window.localStorage?.getItem('app_language')) {
    try { window.localStorage.removeItem('app_language'); } catch (_) {}
  }

  const language = LOCKED_LANGUAGE;

  // Kept as a no-op for backwards compatibility with any caller still importing it.
  const changeLanguage = () => {};

  const t = (key, fallback = key) => {
    const trans = translations[language] || translations.en;
    return trans[key] || fallback;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, loading: false }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}