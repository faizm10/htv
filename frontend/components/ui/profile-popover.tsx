'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  X, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Target,
  Calendar,
  BarChart3,
  Award,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileStats {
  totalConversations: number;
  averageResponseTime: number; // in hours
  longestDryStreak: number; // in days
  averageDrynessScore: number; // 0-100
  totalMessages: number;
  ghostScore: number; // 0-100
  responseRate: number; // 0-100
  engagementScore: number; // 0-100
  mostActiveHour: number; // 0-23
  conversationHealth: 'healthy' | 'at_risk' | 'critical';
  topTopics: string[];
  improvementAreas: string[];
}

interface ProfilePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  className?: string;
}

// mock data for profile statistics
const mockProfileStats: ProfileStats = {
  totalConversations: 12,
  averageResponseTime: 2.3, // hours
  longestDryStreak: 5, // days
  averageDrynessScore: 34, // out of 100
  totalMessages: 847,
  ghostScore: 23, // out of 100 (lower is better)
  responseRate: 87, // percentage
  engagementScore: 78, // out of 100
  mostActiveHour: 14, // 2 PM
  conversationHealth: 'healthy',
  topTopics: ['work', 'weekend plans', 'movies', 'food'],
  improvementAreas: ['response time after 11pm', 'asking follow-up questions']
};

export function ProfilePopover({ isOpen, onClose, user, className }: ProfilePopoverProps) {
  const [stats] = useState<ProfileStats>(mockProfileStats);

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-400';
      case 'at_risk': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <Award className="w-4 h-4" />;
      case 'at_risk': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* popover */}
          <motion.div
            className={cn(
              'fixed top-16 right-4 w-96 bg-background border border-border rounded-lg shadow-lg z-50',
              'max-h-[calc(100vh-5rem)] overflow-y-auto',
              className
            )}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {user?.email?.split('@')[0] || 'Profile'}
                  </h3>
                  <p className="text-sm text-muted-foreground">conversation stats</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* content */}
            <div className="p-4 space-y-6">
              {/* overall health */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getHealthIcon(stats.conversationHealth)}
                  <span className="font-medium">conversation health</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-2xl font-bold', getHealthColor(stats.conversationHealth))}>
                    {stats.conversationHealth}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({stats.engagementScore}/100 engagement)
                  </span>
                </div>
              </div>

              {/* key metrics grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">total convos</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {stats.totalConversations}
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">avg response</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {formatTime(stats.averageResponseTime)}
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium">longest dry</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {stats.longestDryStreak}d
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">response rate</span>
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {stats.responseRate}%
                  </div>
                </div>
              </div>

              {/* dryness score */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">average dryness score</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.averageDrynessScore}/100
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-yellow-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.averageDrynessScore}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.averageDrynessScore < 30 ? 'you keep it fresh!' : 
                   stats.averageDrynessScore < 60 ? 'pretty good vibes' : 
                   'time to spice things up'}
                </p>
              </div>

              {/* ghost score */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">ghost risk score</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.ghostScore}/100
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-red-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.ghostScore}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.ghostScore < 30 ? 'low risk of ghosting' : 
                   stats.ghostScore < 60 ? 'moderate ghost risk' : 
                   'high ghost risk - time to engage!'}
                </p>
              </div>

              {/* activity insights */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">activity insights</h4>
                
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">most active at</span>
                  <span className="font-medium">{formatHour(stats.mostActiveHour)}</span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">total messages sent</span>
                  <span className="font-medium">{stats.totalMessages.toLocaleString()}</span>
                </div>
              </div>

              {/* top topics */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">top conversation topics</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.topTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* improvement areas */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">areas to improve</h4>
                <div className="space-y-2">
                  {stats.improvementAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
