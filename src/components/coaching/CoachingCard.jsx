import React from 'react';
import { ThumbsUp, ThumbsDown, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CoachingCard({ coaching, onFeedback, onFavourite }) {
  const categoryEmoji = {
    workout: '💪',
    nutrition: '🥗',
    recovery: '😴',
    general: '⭐'
  };

  const formatTimestamp = (date, updatedAt) => {
    const d = new Date(updatedAt || date);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">{categoryEmoji[coaching.category] || '💡'}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {coaching.session_date && (
              <span className="text-zinc-500 text-xs">
                {coaching.session_date}
              </span>
            )}
            {coaching.updated_date && (
              <div className="flex items-center gap-1 text-zinc-600 text-xs ml-auto">
                <Clock className="w-3 h-3" />
                <span>Updated {formatTimestamp(coaching.session_date, coaching.updated_date)}</span>
              </div>
            )}
          </div>
          {coaching.category && (
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide">{coaching.category}</p>
          )}
        </div>
      </div>

      {/* Main content — structured advice or plain-text fallback */}
      {(coaching.advice || coaching.content) && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mb-4">
          <p className="text-zinc-100 text-sm leading-relaxed font-medium">
            {coaching.advice || coaching.content}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {coaching.actionable_items && coaching.actionable_items.length > 0 && (
          <div className="bg-zinc-800/40 rounded-lg p-3">
            <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-2">Today's Action Items</p>
            {coaching.actionable_items.map((item, i) => (
              <div key={i} className="flex gap-2 text-sm text-zinc-300 mb-1 last:mb-0">
                <span className="text-amber-400 font-bold flex-shrink-0">{i + 1}.</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {coaching.instructions && (
          <div className="bg-zinc-800/40 rounded-lg p-3">
            <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-2">How to Execute</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{coaching.instructions}</p>
          </div>
        )}

        {coaching.blueprint && (
          <div className="bg-zinc-800/40 rounded-lg p-3">
            <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-2">24-Hour Plan</p>
            <p className="text-zinc-300 text-sm leading-relaxed">{coaching.blueprint}</p>
          </div>
        )}
      </div>

      {/* Feedback + Favourite */}
      <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
        {onFavourite && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onFavourite}
            className={`h-8 px-3 ${coaching.favourited ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' : 'text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10'}`}
          >
            <Star className={`w-4 h-4 ${coaching.favourited ? 'fill-amber-400' : ''}`} />
          </Button>
        )}
        {!coaching.feedback && (
          <>
            <span className="text-xs text-zinc-500">Helpful?</span>
            <div className="flex gap-2 ml-auto">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onFeedback('helpful')}
                className="h-8 px-3 text-zinc-400 hover:text-green-400 hover:bg-green-500/10"
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onFeedback('not_helpful')}
                className="h-8 px-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
        {coaching.feedback && (
          <span className="text-xs text-zinc-600 ml-auto">
            {coaching.feedback === 'helpful' ? '👍 Helpful' : '👎 Not helpful'}
          </span>
        )}
      </div>
    </div>
  );
}