'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, RefreshCw, DoorOpen, BarChart3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard } from './metric-card';
import { generateRewrite, generateNudge, generateExit } from '@/lib/gemini';

interface AIBoxProps {
  currentDraft: string;
  lastMessages: string[];
  metrics: {
    daysSinceReply: number;
    responseRate: number;
    averageDryness: number;
    ghostScoreTrend: number;
  };
  className?: string;
}

type TabType = 'nudge' | 'rewrite' | 'exit' | 'insights';

export function AIBox({ currentDraft, lastMessages, metrics, className }: AIBoxProps) {
  const [activeTab, setActiveTab] = useState<TabType>('nudge');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const tabs = [
    { id: 'nudge' as const, label: 'Nudge', icon: Wand2 },
    { id: 'rewrite' as const, label: 'Rewrite', icon: RefreshCw },
    { id: 'exit' as const, label: 'Exit', icon: DoorOpen },
    { id: 'insights' as const, label: 'Insights', icon: BarChart3 },
  ];

  const handleGenerate = async (type: TabType) => {
    setIsGenerating(true);
    try {
      let result: string[] = [];
      
      switch (type) {
        case 'nudge':
          result = await generateNudge({ context: currentDraft });
          break;
        case 'rewrite':
          result = await generateRewrite({ 
            draft: currentDraft, 
            lastTurns: lastMessages 
          });
          break;
        case 'exit':
          result = await generateExit();
          break;
      }
      
      setSuggestions(result);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'nudge':
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Low-risk nudge (2 concrete options + opt-out)
            </div>
            <textarea
              placeholder="Add context for the nudge (optional)..."
              className="w-full h-20 px-3 py-2 bg-muted border border-border rounded-lg resize-none text-sm"
            />
            <button
              onClick={() => handleGenerate('nudge')}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Summoning...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Summon Nudge 🪄
                </>
              )}
            </button>
          </div>
        );

      case 'rewrite':
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Rewrite your draft with AI suggestions
            </div>
            <div className="text-xs text-muted-foreground">
              Draft: "{currentDraft || 'No draft yet'}"
            </div>
            <button
              onClick={() => handleGenerate('rewrite')}
              disabled={isGenerating || !currentDraft}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Rewriting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Summon Rewrite 👻
                </>
              )}
            </button>
          </div>
        );

      case 'exit':
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Irish Goodbye, but Polite 🫶
            </div>
            <button
              onClick={() => handleGenerate('exit')}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Crafting...
                </>
              ) : (
                <>
                  <DoorOpen className="w-4 h-4" />
                  Generate Exit Message
                </>
              )}
            </button>
          </div>
        );

      case 'insights':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                title="Days Since Reply"
                value={metrics.daysSinceReply}
                subtitle="Last response"
                icon={<Sparkles className="w-4 h-4" />}
              />
              <MetricCard
                title="Response Rate"
                value={`${(metrics.responseRate * 100).toFixed(0)}%`}
                trend={metrics.ghostScoreTrend > 0 ? -metrics.ghostScoreTrend : undefined}
                subtitle="Reply frequency"
              />
              <MetricCard
                title="Dryness"
                value={`${(metrics.averageDryness * 100).toFixed(0)}%`}
                trend={metrics.averageDryness > 0.5 ? metrics.averageDryness * 10 : undefined}
                subtitle="Message quality"
              />
              <MetricCard
                title="Ghost Score"
                value={`${Math.round(metrics.ghostScoreTrend)}`}
                trend={metrics.ghostScoreTrend}
                subtitle="Risk level"
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Peak dryness detected at <strong>11:42 PM Fridays</strong>. Consider sleeping.
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn('ghost-card p-6 h-fit', className)}>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">AI Sidekick</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors',
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          className="mt-4 pt-4 border-t border-border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="text-sm font-medium mb-3">Suggestions:</h4>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  // Copy to clipboard
                  navigator.clipboard.writeText(suggestion);
                }}
                className="w-full text-left p-3 text-sm bg-muted hover:bg-muted/80 rounded-lg transition-colors border border-transparent hover:border-border"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
