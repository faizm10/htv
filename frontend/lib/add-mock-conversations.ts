// Script to add mock conversations between Laura & Faiz, and Smith & Wosly
// Run this in your browser console or integrate into your app

import { mockDatabase } from './mock-database-service';

export async function addMockConversations() {
  console.log('🚀 Adding mock conversations...');

  // Create users first
  const laura = await mockDatabase.updateUser('laura_id', {
    id: 'laura_id',
    profile: {
      name: 'Laura',
      alias: 'Laura',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      bio: 'Love hiking and photography 📸',
      timezone: 'PST',
      language: 'en'
    },
    preferences: {
      responseTime: 'within_hour',
      communicationStyle: 'casual',
      preferredTopics: ['hiking', 'photography', 'travel'],
      avoidTopics: ['politics'],
      ghostingTolerance: 75
    },
    analytics: {
      totalMessages: 45,
      averageResponseTime: 2.5,
      lastActiveAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      activeDays: 7,
      messageFrequency: 'high'
    },
    relationship: {
      closeness: 'close_friend',
      metIn: 'school',
      relationshipLength: '2_years',
      interactionPattern: 'regular'
    }
  });

  const faiz = await mockDatabase.updateUser('faiz_id', {
    id: 'faiz_id',
    profile: {
      name: 'Faiz',
      alias: 'Faiz',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Software engineer and coffee enthusiast ☕',
      timezone: 'EST',
      language: 'en'
    },
    preferences: {
      responseTime: 'within_day',
      communicationStyle: 'professional',
      preferredTopics: ['technology', 'coffee', 'coding'],
      avoidTopics: ['gossip'],
      ghostingTolerance: 60
    },
    analytics: {
      totalMessages: 32,
      averageResponseTime: 4.2,
      lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      activeDays: 5,
      messageFrequency: 'medium'
    },
    relationship: {
      closeness: 'good_friend',
      metIn: 'work',
      relationshipLength: '1_year',
      interactionPattern: 'occasional'
    }
  });

  const smith = await mockDatabase.updateUser('smith_id', {
    id: 'smith_id',
    profile: {
      name: 'Smith',
      alias: 'Smith',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Musician and dog lover 🎵🐕',
      timezone: 'GMT',
      language: 'en'
    },
    preferences: {
      responseTime: 'flexible',
      communicationStyle: 'playful',
      preferredTopics: ['music', 'dogs', 'art'],
      avoidTopics: ['work_stress'],
      ghostingTolerance: 80
    },
    analytics: {
      totalMessages: 28,
      averageResponseTime: 6.8,
      lastActiveAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      activeDays: 3,
      messageFrequency: 'low'
    },
    relationship: {
      closeness: 'acquaintance',
      metIn: 'social',
      relationshipLength: '6_months',
      interactionPattern: 'sporadic'
    }
  });

  const wosly = await mockDatabase.updateUser('wosly_id', {
    id: 'wosly_id',
    profile: {
      name: 'Wosly',
      alias: 'Wosly',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      bio: 'Artist and yoga instructor 🧘‍♀️',
      timezone: 'PST',
      language: 'en'
    },
    preferences: {
      responseTime: 'immediate',
      communicationStyle: 'casual',
      preferredTopics: ['art', 'yoga', 'wellness'],
      avoidTopics: ['negative_news'],
      ghostingTolerance: 90
    },
    analytics: {
      totalMessages: 67,
      averageResponseTime: 1.2,
      lastActiveAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
      activeDays: 12,
      messageFrequency: 'very_high'
    },
    relationship: {
      closeness: 'best_friend',
      metIn: 'online',
      relationshipLength: '3_years',
      interactionPattern: 'very_regular'
    }
  });

  // Create conversation between Laura and Faiz
  const lauraFaizConversation = await mockDatabase.createConversation({
    participants: ['laura_id', 'faiz_id'],
    metadata: {
      title: 'Laura & Faiz',
      type: 'direct',
      status: 'active',
      lastMessageAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    context: {
      currentTopic: 'weekend plans',
      mood: 'positive',
      urgency: 'low',
      requiresResponse: true
    },
    metrics: {
      ghostScore: 25,
      responseRate: 85,
      averageDryness: 2.3,
      daysSinceLastReply: 0,
      conversationHealth: 'healthy',
      messageCount: 45,
      lastActivityAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    settings: {
      notifications: true,
      tags: ['friends', 'weekend-plans'],
      priority: 'normal'
    }
  });

  // Add messages to Laura & Faiz conversation
  const lauraFaizMessages = [
    {
      conversationId: lauraFaizConversation.id,
      senderId: 'laura_id',
      content: { text: "Hey Faiz! How's your week going?", type: 'text' as const },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      analysis: {
        quality: 'engaging' as const,
        sentiment: 'positive' as const,
        intent: 'question' as const,
        requiresResponse: true,
        urgency: 'low' as const,
        drynessScore: 1.2
      },
      status: {
        delivered: true,
        read: true,
        readAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        edited: false
      }
    },
    {
      conversationId: lauraFaizConversation.id,
      senderId: 'faiz_id',
      content: { text: "Pretty good! Just finished a big project. How about you?", type: 'text' as const },
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      analysis: {
        quality: 'engaging' as const,
        sentiment: 'positive' as const,
        intent: 'statement' as const,
        requiresResponse: true,
        urgency: 'low' as const,
        drynessScore: 1.5
      },
      status: {
        delivered: true,
        read: true,
        readAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        edited: false
      }
    },
    {
      conversationId: lauraFaizConversation.id,
      senderId: 'laura_id',
      content: { text: "Nice! I'm thinking of going hiking this weekend. Want to join?", type: 'text' as const },
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      analysis: {
        quality: 'playful' as const,
        sentiment: 'positive' as const,
        intent: 'question' as const,
        requiresResponse: true,
        urgency: 'medium' as const,
        drynessScore: 0.8
      },
      status: {
        delivered: true,
        read: false,
        edited: false
      }
    }
  ];

  for (const message of lauraFaizMessages) {
    await mockDatabase.addMessage(message);
  }

  // Create conversation between Smith and Wosly
  const smithWoslyConversation = await mockDatabase.createConversation({
    participants: ['smith_id', 'wosly_id'],
    metadata: {
      title: 'Smith & Wosly',
      type: 'direct',
      status: 'active',
      lastMessageAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    context: {
      currentTopic: 'music collaboration',
      mood: 'excited',
      urgency: 'medium',
      requiresResponse: true
    },
    metrics: {
      ghostScore: 15,
      responseRate: 95,
      averageDryness: 1.8,
      daysSinceLastReply: 0,
      conversationHealth: 'excellent',
      messageCount: 67,
      lastActivityAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    settings: {
      notifications: true,
      tags: ['music', 'collaboration', 'creative'],
      priority: 'high'
    }
  });

  // Add messages to Smith & Wosly conversation
  const smithWoslyMessages = [
    {
      conversationId: smithWoslyConversation.id,
      senderId: 'wosly_id',
      content: { text: "Smith! I just had the most amazing idea for our song 🎵", type: 'text' as const },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      analysis: {
        quality: 'engaging' as const,
        sentiment: 'positive' as const,
        intent: 'statement' as const,
        requiresResponse: true,
        urgency: 'medium' as const,
        drynessScore: 0.5
      },
      status: {
        delivered: true,
        read: true,
        readAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        edited: false
      }
    },
    {
      conversationId: smithWoslyConversation.id,
      senderId: 'smith_id',
      content: { text: "Ooh tell me more! I'm all ears 👂", type: 'text' as const },
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      analysis: {
        quality: 'playful' as const,
        sentiment: 'positive' as const,
        intent: 'question' as const,
        requiresResponse: true,
        urgency: 'medium' as const,
        drynessScore: 0.3
      },
      status: {
        delivered: true,
        read: true,
        readAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        edited: false
      }
    },
    {
      conversationId: smithWoslyConversation.id,
      senderId: 'wosly_id',
      content: { text: "What if we add some nature sounds to the intro? Like birds chirping and water flowing 🌊", type: 'text' as const },
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      analysis: {
        quality: 'engaging' as const,
        sentiment: 'positive' as const,
        intent: 'statement' as const,
        requiresResponse: true,
        urgency: 'medium' as const,
        drynessScore: 0.7
      },
      status: {
        delivered: true,
        read: false,
        edited: false
      }
    }
  ];

  for (const message of smithWoslyMessages) {
    await mockDatabase.addMessage(message);
  }

  console.log('✅ Mock conversations added successfully!');
  console.log('📊 Added:');
  console.log('   - Laura & Faiz conversation (3 messages)');
  console.log('   - Smith & Wosly conversation (3 messages)');
  console.log('   - 4 users with detailed profiles');
  
  return {
    users: [laura, faiz, smith, wosly],
    conversations: [lauraFaizConversation, smithWoslyConversation],
    messages: [...lauraFaizMessages, ...smithWoslyMessages]
  };
}

// Export for use in browser console or app
export default addMockConversations;
