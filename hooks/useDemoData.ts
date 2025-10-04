import { useMemo } from 'react'

export interface Message {
  id: string
  text: string
  sender: 'me' | 'them'
  timestamp: Date
  quality: 'Dry' | 'Okay' | 'Playful'
}

export interface Conversation {
  id: string
  name: string
  avatar: string
  ghostScore: number
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  messages: Message[]
  metrics: {
    daysSinceReply: number
    responseRate: number
    averageDryness: number
    ghostScoreTrend: number[]
  }
}

export function useDemoData(): Conversation[] {
  return useMemo(() => [
    {
      id: 'jamie',
      name: 'Jamie',
      avatar: 'J',
      ghostScore: 92,
      lastMessage: 'k',
      lastMessageTime: new Date(Date.now() - 63 * 24 * 60 * 60 * 1000),
      unreadCount: 0,
      messages: [
        {
          id: '1',
          text: 'Hey! How was your weekend?',
          sender: 'them',
          timestamp: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '2',
          text: 'Good, thanks! Went hiking',
          sender: 'me',
          timestamp: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
          quality: 'Okay'
        },
        {
          id: '3',
          text: 'That sounds amazing! Where did you go?',
          sender: 'them',
          timestamp: new Date(Date.now() - 69 * 24 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '4',
          text: 'Blue Ridge Mountains',
          sender: 'me',
          timestamp: new Date(Date.now() - 69 * 24 * 60 * 60 * 1000),
          quality: 'Dry'
        },
        {
          id: '5',
          text: 'I love that area! Did you see any wildlife?',
          sender: 'them',
          timestamp: new Date(Date.now() - 68 * 24 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '6',
          text: 'k',
          sender: 'me',
          timestamp: new Date(Date.now() - 63 * 24 * 60 * 60 * 1000),
          quality: 'Dry'
        }
      ],
      metrics: {
        daysSinceReply: 63,
        responseRate: 0.2,
        averageDryness: 0.8,
        ghostScoreTrend: [45, 52, 68, 75, 82, 88, 92]
      }
    },
    {
      id: 'alex',
      name: 'Alex Chen',
      avatar: 'AC',
      ghostScore: 34,
      lastMessage: 'Sounds good!',
      lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      unreadCount: 1,
      messages: [
        {
          id: '1',
          text: 'Want to grab coffee this week?',
          sender: 'them',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '2',
          text: 'Sure! How about Thursday at 2pm?',
          sender: 'me',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '3',
          text: 'Perfect! See you at Blue Bottle',
          sender: 'them',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '4',
          text: 'Sounds good!',
          sender: 'me',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          quality: 'Okay'
        }
      ],
      metrics: {
        daysSinceReply: 2,
        responseRate: 0.8,
        averageDryness: 0.3,
        ghostScoreTrend: [28, 30, 32, 34, 33, 34, 34]
      }
    },
    {
      id: 'laura',
      name: 'Laura D\'Souza',
      avatar: 'LD',
      ghostScore: 25,
      lastMessage: 'show em whose the boss',
      lastMessageTime: new Date(Date.now() - 0.4 * 60 * 60 * 1000),
      unreadCount: 0,
      messages: [
        {
          id: '1',
          text: 'Not as cool as e7',
          sender: 'them',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '2',
          text: 'This video can only be replayed once. Use the mobile app to view.',
          sender: 'them',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          quality: 'Okay'
        },
        {
          id: '3',
          text: 'rip',
          sender: 'me',
          timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000),
          quality: 'Dry'
        },
        {
          id: '4',
          text: 'Bruh I talked for 5 min to these two girls',
          sender: 'them',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '5',
          text: 'Makes me wanna walk into a wall',
          sender: 'them',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '6',
          text: 'Why are cs kids built this way',
          sender: 'them',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '7',
          text: 'what did they say 😭',
          sender: 'me',
          timestamp: new Date(Date.now() - 1.3 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '8',
          text: 'dw tho',
          sender: 'me',
          timestamp: new Date(Date.now() - 1.3 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '9',
          text: 'i am coming to the rescue',
          sender: 'me',
          timestamp: new Date(Date.now() - 1.3 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '10',
          text: '30 min out',
          sender: 'me',
          timestamp: new Date(Date.now() - 1.3 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '11',
          text: 'No like',
          sender: 'them',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '12',
          text: 'This girls',
          sender: 'them',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '13',
          text: 'In hs',
          sender: 'them',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '14',
          text: 'And is like oh my teachers were talking marks off cuz I\'m too smart',
          sender: 'them',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '15',
          text: 'Like respectfully stfu',
          sender: 'them',
          timestamp: new Date(Date.now() - 0.8 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '16',
          text: 'No one likes u',
          sender: 'them',
          timestamp: new Date(Date.now() - 0.8 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '17',
          text: 'did u say that',
          sender: 'me',
          timestamp: new Date(Date.now() - 0.6 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '18',
          text: 'shud have said that',
          sender: 'me',
          timestamp: new Date(Date.now() - 0.6 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '19',
          text: 'show em whose the boss',
          sender: 'me',
          timestamp: new Date(Date.now() - 0.4 * 60 * 60 * 1000),
          quality: 'Playful'
        }
      ],
      metrics: {
        daysSinceReply: 0,
        responseRate: 0.8,
        averageDryness: 0.2,
        ghostScoreTrend: [25, 30, 35, 40, 45, 50, 55]
      }
    },
    {
      id: 'riley',
      name: 'Riley',
      avatar: 'R',
      ghostScore: 12,
      lastMessage: 'Can\'t wait! 🎉',
      lastMessageTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
      unreadCount: 0,
      messages: [
        {
          id: '1',
          text: 'The party is going to be epic!',
          sender: 'them',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '2',
          text: 'I know right? I\'m so excited!',
          sender: 'me',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '3',
          text: 'What are you bringing?',
          sender: 'them',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '4',
          text: 'I\'m making those cookies you love!',
          sender: 'me',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '5',
          text: 'Can\'t wait! 🎉',
          sender: 'them',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          quality: 'Playful'
        }
      ],
      metrics: {
        daysSinceReply: 0,
        responseRate: 0.9,
        averageDryness: 0.1,
        ghostScoreTrend: [8, 10, 12, 11, 12, 12, 12]
      }
    },
    {
      id: 'casey',
      name: 'Casey',
      avatar: 'C',
      ghostScore: 78,
      lastMessage: 'ok',
      lastMessageTime: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      unreadCount: 0,
      messages: [
        {
          id: '1',
          text: 'How\'s the new job going?',
          sender: 'them',
          timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '2',
          text: 'It\'s going well, thanks for asking!',
          sender: 'me',
          timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '3',
          text: 'That\'s great! Are you liking the team?',
          sender: 'them',
          timestamp: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '4',
          text: 'yeah',
          sender: 'me',
          timestamp: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000),
          quality: 'Dry'
        },
        {
          id: '5',
          text: 'Cool! Let me know if you want to grab lunch sometime',
          sender: 'them',
          timestamp: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '6',
          text: 'ok',
          sender: 'me',
          timestamp: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
          quality: 'Dry'
        }
      ],
      metrics: {
        daysSinceReply: 28,
        responseRate: 0.3,
        averageDryness: 0.7,
        ghostScoreTrend: [55, 62, 68, 72, 75, 77, 78]
      }
    },
    {
      id: 'taylor',
      name: 'Taylor',
      avatar: 'T',
      ghostScore: 23,
      lastMessage: 'See you tomorrow!',
      lastMessageTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
      unreadCount: 0,
      messages: [
        {
          id: '1',
          text: 'Are we still on for the movie?',
          sender: 'them',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '2',
          text: 'Absolutely! 7pm at the AMC?',
          sender: 'me',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '3',
          text: 'Perfect! I\'ll bring the popcorn',
          sender: 'them',
          timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
          quality: 'Playful'
        },
        {
          id: '4',
          text: 'See you tomorrow!',
          sender: 'me',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          quality: 'Playful'
        }
      ],
      metrics: {
        daysSinceReply: 0,
        responseRate: 0.85,
        averageDryness: 0.2,
        ghostScoreTrend: [18, 20, 22, 23, 22, 23, 23]
      }
    }
  ], [])
}
