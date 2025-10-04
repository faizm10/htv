'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MetricCard } from '@/components/MetricCard'
import { GhostBadge } from '@/components/GhostBadge'
import { Sparkline } from '@/components/Sparkline'
import { generateNudge, generateRewrite, generateExit } from '@/lib/gemini'
import { Wand2, MessageSquare, DoorOpen, BarChart3, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import type { Conversation } from '@/hooks/useDemoData'

interface AIBoxProps {
  conversation: Conversation
  currentDraft: string
  onSendMessage: (message: string) => void
  className?: string
}

export function AIBox({ conversation, currentDraft, onSendMessage, className }: AIBoxProps) {
  const [activeTab, setActiveTab] = useState('nudge')
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [nudgeContext, setNudgeContext] = useState('')
  const { toast } = useToast()

  const handleGenerateNudge = async () => {
    setIsGenerating(true)
    try {
      const result = await generateNudge({ context: nudgeContext || 'General conversation' })
      setSuggestions(result)
    } catch (error) {
      console.error('Failed to generate nudge:', error)
      setSuggestions(['Hey! How are you doing?', 'Want to grab coffee this week?', 'Hope you\'re having a good day!'])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateRewrite = async () => {
    if (!currentDraft.trim()) return
    
    setIsGenerating(true)
    try {
      const lastTurns = conversation.messages.slice(-3).map(m => m.text)
      const result = await generateRewrite({ draft: currentDraft, lastTurns })
      setSuggestions(result)
    } catch (error) {
      console.error('Failed to generate rewrite:', error)
      setSuggestions([currentDraft, currentDraft + '?', currentDraft + '!'])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateExit = async () => {
    setIsGenerating(true)
    try {
      const result = await generateExit()
      setSuggestions(result)
    } catch (error) {
      console.error('Failed to generate exit:', error)
      setSuggestions(['Thanks for the chat! Take care.', 'Talk to you later!', 'Have a great day!'])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    onSendMessage(suggestion)
    setSuggestions([])
    toast({
      title: "Ghost contained. Nice.",
      description: "Message sent successfully!",
    })
  }

  return (
    <motion.div
      className={cn('ghost-card p-6 h-full flex flex-col', className)}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-ectoplasm/20 flex items-center justify-center">
          <Wand2 className="w-5 h-5 text-ectoplasm" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg">AI Sidekick</h2>
          <p className="text-sm text-muted-foreground">Your ghost-busting assistant</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="nudge" className="text-xs">Nudge</TabsTrigger>
          <TabsTrigger value="rewrite" className="text-xs">Rewrite</TabsTrigger>
          <TabsTrigger value="exit" className="text-xs">Exit</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="nudge" className="flex-1 flex flex-col">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Context (optional)</label>
              <Textarea
                placeholder="What's the situation? e.g., 'Haven't heard from them in a week'"
                value={nudgeContext}
                onChange={(e) => setNudgeContext(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            <Button
              onClick={handleGenerateNudge}
              disabled={isGenerating}
              className="w-full ghost-glow"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Summoning...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Summon Nudge 🪄
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Low-risk nudge (2 concrete options + opt-out)
            </p>
          </div>
        </TabsContent>

        <TabsContent value="rewrite" className="flex-1 flex flex-col">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Current draft</label>
              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                {currentDraft || 'Type something in the chat to rewrite...'}
              </div>
            </div>
            
            <Button
              onClick={handleGenerateRewrite}
              disabled={isGenerating || !currentDraft.trim()}
              className="w-full ghost-glow"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rewriting...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Rewrite Draft ✨
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              ≤120 chars, adds questions naturally, avoids love-bombing
            </p>
          </div>
        </TabsContent>

        <TabsContent value="exit" className="flex-1 flex flex-col">
          <div className="space-y-4">
            <div className="text-center py-8">
              <DoorOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Need to set a boundary? Get a polite exit message.
              </p>
            </div>
            
            <Button
              onClick={handleGenerateExit}
              disabled={isGenerating}
              className="w-full ghost-glow"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Crafting...
                </>
              ) : (
                <>
                  <DoorOpen className="w-4 h-4 mr-2" />
                  Irish Goodbye, but Polite 🫶
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Polite boundary ≤140 chars
            </p>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="flex-1">
          <div className="space-y-4">
            <MetricCard
              title="Days Since Reply"
              value={conversation.metrics.daysSinceReply}
              subtitle="Last response time"
              icon={<MessageSquare className="w-4 h-4" />}
            />
            
            <MetricCard
              title="Response Rate"
              value={`${Math.round(conversation.metrics.responseRate * 100)}%`}
              trend={0.1}
              subtitle="How often they respond"
              icon={<BarChart3 className="w-4 h-4" />}
            />
            
            <MetricCard
              title="Average Dryness"
              value={`${Math.round(conversation.metrics.averageDryness * 100)}%`}
              trend={-0.05}
              subtitle="Your message quality"
            />
            
            <div className="ghost-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Ghost Score Trend</h3>
                <GhostBadge score={conversation.ghostScore} size="sm" />
              </div>
              <Sparkline 
                data={conversation.metrics.ghostScoreTrend} 
                color="#9b8cff"
                width={200}
                height={40}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          className="mt-6 space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="text-sm font-medium text-muted-foreground">Suggestions:</h4>
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left justify-start h-auto p-3 text-sm"
              >
                {suggestion}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
