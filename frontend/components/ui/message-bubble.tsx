'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  quality: 'dry' | 'neutral' | 'playful';
  className?: string;
}

export function MessageBubble({ text, sender, timestamp, quality, className }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getQualityInfo = (quality: string) => {
    switch (quality) {
      case 'dry':
        return { label: 'Dry', className: 'message-quality-dry' };
      case 'neutral':
        return { label: 'Okay', className: 'message-quality-neutral' };
      case 'playful':
        return { label: 'Playful', className: 'message-quality-playful' };
      default:
        return { label: 'Okay', className: 'message-quality-neutral' };
    }
  };

  const qualityInfo = getQualityInfo(quality);

  return (
    <motion.div
      className={cn(
        'flex flex-col gap-1 mb-4',
        sender === 'me' ? 'items-end' : 'items-start',
        className
      )}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={cn(
          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
          qualityInfo.className
        )}>
          {qualityInfo.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatTime(timestamp)}
        </span>
      </div>
      
      <div className={cn(
        'max-w-[70%] px-4 py-3 rounded-2xl shadow-sm',
        sender === 'me' 
          ? 'bg-primary text-primary-foreground rounded-br-md' 
          : 'bg-card border border-border rounded-bl-md',
        'relative'
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
        
        {/* Message tail */}
        <div className={cn(
          'absolute w-0 h-0',
          sender === 'me' 
            ? 'bottom-0 right-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-primary'
            : 'bottom-0 left-0 border-r-[8px] border-r-transparent border-t-[8px] border-t-card'
        )} />
      </div>
    </motion.div>
  );
}
