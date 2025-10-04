export interface DrynessResult {
  score: number; // 0-1, where 1 is completely dry
  label: 'Dry' | 'Okay' | 'Playful';
  reasons: string[];
}

export function useDryness(text: string): DrynessResult {
  if (!text.trim()) {
    return { score: 0, label: 'Playful', reasons: [] };
  }

  const trimmed = text.trim().toLowerCase();
  const reasons: string[] = [];
  let dryScore = 0;

  // Very short responses (under 5 chars)
  if (trimmed.length < 5) {
    dryScore += 0.4;
    reasons.push('Very short response');
  }

  // Single character responses
  if (trimmed.length === 1 && /[a-z]/.test(trimmed)) {
    dryScore += 0.6;
    reasons.push('Single character response');
  }

  // Classic dry responses
  const dryResponses = [
    'k', 'ok', 'okay', 'yeah', 'yep', 'nope', 'nah', 'sure', 'maybe', 
    'idk', 'dunno', 'cool', 'nice', 'good', 'bad', 'yes', 'no',
    'lol', 'lmao', 'haha', 'hah', 'heh', 'fr', 'ikr', 'omg', 'wtf',
    'tbh', 'ngl', 'imho', 'imo', 'smh', 'oof', 'yikes', 'bruh'
  ];

  if (dryResponses.includes(trimmed)) {
    dryScore += 0.5;
    reasons.push('Classic dry response');
  }

  // No question marks (lack of engagement)
  if (!text.includes('?')) {
    dryScore += 0.2;
    reasons.push('No questions asked');
  }

  // All caps (can be aggressive/dry)
  if (text === text.toUpperCase() && text.length > 3) {
    dryScore += 0.3;
    reasons.push('All caps');
  }

  // Only emojis (can be lazy)
  if (/^[\p{Emoji}\s]+$/u.test(text) && text.length < 10) {
    dryScore += 0.3;
    reasons.push('Only emojis');
  }

  // Repetitive characters
  if (/(.)\1{2,}/.test(text)) {
    dryScore += 0.2;
    reasons.push('Repetitive characters');
  }

  // No punctuation variety (only periods or none)
  const punctuationCount = (text.match(/[.!?]/g) || []).length;
  if (punctuationCount === 0 || (punctuationCount === 1 && text.endsWith('.'))) {
    dryScore += 0.1;
    reasons.push('Minimal punctuation');
  }

  // Clamp score between 0 and 1
  dryScore = Math.min(Math.max(dryScore, 0), 1);

  // Determine label
  let label: 'Dry' | 'Okay' | 'Playful';
  if (dryScore >= 0.6) {
    label = 'Dry';
  } else if (dryScore >= 0.3) {
    label = 'Okay';
  } else {
    label = 'Playful';
  }

  return {
    score: dryScore,
    label,
    reasons: reasons.slice(0, 3) // Limit to top 3 reasons
  };
}
