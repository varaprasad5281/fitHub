import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Dumbbell, Apple, Play, CheckCircle, Zap, Trophy, Flame } from 'lucide-react';

const MOCK_STATS = [
  { icon: Flame, label: '21-day streak', color: 'text-orange-400' },
  { icon: Dumbbell, label: 'Workout done', color: 'text-blue-400' },
  { icon: Trophy, label: 'Rank #12', color: 'text-amber-400' },
];

export default function MobileAppSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section className="relative py-24 px-6 bg-zinc-950 overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: Copy ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Coming Soon</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              7% in your{' '}
              <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                pocket
              </span>
            </h2>

            <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-md">
              The 7% mobile app is on its way. Track workouts, log meals, and stay on your streak - anywhere, anytime.
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-10">
              {[
                'Real-time workout tracking with voice cues',
                'Instant meal logging with camera scan',
                'Push notifications to protect your streak',
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>

            {/* Store badges */}
            <div className="flex flex-wrap gap-3 mb-10">
              {/* App Store */}
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 opacity-60 cursor-not-allowed select-none">
                <Apple className="w-7 h-7 text-white" />
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Coming soon on</p>
                  <p className="text-white font-bold text-sm leading-tight">App Store</p>
                </div>
              </div>
              {/* Google Play */}
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 opacity-60 cursor-not-allowed select-none">
                <Play className="w-7 h-7 text-white fill-white" />
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Coming soon on</p>
                  <p className="text-white font-bold text-sm leading-tight">Google Play</p>
                </div>
              </div>
            </div>

            {/* Notify me form */}
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20"
              >
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                <p className="text-green-400 text-sm font-medium">You're on the list! We'll notify you on launch day.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <div className="relative flex-1">
                  <Bell className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/60 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap"
                >
                  Notify Me
                </button>
              </form>
            )}
            <p className="text-zinc-600 text-xs mt-3">No spam. Just a ping when we go live.</p>
          </motion.div>

          {/* ── Right: Phone mockup ─────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute inset-0 bg-amber-400/10 blur-3xl rounded-full scale-75 pointer-events-none" />

              {/* Phone shell */}
              <div className="relative w-[260px] sm:w-[280px] rounded-[40px] bg-zinc-900 border-4 border-zinc-700 shadow-2xl overflow-hidden"
                style={{ height: 560 }}>

                {/* Status bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-2 bg-zinc-950">
                  <span className="text-white text-xs font-semibold">9:41</span>
                  <div className="flex gap-1 items-center">
                    <div className="w-3 h-1.5 bg-white rounded-sm" />
                    <div className="w-3 h-1.5 bg-white rounded-sm" />
                    <div className="w-3 h-1.5 bg-white/50 rounded-sm" />
                  </div>
                </div>

                {/* App content */}
                <div className="bg-zinc-950 h-full px-4 pb-6 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-zinc-500 text-xs">Good morning,</p>
                      <p className="text-white font-bold text-base">Athlete 🔥</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-xs">7%</div>
                  </div>

                  {/* Streak card */}
                  <div className="rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">Current Streak</p>
                        <p className="text-white font-black text-3xl">21 🔥</p>
                        <p className="text-zinc-400 text-xs mt-0.5">days in a row</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                        <Trophy className="w-7 h-7 text-amber-400" />
                      </div>
                    </div>
                  </div>

                  {/* Today's stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {MOCK_STATS.map((s) => (
                      <div key={s.label} className="rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-center">
                        <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
                        <p className="text-white text-[10px] font-semibold leading-tight">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Quick workout */}
                  <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 mb-3">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Today's Workout</p>
                    <p className="text-white font-bold text-sm">Upper Body Power</p>
                    <p className="text-zinc-500 text-xs mt-0.5">6 exercises · 45 min</p>
                    <div className="mt-2 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500" />
                    </div>
                  </div>

                  {/* Calorie ring */}
                  <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 flex items-center gap-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#27272a" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3"
                          strokeDasharray="60 40" strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">60%</span>
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">1,260 / 2,100 kcal</p>
                      <p className="text-zinc-500 text-[10px]">840 remaining</p>
                    </div>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/30 rounded-full" />
              </div>

              {/* Floating notification */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="absolute -right-4 top-24 w-44 bg-zinc-900 border border-zinc-700 rounded-2xl p-3 shadow-xl"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[8px] font-black text-black">7%</div>
                  <span className="text-zinc-400 text-[10px]">Just now</span>
                </div>
                <p className="text-white text-xs font-semibold">🔥 Streak at risk!</p>
                <p className="text-zinc-500 text-[10px]">Log a workout to keep your 21-day streak alive.</p>
              </motion.div>

              {/* Floating points badge */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1 }}
                className="absolute -left-6 bottom-32 bg-zinc-900 border border-amber-500/30 rounded-2xl px-3 py-2 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-amber-400 text-xs font-bold">+50 pts</p>
                    <p className="text-zinc-500 text-[10px]">Workout done!</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
