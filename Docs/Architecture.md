# Architecture Document - mdl-brand-website

> MatchDayLive Brand & Marketing Site

**Last Updated**: 2026-03-18
**Phase**: 2 (Scaffolding Complete)
**Status**: Astro project initialized, CMS integration ready

---

## Change Log

- **2026-03-06**: Changed from React + Next.js to Astro with YAML-driven content
- **2026-02-24**: Initial Next.js architecture (superseded)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Rendering Strategy](#rendering-strategy)
4. [Content Management](#content-management)
5. [Hosting & Deployment](#hosting--deployment)
6. [Project Folder Structure](#project-folder-structure)
7. [Component Architecture](#component-architecture)
8. [Lottie Integration](#lottie-integration)
9. [Form Handling](#form-handling)
10. [API Layer](#api-layer)
11. [SEO Strategy](#seo-strategy)
12. [LLM Indexability](#llm-indexability)
13. [Styling Strategy](#styling-strategy)
14. [Static Asset Management](#static-asset-management)
15. [Dependencies](#dependencies)
16. [Deployment Pipeline](#deployment-pipeline)

---

## Overview

mdl-brand-site is the client-facing marketing site for MatchDayLive. It captures potential client interest through a lead form, showcases the product via Lottie animations and marketing content, and is optimized for both traditional SEO and LLM discoverability.

### Tech Stack Summary

| Layer | Technology |
|---|---|
| Framework | Astro 4+ (Static Site Generation) |
| Content | YAML files |
| Components | Astro components (with optional framework islands) |
| Language | TypeScript (strict mode) |
| Styling | TBD (Tailwind CSS or CSS Modules) |
| Animations | Lottie (Astro-compatible integration) |
| Forms | TBD (vanilla JS or lightweight framework island) |
| Hosting | AWS S3 + CloudFront |
| Backend | AWS API Gateway + Lambda + DynamoDB (existing) |
| Email | AWS Lambda (existing) |
| CMS | Future - will update YAML files |

---

## Architecture Decisions

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Framework | Astro | Zero JS by default, component-agnostic, excellent for content sites, built-in optimization, best-in-class performance. |
| 2 | Rendering | SSG (build-time) | Marketing site with mostly static content. Build-time rendering provides instant load times, zero server costs, and maximum performance. |
| 3 | Content Management | YAML files | Structured, version-controlled content that can be updated by future CMS. YAML is human-readable and easy to parse. |
| 4 | Hosting | S3 + CloudFront | Zero server cost, global CDN, simple deployment, same as previous architecture. |
| 5 | Components | Astro components (default) | Zero client JS unless explicitly needed. Can add React/Vue islands for interactive components like forms. |
| 6 | Content Structure | Component-based pages | Each page composed of reusable components configured via YAML content files. |
| 7 | Lottie | Lazy-loaded via client island | Lottie animations loaded only when needed, in client-side component islands. |
| 8 | Forms | Client island (framework TBD) | Form handling requires client JS. Can use React/Vue/Svelte island or vanilla JS. |
| 9 | API | Thin fetch wrapper | Environment-based URL switching, typed request/response, minimal abstraction. |
| 10 | SEO | Built-in Astro SEO | Astro has excellent built-in SEO support with frontmatter metadata, sitemap generation, and semantic HTML. |
| 11 | LLM indexability | `llms.txt` + semantic HTML | Emerging standard for AI discoverability. Semantic HTML benefits both SEO and LLM parsing. |
| 12 | CMS Integration | Future phase | CMS (to be built/integrated) will update YAML files and trigger builds. |

---

## Rendering Strategy

### Build-Time Static Site Generation

Astro generates all pages at build time, producing optimized static HTML, CSS, and minimal JavaScript.

**Key Benefits:**
- **Zero JavaScript by default**: Astro components render to static HTML with no client JS overhead
- **Island Architecture**: Interactive components (forms, animations) load JS only where needed
- **Build-time rendering**: All content processed during build, not runtime
- **Optimal performance**: No hydration cost, instant TTI (Time to Interactive)
- **Zero server cost**: Fully static output deployable to CDN

### Astro Island Architecture

```
┌─────────────────────────────────────────┐
│          Static HTML Page                │
│  (Header, Footer, Content - Zero JS)    │
│                                          │
│  ┌────────────────┐  ┌────────────────┐ │
│  │ Lottie Island  │  │  Form Island   │ │
│  │ (JS loaded)    │  │  (JS loaded)   │ │
│  └────────────────┘  └────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

Interactive components become "islands" that load JavaScript independently, while the rest of the page remains static HTML.

### Why Astro Over Next.js

| Factor | Astro | Next.js |
|---|---|---|
| Default JS shipped | 0KB (static HTML) | ~85KB+ (React + hydration) |
| Content-focused | Optimized for content sites | Full-stack framework |
| Learning curve | Simple (HTML-like) | Steeper (React patterns) |
| Build output | Pure HTML/CSS | HTML + React runtime |
| Interactive components | Islands (opt-in) | Everywhere (opt-out) |
| Framework choice | Any (React/Vue/Svelte) | React only |

For a marketing site with primarily static content and isolated interactivity (forms, animations), Astro's architecture is optimal.

### astro.config.mjs Configuration

```javascript
// Phase 2: Actual configuration
// astro.config.mjs
export default {
  output: 'static',
  site: 'https://matchdaylive.com',
  build: {
    format: 'directory' // Creates /about/index.html instead of /about.html
  },
  integrations: [
    // sitemap() - for sitemap.xml generation
    // TBD: styling integration (Tailwind, etc.)
  ]
}
```

---

## Content Management

### YAML-Driven Content Architecture

All page content (text, images, links, configurations) is stored in YAML files. Components read from these YAML files to render content.

### Content Structure

```
content/
├── global/
│   ├── navigation.yaml       # Header navigation links
│   ├── footer.yaml           # Footer content and links
│   └── metadata.yaml         # Site-wide metadata
│
├── pages/
│   ├── home.yaml             # Home page content
│   ├── features.yaml         # Features page content
│   ├── pricing.yaml          # Pricing page content
│   ├── about.yaml            # About page content
│   └── contact.yaml          # Contact page content
│
└── components/
    ├── hero.yaml             # Hero component variants
    ├── feature-grid.yaml     # Feature grid configurations
    └── testimonials.yaml     # Testimonial content
```

### Example YAML Structure

```yaml
# content/pages/home.yaml
page:
  title: "MatchDayLive | Live Sports Experience Platform"
  description: "Elevate your venue's sports experience with real-time engagement"

sections:
  - type: hero
    heading: "Transform Your Venue's Sports Experience"
    subheading: "Real-time engagement platform for live sports"
    cta:
      primary:
        text: "Request Demo"
        link: "/contact"
      secondary:
        text: "Learn More"
        link: "/features"
    background_image: "/images/home-hero.webp"
    animation: "hero-animation"

  - type: feature_grid
    heading: "Why MatchDayLive"
    features:
      - title: "Real-Time Engagement"
        description: "Connect with fans instantly during live events"
        icon: "/images/icons/engagement.svg"
        animation: "feature-engagement"
      # ... more features

  - type: cta_banner
    heading: "Ready to elevate your venue?"
    button:
      text: "Get Started"
      link: "/contact"
```

### Component-YAML Integration

Astro components read YAML content at build time:

```astro
---
// src/pages/index.astro
import { loadYaml } from '@/lib/yaml-loader';
import Hero from '@/components/Hero.astro';
import FeatureGrid from '@/components/FeatureGrid.astro';

const homeContent = await loadYaml('pages/home.yaml');
---

<Layout title={homeContent.page.title} description={homeContent.page.description}>
  {homeContent.sections.map(section => {
    if (section.type === 'hero') {
      return <Hero {...section} />;
    } else if (section.type === 'feature_grid') {
      return <FeatureGrid {...section} />;
    }
    // ... handle other section types
  })}
</Layout>
```

### Future CMS Integration

A CMS will be built or integrated to:
- Provide UI for editing YAML content
- Handle image uploads and management
- Version control for content changes
- Trigger builds when content updates
- User permissions and workflows

The CMS will update YAML files in the repository and trigger a rebuild/redeploy.

---

## Hosting & Deployment

### S3 + CloudFront Architecture

```
[Build Output] --> [S3 Bucket] --> [CloudFront Distribution] --> [Route 53 DNS]
    (dist/)        (origin)        (CDN edge locations)          (custom domain)
```

**S3 Bucket Configuration:**
- Static website hosting enabled
- Public access blocked (CloudFront OAI/OAC only)
- Versioning enabled for rollback capability

**CloudFront Configuration:**
- Custom domain with ACM SSL certificate
- Default root object: `index.html`
- Custom error responses: 404 -> `/404/index.html`
- Cache policy: CachingOptimized for static assets
- Origin access control (OAC) to S3

**Route 53:**
- A record alias to CloudFront distribution
- AAAA record for IPv6 support

### Cache Strategy

| Path Pattern | Cache TTL | Behavior |
|---|---|---|
| `/_astro/*` | 1 year (immutable) | Hashed filenames, safe to cache forever |
| `/animations/*` | 1 week | Lottie files, versioned by filename |
| `/images/*` | 1 week | Pre-optimized images |
| `/*.html` | 5 minutes | HTML pages, short TTL for quick updates |
| `/sitemap*.xml` | 1 day | Sitemap files |
| `/robots.txt` | 1 day | Robots configuration |
| `/llms.txt` | 1 day | LLM discovery file |

---

## Project Folder Structure

```
mdl-brand-site/
├── public/
│   ├── animations/           # Lottie JSON files
│   ├── images/               # Pre-optimized static images
│   ├── fonts/                # Self-hosted font files (if needed)
│   ├── favicon.ico
│   ├── robots.txt            # Generated by Astro integration
│   └── llms.txt              # LLM discoverability file
│
├── src/
│   ├── pages/                # Astro pages (file-based routing)
│   │   ├── index.astro       # Home page (/)
│   │   ├── about.astro       # About page (/about)
│   │   ├── features.astro    # Features page (/features)
│   │   ├── pricing.astro     # Pricing page (/pricing)
│   │   ├── contact.astro     # Contact page (/contact)
│   │   └── 404.astro         # 404 page
│   │
│   ├── layouts/              # Layout components
│   │   ├── BaseLayout.astro  # Root layout (HTML structure, head, scripts)
│   │   └── PageLayout.astro  # Page layout (header, footer, main)
│   │
│   ├── components/           # Reusable components
│   │   ├── layout/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Navigation.astro
│   │   │   └── Section.astro
│   │   ├── ui/               # Base UI components
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   └── Grid.astro
│   │   ├── sections/         # Page section components
│   │   │   ├── Hero.astro
│   │   │   ├── FeatureGrid.astro
│   │   │   ├── CTABanner.astro
│   │   │   └── Testimonials.astro
│   │   ├── forms/            # Form components (client islands)
│   │   │   ├── ContactForm.tsx      # React/Vue/Svelte island
│   │   │   └── LeadCaptureForm.tsx
│   │   ├── animations/       # Lottie components (client islands)
│   │   │   └── LottiePlayer.tsx
│   │   └── seo/              # SEO components
│   │       ├── SEO.astro
│   │       └── JsonLd.astro
│   │
│   ├── lib/                  # Utilities and helpers
│   │   ├── yaml-loader.ts    # YAML content loading utility
│   │   ├── api/              # API layer
│   │   │   ├── client.ts     # Fetch wrapper
│   │   │   ├── endpoints.ts  # Typed endpoint definitions
│   │   │   └── types.ts      # API types
│   │   ├── seo/              # SEO utilities
│   │   │   ├── metadata.ts   # Metadata helpers
│   │   │   └── jsonld.ts     # JSON-LD schema builders
│   │   └── utils/            # General utilities
│   │       └── cn.ts         # Class name utility
│   │
│   ├── styles/               # Global styles
│   │   └── global.css        # Global CSS (styling system TBD)
│   │
│   └── types/                # TypeScript types
│       ├── content.ts        # Content/YAML type definitions
│       └── api.ts            # API-related types
│
├── content/                  # YAML content files
│   ├── global/
│   │   ├── navigation.yaml
│   │   ├── footer.yaml
│   │   └── metadata.yaml
│   ├── pages/
│   │   ├── home.yaml
│   │   ├── features.yaml
│   │   ├── pricing.yaml
│   │   ├── about.yaml
│   │   └── contact.yaml
│   └── components/
│       └── (component-specific content)
│
├── Docs/                     # Project documentation
│   ├── Architecture.md       # This file
│   ├── Diagrams/
│   ├── WIP/
│   └── Wireframes/
│
├── Reference/                # Design reference files
│   └── ScreenDesigns/
│
├── astro.config.mjs          # Astro configuration
├── tsconfig.json             # TypeScript configuration
├── package.json
└── .env                      # Environment variables (not committed)
```

### Folder Conventions

- **File-based routing**: Pages in `src/pages/` map directly to URLs
- **Component organization**: By type (layout, ui, sections, forms, animations)
- **Content separation**: All YAML content in dedicated `content/` directory
- **Type safety**: TypeScript types for content schemas
- **One component per file**: Clear, focused components

---

## Component Architecture

### Astro Component Structure

Astro components have a clear separation between logic (frontmatter) and template:

```astro
---
// Component logic (runs at build time)
import type { HeroProps } from '@/types/content';

interface Props extends HeroProps {}

const { heading, subheading, cta, background_image, animation } = Astro.props;
---

<!-- Component template (static HTML) -->
<section class="hero" style={`background-image: url(${background_image})`}>
  <div class="hero-content">
    <h1>{heading}</h1>
    <p>{subheading}</p>
    <div class="hero-cta">
      <a href={cta.primary.link} class="btn btn-primary">{cta.primary.text}</a>
      {cta.secondary && (
        <a href={cta.secondary.link} class="btn btn-secondary">{cta.secondary.text}</a>
      )}
    </div>
  </div>

  {animation && (
    <LottiePlayer name={animation} client:visible />
  )}
</section>
```

### Static vs Interactive Components

**Static Components (Astro):**
- Header, Footer, Navigation
- Hero sections, Feature grids
- Text content, Image galleries
- SEO components (JSON-LD)
- Layout components
- **Result**: Zero JavaScript shipped

**Interactive Components (Framework Islands):**
- Forms (ContactForm, LeadCaptureForm)
- Lottie animations (LottiePlayer)
- Mobile menu toggle (if needed)
- Any component requiring: state, event handlers, browser APIs
- **Result**: JavaScript loaded only for these islands

### Client Directives

Astro provides directives to control when island JavaScript loads:

| Directive | Behavior | Use Case |
|---|---|---|
| `client:load` | Load JS immediately | Critical interactive elements |
| `client:idle` | Load JS when main thread idle | Non-critical interactivity |
| `client:visible` | Load JS when in viewport | Below-fold animations, lazy forms |
| `client:media` | Load JS on media query match | Mobile-only components |
| `client:only` | No SSR, client-only rendering | Browser-dependent components |

Example:
```astro
<LottiePlayer name="hero-animation" client:visible />
<ContactForm client:idle />
```

---

## Lottie Integration

### Loading Strategy

Lottie animations are loaded as client islands with `client:visible` directive to defer JavaScript until the animation enters the viewport.

### LottiePlayer Component (Framework Island)

Framework choice TBD (React/Vue/Svelte). Example with React:

```tsx
// src/components/animations/LottiePlayer.tsx
import { useEffect, useRef, useState } from 'react';
import type { LottiePlayer as LottiePlayerType } from 'lottie-web';

interface Props {
  name: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export default function LottiePlayer({
  name,
  loop = true,
  autoplay = true,
  className = ''
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [player, setPlayer] = useState<LottiePlayerType | null>(null);

  useEffect(() => {
    // Dynamically import lottie-web
    import('lottie-web').then(({ default: lottie }) => {
      if (!containerRef.current) return;

      const animationPlayer = lottie.loadAnimation({
        container: containerRef.current,
        path: `/animations/${name}.json`,
        loop,
        autoplay,
        renderer: 'svg'
      });

      setPlayer(animationPlayer);
    });

    return () => {
      player?.destroy();
    };
  }, [name, loop, autoplay]);

  return <div ref={containerRef} className={className} />;
}
```

### Animation Registry

```typescript
// src/lib/animation-registry.ts
export const animations = {
  heroAnimation: 'hero-animation',
  featureDemo: 'feature-demo',
  loadingSpinner: 'loading',
} as const;

export type AnimationName = typeof animations[keyof typeof animations];
```

### File Conventions

- Lottie files in `public/animations/`
- Kebab-case naming: `hero-animation.json`
- Optimized before committing (under 200KB target)
- Referenced in YAML content files by name

---

## Form Handling

### Form Architecture

Forms are implemented as framework islands (React/Vue/Svelte TBD) with:
- Client-side validation
- API submission to AWS API Gateway
- Loading and error states
- Success feedback

### Form Flow

```
User Input
    ↓
Client-side validation (zod or similar)
    ↓
API submission (fetch wrapper)
    ↓
API Gateway → Lambda → DynamoDB
    ↓
Email trigger (existing Lambda)
    ↓
Success/Error UI feedback
```

### Example Form Component (React)

```tsx
// src/components/forms/ContactForm.tsx
import { useState } from 'react';
import { apiClient } from '@/lib/api/client';

export default function ContactForm() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('submitting');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const result = await apiClient.post('/contact', data);
      setFormState('success');
    } catch (err) {
      setFormState('error');
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {formState === 'success' && <div>Thank you for contacting us!</div>}
      {formState === 'error' && <div>Error: {error}</div>}
    </form>
  );
}
```

Usage in Astro page:
```astro
<ContactForm client:idle />
```

---

## API Layer

### Fetch Wrapper

```typescript
// src/lib/api/client.ts
const BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://api.matchdaylive.com';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const apiClient = {
  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error.message };
    }
  }
};
```

### Environment Variables

```
# .env
PUBLIC_API_URL=https://api.matchdaylive.com

# .env.development
PUBLIC_API_URL=http://localhost:3001
```

Note: In Astro, public variables must be prefixed with `PUBLIC_` to be accessible in client-side code.

---

## SEO Strategy

### Built-in Astro SEO

Astro has excellent SEO support through:
- Component-based metadata management
- Built-in sitemap generation
- Semantic HTML by default
- Static rendering (fast TTFB)

### SEO Component

```astro
---
// src/components/seo/SEO.astro
interface Props {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

const {
  title,
  description,
  canonical,
  ogImage = '/images/og-default.jpg',
  noindex = false
} = Astro.props;

const siteUrl = 'https://matchdaylive.com';
const fullCanonical = canonical || `${siteUrl}${Astro.url.pathname}`;
---

<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={fullCanonical} />

{noindex && <meta name="robots" content="noindex, nofollow" />}

<!-- Open Graph -->
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={fullCanonical} />
<meta property="og:image" content={`${siteUrl}${ogImage}`} />
<meta property="og:type" content="website" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
```

Usage:
```astro
---
// src/pages/index.astro
import SEO from '@/components/seo/SEO.astro';
---

<head>
  <SEO
    title="MatchDayLive | Live Sports Experience Platform"
    description="Elevate your venue's sports experience"
  />
</head>
```

### JSON-LD Structured Data

```astro
---
// src/components/seo/JsonLd.astro
interface Props {
  type: 'Organization' | 'WebSite' | 'Product' | 'ContactPage';
  data: Record<string, unknown>;
}

const { type, data } = Astro.props;
---

<script type="application/ld+json" set:html={JSON.stringify({
  '@context': 'https://schema.org',
  '@type': type,
  ...data
})} />
```

### Sitemap Generation

Astro has built-in sitemap support via integration:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://matchdaylive.com',
  integrations: [sitemap()]
});
```

---

## LLM Indexability

### llms.txt

```
# MatchDayLive

> Live sports experience platform for venues, broadcasters, and fans.

## Pages

- [Home](https://matchdaylive.com/): Overview of MatchDayLive platform
- [Features](https://matchdaylive.com/features/): Platform capabilities and features
- [Pricing](https://matchdaylive.com/pricing/): Plans and pricing information
- [About](https://matchdaylive.com/about/): Company information and team
- [Contact](https://matchdaylive.com/contact/): Get in touch

## Key Information

- Company: MatchDayLive
- Product: Live sports experience platform
- Target: Venues, broadcasters, sports organizations
```

### Semantic HTML

Astro encourages semantic HTML by default. Best practices:
- Use `<main>` for primary content
- Use `<article>` for self-contained content
- Use `<section>` with headings for content sections
- Use `<nav>` for navigation
- Use `<header>` and `<footer>` for page landmarks
- Proper heading hierarchy (`<h1>`-`<h6>`)

### Crawler Access (robots.txt)

```
User-agent: *
Allow: /

# AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Anthropic-AI
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://matchdaylive.com/sitemap-index.xml
```

---

## Styling Strategy

**TBD**: Need to decide on styling approach:

### Option 1: Tailwind CSS
- Utility-first CSS framework
- Requires `@astrojs/tailwind` integration
- Good for rapid development
- Larger HTML but smaller CSS

### Option 2: CSS Modules
- Scoped CSS per component
- Native browser CSS
- Smaller HTML but more CSS files
- Good for custom designs

### Option 3: Vanilla CSS
- Global styles with CSS custom properties
- Simple, no build tools required
- Manual scoping management

**Decision needed**: Pending Figma design review. Tailwind recommended for component-based approach and rapid iteration.

---

## Static Asset Management

### Images
- Pre-optimize all images (WebP format)
- Store in `public/images/`
- Use Astro's built-in `<Image>` component for optimization
- Provide width, height, and alt attributes
- Descriptive filenames: `home-hero-1920.webp`

### Fonts
- Self-host or use web fonts (TBD pending Figma)
- If self-hosting: store in `public/fonts/`
- Preload critical fonts for performance

### Lottie Files
- Store in `public/animations/`
- Optimize before committing (under 200KB target)
- Kebab-case naming: `hero-animation.json`

---

## Dependencies

### Production Dependencies (Estimated)

| Package | Purpose | Approx Size |
|---|---|---|
| `astro` | Framework | -- |
| `lottie-web` | Lottie player | ~250KB (lazy loaded) |
| Framework TBD | For islands (React/Vue/Svelte) | Varies |
| Validation library TBD | Form validation (zod or similar) | ~13KB |

### Development Dependencies

| Package | Purpose |
|---|---|---|
| `typescript` | Type checking |
| `prettier` | Code formatting |
| `eslint` | Linting |
| Styling tools | TBD (Tailwind/PostCSS if needed) |

---

## Deployment Pipeline

### Build & Deploy Flow

```
Developer pushes to main
       ↓
GitHub Actions CI
       ↓
  ┌────────────┐
  │ Install     │  npm ci
  │ Lint        │  npm run lint
  │ Type check  │  npm run check (astro check)
  │ Build       │  npm run build (astro build → /dist)
  └────────────┘
       ↓
  Upload /dist → S3 bucket
       ↓
  Invalidate CloudFront cache
       ↓
  Live on CDN
```

### GitHub Actions Workflow (Conceptual)

Trigger: Push to `main` branch

Steps:
1. Checkout code
2. Setup Node.js (LTS)
3. Install dependencies (`npm ci`)
4. Run linting (`npm run lint`)
5. Run type checking (`npm run check`)
6. Build static site (`npm run build`)
7. Sync to S3 (`aws s3 sync ./dist s3://bucket-name --delete`)
8. Invalidate CloudFront (`aws cloudfront create-invalidation`)

### Environment Variables in CI

| Variable | Source | Purpose |
|---|---|---|
| `PUBLIC_API_URL` | GitHub Secrets | API Gateway base URL |
| `AWS_ACCESS_KEY_ID` | GitHub Secrets | S3/CloudFront deployment |
| `AWS_SECRET_ACCESS_KEY` | GitHub Secrets | S3/CloudFront deployment |
| `AWS_REGION` | GitHub Secrets | AWS region |
| `S3_BUCKET_NAME` | GitHub Secrets | Deployment target |
| `CLOUDFRONT_DIST_ID` | GitHub Secrets | Cache invalidation target |

---

## Future CMS Integration

### CMS Requirements

The future CMS will need to:
- Edit YAML content files via UI
- Handle image uploads to public/images/
- Preview changes before publishing
- Trigger builds on publish
- Version control integration (commit to git)
- User authentication and permissions

### CMS Options to Evaluate

1. **Custom-built CMS**: Tailored to YAML structure
2. **Headless CMS with Git**: Forestry.io, TinaCMS, Decap CMS
3. **API-based CMS**: Contentful, Sanity (would require architecture change from YAML)

### Build Trigger Flow

```
User edits content in CMS
       ↓
CMS updates YAML file(s)
       ↓
CMS commits to repository
       ↓
GitHub webhook triggers build
       ↓
Site rebuilds with new content
       ↓
Deployed to S3/CloudFront
```

---

## Open Questions

Document open questions here as they arise during Phase 1:

1. **Styling approach**: Tailwind CSS vs CSS Modules vs Vanilla CSS?
2. **Framework for islands**: React, Vue, or Svelte for interactive components?
3. **Form validation**: Zod, Yup, or native browser validation?
4. **CMS choice**: Custom-built or existing headless CMS?
5. **Image optimization**: Use Astro's Image component or pre-optimize manually?

---

## Next Steps (Phase 1)

- [ ] Create Astro prototype/test sub-project
- [ ] Test YAML content loading
- [ ] Test component architecture with sample page
- [ ] Evaluate styling approach (Tailwind vs alternatives)
- [ ] Test Lottie integration as client island
- [ ] Test form submission to API
- [ ] Finalize component structure plan
- [ ] Plan YAML schema for all pages

---

## Appendix: Architecture Decision Records

### ADR-001: Astro over Next.js

**Context**: Need a framework for marketing site with primarily static content.
**Decision**: Use Astro instead of Next.js.
**Rationale**: Astro provides zero JavaScript by default, optimized for content sites, and allows framework-agnostic islands for interactivity. For a marketing site, this results in better performance, simpler architecture, and lower complexity than Next.js.

### ADR-002: YAML-Driven Content

**Context**: Need content management approach that supports future CMS integration.
**Decision**: Use YAML files for all content, loaded at build time.
**Rationale**: YAML is human-readable, structured, version-controlled, and easily updated by a future CMS. Provides type safety via TypeScript schemas and keeps content separate from components.

### ADR-003: Build-Time Rendering Only

**Context**: Marketing site rendering strategy.
**Decision**: Build-time static site generation only (no SSR/ISR).
**Rationale**: All content changes via CMS will trigger rebuilds. No need for runtime rendering. Static output provides maximum performance, zero server cost, and simple deployment.

### ADR-004: Island Architecture for Interactivity

**Context**: Need interactivity for forms and animations.
**Decision**: Use Astro islands with framework components (React/Vue/Svelte TBD).
**Rationale**: Islands load JavaScript only where needed, keeping the majority of the site as static HTML. This provides optimal performance while still supporting interactive elements.
