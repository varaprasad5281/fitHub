import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Flame, Trophy, Star, TrendingUp, Target, Sparkles, Award, Loader2, Calendar, Edit2, Dumbbell, Apple, ChevronRight, Crown, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import DailyChallenge from "@/components/challenges/DailyChallenge";
import PointsProgressCard from "@/components/points/PointsProgressCard";
import PointsBreakdown from "@/components/points/PointsBreakdown";
import BetaBadge from "@/components/profile/BetaBadge";
import GenderAvatar from "@/components/profile/GenderAvatar";
import BadgeManager from "@/components/profile/BadgeManager";
import ProfileEdit from "@/components/profile/ProfileEdit";
import { toast } from "sonner";
import { withActionDebug } from "@/components/debug/ActionDebugger";
import { useLanguage } from "@/components/i18n/LanguageContext";
import { useAuth } from "@/lib/AuthContext";

const goalLabels = {
  lose_weight: "Lose Weight",
  build_muscle: "Build Muscle",
  improve_endurance: "Endurance",
  stay_active: "Stay Active",
  flexibility: "Flexibility",
  general_fitness: "General Fitness",
};

const planLabels = {
  starter_monthly: "Starter",
  pro_monthly: "Pro",
  pro_yearly: "Pro (Annual)",
  elite_monthly: "Elite",
  elite_yearly: "Elite (Annual)",
};

const planColors = {
  starter_monthly: "text-zinc-400 border-zinc-700 bg-zinc-800/50",
  pro_monthly: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  pro_yearly: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  elite_monthly: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  elite_yearly: "text-amber-400 border-amber-500/30 bg-amber-500/10",
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { logout } = useAuth();

  useEffect(() => {
    api.auth.me()
      .then(userData => setUser(userData))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('checkout') === 'success') {
        toast.success('Subscription activated!');
        api.analytics.track({ eventName: 'subscription_activated', properties: { source: 'checkout_success' } });
        window.history.replaceState({}, '', window.location.pathname);
      }
      api.analytics.track({ eventName: 'profile_viewed', properties: { authenticated: true } });

      // Auto-calculate today's points on every profile visit (idempotent — server ignores duplicate calls for same day)
      api.functions.invoke('calculateDailyPoints')
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['points'] });
          queryClient.invalidateQueries({ queryKey: ['userPoints'] });
        })
        .catch(() => {});
    }
  }, [user]);

  const { data: profiles = [] } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.entities.Profile.list(),
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const { data: streaks = [] } = useQuery({
    queryKey: ['streak'],
    queryFn: () => api.entities.Streak.list(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: points = [] } = useQuery({
    queryKey: ['points'],
    queryFn: () => api.entities.Points.list(),
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const { data: workoutCompletions = [] } = useQuery({
    queryKey: ['workout-completions-week'],
    queryFn: () => api.entities.WorkoutCompletion.list('-completed_date', 7),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: pointsData = {} } = useQuery({
    queryKey: ['userPoints'],
    queryFn: () => api.functions.invoke('getUserPointsAndLevel'),
    enabled: !!user,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.entities.Subscription.filter({ created_by: user?.email }),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const profile = profiles[0];
  const streak = streaks[0];
  const pts = points[0];
  // Get the most recent active subscription
  const activeSubscription = subscriptions.find(s => s.status === 'active' || s.status === 'trial') || subscriptions[0];

  const calculateDailyPoints = async () => {
    await withActionDebug('Recalculate Points', async () => {
      await api.functions.invoke('calculateDailyPoints');
      queryClient.invalidateQueries({ queryKey: ['userPoints'] });
      queryClient.invalidateQueries({ queryKey: ['points'] });
      toast.success('Points recalculated');
      api.analytics.track({ eventName: 'points_calculated', properties: { page: 'profile' } });
    }, {
      setLoading: setCalculating,
      onError: () => toast.error('Could not recalculate points. Please try again.')
    })();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full text-center">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 sm:p-12">
            <Sparkles className="w-16 h-16 text-amber-400 mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t("profile.signupPrompt")}</h2>
            <p className="text-zinc-400 mb-8">{t("profile.signupText")}</p>
            <div className="space-y-3">
              <Button onClick={() => api.auth.redirectToLogin(window.location.pathname)} className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold h-12 rounded-full">
                {t("profile.createAccount")}
              </Button>
              <p className="text-zinc-600 text-sm">
                {t("profile.haveAccount")}{' '}
                <button onClick={() => api.auth.redirectToLogin(window.location.pathname)} className="text-amber-400 hover:text-amber-300 underline">{t("profile.login")}</button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const today = new Date();
  const dayOfWeek = today.getDay();
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="min-h-screen bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Hero banner ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black text-2xl shrink-0 overflow-hidden">
                {profile?.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <GenderAvatar gender={profile?.gender} className="w-9 h-9" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">{user?.full_name || 'Athlete'}</h1>
                  <BetaBadge size="sm" />
                </div>
                {profile?.username && <p className="text-amber-400 text-sm font-medium">@{profile.username}</p>}
                <p className="text-zinc-500 text-sm">{user?.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {profile?.fitness_goal && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                      {goalLabels[profile.fitness_goal] || profile.fitness_goal}
                    </span>
                  )}
                  {activeSubscription?.plan && (
                    <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold flex items-center gap-1 ${planColors[activeSubscription.plan] || planColors.starter_monthly}`}>
                      {(activeSubscription.plan?.includes('elite') || activeSubscription.plan?.includes('pro')) && <Crown className="w-3 h-3" />}
                      {planLabels[activeSubscription.plan] || activeSubscription.plan}
                    </span>
                  )}
                  {pointsData?.currentLevel && (
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3" /> Level {pointsData.currentLevel}
                    </span>
                  )}
                </div>
                {pointsData?.currentLevel && (
                  <div className="mt-2 w-40">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>Lvl {pointsData.currentLevel}</span>
                      <span>Lvl {pointsData.currentLevel + 1}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all"
                        style={{ width: `${Math.min(100, pointsData.progressPercentage || 0)}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">{pointsData.pointsInLevel || 0} / {pointsData.pointsNeededForNextLevel || 100} XP</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEdit(true)}
                className="border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-400 rounded-full gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> {t("profile.edit")}
              </Button>
              <Link to={createPageUrl("Subscription")}>
                <Button variant="outline" size="sm" className="border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-400 rounded-full">
                  {t("profile.manage")}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-zinc-700 text-zinc-400 bg-zinc-800/50 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 rounded-full gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> {t("profile.signout")}
              </Button>
            </div>
          </div>
          {profile?.bio && (
            <p className="text-zinc-400 text-sm mt-4 pt-4 border-t border-zinc-800">{profile.bio}</p>
          )}
        </motion.div>



        {/* ── Quick Links ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: t("profile.logWorkout"), icon: Dumbbell, to: "WorkoutBuilder", color: "text-blue-400" },
            { label: t("profile.logNutrition"), icon: Apple, to: "Nutrition", color: "text-green-400" },
            { label: "Coaching", icon: Sparkles, to: "Coaching", color: "text-amber-400" },
          ].map(({ label, icon: Icon, to, color }) => (
            <Link key={to} to={createPageUrl(to)}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50 active:bg-zinc-800 transition-all cursor-pointer group"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon className={`w-4 h-4 ${color} shrink-0`} />
                <span className="text-zinc-300 text-sm font-medium group-hover:text-white transition-colors">{label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 ml-auto group-hover:text-zinc-400 transition-colors" />
              </motion.div>
            </Link>
          ))}
        </div>

        {/* ── Main content ── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left: Level progress + Points breakdown */}
          <div className="lg:col-span-2 space-y-6">
            <PointsProgressCard
              totalPoints={pointsData.totalPoints || 0}
              currentLevel={pointsData.currentLevel || 1}
              nextLevelPoints={pointsData.nextLevelPoints || 100}
              pointsInLevel={pointsData.pointsInLevel || 0}
              pointsNeededForNextLevel={pointsData.pointsNeededForNextLevel || 100}
              progressPercentage={pointsData.progressPercentage || 0}
            />
            <PointsBreakdown
              breakdown={pointsData.breakdown || {}}
              todayPoints={pointsData.todayPoints || 0}
            />
          </div>

          {/* Right: Daily challenge + Weekly activity + Profile info */}
          <div className="space-y-6">
            <DailyChallenge />

            {/* Weekly activity */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  {t("profile.thisWeek")}
                </h3>
                <button
                  type="button"
                  onClick={calculateDailyPoints}
                  disabled={calculating}
                  className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center transition-colors disabled:opacity-50"
                  title="Recalculate points"
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                  {calculating ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Award className="w-3 h-3 text-zinc-400" />}
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  const dayDate = new Date();
                  const diff = i - ((dayOfWeek + 6) % 7);
                  dayDate.setDate(today.getDate() + diff);
                  const hasWorkout = workoutCompletions.some(w =>
                    new Date(w.completed_date).toDateString() === dayDate.toDateString()
                  );
                  const isToday = dayDate.toDateString() === today.toDateString();
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-semibold ${
                        hasWorkout ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' :
                        isToday ? 'bg-zinc-700 border border-zinc-600 text-white' :
                        'bg-zinc-800/50 border border-zinc-800 text-zinc-600'
                      }`}>
                        {day}
                      </div>
                      {isToday && <div className="w-1 h-1 rounded-full bg-amber-400" />}
                    </div>
                  );
                })}
              </div>
              <p className="text-zinc-600 text-xs mt-3 text-center">
                {workoutCompletions.length} {t("profile.workoutsThisWeek")}
              </p>
            </motion.div>

            {/* Badge manager + View Progress */}
            {profile && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">{t("profile.myBadges")}</span>
                    </div>
                    <Link to={createPageUrl("Badges")}>
                      <span className="text-xs text-amber-400 hover:text-amber-300 font-semibold">{t("profile.viewAll")}</span>
                    </Link>
                  </div>
                  <BadgeManager />
                </div>

                {/* View Progress link */}
                <Link to={createPageUrl("Progress")}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all cursor-pointer group mt-2"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <TrendingUp className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="text-zinc-300 text-sm font-medium group-hover:text-white transition-colors">{t("profile.viewProgress")}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600 ml-auto group-hover:text-zinc-400 transition-colors" />
                  </motion.div>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEdit && profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm"
            style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
            onClick={() => setShowEdit(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full sm:max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-3xl sm:rounded-3xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                <h2 className="text-white font-bold text-lg">{t("profile.edit")}</h2>
                <button onClick={() => setShowEdit(false)} className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors">
                  <span className="text-zinc-400 text-lg leading-none">×</span>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[80vh]">
                <ProfileEdit profile={profile} onClose={() => setShowEdit(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}