'use client';

import { motion } from 'framer-motion';
import { Heart, Github, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <motion.footer
      className="border-t border-border bg-card/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          {/* First line: Made with love at HackTheValley X + GitHub */}
          <motion.div
            className="flex items-center gap-2 text-sm text-muted-foreground"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span>Made with</span>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-current" />
            </motion.div>
            <span>at</span>
            <span className="font-semibold text-primary">HackTheValley X</span>
            <span>•</span>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="https://github.com/faizm10/htv"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <Github className="w-4 h-4 group-hover:text-primary transition-colors" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Second line: Tech stack and copyright */}
          <div className="text-xs text-muted-foreground/70">
            <span>© 2025 The Dryness Eliminator™ Team</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
