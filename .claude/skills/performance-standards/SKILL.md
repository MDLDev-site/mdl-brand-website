---
name: performance-standards
description: Team-wide performance standards covering Core Web Vitals targets, image optimization, network performance, build optimization, and monitoring. Auto-triggers on performance work, optimization tasks, or Lighthouse discussions.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

# MDL Performance Standards

**Purpose:** Performance optimization guidelines applicable across all MDL projects

## Core Performance Principles

1. **Measure first, optimize second** — use profilers and analytics
2. **Progressive enhancement** — core functionality first, enhancements later
3. **Lazy load everything non-critical** — reduce initial bundle/payload size
4. **Cache aggressively** — at every layer
5. **Mobile-first performance** — optimise for 3G networks

---

## Performance Budgets

### Core Web Vitals Targets

| Metric | Target | Maximum | Priority |
|--------|--------|---------|----------|
| **LCP** (Largest Contentful Paint) | <2.5s | 4.0s | Critical |
| **INP** (Interaction to Next Paint) | <200ms | 500ms | Critical |
| **CLS** (Cumulative Layout Shift) | <0.1 | 0.25 | High |
| **TTFB** (Time to First Byte) | <600ms | 1000ms | High |
| **FCP** (First Contentful Paint) | <1.8s | 3.0s | Medium |

### Network Performance Targets

- **3G Network:** Full page load <5s
- **4G Network:** Full page load <3s
- **WiFi:** Full page load <2s
- **API Response:** <500ms for data endpoints
- **Image Loading:** Progressive, lazy-loaded

---

## Image Optimisation

### Responsive Images

```html
<!-- ✅ Use srcset for responsive images -->
<img
  src="/images/hero-800.jpg"
  srcset="/images/hero-400.jpg 400w,
          /images/hero-800.jpg 800w,
          /images/hero-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px,
         (max-width: 1200px) 800px,
         1200px"
  alt="Hero banner"
  loading="lazy"
/>
```

### Format Priority

1. **WebP** — smallest, modern browsers
2. **AVIF** — even smaller where supported
3. **JPEG** — photographs, gradients
4. **PNG** — transparency, logos
5. **SVG** — icons, simple graphics

```html
<!-- ✅ Modern format with fallback -->
<picture>
  <source srcset="/image.avif" type="image/avif" />
  <source srcset="/image.webp" type="image/webp" />
  <img src="/image.jpg" alt="Fallback" loading="lazy" />
</picture>
```

### Lazy Loading

```html
<!-- ✅ Native lazy loading for below-the-fold images -->
<img src="/image.jpg" loading="lazy" alt="Description" />

<!-- ✅ Eager load above-the-fold (LCP) images -->
<img src="/hero.jpg" loading="eager" fetchpriority="high" alt="Hero" />
```

### Astro Image Optimisation

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<!-- ✅ Astro optimises automatically -->
<Image src={heroImage} alt="Hero" width={1200} />
```

---

## Code Splitting & Lazy Loading

### Route-Based Splitting (React)

```javascript
import { lazy, Suspense } from 'react';

// ✅ Lazy load route components
const Home = lazy(() => import('./pages/Home'));
const Account = lazy(() => import('./pages/Account'));

function App() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </Suspense>
  );
}
```

### Component-Level Splitting

Lazy load when:
- Heavy third-party components (video player, charts, maps)
- Modal/dialog content
- Features behind feature flags
- Admin/low-usage features
- Components below the fold

### Astro Islands

```astro
<!-- ✅ Only hydrate when needed -->
<VideoPlayer client:visible />
<SearchWidget client:idle />
<StaticContent />  <!-- Zero JS by default -->
```

---

## Lambda Performance

### Cold Start Mitigation

- Keep handlers small — split into separate functions per endpoint
- Minimise dependencies — only import what you need
- Use ES modules (.mjs) — faster parsing than CommonJS
- Avoid top-level heavy initialisation
- Use provisioned concurrency for critical paths

```javascript
// ✅ Lazy initialise expensive resources
let docClient;

export const handler = async (event) => {
  if (!docClient) {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    docClient = new DynamoDBClient({});
  }
  // ...
};
```

### DynamoDB Query Optimisation

- Use `ProjectionExpression` — only fetch needed attributes
- Use `Limit` — don't fetch more than needed
- Use GSIs for access patterns — avoid scans
- Batch reads where possible — `BatchGetItem`

```javascript
// ✅ Projection — only fetch what you need
const result = await docClient.query({
  TableName: 'my-table',
  KeyConditionExpression: 'channel_id = :cid',
  ProjectionExpression: 'id, title, #status',
  ExpressionAttributeNames: { '#status': 'status' },
  ExpressionAttributeValues: { ':cid': channelId },
}).promise();
```

---

## Caching Strategies

### Frontend (React Query)

```javascript
// Stale time by data volatility
const cacheStrategies = {
  liveData: { staleTime: 10 * 1000 },         // 10s — live scores
  moderateData: { staleTime: 5 * 60 * 1000 },  // 5min — listings, content
  stableData: { staleTime: 15 * 60 * 1000 },   // 15min — config, settings
  staticData: { staleTime: Infinity },           // never refetch — legal, terms
};
```

### API / CDN

- CloudFront cache headers on static assets
- Cache-Control headers on API responses where appropriate
- ETags for conditional requests
- S3 bucket policies for asset caching

### Build Assets

```javascript
// ✅ Hash-based cache busting
output: {
  assetFileNames: 'assets/[name]-[hash][extname]',
  chunkFileNames: 'chunks/[name]-[hash].js',
  entryFileNames: 'entries/[name]-[hash].js',
}
```

---

## Build Optimisation

### General

- Tree-shake unused code
- Minify JS/CSS for production
- Remove console.log in production builds
- Enable source maps for debugging (not shipped to users)
- Set up bundle size warnings

### Vite (React Projects)

```javascript
build: {
  target: 'es2015',
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
  },
  chunkSizeWarningLimit: 500, // Warn at 500KB
}
```

### Bundle Analysis

```bash
# Analyse what's in your bundle
npx rollup-plugin-visualizer  # Vite/Rollup
npx webpack-bundle-analyzer    # Webpack
```

---

## Monitoring

### Core Web Vitals

```javascript
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to analytics service
  console.log(metric.name, metric.value);
}

onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

### Lighthouse CI

```json
{
  "ci": {
    "collect": { "numberOfRuns": 3 },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }]
      }
    }
  }
}
```

---

## Performance Checklist

Before deploying to production:
- [ ] Run production build and check bundle sizes
- [ ] Lazy load routes and heavy components
- [ ] Optimise images (format, size, lazy loading)
- [ ] Configure appropriate cache/stale times
- [ ] Remove console.logs in production
- [ ] Test on 3G network (throttled)
- [ ] Run Lighthouse audit (score >90)
- [ ] Check Core Web Vitals
- [ ] Profile for slow renders / cold starts
- [ ] Verify no memory leaks (event listeners, intervals, DB connections)
- [ ] DynamoDB queries use projections and limits

---

## Common Performance Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| No code splitting | Slow initial load | Route-based lazy loading |
| Missing image lazy loading | Wasted bandwidth | `loading="lazy"` |
| Wrong image format | Large payloads | WebP/AVIF with fallbacks |
| No cache headers | Repeat downloads | Cache-Control + hash filenames |
| Lambda cold starts | Slow first request | Smaller bundles, ES modules |
| DynamoDB scans | Slow queries, expensive | Use queries with GSIs |
| Aggressive polling | Battery drain, network waste | Reasonable intervals (30s+) |
| Inline object/function props | Unnecessary re-renders | useMemo/useCallback |
| Missing key props | Full list re-renders | Stable unique keys |

---

## Skill Collaboration

- **`performance-engineer`** — deep performance analysis (Lambda cold starts, Bitmovin VST, Vite splitting)
- **`backend-distributed-systems-engineer`** — DynamoDB query optimisation
- **`frontend-ux-specialist`** — React rendering performance
- **`astro-specialist`** — Astro-specific image optimisation and islands
- **`devops-infrastructure-as-code`** — CloudFront caching, Lambda config
