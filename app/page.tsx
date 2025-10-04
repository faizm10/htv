'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Ghost, MessageSquare, Activity, Wand2 } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-24 h-24 rounded-full bg-ectoplasm/20 flex items-center justify-center ghost-glow">
            <Ghost className="w-12 h-12 text-ectoplasm" />
          </div>
        </motion.div>

        <div className="space-y-4">
          <h1 className="font-display font-bold text-4xl tracking-tight">
            Welcome to <span className="text-ectoplasm">GhostWing</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-comfy">
            Your AI wingman for ghosting/dry chats. Turn those awkward silences into engaging conversations.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="ghost-card p-6 text-center">
            <MessageSquare className="w-8 h-8 text-ectoplasm mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Smart Rewrites</h3>
            <p className="text-sm text-muted-foreground">
              Transform dry messages into engaging conversations
            </p>
          </div>

          <div className="ghost-card p-6 text-center">
            <Activity className="w-8 h-8 text-slime mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Ghost Detection</h3>
            <p className="text-sm text-muted-foreground">
              Track conversation health with real-time scoring
            </p>
          </div>

          <div className="ghost-card p-6 text-center">
            <Wand2 className="w-8 h-8 text-haunt mx-auto mb-4" />
            <h3 className="font-semibold mb-2">AI Suggestions</h3>
            <p className="text-sm text-muted-foreground">
              Get contextual nudges and exit strategies
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Link href="/dashboard">
            <Button size="lg" className="ghost-glow">
              <Ghost className="w-5 h-5 mr-2" />
              Enter the Lab
            </Button>
          </Link>
        </motion.div>

        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          It's quiet... too quiet. Let's fix that.
        </motion.p>
      </motion.div>
    </div>
  )
}
