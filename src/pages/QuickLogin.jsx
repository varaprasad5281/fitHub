import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Legacy route - redirect to the new login page
export default function QuickLogin() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);
  return null;
}
