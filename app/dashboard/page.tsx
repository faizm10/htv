'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TopBar } from '@/components/TopBar'
import { GhostBadge } from '@/components/GhostBadge'
import { Sparkline } from '@/components/Sparkline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDemoData } from '@/hooks/useDemoData'
import { getInitials, formatTimeAgo } from '@/lib/utils'
import { MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const conversations = useDemoData()
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'risky' | 'active'>('all')

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'risky' && conv.ghostScore >= 60) ||
      (filter === 'active' && conv.ghostScore < 60)
    
    return matchesSearch && matchesFilter
  })

  const riskyCount = conversations.filter(c => c.ghostScore >= 60).length
  const activeCount = conversations.filter(c => c.ghostScore < 60).length

  return (
    <div className="min-h-screen bg-background">
      <TopBar onSearch={setSearchQuery} />
      
      <div className="p-6 max-w-7xl mx-auto">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display font-bold text-3xl mb-2">Top Ghost Risks</h1>
          <p className="text-muted-foreground">
            Conversations that need your attention
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="ghost-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversations.length}</div>
            </CardContent>
          </Card>

          <Card className="ghost-card border-haunt/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-haunt" />
                Risky Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-haunt">{riskyCount}</div>
            </CardContent>
          </Card>

          <Card className="ghost-card border-slime/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slime" />
                Active Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slime">{activeCount}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          className="flex gap-2 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {[
            { key: 'all', label: 'All', count: conversations.length },
            { key: 'risky', label: 'Risky', count: riskyCount },
            { key: 'active', label: 'Active', count: activeCount }
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(tab.key as any)}
              className="ghost-glow"
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </motion.div>

        {/* Conversations List */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {filteredConversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Link href={`/chat/${conversation.id}`}>
                <Card className="ghost-card hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                        {getInitials(conversation.name)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold truncate">{conversation.name}</h3>
                          {conversation.unreadCount > 0 && (
                            <div className="w-2 h-2 bg-ectoplasm rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {conversation.lastMessage}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatTimeAgo(conversation.lastMessageTime)}</span>
                          <span>{conversation.metrics.daysSinceReply} days since reply</span>
                        </div>
                      </div>

                      {/* Ghost Badge & Sparkline */}
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <Sparkline 
                            data={conversation.metrics.ghostScoreTrend} 
                            color={conversation.ghostScore >= 60 ? '#ff5470' : '#9b8cff'}
                            width={60}
                            height={20}
                          />
                        </div>
                        <GhostBadge score={conversation.ghostScore} size="md" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {filteredConversations.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No conversations found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'It\'s quiet... too quiet. Add a contact before the ghosts unionize.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
