-- Sample data for HTV Chat Application
-- This script populates the database with test data

-- Insert sample users
INSERT INTO users (id, profile, preferences, analytics, relationship) VALUES 
(
  'user_jamie',
  '{
    "name": "Jamie Chen",
    "alias": "jamie_chen",
    "avatar": "JC",
    "bio": "Software engineer, loves hiking and coffee",
    "timezone": "PST",
    "language": "en"
  }',
  '{
    "responseTime": "within_day",
    "communicationStyle": "casual",
    "preferredTopics": ["technology", "hiking", "coffee"],
    "avoidTopics": ["politics"],
    "ghostingTolerance": 85
  }',
  '{
    "averageResponseTime": 24,
    "responseRate": 0.12,
    "messageFrequency": "low",
    "engagementScore": 25,
    "lastActiveAt": "2024-01-15T16:20:00Z"
  }',
  '{
    "closeness": "friend",
    "metIn": "work",
    "sharedInterests": ["technology", "hiking"],
    "mutualConnections": ["user_alex"]
  }'
),
(
  'user_alex',
  '{
    "name": "Alex Rodriguez",
    "alias": "alex_r",
    "avatar": "AR",
    "bio": "Marketing manager, foodie and travel enthusiast",
    "timezone": "EST",
    "language": "en"
  }',
  '{
    "responseTime": "immediate",
    "communicationStyle": "playful",
    "preferredTopics": ["food", "travel", "movies"],
    "avoidTopics": [],
    "ghostingTolerance": 20
  }',
  '{
    "averageResponseTime": 2,
    "responseRate": 0.78,
    "messageFrequency": "high",
    "engagementScore": 85,
    "lastActiveAt": "2024-01-20T15:30:00Z"
  }',
  '{
    "closeness": "close_friend",
    "metIn": "school",
    "sharedInterests": ["food", "travel", "movies"],
    "mutualConnections": ["user_jamie"]
  }'
),
(
  'user_sam',
  '{
    "name": "Sam Kim",
    "alias": "sam_k",
    "avatar": "SK",
    "bio": "Designer and artist, always busy with projects",
    "timezone": "PST",
    "language": "en"
  }',
  '{
    "responseTime": "within_day",
    "communicationStyle": "casual",
    "preferredTopics": ["art", "design", "music"],
    "avoidTopics": ["work_pressure"],
    "ghostingTolerance": 70
  }',
  '{
    "averageResponseTime": 18,
    "responseRate": 0.34,
    "messageFrequency": "medium",
    "engagementScore": 45,
    "lastActiveAt": "2024-01-10T18:45:00Z"
  }',
  '{
    "closeness": "friend",
    "metIn": "social",
    "sharedInterests": ["art", "design"],
    "mutualConnections": []
  }'
),
(
  'user_taylor',
  '{
    "name": "Taylor Swift",
    "alias": "taylor_s",
    "avatar": "TS",
    "bio": "Music producer and concert enthusiast",
    "timezone": "EST",
    "language": "en"
  }',
  '{
    "responseTime": "immediate",
    "communicationStyle": "playful",
    "preferredTopics": ["music", "concerts", "entertainment"],
    "avoidTopics": [],
    "ghostingTolerance": 15
  }',
  '{
    "averageResponseTime": 0.5,
    "responseRate": 0.89,
    "messageFrequency": "high",
    "engagementScore": 90,
    "lastActiveAt": "2024-01-20T16:02:00Z"
  }',
  '{
    "closeness": "close_friend",
    "metIn": "online",
    "sharedInterests": ["music", "concerts"],
    "mutualConnections": []
  }'
),
(
  'user_morgan',
  '{
    "name": "Morgan Lee",
    "alias": "morgan_l",
    "avatar": "ML",
    "bio": "Writer and introvert, prefers deep conversations",
    "timezone": "PST",
    "language": "en"
  }',
  '{
    "responseTime": "within_day",
    "communicationStyle": "formal",
    "preferredTopics": ["books", "philosophy", "writing"],
    "avoidTopics": ["small_talk"],
    "ghostingTolerance": 75
  }',
  '{
    "averageResponseTime": 36,
    "responseRate": 0.22,
    "messageFrequency": "low",
    "engagementScore": 30,
    "lastActiveAt": "2024-01-05T14:20:00Z"
  }',
  '{
    "closeness": "acquaintance",
    "metIn": "work",
    "sharedInterests": ["writing", "books"],
    "mutualConnections": []
  }'
),
(
  'user_riley',
  '{
    "name": "Riley Johnson",
    "alias": "riley_j",
    "avatar": "RJ",
    "bio": "Outdoor enthusiast and fitness coach",
    "timezone": "MST",
    "language": "en"
  }',
  '{
    "responseTime": "within_hour",
    "communicationStyle": "casual",
    "preferredTopics": ["fitness", "outdoors", "health"],
    "avoidTopics": [],
    "ghostingTolerance": 35
  }',
  '{
    "averageResponseTime": 4,
    "responseRate": 0.65,
    "messageFrequency": "medium",
    "engagementScore": 70,
    "lastActiveAt": "2024-01-19T16:15:00Z"
  }',
  '{
    "closeness": "friend",
    "metIn": "social",
    "sharedInterests": ["fitness", "outdoors"],
    "mutualConnections": []
  }'
);

-- Insert sample conversations
INSERT INTO conversations (id, participants, metadata, context, metrics, settings) VALUES 
(
  'conv_jamie',
  ARRAY['current_user', 'user_jamie'],
  '{
    "title": "Jamie Chen",
    "type": "direct",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T16:20:00Z",
    "lastMessageAt": "2024-01-15T16:20:00Z"
  }',
  '{
    "currentTopic": "weekend plans",
    "mood": "neutral",
    "urgency": "low",
    "requiresResponse": false,
    "suggestedActions": ["follow_up", "change_topic", "schedule_meeting"]
  }',
  '{
    "ghostScore": 92,
    "responseRate": 0.12,
    "averageDryness": 0.85,
    "daysSinceLastReply": 63,
    "messageCount": 6,
    "conversationHealth": "critical"
  }',
  '{
    "notifications": true,
    "autoReply": false,
    "priority": "high",
    "tags": ["work", "risky", "needs_attention"]
  }'
),
(
  'conv_alex',
  ARRAY['current_user', 'user_alex'],
  '{
    "title": "Alex Rodriguez",
    "type": "direct",
    "status": "active",
    "createdAt": "2024-01-20T09:00:00Z",
    "updatedAt": "2024-01-20T15:30:00Z",
    "lastMessageAt": "2024-01-20T15:30:00Z"
  }',
  '{
    "currentTopic": "weekend plans",
    "mood": "positive",
    "urgency": "medium",
    "requiresResponse": true,
    "suggestedActions": ["confirm_time", "suggest_location"]
  }',
  '{
    "ghostScore": 23,
    "responseRate": 0.78,
    "averageDryness": 0.25,
    "daysSinceLastReply": 0,
    "messageCount": 4,
    "conversationHealth": "healthy"
  }',
  '{
    "notifications": true,
    "autoReply": false,
    "priority": "normal",
    "tags": ["friend", "active", "weekend_plans"]
  }'
),
(
  'conv_sam',
  ARRAY['current_user', 'user_sam'],
  '{
    "title": "Sam Kim",
    "type": "direct",
    "status": "active",
    "createdAt": "2024-01-10T15:00:00Z",
    "updatedAt": "2024-01-10T18:45:00Z",
    "lastMessageAt": "2024-01-10T18:45:00Z"
  }',
  '{
    "currentTopic": "work life balance",
    "mood": "neutral",
    "urgency": "low",
    "requiresResponse": false,
    "suggestedActions": ["check_in", "offer_support"]
  }',
  '{
    "ghostScore": 67,
    "responseRate": 0.34,
    "averageDryness": 0.62,
    "daysSinceLastReply": 12,
    "messageCount": 4,
    "conversationHealth": "at_risk"
  }',
  '{
    "notifications": true,
    "autoReply": false,
    "priority": "normal",
    "tags": ["friend", "design", "busy"]
  }'
),
(
  'conv_taylor',
  ARRAY['current_user', 'user_taylor'],
  '{
    "title": "Taylor Swift",
    "type": "direct",
    "status": "active",
    "createdAt": "2024-01-20T14:00:00Z",
    "updatedAt": "2024-01-20T16:02:00Z",
    "lastMessageAt": "2024-01-20T16:02:00Z"
  }',
  '{
    "currentTopic": "concert tickets",
    "mood": "positive",
    "urgency": "low",
    "requiresResponse": false,
    "suggestedActions": ["plan_details", "share_excitement"]
  }',
  '{
    "ghostScore": 15,
    "responseRate": 0.89,
    "averageDryness": 0.18,
    "daysSinceLastReply": 0,
    "messageCount": 2,
    "conversationHealth": "healthy"
  }',
  '{
    "notifications": true,
    "autoReply": false,
    "priority": "normal",
    "tags": ["friend", "music", "excited"]
  }'
),
(
  'conv_morgan',
  ARRAY['current_user', 'user_morgan'],
  '{
    "title": "Morgan Lee",
    "type": "direct",
    "status": "paused",
    "createdAt": "2024-01-05T10:00:00Z",
    "updatedAt": "2024-01-05T14:20:00Z",
    "lastMessageAt": "2024-01-05T14:20:00Z"
  }',
  '{
    "currentTopic": "deep conversation",
    "mood": "neutral",
    "urgency": "low",
    "requiresResponse": false,
    "suggestedActions": ["reconnect", "change_approach"]
  }',
  '{
    "ghostScore": 78,
    "responseRate": 0.22,
    "averageDryness": 0.74,
    "daysSinceLastReply": 18,
    "messageCount": 4,
    "conversationHealth": "at_risk"
  }',
  '{
    "notifications": false,
    "autoReply": false,
    "priority": "low",
    "tags": ["acquaintance", "formal", "quiet"]
  }'
),
(
  'conv_riley',
  ARRAY['current_user', 'user_riley'],
  '{
    "title": "Riley Johnson",
    "type": "direct",
    "status": "active",
    "createdAt": "2024-01-19T16:00:00Z",
    "updatedAt": "2024-01-19T16:15:00Z",
    "lastMessageAt": "2024-01-19T16:15:00Z"
  }',
  '{
    "currentTopic": "hiking plans",
    "mood": "positive",
    "urgency": "medium",
    "requiresResponse": true,
    "suggestedActions": ["confirm_details", "prepare_gear"]
  }',
  '{
    "ghostScore": 31,
    "responseRate": 0.65,
    "averageDryness": 0.35,
    "daysSinceLastReply": 1,
    "messageCount": 2,
    "conversationHealth": "healthy"
  }',
  '{
    "notifications": true,
    "autoReply": false,
    "priority": "normal",
    "tags": ["friend", "outdoors", "active"]
  }'
);

-- Insert sample messages
INSERT INTO messages (id, conversation_id, sender_id, content, timestamp, analysis, status) VALUES 
-- Jamie conversation messages
(
  'msg_jamie_1',
  'conv_jamie',
  'current_user',
  '{
    "text": "Hey Jamie! How was your weekend?",
    "type": "text"
  }',
  '2024-01-15T10:30:00Z',
  '{
    "quality": "playful",
    "sentiment": "positive",
    "intent": "question",
    "requiresResponse": true,
    "urgency": "low",
    "drynessScore": 0.1
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-15T11:00:00Z",
    "edited": false
  }'
),
(
  'msg_jamie_2',
  'conv_jamie',
  'user_jamie',
  '{
    "text": "good",
    "type": "text"
  }',
  '2024-01-15T11:45:00Z',
  '{
    "quality": "dry",
    "sentiment": "neutral",
    "intent": "response",
    "requiresResponse": true,
    "urgency": "low",
    "drynessScore": 0.9
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-15T12:00:00Z",
    "edited": false
  }'
),
(
  'msg_jamie_3',
  'conv_jamie',
  'current_user',
  '{
    "text": "That sounds nice! Did you do anything fun?",
    "type": "text"
  }',
  '2024-01-15T12:00:00Z',
  '{
    "quality": "neutral",
    "sentiment": "positive",
    "intent": "question",
    "requiresResponse": true,
    "urgency": "low",
    "drynessScore": 0.2
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-15T12:15:00Z",
    "edited": false
  }'
),
(
  'msg_jamie_4',
  'conv_jamie',
  'user_jamie',
  '{
    "text": "not really",
    "type": "text"
  }',
  '2024-01-15T12:15:00Z',
  '{
    "quality": "dry",
    "sentiment": "neutral",
    "intent": "response",
    "requiresResponse": true,
    "urgency": "low",
    "drynessScore": 0.8
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-15T12:30:00Z",
    "edited": false
  }'
),
(
  'msg_jamie_5',
  'conv_jamie',
  'current_user',
  '{
    "text": "Want to grab coffee this week? I know a great place downtown",
    "type": "text"
  }',
  '2024-01-15T14:30:00Z',
  '{
    "quality": "playful",
    "sentiment": "positive",
    "intent": "question",
    "requiresResponse": true,
    "urgency": "medium",
    "drynessScore": 0.1
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-15T15:00:00Z",
    "edited": false
  }'
),
(
  'msg_jamie_6',
  'conv_jamie',
  'user_jamie',
  '{
    "text": "k",
    "type": "text"
  }',
  '2024-01-15T16:20:00Z',
  '{
    "quality": "dry",
    "sentiment": "neutral",
    "intent": "response",
    "requiresResponse": false,
    "urgency": "low",
    "drynessScore": 1.0
  }',
  '{
    "delivered": true,
    "read": false,
    "edited": false
  }'
),

-- Alex conversation messages
(
  'msg_alex_1',
  'conv_alex',
  'current_user',
  '{
    "text": "Hey Alex! Want to catch up this weekend?",
    "type": "text"
  }',
  '2024-01-20T09:00:00Z',
  '{
    "quality": "playful",
    "sentiment": "positive",
    "intent": "question",
    "requiresResponse": true,
    "urgency": "medium",
    "drynessScore": 0.2
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-20T09:10:00Z",
    "edited": false
  }'
),
(
  'msg_alex_2',
  'conv_alex',
  'user_alex',
  '{
    "text": "Absolutely! I\'d love to catch up. What did you have in mind?",
    "type": "text"
  }',
  '2024-01-20T09:15:00Z',
  '{
    "quality": "engaging",
    "sentiment": "positive",
    "intent": "response",
    "requiresResponse": true,
    "urgency": "medium",
    "drynessScore": 0.1
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-20T09:20:00Z",
    "edited": false
  }'
),
(
  'msg_alex_3',
  'conv_alex',
  'current_user',
  '{
    "text": "Maybe that new ramen place downtown? Or we could do something outdoors if the weather is nice",
    "type": "text"
  }',
  '2024-01-20T09:30:00Z',
  '{
    "quality": "neutral",
    "sentiment": "positive",
    "intent": "statement",
    "requiresResponse": true,
    "urgency": "medium",
    "drynessScore": 0.3
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-20T09:45:00Z",
    "edited": false
  }'
),
(
  'msg_alex_4',
  'conv_alex',
  'user_alex',
  '{
    "text": "Sounds great! What time works for you?",
    "type": "text"
  }',
  '2024-01-20T15:30:00Z',
  '{
    "quality": "playful",
    "sentiment": "positive",
    "intent": "question",
    "requiresResponse": true,
    "urgency": "medium",
    "drynessScore": 0.2
  }',
  '{
    "delivered": true,
    "read": false,
    "edited": false
  }'
),

-- Sam conversation messages
(
  'msg_sam_1',
  'conv_sam',
  'current_user',
  '{
    "text": "Hey Sam! Long time no see. How have you been?",
    "type": "text"
  }',
  '2024-01-10T15:00:00Z',
  '{
    "quality": "neutral",
    "sentiment": "positive",
    "intent": "question",
    "requiresResponse": true,
    "urgency": "low",
    "drynessScore": 0.2
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-10T15:30:00Z",
    "edited": false
  }'
),
(
  'msg_sam_2',
  'conv_sam',
  'user_sam',
  '{
    "text": "hey, busy with work",
    "type": "text"
  }',
  '2024-01-10T16:30:00Z',
  '{
    "quality": "dry",
    "sentiment": "neutral",
    "intent": "response",
    "requiresResponse": true,
    "urgency": "low",
    "drynessScore": 0.7
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-10T17:00:00Z",
    "edited": false
  }'
),
(
  'msg_sam_3',
  'conv_sam',
  'current_user',
  '{
    "text": "I totally get that! Want to grab lunch sometime this week?",
    "type": "text"
  }',
  '2024-01-10T17:00:00Z',
  '{
    "quality": "playful",
    "sentiment": "positive",
    "intent": "question",
    "requiresResponse": true,
    "urgency": "medium",
    "drynessScore": 0.1
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-10T17:30:00Z",
    "edited": false
  }'
),
(
  'msg_sam_4',
  'conv_sam',
  'user_sam',
  '{
    "text": "maybe",
    "type": "text"
  }',
  '2024-01-10T18:45:00Z',
  '{
    "quality": "dry",
    "sentiment": "neutral",
    "intent": "response",
    "requiresResponse": false,
    "urgency": "low",
    "drynessScore": 0.9
  }',
  '{
    "delivered": true,
    "read": false,
    "edited": false
  }'
),

-- Taylor conversation messages
(
  'msg_taylor_1',
  'conv_taylor',
  'current_user',
  '{
    "text": "Taylor! I got tickets to that concert you wanted to see!",
    "type": "text"
  }',
  '2024-01-20T14:00:00Z',
  '{
    "quality": "playful",
    "sentiment": "positive",
    "intent": "statement",
    "requiresResponse": true,
    "urgency": "low",
    "drynessScore": 0.1
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-20T14:01:00Z",
    "edited": false
  }'
),
(
  'msg_taylor_2',
  'conv_taylor',
  'user_taylor',
  '{
    "text": "That sounds amazing! I\'m so excited! 🎉",
    "type": "text"
  }',
  '2024-01-20T16:02:00Z',
  '{
    "quality": "engaging",
    "sentiment": "positive",
    "intent": "response",
    "requiresResponse": false,
    "urgency": "low",
    "drynessScore": 0.0
  }',
  '{
    "delivered": true,
    "read": false,
    "edited": false
  }'
),

-- Morgan conversation messages
(
  'msg_morgan_1',
  'conv_morgan',
  'current_user',
  '{
    "text": "Hey Morgan! I was thinking about our conversation from last week",
    "type": "text"
  }',
  '2024-01-05T10:00:00Z',
  '{
    "quality": "neutral",
    "sentiment": "positive",
    "intent": "statement",
    "requiresResponse": true,
    "urgency": "low",
    "drynessScore": 0.3
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-05T10:30:00Z",
    "edited": false
  }'
),
(
  'msg_morgan_2',
  'conv_morgan',
  'user_morgan',
  '{
    "text": "yeah",
    "type": "text"
  }',
  '2024-01-05T11:30:00Z',
  '{
    "quality": "dry",
    "sentiment": "neutral",
    "intent": "response",
    "requiresResponse": true,
    "urgency": "low",
    "drynessScore": 0.8
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-05T12:00:00Z",
    "edited": false
  }'
),
(
  'msg_morgan_3',
  'conv_morgan',
  'current_user',
  '{
    "text": "Would you like to talk about it more? I\'m here if you want to chat",
    "type": "text"
  }',
  '2024-01-05T12:00:00Z',
  '{
    "quality": "playful",
    "sentiment": "positive",
    "intent": "question",
    "requiresResponse": true,
    "urgency": "low",
    "drynessScore": 0.1
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-05T12:30:00Z",
    "edited": false
  }'
),
(
  'msg_morgan_4',
  'conv_morgan',
  'user_morgan',
  '{
    "text": "ok",
    "type": "text"
  }',
  '2024-01-05T14:20:00Z',
  '{
    "quality": "dry",
    "sentiment": "neutral",
    "intent": "response",
    "requiresResponse": false,
    "urgency": "low",
    "drynessScore": 0.9
  }',
  '{
    "delivered": true,
    "read": false,
    "edited": false
  }'
),

-- Riley conversation messages
(
  'msg_riley_1',
  'conv_riley',
  'current_user',
  '{
    "text": "Hey Riley! Want to try that new hiking trail this weekend?",
    "type": "text"
  }',
  '2024-01-19T16:00:00Z',
  '{
    "quality": "playful",
    "sentiment": "positive",
    "intent": "question",
    "requiresResponse": true,
    "urgency": "medium",
    "drynessScore": 0.1
  }',
  '{
    "delivered": true,
    "read": true,
    "readAt": "2024-01-19T16:10:00Z",
    "edited": false
  }'
),
(
  'msg_riley_2',
  'conv_riley',
  'user_riley',
  '{
    "text": "Sure, let\'s do it!",
    "type": "text"
  }',
  '2024-01-19T16:15:00Z',
  '{
    "quality": "neutral",
    "sentiment": "positive",
    "intent": "response",
    "requiresResponse": true,
    "urgency": "medium",
    "drynessScore": 0.3
  }',
  '{
    "delivered": true,
    "read": false,
    "edited": false
  }'
);

-- Note: Conversation health and metrics will need to be updated manually
-- or through application logic since triggers/functions are not included in this simplified schema
