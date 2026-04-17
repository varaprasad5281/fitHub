import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  // Load language preference from localStorage or user profile on mount
  useEffect(() => {
    const initLanguage = async () => {
      try {
        // First try localStorage for quick load
        const saved = localStorage.getItem('app_language');
        if (saved && translations[saved]) {
          setLanguage(saved);
          setLoading(false);
          return;
        }

        // Then try to get from user profile
        const isAuth = await window.__api?.auth?.isAuthenticated?.();
        if (isAuth) {
          const user = await window.__api?.auth?.me?.();
          if (user) {
            // You'll need to fetch from Profile entity
            const { api } = await import('@/api/client');
            const profiles = await api.entities.Profile.list();
            const profile = profiles[0];
            if (profile?.language && translations[profile.language]) {
              setLanguage(profile.language);
              localStorage.setItem('app_language', profile.language);
            }
          }
        }
      } catch (error) {
        console.log('Language init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initLanguage();
  }, []);

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem('app_language', newLanguage);
      // Dispatch event for other components to react
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLanguage }));
    }
  };

  const t = (key, fallback = key) => {
    const trans = translations[language] || translations.en;
    return trans[key] || fallback;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, loading }}>
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