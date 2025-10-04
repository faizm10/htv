'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ghost, Filter, Search } from 'lucide-react';
import { GhostBadge } from '@/components/ui/ghost-badge';
import { TopBar } from '@/components/ui/top-bar';
import { useDemoData } from '@/lib/demo-data';
import Link from 'next/link';

type FilterType = 'all' | 'risky' | 'active';

export default function ChatPage() {
  const { conversations } = useDemoData();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conversation => {
    const matchesSearch = conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filter) {
      case 'risky':
        return conversation.isRisky && matchesSearch;
      case 'active':
        return conversation.isActive && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar onSearch={setSearchQuery} />
      
      <div className="flex-1 flex">
        {/* Left Panel - Conversations */}
        <div className="w-80 border-r border-border flex flex-col">
          {/* Filters */}
          <div className="p-4 border-b border-border">
            <div className="flex gap-2 mb-4">
              {[
                { id: 'all', label: 'All', count: conversations.length },
                { id: 'risky', label: 'Risky', count: conversations.filter(c => c.isRisky).length },
                { id: 'active', label: 'Active', count: conversations.filter(c => c.isActive).length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as FilterType)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Ghost className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No conversations found</p>
                <p className="text-sm">It's quiet... too quiet.</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    href={`/chat/${conversation.id}`}
                    className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                        {conversation.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{conversation.name}</span>
                          {conversation.isActive && (
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {conversation.lastSeen}
                          </span>
                          <GhostBadge score={conversation.ghostScore} size="sm" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Ghost className="w-24 h-24 mx-auto mb-6 text-primary/50" />
            <h2 className="text-2xl font-semibold mb-2">Select a conversation</h2>
            <p className="text-muted-foreground mb-6">
              Choose a chat from the sidebar to start managing your ghosting risks
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/chat/jamie"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Fix Jamie's Chat (92% Risk)
              </Link>
              <Link
                href="/chat/alex"
                className="px-6 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Healthy Chat (Alex)
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
