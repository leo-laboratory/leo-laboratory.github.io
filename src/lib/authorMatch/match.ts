import { normalizeAuthorName } from './normalize'
import type { AuthorIndex, LabAuthor } from './types'

/**
 * Build a lookup index from lab authors. Each author is registered under
 * multiple normalized keys: full English name, first-initial + surname,
 * Korean name. If two authors collide on the same key, that key is
 * dropped from the index so matchAuthor returns null for it.
 */
export function buildAuthorIndex(authors: LabAuthor[]): AuthorIndex {
  const collisions = new Map<string, LabAuthor | null>()

  function register(key: string, author: LabAuthor) {
    if (!key) return
    const existing = collisions.get(key)
    if (existing === undefined) {
      collisions.set(key, author)
    } else if (existing && existing.id !== author.id) {
      collisions.set(key, null)
    }
  }

  for (const author of authors) {
    register(normalizeAuthorName(author.name), author)

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
