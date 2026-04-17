import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/api/client';

// ✅ FIX: Cache auth state to prevent repeated calls
const AuthContext = createContext(null);

export function AuthCacheProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // ✅ Single auth check on app mount
    const checkAuth = async () => {
      try {
        const authenticated = await api.auth.isAuthenticated();
        if (!mounted) return;

        setIsAuth(authenticated);
        
        if (authenticated) {
          try {
            const userData = await api.auth.me();
            if (mounted) setUser(userData);
          } catch (error) {
            console.error('Failed to fetch user:', error);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkAuth();
    return () => { mounted = false; };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthCache() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthCache must be used within AuthCacheProvider');
  }
  return context;
}