import React from 'react';
import { Apple, Dumbbell, Trophy, TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Apple,
    title: "Log Your Food",
    description: "Track meals and hit your personalized calorie targets"
  },
  {
    icon: Dumbbell,
    title: "Get Daily Workouts",
    description: "Personalised plans built for your body and goals"
  },
  {
    icon: TrendingUp,
    title: "Earn Points",
    description: "Every workout and meal logged builds your score"
  },
  {
    icon: Trophy,
    title: "Climb the Leaderboard",
    description: "Compete with the 7% who stay disciplined"
  },
  {
    icon: Target,
    title: "Stay Consistent",
    description: "Build streaks, earn badges, become unstoppable"
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 px-6 bg-zinc-900/30 border-y border-zinc-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-zinc-500 text-lg">
            Simple steps. Powerful results.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-amber-400" />
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-gradient-to-r from-amber-500/30 to-transparent" />
                )}
              </div>
              
              <div className="mb-2 text-amber-400 font-bold text-sm">
                Step {index + 1}
              </div>
              
              <h3 className="text-white font-semibold mb-2">
                {step.title}
              </h3>
              
              <p className="text-zinc-500 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}