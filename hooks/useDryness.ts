import { useMemo } from 'react'

export interface DrynessResult {
  score: number // 0-1, where 1 is driest
  label: 'Dry' | 'Okay' | 'Playful'
  reasons: string[]
}

export function useDryness(text: string): DrynessResult {
  return useMemo(() => {
    if (!text.trim()) {
      return { score: 0, label: 'Okay', reasons: [] }
    }

    const reasons: string[] = []
    let score = 0

    // Very short messages
    if (text.length < 5) {
      score += 0.4
      reasons.push('Very short')
    }

    // Only common dry responses
    const dryResponses = ['k', 'ok', 'lol', 'fr', 'ikr', 'omg', 'yep', 'nope', 'sure', 'cool', 'nice', 'yeah', 'nah']
    if (dryResponses.includes(text.toLowerCase().trim())) {
      score += 0.6
      reasons.push('Generic response')
    }

    // No question marks
    if (!text.includes('?')) {
      score += 0.2
      reasons.push('No questions')
    }

    // All emojis (simplified check - skip for now due to regex issues)
    // if (text.length > 0 && /^[😀-🙏🌀-🗿🚀-🛿\s]+$/.test(text)) {
    //   score += 0.3
    //   reasons.push('Only emojis')
    // }

    // Very repetitive
    const words = text.toLowerCase().split(/\s+/)
    const uniqueWords = new Set(words)
    if (words.length > 3 && uniqueWords.size / words.length < 0.5) {
      score += 0.2
      reasons.push('Repetitive')
    }

    // No punctuation variety
    const punctCount = (text.match(/[.!?]/g) || []).length
    if (text.length > 20 && punctCount === 0) {
      score += 0.1
      reasons.push('No punctuation')
    }

    score = Math.min(score, 1)

    let label: 'Dry' | 'Okay' | 'Playful'
    if (score >= 0.6) {
      label = 'Dry'
    } else if (score >= 0.3) {
      label = 'Okay'
    } else {
      label = 'Playful'
    }

    return { score, label, reasons }
  }, [text])
}
