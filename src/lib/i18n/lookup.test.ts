import { describe, it, expect } from 'vitest'
import { lookup } from './lookup'
import type { TranslationMap } from './types'

const fixtures: TranslationMap = {
  'nav.home': { en: 'Home', ko: '홈' },
  'nav.ko_only_missing': { en: 'Tools' },
  'hero.greeting': { en: 'Hello {name}', ko: '{name}님 안녕하세요' },
  'hero.year': { en: 'Founded {year}', ko: '{year}년 설립' },
}

describe('lookup', () => {
  it('returns the English string when locale is en', () => {
    expect(lookup(fixtures, 'nav.home', 'en')).toBe('Home')
  })

  it('returns the Korean string when locale is ko', () => {
    expect(lookup(fixtures, 'nav.home', 'ko')).toBe('홈')
  })

  it('falls back to English when locale is ko but the key has no ko entry', () => {
    expect(lookup(fixtures, 'nav.ko_only_missing', 'ko')).toBe('Tools')
  })

  it('returns the key itself when the key is missing entirely', () => {
    expect(lookup(fixtures, 'missing.key', 'en')).toBe('missing.key')
    expect(lookup(fixtures, 'missing.key', 'ko')).toBe('missing.key')
  })

  it('interpolates variables into the template', () => {
    expect(lookup(fixtures, 'hero.greeting', 'en', { name: 'Heetak' })).toBe('Hello Heetak')
    expect(lookup(fixtures, 'hero.greeting', 'ko', { name: '희탁' })).toBe('희탁님 안녕하세요')
  })

  it('coerces numeric variables to strings', () => {
    expect(lookup(fixtures, 'hero.year', 'en', { year: 2023 })).toBe('Founded 2023')
    expect(lookup(fixtures, 'hero.year', 'ko', { year: 2023 })).toBe('2023년 설립')
  })

  it('leaves unmatched placeholders intact', () => {
    expect(lookup(fixtures, 'hero.greeting', 'en', { other: 'x' })).toBe('Hello {name}')
  })
})
