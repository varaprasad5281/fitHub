/**
 * Badge Notification Center
 * Shows premium modal when badge is unlocked
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import BadgePremiumUnlock from './BadgePremiumUnlock';

export default function BadgeNotificationCenter() {
  const [notification, setNotification] = useState(null);

  // Listen for badge unlock messages
  useEffect(() => {
    const handleBadgeUnlock = (event) => {
      const { badge, userBadge } = event.detail;
      setNotification({ badge, userBadge });
    };

    window.addEventListener('badgeUnlocked', handleBadgeUnlock);
    return () => window.removeEventListener('badgeUnlocked', handleBadgeUnlock);
  }, []);

  const handleClose = () => {
    setNotification(null);
  };

  return (
    <AnimatePresence>
      {notification && (
        <BadgePremiumUnlock
          badge={notification.badge}
          userBadge={notification.userBadge}
          onFeature={() => {
            // Handle feature badge action here
            handleClose();
          }}
          onClose={handleClose}
        />
      )}
    </AnimatePresence>
  );
}

// Emit badge unlock event
export const triggerBadgeNotification = (badge, userBadge) => {
  const event = new CustomEvent('badgeUnlocked', { detail: { badge, userBadge } });
  window.dispatchEvent(event);
};