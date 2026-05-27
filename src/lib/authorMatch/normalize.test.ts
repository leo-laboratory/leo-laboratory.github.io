import { describe, it, expect } from 'vitest'
import { normalizeAuthorName } from './normalize'

describe('normalizeAuthorName', () => {
  it('lowercases', () => {
    expect(normalizeAuthorName('Heetak Lee')).toBe('heetak lee')
  })

  it('strips diacritics', () => {
    expect(normalizeAuthorName('Andrea Català-Bordes')).toBe('andrea catala-bordes')
  })

  it('collapses internal whitespace and trims', () => {
    expect(normalizeAuthorName('  Heetak   Lee  ')).toBe('heetak lee')
  })

  it('handles surname-first comma form (Lee, Heetak)', () => {
    expect(normalizeAuthorName('Lee, Heetak')).toBe('heetak lee')
  })

  it('handles surname-first comma with initial (Lee, H.)', () => {
    expect(normalizeAuthorName('Lee, H.')).toBe('h lee')
  })

  it('handles initial-then-surname with period (H. Lee)', () => {
    expect(normalizeAuthorName('H. Lee')).toBe('h lee')
  })

  it('handles initial-then-surname without period (H Lee)', () => {
    expect(normalizeAuthorName('H Lee')).toBe('h lee')
  })

  it('handles two initials (J-H Choi)', () => {
    expect(normalizeAuthorName('J-H Choi')).toBe('jh choi')
  })

  it('handles two initials with periods (J. H. Choi)', () => {
    expect(normalizeAuthorName('J. H. Choi')).toBe('jh choi')
  })

  it('strips trailing period (Lee.)', () => {
    expect(normalizeAuthorName('Lee.')).toBe('lee')
  })

  it('returns Korean fullname as-is lowercased (이희탁)', () => {
    expect(normalizeAuthorName('이희탁')).toBe('이희탁')
  })

  it('treats empty string as empty', () => {
    expect(normalizeAuthorName('')).toBe('')
  })
})
