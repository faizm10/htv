'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Settings, Eye, EyeOff, Ghost } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopBarProps {
  onSearch?: (query: string) => void
  onToggleRedact?: () => void
  isRedacted?: boolean
  className?: string
}

export function TopBar({ onSearch, onToggleRedact, isRedacted = false, className }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showGhost, setShowGhost] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const handleTitleHover = () => {
    setShowGhost(true)
    setTimeout(() => setShowGhost(false), 3000)
  }

  return (
    <motion.header
      className={cn(
        'flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm',
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <motion.div
          className="relative"
          onHoverStart={handleTitleHover}
        >
          <h1 className="font-display font-bold text-xl tracking-tight">
            GhostWing
          </h1>
          {showGhost && (
            <motion.div
              className="absolute -top-2 -right-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
            >
              <Ghost className="w-4 h-4 text-ectoplasm animate-float" />
            </motion.div>
          )}
        </motion.div>
        
        <div className="text-sm text-muted-foreground">
          AI wingman for ghosting/dry chats
        </div>
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64 focus-ghost"
          />
        </form>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleRedact}
          className="focus-ghost"
          title={isRedacted ? 'Show names' : 'Hide names'}
        >
          {isRedacted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="focus-ghost"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </motion.header>
  )
}
