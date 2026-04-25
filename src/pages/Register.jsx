import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();

  useEffect(() => {
    if (isLoadingAuth) return;
    navigate(isAuthenticated ? '/Home' : '/Onboarding', { replace: true });
  }, [isAuthenticated, isLoadingAuth, navigate]);

  return null;
}
