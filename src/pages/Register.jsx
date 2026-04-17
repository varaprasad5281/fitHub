import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-400' };
  return { score, label: 'Strong', color: 'bg-green-500' };
}

function validate(fullName, email, password) {
  const errors = {};
  if (!fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (fullName.trim().length < 2) {
    errors.fullName = 'Name must be at least 2 characters';
  } else if (fullName.trim().length > 50) {
    errors.fullName = 'Name must be 50 characters or less';
  }

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_RE.test(email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Include at least one uppercase letter';
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'Include at least one number';
  }

  return errors;
}

export default function Register() {
  const { register, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      navigate('/Onboarding', { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(fullName, email, password));
  };

  const handleChange = (field, value) => {
    if (field === 'fullName') setFullName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (touched[field]) {
      const next = { fullName, email, password, [field]: value };
      setErrors(validate(next.fullName, next.email, next.password));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: true });
    const errs = validate(fullName, email, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await register({ email: email.trim(), full_name: fullName.trim(), password });
      navigate('/Onboarding', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      toast.error(msg);
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

  const strength = getPasswordStrength(password);

  // Password requirements checklist
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent mb-2">
            7%
          </h1>
          <h2 className="text-xl font-bold text-white mb-1">Create your account</h2>
          <p className="text-zinc-400 text-sm">Join the top 7% today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              placeholder="John Doe"
              autoComplete="name"
              className={fieldClass('fullName')}
            />
            {touched.fullName && errors.fullName && (
              <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleChange('email', e.target.value)}
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
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                autoComplete="new-password"
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

            {/* Strength bar */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        strength.score >= i ? strength.color : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className={`text-xs ${
                    strength.label === 'Weak' ? 'text-red-400' :
                    strength.label === 'Fair' ? 'text-amber-400' :
                    strength.label === 'Good' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {strength.label} password
                  </p>
                )}
              </div>
            )}

            {/* Requirements checklist — shown once user starts typing */}
            {touched.password && (
              <ul className="mt-2 space-y-1">
                {requirements.map((req) => (
                  <li key={req.label} className="flex items-center gap-1.5 text-xs">
                    {req.met
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      : <XCircle className="w-3.5 h-3.5 text-zinc-600 shrink-0" />}
                    <span className={req.met ? 'text-green-400' : 'text-zinc-500'}>{req.label}</span>
                  </li>
                ))}
              </ul>
            )}

            {touched.password && errors.password && !requirements.some(r => !r.met && r.label.toLowerCase().includes(errors.password.toLowerCase().slice(0, 8))) && (
              <p className="text-red-400 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-lg py-3 h-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <p className="text-xs text-zinc-600 text-center">
            By signing up, you agree to our{' '}
            <Link to="/Terms" className="text-zinc-400 hover:text-amber-400">Terms</Link>
            {' '}and{' '}
            <Link to="/Privacy" className="text-zinc-400 hover:text-amber-400">Privacy Policy</Link>
          </p>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6 pt-6 border-t border-zinc-800">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
