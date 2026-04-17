import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

export default function OnboardingStep({ step, totalSteps, title, subtitle, children, onNext, onBack, isLast, canProceed, saving }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        {/* Progress */}
        <div className="flex gap-1.5 mb-10">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-amber-400' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>

        <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-2">
          Step {step + 1} of {totalSteps}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">{title}</h2>
        <p className="text-zinc-500 mb-8 sm:mb-10 text-sm leading-relaxed">{subtitle}</p>

        <div className="mb-10">{children}</div>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 sm:gap-0">
          {step > 0 ? (
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full px-6 touch-target"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          ) : (
            <div />
          )}
          <Button
            onClick={onNext}
            disabled={!canProceed || saving}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold px-8 h-12 sm:py-5 rounded-full shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:shadow-none transition-all duration-300 touch-target"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : isLast ? (
              <>Complete <Check className="ml-2 w-4 h-4" /></>
            ) : (
              <>Continue <ArrowRight className="ml-2 w-4 h-4" /></>
            )}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}