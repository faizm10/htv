'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  showTimestamp?: boolean;
  className?: string;
}

export function MessageBubble({ text, sender, timestamp, showTimestamp = true, className }: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Removed quality analysis display

  return (
    <motion.div
      className={cn(
        'flex flex-col',
        sender === 'me' ? 'items-end' : 'items-start',
        showTimestamp ? 'mb-4' : 'mb-1', // Reduce spacing when no timestamp
        className
      )}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      {showTimestamp && (
        <div className="flex justify-center mb-4 w-full">
          <span className="text-xs text-muted-foreground font-medium">
            {formatDate(timestamp)} • {formatTime(timestamp)}
          </span>
        </div>
      )}
      
      <div className={cn(
        'max-w-[85%] px-4 py-3 rounded-2xl shadow-sm break-words',
        sender === 'me' 
          ? 'bg-primary text-primary-foreground rounded-br-md' 
          : 'bg-card border border-border rounded-bl-md',
        'relative',
        // dynamic width based on text length
        text.length > 100 ? 'max-w-[95%]' : text.length > 50 ? 'max-w-[80%]' : 'max-w-[70%]'
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
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
