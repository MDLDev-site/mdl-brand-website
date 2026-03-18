# tools/gitnexus/

GitNexus code intelligence setup for multi-repo analysis.

## Setup

```bash
bash tools/gitnexus/setup.sh
```

This indexes all MDL repos defined in `.env` (MDL_BASELINE_PATH, MDL_FAN_DEV_PATH, etc.) into a local graph database at `.gitnexus/kuzu`.

## Re-indexing

```bash
npx gitnexus analyze    # Re-index current repo
npx gitnexus status     # Check index freshness
npx gitnexus wiki       # Generate docs from graph
```

## What Gets Indexed

- Symbols (functions, classes, methods, exports)
- Relationships (calls, imports, extends)
- Execution flows (process traces across files)

See the GitNexus section in the root `CLAUDE.md` for MCP tool usage.
