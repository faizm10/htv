import { renderHook } from '@testing-library/react'
import { useDryness } from '../hooks/useDryness'

describe('useDryness', () => {
  it('should detect dry messages', () => {
    const { result } = renderHook(() => useDryness('k'))
    expect(result.current.label).toBe('Dry')
    expect(result.current.score).toBeGreaterThan(0.6)
  })

  it('should detect okay messages', () => {
    const { result } = renderHook(() => useDryness('Hey, how are you?'))
    expect(result.current.label).toBe('Okay')
    expect(result.current.score).toBeLessThan(0.6)
    expect(result.current.score).toBeGreaterThan(0.3)
  })

  it('should detect playful messages', () => {
    const { result } = renderHook(() => useDryness('Hey! How was your weekend? I had such a great time hiking!'))
    expect(result.current.label).toBe('Playful')
    expect(result.current.score).toBeLessThan(0.3)
  })

  it('should handle empty messages', () => {
    const { result } = renderHook(() => useDryness(''))
    expect(result.current.label).toBe('Okay')
    expect(result.current.score).toBe(0)
  })

  it('should detect very short messages', () => {
    const { result } = renderHook(() => useDryness('hi'))
    expect(result.current.reasons).toContain('Very short')
  })

  it('should detect generic responses', () => {
    const { result } = renderHook(() => useDryness('ok'))
    expect(result.current.reasons).toContain('Generic response')
  })

  it('should detect messages without questions', () => {
    const { result } = renderHook(() => useDryness('That sounds good'))
    expect(result.current.reasons).toContain('No questions')
  })
})
