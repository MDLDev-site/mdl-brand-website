# CLAUDE.md — MDL Baseline

This is the MDL team's baseline template repository. It contains shared tooling, skills, MCP configuration, and conventions used across all MDL projects.

---

## Personality & Communication

Keep all discussions concise and task-focused. Avoid banter and unnecessary commentary. Do not use exaggerated or motivational phrases such as "Amazing job," "Great idea," or similar expressions. Focus strictly on clear, accurate, and practical technical guidance.

---

## Session Start Protocol

**MANDATORY: At the start of EVERY new conversation, perform these steps in order:**

### 1. Load Context from OpenMemory

Query OpenMemory MCP to load relevant project context before doing anything else:

```javascript
mcp__openmemory__search-memories({ query: "MDL architecture patterns" })
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

**Always run the linter after making changes** — `npm run lint` (or the project-appropriate lint command).

**Check existing patterns before implementing.** Review similar features/code for reusable patterns before writing new code.

---

## OpenMemory — Team Knowledge Base

OpenMemory MCP is configured in `.mcp.json` with client name `MDL` for team-wide shared memory.

### Automatic Memory Storage Triggers

You **must** store memories to OpenMemory in the following situations:

1. **User Corrections** — when the user corrects an assumption, approach, or implementation detail. Store the correction with context about what was wrong and why.
2. **Rule Violations** — when discovering patterns that violate project rules. Document the violation and the correct approach.
3. **Project-Specific Patterns** — when encountering unique MDL patterns (architecture decisions, custom conventions, integration patterns).
4. **Common Mistakes** — when the same issue is encountered multiple times. Store the mistake pattern and correct solution.
5. **Performance Discoveries** — when finding effective optimization approaches. Document what worked, metrics improvement, and when to apply.
6. **Security Patterns** — when implementing or correcting security-related code. Store secure patterns with rationale.

### Memory Storage Format

```
Context: [Brief situation description]
Issue/Correction: [What was wrong or what was learned]
Solution: [Correct approach or implementation]
Rule Reference: [Link to skill or rule if applicable]
Tags: [Comma-separated tags for retrieval]
```

### Memory Retrieval Strategy

- **Session start**: Query for project-specific memories (see Session Start Protocol)
- **Before major changes**: Check for relevant memories before refactoring or implementing features
- **After corrections**: Immediately store the learning and query for related patterns
- **Domain switching**: When switching contexts (frontend to backend), retrieve domain-specific memories

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

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | 237+ AWS Lambda functions (.mjs ESM), API Gateway v2, DynamoDB, SQS, S3 |
| **Fan Frontend** | React 18 + Vite + TypeScript, TanStack Query v4, MUI v5, styled-components |
| **Admin Frontend** | React 18 + Vite + JS, TanStack Query v4, Ant Design |
| **Brand Site** | Astro (islands architecture, zero-JS-by-default) |
| **Auth** | AWS Cognito (per-channel user pools) |
| **Payments** | Stripe (subscriptions, payment intents, webhooks) |
| **Video** | Bitmovin Player/Analytics, HLS.js |
| **Monitoring** | Sentry, CloudWatch |
| **Issues** | Linear (team DEV, workspace MDL, prefix DEV-XXXX) |

### Lambda Conventions

**Channel ID extraction — ALWAYS from authorizer, NEVER from headers:**

```javascript
// CORRECT — verified by API Gateway authorizer
const channelId = event.requestContext.authorizer.lambda.channel_id;

// WRONG — can be spoofed by client
const channelId = event.headers['x-channel-id'];  // NEVER
```

**Standard response format:**

```javascript
function successResponse(data) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,Authorization" },
    body: JSON.stringify({ data }),
  };
}

function errorResponse(statusCode, message) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type,Authorization" },
    body: JSON.stringify({ error: message }),
  };
}
```

**Lambda configuration standards:**

| Setting | Value |
|---------|-------|
| Runtime | Node.js 20.x |
| Architecture | arm64 (Graviton2) |
| Memory | 256 MB default |
| Timeout | 30 seconds |

**Required resource tags:**

```javascript
{ Project: "MDL", Feature: "FeatureName", Environment: "production", Team: "Development", CostCenter: "CBE", LinearIssue: "DEV-XXXX" }
```

**Multi-tenancy security — ALL Lambdas MUST enforce channel isolation:**

1. Extract `channel_id` from authorizer (never trust client)
2. Filter ALL queries by `channel_id`
3. Verify ownership before mutations
4. Return generic error messages (never expose internals)
5. Log securely (no tokens, no PII in CloudWatch)

---

## Skills System

This repo contains a curated skills library at `.claude/skills/`. Skills are invoked via the `Skill` tool and cover the full MDL development lifecycle.

**IMPORTANT: Check for a relevant skill before starting any task.** If there is even a 1% chance a skill applies, invoke it first.

### Key Skills for MDL Work

| Trigger | Skill |
|---------|-------|
| Any `DEV-XXXX` mention, "start work", "create PR", "progress update" | `linear-workflow` |
| Astro / brand site work | `astro-specialist` |
| Lambda / API Gateway / DynamoDB | `backend-distributed-systems-engineer` |
| Frontend (React, TanStack Query, Bitmovin) | `frontend-ux-specialist` |
| Security review, auth, Cognito, Stripe | `security-sentinel` |
| CI/CD, Lambda deploys, infrastructure | `devops-infrastructure-as-code` |
| Playwright, Jest, MSW | `qa-automation-engineer` |
| Performance — Lambda cold start, bundle, query | `performance-engineer` |
| CloudWatch, Sentry, Bitmovin Analytics | `observability-engineer` |
| Incident response | `incident-commander` |
| Git commits, branches, PRs | `git-workflow` |
| CHANGELOG updates, release notes | `changelog-standards` |
| Security review, secrets, input validation | `security-standards` |
| Error handling, logging, retry logic | `error-handling-standards` |
| Performance, CWV, image optimisation | `performance-standards` |
| "Which skill should I use?" | `skill-matrix` |
| Multi-skill workflows | `skill-chains` |
| Orchestrating multiple specialists | `skill-orchestrator` |

### Linear Workflow

All Linear issue management uses the `linear-workflow` skill. It is **self-contained** — all MDL team IDs, status IDs, and conventions are embedded in the skill. Never look for a `.linear-workflow.json` config file; it does not exist in this repo.

---

## MCP Tooling

The following MCP servers are configured in `.mcp.json` for team-wide use:

| Server | Purpose | When to use |
|--------|---------|-------------|
| **OpenMemory** | Team knowledge base | Session start, storing corrections, retrieving patterns |
| **Linear** | Issue management | All DEV-XXXX work (via `linear-workflow` skill) |
| **Context7** | Library documentation lookup | When you need up-to-date docs for any library |
| **GitNexus** | Code intelligence | Before editing, debugging, refactoring (see below) |
| **Figma** | Design file access | When implementing designs or reviewing mockups |
| **Playwright** | Browser automation / E2E testing | Testing, screenshots, form filling |
| **Chrome DevTools** | Browser debugging | Console logs, network requests, performance |
| **Serena** | Semantic code analysis | Symbol-level code reading and editing |
| **Sequential Thinking** | Structured reasoning | Complex debugging, architectural decisions, threat modelling |
| **Docs-RAG** | Local documentation search | Querying `/Docs` without reading entire files |

### Sequential Thinking — When to Use

Use Sequential Thinking MCP for problems requiring structured multi-step reasoning:

- **Complex debugging**: Multi-component failures, race conditions, intermittent issues
- **Architectural decisions**: Evaluating trade-offs, planning major refactors
- **Security analysis**: Threat modelling, vulnerability assessment
- **Performance optimisation**: Systematic bottleneck identification

Do NOT use for simple, straightforward tasks with clear solutions.

---

## Common Gotchas

1. **Token refresh**: Always use the project's API client (e.g., `apiClient`, `apiFetch`) — never raw `fetch` for authenticated requests
2. **Query invalidation**: Invalidate TanStack Query cache after mutations
3. **URL state**: Use `{ replace: true }` for filter/search param changes
4. **File uploads**: Upload to S3 happens AFTER API success (by design)
5. **Channel switching**: Causes full page reload and cache clear
6. **snake_case vs camelCase**: DB fields are snake_case, frontend logic is camelCase — never mix

---

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **mdl-baseline** (38 symbols, 64 relationships, 4 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/mdl-baseline/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/mdl-baseline/context` | Codebase overview, check index freshness |
| `gitnexus://repo/mdl-baseline/clusters` | All functional areas |
| `gitnexus://repo/mdl-baseline/processes` | All execution flows |
| `gitnexus://repo/mdl-baseline/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## CLI

- Re-index: `npx gitnexus analyze`
- Check freshness: `npx gitnexus status`
- Generate docs: `npx gitnexus wiki`

<!-- gitnexus:end -->
