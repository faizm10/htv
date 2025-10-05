'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  MessageSquare, 
  Users, 
  ChevronRight,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConversationInsight, UserInsight } from '@/lib/conversation-insights-service';

interface InsightsDashboardProps {
  insights: ConversationInsight;
  className?: string;
}

export function InsightsDashboard({ insights, className }: InsightsDashboardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'participants']));
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <XCircle className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const formatMetric = (value: number, type: 'percentage' | 'hours' | 'days' | 'score' | 'count'): string => {
    switch (type) {
      case 'percentage':
        return `${Math.round(value * 100)}%`;
      case 'hours':
        return `${Math.round(value)}h`;
      case 'days':
        return `${Math.round(value)}d`;
      case 'score':
        return `${Math.round(value)}/100`;
      case 'count':
        return value.toString();
      default:
        return value.toString();
    }
  };

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overview Section */}
      <motion.div
        className="bg-background border border-border rounded-lg overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => toggleSection('overview')}
          className="w-full flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Conversation Overview</h3>
            <motion.div 
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm',
                getHealthColor(insights.overallHealth)
              )}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {getHealthIcon(insights.overallHealth)}
              {insights.overallHealth.toUpperCase()}
            </motion.div>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.has('overview') ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {expandedSections.has('overview') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border"
            >
              <div className="p-3 space-y-3">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 gap-2">
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-3 rounded-lg border border-blue-200/50 dark:border-blue-800/30"
                whileHover={{ scale: 1.01, y: -1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-blue-500/10 rounded-md">
                    <MessageSquare className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Messages</span>
                </div>
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">{insights.summary.totalMessages}</div>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 p-3 rounded-lg border border-green-200/50 dark:border-green-800/30"
                whileHover={{ scale: 1.01, y: -1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-green-500/10 rounded-md">
                    <Clock className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Duration</span>
                </div>
                <div className="text-lg font-bold text-green-900 dark:text-green-100">{formatMetric(insights.summary.conversationDuration, 'days')}</div>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 p-3 rounded-lg border border-purple-200/50 dark:border-purple-800/30"
                whileHover={{ scale: 1.01, y: -1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-purple-500/10 rounded-md">
                    <Users className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Participants</span>
                </div>
                <div className="text-lg font-bold text-purple-900 dark:text-purple-100">{insights.participants.length}</div>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 p-3 rounded-lg border border-orange-200/50 dark:border-orange-800/30"
                whileHover={{ scale: 1.01, y: -1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 bg-orange-500/10 rounded-md">
                    {getMomentumIcon(insights.summary.conversationMomentum)}
                  </div>
                  <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Momentum</span>
                </div>
                <div className="text-lg font-bold text-orange-900 dark:text-orange-100 capitalize">{insights.summary.conversationMomentum}</div>
              </motion.div>
            </div>

                {/* Removed Relationship Stage section */}

                {/* Removed Key Topics section */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Participants Section */}
      <motion.div
        className="bg-background border border-border rounded-lg overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button
          onClick={() => toggleSection('participants')}
          className="w-full flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Participants Analysis</h3>
          </div>
          <motion.div
            animate={{ rotate: expandedSections.has('participants') ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {expandedSections.has('participants') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border"
            >
              <div className="p-4 space-y-3">
                {insights.participants.map((participant, index) => (
                  <motion.div
                    key={participant.userId}
                    className={cn(
                      'p-4 rounded-xl border transition-all cursor-pointer',
                      selectedUser === participant.userId 
                        ? 'border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg' 
                        : 'border-border bg-gradient-to-r from-muted/30 to-muted/20 hover:from-muted/50 hover:to-muted/40 hover:shadow-md'
                    )}
                    onClick={() => setSelectedUser(selectedUser === participant.userId ? null : participant.userId)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                          <span className="text-sm font-bold text-primary">
                            {(participant.userName || participant.userId).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{participant.userName || `User ${participant.userId.slice(0, 8)}`}</div>
                          <motion.div 
                            className={cn(
                              'text-xs px-2.5 py-1 rounded-full border font-medium',
                              getHealthColor(participant.metrics.conversationHealth)
                            )}
                            whileHover={{ scale: 1.05 }}
                          >
                            {participant.metrics.conversationHealth}
                          </motion.div>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: selectedUser === participant.userId ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                        <div className="font-bold text-blue-700 dark:text-blue-300">{formatMetric(participant.metrics.totalMessages, 'count')}</div>
                        <div className="text-blue-600 dark:text-blue-400 font-medium">Messages</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200/50 dark:border-green-800/30">
                        <div className="font-bold text-green-700 dark:text-green-300">{formatMetric(participant.metrics.responseRate, 'percentage')}</div>
                        <div className="text-green-600 dark:text-green-400 font-medium">Response Rate</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200/50 dark:border-orange-800/30">
                        <div className="font-bold text-orange-700 dark:text-orange-300">{formatMetric(participant.metrics.ghostScore, 'score')}</div>
                        <div className="text-orange-600 dark:text-orange-400 font-medium">Ghost Score</div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {selectedUser === participant.userId && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t border-border"
                        >
                          <div className="space-y-3">
                            {/* Detailed Metrics */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <div className="text-muted-foreground mb-1">Avg Response Time</div>
                                <div className="font-medium">{formatMetric(participant.metrics.averageResponseTime, 'hours')}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">Engagement Score</div>
                                <div className="font-medium">{formatMetric(participant.metrics.engagementScore, 'score')}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">Avg Message Length</div>
                                <div className="font-medium">{Math.round(participant.metrics.messageLength.average)} chars</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1">Last Active</div>
                                <div className="font-medium">
                                  {new Date(participant.metrics.lastActivity).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            {/* Patterns */}
                            <div>
                              <div className="text-xs text-muted-foreground mb-2">Communication Patterns</div>
                              <div className="flex flex-wrap gap-1">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {participant.patterns.responseTimePattern}
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  {participant.patterns.messageFrequency}
                                </span>
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                  {participant.patterns.conversationStyle}
                                </span>
                              </div>
                            </div>

                            {/* Recommendations */}
                            {participant.recommendations.length > 0 && (
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Recommendations</div>
                                <div className="space-y-1">
                                  {participant.recommendations.slice(0, 2).map((rec, idx) => (
                                    <div key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                                      <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      {rec}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Removed AI Insights section */}

      {/* Removed Actionable Suggestions section */}
    </div>
  );
}
