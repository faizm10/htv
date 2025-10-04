'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Wand2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DraftCoachBannerProps {
  suggestions: string[]
  onSelectSuggestion: (suggestion: string) => void
  className?: string
}

export function DraftCoachBanner({ suggestions, onSelectSuggestion, className }: DraftCoachBannerProps) {
  return (
    <motion.div
      className={cn(
        'ghost-card p-4 mb-4 border-amber-500/20 bg-amber-500/5',
        className
      )}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Wand2 className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-medium text-amber-400">
          That's Sahara-level dry 🌵 — want spice?
        </h3>
        <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 400, damping: 25 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectSuggestion(suggestion)}
              className="text-xs h-8 px-3 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/50"
            >
              {suggestion}
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
