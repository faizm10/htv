// Conversation Insights Service
// Fetches real conversation data and performs deep analysis using Gemini

import { supabaseDatabase } from './supabase-service';
import { callGeminiAPI } from './gemini';

export interface ConversationData {
  id: string;
  participants: string[];
  messages: MessageData[];
  metadata: any;
  context: any;
  metrics: any;
  settings: any;
  createdAt: string;
  updatedAt: string;
}

export interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  content: {
    text: string;
    type: 'text' | 'image' | 'link' | 'emoji' | 'voice';
    metadata?: any;
  };
  timestamp: string;
  analysis: {
    quality?: 'playful' | 'neutral' | 'dry' | 'engaging';
    requiresResponse?: boolean;
    sentiment?: 'positive' | 'neutral' | 'negative';
    topics?: string[];
    intent?: string;
  };
  status: {
    read?: boolean;
    delivered?: boolean;
    sent?: boolean;
  };
  suggestions?: any;
}

export interface UserInsight {
  userId: string;
  userName: string;
  userProfile: any;
  metrics: {
    totalMessages: number;
    averageResponseTime: number; // in hours
    responseRate: number; // percentage
    messageLength: {
      average: number;
      median: number;
      min: number;
      max: number;
    };
    engagementScore: number; // 0-100
    ghostScore: number; // 0-100 (higher = more likely to ghost)
    conversationHealth: 'healthy' | 'warning' | 'critical';
    lastActivity: string;
    activeHours: number[]; // hours of day when most active
    topics: string[];
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  patterns: {
    responseTimePattern: 'immediate' | 'fast' | 'moderate' | 'slow' | 'inconsistent';
    messageFrequency: 'high' | 'medium' | 'low';
    conversationStyle: 'formal' | 'casual' | 'mixed';
    questionAsking: 'frequent' | 'occasional' | 'rare';
    emojiUsage: 'high' | 'medium' | 'low';
  };
  recommendations: string[];
}

export interface ConversationInsight {
  conversationId: string;
  overallHealth: 'healthy' | 'warning' | 'critical';
  participants: UserInsight[];
  summary: {
    totalMessages: number;
    conversationDuration: number; // in days
    averageResponseTime: number; // in hours
    mostActiveUser: string;
    leastActiveUser: string;
    conversationMomentum: 'increasing' | 'stable' | 'decreasing';
    keyTopics: string[];
    relationshipStage: 'new' | 'developing' | 'established' | 'declining';
  };
  insights: {
    strengths: string[];
    concerns: string[];
    opportunities: string[];
    risks: string[];
  };
  suggestions: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

// Fetch conversation data from database
export async function fetchConversationData(conversationId: string): Promise<ConversationData | null> {
  try {
    console.log('🔍 [Insights] Fetching conversation data for ID:', conversationId);
    
    // Get conversation details
    const conversation = await supabaseDatabase.getConversation(conversationId);
    if (!conversation) {
      console.error('❌ [Insights] Conversation not found:', conversationId);
      throw new Error('Conversation not found');
    }
    console.log('✅ [Insights] Conversation found:', {
      id: conversation.id,
      participants: conversation.participants,
      metadata: conversation.metadata
    });

    // Get all messages for this conversation
    console.log('📨 [Insights] Fetching messages for conversation...');
    const messages = await supabaseDatabase.getMessages({ conversationId });
    console.log('✅ [Insights] Messages fetched:', {
      count: messages.length,
      firstMessage: messages[0] ? {
        id: messages[0].id,
        senderId: messages[0].senderId,
        timestamp: messages[0].timestamp,
        contentPreview: messages[0].content?.text ? 
          messages[0].content.text.substring(0, 50) + '...' : 
          'No text content'
      } : 'No messages'
    });
    
    // Get user details for all participants
    console.log('👥 [Insights] Fetching participant details...');
    const participants = await Promise.all(
      conversation.participants.map(async (userId: string) => {
        const user = await supabaseDatabase.getUser(userId);
        console.log('👤 [Insights] User fetched:', {
          id: userId,
          found: !!user,
          name: user?.profile?.name || 'Unknown'
        });
        return user;
      })
    );

    const conversationData = {
      id: conversation.id,
      participants: conversation.participants,
      messages: messages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        content: msg.content,
        timestamp: msg.timestamp,
        analysis: msg.analysis,
        status: msg.status,
        suggestions: msg.suggestions
      })),
      metadata: conversation.metadata,
      context: conversation.context,
      metrics: conversation.metrics,
      settings: conversation.settings,
      createdAt: conversation.metadata?.createdAt || new Date().toISOString(),
      updatedAt: conversation.metadata?.updatedAt || new Date().toISOString()
    };

    console.log('✅ [Insights] Conversation data prepared:', {
      id: conversationData.id,
      participantCount: conversationData.participants.length,
      messageCount: conversationData.messages.length,
      duration: Math.round((new Date().getTime() - new Date(conversationData.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + ' days'
    });

    return conversationData;
  } catch (error) {
    console.error('❌ [Insights] Error fetching conversation data:', error);
    return null;
  }
}

// Analyze conversation using Gemini AI
export async function analyzeConversationWithAI(conversationData: ConversationData): Promise<ConversationInsight> {
  try {
    console.log('🤖 [Insights] Starting AI analysis for conversation:', conversationData.id);
    
    // Prepare conversation context for AI analysis
    console.log('📝 [Insights] Preparing conversation context...');
    const conversationContext = prepareConversationContext(conversationData);
    console.log('✅ [Insights] Context prepared, length:', conversationContext.length, 'characters');
    
    // Create comprehensive analysis prompt
    console.log('🎯 [Insights] Creating analysis prompt...');
    const analysisPrompt = createAnalysisPrompt(conversationContext);
    console.log('✅ [Insights] Prompt created, length:', analysisPrompt.length, 'characters');
    
    // Get AI analysis
    console.log('🚀 [Insights] Calling Gemini API for analysis...');
    const aiResponse = await callGeminiAPI(analysisPrompt);
    console.log('✅ [Insights] AI response received:', {
      length: aiResponse.length,
      preview: aiResponse.substring(0, 200) + '...'
    });
    
    // Parse AI response and combine with calculated metrics
    console.log('🔍 [Insights] Parsing AI response...');
    const aiInsights = parseAIResponse(aiResponse);
    console.log('✅ [Insights] AI insights parsed:', {
      hasOverallHealth: !!aiInsights?.overallHealth,
      participantCount: aiInsights?.participants?.length || 0,
      hasSummary: !!aiInsights?.summary,
      hasInsights: !!aiInsights?.insights,
      hasSuggestions: !!aiInsights?.suggestions
    });
    
    console.log('📊 [Insights] Calculating conversation metrics...');
    const calculatedMetrics = calculateConversationMetrics(conversationData);
    console.log('✅ [Insights] Metrics calculated:', {
      userCount: calculatedMetrics.userMetrics.length,
      totalMessages: calculatedMetrics.totalMessages,
      conversationDuration: calculatedMetrics.conversationDuration
    });
    
    // Combine AI insights with calculated metrics
    console.log('🔗 [Insights] Combining AI insights with calculated metrics...');
    const combinedInsights = await combineInsights(aiInsights, calculatedMetrics, conversationData);
    console.log('✅ [Insights] Insights combined successfully:', {
      conversationId: combinedInsights.conversationId,
      overallHealth: combinedInsights.overallHealth,
      participantCount: combinedInsights.participants.length,
      hasSummary: !!combinedInsights.summary,
      hasInsights: !!combinedInsights.insights,
      hasSuggestions: !!combinedInsights.suggestions
    });
    
    return combinedInsights;
  } catch (error) {
    console.error('❌ [Insights] Error analyzing conversation with AI:', error);
    console.log('🔄 [Insights] Falling back to calculated metrics only...');
    // Return fallback insights based on calculated metrics only
    const fallbackInsights = await createFallbackInsights(conversationData);
    console.log('✅ [Insights] Fallback insights created:', {
      conversationId: fallbackInsights.conversationId,
      overallHealth: fallbackInsights.overallHealth,
      participantCount: fallbackInsights.participants.length
    });
    return fallbackInsights;
  }
}

// Prepare conversation context for AI analysis
function prepareConversationContext(conversationData: ConversationData): string {
  const messages = conversationData.messages
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleString();
      const content = typeof msg.content === 'string' ? msg.content : msg.content?.text || '';
      return `[${timestamp}] User ${msg.senderId}: ${content}`;
    })
    .join('\n');

  return `
Conversation ID: ${conversationData.id}
Participants: ${conversationData.participants.join(', ')}
Duration: ${Math.round((new Date().getTime() - new Date(conversationData.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
Total Messages: ${conversationData.messages.length}

Message History:
${messages}
  `.trim();
}

// Create optimized analysis prompt for Gemini (removed sections for speed)
function createAnalysisPrompt(conversationContext: string): string {
  return `
Analyze this conversation data and provide insights about communication patterns and relationship health.

${conversationContext}

Provide analysis in this JSON format:

{
  "overallHealth": "healthy|warning|critical",
  "participants": [
    {
      "userId": "user_id",
      "userName": "display_name",
      "metrics": {
        "engagementScore": 0-100,
        "ghostScore": 0-100,
        "conversationHealth": "healthy|warning|critical",
        "responseRate": 0-1,
        "averageResponseTime": hours,
        "messageLength": {
          "average": number,
          "median": number
        },
        "sentiment": {
          "positive": 0-1,
          "neutral": 0-1,
          "negative": 0-1
        }
      },
      "patterns": {
        "responseTimePattern": "immediate|fast|moderate|slow|inconsistent",
        "messageFrequency": "high|medium|low",
        "conversationStyle": "formal|casual|mixed",
        "questionAsking": "frequent|occasional|rare",
        "emojiUsage": "high|medium|low"
      },
      "recommendations": ["specific actionable advice"]
    }
  ],
  "summary": {
    "conversationMomentum": "increasing|stable|decreasing",
    "totalMessages": number,
    "conversationDuration": "days"
  }
}

Focus on communication patterns, engagement levels, and basic health metrics. Be concise and practical.
  `.trim();
}

// Parse AI response into structured data
function parseAIResponse(aiResponse: string): any {
  try {
    console.log('🔍 [Insights] Parsing AI response...', {
      responseLength: aiResponse.length,
      startsWithBrace: aiResponse.trim().startsWith('{'),
      endsWithBrace: aiResponse.trim().endsWith('}')
    });
    
    // Try to extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log('✅ [Insights] JSON match found, length:', jsonMatch[0].length);
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ [Insights] JSON parsed successfully:', {
        hasOverallHealth: !!parsed.overallHealth,
        participantCount: parsed.participants?.length || 0,
        hasSummary: !!parsed.summary,
        hasInsights: !!parsed.insights,
        hasSuggestions: !!parsed.suggestions
      });
      return parsed;
    }
    
    console.log('⚠️ [Insights] No JSON match found, using fallback structure');
    // Fallback: return basic structure (optimized)
    return {
      overallHealth: 'warning',
      participants: [],
      summary: {
        conversationMomentum: 'stable',
        totalMessages: 0,
        conversationDuration: '0 days'
      }
    };
  } catch (error) {
    console.error('❌ [Insights] Error parsing AI response:', error);
    console.error('❌ [Insights] Response that failed to parse:', aiResponse.substring(0, 500) + '...');
    return null;
  }
}

// Calculate conversation metrics from raw data
function calculateConversationMetrics(conversationData: ConversationData): any {
  const messages = conversationData.messages;
  const participants = conversationData.participants;
  
  // Group messages by sender
  const messagesByUser = participants.reduce((acc, userId) => {
    acc[userId] = messages.filter(msg => msg.senderId === userId);
    return acc;
  }, {} as Record<string, MessageData[]>);

  // Calculate metrics for each user
  const userMetrics = Object.entries(messagesByUser).map(([userId, userMessages]) => {
    const responseTimes = calculateResponseTimes(userMessages, messages);
    const messageLengths = userMessages.map(msg => {
      const content = typeof msg.content === 'string' ? msg.content : msg.content?.text || '';
      return content.length;
    });

    return {
      userId,
      totalMessages: userMessages.length,
      averageResponseTime: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
      responseRate: calculateResponseRate(userId, messages),
      messageLength: {
        average: messageLengths.length > 0 ? messageLengths.reduce((a, b) => a + b, 0) / messageLengths.length : 0,
        median: calculateMedian(messageLengths),
        min: Math.min(...messageLengths),
        max: Math.max(...messageLengths)
      },
      engagementScore: calculateEngagementScore(userMessages),
      ghostScore: calculateGhostScore(userId, messages),
      lastActivity: userMessages.length > 0 ? userMessages[userMessages.length - 1].timestamp : conversationData.createdAt
    };
  });

  return {
    userMetrics,
    totalMessages: messages.length,
    conversationDuration: Math.round((new Date().getTime() - new Date(conversationData.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  };
}

// Helper functions for metric calculations
function calculateResponseTimes(userMessages: MessageData[], allMessages: MessageData[]): number[] {
  const responseTimes: number[] = [];
  
  for (let i = 0; i < userMessages.length - 1; i++) {
    const currentMsg = userMessages[i];
    const nextMsg = allMessages.find(msg => 
      msg.timestamp > currentMsg.timestamp && 
      msg.senderId !== currentMsg.senderId
    );
    
    if (nextMsg) {
      const timeDiff = new Date(nextMsg.timestamp).getTime() - new Date(currentMsg.timestamp).getTime();
      responseTimes.push(timeDiff / (1000 * 60 * 60)); // Convert to hours
    }
  }
  
  return responseTimes;
}

function calculateResponseRate(userId: string, messages: MessageData[]): number {
  const userMessages = messages.filter(msg => msg.senderId === userId);
  const totalMessages = messages.length;
  
  if (totalMessages === 0) return 0;
  return userMessages.length / totalMessages;
}

function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}

function calculateEngagementScore(userMessages: MessageData[]): number {
  if (userMessages.length === 0) return 0;
  
  // Simple engagement score based on message frequency and length
  const avgLength = userMessages.reduce((sum, msg) => {
    const content = typeof msg.content === 'string' ? msg.content : msg.content?.text || '';
    return sum + content.length;
  }, 0) / userMessages.length;
  
  const frequencyScore = Math.min(userMessages.length * 10, 100);
  const lengthScore = Math.min(avgLength / 2, 100);
  
  return Math.round((frequencyScore + lengthScore) / 2);
}

function calculateGhostScore(userId: string, messages: MessageData[]): number {
  const userMessages = messages.filter(msg => msg.senderId === userId);
  if (userMessages.length === 0) return 100; // High ghost score if no messages
  
  const lastMessage = userMessages[userMessages.length - 1];
  const daysSinceLastMessage = (new Date().getTime() - new Date(lastMessage.timestamp).getTime()) / (1000 * 60 * 60 * 24);
  
  // Higher ghost score for longer periods of inactivity
  return Math.min(daysSinceLastMessage * 10, 100);
}

// Combine AI insights with calculated metrics
async function combineInsights(aiInsights: any, calculatedMetrics: any, conversationData: ConversationData): Promise<ConversationInsight> {
  // Fetch user details for all participants
  const userDetails = await Promise.all(
    conversationData.participants.map(async (userId: string) => {
      const user = await supabaseDatabase.getUser(userId);
      return { userId, user };
    })
  );

  return {
    conversationId: conversationData.id,
    overallHealth: aiInsights?.overallHealth || 'warning',
    participants: calculatedMetrics.userMetrics.map((userMetric: any) => {
      const userDetail = userDetails.find(u => u.userId === userMetric.userId);
      const userName = userDetail?.user?.profile?.name || userDetail?.user?.profile?.alias || `User ${userMetric.userId.slice(0, 8)}`;
      
      return {
        userId: userMetric.userId,
        userName: userName,
        userProfile: userDetail?.user?.profile || {},
        metrics: {
          ...userMetric,
          conversationHealth: userMetric.ghostScore > 70 ? 'critical' : userMetric.ghostScore > 40 ? 'warning' : 'healthy',
          activeHours: [],
          topics: [],
          sentiment: { positive: 0.5, neutral: 0.3, negative: 0.2 }
        },
        patterns: {
          responseTimePattern: userMetric.averageResponseTime < 1 ? 'immediate' : 
                             userMetric.averageResponseTime < 6 ? 'fast' :
                             userMetric.averageResponseTime < 24 ? 'moderate' : 'slow',
          messageFrequency: userMetric.totalMessages > 20 ? 'high' : userMetric.totalMessages > 10 ? 'medium' : 'low',
          conversationStyle: 'casual',
          questionAsking: 'occasional',
          emojiUsage: 'medium'
        },
        recommendations: aiInsights?.participants?.find((p: any) => p.userId === userMetric.userId)?.recommendations || []
      };
    }),
    summary: {
      totalMessages: calculatedMetrics.totalMessages,
      conversationDuration: calculatedMetrics.conversationDuration,
      averageResponseTime: calculatedMetrics.userMetrics.reduce((sum: number, user: any) => sum + user.averageResponseTime, 0) / calculatedMetrics.userMetrics.length,
      mostActiveUser: calculatedMetrics.userMetrics.reduce((prev: any, current: any) => 
        current.totalMessages > prev.totalMessages ? current : prev
      )?.userId || '',
      leastActiveUser: calculatedMetrics.userMetrics.reduce((prev: any, current: any) => 
        current.totalMessages < prev.totalMessages ? current : prev
      )?.userId || '',
      conversationMomentum: aiInsights?.summary?.conversationMomentum || 'stable',
      keyTopics: aiInsights?.summary?.keyTopics || [],
      relationshipStage: aiInsights?.summary?.relationshipStage || 'developing'
    },
    insights: aiInsights?.insights || {
      strengths: [],
      concerns: [],
      opportunities: [],
      risks: []
    },
    suggestions: aiInsights?.suggestions || {
      immediate: [],
      shortTerm: [],
      longTerm: []
    }
  };
}

// Create fallback insights when AI analysis fails
async function createFallbackInsights(conversationData: ConversationData): Promise<ConversationInsight> {
  const calculatedMetrics = calculateConversationMetrics(conversationData);
  
  // Fetch user details for all participants
  const userDetails = await Promise.all(
    conversationData.participants.map(async (userId: string) => {
      const user = await supabaseDatabase.getUser(userId);
      return { userId, user };
    })
  );
  
  return {
    conversationId: conversationData.id,
    overallHealth: 'warning',
    participants: calculatedMetrics.userMetrics.map((userMetric: any) => {
      const userDetail = userDetails.find(u => u.userId === userMetric.userId);
      const userName = userDetail?.user?.profile?.name || userDetail?.user?.profile?.alias || `User ${userMetric.userId.slice(0, 8)}`;
      
      return {
        userId: userMetric.userId,
        userName: userName,
        userProfile: userDetail?.user?.profile || {},
        metrics: {
          ...userMetric,
          conversationHealth: userMetric.ghostScore > 70 ? 'critical' : userMetric.ghostScore > 40 ? 'warning' : 'healthy',
          activeHours: [],
          topics: [],
          sentiment: { positive: 0.5, neutral: 0.3, negative: 0.2 }
        },
        patterns: {
          responseTimePattern: userMetric.averageResponseTime < 1 ? 'immediate' : 
                             userMetric.averageResponseTime < 6 ? 'fast' :
                             userMetric.averageResponseTime < 24 ? 'moderate' : 'slow',
          messageFrequency: userMetric.totalMessages > 20 ? 'high' : userMetric.totalMessages > 10 ? 'medium' : 'low',
          conversationStyle: 'casual',
          questionAsking: 'occasional',
          emojiUsage: 'medium'
        },
        recommendations: ['Keep the conversation going with engaging questions', 'Respond in a timely manner to maintain momentum']
      };
    }),
    summary: {
      totalMessages: calculatedMetrics.totalMessages,
      conversationDuration: calculatedMetrics.conversationDuration,
      averageResponseTime: calculatedMetrics.userMetrics.reduce((sum: number, user: any) => sum + user.averageResponseTime, 0) / calculatedMetrics.userMetrics.length,
      mostActiveUser: calculatedMetrics.userMetrics.reduce((prev: any, current: any) => 
        current.totalMessages > prev.totalMessages ? current : prev
      )?.userId || '',
      leastActiveUser: calculatedMetrics.userMetrics.reduce((prev: any, current: any) => 
        current.totalMessages < prev.totalMessages ? current : prev
      )?.userId || '',
      conversationMomentum: 'stable',
      keyTopics: [],
      relationshipStage: 'developing'
    },
    insights: {
      strengths: ['Active conversation participation'],
      concerns: ['Monitor response times'],
      opportunities: ['Increase engagement'],
      risks: ['Potential for conversation to stall']
    },
    suggestions: {
      immediate: ['Send a follow-up message'],
      shortTerm: ['Plan a specific activity or topic'],
      longTerm: ['Build deeper connection']
    }
  };
}

// Main function to get conversation insights
export async function getConversationInsights(conversationId: string): Promise<ConversationInsight | null> {
  try {
    console.log('🎯 [Insights] Starting conversation insights generation for:', conversationId);
    
    // Fetch conversation data
    console.log('📥 [Insights] Step 1: Fetching conversation data...');
    const conversationData = await fetchConversationData(conversationId);
    if (!conversationData) {
      console.error('❌ [Insights] Failed to fetch conversation data');
      throw new Error('Failed to fetch conversation data');
    }
    console.log('✅ [Insights] Step 1 complete: Conversation data fetched');

    // Analyze with AI
    console.log('🤖 [Insights] Step 2: Analyzing with AI...');
    const insights = await analyzeConversationWithAI(conversationData);
    console.log('✅ [Insights] Step 2 complete: AI analysis finished');
    
    console.log('🎉 [Insights] Conversation insights generation completed successfully!', {
      conversationId: insights.conversationId,
      overallHealth: insights.overallHealth,
      participantCount: insights.participants.length,
      totalMessages: insights.summary.totalMessages,
      conversationDuration: insights.summary.conversationDuration
    });
    
    return insights;
  } catch (error) {
    console.error('❌ [Insights] Error getting conversation insights:', error);
    console.error('❌ [Insights] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return null;
  }
}
