import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Calendar, Eye, EyeOff, CheckCircle2, XCircle, Sparkles, Loader2, CreditCard, SkipForward } from "lucide-react";
import OnboardingStep from "@/components/onboarding/OnboardingStep";
import OptionGrid from "@/components/onboarding/OptionGrid";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

const _api = /** @type {any} */ (api);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @param {string} pw */
function pwStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: 'Weak', color: 'bg-red-500' };
  if (s <= 2) return { score: s, label: 'Fair', color: 'bg-amber-500' };
  if (s <= 3) return { score: s, label: 'Good', color: 'bg-yellow-400' };
  return { score: s, label: 'Strong', color: 'bg-green-500' };
}

/** @param {string} dob */
function calculateAge(dob) {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Preference data (steps 0-5)
  const [data, setData] = useState({
    date_of_birth: '', gender: '', height_cm: '', weight_kg: '',
    fitness_goal: '', activity_level: '', dietary_preference: '', workout_preference: '',
  });

  // Registration data (step 6)
  const [reg, setReg] = useState({ fullName: '', email: '', password: '', showPw: false });
  const [regTouched, setRegTouched] = useState({ fullName: false, email: false, password: false });

  useEffect(() => {
    const check = async () => {
      try {
        const isAuth = _api.auth.isAuthenticated();
        if (isAuth) {
          const profiles = await _api.entities.Profile.list().catch(() => []);
          if (profiles?.[0]?.onboarding_complete) {
            navigate(createPageUrl('Home'));
            return;
          }
          // Authenticated but no complete profile → skip to plan step
          setStep(7);
        }
      } catch {}
      setLoading(false);
    };
    check();
  }, []);

  /** @param {string} field @param {any} value */
  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const strength = pwStrength(reg.password);
  const pwReqs = [
    { label: 'At least 8 characters', met: reg.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(reg.password) },
    { label: 'One number', met: /[0-9]/.test(reg.password) },
  ];
  const regValid =
    reg.fullName.trim().length >= 2 &&
    EMAIL_RE.test(reg.email.trim()) &&
    reg.password.length >= 8 &&
    /[A-Z]/.test(reg.password) &&
    /[0-9]/.test(reg.password);

  const canProceed = () => {
    switch (step) {
      case 0: return !!(data.date_of_birth && data.gender);
      case 1: return !!(data.height_cm && data.weight_kg);
      case 2: return !!data.fitness_goal;
      case 3: return !!data.activity_level;
      case 4: return !!data.dietary_preference;
      case 5: return !!data.workout_preference;
      case 6: return regValid;
      default: return false;
    }
  };

  const handleRegister = async () => {
    if (!regValid) {
      setRegTouched({ fullName: true, email: true, password: true });
      return;
    }
    setRegistering(true);
    try {
      // Use AuthContext's register so user + isAuthenticated state updates immediately
      await registerUser({
        email: reg.email.trim(),
        full_name: reg.fullName.trim(),
        password: reg.password,
      });

      // Server auto-creates Profile — update it with the onboarding data
      const profiles = await _api.entities.Profile.list().catch(() => []);
      if (profiles?.[0]) {
        await _api.entities.Profile.update(profiles[0].id, {
          date_of_birth: data.date_of_birth,
          age: calculateAge(data.date_of_birth),
          gender: data.gender,
          height_cm: Number(data.height_cm),
          weight_kg: Number(data.weight_kg),
          fitness_goal: data.fitness_goal,
          activity_level: data.activity_level,
          dietary_preference: data.dietary_preference || 'no_preference',
          workout_preference: data.workout_preference,
          onboarding_complete: true,
        });
      }

      // Fire-and-forget initial data generation
      Promise.all([
        _api.functions.invoke('generateWorkoutFromProfile', {}),
        _api.functions.invoke('generateMealPlan', { calorieTarget: 2000, dietaryPreference: data.dietary_preference || 'no_preference' }),
      ]).catch(() => {});

      setStep(7);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast.error(msg.includes('already') ? 'An account with this email already exists.' : (msg || 'Registration failed. Please try again.'));
    } finally {
      setRegistering(false);
    }
  };

  const handleSkip = async () => {
    try {
      const subs = await _api.entities.Subscription.list().catch(() => []);
      if (subs?.[0]) {
        await _api.entities.Subscription.update(subs[0].id, { plan: 'starter', status: 'active' });
      }
    } catch {}
    navigate(createPageUrl('Home'));
  };

  const handleStartTrial = async () => {
    setCheckingOut(true);
    try {
      const response = await _api.functions.invoke('createCheckout', {
        billingPeriod: 'pro_monthly',
        userEmail: reg.email || (await _api.auth.me())?.email,
        timestamp: Date.now(),
        successUrl: `${window.location.origin}/Subscription?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/Onboarding`,
      });
      if (response?.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('No checkout URL');
      }
    } catch {
      toast.error('Failed to start checkout. Please try again.');
      setCheckingOut(false);
    }
  };

  const totalSteps = 8; // 0-6 prefs+account, 7 = plan

  const prefSteps = [
    {
      title: "Tell us about you",
      subtitle: "We'll personalize your 7% journey.",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-zinc-400 text-sm font-medium mb-2 block">Date of Birth</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none z-10" />
              <Input
                type="date"
                value={data.date_of_birth}
                onChange={(/** @type {React.ChangeEvent<HTMLInputElement>} */ e) => update('date_of_birth', e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-12 pl-10 [color-scheme:dark]"
              />
            </div>
            {data.date_of_birth && (
              <p className="text-zinc-500 text-xs mt-2">Age: {calculateAge(data.date_of_birth)}</p>
            )}
          </div>
          <div>
            <Label className="text-zinc-400 text-sm font-medium mb-3 block">Gender</Label>
            <OptionGrid
              options={[
                { value: 'male', label: 'Male', icon: '👨' },
                { value: 'female', label: 'Female', icon: '👩' },
                { value: 'non_binary', label: 'Non-binary', icon: '🧑' },
                { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: '🤐' },
              ]}
              selected={data.gender}
              onSelect={(/** @type {string} */ v) => update('gender', v)}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Body metrics",
      subtitle: "We'll calculate your daily targets.",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-zinc-400 text-sm font-medium mb-2 block">Height (cm)</Label>
            <Input type="number" placeholder="175" value={data.height_cm} onChange={(/** @type {any} */ e) => update('height_cm', e.target.value)} min="120" max="220" className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-12" />
          </div>
          <div>
            <Label className="text-zinc-400 text-sm font-medium mb-2 block">Weight (kg)</Label>
            <Input type="number" placeholder="75" value={data.weight_kg} onChange={(/** @type {any} */ e) => update('weight_kg', e.target.value)} min="30" max="250" className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-12" />
          </div>
        </div>
      ),
    },
    {
      title: "Your fitness goal",
      subtitle: "This shapes your personalized plan.",
      content: (
        <OptionGrid
          options={[
            { value: 'lose_weight', label: 'Lose Weight', icon: '🔥', description: 'Burn fat, get lean' },
            { value: 'build_muscle', label: 'Build Muscle', icon: '💪', description: 'Strength & size' },
            { value: 'improve_endurance', label: 'Endurance', icon: '🏃', description: 'Go further, faster' },
            { value: 'stay_active', label: 'Stay Active', icon: '⚡', description: 'Healthy lifestyle' },
            { value: 'flexibility', label: 'Flexibility', icon: '🧘', description: 'Mobility & balance' },
          ]}
          selected={data.fitness_goal}
          onSelect={(/** @type {string} */ v) => update('fitness_goal', v)}
          columns={2}
        />
      ),
    },
    {
      title: "Your current activity",
      subtitle: "Help us understand where you're starting from.",
      content: (
        <OptionGrid
          options={[
            { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
            { value: 'lightly_active', label: 'Light', description: '1-3 days/week' },
            { value: 'moderately_active', label: 'Moderate', description: '3-5 days/week' },
            { value: 'very_active', label: 'Very Active', description: '6-7 days/week' },
            { value: 'extremely_active', label: 'Extremely Active', description: '2x per day' },
          ]}
          selected={data.activity_level}
          onSelect={(/** @type {string} */ v) => update('activity_level', v)}
        />
      ),
    },
    {
      title: "Dietary preference",
      subtitle: "Help us create personalized meal plans for you.",
      content: (
        <OptionGrid
          options={[
            { value: 'no_preference', label: 'No Preference', icon: '🍽️', description: 'All foods welcome' },
            { value: 'vegetarian', label: 'Vegetarian', icon: '🥗', description: 'Plant-based + dairy' },
            { value: 'vegan', label: 'Vegan', icon: '🌱', description: '100% plant-based' },
            { value: 'keto', label: 'Keto', icon: '🥑', description: 'Low carb, high fat' },
            { value: 'paleo', label: 'Paleo', icon: '🥩', description: 'Whole foods only' },
            { value: 'mediterranean', label: 'Mediterranean', icon: '🫒', description: 'Heart-healthy fats' },
            { value: 'gluten_free', label: 'Gluten Free', icon: '🌾', description: 'No wheat products' },
          ]}
          selected={data.dietary_preference}
          onSelect={(/** @type {string} */ v) => update('dietary_preference', v)}
          columns={2}
        />
      ),
    },
    {
      title: "Workout preference",
      subtitle: "We'll build your routine around this.",
      content: (
        <OptionGrid
          options={[
            { value: 'gym', label: 'Gym', icon: '🏋️', description: 'Weights & machines' },
            { value: 'home', label: 'Home', icon: '🏠', description: 'Bodyweight & bands' },
            { value: 'outdoor', label: 'Outdoor', icon: '🌳', description: 'Running, cycling' },
            { value: 'mixed', label: 'Mixed', icon: '🔄', description: 'All of the above' },
            { value: 'yoga', label: 'Yoga', icon: '🧘', description: 'Flow & breathe' },
            { value: 'calisthenics', label: 'Calisthenics', icon: '🤸', description: 'Bodyweight mastery' },
          ]}
          selected={data.workout_preference}
          onSelect={(/** @type {string} */ v) => update('workout_preference', v)}
          columns={2}
        />
      ),
    },
    {
      title: "Create your account",
      subtitle: "Almost there — set up your login details.",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Full Name</label>
            <input
              type="text"
              value={reg.fullName}
              onChange={(e) => setReg(r => ({ ...r, fullName: e.target.value }))}
              onBlur={() => setRegTouched(t => ({ ...t, fullName: true }))}
              placeholder="John Doe"
              autoComplete="name"
              className={`w-full px-4 py-3 rounded-lg border bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none transition-colors ${regTouched.fullName && reg.fullName.trim().length < 2 ? 'border-red-500' : 'border-zinc-700 focus:border-amber-500'}`}
            />
            {regTouched.fullName && reg.fullName.trim().length < 2 && (
              <p className="text-red-400 text-xs mt-1">Name must be at least 2 characters</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
            <input
              type="email"
              value={reg.email}
              onChange={(e) => setReg(r => ({ ...r, email: e.target.value }))}
              onBlur={() => setRegTouched(t => ({ ...t, email: true }))}
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full px-4 py-3 rounded-lg border bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none transition-colors ${regTouched.email && !EMAIL_RE.test(reg.email.trim()) ? 'border-red-500' : 'border-zinc-700 focus:border-amber-500'}`}
            />
            {regTouched.email && !EMAIL_RE.test(reg.email.trim()) && (
              <p className="text-red-400 text-xs mt-1">Enter a valid email address</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={reg.showPw ? 'text' : 'password'}
                value={reg.password}
                onChange={(e) => setReg(r => ({ ...r, password: e.target.value }))}
                onBlur={() => setRegTouched(t => ({ ...t, password: true }))}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full px-4 py-3 pr-11 rounded-lg border bg-zinc-900 text-white placeholder-zinc-600 focus:outline-none transition-colors ${regTouched.password && !pwReqs.every(r => r.met) ? 'border-red-500' : 'border-zinc-700 focus:border-amber-500'}`}
              />
              <button type="button" onClick={() => setReg(r => ({ ...r, showPw: !r.showPw }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                {reg.showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {reg.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${strength.score >= i ? strength.color : 'bg-zinc-800'}`} />
                  ))}
                </div>
                {strength.label && <p className={`text-xs ${strength.label === 'Weak' ? 'text-red-400' : strength.label === 'Fair' ? 'text-amber-400' : strength.label === 'Good' ? 'text-yellow-400' : 'text-green-400'}`}>{strength.label} password</p>}
              </div>
            )}
            {regTouched.password && (
              <ul className="mt-2 space-y-1">
                {pwReqs.map(req => (
                  <li key={req.label} className="flex items-center gap-1.5 text-xs">
                    {req.met ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-zinc-600 shrink-0" />}
                    <span className={req.met ? 'text-green-400' : 'text-zinc-500'}>{req.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-xs text-zinc-600 text-center">
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('/login')} className="text-amber-400 hover:text-amber-300">Sign in</button>
          </p>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate(createPageUrl('Home'))}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-3xl sm:text-4xl font-black bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent">7%</span>
          </button>
          <Button onClick={() => navigate('/login')} variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
            <LogIn className="w-4 h-4 mr-2" /> Login
          </Button>
        </div>

        {step < 7 ? (
          <OnboardingStep
            step={step}
            totalSteps={totalSteps}
            title={prefSteps[step].title}
            subtitle={prefSteps[step].subtitle}
            onNext={step === 6 ? handleRegister : () => setStep(s => s + 1)}
            onBack={() => step > 0 ? setStep(s => s - 1) : navigate(createPageUrl('Home'))}
            isLast={false}
            canProceed={canProceed()}
            saving={step === 6 ? registering : false}
            nextLabel={step === 6 ? 'Create Account' : undefined}
          >
            {prefSteps[step].content}
          </OnboardingStep>
        ) : (
          /* ── Step 7: Plan selection ─────────────────────────────── */
          <div>
            {/* Progress bar */}
            <div className="flex gap-1.5 mb-10">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-amber-400' : 'bg-zinc-800'}`} />
              ))}
            </div>

            <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Step 8 of 8</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">One last step 🎉</h2>
            <p className="text-zinc-500 mb-8 text-sm leading-relaxed">Start your free trial to unlock all features — or skip and upgrade later.</p>

            {/* Pro plan card */}
            <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">7% Pro</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-black uppercase tracking-wide">7 Day Free Trial</span>
              </div>

              <div className="mb-1">
                <span className="text-4xl font-black text-green-400">Free</span>
                <span className="text-green-500/70 text-sm font-semibold ml-2">for 7 days</span>
              </div>
              <p className="text-zinc-500 text-xs mb-5">then £12.99/month — cancel anytime before trial ends</p>

              <ul className="space-y-2 mb-6">
                {['🥗 Nutrition tracking & AI meal plans', '💪 Personalised workout plans', '🎯 Daily coaching & guidance', '📊 Progress tracking & streaks'].map(f => (
                  <li key={f} className="text-sm text-zinc-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    {f.slice(2)}
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleStartTrial}
                disabled={checkingOut}
                className="w-full h-12 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold rounded-xl text-base shadow-lg shadow-amber-500/20"
              >
                {checkingOut ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting to checkout…</>
                ) : (
                  <><CreditCard className="w-4 h-4 mr-2" /> Start 7-Day Free Trial</>
                )}
              </Button>
              <p className="text-center text-zinc-600 text-xs mt-2">No charge for 7 days • Cancel before trial ends</p>
            </div>

            {/* Skip option */}
            <div className="text-center">
              <button
                onClick={handleSkip}
                disabled={checkingOut}
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors py-3 disabled:opacity-40"
              >
                <SkipForward className="w-4 h-4" />
                Skip for now
              </button>
              <p className="text-zinc-700 text-xs mt-1">Features will be locked until you subscribe</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
