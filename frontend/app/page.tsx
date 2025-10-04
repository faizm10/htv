'use client';

import { motion } from 'framer-motion';
import { Ghost, TrendingUp, AlertTriangle, MessageSquare } from 'lucide-react';
import { GhostBadge } from '@/components/ui/ghost-badge';
import { useDemoData } from '@/lib/demo-data';
import Link from 'next/link';

export default function Dashboard() {
  const { conversations } = useDemoData();

  const riskyConversations = conversations.filter(c => c.isRisky);
  const activeConversations = conversations.filter(c => c.isActive);

  const totalGhostScore = conversations.reduce((sum, c) => sum + c.ghostScore, 0);
  const averageGhostScore = Math.round(totalGhostScore / conversations.length);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ghost className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">GhostWing Dashboard</h1>
              <p className="text-muted-foreground">Your AI wingman for ghosting and dry chats</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Average Ghost Score</div>
              <GhostBadge score={averageGhostScore} size="lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="ghost-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-bold">{riskyConversations.length}</div>
                <div className="text-sm text-muted-foreground">High Risk Chats</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="ghost-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeConversations.length}</div>
                <div className="text-sm text-muted-foreground">Active Conversations</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="ghost-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{conversations.length}</div>
                <div className="text-sm text-muted-foreground">Total Conversations</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Ghost Risks */}
        <motion.div
          className="ghost-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Top Ghost Risks</h2>
            <Link 
              href="/chat"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {conversations
              .sort((a, b) => b.ghostScore - a.ghostScore)
              .slice(0, 5)
              .map((conversation, index) => (
                <Link
                  key={conversation.id}
                  href={`/chat/${conversation.id}`}
                  className="block p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                        {conversation.avatar}
                      </div>
                      <div>
                        <div className="font-medium">{conversation.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {conversation.lastMessage} • {conversation.lastSeen}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <div className="text-muted-foreground">Days since reply</div>
                        <div className="font-medium">{conversation.metrics.daysSinceReply}</div>
                      </div>
                      <GhostBadge 
                        score={conversation.ghostScore} 
                        showPulse={conversation.ghostScore > 80}
                      />
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="ghost-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Link
              href="/chat"
              className="flex-1 p-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-center"
            >
              <Ghost className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="font-medium">Start Chatting</div>
              <div className="text-sm text-muted-foreground">Open conversation view</div>
            </Link>
            <Link
              href="/chat/jamie"
              className="flex-1 p-4 rounded-lg border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors text-center"
            >
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-destructive" />
              <div className="font-medium">Fix Jamie's Chat</div>
              <div className="text-sm text-muted-foreground">Highest ghost risk</div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
