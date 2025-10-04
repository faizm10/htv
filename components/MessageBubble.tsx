'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatTimeAgo } from '@/lib/utils'

interface MessageBubbleProps {
  text: string
  sender: 'me' | 'them'
  timestamp: Date
  quality: 'Dry' | 'Okay' | 'Playful'
  isLatest?: boolean
}

export function MessageBubble({ text, sender, timestamp, quality, isLatest = false }: MessageBubbleProps) {
  const isMe = sender === 'me'
  
  const qualityVariant = quality.toLowerCase() as 'dry' | 'okay' | 'playful'

  return (
    <motion.div
      className={cn(
        'flex gap-3 mb-4',
        isMe ? 'flex-row-reverse' : 'flex-row'
      )}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
        isMe ? 'bg-ectoplasm/20 text-ectoplasm' : 'bg-muted text-muted-foreground'
      )}>
        {isMe ? 'U' : 'T'}
      </div>

      {/* Message content */}
      <div className={cn(
        'flex flex-col gap-1 max-w-[70%]',
        isMe ? 'items-end' : 'items-start'
      )}>
        {/* Quality badge */}
        <Badge variant={qualityVariant} className="text-xs px-2 py-0.5">
          {quality}
        </Badge>

        {/* Message bubble */}
        <motion.div
          className={cn(
            'px-4 py-2 rounded-2xl text-sm leading-relaxed',
            isMe 
              ? 'bg-ectoplasm/10 text-ectoplasm border border-ectoplasm/20' 
              : 'bg-muted text-foreground border border-border/50'
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {text}
        </motion.div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground px-1">
          {formatTimeAgo(timestamp)}
        </span>
      </div>
    </motion.div>
  )
}
