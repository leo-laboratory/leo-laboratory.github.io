# Phase 1 Implementation Plan: Earthy Atmosphere + New Members

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the emerald/amber design tokens with an earthy sage/clay/cream palette, swap the procedural phylogenetic-tree hero for a typographic-only hero, switch the display font to Cormorant Garamond, and seed the team with 6 new members + 1 alumna.

**Architecture:** No structural changes. The design-token layer (`src/styles/globals.css`) is rewritten with new CSS custom properties (light + dark earthy themes). One new Google Font (Cormorant Garamond) is loaded via `next/font`. The PhyloTreeHero SVG component and its generator are deleted; `Hero.tsx` is rewritten as a purely-typographic section. Every page picks up new colors automatically via `var(--*)` reads; serif headlines need explicit `font-serif` class adds. Member data lives in JSON and renders through the existing `<TeamPage>` with a fallback placeholder when photo files are absent.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, `next/font/google`, Vitest. No new dependencies.

**Spec reference:** `docs/superpowers/specs/2026-05-27-earthy-atmosphere-and-publications-design.md`

---

## File Inventory

**Created:**
- (none)

**Modified:**
- `src/styles/globals.css` — replace tokens, delete phylo CSS
- `src/app/layout.tsx` — add Cormorant Garamond
- `src/components/home/Hero.tsx` — replace SVG hero with typographic hero
- `src/components/home/ResearchBento.tsx` — serif H2, new tokens
- `src/components/home/NewsAndPubsTeaser.tsx` — serif H2
- `src/components/home/CTAJoin.tsx` — serif H2
- `src/components/layout/LabHeader.tsx` — smaller logo, sage hover
- `src/components/layout/LabFooter.tsx` — larger logo (64px)
- `src/components/page/PageHeader.tsx` — Cormorant H1
- `src/app/team/page.tsx` — placeholder, member anchors, serif H2
- `src/app/alumni/page.tsx` — serif H2, restyle
- `src/app/research/page.tsx` — restyle
- `src/app/publications/page.tsx` — visual restyle only (functional features in Phase 2)
- `src/app/news/page.tsx` — restyle
- `src/app/join/page.tsx` — restyle
- `src/app/contact/page.tsx` — restyle
- `src/app/notes/page.tsx` — restyle
- `src/app/tools/page.tsx` — restyle
- `src/app/not-found.tsx` — restyle
- `src/lib/data/index.ts` — derive `hasPhoto`
- `src/lib/data/types.ts` — extend `TeamMember` / `AlumniMember`
- `data/team.json` — add 6 members
- `data/alumni.json` — add Yejin Kwak
- `data/translations.json` — placeholder strings for empty bios

**Deleted:**
- `src/components/hero/PhyloTreeHero.tsx`
- `src/components/hero/generateTree.ts`

---

### Task 1: Replace design tokens in globals.css

**Files:**
- Modify: `src/styles/globals.css` (full rewrite)

- [ ] **Step 1: Replace globals.css with new earthy tokens**

Overwrite `src/styles/globals.css` with this exact content:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

@theme {
  --font-sans: var(--font-inter), 'Noto Sans KR', ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-cormorant), Georgia, 'Times New Roman', serif;

  --color-sage: #6a7d4a;
  --color-sage-dark: #9bb074;
  --color-clay: #8a6a3a;
  --color-clay-dark: #d9a868;
  --color-cream: #f5efe2;
  --color-cream-card: #fbf7ec;
  --color-cocoa: #2d2820;
  --color-forest: #1c1a14;
}

:root,
[data-theme="light"] {
  --bg-primary: #f5efe2;
  --bg-secondary: #fbf7ec;
  --bg-tertiary: #ede4cd;
  --accent: #6a7d4a;
  --accent-hover: #586a3c;
  --accent-subtle: rgba(106, 125, 74, 0.10);
  --accent-amber: #8a6a3a;
  --text-primary: #2d2820;
  --text-secondary: #5d513c;
  --text-muted: #8a7858;
  --border: #d8cdb3;
  --border-hover: #c5b894;
  --glass-bg: rgba(245, 239, 226, 0.85);
  --glass-border: rgba(45, 40, 32, 0.10);
}

[data-theme="dark"] {
  --bg-primary: #1c1a14;
  --bg-secondary: #26221a;
  --bg-tertiary: #322d23;
  --accent: #9bb074;
  --accent-hover: #b3c890;
  --accent-subtle: rgba(155, 176, 116, 0.14);
  --accent-amber: #d9a868;
  --text-primary: #f0e7d2;
  --text-secondary: #c9bd9f;
  --text-muted: #a89978;
  --border: #3a342a;
  --border-hover: #4a4234;
  --glass-bg: rgba(28, 26, 20, 0.85);
  --glass-border: rgba(240, 231, 210, 0.10);
}

html {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  color: var(--accent);
}

::selection {
  background: var(--accent-subtle);
  color: var(--accent);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Notes for the engineer:
- The `--font-cormorant` CSS variable is set by `next/font` in Task 2; until Task 2 ships, `font-serif` will fall back to Georgia. That is intentional and lets these tasks be reviewed independently.
- All `.phylo-*` CSS rules are deleted because the PhyloTreeHero is removed in Task 3.
- Tailwind `@theme` exposes `color-sage`, `color-clay`, etc. as utility colors, but most of the codebase uses `var(--*)` directly in `style={}` props; the `@theme` colors are mostly for any future Tailwind utility usage.

- [ ] **Step 2: Run dev server to confirm tokens load**

Run: `npm run dev`
Open `http://localhost:3000` in a browser.
Expected: page renders in warm cream tones instead of cool gray. Headings still use the existing sans-serif (Cormorant comes in Task 2). Header/footer pick up new background. Some elements (the hero SVG, accent badges) may look mismatched temporarily — that is fine; they are fixed in subsequent tasks.

- [ ] **Step 3: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat(theme): replace emerald/amber tokens with earthy sage/clay/cream palette

Both light and dark themes rewritten. Phylo-tree CSS animations removed
(component itself is deleted in a follow-up task)."
```

---

### Task 2: Add Cormorant Garamond display font

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add Cormorant Garamond to layout.tsx**

Edit `src/app/layout.tsx`. Change the imports at the top:

Replace:
```ts
import { Inter, Noto_Sans_KR } from 'next/font/google'
```

With:
```ts
import { Inter, Noto_Sans_KR, Cormorant_Garamond } from 'next/font/google'
```

Add a new font binding immediately after the existing `notoSansKR` block (after line 19):

```ts
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
})
```

Update the `<html>` element's `className` to include the cormorant variable. Replace:
```tsx
className={`${inter.variable} ${notoSansKR.variable}`}
```
With:
```tsx
className={`${inter.variable} ${notoSansKR.variable} ${cormorant.variable}`}
```

- [ ] **Step 2: Run dev server, verify font loads**

Run: `npm run dev`
Open the page. The body text is still Inter. Inspect `<html>` in DevTools and confirm the `style` attribute contains `--font-cormorant`. Cormorant glyphs are downloaded but no element uses them yet — the visual change appears in Task 4 onward.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(theme): load Cormorant Garamond display font via next/font

Adds 400/500 + italic, exposed as --font-cormorant CSS variable for
use by font-serif Tailwind utility."
```

---

### Task 3: Delete PhyloTreeHero and generateTree

**Files:**
- Delete: `src/components/hero/PhyloTreeHero.tsx`
- Delete: `src/components/hero/generateTree.ts`

- [ ] **Step 1: Verify no other consumers**

Run: `grep -rn "PhyloTreeHero\|generateTree\|phylo" src/ data/ --include="*.ts" --include="*.tsx" --include="*.css"`
Expected: matches only inside `src/components/hero/`, `src/components/home/Hero.tsx`, and the just-removed CSS keyframes.

- [ ] **Step 2: Delete the files**

```bash
rm src/components/hero/PhyloTreeHero.tsx
rm src/components/hero/generateTree.ts
rmdir src/components/hero
```

(The `rmdir` succeeds only if the directory is now empty, which it should be. If it fails, leave the empty directory alone — Task 4 doesn't recreate the hero subfolder.)

- [ ] **Step 3: Verify build still parses**

Run: `npx tsc --noEmit`
Expected: ONE failure in `src/components/home/Hero.tsx` referencing the missing `PhyloTreeHero` import. That import is removed in Task 4.

If other unrelated errors appear, stop and investigate — something else depended on these files.

- [ ] **Step 4: Commit**

```bash
git add -A src/components/hero
git commit -m "chore(hero): delete PhyloTreeHero + generateTree

The animated SVG phylogenetic-tree hero is being replaced by a
typographic-only hero. Hero.tsx is rewritten in the next commit
to use the new layout."
```

---

### Task 4: Rewrite Hero.tsx as typographic hero

**Files:**
- Modify: `src/components/home/Hero.tsx` (full rewrite)

- [ ] **Step 1: Replace `src/components/home/Hero.tsx` with this content**

```tsx
'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'
import { getLabMeta } from '@/lib/data'

export function Hero() {
  const { t, locale } = useTranslation()
  const lab = getLabMeta()
  const name = lab.name[locale] ?? lab.name.en
  const fullName = lab.fullName[locale] ?? lab.fullName.en

  return (
    <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <p
        className="text-xs uppercase tracking-[0.22em] mb-10 font-semibold"
        style={{ color: 'var(--text-muted)' }}
      >
        {name} · {fullName} · {t('hero.founded', { year: lab.founded })}
      </p>

      <h1
        className="font-serif font-medium leading-[1.02] tracking-tight mb-8"
        style={{
          color: 'var(--text-primary)',
          fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
        }}
      >
        Omics for <em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>understanding</em> evolution.
      </h1>

      <p
        className="max-w-2xl text-base leading-relaxed mb-10"
        style={{ color: 'var(--text-secondary)' }}
      >
        {t('hero.subline')}
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/research/"
          className="px-5 py-2.5 rounded-sm text-sm font-semibold transition-colors"
          style={{
            background: 'var(--accent)',
            color: '#fbf7ec',
          }}
        >
          {t('hero.cta.research')}
        </Link>
        <Link
          href="/join/"
          className="px-5 py-2.5 rounded-sm text-sm font-semibold border transition-colors"
          style={{
            borderColor: 'var(--accent)',
            color: 'var(--accent)',
          }}
        >
          {t('hero.cta.join')}
        </Link>
      </div>
    </section>
  )
}
```

Design notes:
- The headline is hardcoded English. This is intentional: spec calls for `Omics for *understanding* evolution.` as the brand line. Korean version (`진화를 이해하기 위한 오믹스`) lives in `lab.tagline.ko` and is shown via a separate `t('hero.subline')` lookup in subline (Korean visitors get the full sentence in their language; the English-headline-with-italic is a design statement, not localized).
- The `<em>` element uses italic Cormorant via `font-serif` inheritance.
- The two-column grid is gone; everything is left-aligned single column.

- [ ] **Step 2: Add the new translation key `hero.subline`**

Edit `data/translations.json`. After the existing `"hero.founded"` line (around line 24), add:

```json
  "hero.subline": {
    "en": "A computational and experimental biology group at the IBS Center for Genome Engineering — studying the diversity of cellular phenotypes and evolutionary dynamics through single-cell and spatial omics.",
    "ko": "IBS 유전체 교정 연구단에 위치한 계산·실험 생물학 연구실로, 단일세포 및 공간 오믹스를 통해 세포 표현형의 다양성과 진화 동역학을 연구합니다."
  },
```

Be careful to keep the JSON valid (comma after the inserted block since other keys follow).

- [ ] **Step 3: Run dev server, verify hero renders**

Run: `npm run dev`
Open `http://localhost:3000`. Expected:
- Large serif headline reads `Omics for *understanding* evolution.` (italic "understanding" in sage)
- Subline in Inter below
- Two buttons (Explore Research, Join the Lab) below

Switch language to Korean via toggle; subline switches to Korean. Headline stays English (intentional).

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/Hero.tsx data/translations.json
git commit -m "feat(hero): typographic-only hero replaces phylo tree

Single-column serif headline with italic accent word + Inter subline +
two CTAs. Cormorant Garamond inherited via font-serif. New i18n key
hero.subline holds the long descriptor."
```

---

### Task 5: Restyle LabHeader

**Files:**
- Modify: `src/components/layout/LabHeader.tsx`

- [ ] **Step 1: Replace `src/components/layout/LabHeader.tsx` with this content**

```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'
import { LanguageToggle } from './LanguageToggle'
import { ThemeToggle } from './ThemeToggle'

const NAV_LINKS = [
  { href: '/', key: 'nav.home' },
  { href: '/team/', key: 'nav.team' },
  { href: '/research/', key: 'nav.research' },
  { href: '/publications/', key: 'nav.publications' },
  { href: '/news/', key: 'nav.news' },
  { href: '/join/', key: 'nav.join' },
  { href: '/contact/', key: 'nav.contact' },
] as const

export function LabHeader() {
  const { t } = useTranslation()
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b"
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'var(--glass-border)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0 flex items-center gap-2" aria-label="LEO Lab — Home">
          <Image
            src="/assets/logo.png"
            alt="LEO Lab"
            width={2007}
            height={1615}
            priority
            className="h-8 w-auto"
          />
          <span
            className="font-serif font-medium text-lg tracking-tight hidden sm:inline"
            style={{ color: 'var(--text-primary)' }}
          >
            LEO Lab
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, key }) => (
            <Link
              key={key}
              href={href}
              className="px-2.5 py-1.5 text-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <nav className="md:hidden border-t flex overflow-x-auto" style={{ borderColor: 'var(--glass-border)' }}>
        {NAV_LINKS.map(({ href, key }) => (
          <Link
            key={key}
            href={href}
            className="px-3 py-2 text-xs whitespace-nowrap"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t(key)}
          </Link>
        ))}
      </nav>
    </header>
  )
}
```

Changes from old version:
- Logo height `h-10` (40px) -> `h-8` (32px)
- Header height `h-16` -> `h-14` (lighter feel)
- Container `max-w-6xl` -> `max-w-5xl` (tighter, matches body)
- Added wordmark span next to logo: "LEO Lab" in Cormorant
- Removed `font-medium` from nav links (lighter weight), removed `hover:bg-[var(--bg-tertiary)]` so the sage-tint hover from `a:hover` in globals.css carries through.

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`. Confirm header looks tighter, logo smaller, "LEO Lab" wordmark in serif visible on desktop (≥640px wide).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/LabHeader.tsx
git commit -m "feat(header): smaller logo + Cormorant wordmark + tighter density"
```

---

### Task 6: Restyle LabFooter

**Files:**
- Modify: `src/components/layout/LabFooter.tsx`

- [ ] **Step 1: Read the existing LabFooter.tsx**

Run: `cat src/components/layout/LabFooter.tsx`
Note its current structure — it likely has a logo, links, address, copyright. Preserve all of that.

- [ ] **Step 2: Apply these targeted edits**

Find the logo `<Image>` element. Whatever its current `className` is for sizing, change it so the logo renders at 64px height. Replace the `h-*` class on the Image with `h-16`.

Find any heading elements (`<h2>`, `<h3>`) in the footer. Add the class `font-serif` to each.

Find the outer container `<footer>`'s padding classes. Increase top/bottom padding by one Tailwind step (e.g. `py-10` -> `py-12`).

Find any `max-w-*` container. Change `max-w-6xl` to `max-w-5xl` to match the header.

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`. Scroll to footer. Logo should be visibly larger (64px). Any footer headings should now be in Cormorant.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/LabFooter.tsx
git commit -m "feat(footer): larger logo (64px) + serif headings"
```

---

### Task 7: Restyle PageHeader (Cormorant H1)

**Files:**
- Modify: `src/components/page/PageHeader.tsx`

- [ ] **Step 1: Replace `src/components/page/PageHeader.tsx` with this content**

```tsx
'use client'

interface PageHeaderProps {
  title: string
  intro?: string
}

export function PageHeader({ title, intro }: PageHeaderProps) {
  return (
    <header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
      <h1
        className="font-serif font-medium tracking-tight mb-4"
        style={{
          color: 'var(--text-primary)',
          fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
        }}
      >
        {title}
      </h1>
      {intro && (
        <p className="text-base max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {intro}
        </p>
      )}
    </header>
  )
}
```

Changes:
- Cormorant via `font-serif font-medium`
- Removed the colored accent rule (the `<div className="w-16 h-1">`); cleaner.
- Tighter intro (`text-base` not `text-lg`), narrower (`max-w-2xl` not `max-w-3xl`).
- `max-w-5xl` to match other containers.

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`. Navigate to `/team`, `/research`, `/publications`. H1 on each page should be Cormorant. No accent rule under the title.

- [ ] **Step 3: Commit**

```bash
git add src/components/page/PageHeader.tsx
git commit -m "feat(page-header): Cormorant H1, drop accent rule, tighten intro"
```

---

### Task 8: Restyle home sections (ResearchBento, NewsAndPubsTeaser, CTAJoin)

**Files:**
- Modify: `src/components/home/ResearchBento.tsx`
- Modify: `src/components/home/NewsAndPubsTeaser.tsx`
- Modify: `src/components/home/CTAJoin.tsx`

- [ ] **Step 1: Read each file**

Run: `cat src/components/home/ResearchBento.tsx src/components/home/NewsAndPubsTeaser.tsx src/components/home/CTAJoin.tsx`

- [ ] **Step 2: Apply this find/replace pattern across all three files**

For each file, find every heading element (`<h2>`, `<h3>`) and append the class `font-serif font-medium` to its `className`. If the heading already has `font-bold`, replace that with `font-medium`.

Example for `ResearchBento.tsx`: if you see `<h2 className="text-3xl font-bold mb-6">`, change it to `<h2 className="text-3xl font-serif font-medium mb-6">`.

Also: every `max-w-6xl` container in these files changes to `max-w-5xl` (consistent with header/footer).

Also: any `rounded-lg` on cards changes to `rounded-sm` (more editorial feel).

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`. Scroll the homepage. Each section heading should be Cormorant. Cards should have sharp-ish corners (small radius).

- [ ] **Step 4: Commit**

```bash
git add src/components/home/
git commit -m "feat(home): serif headings + tighter radii on ResearchBento, NewsAndPubsTeaser, CTAJoin"
```

---

### Task 9: Extend data types and derive hasPhoto

**Files:**
- Modify: `src/lib/data/types.ts`
- Modify: `src/lib/data/index.ts`

- [ ] **Step 1: Extend TeamMember and AlumniMember in types.ts**

Edit `src/lib/data/types.ts`. Modify the `TeamMember` interface — append `hasPhoto?: boolean` at the end (before the closing brace):

```ts
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
```

Modify the `AlumniMember` interface — make `photo` optional and add `hasPhoto`:

```ts
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
```

- [ ] **Step 2: Derive `hasPhoto` in `src/lib/data/index.ts`**

Replace the entire contents of `src/lib/data/index.ts` with:

```ts
import { existsSync } from 'node:fs'
import { join } from 'node:path'
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

const PUBLIC_DIR = join(process.cwd(), 'public')

function photoExists(photo?: string): boolean {
  if (!photo) return false
  // photo is a public-relative path like "/assets/team/youngchul.png"
  return existsSync(join(PUBLIC_DIR, photo))
}

export function getLabMeta(): LabMeta {
  return labJson as LabMeta
}

export function getTeam(): TeamMember[] {
  return (teamJson.members as TeamMember[]).map(m => ({
    ...m,
    hasPhoto: photoExists(m.photo),
  }))
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
  return (alumniJson.members as AlumniMember[]).map(m => ({
    ...m,
    hasPhoto: photoExists(m.photo),
  }))
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
```

Notes:
- `fs.existsSync` runs at build time (Next.js static export) so missing photo files are detected once during `next build`. Client-side renders use the resolved `hasPhoto: boolean`.
- For the dev server, `getTeam()` runs server-side per request, so dropping a new photo file refreshes on next request.

- [ ] **Step 3: Run typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors. (TeamMember consumers ignore the new field.)

- [ ] **Step 4: Build to confirm fs works in static export**

Run: `npm run build`
Expected: build succeeds. If it fails with "Module not found: Can't resolve 'node:fs'", the engineer needs to verify they're on Node 22+ (existing project requirement) — older Node versions need `fs` without the `node:` prefix.

- [ ] **Step 5: Commit**

```bash
git add src/lib/data/types.ts src/lib/data/index.ts
git commit -m "feat(data): derive hasPhoto via fs.existsSync at build time

TeamMember and AlumniMember gain optional hasPhoto. Consumers
(MemberCard fallback in next commit) can render typographic
placeholders when photo files are absent."
```

---

### Task 10: Add 6 new members and 1 alumna to data

**Files:**
- Modify: `data/team.json`
- Modify: `data/alumni.json`

- [ ] **Step 1: Replace `data/team.json` with this content**

```json
{
  "members": [
    {
      "id": "heetak-lee",
      "name": "Heetak Lee",
      "nameKo": "이희탁",
      "role": "pi",
      "title": {
        "en": "Principal Investigator · Ph.D.",
        "ko": "책임연구원 · Ph.D."
      },
      "affiliations": [
        { "en": "Senior Research Fellow, IBS Center for Genome Engineering", "ko": "IBS 유전체 교정 연구단 선임연구위원" },
        { "en": "Associate Professor, UST IBS School", "ko": "UST IBS 학교 부교수" },
        { "en": "University-Research Institute Professor, SKKU Department of MetaBiohealth", "ko": "성균관대학교 메타바이오헬스학과 대학-연구기관 교수" }
      ],
      "bio": {
        "en": "Heetak Lee leads LEO Lab, studying the evolutionary dynamics of cellular phenotypes through single-cell and spatial omics, with a focus on stem cells and cancer biology.",
        "ko": "이희탁 박사는 LEO 연구실을 이끌며 단일세포 및 공간 오믹스를 활용해 세포 표현형의 진화 동역학을 연구하고 있으며, 줄기세포와 암 생물학에 관심을 두고 있습니다."
      },
      "photo": "/assets/team/heetak-lee.png",
      "orcid": "0000-0002-7093-842X",
      "scholar": "https://scholar.google.com/citations?user=WM0sg9cAAAAJ",
      "email": "leeheetak@ibs.re.kr",
      "joined": "2023"
    },
    {
      "id": "youngchul-oh",
      "name": "Youngchul Oh",
      "nameKo": "오영철",
      "role": "integrative",
      "title": {
        "en": "Ph.D.–M.S. Integrative Program, POSTECH",
        "ko": "통합과정 박사·석사 (POSTECH)"
      },
      "affiliations": [
        { "en": "POSTECH, integrative graduate program", "ko": "POSTECH 통합과정" }
      ],
      "bio": { "en": "", "ko": "" },
      "photo": "/assets/team/youngchul.png",
      "joined": "2023.03"
    },
    {
      "id": "yeongjun-kim",
      "name": "Yeongjun Kim",
      "nameKo": "김영준",
      "role": "integrative",
      "title": {
        "en": "Ph.D.–M.S. Integrative Program, KHU",
        "ko": "통합과정 박사·석사 (경희대)"
      },
      "affiliations": [
        { "en": "Kyung Hee University, integrative graduate program", "ko": "경희대학교 통합과정" }
      ],
      "bio": { "en": "", "ko": "" },
      "photo": "/assets/team/yeongjun.jpg",
      "joined": "2024.03"
    },
    {
      "id": "ohbin-kwon",
      "name": "Ohbin Kwon",
      "nameKo": "권오빈",
      "role": "integrative",
      "title": {
        "en": "Ph.D.–M.S. Integrative Program, KAIST",
        "ko": "통합과정 박사·석사 (KAIST)"
      },
      "affiliations": [
        { "en": "KAIST, integrative graduate program", "ko": "KAIST 통합과정" }
      ],
      "bio": { "en": "", "ko": "" },
      "photo": "/assets/team/ohbin.jpg"
    },
    {
      "id": "chaewon-lee",
      "name": "Chaewon Lee",
      "nameKo": "이채원",
      "role": "project",
      "title": {
        "en": "Adjunct Member · Chungnam National University (Prof. Donghwan Shim)",
        "ko": "겸임 연구원 · 충남대학교 (심동환 교수)"
      },
      "affiliations": [
        { "en": "Chungnam National University, Lab of Prof. Donghwan Shim", "ko": "충남대학교 심동환 교수 연구실" }
      ],
      "bio": { "en": "", "ko": "" },
      "photo": "/assets/team/chaewon.png",
      "joined": "2024.01"
    },
    {
      "id": "onyu-shin",
      "name": "Onyu Shin",
      "nameKo": "신온유",
      "role": "project",
      "title": {
        "en": "Adjunct Member · IBS Center for Genome Engineering (Dr. Bon-Kyoung Koo)",
        "ko": "겸임 연구원 · IBS 유전체 교정 연구단 (구본경 박사)"
      },
      "affiliations": [
        { "en": "IBS Center for Genome Engineering, Lab of Dr. Bon-Kyoung Koo", "ko": "IBS 유전체 교정 연구단 구본경 박사 연구실" }
      ],
      "bio": { "en": "", "ko": "" },
      "photo": "/assets/team/onyu.jpg",
      "joined": "2024.09"
    },
    {
      "id": "shaban-muhammed",
      "name": "Shaban Muhammed",
      "role": "project",
      "title": {
        "en": "Adjunct Member · Dankook University (Prof. Eunyu Kim)",
        "ko": "겸임 연구원 · 단국대학교 (김은유 교수)"
      },
      "affiliations": [
        { "en": "Dankook University, Lab of Prof. Eunyu Kim", "ko": "단국대학교 김은유 교수 연구실" }
      ],
      "bio": { "en": "", "ko": "" },
      "photo": "/assets/team/shaban.png",
      "joined": "2026.03"
    }
  ],
  "roles": [
    { "id": "pi", "order": 1 },
    { "id": "integrative", "order": 2 },
    { "id": "phd", "order": 3 },
    { "id": "master", "order": 4 },
    { "id": "project", "order": 5 },
    { "id": "undergrad", "order": 6 }
  ]
}
```

Notes:
- File extensions match what's actually in `public/assets/team/`: `.png` for `youngchul`, `chaewon`, `yejin`, `shaban`; `.jpg` for `yeongjun`, `ohbin`, `onyu`. `hasPhoto` derivation in Task 9 detects what's present at build time, so adding/renaming photo files later doesn't require code changes.
- Shaban's `photo` points to `/assets/team/shaban.png` even though the file does not exist yet — `hasPhoto` will be `false` and the placeholder renders.
- Ohbin's `joined` is omitted; the team-page render needs to handle missing `joined`.
- Bios are empty strings, not absent keys, so the existing `bio[locale]` lookup doesn't crash.

- [ ] **Step 2: Replace `data/alumni.json` with this content**

```json
{
  "members": [
    {
      "id": "yejin-kwak",
      "name": "Yejin Kwak",
      "nameKo": "곽예진",
      "formerRole": "project",
      "period": "2024.07–2025.02",
      "currentPosition": {
        "en": "Karlsruhe Institute of Technology (KIT), Institute for Automation and Applied Informatics (IAI)",
        "ko": "Karlsruhe Institute of Technology (KIT), Institute for Automation and Applied Informatics (IAI)"
      },
      "photo": "/assets/team/yejin.png"
    }
  ]
}
```

- [ ] **Step 3: Verify JSON syntax**

Run: `node -e "JSON.parse(require('fs').readFileSync('data/team.json'))" && node -e "JSON.parse(require('fs').readFileSync('data/alumni.json'))" && echo OK`
Expected: `OK`.

- [ ] **Step 4: Run dev server, navigate to /team and /alumni**

Run: `npm run dev`. Open `/team` — six new cards appear under "PhD–Master Integrative Program" and "Project / Adjunct Members" headings. Some have photos, Shaban does not (this is fine, fallback comes in Task 11). Open `/alumni` — Yejin Kwak appears with her KIT current position. Existing alumni page may render her differently or not at all depending on its current state; that is handled in Task 12.

- [ ] **Step 5: Commit**

```bash
git add data/team.json data/alumni.json
git commit -m "feat(team): add 6 members + 1 alumna

Three integrative-program students (Youngchul Oh, Yeongjun Kim,
Ohbin Kwon), three adjunct members (Chaewon Lee, Onyu Shin,
Shaban Muhammed), one alumna (Yejin Kwak, now at KIT IAI).
Bios left empty; PI fills in via separate edit."
```

---

### Task 11: Restyle team page with placeholder + anchor + serif

**Files:**
- Modify: `src/app/team/page.tsx` (full rewrite)

- [ ] **Step 1: Replace `src/app/team/page.tsx` with this content**

```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'
import { getTeamByRole } from '@/lib/data'
import type { TeamMember } from '@/lib/data'
import { PageHeader } from '@/components/page/PageHeader'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function MemberPhoto({ member }: { member: TeamMember }) {
  if (member.hasPhoto && member.photo) {
    return (
      <div
        className="w-24 h-24 rounded-full mb-5 overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        <Image
          src={member.photo}
          alt={member.name}
          width={96}
          height={96}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }
  return (
    <div
      className="w-24 h-24 rounded-full mb-5 flex flex-col items-center justify-center font-serif font-medium"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        color: 'var(--accent)',
      }}
    >
      <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{initials(member.name)}</span>
      <span
        style={{
          width: '70%',
          height: '1px',
          background: 'var(--accent)',
          opacity: 0.5,
          marginTop: '0.35rem',
        }}
      />
    </div>
  )
}

export default function TeamPage() {
  const { t, locale } = useTranslation()
  const groups = getTeamByRole()

  return (
    <>
      <PageHeader title={t('team.title')} intro={t('team.intro')} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-16">
        {groups.map(({ role, members }) => (
          <section key={role}>
            <h2
              className="font-serif font-medium text-2xl mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              {t(`team.role.${role}`)}
            </h2>
            {members.length === 0 ? (
              <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                {t('team.empty.role')}
              </p>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {members.map(member => (
                  <article
                    key={member.id}
                    id={member.id}
                    className="scroll-mt-24"
                  >
                    <MemberPhoto member={member} />
                    <h3
                      className="font-serif font-medium text-xl mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {member.name}
                      {member.nameKo && (
                        <span
                          className="ml-2 text-sm font-sans font-normal"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {member.nameKo}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm mb-2" style={{ color: 'var(--accent)' }}>
                      {member.title[locale] ?? member.title.en}
                    </p>
                    <ul className="text-xs space-y-0.5 mb-3" style={{ color: 'var(--text-muted)' }}>
                      {member.affiliations.map((aff, i) => (
                        <li key={i}>{aff[locale] ?? aff.en}</li>
                      ))}
                    </ul>
                    {member.joined && (
                      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                        {t('team.joined', { date: member.joined })}
                      </p>
                    )}
                    {(member.bio[locale] || member.bio.en) && (
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {member.bio[locale] ?? member.bio.en}
                      </p>
                    )}
                    <div className="mt-3 flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="hover:underline">
                          {t('contact.email')}
                        </a>
                      )}
                      {member.orcid && (
                        <a
                          href={`https://orcid.org/${member.orcid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          ORCID
                        </a>
                      )}
                      {member.scholar && (
                        <a
                          href={member.scholar}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          Scholar
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}

        <div className="pt-4">
          <Link
            href="/alumni/"
            className="inline-block text-sm hover:underline"
            style={{ color: 'var(--accent-amber)' }}
          >
            {t('team.role.alumni_link')}
          </Link>
        </div>
      </div>
    </>
  )
}
```

Key changes:
- Removed the boxed `border + background` card wrapper; cards are bare with photo + text only (matches editorial feel).
- `<MemberPhoto>` helper renders typographic placeholder (initials + sage hairline) when `hasPhoto` is false.
- `id={member.id}` on each article enables `/team#youngchul-oh` deep links (used by Phase 2 co-author chips).
- `scroll-mt-24` so the sticky header doesn't cover anchored members on scroll.
- New `team.joined` translation key; added in Step 2.
- Empty bios are skipped (no empty paragraph rendered).
- Korean name shown always (locale-independent) since names are universal; in original code it only showed in Korean locale, which hid the Hangul from English readers — design correction.

- [ ] **Step 2: Add `team.joined` translation key**

Edit `data/translations.json`. Add this entry next to the other `team.*` keys (after `team.empty.role`):

```json
  "team.joined": { "en": "Joined {date}", "ko": "{date} 합류" },
```

- [ ] **Step 3: Run dev server, visit /team**

Run: `npm run dev`. Open `/team`.
Expected:
- PI card shows photo (Heetak Lee)
- Three integrative members show photos
- Two adjunct members show photos
- Shaban shows initials "SM" in sage Cormorant with hairline rule (no photo file)
- Korean names appear next to each English name
- "Joined 2023.03" line under each member (Ohbin has no date so no line)
- Deep link: visit `/team#yeongjun-kim` directly — page scrolls Yeongjun's card into view, not under the header.

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/team/page.tsx data/translations.json
git commit -m "feat(team): typographic placeholder, deep-link anchors, serif headings

MemberPhoto renders initials in Cormorant + sage rule when photo
is absent (Shaban, future members). Article tags get id={member.id}
for /team#<id> deep linking used by Phase 2 co-author chips."
```

---

### Task 12: Restyle alumni page

**Files:**
- Modify: `src/app/alumni/page.tsx` (full rewrite)

- [ ] **Step 1: Read existing alumni page**

Run: `cat src/app/alumni/page.tsx`
Note the current layout structure so any unique elements are preserved.

- [ ] **Step 2: Replace `src/app/alumni/page.tsx` with this content**

```tsx
'use client'

import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'
import { getAlumni } from '@/lib/data'
import type { AlumniMember } from '@/lib/data'
import { PageHeader } from '@/components/page/PageHeader'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function AlumPhoto({ member }: { member: AlumniMember }) {
  if (member.hasPhoto && member.photo) {
    return (
      <div
        className="w-20 h-20 rounded-full overflow-hidden shrink-0"
        style={{ border: '1px solid var(--border)' }}
      >
        <Image
          src={member.photo}
          alt={member.name}
          width={80}
          height={80}
          className="object-cover w-full h-full"
        />
      </div>
    )
  }
  return (
    <div
      className="w-20 h-20 rounded-full flex items-center justify-center font-serif font-medium shrink-0"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        color: 'var(--accent)',
        fontSize: '1.5rem',
      }}
    >
      {initials(member.name)}
    </div>
  )
}

export default function AlumniPage() {
  const { t, locale } = useTranslation()
  const alumni = getAlumni()

  return (
    <>
      <PageHeader title={t('alumni.title')} intro={t('alumni.intro')} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {alumni.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
            {t('alumni.empty')}
          </p>
        ) : (
          <ul className="space-y-8">
            {alumni.map(member => (
              <li key={member.id} id={member.id} className="scroll-mt-24 flex gap-5">
                <AlumPhoto member={member} />
                <div className="flex-1">
                  <h3
                    className="font-serif font-medium text-xl mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {member.name}
                    {member.nameKo && (
                      <span
                        className="ml-2 text-sm font-sans font-normal"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {member.nameKo}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                    {t(`team.role.${member.formerRole}`)} · {member.period}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t('alumni.current_position')}:{' '}
                    {member.currentPosition[locale] ?? member.currentPosition.en}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 3: Add alumni translation keys**

Edit `data/translations.json`. Add or update these keys (search first; if they already exist, leave them):

```json
  "alumni.title": { "en": "Alumni", "ko": "동문" },
  "alumni.intro": { "en": "Former lab members and where they are now.", "ko": "이전 연구실 구성원과 현재 소속입니다." },
  "alumni.empty": { "en": "No alumni yet.", "ko": "동문이 아직 없습니다." },
  "alumni.current_position": { "en": "Current position", "ko": "현재 소속" },
```

If any key already exists with a different value, prefer the existing value (don't overwrite the PI's wording).

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`. Open `/alumni`. Yejin Kwak appears with her photo, period (`2024.07–2025.02`), and current position at KIT.

- [ ] **Step 5: Commit**

```bash
git add src/app/alumni/page.tsx data/translations.json
git commit -m "feat(alumni): serif headings, photo + initials fallback, current-position line"
```

---

### Task 13: Restyle research page

**Files:**
- Modify: `src/app/research/page.tsx`

- [ ] **Step 1: Read current research page**

Run: `cat src/app/research/page.tsx`
Identify: H2 elements per area, max-width container, any color references.

- [ ] **Step 2: Apply targeted edits**

For every heading in the file:
- Add `font-serif font-medium` class
- Remove `font-bold` if present

For the outer container:
- Change `max-w-6xl` to `max-w-5xl`

For any color references inline:
- `var(--accent-amber)` stays (now points to clay)
- `var(--accent)` stays (now points to sage)
- No hex literals should remain — if any do, replace with appropriate `var(--*)` token

For research-area cards:
- Replace `rounded-lg` with `rounded-sm`
- Replace `border-2` with `border` (thinner)
- Replace any explicit `bg-emerald-*` / `bg-amber-*` Tailwind classes with `var(--accent-subtle)` background

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`. Open `/research`. Three theme cards rendered in earthy tones, headings in Cormorant.

- [ ] **Step 4: Commit**

```bash
git add src/app/research/page.tsx
git commit -m "feat(research): serif headings + earthy tokens"
```

---

### Task 14: Restyle remaining pages (visual-only, no logic change)

**Files (all modified):**
- `src/app/publications/page.tsx`
- `src/app/news/page.tsx`
- `src/app/join/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/notes/page.tsx`
- `src/app/tools/page.tsx`
- `src/app/not-found.tsx`

These pages all follow the same restyle pattern, so they are bundled. **Do them one-by-one and commit each.** Do not bulk-edit; small commits make review easier.

- [ ] **Step 1: For each page, apply this exact pattern**

In each file:

1. Find every heading (`<h1>`, `<h2>`, `<h3>`). Add `font-serif font-medium` to its `className`. Remove `font-bold` if present.
2. Find any `max-w-6xl` container. Change to `max-w-5xl`.
3. Find any `max-w-4xl` container on the publications page. Change to `max-w-3xl` (reading-heavy).
4. Find any `rounded-lg`. Change to `rounded-sm`.
5. Find any inline hex colors. Replace with appropriate `var(--*)` token.
6. Find any `border-2`. Change to `border`.

The publications page is special: do the visual changes only. **Do not touch tag-filter / counter / co-author chip / citation logic** — those are Phase 2.

- [ ] **Step 2: After each page, run `npm run dev` and verify**

For each page individually:
1. Visit the page in the browser
2. Confirm: headings in Cormorant, no remaining emerald/amber raw colors, cards have sharp corners
3. Commit before moving to the next:

```bash
git add src/app/<page>/page.tsx
git commit -m "feat(<page>): apply earthy atmosphere"
```

Page-specific notes:

- **publications**: do not change `getPublicationsByYear` usage or the year-section structure. Visual only.
- **contact**: address block stays; just restyle.
- **join**: `t('join.intro')` body; CTA button color via `var(--accent)`.
- **notes / tools**: these are skeletons. Apply restyle so they look consistent with the rest of the site. They render a `coming_soon` translation; that stays.
- **not-found**: typographic 404 in Cormorant looks especially good here. Add `font-serif` to the big number and put the "Back to home" link in sage.

- [ ] **Step 3: Final typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors.

---

### Task 15: Smoke test across themes and locales

**Files:**
- (none — verification only)

- [ ] **Step 1: Run dev server**

Run: `npm run dev`

- [ ] **Step 2: Click through every route in both themes and both locales**

Open `http://localhost:3000` and perform this checklist:

For each route (`/`, `/team/`, `/research/`, `/publications/`, `/news/`, `/join/`, `/contact/`, `/alumni/`, `/notes/`, `/tools/`, and a deliberate 404 like `/nope/`):

1. Default light theme, English: load page, confirm no console errors, confirm headings are Cormorant, confirm colors are earthy (no remaining green/emerald, no amber-yellow).
2. Click language toggle to Korean: confirm strings switch.
3. Click theme toggle to dark: confirm dark-earthy palette applies (deep brown bg, cream text, sage accents).
4. Toggle back.

If any page shows an emerald or amber raw color, or any heading is still sans-serif, fix it now in a small commit.

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: build succeeds, `out/` directory populated. If build fails, fix and re-run.

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all existing tests pass. (No new tests added in Phase 1 per PRD policy.)

- [ ] **Step 5: Final commit (if any fixes were needed during smoke test)**

```bash
git add -A
git commit -m "fix(phase1): smoke-test corrections" || echo "nothing to commit"
```

---

### Task 16: Push and verify deployment

**Files:**
- (none — deployment verification)

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

- [ ] **Step 2: Watch the GitHub Actions deploy**

```bash
gh run watch
```

Or open the Actions tab in the browser. Expected: build + deploy succeeds.

- [ ] **Step 3: Verify production site**

Open `https://leo-laboratory.github.io/` and confirm:
- Homepage shows new typographic hero
- `/team` shows 7 members (6 new + PI)
- `/alumni` shows Yejin Kwak
- Theme toggle works for both themes
- No console errors

If anything is broken, debug, fix, push a follow-up commit.

---

## Self-review

**Spec coverage:**
- Earthy palette light + dark — Task 1
- Cormorant Garamond — Task 2
- Typographic hero — Tasks 3, 4
- Delete PhyloTreeHero + tests — Task 3 (no test file existed; nothing to delete on test side)
- All 10 pages restyled — Tasks 5, 6, 7, 8, 11, 12, 13, 14
- 6 members + 1 alumna in JSON — Task 10
- `hasPhoto` derivation — Task 9
- Typographic initials placeholder — Task 11
- Member-id anchors for Phase 2 co-author chips — Task 11
- Smoke test in both themes — Task 15
- Deploy verification — Task 16

**Placeholders:** none in this plan. Every code block is complete.

**Type consistency:** `TeamMember.hasPhoto` and `AlumniMember.hasPhoto` defined in Task 9, used in Task 11, Task 12. `initials(name: string): string` defined identically in Task 11 and Task 12 — duplicated rather than extracted to `lib/`, because the function is 4 lines and lifting it for two callers would be premature abstraction.

**Phase boundary:** publications page is restyled but functional features (tag filter, counter, co-author chips, citation counts) are untouched. They land in Phase 2.
