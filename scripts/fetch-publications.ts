#!/usr/bin/env tsx
/**
 * Fetches publications from ORCID Public API + enriches with Crossref metadata.
 * Writes the result to data/publications.json.
 *
 * Run: npm run fetch-publications
 *
 * Reads ORCID from data/lab.json -> pi.orcid.
 * For each work with a DOI, queries Crossref to get the full author list.
 * Falls back to ORCID title/venue/year-only when Crossref lookup fails.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface LabFile {
  pi: { orcid: string; name: string }
}

interface OrcidWorkSummary {
  title?: { title?: { value?: string } }
  'journal-title'?: { value?: string }
  type?: string
  'publication-date'?: { year?: { value?: string } }
  'external-ids'?: {
    'external-id'?: Array<{
      'external-id-type'?: string
      'external-id-value'?: string
    }>
  }
  'put-code'?: number
}

interface OrcidWorksResponse {
  group?: Array<{ 'work-summary'?: OrcidWorkSummary[] }>
}

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

const PROJECT_ROOT = resolve(import.meta.dirname, '..')
const LAB_PATH = resolve(PROJECT_ROOT, 'data', 'lab.json')
const OUT_PATH = resolve(PROJECT_ROOT, 'data', 'publications.json')

const ORCID_BASE = 'https://pub.orcid.org/v3.0'
const CROSSREF_BASE = 'https://api.crossref.org/works'

const HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'LEOLab-Website/0.1 (mailto:leeheetak@ibs.re.kr)',
} as const

async function fetchOrcidWorks(orcid: string): Promise<OrcidWorkSummary[]> {
  const url = `${ORCID_BASE}/${orcid}/works`
  console.log(`→ ORCID: ${url}`)
  const res = await fetch(url, { headers: HEADERS })
  if (!res.ok) throw new Error(`ORCID returned ${res.status}: ${res.statusText}`)
  const data = (await res.json()) as OrcidWorksResponse
  const summaries: OrcidWorkSummary[] = []
  for (const group of data.group ?? []) {
    const ws = group['work-summary']?.[0]
    if (ws) summaries.push(ws)
  }
  return summaries
}

interface CrossrefMessage {
  title?: string[]
  'container-title'?: string[]
  author?: Array<{ given?: string; family?: string; name?: string }>
  issued?: { 'date-parts'?: number[][] }
  DOI?: string
  URL?: string
}

async function fetchCrossref(doi: string): Promise<CrossrefMessage | null> {
  try {
    const res = await fetch(`${CROSSREF_BASE}/${encodeURIComponent(doi)}`, { headers: HEADERS })
    if (!res.ok) return null
    const json = (await res.json()) as { message: CrossrefMessage }
    return json.message
  } catch {
    return null
  }
}

function extractDoi(summary: OrcidWorkSummary): string | undefined {
  const ids = summary['external-ids']?.['external-id'] ?? []
  const doi = ids.find(x => x['external-id-type']?.toLowerCase() === 'doi')
  return doi?.['external-id-value']
}

function extractYear(summary: OrcidWorkSummary): number | undefined {
  const y = summary['publication-date']?.year?.value
  return y ? Number(y) : undefined
}

function authorsFromCrossref(msg: CrossrefMessage): string[] {
  return (msg.author ?? []).map(a => {
    if (a.name) return a.name
    const parts = [a.given, a.family].filter(Boolean)
    return parts.join(' ')
  })
}

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

async function main() {
  const lab = JSON.parse(readFileSync(LAB_PATH, 'utf8')) as LabFile
  const orcid = lab.pi.orcid
  const piName = lab.pi.name

  if (!orcid) {
    console.error('No ORCID found in data/lab.json (pi.orcid)')
    process.exit(1)
  }

  console.log(`Fetching publications for ${piName} (ORCID: ${orcid})`)
  const works = await fetchOrcidWorks(orcid)
  console.log(`  ORCID returned ${works.length} work(s)`)

  const publications: Publication[] = []
  for (const w of works) {
    const title = w.title?.title?.value?.trim()
    const year = extractYear(w)
    const doi = extractDoi(w)
    const venueFromOrcid = w['journal-title']?.value?.trim()
    if (!title || !year) continue

    let authors: string[] = [piName]
    let venue = venueFromOrcid ?? ''
    let url: string | undefined

    if (doi) {
      const cr = await fetchCrossref(doi)
      if (cr) {
        const crAuthors = authorsFromCrossref(cr)
        if (crAuthors.length > 0) authors = crAuthors
        const crVenue = cr['container-title']?.[0]
        if (crVenue) venue = crVenue
        if (cr.URL) url = cr.URL
        const crYear = cr.issued?.['date-parts']?.[0]?.[0]
        if (crYear) {
          publications.push({
            id: doi,
            title,
            authors,
            venue,
            year: crYear,
            doi,
            url,
          })
          continue
        }
      }
    }

    const id = doi ?? `${title.slice(0, 40)}-${year}`.replace(/\s+/g, '-').toLowerCase()
    publications.push({
      id,
      title,
      authors,
      venue,
      year,
      doi,
      url,
    })
  }

  publications.sort((a, b) => b.year - a.year)

  // Enrichment pass: OpenAlex citations + tag inference. Preserves manualTags.
  const existing = loadExistingPublications(OUT_PATH)
  const today = new Date().toISOString().slice(0, 10)
  let cited = 0
  let tagged = 0

  for (const pub of publications) {
    const prev = existing.get(pub.id)

    if (pub.doi) {
      const n = await fetchCitations(pub.doi)
      if (n !== null) {
        pub.citations = n
        pub.citationsAsOf = today
        cited++
      } else if (prev?.citations !== undefined) {
        pub.citations = prev.citations
        pub.citationsAsOf = prev.citationsAsOf
      }
    }

    if (prev?.manualTags) {
      pub.tags = prev.tags
      pub.manualTags = true
    } else {
      const inferred = inferTags(pub.title, pub.venue)
      if (inferred.length > 0) {
        pub.tags = inferred
        tagged++
      }
    }
  }

  console.log(`  Citations fetched for ${cited}/${publications.length} publications`)
  console.log(`  Tags inferred for ${tagged}/${publications.length} publications`)

  const out = {
    items: publications,
    lastUpdated: new Date().toISOString(),
    source: `Auto-extracted from ORCID ${orcid} + Crossref enrichment + OpenAlex citations + keyword tag inference.`,
  }
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2))
  console.log(`✓ Wrote ${publications.length} publications to data/publications.json`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
