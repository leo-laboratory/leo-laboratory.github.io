# Phase 2 Implementation Plan: Publications Page Features

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `/publications` with a topic-tag filter bar (5 tags), a headline counter line, bold lab-author names, clickable lab-member co-author chips, and OpenAlex-sourced citation counts. Extend the fetcher to populate the new fields automatically.

**Architecture:** A new pure module `lib/authorMatch` normalizes author names (across romanizations, initials, surname-first) and matches them to lab members built from `team.json` + `alumni.json`. The publications page becomes a client island wrapping the year-grouped list with tag-filter state; URL hash `#tag=cancer` deep-links. Citation counts come from OpenAlex (`/works/doi:<DOI>`) with Semantic Scholar fallback. Tag assignment is hybrid: a keyword pass over title + venue seeds tags during fetcher runs, and a `manualTags: true` flag preserves PI hand-edits across re-runs.

**Tech Stack:** Next.js 15, React 19, TypeScript, Vitest. New runtime dependencies: none (built-in `fetch`). New dev dependencies: none.

**Spec reference:** `docs/superpowers/specs/2026-05-27-earthy-atmosphere-and-publications-design.md`

**Phase 1 dependency:** Phase 1 must be merged before Phase 2 starts. Phase 2 reads `member.id` from team/alumni data and links to `/team#<id>` / `/alumni#<id>` anchors that Phase 1 set up.

---

## File Inventory

**Created:**
- `src/lib/authorMatch/index.ts`
- `src/lib/authorMatch/normalize.ts`
- `src/lib/authorMatch/normalize.test.ts`
- `src/lib/authorMatch/match.ts`
- `src/lib/authorMatch/match.test.ts`
- `src/lib/authorMatch/types.ts`
- `src/components/publications/TagFilterBar.tsx`
- `src/components/publications/AuthorList.tsx`
- `src/components/publications/CoAuthorChips.tsx`
- `src/components/publications/PublicationsCounter.tsx`
- `src/components/publications/PublicationItem.tsx`

**Modified:**
- `src/lib/data/types.ts` — extend `Publication`
- `src/app/publications/page.tsx` — wire everything together (client island with filter state)
- `data/translations.json` — add `pubs.*` keys
- `data/publications.json` — populated by re-running fetcher
- `scripts/fetch-publications.ts` — add OpenAlex step + tag inference

**Deleted:**
- (none)

---

### Task 1: Extend Publication type and constants

**Files:**
- Modify: `src/lib/data/types.ts`

- [ ] **Step 1: Replace the `Publication` interface and add `TAG_VOCAB`**

In `src/lib/data/types.ts`, find the existing `Publication` interface (around line 46) and replace it:

```ts
export const TAG_VOCAB = ['cancer', 'evolution', 'organoids', 'regeneration', 'stemcell'] as const
export type Tag = (typeof TAG_VOCAB)[number]

export interface Publication {
  id: string
  title: string
  authors: string[]
  venue: string
  year: number
  doi?: string
  url?: string
  preprint?: string
  tags?: Tag[]
  citations?: number
  citationsAsOf?: string
  manualTags?: boolean
}
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors. Existing consumers of `Publication` use only the original fields, so the additions are non-breaking.

- [ ] **Step 3: Commit**

```bash
git add src/lib/data/types.ts
git commit -m "feat(pub-types): extend Publication with tags, citations, manualTags

Adds TAG_VOCAB const and Tag union type. Phase 2 components and the
fetcher consume these. Non-breaking: existing fields unchanged."
```

---

### Task 2: Author name normalization — write the failing tests first

**Files:**
- Create: `src/lib/authorMatch/normalize.ts` (empty stub)
- Create: `src/lib/authorMatch/normalize.test.ts`

- [ ] **Step 1: Create an empty stub `src/lib/authorMatch/normalize.ts`**

```ts
export function normalizeAuthorName(input: string): string {
  throw new Error('not implemented')
}
```

- [ ] **Step 2: Create `src/lib/authorMatch/normalize.test.ts`**

```ts
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
```

- [ ] **Step 3: Run tests to confirm they fail**

Run: `npx vitest run src/lib/authorMatch/normalize.test.ts`
Expected: All 12 tests fail with "not implemented".

- [ ] **Step 4: Commit failing tests**

```bash
git add src/lib/authorMatch/normalize.ts src/lib/authorMatch/normalize.test.ts
git commit -m "test(author-match): write failing tests for normalizeAuthorName

Covers: lowercase, diacritics, whitespace, surname-first,
initials with/without periods, multi-initial, Korean,
trailing period, empty string."
```

---

### Task 3: Implement normalizeAuthorName to make tests pass

**Files:**
- Modify: `src/lib/authorMatch/normalize.ts`

- [ ] **Step 1: Replace `src/lib/authorMatch/normalize.ts` with this content**

```ts
/**
 * Normalize an author name to a canonical "first-or-initial last" lowercase form.
 *
 * Handles surname-first comma form, initial periods, internal whitespace,
 * trailing periods, and Latin diacritics. Korean names are lowercased
 * (no-op for Hangul) and returned without restructuring.
 */
export function normalizeAuthorName(input: string): string {
  let s = input.trim()
  if (!s) return ''

  // Surname-first comma form: "Lee, Heetak" -> "Heetak Lee", "Lee, H." -> "H Lee"
  const commaIdx = s.indexOf(',')
  if (commaIdx !== -1) {
    const before = s.slice(0, commaIdx).trim()
    const after = s.slice(commaIdx + 1).trim()
    if (before && after) s = `${after} ${before}`
  }

  // Strip diacritics on Latin characters; leave Hangul/CJK untouched.
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '')

  // Remove periods (initial punctuation).
  s = s.replace(/\./g, '')

  // Collapse runs of dashes/whitespace within initials block.
  // "J-H Choi" -> "JH Choi"  (treat consecutive single-letter tokens as one block).
  s = s.replace(/\b([A-Za-z])-([A-Za-z])\b/g, '$1$2')

  // Collapse "J H Choi" -> "JH Choi": merge consecutive single-letter tokens.
  const tokens = s.split(/\s+/).filter(Boolean)
  const merged: string[] = []
  let initialsBuf = ''
  for (const tok of tokens) {
    if (tok.length === 1 && /[A-Za-z]/.test(tok)) {
      initialsBuf += tok
    } else {
      if (initialsBuf) {
        merged.push(initialsBuf)
        initialsBuf = ''
      }
      merged.push(tok)
    }
  }
  if (initialsBuf) merged.push(initialsBuf)

  return merged.join(' ').toLowerCase().trim()
}
```

- [ ] **Step 2: Run tests to confirm they pass**

Run: `npx vitest run src/lib/authorMatch/normalize.test.ts`
Expected: All 12 tests pass.

If any fails, do not modify the test to match the implementation — fix the implementation. The tests are the spec.

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: existing i18n tests pass + new normalize tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/authorMatch/normalize.ts
git commit -m "feat(author-match): implement normalizeAuthorName

Canonical form: 'first-or-initials last' lowercase, no diacritics,
no periods, collapsed multi-initials. Korean names pass through
lowercased."
```

---

### Task 4: Author matching — write the failing tests

**Files:**
- Create: `src/lib/authorMatch/types.ts`
- Create: `src/lib/authorMatch/match.ts` (stub)
- Create: `src/lib/authorMatch/match.test.ts`

- [ ] **Step 1: Create `src/lib/authorMatch/types.ts`**

```ts
export interface LabAuthor {
  id: string
  name: string
  nameKo?: string
  kind: 'team' | 'alumni'
}

export interface AuthorIndex {
  byNormalized: Map<string, LabAuthor>
}
```

- [ ] **Step 2: Create stub `src/lib/authorMatch/match.ts`**

```ts
import type { AuthorIndex, LabAuthor } from './types'

export function buildAuthorIndex(_authors: LabAuthor[]): AuthorIndex {
  throw new Error('not implemented')
}

export function matchAuthor(_author: string, _index: AuthorIndex): LabAuthor | null {
  throw new Error('not implemented')
}
```

- [ ] **Step 3: Create `src/lib/authorMatch/match.test.ts`**

```ts
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

  it('does NOT match Y Kim to Yeongjun when Youngchul has same initial+surname', () => {
    const ambiguousIdx = buildAuthorIndex([
      YEONGJUN,
      { id: 'younggi-kim', name: 'Younggi Kim', kind: 'team' },
    ])
    // Both Yeongjun and Younggi normalize "Y Kim" - this is ambiguous, so return null.
    expect(matchAuthor('Y Kim', ambiguousIdx)).toBeNull()
  })

  it('DOES match Y Oh to Youngchul Oh (unambiguous)', () => {
    expect(matchAuthor('Y Oh', idx)).toEqual(YOUNGCHUL)
  })

  it('matches case-insensitively', () => {
    expect(matchAuthor('heetak lee', idx)).toEqual(HEETAK)
  })
})
```

- [ ] **Step 4: Run tests to confirm they fail**

Run: `npx vitest run src/lib/authorMatch/match.test.ts`
Expected: All 11 tests fail with "not implemented".

- [ ] **Step 5: Commit failing tests**

```bash
git add src/lib/authorMatch/types.ts src/lib/authorMatch/match.ts src/lib/authorMatch/match.test.ts
git commit -m "test(author-match): write failing tests for buildAuthorIndex + matchAuthor"
```

---

### Task 5: Implement buildAuthorIndex + matchAuthor

**Files:**
- Modify: `src/lib/authorMatch/match.ts`

- [ ] **Step 1: Replace `src/lib/authorMatch/match.ts` with this content**

```ts
import { normalizeAuthorName } from './normalize'
import type { AuthorIndex, LabAuthor } from './types'

/**
 * Build a lookup index from lab authors. Each author is registered under
 * multiple normalized keys: full English name, first-initial + surname,
 * Korean name. If two authors collide on the same key, that key is
 * marked AMBIGUOUS (stored as null) so matchAuthor returns null for it.
 */
export function buildAuthorIndex(authors: LabAuthor[]): AuthorIndex {
  // Two-phase build: collect all key->author mappings, then mark ambiguous keys.
  const collisions = new Map<string, LabAuthor | null>()

  function register(key: string, author: LabAuthor) {
    if (!key) return
    if (collisions.has(key)) {
      const existing = collisions.get(key)
      if (existing && existing.id !== author.id) {
        collisions.set(key, null) // ambiguous
      }
    } else {
      collisions.set(key, author)
    }
  }

  for (const author of authors) {
    // Full name normalized.
    register(normalizeAuthorName(author.name), author)

    // First-initial + surname form.
    const parts = author.name.trim().split(/\s+/)
    if (parts.length >= 2) {
      const initial = parts[0][0]
      const surname = parts[parts.length - 1]
      register(normalizeAuthorName(`${initial} ${surname}`), author)
    }

    if (author.nameKo) {
      register(normalizeAuthorName(author.nameKo), author)
    }
  }

  // Filter ambiguous entries (null) out of the public map.
  const byNormalized = new Map<string, LabAuthor>()
  for (const [key, author] of collisions.entries()) {
    if (author) byNormalized.set(key, author)
  }
  return { byNormalized }
}

export function matchAuthor(author: string, index: AuthorIndex): LabAuthor | null {
  const key = normalizeAuthorName(author)
  if (!key) return null
  return index.byNormalized.get(key) ?? null
}
```

- [ ] **Step 2: Run match tests**

Run: `npx vitest run src/lib/authorMatch/match.test.ts`
Expected: All 11 tests pass.

If "does NOT match Y Kim to Yeongjun when Youngchul has same initial+surname" fails because both authors normalize to "y kim" — debug the registration logic. The collisions Map should mark "y kim" as null (ambiguous) when both Yeongjun-Kim and Younggi-Kim register the same initial form.

- [ ] **Step 3: Run full test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/authorMatch/match.ts
git commit -m "feat(author-match): implement buildAuthorIndex + matchAuthor

Registers each lab author under English fullname, first-initial+surname,
and Korean fullname. Ambiguous keys (multiple authors with the same
initial+surname like Yeongjun Kim vs Younggi Kim) match to null
to avoid false positives."
```

---

### Task 6: Public surface — authorMatch index file

**Files:**
- Create: `src/lib/authorMatch/index.ts`

- [ ] **Step 1: Create `src/lib/authorMatch/index.ts`**

```ts
export { normalizeAuthorName } from './normalize'
export { buildAuthorIndex, matchAuthor } from './match'
export type { LabAuthor, AuthorIndex } from './types'
```

- [ ] **Step 2: Verify import path works**

Run: `npx tsc --noEmit`
Expected: 0 errors.

Run: `node -e "import('./src/lib/authorMatch/index.ts').then(m => console.log(Object.keys(m)))"` is NOT a valid command for TS — skip this check; the typecheck above is sufficient.

- [ ] **Step 3: Commit**

```bash
git add src/lib/authorMatch/index.ts
git commit -m "feat(author-match): public surface re-exports"
```

---

### Task 7: AuthorList component (bold lab authors)

**Files:**
- Create: `src/components/publications/AuthorList.tsx`

- [ ] **Step 1: Create `src/components/publications/AuthorList.tsx`**

```tsx
import type { AuthorIndex } from '@/lib/authorMatch'
import { matchAuthor } from '@/lib/authorMatch'

interface AuthorListProps {
  authors: string[]
  index: AuthorIndex
}

export function AuthorList({ authors, index }: AuthorListProps) {
  return (
    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
      {authors.map((author, i) => {
        const match = matchAuthor(author, index)
        const sep = i === authors.length - 1 ? '' : ', '
        if (match) {
          return (
            <span key={i}>
              <strong style={{ color: 'var(--text-primary)' }}>{author}</strong>
              {sep}
            </span>
          )
        }
        return (
          <span key={i}>
            {author}
            {sep}
          </span>
        )
      })}
    </p>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/publications/AuthorList.tsx
git commit -m "feat(pub): AuthorList component bolds lab authors via matchAuthor"
```

---

### Task 8: CoAuthorChips component (clickable member chips)

**Files:**
- Create: `src/components/publications/CoAuthorChips.tsx`

- [ ] **Step 1: Create `src/components/publications/CoAuthorChips.tsx`**

```tsx
import Link from 'next/link'
import type { AuthorIndex, LabAuthor } from '@/lib/authorMatch'
import { matchAuthor } from '@/lib/authorMatch'

interface CoAuthorChipsProps {
  authors: string[]
  index: AuthorIndex
  /** Exclude these author ids from chips (typically PI is excluded). */
  excludeIds?: string[]
  /** Cap visible chips; overflow shows "+N more". */
  maxVisible?: number
}

export function CoAuthorChips({
  authors,
  index,
  excludeIds = [],
  maxVisible = 3,
}: CoAuthorChipsProps) {
  const excludeSet = new Set(excludeIds)
  const seen = new Set<string>()
  const matched: LabAuthor[] = []

  for (const author of authors) {
    const m = matchAuthor(author, index)
    if (!m) continue
    if (excludeSet.has(m.id)) continue
    if (seen.has(m.id)) continue
    seen.add(m.id)
    matched.push(m)
  }

  if (matched.length === 0) return null

  const visible = matched.slice(0, maxVisible)
  const overflow = matched.length - visible.length

  return (
    <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
      <span>with </span>
      {visible.map((m, i) => {
        const href = m.kind === 'team' ? `/team#${m.id}` : `/alumni#${m.id}`
        const sep = i === visible.length - 1 && overflow === 0 ? '' : ', '
        const firstName = m.name.split(/\s+/)[0]
        return (
          <span key={m.id}>
            <Link
              href={href}
              className="hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              {firstName}
            </Link>
            {sep}
          </span>
        )
      })}
      {overflow > 0 && <span>{`, +${overflow} more`}</span>}
    </p>
  )
}
```

Design notes:
- Chips show first name only (consistent with the joonan reference).
- PI excluded by passing `excludeIds={['heetak-lee']}` from the caller.
- Max 3 visible chips; "+N more" overflow text (no expand menu — keeps it simple).
- Internal `<Link>` deep-links to the member's anchor on `/team` or `/alumni`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/publications/CoAuthorChips.tsx
git commit -m "feat(pub): CoAuthorChips renders clickable first-name chips with overflow"
```

---

### Task 9: TagFilterBar component

**Files:**
- Create: `src/components/publications/TagFilterBar.tsx`

- [ ] **Step 1: Create `src/components/publications/TagFilterBar.tsx`**

```tsx
'use client'

import { TAG_VOCAB } from '@/lib/data/types'
import type { Tag } from '@/lib/data/types'
import { useTranslation } from '@/lib/i18n'

interface TagFilterBarProps {
  active: Tag | null
  onChange: (tag: Tag | null) => void
}

export function TagFilterBar({ active, onChange }: TagFilterBarProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Filter publications by topic">
      <button
        type="button"
        role="tab"
        aria-selected={active === null}
        onClick={() => onChange(null)}
        className="px-3 py-1 rounded-full text-xs transition-colors"
        style={{
          background: active === null ? 'var(--accent)' : 'transparent',
          color: active === null ? '#fbf7ec' : 'var(--text-secondary)',
          border: `1px solid ${active === null ? 'var(--accent)' : 'var(--border)'}`,
        }}
      >
        {t('pubs.tag.all')}
      </button>
      {TAG_VOCAB.map(tag => {
        const isActive = active === tag
        return (
          <button
            key={tag}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tag)}
            className="px-3 py-1 rounded-full text-xs transition-colors"
            style={{
              background: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#fbf7ec' : 'var(--text-secondary)',
              border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {t(`pubs.tag.${tag}`)}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Add tag translation keys**

Edit `data/translations.json`. Add these next to other `pubs.*` keys (you may have to scroll to find them or use the `publications.*` namespace):

```json
  "pubs.tag.all": { "en": "All", "ko": "전체" },
  "pubs.tag.cancer": { "en": "cancer", "ko": "암" },
  "pubs.tag.evolution": { "en": "evolution", "ko": "진화" },
  "pubs.tag.organoids": { "en": "organoids", "ko": "오가노이드" },
  "pubs.tag.regeneration": { "en": "regeneration", "ko": "재생" },
  "pubs.tag.stemcell": { "en": "stem cell", "ko": "줄기세포" },
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/publications/TagFilterBar.tsx data/translations.json
git commit -m "feat(pub): TagFilterBar pill row with 5 tags + All"
```

---

### Task 10: PublicationsCounter component

**Files:**
- Create: `src/components/publications/PublicationsCounter.tsx`

- [ ] **Step 1: Create `src/components/publications/PublicationsCounter.tsx`**

```tsx
'use client'

import { useTranslation } from '@/lib/i18n'

interface PublicationsCounterProps {
  count: number
}

export function PublicationsCounter({ count }: PublicationsCounterProps) {
  const { t } = useTranslation()
  return (
    <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
      {t('pubs.counter', { count })}
    </p>
  )
}
```

- [ ] **Step 2: Add counter translation key**

Edit `data/translations.json`. Add:

```json
  "pubs.counter": {
    "en": "{count} papers in venues including Molecular Cancer, Nucleic Acids Research, and Science Advances.",
    "ko": "{count}편의 논문이 Molecular Cancer, Nucleic Acids Research, Science Advances 등의 학술지에 게재되었습니다."
  },
```

- [ ] **Step 3: Verify i18n `{count}` substitution still works**

Glance at `src/lib/i18n/lookup.ts` to confirm it supports `{key}` interpolation. If `t('pubs.counter', { count: 21 })` doesn't substitute, this requires a small extension to the lookup (likely already supported per the `hero.founded` precedent).

- [ ] **Step 4: Commit**

```bash
git add src/components/publications/PublicationsCounter.tsx data/translations.json
git commit -m "feat(pub): PublicationsCounter renders count + curated venue list"
```

---

### Task 11: PublicationItem component (combines AuthorList + CoAuthorChips + cite line)

**Files:**
- Create: `src/components/publications/PublicationItem.tsx`

- [ ] **Step 1: Create `src/components/publications/PublicationItem.tsx`**

```tsx
'use client'

import { useTranslation } from '@/lib/i18n'
import type { Publication } from '@/lib/data'
import type { AuthorIndex } from '@/lib/authorMatch'
import { AuthorList } from './AuthorList'
import { CoAuthorChips } from './CoAuthorChips'

interface PublicationItemProps {
  pub: Publication
  index: AuthorIndex
  excludeIds?: string[]
}

function isStale(asOf: string | undefined): boolean {
  if (!asOf) return false
  const fetched = new Date(asOf).getTime()
  if (Number.isNaN(fetched)) return false
  const ageDays = (Date.now() - fetched) / (1000 * 60 * 60 * 24)
  return ageDays > 30
}

export function PublicationItem({ pub, index, excludeIds }: PublicationItemProps) {
  const { t } = useTranslation()
  const stale = isStale(pub.citationsAsOf)

  return (
    <li className="py-5" style={{ borderBottom: '1px solid var(--border)' }}>
      <h3
        className="font-serif font-medium text-lg leading-snug mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        {pub.url ? (
          <a href={pub.url} target="_blank" rel="noreferrer" className="hover:underline">
            {pub.title}
          </a>
        ) : (
          pub.title
        )}
      </h3>

      <AuthorList authors={pub.authors} index={index} />

      <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        <em style={{ fontStyle: 'italic' }}>{pub.venue}</em>
        {' · '}
        <span>{pub.year}</span>
        {typeof pub.citations === 'number' && (
          <>
            {' · '}
            <span style={{ opacity: stale ? 0.6 : 1 }}>
              {t('pubs.cited', { n: pub.citations })}
            </span>
          </>
        )}
        {pub.doi && (
          <>
            {' · '}
            <a
              href={`https://doi.org/${pub.doi}`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              DOI →
            </a>
          </>
        )}
      </p>

      <CoAuthorChips authors={pub.authors} index={index} excludeIds={excludeIds} />
    </li>
  )
}
```

- [ ] **Step 2: Add `pubs.cited` translation key**

Edit `data/translations.json`. Add:

```json
  "pubs.cited": { "en": "cited {n}×", "ko": "{n}회 인용" },
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/publications/PublicationItem.tsx data/translations.json
git commit -m "feat(pub): PublicationItem composes title + AuthorList + venue/year/cite + DOI + CoAuthorChips"
```

---

### Task 12: Wire publications page to use new components

**Files:**
- Modify: `src/app/publications/page.tsx` (full rewrite)

- [ ] **Step 1: Replace `src/app/publications/page.tsx` with this content**

```tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { getPublicationsByYear, getTeam, getAlumni } from '@/lib/data'
import type { Tag } from '@/lib/data'
import { TAG_VOCAB } from '@/lib/data/types'
import { buildAuthorIndex } from '@/lib/authorMatch'
import type { LabAuthor } from '@/lib/authorMatch'
import { PageHeader } from '@/components/page/PageHeader'
import { TagFilterBar } from '@/components/publications/TagFilterBar'
import { PublicationsCounter } from '@/components/publications/PublicationsCounter'
import { PublicationItem } from '@/components/publications/PublicationItem'

const PI_ID = 'heetak-lee'

function isTag(s: string | null): s is Tag {
  return s !== null && (TAG_VOCAB as readonly string[]).includes(s)
}

function readTagFromHash(): Tag | null {
  if (typeof window === 'undefined') return null
  const m = window.location.hash.match(/tag=([a-z]+)/)
  return m && isTag(m[1]) ? m[1] : null
}

export default function PublicationsPage() {
  const { t } = useTranslation()
  const byYear = getPublicationsByYear()
  const allPubs = byYear.flatMap(g => g.items)

  const labAuthors: LabAuthor[] = useMemo(() => {
    const team = getTeam().map(m => ({
      id: m.id,
      name: m.name,
      nameKo: m.nameKo,
      kind: 'team' as const,
    }))
    const alumni = getAlumni().map(m => ({
      id: m.id,
      name: m.name,
      nameKo: m.nameKo,
      kind: 'alumni' as const,
    }))
    return [...team, ...alumni]
  }, [])

  const authorIndex = useMemo(() => buildAuthorIndex(labAuthors), [labAuthors])

  const [active, setActive] = useState<Tag | null>(null)

  // Read tag from URL hash on mount and on hashchange.
  useEffect(() => {
    setActive(readTagFromHash())
    const onHash = () => setActive(readTagFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const handleChange = (tag: Tag | null) => {
    setActive(tag)
    const nextHash = tag ? `#tag=${tag}` : ''
    if (typeof window !== 'undefined') {
      const url = window.location.pathname + window.location.search + nextHash
      window.history.replaceState(null, '', url)
    }
  }

  const filteredByYear = active
    ? byYear
        .map(g => ({ year: g.year, items: g.items.filter(p => p.tags?.includes(active)) }))
        .filter(g => g.items.length > 0)
    : byYear

  return (
    <>
      <PageHeader title={t('publications.title')} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <PublicationsCounter count={allPubs.length} />
        <TagFilterBar active={active} onChange={handleChange} />

        {filteredByYear.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
            {t('publications.empty')}
          </p>
        ) : (
          <div className="space-y-12">
            {filteredByYear.map(({ year, items }) => (
              <section key={year}>
                <h2
                  className="font-serif font-medium text-2xl mb-2 tabular-nums"
                  style={{ color: 'var(--accent)' }}
                >
                  {year}
                </h2>
                <ul>
                  {items.map(pub => (
                    <PublicationItem
                      key={pub.id}
                      pub={pub}
                      index={authorIndex}
                      excludeIds={[PI_ID]}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
```

Design notes:
- Filter state is `useState<Tag | null>(null)` synced both ways with URL hash (`#tag=cancer`).
- PI is excluded from co-author chips via `excludeIds={['heetak-lee']}`.
- Counter shows `allPubs.length` regardless of active filter.
- Empty filtered result shows the same "empty" copy as a completely empty list.

- [ ] **Step 2: Run dev server**

Run: `npm run dev`
Open `/publications`. Until Task 14 populates tags/citations, the page renders WITHOUT any visible tags or citation counts (filtering on tags shows empty since no publication has tags yet — that's fine and will be fixed after fetcher run).

Expected immediately:
- Counter line "21 papers in venues including Molecular Cancer..." renders
- Tag filter bar shows 6 pills (All, cancer, evolution, organoids, regeneration, stemcell)
- Year sections render
- Each publication shows: title, authors with **Heetak Lee** bolded (and any new lab member bolded), venue, year, DOI link
- Co-author chips appear if any current/alumni members co-authored a paper (e.g. Youngchul, Yeongjun, Onyu, Yejin should match)
- Clicking a tag yields empty list (no `tags` field on entries yet)
- Clicking "All" restores list
- URL hash updates as you click tags

- [ ] **Step 3: Verify hash deep-link**

Visit `/publications#tag=cancer` directly. Expected: page loads with `cancer` tag active (and empty list, until Task 14).

- [ ] **Step 4: Verify co-author chip link**

Click a chip (e.g. "Youngchul"). Expected: navigates to `/team#youngchul-oh` and scrolls his card into view.

- [ ] **Step 5: Run typecheck and build**

Run: `npx tsc --noEmit && npm run build`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add src/app/publications/page.tsx
git commit -m "feat(pub): wire up new publications page

Tag filter (URL-hash-synced), counter, bold lab authors, co-author
chips, citation slot (populated by fetcher in next task)."
```

---

### Task 13: Extend fetcher with OpenAlex citations + tag inference

**Files:**
- Modify: `scripts/fetch-publications.ts`

- [ ] **Step 1: Add OpenAlex enrichment and tag inference to fetch-publications.ts**

Edit `scripts/fetch-publications.ts`. The existing file structure stays intact; we add two new helper functions and a new processing pass.

First, update the `Publication` type local declaration (around line 38) to match the lib type:

```ts
type Tag = 'cancer' | 'evolution' | 'organoids' | 'regeneration' | 'stemcell'

interface Publication {
  id: string
  title: string
  authors: string[]
  venue: string
  year: number
  doi?: string
  url?: string
  preprint?: string
  tags?: Tag[]
  citations?: number
  citationsAsOf?: string
  manualTags?: boolean
}
```

Add these new helpers immediately after the existing `authorsFromCrossref` function (around line 112):

```ts
interface OpenAlexWork {
  cited_by_count?: number | null
}

async function fetchOpenAlexCitations(doi: string): Promise<number | null> {
  try {
    const url = `https://api.openalex.org/works/doi:${encodeURIComponent(doi)}`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return null
    const json = (await res.json()) as OpenAlexWork
    return typeof json.cited_by_count === 'number' ? json.cited_by_count : null
  } catch {
    return null
  }
}

interface SemanticScholarWork {
  citationCount?: number | null
}

async function fetchSemanticScholarCitations(doi: string): Promise<number | null> {
  try {
    const url = `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(doi)}?fields=citationCount`
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return null
    const json = (await res.json()) as SemanticScholarWork
    return typeof json.citationCount === 'number' ? json.citationCount : null
  } catch {
    return null
  }
}

async function fetchCitations(doi: string): Promise<number | null> {
  const openalex = await fetchOpenAlexCitations(doi)
  if (openalex !== null) return openalex
  return fetchSemanticScholarCitations(doi)
}

const TAG_RULES: Array<{ tag: Tag; pattern: RegExp }> = [
  { tag: 'organoids', pattern: /\borganoid/i },
  { tag: 'cancer', pattern: /\b(cancer|tumor|tumour|carcinoma|oncolog|metasta)/i },
  { tag: 'stemcell', pattern: /\b(stem[\s-]?cell|ipsc|pluripotent|niche|self[-\s]?renew)/i },
  { tag: 'regeneration', pattern: /\b(regenerat)/i },
  { tag: 'evolution', pattern: /\b(evolution|phylogen|species|lineage|conserv|divergen)/i },
]

function inferTags(title: string, venue: string): Tag[] {
  const haystack = `${title} ${venue}`
  const tags: Tag[] = []
  for (const { tag, pattern } of TAG_RULES) {
    if (pattern.test(haystack)) tags.push(tag)
  }
  return tags
}

function loadExistingPublications(path: string): Map<string, Publication> {
  try {
    const existing = JSON.parse(readFileSync(path, 'utf8')) as { items?: Publication[] }
    const map = new Map<string, Publication>()
    for (const p of existing.items ?? []) map.set(p.id, p)
    return map
  } catch {
    return new Map()
  }
}
```

Now extend `main()` to use these. Find the section that pushes `Publication` entries (around lines 150-173). After the `publications.sort(...)` line (around line 176), and BEFORE the `out = { items: publications, ... }` block, insert the enrichment pass:

```ts
  // Enrichment pass: citations + tag inference, preserving manual tags.
  const existing = loadExistingPublications(OUT_PATH)
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  for (const pub of publications) {
    const prev = existing.get(pub.id)

    // Citations (skip if no DOI).
    if (pub.doi) {
      const n = await fetchCitations(pub.doi)
      if (n !== null) {
        pub.citations = n
        pub.citationsAsOf = today
      } else if (prev?.citations !== undefined) {
        // Preserve previous count if both providers miss this run.
        pub.citations = prev.citations
        pub.citationsAsOf = prev.citationsAsOf
      }
    }

    // Tags: respect manualTags flag.
    if (prev?.manualTags) {
      pub.tags = prev.tags
      pub.manualTags = true
    } else {
      const inferred = inferTags(pub.title, pub.venue)
      if (inferred.length > 0) pub.tags = inferred
    }
  }
```

- [ ] **Step 2: Run the fetcher**

Run: `npm run fetch-publications`
Expected output:
- ORCID list returns ~21 works
- Crossref enriches each (existing behavior)
- New: for each DOI, OpenAlex lookup returns a citation count (or falls back to Semantic Scholar; misses logged silently)
- New: tag inference assigns tags based on title/venue keywords
- File `data/publications.json` is rewritten

This step is network-dependent. If OpenAlex is rate-limited (HTTP 429), wait 60 seconds and retry. The fetcher does not parallelize, so it takes ~1-2 minutes for 21 papers.

- [ ] **Step 3: Spot-check the output**

Run: `head -80 data/publications.json`
Expected: First publication entry now includes `"tags": [...]` and `"citations": N` and `"citationsAsOf": "2026-05-27"` (or whatever today's date is).

Run: `jq '[.items[] | select(.citations == null)] | length' data/publications.json`
Expected: small number (papers OpenAlex doesn't have). Acceptable.

Run: `jq '[.items[] | select(.tags == null or (.tags | length == 0))] | length' data/publications.json`
Expected: small number (papers no rule matched — PI can manually tag these later).

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`. Open `/publications`. Now each publication shows `cited N×`. Tag filter pills work — clicking "cancer" filters to cancer-tagged publications.

- [ ] **Step 5: Commit fetcher changes**

```bash
git add scripts/fetch-publications.ts
git commit -m "feat(fetcher): add OpenAlex citations + Semantic Scholar fallback + tag inference

OpenAlex /works/doi:<DOI> -> cited_by_count, falls back to Semantic
Scholar. Tag inference is a keyword pass over title+venue; manualTags:
true on a publication preserves PI hand-edits across re-runs. Previous
citations are preserved when both providers miss."
```

- [ ] **Step 6: Commit refreshed publications.json**

```bash
git add data/publications.json
git commit -m "data(pub): re-fetch with citations + tags"
```

---

### Task 14: PI hand-tag refinement pass

**Files:**
- Modify: `data/publications.json` (selective hand-edits)

This task is performed by the PI (Heetak Lee), not the implementing engineer. The engineer's role is to make the hand-edits the PI specifies. If the PI is unavailable when this plan executes, skip this task and ship; the PI can do this pass post-launch.

- [ ] **Step 1: Show the PI the current tag distribution**

Run:
```bash
jq -r '.items[] | "\(.tags // [] | join(",")) | \(.year) | \(.title)"' data/publications.json | sort
```
Expected: a list, one line per publication, showing inferred tags + title + year.

- [ ] **Step 2: PI reviews the list and identifies edits**

PI says e.g.: "paper X should also be tagged `stemcell`; paper Y is wrongly tagged `cancer`, remove that."

- [ ] **Step 3: For each PI-specified edit, modify `data/publications.json` and set `manualTags: true`**

For each entry the PI hand-corrects, edit the JSON entry to set `"tags": [...]` to the correct list, and add `"manualTags": true`. The `manualTags` flag prevents the next fetcher run from overwriting the hand edit.

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`. Open `/publications`. Click each tag and confirm filter content matches PI expectation.

- [ ] **Step 5: Commit**

```bash
git add data/publications.json
git commit -m "data(pub): PI hand-tag refinement pass

Manually adjusted tags on N publications marked with manualTags: true
so future fetcher runs preserve the edits."
```

---

### Task 15: Smoke test, build, deploy

**Files:**
- (none — verification only)

- [ ] **Step 1: Final smoke test**

Run: `npm run dev`. Walk this checklist:

1. `/publications` — counter line shows "21 papers in venues including..." (or whatever count is in `data/publications.json`)
2. Click each tag pill: filter narrows the list, year sections with no matching papers disappear
3. Click "All": full list returns
4. Open `/publications#tag=organoids` directly: page loads with `organoids` tab active
5. Click a co-author chip: navigates to `/team#<id>` and scrolls into view
6. Inspect any publication that includes "Heetak Lee" or a current member in its author list: name is rendered bold
7. Inspect citation slot: `cited Nx` appears (where Nx is a number) for papers OpenAlex returned
8. Toggle to Korean locale: tag pills show Korean labels; counter switches to Korean form; "cited Nx" becomes "N회 인용"; "with X, Y" segment renders without breaking
9. Toggle to dark theme: chips and tag pills remain readable; sage accent stays visible

- [ ] **Step 2: Run tests + typecheck + build**

```bash
npm test && npx tsc --noEmit && npm run build
```
Expected: all three succeed. Tests: existing i18n + new authorMatch (~23 tests total).

- [ ] **Step 3: Push and watch deploy**

```bash
git push origin main
gh run watch
```

- [ ] **Step 4: Verify production**

Open `https://leo-laboratory.github.io/publications` and confirm everything works the same as in dev.

If something is broken, debug and push a follow-up commit.

---

## Self-review

**Spec coverage:**
- Topic-tag filter bar (5 tags) — Tasks 1, 9, 12
- Headline counter line with curated venue list — Tasks 10, 12
- Bold lab-author names — Tasks 2-5 (authorMatch), 7 (AuthorList), 12 (page wires it)
- Lab-member co-author chips, clickable, capped at 3 + overflow — Task 8
- Citation counts via OpenAlex (Semantic Scholar fallback) — Task 13
- Citation staleness dimming after 30 days — Task 11 (`isStale` helper)
- Tag inference (keyword pass) — Task 13
- Hybrid tags (PI hand-edits preserved via manualTags) — Tasks 13, 14
- URL hash deep-linking for tags — Task 12
- Translations for all new UI strings — Tasks 9, 10, 11
- Tests for authorMatch — Tasks 2, 4

**Placeholder scan:** Every code block is complete. Task 14 is partly a manual PI step, which is a real workflow rather than a placeholder.

**Type consistency:**
- `Tag` and `TAG_VOCAB` defined in Task 1, re-used in Tasks 9, 12, 13
- `LabAuthor` defined in Task 4, used in Tasks 7, 8, 11, 12
- `AuthorIndex` defined in Task 4, returned by `buildAuthorIndex` (Task 5), consumed by `matchAuthor` (Task 5) and components (Tasks 7, 8, 11)
- `Publication` extended in Task 1, consumed in Tasks 11, 12; fetcher uses local mirror in Task 13 (intentional - the fetcher runs as a Node script and can't easily import the lib types via `@/` paths)

**Phase 1 dependency check:** Co-author chips link to `/team#<id>` and `/alumni#<id>`. These anchors are set up in Phase 1, Tasks 11 and 12. If Phase 2 runs against a tree that has not merged Phase 1, the chips render but the anchors do nothing.

**Risks flagged in spec, addressed in plan:**
- OpenAlex misses → Task 13 falls back to Semantic Scholar, then preserves prior `citations` value from existing file
- Romanization variants → Task 4-5 tests + ambiguity-suppression in `buildAuthorIndex`
- Manual tag edits not overwritten → Task 13 reads existing `manualTags: true` flag
