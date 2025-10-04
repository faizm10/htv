'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Settings, Eye, EyeOff, Ghost } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onSearch: (query: string) => void;
  className?: string;
}

export function TopBar({ onSearch, className }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [redactMode, setRedactMode] = useState(false);
  const [ghostHoverTime, setGhostHoverTime] = useState(0);
  const [showGhost, setShowGhost] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ghostHoverTime >= 3000) {
        setShowGhost(true);
        setTimeout(() => setShowGhost(false), 2000);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [ghostHoverTime]);

  useEffect(() => {
    // Load redact mode from localStorage
    const saved = localStorage.getItem('ghostwing-redact-mode');
    if (saved) {
      setRedactMode(JSON.parse(saved));
    }
  }, []);

  const handleRedactToggle = () => {
    const newMode = !redactMode;
    setRedactMode(newMode);
    localStorage.setItem('ghostwing-redact-mode', JSON.stringify(newMode));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className={cn('flex items-center justify-between p-4 border-b border-border', className)}>
      <div className="flex items-center gap-4">
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          onHoverStart={() => setGhostHoverTime(Date.now())}
          onHoverEnd={() => setGhostHoverTime(0)}
          whileHover={{ scale: 1.02 }}
        >
          <Ghost className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold">GhostWing</h1>
          {showGhost && (
            <motion.div
              className="absolute left-0 top-0 w-full h-full pointer-events-none"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Ghost className="w-4 h-4 text-primary/50" />
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-64 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchQuery('');
                onSearch('');
              }
            }}
          />
        </div>

        {/* Redact Mode Toggle */}
        <button
          onClick={handleRedactToggle}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            redactMode 
              ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
          title={redactMode ? 'Disable redact mode' : 'Enable redact mode'}
        >
          {redactMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {redactMode ? 'Redacted' : 'Redact'}
        </button>

        {/* Settings */}
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
