# MDL Fan Dev — Project Context

## Overview
Fan-facing frontend for the MDL OTT/streaming platform.

## Tech Stack
- **Framework:** React 18 + Vite + TypeScript
- **Data fetching:** TanStack Query v4
- **UI:** MUI v5 + styled-components
- **Video:** Bitmovin Player + Analytics + HLS.js
- **Auth:** AWS Cognito (per-channel user pools)
- **Payments:** Stripe (subscriptions, payment intents, webhooks)
- **Routing:** Multi-tenant subdomain routing (channel = tenant)

## Architecture
- Feature-based module architecture (`src/features/`)
- API service layer (`src/services/api*.js`) — never use raw fetch
- Custom hooks in `src/hooks/` — TanStack Query wrappers
- Context providers for auth, channel, theme
- Channel switching causes full page reload + cache clear

## Key Patterns
- snake_case from API → camelCase in frontend logic
- Token refresh handled by apiClient (never manual)
- Query invalidation after every mutation
- File uploads: S3 upload happens AFTER API success
- URL state with `{ replace: true }` for filters/search

## Current State
*(Update as work progresses)*
