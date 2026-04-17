import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, LogIn } from "lucide-react";
import OnboardingStep from "@/components/onboarding/OnboardingStep";
import OptionGrid from "@/components/onboarding/OptionGrid";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

const COUNTRIES = [
  "United Kingdom", "United States", "Canada", "Australia", "Germany", "France",
  "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Denmark", "Japan",
  "South Korea", "Brazil", "India", "South Africa", "Nigeria", "Mexico", "Other"
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await api.auth.isAuthenticated();
        if (isAuth) {
          // Check if user already has a profile
          const existingProfiles = await api.entities.Profile.list();
          if (existingProfiles && existingProfiles.length > 0) {
            // User already completed onboarding, redirect to profile
            navigate(createPageUrl("Profile"));
            return;
          }

          // Check if there's pending onboarding data
          const pendingData = localStorage.getItem('pending_onboarding');
          if (pendingData) {
            await completePendingOnboarding(JSON.parse(pendingData));
            return;
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
  const [data, setData] = useState({
    date_of_birth: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    fitness_goal: '',
    activity_level: '',
    dietary_preference: '',
    workout_preference: '',
    country: '',
    show_on_leaderboard: false,
  });

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const canProceed = () => {
    switch (step) {
      case 0: return data.date_of_birth && data.gender;
      case 1: return data.height_cm && data.weight_kg;
      case 2: return data.fitness_goal;
      case 3: return data.activity_level;
      case 4: return data.dietary_preference;
      case 5: return data.workout_preference;
      case 6: return true; // Final step is confirmation
      default: return false;
    }
  };

  const completePendingOnboarding = async (onboardingData) => {
    setSaving(true);
    try {
      const existingProfiles = await api.entities.Profile.list();
      if (existingProfiles && existingProfiles.length > 0) {
        localStorage.removeItem('pending_onboarding');
        navigate(createPageUrl("Profile"));
        return;
      }

      const age = calculateAge(onboardingData.date_of_birth);
      const height = Number(onboardingData.height_cm);
      const weight = Number(onboardingData.weight_kg);

      await Promise.all([
        api.entities.Profile.create({
          date_of_birth: onboardingData.date_of_birth,
          age,
          gender: onboardingData.gender,
          height_cm: height,
          weight_kg: weight,
          fitness_goal: onboardingData.fitness_goal,
          activity_level: onboardingData.activity_level,
          dietary_preference: onboardingData.dietary_preference || 'no_preference',
          workout_preference: onboardingData.workout_preference,
          country: onboardingData.country || '',
          show_on_leaderboard: onboardingData.show_on_leaderboard,
          onboarding_complete: true,
        }),
        api.entities.Streak.create({ 
          current_streak: 0, 
          longest_streak: 0, 
          total_weeks: 0 
        }),
        api.entities.Points.create({ 
          total_points: 0, 
          weekly_points: 0, 
          level: 1, 
          badges: [] 
        }),
        api.entities.Subscription.create({ 
           plan: 'starter_monthly', 
           status: 'trial', 
           trial_start: new Date().toISOString(),
           trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
         })
      ]);

      localStorage.removeItem('pending_onboarding');
      
      const user = await api.auth.me();
      Promise.all([
        api.functions.invoke('generateWorkoutFromProfile', { userEmail: user.email }),
        api.functions.invoke('generateMealPlan', { calorieTarget: 2000, dietaryPreference: onboardingData.dietary_preference || 'no_preference' }),
        api.functions.invoke('generateInitialChallenge', { userEmail: user.email, fitnessGoal: onboardingData.fitness_goal })
      ]).catch(() => {});

      api.analytics.track({
        eventName: 'onboarding_completed',
        properties: { 
          fitness_goal: onboardingData.fitness_goal,
          workout_preference: onboardingData.workout_preference
        }
      });

      toast.success('Welcome to 7%! Your profile is ready.');
      navigate(createPageUrl("Profile"));
    } catch (error) {
      console.error('Profile creation error:', error);
      toast.error('Failed to create profile. Please try again.');
      localStorage.removeItem('pending_onboarding');
      setSaving(false);
    }
  };

  const handleComplete = () => {
    // Validate data
    const age = calculateAge(data.date_of_birth);
    if (age < 16 || age > 100) {
      toast.error('Age must be between 16 and 100');
      return;
    }

    const height = Number(data.height_cm);
    if (height < 120 || height > 220) {
      toast.error('Height must be between 120cm and 220cm');
      return;
    }

    const weight = Number(data.weight_kg);
    if (weight < 30 || weight > 250) {
      toast.error('Weight must be between 30kg and 250kg');
      return;
    }

    // Store data and redirect to signup
    localStorage.setItem('pending_onboarding', JSON.stringify(data));
    api.auth.redirectToLogin(createPageUrl("Onboarding"));
  };

  const totalSteps = 7;

  const steps = [
    {
      title: "Tell us about you",
      subtitle: "We'll personalize your 7% journey.",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-zinc-400 text-sm font-medium mb-2 block">Date of Birth</Label>
            <Input
              type="date"
              value={data.date_of_birth}
              onChange={(e) => update('date_of_birth', e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl h-12 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
            {data.date_of_birth && (
              <p className="text-zinc-500 text-xs mt-2">Age: {calculateAge(data.date_of_birth)}</p>
            )}
          </div>
          <div>
            <Label className="text-zinc-400 text-sm font-medium mb-3 block">Gender</Label>
            <OptionGrid
              options={[
                { value: 'male', label: 'Male', icon: '♂' },
                { value: 'female', label: 'Female', icon: '♀' },
                { value: 'non_binary', label: 'Non-binary', icon: '⚧' },
                { value: 'prefer_not_to_say', label: 'Prefer not to say', icon: '—' },
              ]}
              selected={data.gender}
              onSelect={(v) => update('gender', v)}
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
            <Input
              type="number"
              placeholder="175"
              value={data.height_cm}
              onChange={(e) => update('height_cm', e.target.value)}
              min="120"
              max="220"
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl h-12 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
          </div>
          <div>
            <Label className="text-zinc-400 text-sm font-medium mb-2 block">Weight (kg)</Label>
            <Input
              type="number"
              placeholder="75"
              value={data.weight_kg}
              onChange={(e) => update('weight_kg', e.target.value)}
              min="30"
              max="250"
              className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 rounded-xl h-12 focus:border-amber-500/50 focus:ring-amber-500/20"
            />
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
          onSelect={(v) => update('fitness_goal', v)}
          columns={2}
        />
      ),
    },
    {
      title: "Your current activity",
      subtitle: "Help us understand where you're starting from.",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-zinc-400 text-sm font-medium mb-3 block">Activity Level</Label>
            <OptionGrid
              options={[
                { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
                { value: 'lightly_active', label: 'Light', description: '1-3 days/week' },
                { value: 'moderately_active', label: 'Moderate', description: '3-5 days/week' },
                { value: 'very_active', label: 'Very Active', description: '6-7 days/week' },
                { value: 'extremely_active', label: 'Extremely Active', description: '2x per day' },
              ]}
              selected={data.activity_level}
              onSelect={(v) => update('activity_level', v)}
            />
          </div>

        </div>
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
          onSelect={(v) => update('dietary_preference', v)}
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
          onSelect={(v) => update('workout_preference', v)}
          columns={2}
        />
      ),
    },
    {
      title: "You're all set! 🎉",
      subtitle: "Let's get you started on your 7% journey.",
      content: (
        <div className="space-y-4 text-center">
          <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <p className="text-white font-semibold mb-2">Bonus features unlocked:</p>
            <ul className="text-zinc-400 text-sm space-y-1">
              <li>✓ Personalized workout plans</li>
              <li>✓ AI nutrition coaching</li>
              <li>✓ Weekly streak tracking</li>
            </ul>
          </div>
          <p className="text-zinc-500 text-xs mt-4">You can update your preferences anytime in Profile settings.</p>
        </div>
      ),
    },
  ];

  if (loading || saving) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">{saving ? 'Setting up your profile...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                if (step > 0) setStep(s => s - 1);
                else navigate(createPageUrl("Home"));
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent">
                7%
              </span>
            </button>
            <Button
              onClick={() => api.auth.redirectToLogin(createPageUrl("Dashboard"))}
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white"
            >
              <LogIn className="w-4 h-4 mr-2" /> Login
            </Button>
          </div>
          <p className="text-zinc-500 text-xs">Join the disciplined few</p>
        </div>

        <OnboardingStep
          step={step}
          totalSteps={totalSteps}
          title={steps[step].title}
          subtitle={steps[step].subtitle}
          onNext={() => {
            if (step === totalSteps - 1) {
              handleComplete();
            } else {
              setStep(s => s + 1);
            }
          }}
          onBack={() => setStep(s => Math.max(0, s - 1))}
          isLast={step === totalSteps - 1}
          canProceed={canProceed()}
          saving={false}
        >
          {steps[step].content}
        </OnboardingStep>
      </div>
    </div>
  );
}