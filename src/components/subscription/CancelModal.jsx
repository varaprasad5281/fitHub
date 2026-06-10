import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Target } from "lucide-react";

export default function CancelModal({ isOpen, onClose, onConfirmCancel, cancelling }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Wait, before you go...</DialogTitle>
          <DialogDescription className="text-zinc-400">
            You're about to lose access to features that keep you accountable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-4">
            <h4 className="text-white font-semibold mb-3 text-sm">What you'll lose:</h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <Trophy className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">Leaderboard Access</p>
                  <p className="text-zinc-500 text-xs">No more competing with the disciplined 7%</p>
                </div>
              </div>
              <div className="flex gap-3">
                <TrendingUp className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">Advanced Analytics</p>
                  <p className="text-zinc-500 text-xs">Lose insights into your progress trends</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Target className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium">AI Coaching</p>
                  <p className="text-zinc-500 text-xs">No personalized workout & meal plans</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
            <p className="text-amber-300 text-sm font-medium mb-1">Remember why you started.</p>
            <p className="text-zinc-400 text-xs">
              Most people quit. The 7% push through the hard days. Which group do you want to be in?
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-xl h-11"
          >
            Keep My Subscription
          </Button>
          <Button
            onClick={onConfirmCancel}
            disabled={cancelling}
            variant="outline"
            className="flex-1 border-zinc-700 text-zinc-400 hover:bg-zinc-800 rounded-xl h-11"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Anyway'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}