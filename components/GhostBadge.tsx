'use client'

import { motion } from 'framer-motion'
import { getGhostTier } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface GhostBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function GhostBadge({ score, size = 'md', showLabel = false, className }: GhostBadgeProps) {
  const tier = getGhostTier(score)
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  }

  const shouldPulse = score >= 60

  return (
    <motion.div
      className={cn(
        'relative flex items-center justify-center rounded-full border-2 font-bold',
        sizeClasses[size],
        tier.color,
        shouldPulse && 'animate-ghost-pulse',
        className
      )}
      style={{
        borderColor: `hsl(var(--${tier.tier === 'alive' ? 'slime' : tier.tier === 'poltergeist' ? 'haunt' : 'ectoplasm'}))`,
        backgroundColor: `hsl(var(--${tier.tier === 'alive' ? 'slime' : tier.tier === 'poltergeist' ? 'haunt' : 'ectoplasm'}) / 0.1)`,
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <span className="flex items-center gap-1">
        <span className="text-xs">{tier.emoji}</span>
        <span>{score}</span>
      </span>
      
      {showLabel && (
        <motion.div
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {tier.label}
        </motion.div>
      )}
    </motion.div>
  )
}
