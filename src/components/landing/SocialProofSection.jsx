import React from 'react';
import { motion } from "framer-motion";
import { Rocket, Star, Shield, Zap } from "lucide-react";

const betaPerks = [
  {
    icon: Star,
    title: "Exclusive Beta Badge",
    description: "Every beta member receives a permanent 'Beta Founder' badge displayed on their profile - a mark of being here from day one."
  },
  {
    icon: Zap,
    title: "Shape the Product",
    description: "Your feedback directly influences what we build. Beta members get direct access to the team and early previews of new features."
  },
  {
    icon: Shield,
    title: "Early Adopter Status",
    description: "Be among the first to join the 7% movement. Early members set the standard and earn permanent recognition in the community."
  },
  {
    icon: Rocket,
    title: "Priority Access",
    description: "Beta members get first access to every new feature before global launch - no waitlists, no delays."
  }
];

export default function SocialProofSection() {
  return (
    <section className="py-24 px-6 bg-zinc-900/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
            <Rocket className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">Beta Launch</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            You're In Early.
            <span className="block bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              That Means Everything.
            </span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            7% is in beta. Every member joining now is a founding member - and we're rewarding that with perks that last forever.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {betaPerks.map((perk, i) => (
            <motion.div
              key={perk.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex gap-4"
            >
              <div className="shrink-0 w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <perk.icon className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">{perk.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{perk.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Beta badge preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center"
        >
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-4 font-semibold">Your Profile Badge</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40">
            <Rocket className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-bold tracking-wide">Beta Founder</span>
          </div>
          <p className="text-zinc-500 text-sm mt-4 max-w-md mx-auto">
            Join during beta and this badge is permanently on your profile - a mark of being part of the 7% from the very beginning.
          </p>
        </motion.div>
      </div>
    </section>
  );
}