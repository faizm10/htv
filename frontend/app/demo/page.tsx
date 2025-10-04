// Demo page showcasing the new database structure with autofill
'use client';

import React, { useState } from 'react';
import ChatWithAutofill from '@/components/chat-with-autofill';
import { useDatabaseData } from '@/lib/use-database-data';
import { Conversation } from '@/lib/database-types';

export default function DemoPage() {
  const db = useDatabaseData();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadConversations = async () => {
      try {
        const convos = await db.getConversations({ userId: 'current_user' });
        setConversations(convos);
        if (convos.length > 0 && !selectedConversationId) {
          setSelectedConversationId(convos[0].id);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            HTV Chat Database Demo
          </h1>
          <p className="text-gray-600">
            Showcasing the new database structure with autofill and orchestration capabilities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Conversations</h2>
                <p className="text-sm text-gray-500">Select a chat to view</p>
              </div>
              <div className="p-2">
                {conversations.map((conversation) => {
                  const otherUserId = conversation.participants.find(id => id !== 'current_user');
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedConversationId === conversation.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                          {conversation.metadata.title?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {conversation.metadata.title || 'Unknown'}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              conversation.metrics.conversationHealth === 'healthy' 
                                ? 'bg-green-100 text-green-800'
                                : conversation.metrics.conversationHealth === 'at_risk'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {conversation.metrics.ghostScore}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {conversation.metrics.messageCount} messages
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Database Info */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold mb-2">Database Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ User profiles & preferences</li>
                <li>✅ Conversation context & metrics</li>
                <li>✅ Message analysis & suggestions</li>
                <li>✅ Ghost score tracking</li>
                <li>✅ Autofill suggestions</li>
                <li>✅ Real-time orchestration</li>
              </ul>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            {selectedConversationId ? (
              <div className="bg-white rounded-lg shadow-sm border h-[600px]">
                <ChatWithAutofill conversationId={selectedConversationId} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-lg">Select a conversation to start chatting</p>
                  <p className="text-sm">Try Jamie's conversation to see ghost risk management</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Showcase */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-3">Smart Autofill</h3>
            <p className="text-gray-600 text-sm mb-4">
              AI-powered suggestions based on user preferences, conversation context, and relationship data.
            </p>
            <div className="space-y-2">
              <div className="text-xs bg-blue-50 px-2 py-1 rounded">Context-aware responses</div>
              <div className="text-xs bg-blue-50 px-2 py-1 rounded">User preference matching</div>
              <div className="text-xs bg-blue-50 px-2 py-1 rounded">Time-sensitive greetings</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-3">Ghost Prevention</h3>
            <p className="text-gray-600 text-sm mb-4">
              Advanced analytics to predict and prevent ghosting with actionable insights.
            </p>
            <div className="space-y-2">
              <div className="text-xs bg-red-50 px-2 py-1 rounded">Ghost score tracking</div>
              <div className="text-xs bg-red-50 px-2 py-1 rounded">Response rate monitoring</div>
              <div className="text-xs bg-red-50 px-2 py-1 rounded">Engagement optimization</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-3">Rich Context</h3>
            <p className="text-gray-600 text-sm mb-4">
              Comprehensive user profiles with preferences, analytics, and relationship data.
            </p>
            <div className="space-y-2">
              <div className="text-xs bg-green-50 px-2 py-1 rounded">Communication styles</div>
              <div className="text-xs bg-green-50 px-2 py-1 rounded">Shared interests</div>
              <div className="text-xs bg-green-50 px-2 py-1 rounded">Relationship context</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
