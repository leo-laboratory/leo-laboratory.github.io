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
