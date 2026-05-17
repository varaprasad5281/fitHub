import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '@/api/client';
import { queryClientInstance } from '@/lib/query-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false); // no longer needed - kept for API compat
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState(null); // kept for API compat

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    // Fast-path: no token in localStorage → definitely not authenticated.
    // Skip the network call so the UI resolves instantly after logout.
    if (!auth.isAuthenticated()) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      return;
    }

    try {
      const currentUser = await auth.me();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      if (error.status === 401 || error.status === 403) {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async ({ email, password }) => {
    const loggedInUser = await auth.login({ email, password });
    setUser(loggedInUser);
    setIsAuthenticated(true);
    return loggedInUser;
  };

  const register = async ({ email, full_name, password, referral_code }) => {
    const newUser = await auth.register({ email, full_name, password, referral_code });
    setUser(newUser);
    setIsAuthenticated(true);
    return newUser;
  };

  const logout = () => {
    auth.logout();                              // removes auth_token from localStorage
    localStorage.removeItem('auth_token');      // belt-and-suspenders explicit clear
    sessionStorage.clear();                     // clear any session data
    queryClientInstance.clear();
    window.location.replace('/');
  };

  // Kept for backward compatibility with components that call navigateToLogin
  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      login,
      register,
      logout,
      navigateToLogin,
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
