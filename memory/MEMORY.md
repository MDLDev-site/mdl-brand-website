# MDL Team Memory Index

## Loading Protocol

### L0 — Always Loaded (every session)
These files are loaded automatically by Claude Code:
- `CLAUDE.md` — project rules, skills, conventions
- `.claude/CLAUDE.md` — skills library index
- `memory/MEMORY.md` — this file (memory index)

### L1 — Project Context (load on demand)
Load when user says "work on X" or context requires it:

| Project | File | Last Updated |
|---------|------|-------------|
| MDL Fan Dev | `memory/projects/mdl-fan-dev.md` | — |
| MDL Admin Dev | `memory/projects/mdl-admin-dev.md` | — |
| MDL Lambdas | `memory/projects/mdl-lambdas.md` | — |
| MDL Brand Site | `memory/projects/mdl-brand-site.md` | — |

### L2 — Deep Context (load when investigating)
Load specific files when debugging, hitting patterns, or needing history:
- **Claims:** `memory/claims/` — lesson titles are the filenames. Scan titles, load matching claim.
- **Session logs:** `memory/sessions/YYYY-MM-DD.md` — load for yesterday's context.
- **GitNexus:** Use MCP tools for code-level intelligence.
- **OpenMemory:** Query for cross-project team patterns.

## Loading Rules

1. User says "work on [project]" → load that project's L1 file
2. Hit a bug pattern → scan claim titles in this index, load matching claim
3. Need cross-project knowledge → query OpenMemory
4. Need code intelligence → use GitNexus MCP
5. Need yesterday's context → load `memory/sessions/YYYY-MM-DD.md`
6. **Never load all project files at once** — defeats the purpose

## Writing Rules

1. **New project?** Create `memory/projects/<name>.md`, add to L1 table above
2. **New lesson?** Create `memory/claims/<claim-as-title>.md` — filename IS the lesson
   - Include: context, date learned, related claims
   - Add to claims index below
3. **Session work?** Optionally log to `memory/sessions/YYYY-MM-DD.md`
4. **Team correction?** Also store in OpenMemory for cross-project access

## Claims Index

| Claim | File | Date |
|-------|------|------|
| *(populated as team learns)* | | |

## Cross-System Reference

| Need | Use |
|------|-----|
| Project-specific state | `memory/projects/*.md` (L1) |
| Team patterns & corrections | OpenMemory MCP |
| Code relationships & impact | GitNexus MCP |
| Library documentation | Context7 MCP |
| Self-documenting lessons | `memory/claims/*.md` (L2) |
