'use client';

import React, { useState, useEffect } from 'react';
import { generateInsights, getInsightSummary, formatInsightMetric, type ConversationInsights } from '@/lib/insights-service';
import { Ghost, Clock, MessageSquare, TrendingDown, User, Activity } from 'lucide-react';

interface InsightsPanelProps {
  conversationId: string;
  className?: string;
}

export function InsightsPanel({ conversationId, className = '' }: InsightsPanelProps) {
  const [insights, setInsights] = useState<ConversationInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      loadInsights();
    }
  }, [conversationId]);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateInsights(conversationId);
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 bg-background border border-border rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-background border border-border rounded-lg ${className}`}>
        <div className="text-center text-red-500">
          <p>Error loading insights: {error}</p>
          <button 
            onClick={loadInsights}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className={`p-6 bg-background border border-border rounded-lg ${className}`}>
        <p className="text-muted-foreground text-center">No insights available</p>
      </div>
    );
  }

  const summary = getInsightSummary(insights);
  const users = Object.values(insights);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Card */}
      <div className="p-6 bg-background border border-border rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Conversation Summary</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{summary.totalUsers}</div>
            <div className="text-sm text-muted-foreground">Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{summary.averageGhostScore}</div>
            <div className="text-sm text-muted-foreground">Avg Ghost Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{summary.mostActiveUser?.metrics.totalMessages || 0}</div>
            <div className="text-sm text-muted-foreground">Most Active</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              summary.conversationHealth === 'healthy' ? 'text-green-500' :
              summary.conversationHealth === 'warning' ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {summary.conversationHealth.toUpperCase()}
            </div>
            <div className="text-sm text-muted-foreground">Health</div>
          </div>
        </div>
      </div>

      {/* User Insights */}
      <div className="space-y-4">
        {users.map((userInsight) => (
          <UserInsightCard key={userInsight.user.id} insight={userInsight} />
        ))}
      </div>
    </div>
  );
}

function UserInsightCard({ insight }: { insight: any }) {
  const { user, metrics } = insight;
  
  const getGhostScoreColor = (score: number) => {
    if (score <= 30) return 'text-green-500';
    if (score <= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGhostScoreLabel = (score: number) => {
    if (score <= 30) return 'Low Risk';
    if (score <= 60) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="p-6 bg-background border border-border rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold">{user.name}</h4>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Ghost Score */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${getGhostScoreColor(metrics.ghostScore)}`}>
            {formatInsightMetric(metrics.ghostScore, 'score')}
          </div>
          <div className="text-sm text-muted-foreground">Ghost Score</div>
          <div className="text-xs text-muted-foreground">{getGhostScoreLabel(metrics.ghostScore)}</div>
        </div>

        {/* Days Since Reply */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">
            {metrics.daysSinceReply !== null ? formatInsightMetric(metrics.daysSinceReply, 'days') : 'N/A'}
          </div>
          <div className="text-sm text-muted-foreground">Days Since Reply</div>
        </div>

        {/* Response Rate */}
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">
            {formatInsightMetric(metrics.responseRate, 'percentage')}
          </div>
          <div className="text-sm text-muted-foreground">Response Rate</div>
        </div>

        {/* Dryness Score */}
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-500">
            {formatInsightMetric(metrics.drynessScore, 'percentage')}
          </div>
          <div className="text-sm text-muted-foreground">Dryness Score</div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total Messages:</span>
            <span className="font-medium">{formatInsightMetric(metrics.totalMessages, 'count')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Avg Response Time:</span>
            <span className="font-medium">{formatInsightMetric(metrics.averageResponseTime, 'hours')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
