import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section 
      className="relative flex items-center justify-center overflow-hidden px-4" 
      style={{ minHeight: 'calc(var(--vh, 1vh) * 85)' }}
      role="banner"
    >
      {/* Ambient glow — pointer-events-none so they never block taps */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-amber-400/5 rounded-full blur-[80px] pointer-events-none" aria-hidden="true" />
      
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo mark */}
          <div className="inline-flex items-center justify-center mb-8">
            <div className="relative">
              <span className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                7%
              </span>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-amber-400/60" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6">
            Start Your <span className="bg-gradient-to-b from-amber-200 to-amber-500 bg-clip-text text-transparent">7% Journey</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed px-4">
            Most people quit. The 7% stay disciplined.
            <span className="text-white font-semibold"> The extra 7% changes everything.</span>
          </p>


          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-green-400 text-sm font-semibold">Try Pro free for 7 days. No charge until after trial.</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 justify-center px-4 w-full sm:w-auto">
            <Link to={createPageUrl("Onboarding")} className="w-full sm:w-auto">
              <Button 
                type="button"
                size="lg"
                aria-label="Start free trial"
                className="w-full sm:w-auto bg-gradient-to-r from-amber-300 to-amber-500 text-black font-bold px-8 sm:px-10 h-14 text-base rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-pulse-glow active:scale-95 transition-transform touch-target"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                Join the 7% Free
              </Button>
            </Link>
            <Link to={createPageUrl("Pricing")} className="w-full sm:w-auto">
              <Button 
                type="button"
                size="lg"
                variant="outline"
                aria-label="View pricing plans"
                className="w-full sm:w-auto border-amber-500/50 text-amber-400 bg-amber-500/5 h-14 px-8 text-base rounded-full active:scale-95 transition-transform touch-target"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                Compare Plans
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-16 sm:mt-20 grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto px-2"
        >
          {[
            { value: "7%", label: "Weekly Growth" },
            { value: "52x", label: "Annual Compound" },
            { value: "∞", label: "Potential" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}