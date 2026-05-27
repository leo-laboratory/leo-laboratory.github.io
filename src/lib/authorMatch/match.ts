import type { AuthorIndex, LabAuthor } from './types'

export function buildAuthorIndex(_authors: LabAuthor[]): AuthorIndex {
  throw new Error('not implemented')
}

export function matchAuthor(_author: string, _index: AuthorIndex): LabAuthor | null {
  throw new Error('not implemented')
}
