# Documentation RAG MCP Server

Local Retrieval-Augmented Generation (RAG) system that provides semantic search across project documentation via MCP server integration with Claude Code.

## Overview

This RAG system:
- Indexes all markdown files in the `Docs/` folder
- Uses ChromaDB for vector storage
- Uses sentence-transformers for local, free embeddings
- Exposes semantic search via MCP tools to Claude Code
- Enables context-aware development without reading massive documentation

## Architecture

```
┌──────────────────────────────────────────────┐
│  1. INDEX (Manual, when docs change)        │
│  python scripts/index_docs.py               │
│  → Chunks markdown → Embeddings → ChromaDB  │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  2. MCP SERVER (Auto-starts with Claude)    │
│  mcp_server/rag_server.py                   │
│  → Exposes query_docs, reindex_docs tools   │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│  3. CLAUDE CODE QUERIES                     │
│  "query_docs('authentication requirements')"│
│  → Gets relevant chunks with source refs    │
└──────────────────────────────────────────────┘
```

## Setup

### 1. Install Dependencies

```bash
pip install -r mcp_server/requirements.txt
```

This installs:
- `chromadb` - Vector database
- `sentence-transformers` - Local embeddings (all-MiniLM-L6-v2)
- `mcp` - MCP server SDK
- `tqdm` - Progress bars

**First run will download ~100MB embedding model**

### 2. Index Documentation

```bash
python scripts/index_docs.py
```

This will:
- Scan the `Docs/` folder for `.md` files
- Chunk documents by markdown headers
- Generate embeddings for each chunk
- Store in `.chroma/` directory

**Output:**
```
🚀 Starting documentation indexing...
📁 Docs folder: Docs
💾 ChromaDB path: .chroma
📚 Collection: documentation

🤖 Loading embedding model (all-MiniLM-L6-v2)...
✅ Model loaded

🔍 Scanning for markdown files in Docs/...
📄 Found 15 markdown files

📝 Processing files...
📊 Created 127 chunks from 15 files

🧮 Generating embeddings and storing in ChromaDB...
✅ Indexing complete!
```

### 3. Verify MCP Configuration

Check `.mcp.json` includes:
```json
{
  "mcpServers": {
    "docs-rag": {
      "type": "stdio",
      "command": "python",
      "args": ["mcp_server/rag_server.py"],
      "description": "Semantic search across project documentation using RAG"
    }
  }
}
```

### 4. Start Claude Code

```bash
claude
```

The MCP server will auto-start and be available immediately.

## Available MCP Tools

### query_docs

Semantic search across documentation.

**Parameters:**
- `query` (string, required): Natural language search query
- `n_results` (integer, optional): Number of results (default: 5, max: 20)
- `filter_path` (string, optional): Filter by document path (e.g., "Requirements/")

**Example:**
```
query_docs("authentication security requirements")
query_docs("API rate limiting", n_results=3)
query_docs("database schema", filter_path="Architecture/")
```

**Returns:**
- Relevant document chunks
- Source file paths
- Section headers
- Content snippets

### reindex_docs

Trigger re-indexing of all documentation.

**Parameters:** None

**Use when:**
- You've added new documentation files
- You've updated existing documentation
- You want to ensure index is current

**Example:**
```
reindex_docs()
```

**Note:** Takes 1-2 minutes depending on documentation size.

### get_stats

Get statistics about indexed documentation.

**Parameters:** None

**Returns:**
- Total chunks indexed
- Number of unique files
- Collection name
- Database path
- Embedding model used
- Sample file list

**Example:**
```
get_stats()
```

## Usage Examples

### Example 1: Find Requirements Before Implementation

```
User: "Implement user authentication"

Claude Code:
> Using tool: query_docs
> query: "authentication requirements security guidelines"
> n_results: 5

Returns:
- Docs/Requirements/Auth-Requirements.md
  → Must use OAuth 2.0
  → Require 2FA for admin users
  → Password minimum 12 characters

- Docs/Security-Guidelines.md
  → Never store passwords in plain text
  → Use bcrypt with work factor 12
  → Implement rate limiting on auth endpoints

Claude Code: "Based on the requirements, I'll implement OAuth 2.0 authentication with 2FA for admin users..."
```

### Example 2: Find API Specifications

```
User: "Add a new REST endpoint"

Claude Code:
> Using tool: query_docs
> query: "REST API conventions error handling"
> filter_path: "API/"

Returns:
- Docs/API/REST-Conventions.md
  → Use HTTP status codes correctly
  → Error responses must include error_code and message
  → Versioning in URL: /api/v1/

Claude Code: "Following the API conventions, I'll create the endpoint at /api/v1/..."
```

### Example 3: Check After Documentation Update

```
User: "I just updated the security guidelines"

Claude Code:
> Using tool: reindex_docs

[Re-indexing runs...]

> Using tool: query_docs
> query: "security guidelines"

Returns updated content from Docs/Security-Guidelines.md
```

## Maintenance

### Re-indexing Documentation

**When to re-index:**
- After adding new documentation files
- After significant documentation updates
- When search results seem outdated

**How to re-index:**

**Option 1:** Via MCP tool (from Claude Code)
```
reindex_docs()
```

**Option 2:** Manual script
```bash
python scripts/index_docs.py
```

### Monitoring Index Size

```bash
# Check ChromaDB size
du -sh .chroma/

# View indexed files
python -c "
import chromadb
client = chromadb.PersistentClient(path='.chroma')
collection = client.get_collection('documentation')
print(f'Total chunks: {collection.count()}')
"
```

## Troubleshooting

### "ChromaDB not found" Error

**Problem:** MCP server can't find `.chroma/` directory

**Solution:**
```bash
python scripts/index_docs.py
```

### "Embedding model download failed"

**Problem:** Can't download sentence-transformers model

**Solution:**
- Check internet connection
- Try manual download:
  ```python
  from sentence_transformers import SentenceTransformer
  model = SentenceTransformer('all-MiniLM-L6-v2')
  ```

### MCP Server Not Starting

**Problem:** `docs-rag` server doesn't appear in Claude Code

**Solution:**
1. Check `.mcp.json` syntax is valid JSON
2. Verify Python path: `which python` or `where python`
3. Check dependencies installed: `pip list | grep chromadb`
4. Restart Claude Code

### Poor Search Results

**Problem:** Queries return irrelevant results

**Solutions:**
- Use more specific queries: "OAuth authentication flow" not "auth"
- Use `filter_path` to narrow scope
- Re-index if docs have changed
- Check indexed files: `get_stats()`

### "Collection not found" Error

**Problem:** ChromaDB collection doesn't exist

**Solution:**
```bash
python scripts/index_docs.py
```

## Configuration

### Changing Embedding Model

Edit `scripts/index_docs.py` and `mcp_server/rag_server.py`:

```python
EMBEDDING_MODEL = "all-mpnet-base-v2"  # Higher quality, slower
# or
EMBEDDING_MODEL = "all-MiniLM-L6-v2"   # Faster, good quality (default)
```

**Note:** Must re-index after changing model.

### Adjusting Chunk Size

Edit `scripts/index_docs.py`:

```python
CHUNK_SIZE = 1500     # Larger chunks (more context)
CHUNK_OVERLAP = 150   # More overlap (better continuity)
```

### Custom Document Filters

Edit `mcp_server/rag_server.py` to add custom filters:

```python
# Example: Filter by document type
where_filter = {"file_path": {"$contains": "Requirements"}}
```

## Technical Details

### Embedding Model
- **Model:** all-MiniLM-L6-v2
- **Dimensions:** 384
- **Size:** ~80MB
- **Speed:** ~500 docs/second
- **Quality:** Good for documentation search

### ChromaDB
- **Storage:** SQLite-based (`.chroma/` folder)
- **Size:** ~10MB per 1000 chunks
- **Performance:** Sub-second queries

### Chunking Strategy
- **Method:** Semantic chunking by markdown headers
- **Size:** ~1000 tokens per chunk
- **Overlap:** 100 tokens between chunks
- **Metadata:** File path, section name, header hierarchy

## Performance

**Indexing:**
- ~10-20 files/second
- ~2 minutes for 100 documentation files

**Querying:**
- <100ms for semantic search
- <500ms total response time

**Memory:**
- ~500MB for embedding model
- ~50MB for ChromaDB
- ~100MB per 1000 indexed chunks

## Security

- **Local Only:** All data stays on your machine
- **No External APIs:** sentence-transformers runs locally
- **No Telemetry:** ChromaDB anonymized telemetry disabled
- **Gitignored:** `.chroma/` excluded from version control

## Limitations

- **Language:** English-optimized (all-MiniLM-L6-v2)
- **File Types:** Markdown only (`.md` files)
- **Size:** Practical limit ~10,000 chunks (~1000 files)
- **Updates:** Manual re-indexing required

## Future Enhancements

Potential improvements:
- [ ] Auto-reindex on file changes (file watcher)
- [ ] Support for code files (`.py`, `.js`, etc.)
- [ ] Multi-language embeddings
- [ ] Hybrid search (semantic + keyword)
- [ ] Query result caching
- [ ] Git hook for auto-indexing

## Support

**Issues?** Check:
1. Dependencies installed: `pip list`
2. Index created: `ls .chroma/`
3. MCP config valid: `cat .mcp.json`
4. Python version: `python --version` (requires 3.8+)

**Still stuck?** Run with debug logging:
```bash
python -u mcp_server/rag_server.py 2>&1 | tee server.log
```

## License

Part of Claude Code Template Project. Use freely in your projects.
