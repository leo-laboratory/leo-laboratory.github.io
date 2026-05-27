import Link from 'next/link'
import type { AuthorIndex, LabAuthor } from '@/lib/authorMatch'
import { matchAuthor } from '@/lib/authorMatch'

interface CoAuthorChipsProps {
  authors: string[]
  index: AuthorIndex
  excludeIds?: string[]
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
        const href = m.kind === 'team' ? `/team/#${m.id}` : `/alumni/#${m.id}`
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
