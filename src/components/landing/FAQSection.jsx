import React from 'react';
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is the 7% mindset?",
    answer: "93% of people quit their fitness goals within the first 3 months. The 7% stay disciplined, consistent, and committed no matter what. This app is built for them - gamified accountability, real competition, and personalised guidance to keep you on track."
  },
  {
    question: "How does pricing work?",
    answer: "There are two paid plans. 7% Pro unlocks nutrition tracking, workout plans, and coaching. 7% Elite adds the global leaderboard, challenges, friends, and social features. Pro comes with a 7-day free trial. No hidden fees. Cancel anytime."
  },
  {
    question: "Is there a free trial?",
    answer: "Yes - 7% Pro includes a 7-day free trial. You won't be charged until after your trial ends, and you can cancel at any time before then with no cost."
  },
  {
    question: "What happens after I unsubscribe?",
    answer: "You keep your data and progress, but lose access to premium features at the end of your billing period. You can resubscribe anytime and pick up where you left off."
  },
  {
    question: "What's the difference between Pro and Elite?",
    answer: "Pro gives you the core fitness tools: nutrition tracking, meal plans, workout builder, and coaching. Elite adds everything social and competitive including the global leaderboard, weekly challenges, friends, and the activity feed."
  },
  {
    question: "How often does the leaderboard reset?",
    answer: "The weekly leaderboard resets every Monday at midnight. Top 3 earners get exclusive badges. The all-time leaderboard never resets. It is your legacy. Leaderboard access requires an Elite subscription."
  },
  {
    question: "Is nutrition tracking included?",
    answer: "Yes, with a Pro or Elite subscription. Get personalised calorie targets based on your BMR, macro breakdowns, meal logging, and daily meal plans (including weekly cheat meals)."
  },
  {
    question: "How do I earn points?",
    answer: "Complete workouts, log meals, maintain streaks, and hit your daily targets. Every action builds your score. Discipline earns rewards."
  },
  {
    question: "Can I track my own workouts?",
    answer: "Yes. Log custom workouts or use our generated plans tailored to your body, goals, and preferences. Workout tracking is available on Pro and Elite."
  }
];

export default function FAQSection() {
  return (
    <section className="py-24 px-6 bg-zinc-950">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-500 text-lg">
            Everything you need to know
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 data-[state=open]:border-amber-500/30"
              >
                <AccordionTrigger className="text-left text-white hover:text-amber-400 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}