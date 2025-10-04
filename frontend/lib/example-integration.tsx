// Example integration of the new database structure with React components
// This shows how to use the new database system in practice

import React, { useState, useEffect } from 'react';
import { database } from './database-service';
import { getAutofillSuggestions } from './autofill-service';
import { Conversation, User, Message, AutofillSuggestion } from './database-types';

// Example component that demonstrates the new database integration
export function EnhancedChatComponent({ conversationId }: { conversationId: string }) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<AutofillSuggestion[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversationData();
  }, [conversationId]);

  const loadConversationData = async () => {
    try {
      setLoading(true);
      
      // Load conversation
      const conv = await database.getConversation(conversationId);
      if (!conv) return;
      
      setConversation(conv);
      
      // Load other user
      const otherUserId = conv.participants.find(id => id !== 'current_user');
      if (otherUserId) {
        const user = await database.getUser(otherUserId);
        setOtherUser(user);
      }
      
      // Load messages
      const msgs = await database.getMessages({ conversationId });
      setMessages(msgs);
      
      // Load autofill suggestions
      const suggs = await getAutofillSuggestions(conversationId);
      setSuggestions(suggs);
      
    } catch (error) {
      console.error('Error loading conversation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!draft.trim() || !conversation) return;

    try {
      // Analyze message (this would typically use AI)
      const drynessScore = analyzeDryness(draft);
      const quality = determineQuality(draft, drynessScore);
      
      const newMessage = await database.addMessage({
        conversationId,
        senderId: 'current_user',
        content: {
          text: draft,
          type: 'text'
        },
        analysis: {
          quality,
          sentiment: 'positive', // Simplified
          intent: 'statement',
          requiresResponse: false,
          urgency: 'low',
          drynessScore
        },
        status: {
          delivered: false,
          read: false,
          edited: false
        }
      });

      // Update local state
      setMessages(prev => [...prev, newMessage]);
      setDraft('');
      
      // Refresh suggestions
      const newSuggestions = await getAutofillSuggestions(conversationId);
      setSuggestions(newSuggestions);
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectSuggestion = (suggestion: AutofillSuggestion) => {
    setDraft(suggestion.text);
    // Optionally remove this suggestion from the list
    setSuggestions(prev => prev.filter(s => s.text !== suggestion.text));
  };

  if (loading) {
    return <div className="p-4">Loading conversation...</div>;
  }

  if (!conversation || !otherUser) {
    return <div className="p-4">Conversation not found</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              {otherUser.profile.avatar}
            </div>
            <div>
              <h2 className="font-semibold">{otherUser.profile.name}</h2>
              <p className="text-sm text-gray-500">
                {otherUser.analytics.lastActiveAt ? 
                  `Last seen ${formatLastSeen(otherUser.analytics.lastActiveAt)}` :
                  'Offline'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              conversation.metrics.conversationHealth === 'healthy' ? 'bg-green-100 text-green-800' :
              conversation.metrics.conversationHealth === 'at_risk' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {conversation.metrics.ghostScore}% ghost risk
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === 'current_user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.senderId === 'current_user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <p>{message.content.text}</p>
              <div className={`text-xs mt-1 ${
                message.senderId === 'current_user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTimestamp(message.timestamp)}
                {message.analysis.quality === 'dry' && (
                  <span className="ml-2 text-orange-400">⚠️ Dry</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Suggested replies:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm hover:bg-gray-50 transition-colors"
              >
                {suggestion.text}
                <span className="ml-2 text-xs text-gray-400">
                  {Math.round(suggestion.confidence * 100)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${otherUser.profile.name}...`}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!draft.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function analyzeDryness(text: string): number {
  // Simple dryness analysis - in production this would use AI
  const dryWords = ['k', 'ok', 'sure', 'yeah', 'fine', 'whatever'];
  const words = text.toLowerCase().split(' ');
  const dryCount = words.filter(word => dryWords.includes(word)).length;
  return Math.min(dryCount / words.length, 1);
}

function determineQuality(text: string, drynessScore: number): 'dry' | 'neutral' | 'playful' | 'engaging' {
  if (drynessScore > 0.7) return 'dry';
  if (drynessScore > 0.4) return 'neutral';
  if (text.includes('!') || text.includes('?')) return 'playful';
  return 'engaging';
}

function formatLastSeen(lastActiveAt: string): string {
  const now = new Date();
  const lastActive = new Date(lastActiveAt);
  const diffMs = now.getTime() - lastActive.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return lastActive.toLocaleDateString();
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export default EnhancedChatComponent;
