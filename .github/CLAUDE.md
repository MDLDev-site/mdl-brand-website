# .github/

GitHub configuration and CI/CD workflows.

## Workflows

| Workflow | Trigger | Purpose | Required Secret |
|----------|---------|---------|----------------|
| `claude.yml` | `@claude` mention in issues/PRs | Claude Code responds to mentions | `CLAUDE_CODE_OAUTH_TOKEN` |
| `claude-code-review.yml` | PR opened/updated | Automatic code review by Claude | `CLAUDE_CODE_OAUTH_TOKEN` |

## Setup

Add the `CLAUDE_CODE_OAUTH_TOKEN` secret in Settings > Secrets and variables > Actions. See `SETUP.md` for details.
