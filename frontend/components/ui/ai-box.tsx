'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, RefreshCw, DoorOpen, BarChart3, Sparkles, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard } from './metric-card';
import { generateRewrite, generateNudge, generateExit, testGeminiConnection } from '@/lib/gemini';

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
  
  // API test state
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  
  // Rewrite tab state
  const [rewriteMessage, setRewriteMessage] = useState('');
  const [customVibe, setCustomVibe] = useState('');
  const [selectedVibe, setSelectedVibe] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedVibeIndex, setFocusedVibeIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'nudge' as const, label: 'Nudge', icon: Wand2 },
    { id: 'rewrite' as const, label: 'Rewrite', icon: RefreshCw },
    { id: 'exit' as const, label: 'Exit', icon: DoorOpen },
    { id: 'insights' as const, label: 'Insights', icon: BarChart3 },
  ];

  const predefinedVibes = [
    'Playful',
    'Professional',
    'Casual',
    'Flirty',
    'Apologetic',
    'Enthusiastic',
    'Concerned',
    'Grateful',
    'Witty',
    'Supportive',
    'Mysterious',
    'Direct',
    'Warm',
    'Confident',
    'Humble'
  ];

  // Get filtered vibes based on custom input
  const filteredVibes = predefinedVibes.filter(vibe =>
    vibe.toLowerCase().includes(customVibe.toLowerCase())
  );

  // Handle keyboard navigation for dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedVibeIndex(prev => 
          prev < filteredVibes.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedVibeIndex(prev => 
          prev > 0 ? prev - 1 : filteredVibes.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedVibeIndex >= 0 && focusedVibeIndex < filteredVibes.length) {
          handleVibeSelect(filteredVibes[focusedVibeIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setFocusedVibeIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleVibeSelect = (vibe: string) => {
    setSelectedVibe(vibe);
    setCustomVibe(vibe);
    setIsDropdownOpen(false);
    setFocusedVibeIndex(-1);
  };

  const clearVibe = () => {
    setSelectedVibe('');
    setCustomVibe('');
    setIsDropdownOpen(false);
    setFocusedVibeIndex(-1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setFocusedVibeIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerate = async (type: TabType) => {
    setIsGenerating(true);
    try {
      let result: string[] = [];
      
      switch (type) {
        case 'nudge':
          result = await generateNudge({ context: currentDraft });
          break;
        case 'rewrite':
          const messageToRewrite = rewriteMessage || currentDraft;
          const vibe = selectedVibe || customVibe;
          result = await generateRewrite({ 
            draft: messageToRewrite, 
            lastTurns: lastMessages,
            ...(vibe && { vibe })
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

  const handleTestApi = async () => {
    setIsTestingApi(true);
    setApiTestResult(null);
    
    try {
      const result = await testGeminiConnection();
      setApiTestResult(result.message);
    } catch (error) {
      setApiTestResult('Test failed: ' + error);
    } finally {
      setIsTestingApi(false);
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
              Rewrite your message with AI suggestions
            </div>
            
            {/* Message Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                Message to rewrite:
              </label>
              <textarea
                value={rewriteMessage}
                onChange={(e) => setRewriteMessage(e.target.value)}
                placeholder="Enter the message you'd like to rewrite..."
                className="w-full h-20 px-3 py-2 bg-muted border border-border rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Vibe Selection Toolbar */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                Vibe/Tone:
              </label>
              <div className="relative" ref={dropdownRef}>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={customVibe}
                      onChange={(e) => {
                        setCustomVibe(e.target.value);
                        setIsDropdownOpen(true);
                        setFocusedVibeIndex(-1);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a vibe or select from dropdown..."
                      className="w-full px-3 py-2 pr-8 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted/80 rounded"
                    >
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        isDropdownOpen && "rotate-180"
                      )} />
                    </button>
                  </div>
                  {selectedVibe && (
                    <button
                      onClick={clearVibe}
                      className="px-3 py-2 bg-muted border border-border rounded-lg text-sm hover:bg-muted/80 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                {/* Dropdown */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
                    >
                      {filteredVibes.length > 0 ? (
                        filteredVibes.map((vibe, index) => (
                          <button
                            key={vibe}
                            onClick={() => handleVibeSelect(vibe)}
                            className={cn(
                              "w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors",
                              index === focusedVibeIndex && "bg-muted",
                              selectedVibe === vibe && "bg-primary/10 text-primary"
                            )}
                          >
                            {vibe}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No vibes found
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => handleGenerate('rewrite')}
              disabled={isGenerating || (!rewriteMessage && !currentDraft)}
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

            {/* Current Draft Fallback */}
            {!rewriteMessage && currentDraft && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                <strong>Note:</strong> Using current draft as fallback: "{currentDraft}"
              </div>
            )}
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
            
            {/* API Test Section */}
            <div className="pt-4 border-t border-border">
              <div className="text-sm font-medium mb-2">API Status</div>
              <button
                onClick={handleTestApi}
                disabled={isTestingApi}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg text-sm hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                {isTestingApi ? (
                  <>
                    <div className="w-3 h-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    Test Gemini API
                  </>
                )}
              </button>
              {apiTestResult && (
                <div className={`mt-2 p-2 rounded text-xs ${
                  apiTestResult.includes('working') || apiTestResult.includes('Present')
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {apiTestResult}
                </div>
              )}
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
