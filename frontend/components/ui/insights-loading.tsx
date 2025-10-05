'use client';

import { motion } from 'framer-motion';
import { BarChart3, Brain, Database, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightsLoadingProps {
  className?: string;
}

export function InsightsLoading({ className }: InsightsLoadingProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <BarChart3 className="w-5 h-5 text-primary" />
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-primary/50" />
          </motion.div>
        </div>
        <h3 className="font-semibold">Analyzing Conversation</h3>
      </div>

      {/* Loading Steps */}
      <div className="space-y-4">
        {/* Step 1: Fetching Data */}
        <motion.div
          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Database className="w-4 h-4 text-blue-600" />
            <motion.div
              className="absolute inset-0 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Fetching conversation data</div>
            <div className="text-xs text-muted-foreground">Retrieving messages and participant information</div>
          </div>
        </motion.div>

        {/* Step 2: Processing */}
        <motion.div
          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            <Brain className="w-4 h-4 text-purple-600" />
            <motion.div
              className="absolute inset-0 w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Analyzing patterns</div>
            <div className="text-xs text-muted-foreground">Calculating metrics and communication patterns</div>
          </div>
        </motion.div>

        {/* Step 3: AI Analysis */}
        <motion.div
          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-green-600" />
            <motion.div
              className="absolute inset-0 w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">AI insights generation</div>
            <div className="text-xs text-muted-foreground">Generating personalized recommendations</div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Processing conversation insights</span>
          <span>This may take a few moments...</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Fun Facts */}
      <motion.div
        className="mt-6 p-3 bg-primary/5 border border-primary/20 rounded-lg"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="text-xs text-primary font-medium mb-1">💡 Did you know?</div>
        <div className="text-xs text-muted-foreground">
          Our AI analyzes response patterns, message sentiment, and communication timing to provide personalized insights for better conversations.
        </div>
      </motion.div>
    </div>
  );
}
