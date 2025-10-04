export interface Conversation {
  id: string;
  name: string;
  alias: string;
  avatar: string;
  ghostScore: number;
  lastMessage: string;
  lastSeen: string;
  isActive: boolean;
  isRisky: boolean;
  messages: Message[];
  metrics: {
    daysSinceReply: number;
    responseRate: number;
    averageDryness: number;
    ghostScoreTrend: number;
  };
}

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  quality: 'dry' | 'neutral' | 'playful';
}

export function useDemoData(): { conversations: Conversation[], currentConversation: Conversation | null } {
  const conversations: Conversation[] = [
    {
      id: 'jamie',
      name: 'Jamie Chen',
      alias: 'jamie_chen',
      avatar: 'JC',
      ghostScore: 92,
      lastMessage: 'k',
      lastSeen: '2 hours ago',
      isActive: false,
      isRisky: true,
      metrics: {
        daysSinceReply: 63,
        responseRate: 0.12,
        averageDryness: 0.85,
        ghostScoreTrend: 8.5
      },
      messages: [
        {
          id: '1',
          text: 'Hey Jamie! How was your weekend?',
          sender: 'me',
          timestamp: '2024-01-15T10:30:00Z',
          quality: 'playful'
        },
        {
          id: '2',
          text: 'good',
          sender: 'them',
          timestamp: '2024-01-15T11:45:00Z',
          quality: 'dry'
        },
        {
          id: '3',
          text: 'That sounds nice! Did you do anything fun?',
          sender: 'me',
          timestamp: '2024-01-15T12:00:00Z',
          quality: 'neutral'
        },
        {
          id: '4',
          text: 'not really',
          sender: 'them',
          timestamp: '2024-01-15T12:15:00Z',
          quality: 'dry'
        },
        {
          id: '5',
          text: 'Want to grab coffee this week? I know a great place downtown',
          sender: 'me',
          timestamp: '2024-01-15T14:30:00Z',
          quality: 'playful'
        },
        {
          id: '6',
          text: 'k',
          sender: 'them',
          timestamp: '2024-01-15T16:20:00Z',
          quality: 'dry'
        }
      ]
    },
    {
      id: 'alex',
      name: 'Alex Rodriguez',
      alias: 'alex_r',
      avatar: 'AR',
      ghostScore: 23,
      lastMessage: 'Sounds great! What time works for you?',
      lastSeen: '5 minutes ago',
      isActive: true,
      isRisky: false,
      metrics: {
        daysSinceReply: 0,
        responseRate: 0.78,
        averageDryness: 0.25,
        ghostScoreTrend: -2.1
      },
      messages: [
        {
          id: '1',
          text: 'Hey Alex! Want to catch up this weekend?',
          sender: 'me',
          timestamp: '2024-01-20T09:00:00Z',
          quality: 'playful'
        },
        {
          id: '2',
          text: 'Absolutely! I\'d love to catch up. What did you have in mind?',
          sender: 'them',
          timestamp: '2024-01-20T09:15:00Z',
          quality: 'playful'
        },
        {
          id: '3',
          text: 'Maybe that new ramen place downtown? Or we could do something outdoors if the weather is nice',
          sender: 'me',
          timestamp: '2024-01-20T09:30:00Z',
          quality: 'neutral'
        },
        {
          id: '4',
          text: 'Sounds great! What time works for you?',
          sender: 'them',
          timestamp: '2024-01-20T09:45:00Z',
          quality: 'playful'
        }
      ]
    },
    {
      id: 'sam',
      name: 'Sam Kim',
      alias: 'sam_k',
      avatar: 'SK',
      ghostScore: 67,
      lastMessage: 'maybe',
      lastSeen: '1 day ago',
      isActive: false,
      isRisky: true,
      metrics: {
        daysSinceReply: 12,
        responseRate: 0.34,
        averageDryness: 0.62,
        ghostScoreTrend: 4.2
      },
      messages: [
        {
          id: '1',
          text: 'Hey Sam! Long time no see. How have you been?',
          sender: 'me',
          timestamp: '2024-01-10T15:00:00Z',
          quality: 'neutral'
        },
        {
          id: '2',
          text: 'hey, busy with work',
          sender: 'them',
          timestamp: '2024-01-10T16:30:00Z',
          quality: 'dry'
        },
        {
          id: '3',
          text: 'I totally get that! Want to grab lunch sometime this week?',
          sender: 'me',
          timestamp: '2024-01-10T17:00:00Z',
          quality: 'playful'
        },
        {
          id: '4',
          text: 'maybe',
          sender: 'them',
          timestamp: '2024-01-10T18:45:00Z',
          quality: 'dry'
        }
      ]
    },
    {
      id: 'taylor',
      name: 'Taylor Swift',
      alias: 'taylor_s',
      avatar: 'TS',
      ghostScore: 15,
      lastMessage: 'That sounds amazing! I\'m so excited! 🎉',
      lastSeen: '30 seconds ago',
      isActive: true,
      isRisky: false,
      metrics: {
        daysSinceReply: 0,
        responseRate: 0.89,
        averageDryness: 0.18,
        ghostScoreTrend: -1.5
      },
      messages: [
        {
          id: '1',
          text: 'Taylor! I got tickets to that concert you wanted to see!',
          sender: 'me',
          timestamp: '2024-01-20T14:00:00Z',
          quality: 'playful'
        },
        {
          id: '2',
          text: 'That sounds amazing! I\'m so excited! 🎉',
          sender: 'them',
          timestamp: '2024-01-20T14:02:00Z',
          quality: 'playful'
        }
      ]
    },
    {
      id: 'morgan',
      name: 'Morgan Lee',
      alias: 'morgan_l',
      avatar: 'ML',
      ghostScore: 78,
      lastMessage: 'ok',
      lastSeen: '3 days ago',
      isActive: false,
      isRisky: true,
      metrics: {
        daysSinceReply: 18,
        responseRate: 0.22,
        averageDryness: 0.74,
        ghostScoreTrend: 6.8
      },
      messages: [
        {
          id: '1',
          text: 'Hey Morgan! I was thinking about our conversation from last week',
          sender: 'me',
          timestamp: '2024-01-05T10:00:00Z',
          quality: 'neutral'
        },
        {
          id: '2',
          text: 'yeah',
          sender: 'them',
          timestamp: '2024-01-05T11:30:00Z',
          quality: 'dry'
        },
        {
          id: '3',
          text: 'Would you like to talk about it more? I\'m here if you want to chat',
          sender: 'me',
          timestamp: '2024-01-05T12:00:00Z',
          quality: 'playful'
        },
        {
          id: '4',
          text: 'ok',
          sender: 'them',
          timestamp: '2024-01-05T14:20:00Z',
          quality: 'dry'
        }
      ]
    },
    {
      id: 'riley',
      name: 'Riley Johnson',
      alias: 'riley_j',
      avatar: 'RJ',
      ghostScore: 31,
      lastMessage: 'Sure, let\'s do it!',
      lastSeen: '2 hours ago',
      isActive: true,
      isRisky: false,
      metrics: {
        daysSinceReply: 1,
        responseRate: 0.65,
        averageDryness: 0.35,
        ghostScoreTrend: -0.8
      },
      messages: [
        {
          id: '1',
          text: 'Hey Riley! Want to try that new hiking trail this weekend?',
          sender: 'me',
          timestamp: '2024-01-19T16:00:00Z',
          quality: 'playful'
        },
        {
          id: '2',
          text: 'Sure, let\'s do it!',
          sender: 'them',
          timestamp: '2024-01-19T16:15:00Z',
          quality: 'neutral'
        }
      ]
    }
  ];

  return {
    conversations,
    currentConversation: conversations.find(c => c.id === 'jamie') || conversations[0]
  };
}
