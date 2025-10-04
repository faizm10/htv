import { getGhostTier } from '../lib/utils'

describe('GhostBadge Tiers', () => {
  it('should return alive tier for low scores', () => {
    const tier = getGhostTier(15)
    expect(tier.tier).toBe('alive')
    expect(tier.emoji).toBe('✅')
    expect(tier.label).toBe('Alive & texting')
  })

  it('should return slow tier for medium-low scores', () => {
    const tier = getGhostTier(45)
    expect(tier.tier).toBe('slow')
    expect(tier.emoji).toBe('🟡')
    expect(tier.label).toBe('Slow fade')
  })

  it('should return haunting tier for medium-high scores', () => {
    const tier = getGhostTier(70)
    expect(tier.tier).toBe('haunting')
    expect(tier.emoji).toBe('🟠')
    expect(tier.label).toBe('Advanced haunting')
  })

  it('should return poltergeist tier for high scores', () => {
    const tier = getGhostTier(95)
    expect(tier.tier).toBe('poltergeist')
    expect(tier.emoji).toBe('🔴')
    expect(tier.label).toBe('Poltergeist mode')
  })

  it('should handle boundary values correctly', () => {
    expect(getGhostTier(29).tier).toBe('alive')
    expect(getGhostTier(30).tier).toBe('slow')
    expect(getGhostTier(59).tier).toBe('slow')
    expect(getGhostTier(60).tier).toBe('haunting')
    expect(getGhostTier(79).tier).toBe('haunting')
    expect(getGhostTier(80).tier).toBe('poltergeist')
  })
})
