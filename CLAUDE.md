# CLAUDE.md — MDL Brand Website

**MatchDayLive Marketing Site** — public-facing brand and marketing site built with Astro, Tailwind CSS, and YAML-driven content.

---

## Personality & Communication

Keep all discussions concise and task-focused. Avoid banter and unnecessary commentary. Do not use exaggerated or motivational phrases such as "Amazing job," "Great idea," or similar expressions. Focus strictly on clear, accurate, and practical technical guidance.

---

## Session Start Protocol

**MANDATORY: At the start of EVERY new conversation, perform these steps in order:**

### 1. Load Context from OpenMemory

Query OpenMemory MCP to load relevant project context before doing anything else:

```javascript
mcp__openmemory__search-memories({ query: "MDL brand website patterns" })
mcp__openmemory__search-memories({ query: "common mistakes and corrections" })
mcp__openmemory__search-memories({ query: "current work and priorities" })
```

Use loaded context to:
- Avoid repeating past mistakes
- Follow established patterns
- Apply project-specific conventions
- Understand current priorities and in-progress work

### 1.5. Check Memory for Context

Check `memory/MEMORY.md` for relevant project context:
- If user mentions a specific MDL project (fan-dev, admin-dev, lambdas, brand-site), load the corresponding `memory/projects/*.md` file
- If debugging a recurring issue, scan claim titles in `memory/MEMORY.md` claims index
- Follow the loading rules — never load all project files at once

### 2. Check for Relevant Skills

Before responding to the user's first message — even before asking clarifying questions — check if any skill applies. See the **Skills System** section below.

### 3. Use GitNexus for Orientation

If working on code, run `gitnexus_query` or read `gitnexus://repo/{repo-name}/context` to understand the codebase before making changes.

---

## Critical Rules

**NEVER commit changes without asking the user first.** Do not assume the user wants a commit. Wait for explicit instruction.

**Always ask questions if unsure about what to do.** If more than 4 questions arise, create a file in `Docs/WIP/` and ask the user to answer them there.

**When working on an item that will require a status update in CLAUDE.md, make that update so future conversations won't duplicate work.**

**Always run the linter after making changes** — `npm run claude:lint` (runs `astro check`).

**Check existing patterns before implementing.** Review similar features/code for reusable patterns before writing new code.

---

## Astro Project Context

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Astro 6 (Static Site Generation) |
| **Styling** | Tailwind CSS v4 (via Vite plugin) |
| **Content** | YAML files in `content/` directory |
| **Types** | TypeScript (strict mode) |
| **SEO** | @astrojs/sitemap |
| **Deployment** | AWS Amplify (S3 + CloudFront) |

### Project Structure

```
src/
├── pages/           # Astro pages (.astro files)
├── layouts/         # Base HTML layouts
├── components/
│   ├── layout/      # Header, Footer
│   └── sections/    # CMS section components (mapped to YAML types)
├── lib/             # Utilities (yaml-loader)
├── types/           # TypeScript interfaces (shared with CMS)
└── styles/          # Tailwind global CSS + design tokens
content/             # YAML content (CMS-managed)
├── global/          # Site-wide content (navigation, footer)
└── pages/           # Page content (home.yaml, etc.)
```

### Key Commands

```bash
npm run dev          # Start dev server on :4321
npm run build        # Production build
npm run preview      # Preview production build
npm run claude:lint  # TypeScript checking (astro check)
```

---

## CMS Integration

This site's content is managed by **mdl-brand-site-cms** (separate repo).

### How It Works

- CMS reads/writes YAML files in `content/` directory
- Content types in `src/types/content.ts` must match CMS schema at `mdl-brand-site-cms/lib/types/content.types.ts`
- CMS pushes content changes to `staging` branch
- Publishing merges `staging` → `prod` → Amplify deploys

### Content Workflow

- **Development**: Edit YAML directly on `main` branch
- **Content editing**: CMS edits YAML, pushes to `staging`
- **Publishing**: CMS merges `staging` → `prod`, triggers deploy

### Adding New Section Types

When adding a new section component:
1. Add TypeScript interface to `src/types/content.ts`
2. Create Astro component in `src/components/sections/`
3. Register in page template's section renderer
4. Update `mdl-brand-site-cms` with matching schema and block editor

---

## Figma Integration — Design Source of Truth

**Figma is the SINGLE SOURCE OF TRUTH for all design decisions.**

- Homepage design: `https://www.figma.com/design/mHA4xTdD4loTmApGJF9NvC/Website?node-id=1-18&m=dev`
- **NEVER assume colors, fonts, spacing, or design tokens.** Always extract from Figma first.
- Use Figma MCP tools (`mcp__figma-local-mcp__get_variable_defs`, `mcp__figma-local-mcp__get_screenshot`, etc.)
- Design tokens go into `src/styles/global.css` as Tailwind v4 `@theme` variables

### Design Implementation Workflow

1. Connect to Figma design via MCP tools
2. Extract design tokens (colors, typography, spacing) into `global.css`
3. Implement components pixel-perfect from Figma specs
4. Verify responsive behavior against Figma frames

---

## OpenMemory — Team Knowledge Base

OpenMemory MCP is configured in `.mcp.json` with client name `MDL` for team-wide shared memory.

### Automatic Memory Storage Triggers

You **must** store memories to OpenMemory in the following situations:

1. **User Corrections** — when the user corrects an assumption, approach, or implementation detail
2. **Rule Violations** — when discovering patterns that violate project rules
3. **Project-Specific Patterns** — when encountering unique MDL patterns
4. **Common Mistakes** — when the same issue is encountered multiple times
5. **Performance Discoveries** — when finding effective optimization approaches
6. **Security Patterns** — when implementing or correcting security-related code

### Memory Storage Format

```
Context: [Brief situation description]
Issue/Correction: [What was wrong or what was learned]
Solution: [Correct approach or implementation]
Rule Reference: [Link to skill or rule if applicable]
Tags: [Comma-separated tags for retrieval]
```

---

## Docs-RAG — Local Documentation Search

A local RAG MCP server indexes all `/Docs` documents. Use it to save context instead of reading entire doc files.

### Usage

```
query_docs("authentication flow")    # Search docs — returns relevant chunks with sources
reindex_docs()                       # Rebuild index (run after commits that change /Docs)
get_stats()                          # Show index info
```

**Reindex after any commit that meaningfully changes `/Docs`** (skip for single bug fixes).

---

## MDL Platform Context

### Multi-Tenant Architecture

MDL is a multi-tenant OTT/streaming SaaS. Every tenant is a **channel** — an isolated workspace with separate data, users, and branding.

**Channel = Tenant.** This is the most important architectural concept:
- `channel_id` scopes ALL data (DynamoDB queries, S3 files, API requests)
- Each channel has its own Cognito user pool
- Channel switching = full context reload
- Data isolation is enforced at every layer

### Naming Convention

This applies across ALL MDL projects:

```javascript
// snake_case = Database fields from DynamoDB / API responses
const { media_item_id, is_visible, thumbnail_url } = apiResponse;

// camelCase = Frontend logic, UI state, local variables
const isEditing = false;
const handleSubmit = () => {};
```

### Tech Stack (Full Platform)

| Layer | Technology |
|-------|-----------|
| **Backend** | 237+ AWS Lambda functions (.mjs ESM), API Gateway v2, DynamoDB, SQS, S3 |
| **Fan Frontend** | React 18 + Vite + TypeScript, TanStack Query v4, MUI v5, styled-components |
| **Admin Frontend** | React 18 + Vite + JS, TanStack Query v4, Ant Design |
| **Brand Site** | Astro 6 (this repo) — islands architecture, zero-JS-by-default |
| **Auth** | AWS Cognito (per-channel user pools) |
| **Payments** | Stripe (subscriptions, payment intents, webhooks) |
| **Video** | Bitmovin Player/Analytics, HLS.js |
| **Monitoring** | Sentry, CloudWatch |
| **Issues** | Linear (team DEV, workspace MDL, prefix DEV-XXXX) |

---

## Skills System

This repo contains a curated skills library at `.claude/skills/`. Skills are invoked via the `Skill` tool and cover the full MDL development lifecycle.

**IMPORTANT: Check for a relevant skill before starting any task.** If there is even a 1% chance a skill applies, invoke it first.

### Key Skills for Brand Website Work

| Trigger | Skill |
|---------|-------|
| Astro / brand site work | `astro-specialist` |
| Any `DEV-XXXX` mention, "start work", "create PR", "progress update" | `linear-workflow` |
| Frontend (React islands, components) | `frontend-ux-specialist` |
| Security review, auth | `security-sentinel` |
| CI/CD, deploys, infrastructure | `devops-infrastructure-as-code` |
| Performance — CWV, bundle, images | `performance-engineer` |
| SEO, structured data, sitemap | `seo` skills |
| Git commits, branches, PRs | `git-workflow` |
| CHANGELOG updates, release notes | `changelog-standards` |
| "Which skill should I use?" | `skill-matrix` |
| Multi-skill workflows | `skill-chains` |
| Orchestrating multiple specialists | `skill-orchestrator` |

---

## MCP Tooling

The following MCP servers are configured in `.mcp.json` for team-wide use:

| Server | Purpose | When to use |
|--------|---------|-------------|
| **OpenMemory** | Team knowledge base | Session start, storing corrections, retrieving patterns |
| **Linear** | Issue management | All DEV-XXXX work (via `linear-workflow` skill) |
| **Context7** | Library documentation lookup | When you need up-to-date docs for any library |
| **GitNexus** | Code intelligence | Before editing, debugging, refactoring |
| **Figma** | Design file access | **Primary tool** — all design implementation |
| **Playwright** | Browser automation / E2E testing | Testing, screenshots, form filling |
| **Chrome DevTools** | Browser debugging | Console logs, network requests, performance |
| **Serena** | Semantic code analysis | Symbol-level code reading and editing |
| **Sequential Thinking** | Structured reasoning | Complex debugging, architectural decisions |
| **Docs-RAG** | Local documentation search | Querying `/Docs` without reading entire files |

---

## Common Gotchas

1. **Tailwind v4**: Uses `@import "tailwindcss"` in CSS, NOT `@tailwind` directives. Theme via `@theme {}` block.
2. **YAML content edits**: On `main` for dev only — CMS manages content on `staging`/`prod` branches
3. **Content types**: Must stay in sync between `src/types/content.ts` and `mdl-brand-site-cms/lib/types/content.types.ts`
4. **Figma tokens**: Never hardcode design values — always extract from Figma MCP
5. **Static output**: Astro builds to static HTML — no server-side runtime
6. **snake_case vs camelCase**: YAML content uses snake_case, TypeScript logic uses camelCase

---

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **mdl-brand-website**. Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |

## CLI

- Re-index: `npx gitnexus analyze`
- Check freshness: `npx gitnexus status`

<!-- gitnexus:end -->
