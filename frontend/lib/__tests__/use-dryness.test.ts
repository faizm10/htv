import { useDryness } from '../use-dryness';

describe('useDryness', () => {
  it('should detect dry responses correctly', () => {
    const dryResponses = [
      { text: 'k', expectedScore: 0.6, expectedLabel: 'Dry' },
      { text: 'ok', expectedScore: 0.5, expectedLabel: 'Dry' },
      { text: 'yeah', expectedScore: 0.5, expectedLabel: 'Dry' },
      { text: 'lol', expectedScore: 0.5, expectedLabel: 'Dry' },
      { text: 'maybe', expectedScore: 0.5, expectedLabel: 'Dry' },
    ];

    dryResponses.forEach(({ text, expectedScore, expectedLabel }) => {
      const result = useDryness(text);
      expect(result.score).toBeGreaterThanOrEqual(expectedScore - 0.1);
      expect(result.label).toBe(expectedLabel);
    });
  });

  it('should detect playful responses correctly', () => {
    const playfulResponses = [
      'Hey! How was your weekend?',
      'That sounds amazing! I\'m so excited! 🎉',
      'Want to grab coffee this week? I know a great place downtown',
      'Absolutely! I\'d love to catch up. What did you have in mind?',
    ];

    playfulResponses.forEach(text => {
      const result = useDryness(text);
      expect(result.score).toBeLessThan(0.3);
      expect(result.label).toBe('Playful');
    });
  });

  it('should detect neutral responses correctly', () => {
    const neutralResponses = [
      'Hey Jamie! How was your weekend?',
      'That sounds nice! Did you do anything fun?',
      'Hey, I was thinking about our conversation from last week',
      'How\'s it going? Free for a quick coffee this week?',
    ];

    neutralResponses.forEach(text => {
      const result = useDryness(text);
      expect(result.score).toBeGreaterThanOrEqual(0.3);
      expect(result.score).toBeLessThan(0.6);
      expect(result.label).toBe('Okay');
    });
  });

  it('should handle edge cases', () => {
    // Empty string
    expect(useDryness('')).toEqual({ score: 0, label: 'Playful', reasons: [] });
    
    // Very short responses
    expect(useDryness('hi')).toEqual({ score: 0.4, label: 'Dry', reasons: ['Very short response'] });
    
    // All caps
    expect(useDryness('HELLO THERE')).toEqual({ score: 0.3, label: 'Dry', reasons: ['All caps'] });
    
    // Only emojis
    expect(useDryness('😀😀😀')).toEqual({ score: 0.3, label: 'Dry', reasons: ['Only emojis'] });
  });

  it('should provide meaningful reasons', () => {
    const result = useDryness('k');
    expect(result.reasons).toContain('Single character response');
    expect(result.reasons).toContain('Classic dry response');
    expect(result.reasons.length).toBeLessThanOrEqual(3);
  });
});
