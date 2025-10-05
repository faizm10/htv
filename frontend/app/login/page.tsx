'use client';

import { motion } from 'framer-motion';
import { Ghost, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="ghost-card p-8 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4"
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Ghost className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">Welcome to The Dryness Eliminator™</h1>
          <p className="text-muted-foreground">
            Your AI wingman for ghosting and dry chats
          </p>
        </div>

        <div className="space-y-4">
          <div className="text-center text-sm text-muted-foreground mb-6">
            Secure authentication required to access chat features.
          </div>

          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Login to Chat
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Or go to dashboard →
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            <p>🔮 Powered by Google Gemini AI</p>
            <p>Built with Next.js, Tailwind, and Framer Motion</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
