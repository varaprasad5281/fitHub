import React, { useState, useEffect, memo } from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { api } from "@/api/client";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import ErrorBoundary from "@/components/ErrorBoundary";
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";
import DebugModeToggle from "@/components/debug/DebugModeToggle";
import CompatibilityDebugger, { useCompatibilityDebugger } from "@/components/debug/CompatibilityDebugger";
import CompatibilityInitializer from "@/components/CompatibilityInitializer";
import InteractionAudit, { useInteractionAudit } from "@/components/debug/InteractionAudit";
import { InteractionAuditPanel } from "@/components/InteractionGuardian";
import { LanguageProvider, useLanguage } from "@/components/i18n/LanguageContext";
import { useAuth } from "@/lib/AuthContext";

const publicPages = ["Home", "Features", "Pricing", "Contact", "Terms", "Privacy"];

function LayoutContent({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadActivityCount, setUnreadActivityCount] = useState(0);
  const compatDebugger = useCompatibilityDebugger();
  const { t } = useLanguage();
  const { user, isLoadingAuth: loading } = useAuth();

  // Store debugger globally for polyfills to access
  useEffect(() => {
    window.__compatDebugger = compatDebugger;
  }, [compatDebugger]);

  // ── iOS Safari 100vh fix ──────────────────────────────────────
  // Sets a CSS custom property --vh that equals 1% of the real viewport height.
  // This avoids the mobile browser chrome causing 100vh to overflow.
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  useEffect(() => {
    if (!user?.email) {
      setUnreadActivityCount(0);
      return;
    }

    let unsubscribe;

    api.entities.ActivityFeed.list()
      .then(activities => {
        const count = activities.filter(a => !a.read_by_friends?.includes(user.email)).length;
        setUnreadActivityCount(count);
      })
      .catch(() => {});

    unsubscribe = api.entities.ActivityFeed.subscribe(() => {
      api.entities.ActivityFeed.list().then(updatedActivities => {
        const count = updatedActivities.filter(a => !a.read_by_friends?.includes(user.email)).length;
        setUnreadActivityCount(count);
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.email]);

  const isPublic = publicPages.includes(currentPageName);
  const isOnboarding = currentPageName === "Onboarding";

  // No layout for onboarding
  if (isOnboarding) return <>{children}</>;

  return (
    <ErrorBoundary>
    <>
    <CompatibilityInitializer />
    <PerformanceMonitor />
    <DebugModeToggle />
    <CompatibilityDebugger debugger={compatDebugger} />
    <InteractionAudit />
    <InteractionAuditPanel />
    <div className="min-h-screen bg-zinc-950">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl safe-top">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2 group">
            <div className="relative">
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent group-hover:from-amber-300 group-hover:via-amber-500 group-hover:to-amber-700 transition-all">
                7%
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {user ? (
              <>
                <Link to={createPageUrl("Profile")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.profile")}</Link>
                <Link to={createPageUrl("Nutrition")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.nutrition")}</Link>
                <Link to={createPageUrl("WorkoutBuilder")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.workouts")}</Link>
                <Link to={createPageUrl("Coaching")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.coaching")}</Link>
                <Link to={createPageUrl("Challenges")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.challenges")}</Link>
                <Link to={createPageUrl("Leaderboard")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.leaderboard")}</Link>
                <Link to={createPageUrl("Badges")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.badges")}</Link>
                <Link to={createPageUrl("Socials")} className="text-sm text-zinc-400 hover:text-white transition-colors relative">
                  {t("nav.social")}
                  {unreadActivityCount > 0 && (
                    <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold pointer-events-none" aria-label={`${unreadActivityCount} unread`}>
                      {unreadActivityCount > 9 ? '9+' : unreadActivityCount}
                    </span>
                  )}
                </Link>
                <Link to={createPageUrl("Subscription")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.subscription")}</Link>
                <Link to={createPageUrl("Contact")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.contact")}</Link>
              </>
            ) : (
              <>
                <Link to={createPageUrl("Home")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.home")}</Link>
                <Link to={createPageUrl("Pricing")} className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link>
                <Link to={createPageUrl("Contact")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.contact")}</Link>
              </>
            )}
            <div className="flex items-center gap-4 ml-4">
              {user && <NotificationCenter />}
              {!loading && !user && (
                <>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      className="border-amber-500/50 text-amber-400 hover:border-amber-400 hover:text-amber-300 text-sm rounded-full touch-target transition-colors"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold text-sm px-5 rounded-full touch-target">
                      Start Free
                    </Button>
                  </Link>
                </>
              )}

            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="md:hidden text-zinc-400 w-10 h-10 flex items-center justify-center rounded-lg active:bg-zinc-800 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-2 overflow-y-auto momentum-scroll" style={{ maxHeight: 'calc(var(--vh, 1vh) * 100 - 4rem)' }}>
              {user ? (
                <>
                  <Link to={createPageUrl("Profile")} onClick={() => setMenuOpen(false)} className="block text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>{t("nav.profile")}</Link>
                  <Link to={createPageUrl("Nutrition")} onClick={() => setMenuOpen(false)} className="block text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>{t("nav.nutrition")}</Link>
                  <Link to={createPageUrl("WorkoutBuilder")} onClick={() => setMenuOpen(false)} className="block text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>{t("nav.workouts")}</Link>
                  <Link to={createPageUrl("Coaching")} onClick={() => setMenuOpen(false)} className="block text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>{t("nav.coaching")}</Link>
                  <Link to={createPageUrl("Challenges")} onClick={() => setMenuOpen(false)} className="block text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>{t("nav.challenges")}</Link>
                  <Link to={createPageUrl("Leaderboard")} onClick={() => setMenuOpen(false)} className="block text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>{t("nav.leaderboard")}</Link>
                  <Link to={createPageUrl("Badges")} onClick={() => setMenuOpen(false)} className="block text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>{t("nav.badges")}</Link>
                  <Link to={createPageUrl("Socials")} onClick={() => setMenuOpen(false)} className="block text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target relative" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
                    {t("nav.social")}
                    {unreadActivityCount > 0 && (
                      <span className="absolute top-3 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold pointer-events-none">
                        {unreadActivityCount > 9 ? '9+' : unreadActivityCount}
                      </span>
                    )}
                  </Link>
                  <Link to={createPageUrl("Subscription")} onClick={() => setMenuOpen(false)} className="block text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>{t("nav.subscription")}</Link>
                  <Link to={createPageUrl("Contact")} onClick={() => setMenuOpen(false)} className="block text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>{t("nav.contact")}</Link>
                </>
              ) : (
                <>
                  <Link to={createPageUrl("Home")} onClick={() => setMenuOpen(false)} className="block text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>{t("nav.home")}</Link>
                  <Link to={createPageUrl("Pricing")} onClick={() => setMenuOpen(false)} className="block text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>Pricing</Link>
                  <Link to={createPageUrl("Contact")} onClick={() => setMenuOpen(false)} className="block text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target" style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>{t("nav.contact")}</Link>
                </>
              )}
              
              {!loading && !user && (
                <div className="pt-3 space-y-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-amber-500/50 text-amber-400 hover:border-amber-400 hover:text-amber-300 rounded-full touch-target transition-colors"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold rounded-full touch-target">Start Free</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="pt-16 pb-20 sm:pb-8">{children}</main>
    </div>
    </>
    </ErrorBoundary>
  );
}

// Wrap with Language Provider
function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </LanguageProvider>
  );
}

// Memoize layout to prevent unnecessary re-renders
export default memo(Layout);