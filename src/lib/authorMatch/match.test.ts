import { describe, it, expect } from 'vitest'
import { buildAuthorIndex, matchAuthor } from './match'
import type { LabAuthor } from './types'

const HEETAK: LabAuthor = { id: 'heetak-lee', name: 'Heetak Lee', nameKo: '이희탁', kind: 'team' }
const YEONGJUN: LabAuthor = { id: 'yeongjun-kim', name: 'Yeongjun Kim', nameKo: '김영준', kind: 'team' }
const YOUNGCHUL: LabAuthor = { id: 'youngchul-oh', name: 'Youngchul Oh', nameKo: '오영철', kind: 'team' }

describe('buildAuthorIndex + matchAuthor', () => {
  const idx = buildAuthorIndex([HEETAK, YEONGJUN, YOUNGCHUL])

  it('matches exact English fullname', () => {
    expect(matchAuthor('Heetak Lee', idx)).toEqual(HEETAK)
  })

  it('matches first-initial + surname (H Lee)', () => {
    expect(matchAuthor('H Lee', idx)).toEqual(HEETAK)
  })

  it('matches first-initial with period (H. Lee)', () => {
    expect(matchAuthor('H. Lee', idx)).toEqual(HEETAK)
  })

  it('matches surname-first (Lee, Heetak)', () => {
    expect(matchAuthor('Lee, Heetak', idx)).toEqual(HEETAK)
  })

  it('matches surname-first with initial (Lee, H)', () => {
    expect(matchAuthor('Lee, H', idx)).toEqual(HEETAK)
  })

  it('matches Korean fullname (이희탁)', () => {
    expect(matchAuthor('이희탁', idx)).toEqual(HEETAK)
  })

  it('returns null for non-lab author', () => {
    expect(matchAuthor('Jane Smith', idx)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(matchAuthor('', idx)).toBeNull()
  })

  it('does NOT match Y Kim to Yeongjun when Younggi Kim exists', () => {
    const ambiguousIdx = buildAuthorIndex([
      YEONGJUN,
      { id: 'younggi-kim', name: 'Younggi Kim', kind: 'team' },
    ])
    expect(matchAuthor('Y Kim', ambiguousIdx)).toBeNull()
  })

  it('DOES match Y Oh to Youngchul Oh (unambiguous)', () => {
    expect(matchAuthor('Y Oh', idx)).toEqual(YOUNGCHUL)
  })

  it('matches case-insensitively', () => {
    expect(matchAuthor('heetak lee', idx)).toEqual(HEETAK)
  })
})
