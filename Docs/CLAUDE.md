# Docs/

Project documentation lives here. All Markdown files in this directory are indexed by the Docs-RAG MCP server for semantic search.

## Usage

1. Add `.md` files to this directory (or subdirectories)
2. Run `reindex_docs()` to update the search index
3. Use `query_docs("your question")` to search without reading entire files

## Organisation

Suggested structure:
- `architecture/` — system design, data models, decisions
- `api/` — API specifications, contracts
- `guides/` — developer guides, onboarding
- `WIP/` — work-in-progress docs (excluded from doc-pack builds)

## Doc Pack

To include docs in the HTML documentation pack, add them to `docs-generator/manifest.json` and run `node docs-generator/build.js`.
