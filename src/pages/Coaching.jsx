import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Lightbulb, Loader2, History, X, Star } from "lucide-react";
import { activeSub, hasProAccess } from '@/lib/subscriptionUtils';
import CoachingPreview from '@/components/conversion/CoachingPreview';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CoachingCard from "@/components/coaching/CoachingCard";

export default function Coaching() {
  const queryClient = useQueryClient();

  const { data: coaching = [], isLoading, isFetching } = useQuery({
    queryKey: ['coaching-sessions'],
    queryFn: () => api.entities.CoachingSession.list(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.entities.ProgressGoal.filter({ status: 'active' }),
    initialData: [],
    staleTime: 1000 * 60 * 5,
  });

  const { data: subscriptions = [], isLoading: subLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.entities.Subscription.list(),
    staleTime: 1000 * 60 * 5,
  });
  const sub = activeSub(subscriptions);
  const hasCoachingAccess = hasProAccess(sub);

  const generateCoachingMutation = useMutation({
    mutationFn: async () => {
      await api.functions.invoke('generateDailyCoaching', {
        goals: (goals || []).map((g) => ({
          type: g.goal_type,
          name: g.goal_name,
          target: g.target_value,
          unit: g.unit,
          progress: g.current_value,
          percentage: g.progress_percentage,
        })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-sessions'] });
      toast.success('New coaching generated!');
    },
    onError: () => {
      toast.error('Failed to generate coaching. Please try again.');
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ sessionId, feedback }) =>
      api.entities.CoachingSession.update(sessionId, { feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching-sessions'] });
    },
  });

  const favouriteMutation = useMutation({
    mutationFn: ({ sessionId, favourited }) =>
      api.entities.CoachingSession.update(sessionId, { favourited }),
    onSuccess: (_, { favourited }) => {
      queryClient.invalidateQueries({ queryKey: ['coaching-sessions'] });
      toast.success(favourited ? 'Added to favourites' : 'Removed from favourites');
    },
  });

  const [showHistory, setShowHistory] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  // Show the most recently generated daily session regardless of date
  const latestCoaching = coaching.find((c) => c.session_type === 'daily');
  const weeklyCoaching = coaching.find((c) => c.session_type === 'weekly');
  const previousDailyCoaching = coaching.filter(
    (c) => c.session_type === 'daily' && c.session_date !== today && c.feedback === 'helpful'
  );

  if (isLoading || subLoading || (isFetching && coaching.length === 0)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (!hasCoachingAccess) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">Coaching</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Unlock Your Coach</h1>
            <p className="text-zinc-500">Get personalised daily coaching — upgrade Pro to access</p>
          </div>
          <CoachingPreview />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">Coaching</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Your Personal Coach</h1>
          <p className="text-zinc-500">Get personalized fitness advice based on your data</p>
        </div>

        {/* Weekly Coaching Section */}
         {weeklyCoaching && (
           <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-6 sm:p-8 mb-8">
             <div className="flex items-start gap-4 mb-6">
               <div className="p-3 rounded-xl bg-blue-500/20">
                 <Sparkles className="w-6 h-6 text-blue-400" />
               </div>
               <div className="flex-1">
                 <h2 className="text-xl font-bold text-white mb-1">Weekly Review</h2>
                 <p className="text-zinc-400 text-sm">Long-term insights and strategic recommendations</p>
               </div>
             </div>
             <CoachingCard 
               coaching={weeklyCoaching}
               onFeedback={(feedback) => feedbackMutation.mutate({ 
                 sessionId: weeklyCoaching.id, 
                 feedback 
               })}
             />
           </div>
         )}

        {/* Daily Coaching Section */}
         <div 
           data-coaching-section
           className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8 mb-8"
         >
           <div className="flex items-start gap-4 mb-6">
             <div className="p-3 rounded-xl bg-amber-500/20">
               <Lightbulb className="w-6 h-6 text-amber-400" />
             </div>
             <div className="flex-1">
               <h2 className="text-xl font-bold text-white mb-1">Daily Coaching</h2>
               <p className="text-zinc-400 text-sm">Personalized advice based on your progress metrics</p>
             </div>
           </div>

           {latestCoaching ? (
             <div>
               <CoachingCard
                 coaching={latestCoaching}
                 onFeedback={(feedback) => feedbackMutation.mutate({
                   sessionId: latestCoaching.id,
                   feedback
                 })}
               />
               <div className="mt-6 flex flex-col sm:flex-row gap-3">
                 <Button
                   onClick={() => generateCoachingMutation.mutate()}
                   disabled={generateCoachingMutation.isPending}
                   className="flex-1 bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 hover:border-amber-500 rounded-full touch-target font-medium"
                 >
                   {generateCoachingMutation.isPending ? (
                     <>
                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                       Generating...
                     </>
                   ) : (
                     <>
                       <Sparkles className="w-4 h-4 mr-2" />
                       Refresh Coaching Plan
                     </>
                     )}
                 </Button>
               </div>
             </div>
           ) : (
             <div className="text-center py-8">
               <Lightbulb className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
               <p className="text-zinc-400 mb-4">Complete workouts and log meals to generate personalized coaching</p>
               <Button
                 onClick={() => generateCoachingMutation.mutate()}
                 disabled={generateCoachingMutation.isPending}
                 className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold px-6 rounded-full touch-target"
               >
                 {generateCoachingMutation.isPending ? (
                   <>
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     Generating...
                   </>
                 ) : (
                   <>
                     <Sparkles className="w-4 h-4 mr-2" />
                     Generate Coaching
                   </>
                 )}
               </Button>
             </div>
           )}
         </div>

         {/* Previous Daily Coaching Button */}
         {previousDailyCoaching.length > 0 && (
           <div className="text-center">
             <Button
               onClick={() => setShowHistory(true)}
               className="bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30 hover:border-amber-500 rounded-full px-6 gap-2"
             >
               <History className="w-4 h-4" />
               Previous Daily Coaching ({previousDailyCoaching.length})
             </Button>
           </div>
         )}
      </div>

      {/* History Drawer */}
      {showHistory && (
       <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
         <div
           onClick={e => e.stopPropagation()}
           className="w-full sm:max-w-4xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
         >
           {/* Header */}
           <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
             <div className="flex items-center gap-2">
               <History className="w-5 h-5 text-amber-400" />
               <h2 className="text-white font-bold text-lg">Previous Daily Coaching</h2>
             </div>
             <div className="flex items-center gap-3">
               <span className="text-zinc-500 text-sm">{previousDailyCoaching.length} sessions</span>
               <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors">
                 <X className="w-4 h-4 text-zinc-400" />
               </button>
             </div>
           </div>

           <div className="overflow-y-auto flex-1 px-6 pb-6">
             {/* Favourites section */}
             {previousDailyCoaching.some(s => s.favourited) && (
               <div className="pt-5">
                 <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1">
                   <Star className="w-3 h-3 fill-amber-400" /> Favourites
                 </p>
                 <div className="grid sm:grid-cols-2 gap-4 mb-6">
                   {previousDailyCoaching.filter(s => s.favourited).map(session => (
                     <CoachingCard
                       key={session.id}
                       coaching={session}
                       onFeedback={(feedback) => feedbackMutation.mutate({ sessionId: session.id, feedback })}
                       onFavourite={() => favouriteMutation.mutate({ sessionId: session.id, favourited: !session.favourited })}
                     />
                   ))}
                 </div>
                 <div className="border-t border-zinc-800 mb-5" />
               </div>
             )}

             {/* All sessions grid */}
             <div className={previousDailyCoaching.some(s => s.favourited) ? '' : 'pt-5'}>
               {previousDailyCoaching.filter(s => !s.favourited).length > 0 && (
                 <>
                   {previousDailyCoaching.some(s => s.favourited) && (
                     <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">All Sessions</p>
                   )}
                   <div className="grid sm:grid-cols-2 gap-4">
                     {previousDailyCoaching.filter(s => !s.favourited).map(session => (
                       <CoachingCard
                         key={session.id}
                         coaching={session}
                         onFeedback={(feedback) => feedbackMutation.mutate({ sessionId: session.id, feedback })}
                         onFavourite={() => favouriteMutation.mutate({ sessionId: session.id, favourited: !session.favourited })}
                       />
                     ))}
                   </div>
                 </>
               )}
             </div>
           </div>
         </div>
       </div>
      )}
    </div>
  );
}