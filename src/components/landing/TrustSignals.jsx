import React from 'react';
import { Rocket, Zap, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TrustSignals() {
  const signals = [
    { icon: Rocket, value: "Beta", label: "Now Live" },
    { icon: Users, value: "Growing", label: "Community" },
    { icon: Star, value: "Founder", label: "Badge Included" },
    { icon: Zap, value: "First", label: "Feature Access" }
  ];

  return (
    <section className="py-16 bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {signals.map((signal, idx) => (
            <motion.div
              key={signal.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <signal.icon className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white mb-1">{signal.value}</div>
              <div className="text-sm text-zinc-500">{signal.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 max-w-3xl mx-auto text-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-zinc-900 p-10"
        >
          <h3 className="text-white text-2xl sm:text-3xl font-black mb-3">
            Ready to become elite?
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-7 max-w-xl mx-auto">
            Only 7% of people who start a fitness journey actually stick with it. Join a community of athletes who track smarter, train harder, and never quit. Start with a free 7-day trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={createPageUrl("Onboarding")} className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-500/20 cursor-pointer touch-action-manipulation select-none active:scale-95 transition-transform"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                Start Free. 7 Days Trial.
              </button>
            </Link>
            <Link to={createPageUrl("Pricing")} className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-3 rounded-full border border-amber-500 text-amber-400 hover:bg-amber-500/10 font-semibold text-sm cursor-pointer active:scale-95 transition-all"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                View Plans
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}