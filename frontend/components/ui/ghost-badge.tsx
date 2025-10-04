'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GhostBadgeProps {
  score: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

export function GhostBadge({ score, size = 'md', showPulse = false, className }: GhostBadgeProps) {
  const getTier = (score: number) => {
    if (score >= 80) return 'poltergeist';
    if (score >= 60) return 'advanced';
    if (score >= 30) return 'slow';
    return 'alive';
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'alive':
        return { 
          label: 'Alive & texting', 
          icon: '✅', 
          className: 'ghost-badge-tier-alive' 
        };
      case 'slow':
        return { 
          label: 'Slow fade', 
          icon: '🟡', 
          className: 'ghost-badge-tier-slow' 
        };
      case 'advanced':
        return { 
          label: 'Advanced haunting', 
          icon: '🟠', 
          className: 'ghost-badge-tier-advanced' 
        };
      case 'poltergeist':
        return { 
          label: 'Poltergeist mode', 
          icon: '🔴', 
          className: 'ghost-badge-tier-poltergeist' 
        };
      default:
        return { 
          label: 'Alive & texting', 
          icon: '✅', 
          className: 'ghost-badge-tier-alive' 
        };
    }
  };

  const tier = getTier(score);
  const tierInfo = getTierInfo(tier);

  const sizeClasses = {
    sm: 'h-6 px-2 text-xs',
    md: 'h-8 px-3 text-sm',
    lg: 'h-10 px-4 text-base'
  };

  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200',
        sizeClasses[size],
        tierInfo.className,
        className
      )}
      animate={showPulse ? {
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 0 rgba(155, 140, 255, 0.4)',
          '0 0 0 10px rgba(155, 140, 255, 0)',
          '0 0 0 0 rgba(155, 140, 255, 0)'
        ]
      } : {}}
      transition={{
        duration: 1.5,
        repeat: showPulse ? Infinity : 0,
        repeatType: 'loop'
      }}
      title={`${tierInfo.label} - Ghost Score: ${score}`}
    >
      <span className="text-xs">{tierInfo.icon}</span>
      <span>{score}</span>
    </motion.div>
  );
}
