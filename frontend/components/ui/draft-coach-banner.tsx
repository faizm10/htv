'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DraftCoachBannerProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
  className?: string;
}

export function DraftCoachBanner({ suggestions, onSelectSuggestion, className }: DraftCoachBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <motion.div
      className={cn(
        'ghost-card p-4 mb-4 border-l-4 border-l-amber-500/50',
        className
      )}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22, type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌵</span>
          <h3 className="font-semibold text-amber-400">
            That's Sahara-level dry — want spice?
          </h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss suggestion"
        >
          ✕
        </button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">
        Try one of these to keep the conversation flowing:
      </p>
      
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            onClick={() => onSelectSuggestion(suggestion)}
            className="inline-flex items-center px-3 py-2 text-sm bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
