import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Premium success animation - elegant, brief, rewarding
 * Auto-dismisses after 2 seconds
 */
export default function SuccessFeedback({
  message = 'Success!',
  icon = <CheckCircle2 className="w-6 h-6" />,
  onDismiss = null,
  duration = 2000
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-none"
        >
          <div className="rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 px-6 py-4 flex items-center gap-3 backdrop-blur-sm">
            <div className="text-green-400">
              {icon}
            </div>
            <p className="text-white font-medium text-sm">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}