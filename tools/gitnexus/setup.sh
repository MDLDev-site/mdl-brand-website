#!/usr/bin/env bash
# GitNexus setup script for MDL repos
# Run once per machine to index all MDL repos and register the MCP server.
# Prerequisites: Node.js 18+, Claude Code CLI

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"

# Load .env if present
if [ -f "$ENV_FILE" ]; then
  echo "Loading paths from .env..."
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "No .env found. Using default paths from .env.example."
  echo "Copy .env.example to .env and update paths if your setup differs."
  set -a
  # shellcheck disable=SC1090
  source "$REPO_ROOT/.env.example"
  set +a
fi

# Expand ~ in paths
expand_path() {
  eval echo "$1"
}

MDL_REPOS=(
  "${MDL_BASELINE_PATH:-~/Projects/mdl-baseline}"
  "${MDL_ADMIN_DEV_PATH:-~/Projects/mdl-admin-dev}"
  "${MDL_FAN_DEV_PATH:-~/Projects/mdl-fan-dev}"
  "${MDL_LAMBDAS_PATH:-~/Projects/mdl-lambdas}"
  "${MDL_RESEARCH_STREAM_DEPLOY_PATH:-~/Projects/mdl-research-stream-deploy}"
)

# Install gitnexus globally if not present
if ! command -v gitnexus &>/dev/null; then
  echo "Installing gitnexus globally..."
  npm install -g gitnexus
else
  echo "gitnexus already installed: $(gitnexus --version 2>/dev/null || echo 'version unknown')"
fi

# Index each repo
echo ""
echo "Indexing MDL repos..."
for repo in "${MDL_REPOS[@]}"; do
  expanded="$(expand_path "$repo")"
  if [ ! -d "$expanded" ]; then
    echo "  Skipping (not found): $expanded"
    continue
  fi
  if [ ! -d "$expanded/.git" ]; then
    echo "  Skipping (not a git repo): $expanded"
    continue
  fi
  echo ""
  echo "→ Indexing: $expanded"
  # gitnexus crashes during teardown (known LadybugDB bug) but index is saved — ignore exit code
  gitnexus analyze "$expanded" --embeddings || true
done

# Register MCP with Claude Code
echo ""
echo "Registering gitnexus MCP with Claude Code..."
if claude mcp add gitnexus -- npx -y gitnexus@latest mcp 2>/dev/null; then
  echo "MCP registered."
else
  echo "MCP already registered or claude CLI not in PATH — skipping."
  echo "If needed, run manually: claude mcp add gitnexus -- npx -y gitnexus@latest mcp"
fi

echo ""
echo "Setup complete. GitNexus is serving all indexed MDL repos."
echo "Run 'gitnexus list' to confirm."
