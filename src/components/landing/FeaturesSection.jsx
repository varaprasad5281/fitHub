import React from 'react';
import { Target, Dumbbell, Apple, Trophy, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Target,
    title: "Personalized Calorie Tracking",
    description: "Accurate BMR-based goals + macro insights",
    emoji: "🎯"
  },
  {
    icon: Dumbbell,
    title: "Personalized Workouts",
    description: "Built for your body, goals & preferences",
    emoji: "🏋️"
  },
  {
    icon: Apple,
    title: "Personalized Meal Plans",
    description: "Daily meals + weekly cheat meals that fit your goals",
    emoji: "🍽"
  },
  {
    icon: Trophy,
    title: "Paid Leaderboard",
    description: "Compete, earn points, earn discipline",
    emoji: "🏆"
  },
  {
    icon: Sparkles,
    title: "Discipline Nudges",
    description: "Motivation and accountability built into your routine",
    emoji: "💪"
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Built for the <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">7%</span>
          </h2>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            Everything you need to stay disciplined and achieve your fitness goals
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 hover:border-amber-500/30 hover:bg-zinc-900/80 transition-all duration-300"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-3xl">{feature.emoji}</span>
              </div>
              
              <h3 className="text-white font-semibold text-xl mb-2">
                {feature.title}
              </h3>
              
              <p className="text-zinc-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}