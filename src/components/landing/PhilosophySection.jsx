import React from 'react';
import { motion } from "framer-motion";
import { Target, TrendingUp, Shield, Zap } from "lucide-react";

const pillars = [
  {
    icon: Target,
    title: "Set the Standard",
    description: "7% isn't arbitrary. It's the compound growth rate that separates the disciplined from the distracted."
  },
  {
    icon: TrendingUp,
    title: "Compound Weekly",
    description: "Small, consistent improvements create exponential results. 7% weekly means 33x growth in a year."
  },
  {
    icon: Shield,
    title: "Stay Disciplined",
    description: "Only 7% push beyond average. Train like the 7%. Where the 7% rise, discipline is non-negotiable."
  },
  {
    icon: Zap,
    title: "Track Everything",
    description: "What gets measured gets improved. Track your progress, streaks, and growth with precision."
  }
];

export default function PhilosophySection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-amber-400 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
            The Philosophy
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6">
            Why 7%?
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
            The 7% difference between average and elite. Small gains. 7% at a time. 
            Become the 7% others chase through relentless, measurable improvement.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative p-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm hover:border-amber-500/20 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-5">
                  <pillar.icon className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{pillar.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{pillar.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}