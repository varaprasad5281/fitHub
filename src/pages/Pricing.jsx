import React from 'react';
import SEOHead from '@/components/SEOHead';
import PricingSection from "@/components/landing/PricingSection";
import FooterSection from "@/components/landing/FooterSection";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <SEOHead 
        title="7% Pricing - Starter, Pro & Elite Discipline Plans"
        description="Choose your discipline level with 7%. Start free or unlock Pro and Elite for leaderboard competition, advanced analytics, and exclusive challenges."
        ogTitle="7% Pricing Plans"
        ogDescription="Starter, Pro, and Elite plans for fitness discipline."
        ogUrl="https://7percent.info/pricing"
      />
      <div className="pt-12 pb-6">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Choose Your <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">Discipline Level</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-2">
            Start free. Most upgrade to Pro to compete. The 1% go Elite.
          </p>
          <p className="text-zinc-500 text-sm">
            No hidden fees. Cancel anytime. 7-day free trial on Pro.
          </p>
        </div>
      </div>
      <PricingSection fullPage />
      <FooterSection />
    </div>
  );
}