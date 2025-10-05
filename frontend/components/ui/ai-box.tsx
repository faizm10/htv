'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, RefreshCw, DoorOpen, BarChart3, Sparkles, ChevronDown, X, User, Clock, MessageSquare, TrendingDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MetricCard } from './metric-card';
import { generateRewrite, generateNudge, generateExit, testGeminiConnection } from '@/lib/gemini';
import { generateInsights, getInsightSummary, formatInsightMetric, type ConversationInsights } from '@/lib/insights-service';
import { getConversationInsights, type ConversationInsight } from '@/lib/conversation-insights-service';
import { InsightsDashboard } from './insights-dashboard';
import { InsightsLoading } from './insights-loading';

interface AIBoxProps {
  currentDraft: string;
  lastMessages: string[];
  metrics: {
    daysSinceReply: number;
    responseRate: number;
    averageDryness: number;
    ghostScoreTrend: number;
  };
  conversationId?: string;
  className?: string;
}

type TabType = 'nudge' | 'rewrite' | 'exit' | 'insights';

export function AIBox({ currentDraft, lastMessages, metrics, conversationId, className }: AIBoxProps) {
  const [activeTab, setActiveTab] = useState<TabType>('nudge');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // API test state
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  
  // Insights state
  const [insights, setInsights] = useState<ConversationInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // New conversation insights state
  const [conversationInsights, setConversationInsights] = useState<ConversationInsight | null>(null);
  const [conversationInsightsLoading, setConversationInsightsLoading] = useState(false);
  const [conversationInsightsError, setConversationInsightsError] = useState<string | null>(null);
  const [useNewInsights, setUseNewInsights] = useState(true);
  
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
    
    // Clear previous suggestions when starting new generation
    if (type === 'rewrite') {
      setSuggestions([]);
    }
    
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

  const loadInsights = async (isRefresh = false) => {
    if (!conversationId) {
      console.log('⚠️ [AI Box] No conversation ID provided, skipping insights load');
      return;
    }
    
    console.log('🔄 [AI Box] Loading insights for conversation:', conversationId, {
      useNewInsights,
      isRefresh,
      currentState: {
        conversationInsightsLoading,
        insightsLoading,
        isRefreshing
      }
    });
    
    if (useNewInsights) {
      // Use new conversation insights system
      console.log('🤖 [AI Box] Using AI Enhanced insights system');
      if (isRefresh) {
        setIsRefreshing(true);
        console.log('🔄 [AI Box] Set refreshing state to true');
      } else {
        setConversationInsightsLoading(true);
        console.log('⏳ [AI Box] Set conversation insights loading to true');
      }
      setConversationInsightsError(null);
      
      try {
        console.log('🚀 [AI Box] Calling getConversationInsights...');
        const data = await getConversationInsights(conversationId);
        if (data) {
          console.log('✅ [AI Box] Conversation insights received:', {
            conversationId: data.conversationId,
            overallHealth: data.overallHealth,
            participantCount: data.participants.length,
            hasSummary: !!data.summary,
            hasInsights: !!data.insights,
            hasSuggestions: !!data.suggestions
          });
          setConversationInsights(data);
        } else {
          console.error('❌ [AI Box] No data returned from getConversationInsights');
          throw new Error('Failed to generate conversation insights');
        }
      } catch (error) {
        console.error('❌ [AI Box] Error in AI Enhanced insights:', error);
        setConversationInsightsError(error instanceof Error ? error.message : 'Failed to load conversation insights');
        // Fallback to old system
        console.log('🔄 [AI Box] Falling back to basic insights system');
        setUseNewInsights(false);
        await loadOldInsights(isRefresh);
      } finally {
        setConversationInsightsLoading(false);
        setIsRefreshing(false);
        console.log('✅ [AI Box] Loading states reset');
      }
    } else {
      // Use old insights system
      console.log('📊 [AI Box] Using basic insights system');
      await loadOldInsights(isRefresh);
    }
  };

  const loadOldInsights = async (isRefresh = false) => {
    if (!conversationId) {
      console.log('⚠️ [AI Box] No conversation ID provided for old insights');
      return;
    }
    
    console.log('📊 [AI Box] Loading basic insights for conversation:', conversationId, { isRefresh });
    
    if (isRefresh) {
      setIsRefreshing(true);
      console.log('🔄 [AI Box] Set refreshing state to true (basic insights)');
    } else {
      setInsightsLoading(true);
      console.log('⏳ [AI Box] Set insights loading to true (basic insights)');
    }
    setInsightsError(null);
    
    try {
      console.log('🚀 [AI Box] Calling generateInsights (basic)...');
      const data = await generateInsights(conversationId);
      console.log('✅ [AI Box] Basic insights received:', {
        hasData: !!data,
        userCount: data ? Object.keys(data).length : 0
      });
      setInsights(data);
    } catch (error) {
      console.error('❌ [AI Box] Error in basic insights:', error);
      setInsightsError(error instanceof Error ? error.message : 'Failed to load insights');
    } finally {
      setInsightsLoading(false);
      setIsRefreshing(false);
      console.log('✅ [AI Box] Basic insights loading states reset');
    }
  };

  // Load insights when switching to insights tab or when conversation changes
  useEffect(() => {
    console.log('🔄 [AI Box] useEffect triggered for insights loading:', {
      activeTab,
      conversationId,
      conversationInsightsLoading,
      insightsLoading,
      shouldLoad: activeTab === 'insights' && conversationId && !conversationInsightsLoading && !insightsLoading
    });
    
    if (activeTab === 'insights' && conversationId && !conversationInsightsLoading && !insightsLoading) {
      console.log('✅ [AI Box] Conditions met, loading insights...');
      loadInsights();
    } else {
      console.log('⏸️ [AI Box] Conditions not met, skipping insights load');
    }
  }, [activeTab, conversationId]);

  // Clear insights when conversation changes
  useEffect(() => {
    console.log('🧹 [AI Box] Conversation changed, clearing insights state:', conversationId);
    setInsights(null);
    setInsightsError(null);
    setConversationInsights(null);
    setConversationInsightsError(null);
    setUseNewInsights(true); // Reset to new insights system for new conversation
    console.log('✅ [AI Box] Insights state cleared and reset to AI Enhanced mode');
  }, [conversationId]);

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
      case 'insights':
        console.log('🎯 [AI Box] Rendering insights tab:', {
          conversationInsightsLoading,
          insightsLoading,
          conversationInsightsError,
          insightsError,
          conversationInsights: !!conversationInsights,
          insights: !!insights,
          useNewInsights,
          conversationId
        });
        
        // Show loading state
        if (conversationInsightsLoading || insightsLoading) {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Conversation Insights</div>
                <div className="flex items-center gap-2">
                  {useNewInsights && (
                    <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      AI Enhanced
                    </div>
                  )}
                  <div className="p-1">
                    <RotateCcw className="w-3 h-3 animate-spin" />
                  </div>
                </div>
              </div>
              <InsightsLoading />
            </div>
          );
        }

        // Show error state
        if (conversationInsightsError || insightsError) {
          const error = conversationInsightsError || insightsError;
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Conversation Insights</div>
                <button
                  onClick={() => loadInsights(true)}
                  disabled={conversationInsightsLoading || insightsLoading || isRefreshing}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title="Refresh insights"
                >
                  <RotateCcw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="text-center text-red-500">
                <p className="text-sm mb-2">Error loading insights: {error}</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => loadInsights()}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 mr-2"
                  >
                    Retry
                  </button>
                  {useNewInsights && (
                    <button 
                      onClick={() => {
                        setUseNewInsights(false);
                        loadInsights();
                      }}
                      className="px-3 py-1 bg-muted text-foreground rounded text-sm hover:bg-muted/80"
                    >
                      Use Basic Insights
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // Show new conversation insights if available
        if (conversationInsights && useNewInsights) {
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Conversation Insights</div>
                  <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    AI Enhanced
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setUseNewInsights(false);
                      loadInsights();
                    }}
                    className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded transition-colors"
                    title="Switch to basic insights"
                  >
                    Basic
                  </button>
                  <button
                    onClick={() => loadInsights(true)}
                    disabled={conversationInsightsLoading || isRefreshing}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Refresh insights"
                  >
                    <RotateCcw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              <InsightsDashboard insights={conversationInsights} />
            </div>
          );
        }

        // Show old insights if available
        if (insights && !useNewInsights) {
          const summary = getInsightSummary(insights);
          const users = Object.values(insights);

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Conversation Insights</div>
                  <div className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                    Basic
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setUseNewInsights(true);
                      loadInsights();
                    }}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors"
                    title="Switch to AI enhanced insights"
                  >
                    AI Enhanced
                  </button>
                  <button
                    onClick={() => loadInsights(true)}
                    disabled={insightsLoading || isRefreshing}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    title="Refresh insights"
                  >
                    <RotateCcw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium mb-2">Conversation Health</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Avg Ghost Score:</span>
                    <span className={`ml-1 font-medium ${
                      summary.averageGhostScore <= 30 ? 'text-green-600' :
                      summary.averageGhostScore <= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {summary.averageGhostScore}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`ml-1 font-medium ${
                      summary.conversationHealth === 'healthy' ? 'text-green-600' :
                      summary.conversationHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {summary.conversationHealth.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Insights */}
              <div className="space-y-3">
                {users.map((userInsight) => (
                  <div key={userInsight.user.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{userInsight.user.name}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Days:</span>
                        <span className="font-medium">
                          {userInsight.metrics.daysSinceReply !== null 
                            ? formatInsightMetric(userInsight.metrics.daysSinceReply, 'days')
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Rate:</span>
                        <span className="font-medium">
                          {formatInsightMetric(userInsight.metrics.responseRate, 'percentage')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Dryness:</span>
                        <span className="font-medium">
                          {formatInsightMetric(userInsight.metrics.drynessScore, 'percentage')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Ghost:</span>
                        <span className={`font-medium ${
                          userInsight.metrics.ghostScore <= 30 ? 'text-green-600' :
                          userInsight.metrics.ghostScore <= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {formatInsightMetric(userInsight.metrics.ghostScore, 'score')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Show no insights available
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Conversation Insights</div>
              <button
                onClick={() => loadInsights(true)}
                disabled={conversationInsightsLoading || insightsLoading || isRefreshing}
                className="p-1 hover:bg-muted rounded transition-colors"
                title="Refresh insights"
              >
                <RotateCcw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No insights available</p>
              <p className="text-xs mt-1">Click refresh to generate insights</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn('ghost-card p-6 h-fit', className)}>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Alex</h3>
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

      {/* Suggestions - Only show in rewrite tab */}
      {activeTab === 'rewrite' && suggestions.length > 0 && (
        <motion.div
          className="mt-4 pt-4 border-t border-border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="text-sm font-medium mb-3">Suggestions:</h4>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-2 p-3 bg-muted rounded-lg border border-transparent hover:border-border transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(suggestion);
                  }}
                  className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <div className="flex-1 text-sm">
                  {suggestion}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
