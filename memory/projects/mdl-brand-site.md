# MDL Brand Website — Project Context

## Overview
Public-facing marketing and brand site for MatchDayLive. Active development.

## Tech Stack
- **Framework:** Astro 6
- **Styling:** Tailwind CSS v4 (via Vite plugin)
- **Content:** YAML files managed by mdl-brand-site-cms
- **Types:** TypeScript (strict mode)
- **SEO:** @astrojs/sitemap, structured data
- **Deployment:** AWS Amplify (S3 + CloudFront)

## Architecture
- Static Site Generation (SSG) — zero JS by default
- YAML-driven content in `content/` directory
- Section-based page composition (hero, feature_grid, cta_banner)
- CMS manages content on staging/prod branches
- Design tokens extracted from Figma (source of truth)

## Key Patterns
- See `astro-specialist` skill for framework patterns
- Content types shared with `mdl-brand-site-cms`
- Figma MCP for all design implementation
- Performance: target 100 Lighthouse score

## CMS Integration
- **CMS Repo:** mdl-brand-site-cms
- **Workflow:** CMS edits YAML → pushes to `staging` → publish merges to `prod`
- **Content types:** Must stay in sync between site and CMS

## Current State
Active — Phase 2 scaffolding complete. Astro project initialized with Tailwind CSS, YAML loader, and CMS-compatible content types. Figma design extraction pending (Phase 6).
