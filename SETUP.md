# MDL Baseline — Setup Guide

This guide covers post-template setup for new MDL projects using mdl-baseline.

---

## 1. GitHub Secrets

Configure these in your repository's Settings > Secrets and variables > Actions:

| Secret | Required for | How to get |
|--------|-------------|------------|
| `CLAUDE_CODE_OAUTH_TOKEN` | PR auto-review + `@claude` mentions | Anthropic Claude Code dashboard |

---

## 2. Local Setup

### Clone and configure environment

```bash
cp .env.example .env
# Edit .env — update repo paths to match your local machine
```

### Install Docs-RAG dependencies

```bash
pip install -r mcp_server/requirements.txt
```

### Index GitNexus (code intelligence)

```bash
bash tools/gitnexus/setup.sh
# Or manually: npx gitnexus analyze
```

### Build Docs-RAG index

```bash
python3 scripts/index_docs.py
```

### Update documentation manifest

Edit `docs-generator/manifest.json`:
- Set `documentPack.project` to your project name
- Add your documentation files to the relevant `sections[].files` arrays
- Run `node docs-generator/build.js` to generate the HTML pack

---

## 3. Per-Project Customisation

### ESLint

Add a project-specific `.eslintrc.json` — not included in baseline because React, Lambda, and Astro projects have different linting needs.

### Jest plugin

If your project uses Jest, add to `.claude/settings.json`:

```json
"enabledPlugins": {
  "npm:jest": true,
  ...
}
```

### Project-specific hooks

Add PreToolUse hooks for critical files in `.claude/settings.json`. Example:

```json
{
  "matcher": "Edit.*/config/constants\\.js",
  "hooks": [
    {
      "type": "command",
      "command": "echo 'WARNING: Modifying constants — this affects all API endpoints!'"
    }
  ]
}
```

### Git workflow scopes

Update the `git-workflow` skill with project-specific scopes (e.g., `feat(payments):`, `fix(auth):`).

### Linear status automation (optional)

If you want GitHub-triggered Linear status updates, copy the `linear-status-update.yml` workflow from mdl-admin-dev and add a `LINEAR_API_KEY` secret.

---

## 4. Recommended `package.json` Scripts

For projects with a `package.json`, consider adding these Claude-friendly scripts:

```json
{
  "scripts": {
    "claude:lint": "eslint . --fix",
    "claude:test": "jest --passWithNoTests",
    "claude:test:watch": "jest --watch",
    "claude:build": "vite build",
    "claude:dev": "vite",
    "claude:type-check": "tsc --noEmit",
    "claude:format": "prettier --write .",
    "claude:analyze": "npx gitnexus analyze",
    "claude:docs": "node docs-generator/build.js"
  }
}
```

These give Claude Code consistent command names across all MDL projects.

---

## 5. Verify Setup

```bash
# Validate settings.json
cat .claude/settings.json | python3 -m json.tool > /dev/null && echo "OK"

# Validate mcp.json
cat .mcp.json | python3 -m json.tool > /dev/null && echo "OK"

# Check for hardcoded paths (should return nothing)
grep -r "/Users/" .claude/ .github/ 2>/dev/null

# Check GitNexus status
npx gitnexus status

# Start a Claude Code session — should see welcome banner
```
