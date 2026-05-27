# LEO Lab Website

The public website for **LEO Lab** (Lee's Evolution and Omics) at IBS Center for Genome Engineering, founded 2023.

- **Live (default):** https://leo-laboratory.github.io/
- **Live (custom domain):** https://heetak.org/
- **Tagline:** Omics for understanding Evolution
- **PI:** Heetak Lee, Ph.D.

## Quick start

```bash
npm install
npm run dev          # local dev server at http://localhost:3000
npm run build        # static export to out/
npm test             # run Vitest unit tests
```

Requires Node 22+.

## Project structure

```
.
├── data/                      # All site content — edit these JSON files
│   ├── lab.json               # PI bio, address, affiliations, ORCID/Scholar
│   ├── translations.json      # All UI strings, en + ko
│   ├── team.json              # Lab members + role buckets
│   ├── alumni.json            # Former members
│   ├── research.json          # 3 research themes
│   ├── news.json              # Time-ordered announcements
│   └── publications.json      # Auto-generated; run npm run fetch-publications
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── components/
│   │   ├── layout/            # LabHeader, LabFooter, toggles
│   │   ├── hero/              # PhyloTreeHero + pure generator
│   │   ├── home/              # Homepage sections
│   │   └── page/              # Shared page chrome (PageHeader)
│   ├── lib/
│   │   ├── i18n/              # Bilingual system (deep module + Vitest tests)
│   │   ├── theme/             # Light/dark theme system
│   │   └── data/              # Typed accessors over JSON
│   └── styles/globals.css     # Tailwind 4 imports, color tokens, animations
├── scripts/
│   └── fetch-publications.ts  # Pulls papers from ORCID + Crossref
├── public/
│   ├── CNAME                  # heetak.org
│   ├── .nojekyll              # Disable Jekyll on GitHub Pages
│   └── assets/                # Drop logo.svg and team/heetak-lee.jpg here
├── .github/workflows/deploy.yml
├── next.config.ts             # output: 'export' for static site
└── vitest.config.ts
```

## How to update content

All content is data-driven. Pages re-render automatically on `npm run dev` — no React knowledge needed.

### Add a team member

Edit `data/team.json`. Append a new object to `members[]`:

```json
{
  "id": "kebab-case-id",
  "name": "Jane Doe",
  "nameKo": "도제인",
  "role": "phd",                    // pi | integrative | phd | master | project | undergrad
  "title": { "en": "PhD Student · Year 2", "ko": "박사과정 2년차" },
  "affiliations": [
    { "en": "UST IBS School", "ko": "UST IBS 학교" }
  ],
  "bio": {
    "en": "Studies …",
    "ko": "…를 연구합니다."
  },
  "photo": "/assets/team/jane-doe.jpg",
  "orcid": "0000-0000-0000-0000",
  "email": "jane@ibs.re.kr",
  "joined": "2025"
}
```

Drop the photo into `public/assets/team/`.

### Add a news item

Edit `data/news.json`. Newest items go first (any order works — the site sorts by `date` desc):

```json
{
  "id": "paper-published-2026-04",
  "date": "2026-04-15",
  "title": { "en": "Paper published in Nature", "ko": "Nature 논문 게재" },
  "body": {
    "en": "Our paper on …",
    "ko": "우리 연구실의 …"
  }
}
```

### Refresh publications

Run the fetcher whenever new papers come out:

```bash
npm run fetch-publications
```

It reads the ORCID iD from `data/lab.json` (`pi.orcid`), queries the ORCID Public API for the works list, then enriches each entry with author lists and journal names from the Crossref REST API. Writes the result to `data/publications.json`. Commit and push.

### Add a research theme

Edit `data/research.json`. Each `area` has an `id` (used as anchor URL `/research/#id`), bilingual `title`/`summary`, and an `accent` color (`"emerald"` or `"amber"`).

### Translate or fix a UI string

Edit `data/translations.json`. Every key is `{ en, ko }`. If `ko` is missing for a key, the site silently falls back to `en`.

## Visual identity

- **Default theme:** light. Toggle via the ☾ button in the header. Persisted to `localStorage`.
- **Primary accent (emerald):** `#047857` light · `#10b981` dark
- **Highlight (amber):** `#d97706` light · `#f59e0b` dark
- **Fonts:** Inter (Latin) + Noto Sans KR (Korean), loaded via `next/font`
- **Hero animation:** procedural phylogenetic tree, deterministic from `seed` prop. Respects `prefers-reduced-motion`.

## Internationalization

- All UI strings live in `data/translations.json`, keyed as `{ "section.key": { en, ko } }`.
- React Context (`<LocaleProvider>`) holds current locale, persists to `localStorage`, and exposes `t(key, vars?)` via `useTranslation()`.
- Variable interpolation: `t('hero.founded', { year: 2023 })` resolves `{year}` in the template.
- Missing Korean entries silently fall back to English — safe to ship partial translations.

## Deploying for the first time

GitHub Pages serves the static export. The workflow at `.github/workflows/deploy.yml` builds and deploys on every push to `main`.

### 1. Create the GitHub repo

```bash
sudo apt install gh                                    # if not installed
gh auth login                                          # follow interactive prompts
gh repo create leo-laboratory/leo-laboratory.github.io \
  --public --source=. --remote=origin --push
```

### 2. Enable GitHub Pages

In the repo's **Settings → Pages**, set **Source = "GitHub Actions"**. The first push to `main` triggers `deploy.yml`.

Site appears at `https://leo-laboratory.github.io/` once the workflow completes.

### 3. Wire up the custom domain (`heetak.org`)

The `CNAME` file at `public/CNAME` already contains `heetak.org`. After registering the domain, point its DNS at GitHub Pages:

**Apex `heetak.org` — add four A records:**

```
A  @  185.199.108.153
A  @  185.199.109.153
A  @  185.199.110.153
A  @  185.199.111.153
```

**Optional `www.heetak.org` — add a CNAME record:**

```
CNAME  www  leo-laboratory.github.io.
```

In GitHub Pages settings, confirm "Enforce HTTPS" once the cert is issued (can take up to 24h after DNS propagates).

## Testing

```bash
npm test            # one-shot
npm run test:watch  # watch mode
```

Tests cover the `lib/i18n` deep module (translation lookup, locale resolution, fallback behavior, variable interpolation). See `src/lib/i18n/*.test.ts`. Vitest runs in jsdom for any future component tests.

## License

Lab content (text, images, member info) © LEO Lab. Code is private to the organization unless an explicit LICENSE file is later added.
