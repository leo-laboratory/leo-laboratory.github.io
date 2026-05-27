export interface LabAuthor {
  id: string
  name: string
  nameKo?: string
  kind: 'team' | 'alumni'
}

export interface AuthorIndex {
  byNormalized: Map<string, LabAuthor>
}
