import { describe, it, expect } from 'vitest'
import { resolveLocale } from './resolve'

describe('resolveLocale', () => {
  it('prefers stored value over navigator language', () => {
    expect(resolveLocale({ stored: 'ko', navigatorLanguage: 'en-US' })).toBe('ko')
  })

  it('uses navigator language when no stored value', () => {
    expect(resolveLocale({ navigatorLanguage: 'ko-KR' })).toBe('ko')
    expect(resolveLocale({ navigatorLanguage: 'en-US' })).toBe('en')
  })

  it('falls back to default locale when nothing matches', () => {
    expect(resolveLocale({ stored: null, navigatorLanguage: 'fr-FR' })).toBe('en')
  })

  it('falls back to default when nothing provided', () => {
    expect(resolveLocale()).toBe('en')
  })

  it('honors a custom default locale', () => {
    expect(resolveLocale({ defaultLocale: 'ko' })).toBe('ko')
  })

  it('ignores invalid stored values', () => {
    expect(resolveLocale({ stored: 'fr', navigatorLanguage: 'ko-KR' })).toBe('ko')
    expect(resolveLocale({ stored: '', navigatorLanguage: 'ko-KR' })).toBe('ko')
  })
})
