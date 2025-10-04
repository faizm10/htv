'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/TopBar'
import { MessageBubble } from '@/components/MessageBubble'
import { DraftCoachBanner } from '@/components/DraftCoachBanner'
import { AIBox } from '@/components/AIBox'
import { GhostBadge } from '@/components/GhostBadge'
import { Sparkline } from '@/components/Sparkline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDemoData } from '@/hooks/useDemoData'
import { useDryness } from '@/hooks/useDryness'
import { getInitials, formatTimeAgo } from '@/lib/utils'
import { generateRewrite } from '@/lib/gemini'
import { useToast } from '@/components/ui/use-toast'
import { Send, ArrowLeft, MessageSquare } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const conversations = useDemoData()
  const conversation = conversations.find(c => c.id === params.id)
  
  const [draft, setDraft] = useState('')
  const [isRedacted, setIsRedacted] = useState(false)
  const [previousGhostScore, setPreviousGhostScore] = useState(conversation?.ghostScore || 0)
  
  const dryness = useDryness(draft)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (conversation) {
      setPreviousGhostScore(conversation.ghostScore)
    }
  }, [conversation])

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Conversation not found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return
    
    // Simulate message sending and ghost score improvement
    const scoreImprovement = Math.random() * 20 + 5 // 5-25 point improvement
    const newScore = Math.max(0, conversation.ghostScore - scoreImprovement)
    
    // Show confetti if significant improvement
    if (conversation.ghostScore - newScore > 10) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9b8cff', '#93ff7a', '#ff5470']
      })
      toast({
        title: "Ghost contained. Nice.",
        description: "Your message improved the conversation!",
      })
    }
    
    setDraft('')
    setSuggestions([])
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setDraft(suggestion)
    setSuggestions([])
  }

  const handleGenerateSuggestions = async () => {
    if (!draft.trim()) return
    
    try {
      const lastTurns = conversation.messages.slice(-3).map(m => m.text)
      const result = await generateRewrite({ draft, lastTurns })
      setSuggestions(result)
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
      setSuggestions([
        'Hey! How are you doing?',
        'Want to grab coffee this week?',
        'Hope you\'re having a good day!'
      ])
    }
  }

  const filteredConversations = conversations.filter(c => c.id !== conversation.id)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar 
        onToggleRedact={() => setIsRedacted(!isRedacted)}
        isRedacted={isRedacted}
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Conversations */}
        <motion.div
          className="w-80 border-r border-border/50 bg-card/50 flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 border-b border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                {getInitials(conversation.name)}
              </div>
              <div>
                <h2 className="font-semibold">{conversation.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {conversation.metrics.daysSinceReply} days since reply
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <GhostBadge score={conversation.ghostScore} size="sm" />
              <div className="text-right">
                <Sparkline 
                  data={conversation.metrics.ghostScoreTrend} 
                  color={conversation.ghostScore >= 60 ? '#ff5470' : '#9b8cff'}
                  width={80}
                  height={24}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Other Conversations</h3>
            {filteredConversations.map((conv) => (
              <motion.div
                key={conv.id}
                className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => router.push(`/chat/${conv.id}`)}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                    {getInitials(conv.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  <GhostBadge score={conv.ghostScore} size="sm" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Middle Panel - Chat */}
        <motion.div
          className="flex-1 flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {conversation.messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  text={message.text}
                  sender={message.sender}
                  timestamp={message.timestamp}
                  quality={message.quality}
                  isLatest={index === conversation.messages.length - 1}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Composer */}
          <div className="p-6 border-t border-border/50">
            <AnimatePresence>
              {dryness.score >= 0.6 && draft.trim() && (
                <DraftCoachBanner
                  suggestions={suggestions}
                  onSelectSuggestion={handleSelectSuggestion}
                />
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type your message..."
                  className="pr-12 focus-ghost"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(draft)
                    }
                    if (e.key === 'Escape') {
                      setDraft('')
                      setSuggestions([])
                    }
                  }}
                />
                {draft === 'k' && (
                  <motion.div
                    className="absolute -top-8 left-0 text-xs text-muted-foreground"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    you can do better, champ.
                  </motion.div>
                )}
              </div>
              
              <Button
                onClick={() => handleSendMessage(draft)}
                disabled={!draft.trim()}
                className="ghost-glow"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {dryness.score >= 0.6 && draft.trim() && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSuggestions}
                className="mt-2 text-xs"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Get suggestions
              </Button>
            )}
          </div>
        </motion.div>

        {/* Right Panel - AI Sidekick */}
        <motion.div
          className="w-96 border-l border-border/50 bg-card/50"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <AIBox
            conversation={conversation}
            currentDraft={draft}
            onSendMessage={handleSendMessage}
            className="h-full"
          />
        </motion.div>
      </div>
    </div>
  )
}
