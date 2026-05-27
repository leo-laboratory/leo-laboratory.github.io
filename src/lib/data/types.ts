export interface Bilingual {
  en: string
  ko?: string
}

export type RoleId = 'pi' | 'integrative' | 'phd' | 'master' | 'project' | 'undergrad'

export interface TeamMember {
  id: string
  name: string
  nameKo?: string
  role: RoleId
  title: Bilingual
  affiliations: Bilingual[]
  bio: Bilingual
  photo?: string
  orcid?: string
  scholar?: string
  email?: string
  joined?: string
  hasPhoto?: boolean
}

export interface AlumniMember {
  id: string
  name: string
  nameKo?: string
  formerRole: RoleId
  period: string
  currentPosition: Bilingual
  photo?: string
  hasPhoto?: boolean
}

export interface ResearchArea {
  id: string
  title: Bilingual
  summary: Bilingual
  accent: 'emerald' | 'amber'
}

export interface NewsItem {
  id: string
  date: string
  title: Bilingual
  body: Bilingual
}

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

export interface PublicationsByYear {
  year: number
  items: Publication[]
}

export interface LabMeta {
  name: Bilingual
  fullName: Bilingual
  founded: number
  tagline: Bilingual
  pi: {
    name: string
    nameKo: string
    credentials: string
    primaryAffiliation: Bilingual
    appointments: Array<{
      title: Bilingual
      institution: Bilingual
      primary: boolean
    }>
    orcid: string
    scholarId: string
    emails: string[]
  }
  address: {
    room: string
    line: Bilingual
    city: Bilingual
    postal: string
    country: Bilingual
  }
}

export interface RoleSpec {
  id: RoleId
  order: number
}
