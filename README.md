# MDL Brand Website

The public marketing site for **MatchDayLive** — the all-in-one OTT platform
for sports clubs, leagues and federations.

Built with [Astro 6](https://astro.build/) (static site generation),
[Tailwind CSS v4](https://tailwindcss.com/) and YAML-driven content managed
by [`mdl-brand-site-cms`](https://github.com/MDLDev-site/mdl-brand-site-cms).

Production: [matchdaylive.com](https://matchdaylive.com)
Staging: deployed from the `staging` branch via AWS Amplify.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:4321
```

### Other scripts

| Script | Does |
|---|---|
| `npm run dev` | Astro dev server with HMR |
| `npm run build` | Production static build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run claude:lint` | `astro check` — TypeScript + Astro diagnostics |
| `npm run claude:format` | `prettier --write .` |

Node 20+ recommended.

---

## Project structure

```
src/
├── pages/               # Astro routes (.astro)
│   ├── index.astro        /
│   ├── features.astro     /features
│   ├── pricing.astro      /pricing
│   ├── contact.astro      /contact
│   ├── about.astro        /about
│   ├── legal/             /legal + /legal/[slug]
│   └── llms.txt.ts        /llms.txt
├── layouts/
│   └── BaseLayout.astro   <head>, JSON-LD, header, footer
├── components/
│   ├── layout/            Header, Footer
│   └── sections/          CMS section components (mapped to YAML types)
├── lib/                   yaml-loader
├── types/content.ts       TypeScript interfaces shared with the CMS
└── styles/global.css      Tailwind v4 @theme tokens + typography classes

content/
├── global/                Site-wide (navigation, footer)
├── pages/                 home, features, pricing, contact, 404
└── legal/                 _index + one file per legal document

public/                    Static assets served as-is (favicon, /images/*)
```

---

## Content model

All content lives in YAML under `content/`. Page templates load YAML at
build time and render typed sections.

### Adding a new section type

1. Add the TypeScript interface to `src/types/content.ts`.
2. Build the Astro component in `src/components/sections/`.
3. Register it in the page template's section renderer (see `src/pages/index.astro`
   for an example of how `sections[]` maps `type` → component).
4. Mirror the schema in [`mdl-brand-site-cms`](https://github.com/MDLDev-site/mdl-brand-site-cms)
   so editors can author it through the block editor.

### Editing content

- **Local development:** edit YAML on `main` directly.
- **Content editing:** the CMS writes to `staging`; editors do not touch `main`.
- **Publishing:** the CMS merges `staging` → `prod`, which triggers the Amplify
  deploy to matchdaylive.com.

### Conventions

- YAML uses snake_case keys (e.g. `type: logo_banner`, `background_image`).
- TypeScript / Astro code uses camelCase.
- Images live under `public/images/{section}/`. Reference them with absolute
  paths from the YAML (e.g. `/images/features/multi-team.png`).

---

## Design source of truth

**Figma is authoritative for all design decisions.** Don't assume colours,
spacing, or typography — extract from Figma first.

- Homepage frame: `https://www.figma.com/design/mHA4xTdD4loTmApGJF9NvC/Website?node-id=1-18`
- Design tokens live in `src/styles/global.css` under the Tailwind v4 `@theme`
  block. Colours, fonts, spacing, breakpoints all map 1:1 to Figma variables.

---

## Deployment

| Branch | Environment | Trigger |
|---|---|---|
| `main` | dev sandbox | manual builds |
| `staging` | brand-staging.matchdaylive.com (Amplify) | every merge to `staging` |
| `prod` | matchdaylive.com (Amplify) | merge `staging` → `prod` (handled by the CMS) |

Feature work lives on `feature/dev-XXXX-…` branches off `staging`, opened as
PRs targeting `staging`, merged after review.

---

## Linear workflow

All work tracks against the **DEV** project in Linear. Branch / commit
convention:

```
feature/dev-1234-short-description
fix/dev-1234-short-description

feat(scope): description (DEV-1234)
fix(scope): description (DEV-1234)
```

See `.claude/skills/linear-workflow` for the full lifecycle (status IDs,
state transitions, PR template).

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Astro 6 |
| Styling | Tailwind CSS v4 (Vite plugin) |
| Content | YAML in `content/` |
| Types | TypeScript (strict) |
| SEO | `@astrojs/sitemap` |
| Deployment | AWS Amplify (S3 + CloudFront) |

Tailwind v4 specifics: uses `@import "tailwindcss"` in CSS (not `@tailwind`
directives). Theme via `@theme {}` block in `src/styles/global.css`.

---

## Further reading

- [`CLAUDE.md`](./CLAUDE.md) — agent guidance, MDL platform context,
  skills available in `.claude/skills/`.
- [`SETUP.md`](./SETUP.md) — post-template setup steps inherited from
  the MDL baseline (GitHub secrets, MCP, GitNexus indexing).
- [`Docs/`](./Docs/) — design audits, asset inventories, work-in-progress
  notes.
