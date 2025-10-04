import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`
  return `${Math.floor(diffInSeconds / 2592000)}mo`
}

export function getGhostTier(score: number): {
  tier: 'alive' | 'slow' | 'haunting' | 'poltergeist'
  color: string
  emoji: string
  label: string
} {
  if (score <= 29) {
    return {
      tier: 'alive',
      color: 'text-slime',
      emoji: '✅',
      label: 'Alive & texting'
    }
  } else if (score <= 59) {
    return {
      tier: 'slow',
      color: 'text-yellow-400',
      emoji: '🟡',
      label: 'Slow fade'
    }
  } else if (score <= 79) {
    return {
      tier: 'haunting',
      color: 'text-orange-400',
      emoji: '🟠',
      label: 'Advanced haunting'
    }
  } else {
    return {
      tier: 'poltergeist',
      color: 'text-haunt',
      emoji: '🔴',
      label: 'Poltergeist mode'
    }
  }
}
