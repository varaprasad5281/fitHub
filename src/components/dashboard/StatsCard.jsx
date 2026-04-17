import React from "react";
import { motion } from "framer-motion";

export default function StatsCard({ icon: Icon, label, value, accent, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-2xl border p-4 sm:p-6 ${
        accent
          ? "bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30"
          : "border-zinc-800 bg-zinc-900/50"
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
          accent ? "bg-amber-500/20" : "bg-zinc-800"
        }`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${accent ? "text-amber-400" : "text-zinc-400"}`} />
        </div>
        <div>
          <p className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-wider">{label}</p>
          <p className="text-white text-xl sm:text-2xl font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}