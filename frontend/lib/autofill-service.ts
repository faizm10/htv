// Autofill and orchestration service for HTV chat application
// Provides intelligent message suggestions and conversation management

import { database } from './database-service';
import { User, Conversation, Message, MessageFilter } from './database-types';

export interface AutofillContext {
  conversationId: string;
  currentUser: string;
  otherUser: string;
  lastMessages: Message[];
  conversationMood: 'positive' | 'neutral' | 'negative' | 'mixed';
  userPreferences: User['preferences'];
  relationshipContext: User['relationship'];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface AutofillSuggestion {
  text: string;
  type: 'greeting' | 'question' | 'statement' | 'follow_up' | 'topic_change';
  confidence: number; // 0-1
  reasoning: string;
  context: {
    basedOnUserPreference: boolean;
    basedOnRelationship: boolean;
    basedOnConversationHistory: boolean;
    basedOnTimeOfDay: boolean;
  };
}

export class AutofillService {
  
  async generateSuggestions(context: AutofillContext): Promise<AutofillSuggestion[]> {
    const suggestions: AutofillSuggestion[] = [];
    
    // Get user and conversation data
    const [user, conversation] = await Promise.all([
      database.getUser(context.otherUser),
      database.getConversation(context.conversationId)
    ]);

    if (!user || !conversation) {
      return this.getDefaultSuggestions();
    }

    // Generate different types of suggestions
    suggestions.push(...await this.generateGreetingSuggestions(context, user));
    suggestions.push(...await this.generateQuestionSuggestions(context, user));
    suggestions.push(...await this.generateFollowUpSuggestions(context, user));
    suggestions.push(...await this.generateTopicChangeSuggestions(context, user));

    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  private async generateGreetingSuggestions(
    context: AutofillContext, 
    user: User
  ): Promise<AutofillSuggestion[]> {
    const suggestions: AutofillSuggestion[] = [];
    const timeBasedGreeting = this.getTimeBasedGreeting(context.timeOfDay);
    
    // Formal greeting
    suggestions.push({
      text: `Good ${timeBasedGreeting}, ${user.profile.name}! How are you doing?`,
      type: 'greeting',
      confidence: user.preferences.communicationStyle === 'formal' ? 0.9 : 0.6,
      reasoning: 'Formal greeting based on user preference',
      context: {
        basedOnUserPreference: true,
        basedOnRelationship: false,
        basedOnConversationHistory: false,
        basedOnTimeOfDay: true
      }
    });

    // Casual greeting
    suggestions.push({
      text: `Hey ${user.profile.name}! What's up?`,
      type: 'greeting',
      confidence: user.preferences.communicationStyle === 'casual' ? 0.9 : 0.7,
      reasoning: 'Casual greeting matching user style',
      context: {
        basedOnUserPreference: true,
        basedOnRelationship: true,
        basedOnConversationHistory: false,
        basedOnTimeOfDay: false
      }
    });

    return suggestions;
  }

  private async generateQuestionSuggestions(
    context: AutofillContext, 
    user: User
  ): Promise<AutofillSuggestion[]> {
    const suggestions: AutofillSuggestion[] = [];
    
    // Questions based on shared interests
    user.relationship.sharedInterests.forEach(interest => {
      const questionMap: Record<string, string[]> = {
        'technology': ['Working on any cool projects lately?', 'Seen any interesting tech news?'],
        'hiking': ['Been on any good hikes recently?', 'Weather looks perfect for a trail walk!'],
        'coffee': ['Found any new coffee spots?', 'Tried that new café downtown yet?'],
        'food': ['Cooked anything delicious lately?', 'Tried any new restaurants?'],
        'travel': ['Planning any trips?', 'Been anywhere interesting recently?'],
        'movies': ['Watched anything good lately?', 'Seen that new movie everyone&apos;s talking about?']
      };

      const questions = questionMap[interest.toLowerCase()] || [];
      questions.forEach(question => {
        suggestions.push({
          text: question,
          type: 'question',
          confidence: 0.8,
          reasoning: `Question about shared interest: ${interest}`,
          context: {
            basedOnUserPreference: false,
            basedOnRelationship: true,
            basedOnConversationHistory: false,
            basedOnTimeOfDay: false
          }
        });
      });
    });

    return suggestions;
  }

  private async generateFollowUpSuggestions(
    context: AutofillContext, 
    user: User
  ): Promise<AutofillSuggestion[]> {
    const suggestions: AutofillSuggestion[] = [];
    const lastMessage = context.lastMessages[context.lastMessages.length - 1];
    
    if (!lastMessage) return suggestions;

    // Analyze last message for follow-up opportunities
    if (lastMessage.analysis.intent === 'question') {
      suggestions.push({
        text: 'Great question! I was wondering about that too.',
        type: 'follow_up',
        confidence: 0.7,
        reasoning: 'Acknowledging their question and showing engagement',
        context: {
          basedOnUserPreference: false,
          basedOnRelationship: false,
          basedOnConversationHistory: true,
          basedOnTimeOfDay: false
        }
      });
    }

    if (lastMessage.analysis.sentiment === 'positive') {
      suggestions.push({
        text: 'That sounds amazing! Tell me more about it.',
        type: 'follow_up',
        confidence: 0.8,
        reasoning: 'Building on their positive sentiment',
        context: {
          basedOnUserPreference: false,
          basedOnRelationship: false,
          basedOnConversationHistory: true,
          basedOnTimeOfDay: false
        }
      });
    }

    return suggestions;
  }

  private async generateTopicChangeSuggestions(
    context: AutofillContext, 
    user: User
  ): Promise<AutofillSuggestion[]> {
    const suggestions: AutofillSuggestion[] = [];
    
    // Topic changes based on user preferences
    const availableTopics = user.preferences.preferredTopics.filter(
      topic => !context.conversationMood || context.conversationMood !== 'negative'
    );

    availableTopics.forEach(topic => {
      const topicMap: Record<string, string[]> = {
        'technology': ['Speaking of tech, have you tried the new AI tools?', 'By the way, any thoughts on the latest tech trends?'],
        'hiking': ['Weather looks perfect for outdoor activities!', 'Been thinking about weekend adventures lately?'],
        'coffee': ['Coffee break time! What\'s your go-to order?', 'Speaking of coffee, found any new spots?'],
        'food': ['Getting hungry thinking about food!', 'Any dinner plans this week?'],
        'travel': ['Dreaming of travel destinations!', 'Any vacation plans coming up?'],
        'movies': ['Movie night ideas?', 'Netflix recommendations?']
      };

      const topics = topicMap[topic.toLowerCase()] || [];
      topics.forEach(topicSuggestion => {
        suggestions.push({
          text: topicSuggestion,
          type: 'topic_change',
          confidence: 0.6,
          reasoning: `Changing topic to user's preferred interest: ${topic}`,
          context: {
            basedOnUserPreference: true,
            basedOnRelationship: true,
            basedOnConversationHistory: false,
            basedOnTimeOfDay: false
          }
        });
      });
    });

    return suggestions;
  }

  private getTimeBasedGreeting(timeOfDay: string): string {
    switch (timeOfDay) {
      case 'morning': return 'morning';
      case 'afternoon': return 'afternoon';
      case 'evening': return 'evening';
      case 'night': return 'evening';
      default: return 'day';
    }
  }

  private getDefaultSuggestions(): AutofillSuggestion[] {
    return [
      {
        text: 'Hey! How are you doing?',
        type: 'greeting',
        confidence: 0.5,
        reasoning: 'Default greeting when no context available',
        context: {
          basedOnUserPreference: false,
          basedOnRelationship: false,
          basedOnConversationHistory: false,
          basedOnTimeOfDay: false
        }
      },
      {
        text: 'What\'s new with you?',
        type: 'question',
        confidence: 0.5,
        reasoning: 'Default question when no context available',
        context: {
          basedOnUserPreference: false,
          basedOnRelationship: false,
          basedOnConversationHistory: false,
          basedOnTimeOfDay: false
        }
      }
    ];
  }

  // Helper method to determine conversation context
  async buildAutofillContext(conversationId: string): Promise<AutofillContext | null> {
    const conversation = await database.getConversation(conversationId);
    if (!conversation) return null;

    const otherUserId = conversation.participants.find(id => id !== 'current_user');
    if (!otherUserId) return null;

    const [otherUser, lastMessages] = await Promise.all([
      database.getUser(otherUserId),
      database.getMessages({ 
        conversationId,
        dateRange: {
          from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        }
      })
    ]);

    if (!otherUser) return null;

    const timeOfDay = this.getCurrentTimeOfDay();
    const conversationMood = conversation.context.mood;

    return {
      conversationId,
      currentUser: 'current_user',
      otherUser: otherUserId,
      lastMessages: lastMessages.slice(-5), // Last 5 messages
      conversationMood,
      userPreferences: otherUser.preferences,
      relationshipContext: otherUser.relationship,
      timeOfDay
    };
  }

  private getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }
}

// Export singleton instance
export const autofillService = new AutofillService();

// Convenience function for React components
export async function getAutofillSuggestions(conversationId: string): Promise<AutofillSuggestion[]> {
  const context = await autofillService.buildAutofillContext(conversationId);
  if (!context) return [];
  
  return autofillService.generateSuggestions(context);
}
