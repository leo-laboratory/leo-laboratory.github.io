import labJson from '@data/lab.json'
import teamJson from '@data/team.json'
import alumniJson from '@data/alumni.json'
import researchJson from '@data/research.json'
import newsJson from '@data/news.json'
import publicationsJson from '@data/publications.json'

import type {
  AlumniMember,
  LabMeta,
  NewsItem,
  Publication,
  PublicationsByYear,
  ResearchArea,
  RoleId,
  RoleSpec,
  TeamMember,
} from './types'

export function getLabMeta(): LabMeta {
  return labJson as LabMeta
}

export function getTeam(): TeamMember[] {
  return (teamJson.members as TeamMember[]).slice()
}

export function getRoles(): RoleSpec[] {
  return (teamJson.roles as RoleSpec[]).slice().sort((a, b) => a.order - b.order)
}

export function getTeamByRole(): Array<{ role: RoleId; members: TeamMember[] }> {
  const members = getTeam()
  return getRoles().map(({ id }) => ({
    role: id,
    members: members.filter(m => m.role === id),
  }))
}

export function getAlumni(): AlumniMember[] {
  return (alumniJson.members as AlumniMember[]).slice()
}

export function getResearchAreas(): ResearchArea[] {
  return (researchJson.areas as ResearchArea[]).slice()
}

export function getNews(limit?: number): NewsItem[] {
  const sorted = (newsJson.items as NewsItem[])
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

export function getPublications(limit?: number): Publication[] {
  const sorted = (publicationsJson.items as Publication[])
    .slice()
    .sort((a, b) => b.year - a.year)
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}

export function getPublicationsByYear(): PublicationsByYear[] {
  const byYear = new Map<number, Publication[]>()
  for (const pub of getPublications()) {
    const list = byYear.get(pub.year) ?? []
    list.push(pub)
    byYear.set(pub.year, list)
  }
  return Array.from(byYear.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, items]) => ({ year, items }))
}

export * from './types'
