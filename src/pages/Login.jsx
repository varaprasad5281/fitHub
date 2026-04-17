import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import PasswordResetForm from '@/components/auth/PasswordResetForm';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(email, password) {
  const errors = {};
  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = 'Enter a valid email address';
  }
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
}

export default function Login() {
  const { login, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      navigate('/Profile', { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));

  const handleBlur = (field) => {
    touch(field);
    setErrors(validate(email, password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setServerError('');
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/Profile', { replace: true });
    } catch (err) {
      const status = err?.status ?? err?.response?.status;
      const message = (err?.message || String(err)).toLowerCase();
      const isCredentialsError = status === 401
        || message.includes('invalid')
        || message.includes('credentials')
        || message.includes('password')
        || message.includes('not found');
      setServerError(isCredentialsError
        ? 'Invalid email or password. Please try again.'
        : err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-4 border-zinc-700 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  const fieldClass = (field) =>
    `w-full px-4 py-3 rounded-lg border bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none transition-colors ${
      touched[field] && errors[field]
        ? 'border-red-500 focus:border-red-400'
        : 'border-zinc-700 focus:border-amber-500'
    }`;

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent mb-2">
            7%
          </h1>
          <p className="text-zinc-400 text-sm">Become part of the top 7%</p>
        </div>

        {showReset ? (
          <PasswordResetForm onClose={() => setShowReset(false)} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (serverError) setServerError('');
                  if (touched.email) setErrors(validate(e.target.value, password));
                }}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                autoComplete="email"
                className={fieldClass('email')}
              />
              {touched.email && errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (serverError) setServerError('');
                    if (touched.password) setErrors(validate(email, e.target.value));
                  }}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`${fieldClass('password')} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {serverError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{serverError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-lg py-3 h-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="w-full text-sm text-zinc-500 hover:text-amber-400 transition-colors py-1"
            >
              Forgot your password?
            </button>
          </form>
        )}

        <p className="text-center text-sm text-zinc-500 mt-6 pt-6 border-t border-zinc-800">
          Don't have an account?{' '}
          <Link to="/register" className="text-amber-400 hover:text-amber-300 font-medium">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
