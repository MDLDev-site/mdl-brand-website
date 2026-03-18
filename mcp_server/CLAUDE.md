# mcp_server/

Docs-RAG MCP server — provides local documentation search via vector embeddings.

## Setup

```bash
pip install -r mcp_server/requirements.txt
```

The server is registered in `.mcp.json` as `docs-rag` and starts automatically when Claude Code connects.

## MCP Tools

| Tool | Purpose |
|------|---------|
| `query_docs(query)` | Search indexed documentation — returns relevant chunks with sources |
| `reindex_docs()` | Rebuild the vector index (run after docs change) |
| `get_stats()` | Show index info (document count, chunk count) |

## How It Works

- Indexes all Markdown files in `Docs/` (configurable via `DOCS_PATH` env var)
- Uses ChromaDB for vector storage (`.chroma/` directory, gitignored)
- Chunks documents and embeds them for semantic search
- Returns ranked results with source file references

## When to Reindex

Run `reindex_docs()` after any commit that changes files in `Docs/`. The PostToolUse hooks in `settings.json` will remind you.
