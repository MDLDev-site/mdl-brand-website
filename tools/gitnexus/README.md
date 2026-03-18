# GitNexus — MDL Setup

GitNexus is a local code intelligence engine that indexes MDL repos into a knowledge graph and exposes them to Claude Code via MCP tools. It enables deep search, impact analysis, and architectural context across all repos.

## What It Provides

| MCP Tool | Purpose |
|---|---|
| `list_repos` | Show all indexed repos |
| `query` | Hybrid search across the codebase |
| `context` | 360° symbol view — refs, call chains |
| `impact` | Blast radius for a given change |
| `detect_changes` | Git-diff impact mapping |
| `rename` | Coordinated multi-file rename |
| `cypher` | Raw graph queries |

## First-Time Setup (per machine)

### 1. Configure local paths

```bash
cp .env.example .env
```

Edit `.env` with your actual local paths to each MDL repo. The defaults assume `~/Projects/mdl-*` — update only what differs.

### 2. Run the setup script

```bash
bash tools/gitnexus/setup.sh
```

This will:
- Install `gitnexus` globally (if not already installed)
- Index each configured MDL repo with embeddings
- Register the MCP server with Claude Code

### 3. Restart Claude Code

The MCP server is picked up on next session start.

## Repos Indexed

- `mdl-baseline`
- `mdl-admin-dev`
- `mdl-fan-dev`
- `mdl-lambdas`
- `mdl-research-stream-deploy`

## Re-indexing

After significant changes to a repo, update its index:

```bash
gitnexus analyze ~/Projects/mdl-fan-dev --embeddings
```

Or force a full re-index:

```bash
gitnexus analyze ~/Projects/mdl-fan-dev --force --embeddings
```

## Notes

- Indexes are stored in `.gitnexus/` inside each repo (gitignored — not committed).
- The global registry lives at `~/.gitnexus/registry.json` (per machine).
- `.env` is gitignored — never commit it.
- The MCP server is registered once per machine, not per repo.
