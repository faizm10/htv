# HTV Database Structure & Autofill System

## Overview

The HTV chat application now uses a structured database approach that separates concerns into three main entities:

1. **Users** - Profile data, preferences, and analytics
2. **Conversations** - Chat metadata, context, and metrics  
3. **Messages** - Individual messages with analysis and suggestions

This structure enables powerful orchestration and autofill capabilities.

## Database Structure

### User Entity
```typescript
interface User {
  id: string;
  profile: {
    name: string;
    alias: string;
    avatar: string;
    bio?: string;
    timezone?: string;
    language?: string;
  };
  preferences: {
    responseTime: 'immediate' | 'within_hour' | 'within_day' | 'flexible';
    communicationStyle: 'formal' | 'casual' | 'playful' | 'professional';
    preferredTopics: string[];
    avoidTopics: string[];
    ghostingTolerance: number; // 0-100
  };
  analytics: {
    averageResponseTime: number;
    responseRate: number;
    messageFrequency: 'high' | 'medium' | 'low';
    engagementScore: number;
    lastActiveAt: string;
  };
  relationship: {
    closeness: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'family';
    metIn: 'online' | 'work' | 'school' | 'social' | 'other';
    sharedInterests: string[];
    mutualConnections: string[];
  };
}
```

### Conversation Entity
```typescript
interface Conversation {
  id: string;
  participants: string[]; // User IDs
  metadata: {
    title?: string;
    type: 'direct' | 'group';
    status: 'active' | 'paused' | 'archived';
    createdAt: string;
    updatedAt: string;
    lastMessageAt: string;
  };
  context: {
    currentTopic?: string;
    mood: 'positive' | 'neutral' | 'negative' | 'mixed';
    urgency: 'low' | 'medium' | 'high';
    requiresResponse: boolean;
    suggestedActions: string[];
  };
  metrics: {
    ghostScore: number;
    responseRate: number;
    averageDryness: number;
    daysSinceLastReply: number;
    messageCount: number;
    conversationHealth: 'healthy' | 'at_risk' | 'critical';
  };
  settings: {
    notifications: boolean;
    autoReply: boolean;
    priority: 'low' | 'normal' | 'high';
    tags: string[];
  };
}
```

### Message Entity
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: {
    text: string;
    type: 'text' | 'image' | 'link' | 'emoji' | 'voice';
    metadata?: object;
  };
  timestamp: string;
  analysis: {
    quality: 'dry' | 'neutral' | 'playful' | 'engaging';
    sentiment: 'positive' | 'neutral' | 'negative';
    intent: 'question' | 'statement' | 'request' | 'response' | 'greeting' | 'goodbye';
    requiresResponse: boolean;
    urgency: 'low' | 'medium' | 'high';
    drynessScore: number;
  };
  status: {
    delivered: boolean;
    read: boolean;
    readAt?: string;
    edited: boolean;
    editedAt?: string;
  };
  suggestions?: {
    autoReply?: string[];
    followUp?: string[];
    contextAware?: string[];
  };
}
```

## Usage Examples

### 1. Basic Database Operations

```typescript
import { database } from '@/lib/database-service';

// Get a user
const user = await database.getUser('user_jamie');

// Get conversations for a user
const conversations = await database.getConversations({ 
  userId: 'current_user',
  status: 'active'
});

// Get messages from a conversation
const messages = await database.getMessages({ 
  conversationId: 'conv_jamie' 
});

// Add a new message
const newMessage = await database.addMessage({
  conversationId: 'conv_jamie',
  senderId: 'current_user',
  content: {
    text: 'Hey! How are you doing?',
    type: 'text'
  },
  analysis: {
    quality: 'playful',
    sentiment: 'positive',
    intent: 'question',
    requiresResponse: true,
    urgency: 'low',
    drynessScore: 0.2
  },
  status: {
    delivered: false,
    read: false
  }
});
```

### 2. Autofill Suggestions

```typescript
import { autofillService, getAutofillSuggestions } from '@/lib/autofill-service';

// Get intelligent suggestions for a conversation
const suggestions = await getAutofillSuggestions('conv_jamie');

// Example output:
// [
//   {
//     text: "Hey Jamie! What's up?",
//     type: 'greeting',
//     confidence: 0.9,
//     reasoning: 'Casual greeting matching user style',
//     context: {
//       basedOnUserPreference: true,
//       basedOnRelationship: true,
//       basedOnConversationHistory: false,
//       basedOnTimeOfDay: false
//     }
//   },
//   {
//     text: "Been on any good hikes recently?",
//     type: 'question',
//     confidence: 0.8,
//     reasoning: 'Question about shared interest: hiking',
//     context: { ... }
//   }
// ]
```

### 3. Conversation Context

```typescript
import { getConversationContext } from '@/lib/demo-data-v2';

// Get full conversation context for orchestration
const context = await getConversationContext('conv_jamie');

console.log(context);
// {
//   conversation: Conversation,
//   otherUser: User,
//   recentMessages: Message[],
//   suggestions: string[]
// }
```

### 4. React Component Integration

```typescript
// In a React component
import { useDatabaseData } from '@/lib/demo-data-v2';
import { getAutofillSuggestions } from '@/lib/autofill-service';

function ChatComponent({ conversationId }: { conversationId: string }) {
  const db = useDatabaseData();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Load autofill suggestions
    getAutofillSuggestions(conversationId).then(setSuggestions);
  }, [conversationId]);

  const handleSendMessage = async (text: string) => {
    await db.addMessage({
      conversationId,
      senderId: 'current_user',
      content: { text, type: 'text' },
      analysis: {
        quality: 'neutral',
        sentiment: 'positive',
        intent: 'statement',
        requiresResponse: false,
        urgency: 'low',
        drynessScore: 0.3
      },
      status: { delivered: false, read: false }
    });
  };

  return (
    <div>
      {suggestions.map((suggestion, index) => (
        <button 
          key={index}
          onClick={() => handleSendMessage(suggestion.text)}
          className="suggestion-button"
        >
          {suggestion.text}
          <span className="confidence">
            {Math.round(suggestion.confidence * 100)}%
          </span>
        </button>
      ))}
    </div>
  );
}
```

## Key Benefits

### 1. **Orchestration**
- Conversations track context, mood, and urgency
- Messages include analysis and suggestions
- Users have detailed preferences and relationship data

### 2. **Autofill Intelligence**
- Suggestions based on user communication style
- Questions about shared interests
- Time-of-day appropriate greetings
- Follow-up responses based on conversation history

### 3. **Scalability**
- Clean separation of concerns
- Easy to extend with new features
- Database service can be swapped out
- Type-safe interfaces throughout

### 4. **Analytics**
- Rich metrics on conversation health
- User engagement tracking
- Response time analysis
- Ghosting risk assessment

## Migration from Legacy Data

The `demo-data-v2.ts` file provides backward compatibility by converting the new database structure to the legacy format used by existing components. This allows for gradual migration without breaking existing functionality.

## Future Enhancements

1. **AI Integration**: Connect with Gemini API for more sophisticated suggestions
2. **Real Database**: Replace in-memory storage with PostgreSQL/MongoDB
3. **Real-time Updates**: WebSocket integration for live conversation updates
4. **Advanced Analytics**: Machine learning models for better ghosting prediction
5. **Multi-language Support**: Internationalization based on user language preferences
