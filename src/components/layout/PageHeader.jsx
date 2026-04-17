import React from 'react';
import { motion } from 'framer-motion';

/**
 * Consistent page header component with icon, label, title, and description
 * Ensures visual consistency across all pages
 */
export default function PageHeader({ 
  icon: Icon, 
  label, 
  title, 
  description,
  action = null,
  className = ''
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-8 ${className}`}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          {Icon && label && (
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-5 h-5 text-amber-400" />
              <p className="text-amber-400 text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">
                {label}
              </p>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {title}
          </h1>
          {description && (
            <p className="text-zinc-500 text-sm mt-1">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </motion.div>
  );
}