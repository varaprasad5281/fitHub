import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Trophy, TrendingUp, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ProUpsellModal({ isOpen, onClose, trigger, userStats }) {
  const messages = {
    top_10: {
      title: "You're in the Top 10! 🔥",
      description: "You're already disciplined. Now compete at Elite level with exclusive leaderboards and advanced features.",
      icon: Trophy,
    },
    streak_30: {
      title: "30-Day Streak Achieved! 🎯",
      description: "Your consistency is incredible. Serious about improvement? Elite members improve 7% faster.",
      icon: TrendingUp,
    },
    challenges_3: {
      title: "3 Challenges Completed! ⚡",
      description: "You're proving your discipline. Elite access unlocks exclusive challenges. Limited division spots available.",
      icon: Crown,
    },
  };

  const message = messages[trigger] || messages.top_10;
  const Icon = message.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-amber-500/30 text-white max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <DialogHeader className="text-center pt-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-amber-400" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white mb-2">
            {message.title}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-base">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-3">
          <Link to={createPageUrl("Subscription")} onClick={onClose}>
            <Button className="w-full bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:border-red-500 font-semibold rounded-xl h-12">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Elite
            </Button>
          </Link>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl h-12"
          >
            Maybe Later
          </Button>
        </div>

        <p className="text-zinc-600 text-xs text-center mt-4">
          Join the elite 7% who stay disciplined. Limited spots available.
        </p>
      </DialogContent>
    </Dialog>
  );
}