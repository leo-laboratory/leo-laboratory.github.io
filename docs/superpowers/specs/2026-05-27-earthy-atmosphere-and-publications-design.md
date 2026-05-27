# Design: Earthy Atmosphere, New Members, Joonan-Style Publications

**Status:** approved-in-brainstorm · pending PI spec review
**Created:** 2026-05-27
**Owner:** Heetak Lee (leeheetak@ibs.re.kr)
**Reference:** https://joonanlab.github.io/publications (visual reference only — no code copied)

## Problem Statement

The LEO Lab site (https://leo-laboratory.github.io/) shipped in 2026-05 as a clean Next.js scaffold with an emerald + amber palette, a procedural phylogenetic-tree SVG hero, and a single team member (the PI). Three problems block the site from feeling like a finished home for the lab:

1. **Atmosphere.** The current palette and the kinetic phylogenetic-tree hero read as "tech-y" rather than "literary natural-history lab." The PI wants a warmer, more editorial atmosphere that signals "evolutionary biology" through restraint rather than animation.
2. **People.** Six lab members and one alumna are missing from `data/team.json` / `data/alumni.json`. Visitors land on `/team` and see only the PI.
3. **Publications.** The page is a flat year-grouped list. It is missing the affordances that make `joonanlab.github.io/publications` useful at a glance: topic-tag filter, headline counter, bold lab-author names, lab-member co-author chips, and citation counts.

## Solution

Ship the work in **two phases** so atmosphere lands first and can be iterated on before the heavier publications work is built.

- **Phase 1 — `feat: earthy atmosphere + new members`** (one PR):
  Replace the design-token layer with an "earthy" palette (sage + clay + cream) in light and dark modes. Swap Inter-only typography for **Cormorant Garamond** (display serif) + **Inter** (UI/body) + **Noto Sans KR** (Korean). Replace `<PhyloTreeHero />` with a static `<TypographicHero />`. Restyle every existing page (10 routes) under the new tokens. Add the 6 new members to `data/team.json` and 1 alumna to `data/alumni.json`. Add a typographic-initials fallback to `<MemberCard>` so missing photo files don't break the build.
- **Phase 2 — `feat: publications page features`** (separate PR):
  Add a single-select topic-tag filter bar with 5 tags (`cancer`, `evolution`, `organoids`, `regeneration`, `stemcell`); a static-but-count-derived counter line ("21 papers in venues including Molecular Cancer, Nucleic Acids Research, and Science Advances"); bold lab-author names; clickable lab-member co-author chips that link to member profiles; and citation counts sourced from **OpenAlex**. Extend `scripts/fetch-publications.ts` with an OpenAlex enrichment step and a keyword-based tag-inference pass that produces seeds the PI then refines by hand.

Both phases ship via the existing GitHub Actions workflow on push to `main`.

## Decisions Made During Brainstorming

| # | Decision | Picked | Alternatives considered |
|---|----------|--------|------------------------|
| 1 | Atmosphere direction | **B · Organic / earthy** (sage + clay + cream) | Editorial monochrome; Scientific dark; Refined current emerald |
| 2 | Typography pairing | **α · Cormorant Garamond + Inter** | Fraunces + Source Serif; DM Sans only |
| 3 | Hero element | **iii · Typographic only** (drop the illustration) | Restyled phylo tree; Botanical/herbarium illustration |
| 4 | Dark mode | **B · Earthy dark** (deep forest, brown-black, cream text) | Drop dark mode; keep current emerald dark unchanged |
| 5 | Tag filter | **Yes** (5 tags: cancer / evolution / organoids / regeneration / stemcell) | No filter; per-paper topic chips without filter |
| 6 | ★ Featured marker | **No** | Yes |
| 7 | Preprint label | **No** | Yes |
| 8 | Headline counter line | **Yes** with hand-curated venue list | Auto-top-3 venues; no counter |
| 9 | Bold lab-author names | **Yes** | Plain weight; underlined; color-tinted |
| 10 | Extra features (PDF / citations / Altmetric / co-author tags) | **Citation counts + Co-author chips** | PDF links; Altmetric |
| 11 | Citation source | **OpenAlex** | Semantic Scholar; Google Scholar scrape |
| 12 | Tag assignment | **Hybrid** — keyword inference seeds, PI refines | Manual only; auto only |
| 13 | Co-author chips | **Clickable** → member profile | Plain text |
| 14 | Implementation phasing | **Two phases** (atmosphere+members → publications) | Big-bang single PR; three-phase split |

## Atmosphere (Phase 1)

### Design tokens

**Light theme ("earthy day"):**
- `--bg-base` `#f5efe2` — warm cream
- `--bg-elevated` `#fbf7ec` — slightly lighter cream for cards
- `--text-primary` `#2d2820` — dark cocoa
- `--text-muted` `#5d513c` — warm brown
- `--accent-sage` `#6a7d4a` — primary; links, italic emphasis words, sage chips
- `--accent-clay` `#8a6a3a` — secondary; CTA buttons, leaf accents
- `--rule` `#d8cdb3` — hairline dividers

**Dark theme ("earthy night"):**
- `--bg-base` `#1c1a14` — deep forest-brown
- `--bg-elevated` `#26221a`
- `--text-primary` `#f0e7d2` — cream
- `--text-muted` `#a89978`
- `--accent-sage` `#9bb074` — lifted for contrast
- `--accent-clay` `#d9a868`
- `--rule` `#3a342a`

Tokens live in `src/styles/tokens.css` as CSS custom properties on `:root[data-theme="light"]` and `:root[data-theme="dark"]`. Tailwind utilities read them via arbitrary-value syntax (`bg-[var(--bg-base)]`).

### Typography

- **Display:** Cormorant Garamond (weights 400/500, italic 400/500), loaded via `next/font/google`.
- **UI/body:** Inter (300/400/500/600), already loaded.
- **Korean:** Noto Sans KR (300/400/500/600), already loaded.
- **Mono:** system mono stack (used sparingly for identifiers, e.g. ORCID).

**Type scale:**
- H1 (hero) — 48–64 px Cormorant 500, letter-spacing −0.015 em
- H2 — 28–32 px Cormorant 500
- H3 — 20–22 px Cormorant 500
- Body — 15–16 px Inter 400, line-height 1.55
- Label — 11 px Inter 600, uppercase, letter-spacing 0.18 em
- Korean body — same px, Noto Sans KR 400

**Cormorant + Hangul fallback note:** Cormorant has no Hangul glyphs. Bilingual headlines fall through to Noto Sans KR, producing a serif/sans mix. Acceptable per PI; flagged here so future contributors aren't surprised.

### Layout & density

- Main content max-width 1080 px.
- Reading-heavy pages (member profiles, future Notes posts) max-width 720 px.
- Section vertical spacing 80–120 px.
- Vertical rhythm 1.55.
- Generous whitespace; the page should feel like a printed monograph, not a dashboard.

### Motion

- Static by default. No phylo-tree animation (it's gone).
- One subtle interaction: link hover grows the underline + tints toward `--accent-sage`. CSS only, ~150 ms.
- All motion respects `prefers-reduced-motion: reduce`.

### Hero

`<TypographicHero />` replaces `<PhyloTreeHero />`. Layout:

```
[ LEO LAB · Lee's Evolution & Omics · est. 2023 ]   (small Inter label)

Omics for
*understanding* evolution.                          (large Cormorant, italic word in sage)

A computational + experimental biology group at
the IBS Center for Genome Engineering — Daejeon.    (Inter body)
```

Pure JSX. No SVG. No `requestAnimationFrame`. `lib/phyloTree` and its tests are **deleted**.

### Header / footer

`<LabHeader>` and `<LabFooter>` keep their surface but get new internals. The cute LEO lion logo stays (32 px in header, 64 px in footer). Nav links: Home · Research · Team · Publications · News · Join · Contact · Alumni · Notes · Tools (10 routes).

## Members (Phase 1)

### Existing role buckets (no change)

`pi`, `integrative`, `phd`, `master`, `project`, `undergrad`. (`alumni-link` is a sentinel for the role array; alumni themselves live in `data/alumni.json`.)

### Members to add — `data/team.json`

Under `role: "integrative"`:
- **Youngchul Oh** (오영철) — POSTECH — joined 2023.03 — photo `/assets/team/youngchul.png`
- **Yeongjun Kim** (김영준) — KHU — joined 2024.03 — photo `/assets/team/yeongjun.png`
- **Ohbin Kwon** (권오빈) — KAIST — join date TBD — photo `/assets/team/ohbin.png`

Under `role: "project"` (Project / Adjunct):
- **Chaewon Lee** (이채원) — CNU, Prof. Donghwan Shim — joined 2024.01 — photo `/assets/team/chaewon.png`
- **Onyu Shin** (신온유) — CGE, Dr. Bon-Kyoung Koo — joined 2024.09 — photo `/assets/team/onyu.png`
- **Shaban Muhammed** — DKU, Prof. Eunyu Kim — joined 2026.03 — photo `/assets/team/shaban.png`

### Alumni to add — `data/alumni.json`

- **Yejin Kwak** (곽예진) — Visiting member from PNU (Prof. Jeongbin Park) — 2024.07 to 2025.02 — current position: Karlsruhe Institute of Technology (KIT), Institute for Automation and Applied Informatics (IAI) — photo `/assets/team/yejin.png`

### Schema notes

Each entry gets:
- `id` (kebab-case from English name)
- `name` (English) / `nameKo` (Hangul)
- `role`
- `title.en` / `title.ko` — derived from role + program, e.g. `"Ph.D.–M.S. Integrative Program, POSTECH"` / `"통합과정 박사·석사 (POSTECH)"`
- `affiliations` — single entry naming the home program / advisor
- `joined` — `"YYYY.MM"` string (omit for Ohbin until provided)
- `photo` — `/assets/team/<id>.png`
- `bio.en` / `bio.ko` — empty string (PI fills in later)
- `orcid`, `scholar`, `email` — omitted for now

Alumni get the same shape plus:
- `period` — `"2024.07–2025.02"`
- `currentPosition.en` / `currentPosition.ko`

### `MemberCard` updates

- Bio block hides when `bio.en` is empty.
- Photo `<img>` swaps to a typographic placeholder when the image file is absent. **Detection:** build-time check in `lib/data` (uses `fs.existsSync` against `public/assets/team/<id>.png` while transforming the JSON), which sets a derived `hasPhoto: boolean` on the member. **Placeholder design:** two letters from the English name (e.g. "YO" for Youngchul Oh) in Cormorant 500 centered on `--bg-elevated`, with a 1-px sage rule below at 70% width.
- Empty role buckets stay hidden (already the behavior).

## Publications (Phase 2)

### Page layout

`/publications` becomes a single client island (`"use client"`) wrapping the existing year-grouped list with filter state.

```
─────────────────────────────────────────────────────
Publications
21 papers in venues including Molecular Cancer,
Nucleic Acids Research, and Science Advances.

[●All] [○cancer] [○evolution] [○organoids]
[○regeneration] [○stemcell]
─────────────────────────────────────────────────────

2026 ──────────────────────────────────────────────
  Universal conditional knockout approach to multiple
  species, from fish to human induced pluripotent stem
  cells.
  J-H Choi, J Moon, Y Oh, …, B-K Koo, **H Lee**
  Nucleic Acids Research · 2026 · cited 14×
  with Youngchul · DOI →

2025 ──────────────────────────────────────────────
  …
```

Tag filter is **single-select**. URL sync via hash (`#tag=cancer`) so links deep-link to a filter. "All" clears the hash.

### Data schema additions — `Publication` type

```ts
type Publication = {
  // existing
  id: string;            // DOI
  title: string;
  authors: string[];
  venue: string;
  year: number;
  doi?: string;
  url?: string;
  // new
  tags?: string[];       // subset of TAG_VOCAB
  citations?: number;    // from OpenAlex
  citationsAsOf?: string; // ISO date "YYYY-MM-DD"
  manualTags?: boolean;  // if true, fetcher won't overwrite `tags`
};

const TAG_VOCAB = ["cancer", "evolution", "organoids", "regeneration", "stemcell"] as const;
```

### Counter line

Generated at build time from `publications.json`:
- `count` — `publications.length`
- `venues` — **hand-curated**, hard-coded in `data/translations.json` under `pubs.counter`:
  - en: `"{count} papers in venues including Molecular Cancer, Nucleic Acids Research, and Science Advances."`
  - ko: `"{count}편의 논문이 Molecular Cancer, Nucleic Acids Research, Science Advances 등의 학술지에 게재되었습니다."`

PI edits the venue list directly in `translations.json` as the lab's marquee venues evolve. Format string interpolation handles `{count}`.

### Bold lab-author names — `<AuthorList>`

`<AuthorList authors={pub.authors} labMemberNames={set} />` renders each author in `<span>`, wrapping matches in `<strong>`. Match set is built once at build time from `team.json` + `alumni.json`, both English and Korean forms, expanded into common variants by `lib/authorMatch`.

### Lab-member co-author chips — `<CoAuthorChips>`

After the venue/year line: `with Youngchul, Yeongjun, …` rendered as small chips. Each chip links to `/team#<member-id>` (or `/alumni#<member-id>` for past members). PI excluded — every paper is "his."

- Capped at 3 visible chips; overflow shown as `+2 more` (no menu — just text).
- Chip styling: 11 px Inter 500, `--bg-elevated` background, `--accent-sage` border-bottom on hover.

### Citation counts — OpenAlex

Source: **OpenAlex** (`https://api.openalex.org/works/doi:<DOI>`). Free, no API key. Returns `cited_by_count`. Falls back to Semantic Scholar if OpenAlex misses (404 or `cited_by_count: null`).

**Display:** `cited 14×` after the venue/year line. If `citations` is absent, the slot is omitted entirely (do not show `cited 0×`, which reads as "zero citations" rather than "unknown").

**Staleness:** `citationsAsOf` recorded on every fetch. Counts older than 30 days dim slightly in the UI (subtle, not loud).

### Fetcher upgrades — `scripts/fetch-publications.ts`

Existing flow: ORCID → DOI list → Crossref enrichment → write `publications.json`.

New steps:
1. **OpenAlex enrichment.** For each DOI, GET `/works/doi:<DOI>`. Store `cited_by_count` → `citations`, today's date → `citationsAsOf`. On miss, log and try Semantic Scholar `/graph/v1/paper/DOI:<DOI>?fields=citationCount`. If both miss, leave `citations` undefined.
2. **Tag inference.** Keyword pass over `title` + `venue`:
   - `organoid|organoids` → `organoids`
   - `cancer|tumor|tumour|carcinoma|oncolog` → `cancer`
   - `stem cell|iPSC|pluripotent|niche` → `stemcell`
   - `regeneration|regenerat` → `regeneration`
   - `evolution|phylogen|species|lineage` → `evolution`
   - Multi-tag entries allowed.
   - If `manualTags: true` is set on a publication, the inferred tags are **discarded** and the existing `tags` array is preserved.
3. **Preserve manual edits.** Before writing, read existing `publications.json` and copy over any `manualTags: true` entries' `tags` verbatim.

Re-run with `npm run fetch-publications` as today.

### Components

- `<TagFilterBar tags={TAG_VOCAB} active={tag} onChange={setTag} />` — client component; `useState` + URL hash sync.
- `<PublicationItem pub={...} labMemberNames={...} memberIndex={...} />` — pure render; composes `<AuthorList>` and `<CoAuthorChips>`.
- `<AuthorList authors={...} labMemberNames={...} />` — pure render.
- `<CoAuthorChips authors={...} memberIndex={...} />` — pure render.
- `<PublicationsCounter count={...} />` — reads `pubs.counter` from translations and substitutes `{count}`.

### `lib/authorMatch`

Pure module. Surface:

```ts
buildLabAuthorIndex(members: Member[]): {
  names: Set<string>;            // normalized forms
  byNormalized: Map<string, Member>;
}

normalizeAuthorName(s: string): string  // strip diacritics, lowercase,
                                        // canonical "first last" form
matchAuthor(author: string, index): Member | null
```

Handles: `"Heetak Lee"`, `"H Lee"`, `"H. Lee"`, `"Lee H"`, `"Lee, H"`, `"이희탁"`, surname-given vs given-surname order in Korean fullnames.

## Testing

### New tests

- `lib/authorMatch.test.ts` — name normalization and matching edge cases. **High value:** this code has the most room for silent bugs (a missed match → an author isn't bolded, and we'd never notice).
- One new translation key (`pubs.counter`) covered by existing `lib/i18n` test patterns.

### Manual verification before each merge

For each phase:
1. `npm run dev`, open in browser.
2. Click through every route (10 pages) in both `light` and `dark` themes.
3. Phase 2 only: click each tag in the filter, verify list filters; verify counter line; verify a known lab-author appears in bold; verify a co-author chip links to the right member.
4. `npm run build` succeeds.
5. CI (Vitest) green.

### Not tested

- Tag-inference keyword pass (low stakes; hand-editable).
- OpenAlex / Semantic Scholar fetcher (network-dependent; visually obvious failures).
- Theme switching, hero render (per existing PRD policy).

## Out of Scope

- DNS / custom domain (`heetak.org`) — still PI's task, untouched.
- PDF links per publication (not requested).
- ★ Featured marker (you said no).
- Preprint label (you said no).
- Altmetric badges (not selected).
- MDX pipeline for Notes / Tools (PRD already defers).
- Korean polish on new UI strings — PI reviews auto-drafted Korean before launch.
- Member bios — left empty in `team.json`; PI fills in via separate edit.
- Photos for the 6 new members + 1 alumna — placeholder cards render until files land in `public/assets/team/`.
- Member-page deep-link anchors (`/team#<member-id>`) — **in scope for Phase 1** because Phase 2's co-author chips need them. `MemberCard` adds `id={member.id}` to its outer element.
- Citation-count refresh automation — re-run is manual via `npm run fetch-publications`.

## Risks Called Out

- **OpenAlex coverage on Korean-author papers** is good but not 100%. Misses fall through to Semantic Scholar; remaining misses simply omit the citation slot.
- **Author-name matching across romanization variants** is the highest-bug-risk new code. Covered by `lib/authorMatch.test.ts`.
- **Cormorant + Hangul fallback** produces a visible serif/sans mix on bilingual headlines. Accepted by PI.
- **Dark-mode verification across 10 pages** is the most tedious manual step in Phase 1. Doing it once at the end of Phase 1 (rather than per-page) keeps focus.

## Related

- Previous spec / PRD: `PRD.md` (issue #1 on `leo-laboratory/leo-laboratory.github.io`).
- Visual reference: https://joonanlab.github.io/publications (no code copied; layout inspiration only).
- Repo: `leo-laboratory/leo-laboratory.github.io`. Live site: https://leo-laboratory.github.io/.
