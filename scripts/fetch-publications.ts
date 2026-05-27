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

interface Publication {
  id: string
  title: string
  authors: string[]
  venue: string
  year: number
  doi?: string
  url?: string
  preprint?: string
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

  const out = {
    items: publications,
    lastUpdated: new Date().toISOString(),
    source: `Auto-extracted from ORCID ${orcid} + Crossref enrichment.`,
  }
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 2))
  console.log(`✓ Wrote ${publications.length} publications to data/publications.json`)
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
