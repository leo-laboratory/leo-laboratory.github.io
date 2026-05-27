# PRD: LEO Lab Website (leo-laboratory.github.io)

**Status:** ready-for-agent
**Created:** 2026-05-26
**Owner:** Heetak Lee (leeheetak@ibs.re.kr)

---

## Problem Statement

LEO Lab (Lee's Evolution and Omics) — founded in 2023 at the IBS Center for Genome Engineering — has no public web presence. Prospective students, postdocs, collaborators, conference attendees, and the general public have no canonical place to learn what the lab studies, who its PI is, what papers it has published, how to apply, or how to get in touch. The lab's Korean and international audiences both need access, and the site should communicate the lab's identity as a modern computational + experimental biology group studying evolutionary cell biology, stem cells and cancer, and analytic tool development.

A lab member (the PI) referenced [joonanlab.github.io](https://joonanlab.github.io/) as the visual/structural reference, but that codebase carries no license and cannot be forked or reused. A site that mirrors its quality must be built from scratch.

## Solution

Build a statically generated bilingual (Korean + English) Next.js website hosted on GitHub Pages at `https://leo-laboratory.github.io/`, with the custom domain `heetak.org` attached via CNAME. The site visually echoes joonanlab.github.io's modern dark/light, accent-driven aesthetic but uses its own evolutionary green + amber palette and an animated phylogenetic-tree hero on-brand for the lab name. Content is data-driven via JSON files (so adding members or news is a one-line edit, not a code change), publications are auto-extracted from ORCID and Google Scholar via a re-runnable script, and Korean translations live in a single `translations.json` consumed by a React Context. Deployment is automated via GitHub Actions: push to `main` → static export → deploy to GitHub Pages.

## User Stories

1. As a **prospective PhD applicant**, I want to read a clear lab tagline on the homepage in my preferred language (Korean or English), so that I can decide within 5 seconds whether the lab's research aligns with my interests.
2. As a **prospective postdoc**, I want to see the PI's full credentials (Heetak Lee, Ph.D., affiliations at IBS / UST / SKKU), so that I can evaluate the lab's institutional standing.
3. As a **prospective postdoc**, I want to see a dedicated "Join" page explaining how to apply, so that I know whether to email the PI or go through a formal program.
4. As a **collaborator**, I want to find the PI's institutional email and physical address, so that I can send mail or arrange a visit.
5. As a **Korean visitor**, I want a `한국어` toggle in the navigation, so that I can read the site in Korean without browser auto-translate.
6. As an **English-speaking visitor**, I want the site to default to English (or my preferred language if previously chosen), so that I see content immediately without toggling.
7. As a **conference attendee** who met the PI, I want to find recent papers on a Publications page, so that I can read the work before our next meeting.
8. As a **citation chaser**, I want publications grouped by year with links to DOI/preprint, so that I can locate the right paper quickly.
9. As a **department chair** considering inviting the PI for a seminar, I want to see what the lab studies at a glance via a Research page with 3 themed cards, so that I can shape the seminar invitation.
10. As a **current lab member**, I want my profile (name, photo, role, bio) to appear on the Team page under the right role bucket, so that visitors can find me.
11. As a **lab alumnus**, I want to be listed on the Alumni page with my current position, so that the lab maintains a record of my training.
12. As a **journalist or science writer**, I want a News section ordered by date with short blurbs, so that I can find recent awards, papers, and milestones.
13. As an **accessibility-sensitive visitor**, I want the site to respect my system dark-mode preference and offer a manual toggle, so that I can read without eye strain.
14. As a **mobile visitor** (≥40% of traffic on academic sites), I want every page to be readable and navigable on a phone, so that I don't bounce.
15. As a **PI** maintaining the site, I want to add a news item by editing one line of JSON and pushing to main, so that I don't have to learn React.
16. As a **PI**, I want to re-extract my publications from ORCID with a single command when new papers come out, so that the publications page stays current without manual entry.
17. As a **PI**, I want the site to be deployed automatically on every push to main, so that I don't have to think about deployment.
18. As a **PI**, I want a custom domain (`heetak.org`) configured via CNAME, so that the public URL is memorable and stable independent of GitHub's hosting.
19. As a **search engine crawler**, I want each page to have correct OpenGraph and meta tags, so that the site appears properly in Google and social-media previews.
20. As a **Google Scholar bot**, I want publication metadata in machine-readable form on the Publications page, so that the lab's citation graph is indexed correctly.
21. As a **first-time visitor**, I want to see an on-brand animated hero (phylogenetic tree) that signals "evolution + omics," so that the lab's identity is communicated visually before I read anything.
22. As a **screen-reader user**, I want the phylogenetic tree hero to have an `aria-hidden` or descriptive label, so that I'm not flooded with meaningless SVG content.
23. As a **PI managing translations**, I want all UI strings in a single `translations.json` with `{key: {en, ko}}` entries, so that I can scan and edit in one place.
24. As a **future contributor** to the codebase, I want a `README.md` explaining how to add a member, news item, or publication, so that I can contribute without reading the source.
25. As a **PI**, I want test coverage on the translation lookup logic, so that broken keys or missing translations surface in CI rather than at runtime.
26. As a **PI**, I want a one-time setup that creates the GitHub repo, installs `gh` CLI, scaffolds the project, and pushes the first commit, so that I'm not blocked on environment setup.

## Implementation Decisions

### Tech stack

- **Next.js 15** + **React 19** + **TypeScript** + **Tailwind CSS 4**, statically exported (`output: 'export'`) for GitHub Pages compatibility.
- **`.nojekyll`** file at repo root so GitHub Pages serves files starting with `_` (Next.js asset directories).
- No backend, no database, no API routes — all data lives in JSON files under `data/` and is read at build time.
- Build artifact: `out/` directory pushed to `gh-pages` branch by GitHub Actions.

### Repository and URL

- Repo: `leo-laboratory/leo-laboratory.github.io` (under the existing GitHub org `leo-laboratory`).
- Default URL: `https://leo-laboratory.github.io/`.
- Custom domain `heetak.org` attached via `CNAME` file at repo root. PI handles DNS A/AAAA records to GitHub Pages IPs externally.
- HTTPS enforced via GitHub Pages setting.

### Built from scratch, not forked

- The reference site (joonanlab.github.io) is unlicensed. We do **not** copy any source files. We rebuild a similar layout using the same general stack but our own code, palette, and hero animation.

### Visual identity

- **Default theme:** light mode. Toggle to dark via `☾` button in nav.
- **Palette:**
  - Light mode: bg `#fafafa`/`#ffffff`, text `#0f172a`/`#475569`, primary accent `#047857` (emerald), highlight `#d97706` (amber).
  - Dark mode: bg `#0a0a0f`/`#111118`, text `#f1f5f9`/`#94a3b8`, primary accent `#10b981`, highlight `#f59e0b`.
- **Typography:** Inter (Latin) + Noto Sans KR (Korean), loaded via `next/font`.
- **Hero animation:** custom SVG phylogenetic tree, generated procedurally from a seed (deterministic per visit), with gentle drift animation via `requestAnimationFrame`. Respects `prefers-reduced-motion`.

### Internationalization

- Single `data/translations.json` of the shape `{ "nav.home": { "en": "Home", "ko": "홈" }, ... }`.
- `<LocaleProvider>` React Context holds current locale, persists choice to `localStorage`, falls back to `en` for missing `ko` keys.
- `useTranslation()` hook exposes `t(key)` and `locale`. No third-party i18n library — keeps the dependency surface small.

### Theme system

- `<ThemeProvider>` reads `localStorage` first, then `prefers-color-scheme`, then defaults to `light`. Sets `data-theme="light"|"dark"` on `<html>`.
- Tailwind reads theme via custom variant `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`.

### Site sections (10)

1. **Home** — Hero + tagline + research bento + news/pubs teaser + CTA to Join.
2. **Team** — Members grouped under 7 role buckets: PI, PhD–Master Integrative Program, PhD, Master, Project/Adjunct Member, Undergraduate Student, Alumni-link.
3. **Publications** — Grouped by year, descending.
4. **Research** — 3 theme cards with titles + descriptions (see below).
5. **News** — Time-ordered cards (newest first).
6. **Join** — Skeleton with intro text; PI fills application instructions later.
7. **Contact** — Address, emails, embedded map placeholder.
8. **Alumni** — Dedicated page (separate from current Team), populated as members depart.
9. **Notes / Blog** — Empty skeleton for v1; markdown post pipeline can be added later.
10. **Tools** — Empty skeleton for v1.

### Lab identity (data/lab.json — single source of truth)

```json
{
  "name": { "en": "LEO Lab", "ko": "LEO 연구실" },
  "fullName": { "en": "Lee's Evolution and Omics", "ko": "이희탁 진화·오믹스 연구실" },
  "founded": 2023,
  "tagline": { "en": "Omics for understanding Evolution", "ko": "진화를 이해하기 위한 오믹스" },
  "pi": {
    "name": "Heetak Lee",
    "credentials": "Ph.D.",
    "primaryAffiliation": "IBS Center for Genome Engineering",
    "appointments": [
      { "title": "Senior Research Fellow", "institution": "IBS Center for Genome Engineering" },
      { "title": "Associate Professor", "institution": "UST IBS School" },
      { "title": "University-Research Institute Professor", "institution": "SKKU Department of MetaBiohealth" }
    ],
    "orcid": "0000-0002-7093-842X",
    "scholarId": "WM0sg9cAAAAJ",
    "emails": ["leeheetak@ibs.re.kr", "leeheetak@gmail.com"]
  },
  "address": {
    "room": "C352",
    "line": "55 Expo-ro, Yuseong-gu",
    "city": "Daejeon",
    "postal": "34126",
    "country": "Republic of Korea"
  }
}
```

### Research themes (data/research.json seed)

1. **Evolutionary Cell Biology** — Decoding the diversity of cellular phenotypes and evolutionary dynamics across species utilizing high-resolution single-cell and spatial omics.
2. **Stem Cells & Cancer** — Uncovering the fundamental drivers of development and tumorigenesis by precisely modeling the complex interplay between intrinsic cellular states and extrinsic microenvironmental factors.
3. **Analytic Tool Development** — Designing advanced computational algorithms and innovative genetic engineering platforms.

### Deep modules (each with a small, stable interface)

1. **`lib/i18n`** — Surface: `t(key)`, `useTranslation()`, `<LocaleProvider>`, `setLocale(...)`. Hides translations lookup, persistence, fallback. Pure-function core for lookup.
2. **`lib/theme`** — Surface: `useTheme()`, `<ThemeProvider>`, `setTheme(...)`. Hides storage, system preference, DOM attribute. Pure resolver function for theme decision.
3. **`lib/data`** — Surface: `getTeam()`, `getAlumni()`, `getResearchAreas()`, `getNews()`, `getPublications()`, `getLabMeta()`. Pure transformers over JSON files; sorts and groups.
4. **`scripts/fetch-publications`** — CLI that reads ORCID + Scholar IDs from `data/lab.json`, hits ORCID REST API, scrapes Scholar (or falls back to manual paste), deduplicates by DOI, normalizes to `Publication[]`, writes `data/publications.json`. Re-runnable.
5. **`components/hero/PhyloTreeHero`** — Surface: `<PhyloTreeHero seed={n} />`. Split into pure `generateTree(seed, depth)` (deterministic, testable) and presentational `<TreeSVG tree={...} />`. Respects `prefers-reduced-motion`.

### Shallow page-wiring modules

- Sections: `LabHeader`, `LabFooter`, `ResearchBento`, `NewsAndPubsTeaser`, `CTAJoin`, `MemberCard`, `PublicationItem`, `NewsCard`, `LanguageToggle`, `ThemeToggle`.
- Pages: one per route in `app/`. Mostly composition over deep modules.
- Layout: `app/layout.tsx` mounts `<LocaleProvider>` and `<ThemeProvider>` and loads fonts.

### Deployment

- **GitHub Actions workflow** at `.github/workflows/deploy.yml`:
  - Trigger: push to `main`.
  - Steps: `actions/checkout` → `actions/setup-node` (Node 22) → `npm ci` → `next build` → `actions/upload-pages-artifact` (from `out/`) → `actions/deploy-pages`.
- **GitHub Pages settings:** Source = "GitHub Actions". HTTPS enforced.
- **CNAME file** at repo root containing `heetak.org`. PI configures DNS:
  - `A` records to GitHub Pages IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
  - Optionally `AAAA` records for IPv6.
- **First-time setup script** (`scripts/setup.sh` or inline in README) walks PI through `apt install gh`, `gh auth login`, then I create the empty repo via `gh repo create`.

### Assets

- User-provided, dropped into `/hdds/hdd2/0_LEOLAB_webpage/public/assets/`:
  - `logo.svg` (or PNG fallback) — referenced from `LabHeader`/`LabFooter`.
  - `team/heetak-lee.jpg` — referenced from PI `MemberCard`.
- Placeholder silhouette + typographic LEO wordmark used until files arrive.

## Testing Decisions

### Philosophy

Test **external behavior, not implementation details.** A good test for `t(key)` calls `t()` and asserts the returned string — it does not reach into the Context provider's internal state. A good test for `generateTree(seed, depth)` asserts properties of the returned tree (deterministic for same seed, correct branching factor) — not the order in which internal recursion happened. If a test breaks because we restructured a function but the behavior is identical, the test was wrong.

### Modules under test

Only one module gets formal tests in v1:

- **`lib/i18n`** — covers:
  - `t(key)` returns the English string when locale is `en`.
  - `t(key)` returns the Korean string when locale is `ko`.
  - `t(key)` falls back to English when locale is `ko` but the key has no `ko` entry.
  - `t(key)` returns the key itself (or empty string, decision pending) when key is missing entirely.
  - `setLocale('ko')` persists to `localStorage` and subsequent reads return `'ko'`.
  - Locale resolution prefers stored value over `navigator.language` over default `en`.

### Test stack

- **Vitest** (matches Next.js 15 conventions, fast, ESM-native). No Jest.
- Tests live in `lib/i18n/*.test.ts` alongside source.
- No e2e / Playwright in v1 — overkill for a static site.

### Prior art

- This is a greenfield project — no prior tests exist in the repo to mirror.
- Vitest test style follows the standard `describe / it / expect` pattern documented at vitest.dev.

### Modules deliberately NOT tested in v1

Per explicit decision: `lib/theme`, `scripts/fetch-publications`, `PhyloTreeHero` generator. Their bugs are low-impact and visually obvious in dev; cost of test setup exceeds payoff at v1. Can be revisited if regressions happen.

## Out of Scope

- **Backend / database / CMS.** All content is JSON files in the repo.
- **Authenticated admin UI.** PI edits JSON files directly.
- **Search functionality.** No site-wide search.
- **Comment system on blog posts.** Notes section is empty in v1 anyway.
- **Analytics integration** (e.g., Google Analytics, Plausible). Can be added as a follow-up.
- **Email newsletter / RSS feed.** No subscription mechanism.
- **Member portal / lab-internal pages.** All content is public.
- **Automated nightly publications re-extraction.** Fetcher is run manually by the PI when new papers come out.
- **Tools section content.** Page renders but is empty; content added later.
- **Notes/Blog content + MDX pipeline.** Page renders skeleton; full blog infrastructure deferred.
- **Join page application form.** Static text only; PI adds detailed instructions later.
- **Embedded interactive map on Contact page.** Static address text + a link to Naver/Google Maps. No iframe embed in v1.
- **Korean translation polish.** I'll provide reasonable Korean for UI strings; PI is expected to review and refine before launch.
- **SEO sitemap.xml beyond the Next.js default.** Default `next-sitemap` config; deep SEO tuning deferred.
- **e2e tests, visual regression tests, Storybook.** Not in v1.
- **CONTRIBUTING.md, CODE_OF_CONDUCT.md.** Standalone-PI lab; not relevant yet.

## Further Notes

- **Joonanlab licensing risk avoided.** Their repo has no LICENSE file — copying it would be a copyright violation despite being publicly visible. We mirror approach, not code.
- **Original requested URL was `leolab.github.io`**, but the `leolab` GitHub user already exists (200 OK on `api.github.com/users/leolab`) and is not controlled by the PI. The `leo-laboratory` org IS controlled by the PI, so the URL becomes `leo-laboratory.github.io`. The custom domain `heetak.org` resolves this — most visitors will arrive via `heetak.org`, not the GitHub-issued URL.
- **PI's three institutional affiliations** are displayed equally on the PI bio (Team page), but the navbar/footer/contact use only the **primary** (IBS Center for Genome Engineering). This avoids the visual clutter of three logos competing.
- **Phylogenetic tree hero** is a deliberate visual signature distinct from joonanlab's "constellation" hero. Pure SVG, no canvas, no WebGL — keeps bundle small.
- **PRD will be published as a GitHub Issue** with the `ready-for-agent` label once the repo `leo-laboratory/leo-laboratory.github.io` is created. Until then, this `PRD.md` is the source of truth.
- **Issue tracker label `ready-for-agent`** doesn't exist yet (no repo). When the repo is created, the agent should also create this label before filing the PRD issue.
- **Working directory:** `/hdds/hdd2/0_LEOLAB_webpage/`. Currently empty save for this PRD.
- **Next step after PRD approval:** scaffold Next.js project, build the 5 deep modules + page-level wiring, run `npm run dev`, verify in browser, then bootstrap the GitHub repo and push.
