export interface UserInsight {
  user: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  metrics: {
    daysSinceReply: number | null;
    responseRate: number;
    drynessScore: number;
    ghostScore: number;
    totalMessages: number;
    averageResponseTime: number;
  };
  conversation: {
    id: string;
    title: string;
    lastActivity: string;
  };
}

export interface ConversationInsights {
  [userId: string]: UserInsight;
}

export async function generateInsights(conversationId: string): Promise<ConversationInsights> {
  try {
    // For demo purposes, use the demo API with conversation ID and timestamp to ensure fresh data
    const response = await fetch(`/api/insights/demo?conversationId=${encodeURIComponent(conversationId)}&t=${Date.now()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to generate insights: ${response.statusText}`);
    }

    const data = await response.json();
    return data.insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw error;
  }
}

export function getInsightSummary(insights: ConversationInsights) {
  const users = Object.values(insights);
  
  if (users.length === 0) {
    return {
      totalUsers: 0,
      averageGhostScore: 0,
      mostActiveUser: null,
      leastActiveUser: null,
      conversationHealth: 'unknown'
    };
  }

  const averageGhostScore = users.reduce((sum, user) => sum + user.metrics.ghostScore, 0) / users.length;
  
  const mostActiveUser = users.reduce((prev, current) => 
    current.metrics.totalMessages > prev.metrics.totalMessages ? current : prev
  );
  
  const leastActiveUser = users.reduce((prev, current) => 
    current.metrics.totalMessages < prev.metrics.totalMessages ? current : prev
  );

  let conversationHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (averageGhostScore > 70) {
    conversationHealth = 'critical';
  } else if (averageGhostScore > 40) {
    conversationHealth = 'warning';
  }

  return {
    totalUsers: users.length,
    averageGhostScore: Math.round(averageGhostScore),
    mostActiveUser,
    leastActiveUser,
    conversationHealth
  };
}

export function formatInsightMetric(value: number, type: 'percentage' | 'days' | 'hours' | 'score' | 'count'): string {
  switch (type) {
    case 'percentage':
      return `${Math.round(value * 100)}%`;
    case 'days':
      return `${value} day${value !== 1 ? 's' : ''}`;
    case 'hours':
      return `${Math.round(value)}h`;
    case 'score':
      return `${Math.round(value)}/100`;
    case 'count':
      return value.toString();
    default:
      return value.toString();
  }
}
