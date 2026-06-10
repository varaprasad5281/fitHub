import React, { Suspense, useState, useEffect, memo } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import SEOHead from '@/components/SEOHead';
import HeroSection from "@/components/landing/HeroSection";
import { LayoutDashboard, Utensils, Dumbbell, Sparkles, Trophy, Award, Users, CreditCard, Mail, LogOut } from "lucide-react";
import { lazyWithPreload } from "@/components/utils/lazyWithPreload";

const TrustSignals = lazyWithPreload(() => import("@/components/landing/TrustSignals"));
const PhilosophySection = lazyWithPreload(() => import("@/components/landing/PhilosophySection"));
const FeaturesSection = lazyWithPreload(() => import("@/components/landing/FeaturesSection"));
const HowItWorksSection = lazyWithPreload(() => import("@/components/landing/HowItWorksSection"));
const PricingSection = lazyWithPreload(() => import("@/components/landing/PricingSection"));
const SocialProofSection = lazyWithPreload(() => import("@/components/landing/SocialProofSection"));
const FAQSection = lazyWithPreload(() => import("@/components/landing/FAQSection"));
const MobileAppSection = lazyWithPreload(() => import("@/components/landing/MobileAppSection"));
const NewsletterSection = lazyWithPreload(() => import("@/components/landing/NewsletterSection"));
const FooterSection = lazyWithPreload(() => import("@/components/landing/FooterSection"));

// Defer non-critical preloads
const DeferredPreloadManager = () => {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        HowItWorksSection.preload?.();
        PricingSection.preload?.();
        SocialProofSection.preload?.();
      });
    } else {
      setTimeout(() => {
        HowItWorksSection.preload?.();
        PricingSection.preload?.();
        SocialProofSection.preload?.();
      }, 2000);
    }
  }, []);
  return null;
};

const appPages = [
  { name: "Profile", path: "Profile", icon: LayoutDashboard, description: "Overview & stats" },
  { name: "Nutrition", path: "Nutrition", icon: Utensils, description: "Meal tracking" },
  { name: "Workouts", path: "WorkoutBuilder", icon: Dumbbell, description: "Training plans" },
  { name: "Coaching", path: "Coaching", icon: Sparkles, description: "Guidance" },
  { name: "Challenges", path: "Challenges", icon: Trophy, description: "Compete & win" },
  { name: "Leaderboard", path: "Leaderboard", icon: Trophy, description: "Rankings" },
  { name: "Badges", path: "Badges", icon: Award, description: "Achievements" },
  { name: "Socials", path: "Socials", icon: Users, description: "Friends & chat" },
  { name: "Subscription", path: "Subscription", icon: CreditCard, description: "Manage plan" },
  { name: "Contact", path: "Contact", icon: Mail, description: "Get in touch" },
];

// Memoized dashboard grid for better performance
const DashboardGrid = memo(({ pages }) => {
  const { logout } = useAuth();
  return (
  <div className="w-full px-4 sm:px-6 pt-8 sm:pt-12">
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Your Dashboard</h2>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {pages.map((/** @type {any} */ page) => {
          const Icon = page.icon;
          return (
            <Link
              key={page.path}
              to={createPageUrl(page.path)}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 sm:p-4 hover:border-amber-500/50 hover:bg-zinc-800/50 transition-all overflow-hidden min-w-0"
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mb-2 flex-shrink-0" />
              <h3 className="text-white font-semibold text-xs sm:text-sm mb-0.5 group-hover:text-amber-400 transition-colors truncate">
                {page.name}
              </h3>
              <p className="text-zinc-500 text-xs truncate">{page.description}</p>
            </Link>
          );
        })}
      </div>
      </div>
      </div>
  );
});

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.auth.me()
      .then(u => { if (mounted) setUser(u); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Preload critical sections immediately, defer others
  useEffect(() => {
    TrustSignals.preload?.();
    PhilosophySection.preload?.();
  }, []);

  return (
    <div className="bg-zinc-950">
      <SEOHead 
        title="7% - Improve 7% Every Week | Discipline-Driven Fitness Platform"
        description="Improve 7% every week with personalised workouts, calorie tracking, AI coaching, and a competitive leaderboard. Most people quit. The 7% stay disciplined."
        ogTitle="7% - Improve 7% Every Week"
        ogDescription="Most people quit. The 7% stay disciplined."
        ogUrl="https://7percent.info"
      />
      <HeroSection />
      
      {user && <DashboardGrid pages={appPages} />}
      
      <DeferredPreloadManager />
      
      <Suspense fallback={<div className="h-20 bg-zinc-900" />}>
         <TrustSignals />
         <PhilosophySection />
         <FeaturesSection />
       </Suspense>

       <Suspense fallback={<div className="h-64 bg-zinc-900" />}>
         <HowItWorksSection />
         <PricingSection />
         <SocialProofSection />
         <MobileAppSection />
         <FAQSection />
         <NewsletterSection />
         <FooterSection />
       </Suspense>
    </div>
  );
}

export default memo(Home);