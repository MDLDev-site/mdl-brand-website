# MDL Admin Dev — Project Context

## Overview
Admin dashboard for channel operators to manage content, users, and streaming.

## Tech Stack
- **Framework:** React 18 + Vite + JavaScript (no TypeScript)
- **Data fetching:** TanStack Query v4
- **UI:** Ant Design
- **Forms:** React Hook Form
- **Auth:** AWS Cognito (admin user pools)

## Architecture
- Feature-based module architecture
- Stream/VOD management workflows
- Channel admin panel (branding, settings, user management)
- Multi-tenant — all operations scoped to channel_id

## Key Patterns
- Same snake_case/camelCase convention as fan-dev
- Same API service layer pattern
- Ant Design form patterns with React Hook Form integration
- Admin-specific RBAC roles (channel_owner, channel_admin, content_manager)

## Current State
*(Update as work progresses)*
