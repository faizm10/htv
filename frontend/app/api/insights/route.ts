import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = await request.json();
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    
    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get all messages for this conversation
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Get user details
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', [conversation.user_id, conversation.other_user_id]);

    if (usersError) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    const userMap = new Map(users.map(user => [user.id, user]));

    // Calculate insights for each user
    const insights = calculateUserInsights(messages, conversation, userMap);

    return NextResponse.json({ insights });

  } catch (error) {
    console.error('Insights generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateUserInsights(messages: any[], conversation: any, userMap: Map<string, any>) {
  const userIds = [conversation.user_id, conversation.other_user_id];
  const insights: any = {};

  userIds.forEach(userId => {
    const user = userMap.get(userId);
    if (!user) return;

    const userMessages = messages.filter(msg => msg.sender_id === userId);
    const otherUserMessages = messages.filter(msg => msg.sender_id !== userId);

    // Calculate days since last reply
    const lastMessage = userMessages[userMessages.length - 1];
    const daysSinceReply = lastMessage 
      ? Math.floor((Date.now() - new Date(lastMessage.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Calculate response rate
    const responseRate = calculateResponseRate(userMessages, otherUserMessages);

    // Calculate dryness score (average word count)
    const drynessScore = calculateDrynessScore(userMessages);

    // Calculate ghost score
    const ghostScore = calculateGhostScore(userMessages, otherUserMessages, daysSinceReply);

    insights[userId] = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url
      },
      metrics: {
        daysSinceReply,
        responseRate,
        drynessScore,
        ghostScore,
        totalMessages: userMessages.length,
        averageResponseTime: calculateAverageResponseTime(userMessages, otherUserMessages)
      },
      conversation: {
        id: conversation.id,
        title: conversation.title,
        lastActivity: conversation.updated_at
      }
    };
  });

  return insights;
}

function calculateResponseRate(userMessages: any[], otherUserMessages: any[]): number {
  if (otherUserMessages.length === 0) return 1; // If no messages from other user, 100% response rate
  
  // Count how many times the user responded to the other user
  let responses = 0;
  let opportunities = 0;

  for (let i = 0; i < otherUserMessages.length; i++) {
    const otherMessage = otherUserMessages[i];
    opportunities++;
    
    // Check if user responded after this message
    const nextUserMessage = userMessages.find(msg => 
      new Date(msg.created_at) > new Date(otherMessage.created_at)
    );
    
    if (nextUserMessage) {
      responses++;
    }
  }

  return opportunities > 0 ? responses / opportunities : 0;
}

function calculateDrynessScore(userMessages: any[]): number {
  if (userMessages.length === 0) return 0;

  const totalWords = userMessages.reduce((sum, msg) => {
    const content = msg.content?.text || '';
    return sum + content.split(/\s+/).filter((word: string) => word.length > 0).length;
  }, 0);

  const averageWords = totalWords / userMessages.length;
  
  // Normalize to 0-1 scale (assuming 0-50 words is the range)
  return Math.min(averageWords / 50, 1);
}

function calculateGhostScore(userMessages: any[], otherUserMessages: any[], daysSinceReply: number | null): number {
  let score = 0;

  // Factor 1: Days since last reply (0-40 points)
  if (daysSinceReply !== null) {
    if (daysSinceReply === 0) score += 0;
    else if (daysSinceReply <= 1) score += 5;
    else if (daysSinceReply <= 3) score += 15;
    else if (daysSinceReply <= 7) score += 25;
    else if (daysSinceReply <= 14) score += 35;
    else score += 40;
  }

  // Factor 2: Response rate (0-30 points)
  const responseRate = calculateResponseRate(userMessages, otherUserMessages);
  score += (1 - responseRate) * 30;

  // Factor 3: Message frequency decline (0-20 points)
  if (userMessages.length >= 4) {
    const recentMessages = userMessages.slice(-Math.floor(userMessages.length / 2));
    const olderMessages = userMessages.slice(0, Math.floor(userMessages.length / 2));
    
    const recentFrequency = recentMessages.length / (recentMessages.length + olderMessages.length);
    const olderFrequency = olderMessages.length / (recentMessages.length + olderMessages.length);
    
    if (recentFrequency < olderFrequency * 0.5) {
      score += 20;
    } else if (recentFrequency < olderFrequency * 0.7) {
      score += 10;
    }
  }

  // Factor 4: Dryness score (0-10 points)
  const drynessScore = calculateDrynessScore(userMessages);
  score += drynessScore * 10;

  return Math.min(Math.round(score), 100);
}

function calculateAverageResponseTime(userMessages: any[], otherUserMessages: any[]): number {
  if (userMessages.length === 0 || otherUserMessages.length === 0) return 0;

  let totalResponseTime = 0;
  let responseCount = 0;

  for (let i = 0; i < otherUserMessages.length; i++) {
    const otherMessage = otherUserMessages[i];
    const nextUserMessage = userMessages.find(msg => 
      new Date(msg.created_at) > new Date(otherMessage.created_at)
    );
    
    if (nextUserMessage) {
      const responseTime = new Date(nextUserMessage.created_at).getTime() - 
                          new Date(otherMessage.created_at).getTime();
      totalResponseTime += responseTime;
      responseCount++;
    }
  }

  return responseCount > 0 ? totalResponseTime / responseCount / (1000 * 60 * 60) : 0; // in hours
}
