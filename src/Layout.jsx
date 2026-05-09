import React, { useState, useEffect, useRef, memo } from 'react';
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { api } from "@/api/client";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import ErrorBoundary from "@/components/ErrorBoundary";
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";
import DebugModeToggle from "@/components/debug/DebugModeToggle";
import CompatibilityDebugger, { useCompatibilityDebugger } from "@/components/debug/CompatibilityDebugger";
import CompatibilityInitializer from "@/components/CompatibilityInitializer";
import InteractionAudit from "@/components/debug/InteractionAudit";
import { InteractionAuditPanel } from "@/components/InteractionGuardian";
import { LanguageProvider, useLanguage } from "@/components/i18n/LanguageContext";
import { GOLD } from "@/components/config/constants";
import { useAuth } from "@/lib/AuthContext";

const publicPages = ["Home", "Features", "Pricing", "Contact", "Terms", "Privacy"];

// Reusable dropdown for desktop nav
function NavDropdown({ label, children, hasbadge }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        {label}
        {hasbadge && <span className="w-2 h-2 rounded-full bg-red-500 mb-2" />}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 rounded-xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl shadow-xl py-1 z-50">
          {children}
        </div>
      )}
    </div>
  );
}

function NavDropdownItem({ to, onClick, children, badge }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center justify-between px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
    >
      {children}
      {badge > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}

function MobileLink({ to, onClose, children, badge }) {
  return (
    <Link
      to={to}
      onClick={onClose}
      className="flex items-center justify-between text-base text-zinc-400 py-3 px-2 rounded-lg active:bg-zinc-800 transition-colors touch-target"
      style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
    >
      {children}
      {badge > 0 && (
        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  );
}

function LayoutContent({ children, currentPageName }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadActivityCount, setUnreadActivityCount] = useState(0);
  const compatDebugger = useCompatibilityDebugger();
  const { t } = useLanguage();
  const { user, isLoadingAuth: loading } = useAuth();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

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
          <div className="hidden md:flex items-center gap-5 lg:gap-6">
            {user ? (
              <>
                <Link to={createPageUrl("Workouts")} className="text-sm text-zinc-400 hover:text-white transition-colors">Workouts</Link>
                <Link to={createPageUrl("Nutrition")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.nutrition")}</Link>
                <Link to={createPageUrl("Coaching")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.coaching")}</Link>

                {/* Community dropdown */}
                <NavDropdown label="Community" hasbadge={unreadActivityCount > 0}>
                  <NavDropdownItem to={createPageUrl("Challenges")} onClick={() => {}}>Challenges</NavDropdownItem>
                  <NavDropdownItem to={createPageUrl("Leaderboard")} onClick={() => {}}>Leaderboard</NavDropdownItem>
                  <NavDropdownItem to={createPageUrl("Badges")} onClick={() => {}}>Badges</NavDropdownItem>
                  <NavDropdownItem to={createPageUrl("Socials")} onClick={() => {}} badge={unreadActivityCount}>Social</NavDropdownItem>
                </NavDropdown>

                {/* Account dropdown */}
                <NavDropdown label="Account">
                  <NavDropdownItem to={createPageUrl("Profile")} onClick={() => {}}>{t("nav.profile")}</NavDropdownItem>
                  <NavDropdownItem to={createPageUrl("Subscription")} onClick={() => {}}>Subscription</NavDropdownItem>
                  <NavDropdownItem to={createPageUrl("Contact")} onClick={() => {}}>{t("nav.contact")}</NavDropdownItem>
                </NavDropdown>
              </>
            ) : (
              <>
                <Link to={createPageUrl("Home")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.home")}</Link>
                <Link to={createPageUrl("Pricing")} className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link>
                <Link to={createPageUrl("Contact")} className="text-sm text-zinc-400 hover:text-white transition-colors">{t("nav.contact")}</Link>
              </>
            )}
            <div className="flex items-center gap-4 ml-2">
              {user && <NotificationCenter />}
              {!loading && !user && (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="border-amber-500/50 text-amber-400 hover:border-amber-400 hover:text-amber-300 text-sm rounded-full touch-target transition-colors">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className={`bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold text-sm px-5 rounded-full touch-target ${GOLD.shine}`}>
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
            <div className="px-4 py-4 space-y-1 overflow-y-auto momentum-scroll" style={{ maxHeight: 'calc(var(--vh, 1vh) * 100 - 4rem)' }}>
              {user ? (
                <>
                  {/* Core */}
                  <MobileLink to={createPageUrl("Workouts")} onClose={() => setMenuOpen(false)}>Workouts</MobileLink>
                  <MobileLink to={createPageUrl("Nutrition")} onClose={() => setMenuOpen(false)}>{t("nav.nutrition")}</MobileLink>
                  <MobileLink to={createPageUrl("Coaching")} onClose={() => setMenuOpen(false)}>{t("nav.coaching")}</MobileLink>

                  {/* Community group */}
                  <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest px-2 pt-4 pb-1">Community</p>
                  <MobileLink to={createPageUrl("Challenges")} onClose={() => setMenuOpen(false)}>Challenges</MobileLink>
                  <MobileLink to={createPageUrl("Leaderboard")} onClose={() => setMenuOpen(false)}>Leaderboard</MobileLink>
                  <MobileLink to={createPageUrl("Badges")} onClose={() => setMenuOpen(false)}>Badges</MobileLink>
                  <MobileLink to={createPageUrl("Socials")} onClose={() => setMenuOpen(false)} badge={unreadActivityCount}>Social</MobileLink>

                  {/* Account group */}
                  <p className="text-xs font-semibold text-zinc-600 uppercase tracking-widest px-2 pt-4 pb-1">Account</p>
                  <MobileLink to={createPageUrl("Profile")} onClose={() => setMenuOpen(false)}>{t("nav.profile")}</MobileLink>
                  <MobileLink to={createPageUrl("Subscription")} onClose={() => setMenuOpen(false)}>Subscription</MobileLink>
                  <MobileLink to={createPageUrl("Contact")} onClose={() => setMenuOpen(false)}>{t("nav.contact")}</MobileLink>
                </>
              ) : (
                <>
                  <MobileLink to={createPageUrl("Home")} onClose={() => setMenuOpen(false)}>{t("nav.home")}</MobileLink>
                  <MobileLink to={createPageUrl("Pricing")} onClose={() => setMenuOpen(false)}>Pricing</MobileLink>
                  <MobileLink to={createPageUrl("Contact")} onClose={() => setMenuOpen(false)}>{t("nav.contact")}</MobileLink>
                </>
              )}

              {!loading && !user && (
                <div className="pt-4 space-y-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-amber-500/50 text-amber-400 hover:border-amber-400 hover:text-amber-300 rounded-full touch-target transition-colors">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    <Button className={`w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold rounded-full touch-target ${GOLD.shine}`}>Start Free</Button>
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