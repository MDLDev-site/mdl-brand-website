---
name: git-workflow
description: Git workflow standards, conventional commit format, branch naming, and PR guidelines for all MDL projects. Auto-triggers on any commit, branch creation, PR, or git workflow discussion.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

# Git Workflow Standards

**Purpose:** Git workflow standards and commit message conventions for all MDL projects

## Core Git Principles

1. **Meaningful commits** — each commit represents a logical unit of work
2. **Conventional commits** — follow standardised commit message format
3. **Atomic commits** — one feature/fix per commit when possible
4. **Clear history** — write commit messages for future developers
5. **Sync with CHANGELOG.md** — major changes documented in both places

---

## Commit Message Format

### Structure

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type

**Required.** Must be one of:

- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **docs**: Documentation changes
- **style**: Formatting, missing semicolons, etc. (no code change)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvement
- **test**: Adding or updating tests
- **build**: Build system or external dependency changes
- **ci**: CI/CD configuration changes
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope

**Optional.** The section of the codebase affected. Use the most relevant module or domain:

**Common MDL scopes:**
- `auth` — Authentication
- `api` — API integration / endpoints
- `payments` — Stripe / payment processing
- `player` — Video player
- `ui` — UI components
- `testing` — Test infrastructure
- `performance` — Performance optimisations
- `security` — Security improvements
- `config` — Configuration changes
- `infra` — Infrastructure / deployment

**Project-specific scopes** should be added per-repo (e.g., `fixtures`, `playlists` for fan-dev; `channels`, `users` for admin-dev; `content`, `pages` for brand site).

### Subject

**Required.** Short description:

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalise first letter
- No period at the end
- Maximum 72 characters
- Be specific and descriptive

### Body

**Optional.** Provide additional context:

- Explain **why** the change was made (not what/how)
- Wrap at 72 characters
- Separate from subject with blank line
- Can include bullet points

### Footer

**Optional.** Reference issues, breaking changes:

```
BREAKING CHANGE: description of breaking change

Fixes DEV-123
Closes DEV-456
```

---

## Commit Message Examples

### Good Examples

```bash
feat(auth): add multi-factor authentication support

fix(payments): handle failed payment method updates correctly

feat(api): add new endpoint for channel configuration

test(auth): achieve 100% coverage for authentication module

refactor(api): extract common error handling logic

docs: update API integration patterns guide

perf: lazy load route components to reduce initial bundle

build: upgrade dependencies to latest versions
```

### Multi-line With Body

```bash
feat(payments): add subscription cancellation flow

Implement complete subscription cancellation workflow including:
- Cancellation confirmation modal
- Immediate vs end-of-period cancellation options
- Stripe subscription update API integration
- Email notification trigger
```

### With Breaking Change

```bash
feat(auth)!: migrate to new auth SDK

BREAKING CHANGE: Auth API has changed. The signIn method now
returns a Promise and requires async/await.

Before:
  signIn(email, password);

After:
  await signIn(email, password);
```

### With Issue Reference

```bash
fix(player): resolve audio sync issue on Safari

Audio track was desyncing from video on Safari when seeking backwards.
Fixed by using the player's native currentTime property.

Fixes DEV-342
Closes DEV-356
```

---

## Branch Naming Conventions

### Format

```
<type>/<ticket-id>-<short-description>
```

### Examples

```bash
feature/DEV-1336-playlist-naming
fix/DEV-1245-payment-failure
refactor/DEV-1189-api-error-handling
test/DEV-1432-fixture-coverage
docs/DEV-1501-api-documentation
chore/DEV-1612-dependency-updates
hotfix/DEV-1700-critical-auth-fix
```

### Branch Types

- `feature/` — New features
- `fix/` — Bug fixes
- `refactor/` — Code refactoring
- `test/` — Test additions/improvements
- `docs/` — Documentation changes
- `chore/` — Maintenance tasks
- `hotfix/` — Urgent production fixes

---

## Commit Workflow

### 1. Make Atomic Commits

```bash
# ✅ Separate commits for different concerns
git add src/features/auth/LoginForm.jsx
git commit -m "feat(auth): add email validation to login form"

git add src/features/auth/__tests__/LoginForm.test.jsx
git commit -m "test(auth): add validation tests for login form"
```

```bash
# ❌ Mixed concerns in one commit
git add .
git commit -m "various updates"
```

### 2. Review Changes Before Committing

```bash
git diff --staged
```

### 3. Amend Recent Commits (Carefully)

```bash
# Only amend commits that haven't been pushed!
git add forgotten-file.js
git commit --amend --no-edit
```

---

## Integration with CHANGELOG.md

### Commit Message → CHANGELOG Mapping

| Commit Type | CHANGELOG Section |
|-------------|------------------|
| `feat` | Added |
| `fix` | Fixed |
| `perf` | Changed (Performance) |
| `security` | Security |
| `BREAKING CHANGE` | Changed (Breaking) |
| `deprecate` | Deprecated |

---

## Pull Request Guidelines

### PR Title Format

Use the same format as commit messages:

```
feat(payments): add Apple Pay support
fix(auth): resolve session timeout issue
test: achieve 100% coverage for payments module
```

### PR Description Template

```markdown
## Summary
Brief description of what this PR does

## Type of Change
- [ ] New feature (feat)
- [ ] Bug fix (fix)
- [ ] Breaking change (BREAKING CHANGE)
- [ ] Documentation update (docs)
- [ ] Test coverage improvement (test)
- [ ] Performance improvement (perf)

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Documentation
- [ ] CHANGELOG.md updated (if needed)
- [ ] Code comments added/updated

## Related Issues
Fixes DEV-XXX
```

---

## Git Best Practices

### DO

- Write clear, descriptive commit messages
- Make small, focused commits
- Review changes before committing
- Pull latest changes before pushing
- Resolve merge conflicts carefully
- Use branches for all work (never commit to main)
- Update tests with code changes
- Run tests before pushing

### DON'T

- Commit commented-out code
- Commit console.logs (except in error handling)
- Commit secrets or credentials
- Use generic messages like "fixes", "updates"
- Mix multiple features in one commit
- Force push to main branch
- Amend commits after pushing
- Commit broken code

---

## Handling Sensitive Data

### Pre-Commit Checklist

- [ ] No API keys in code
- [ ] No passwords or tokens
- [ ] No user data or PII
- [ ] No `.env` files
- [ ] Configuration files reviewed for secrets

### If You Accidentally Commit Secrets

```bash
# 1. Immediately rotate the exposed credentials

# 2. Remove from git history (if not pushed)
git reset HEAD~1
# Edit files to remove secrets
git add .
git commit -m "fix(security): remove exposed credentials"

# 3. If already pushed, contact team lead immediately
```

---

## Commit Message Checklist

- [ ] Type is correct (feat, fix, etc.)
- [ ] Scope is accurate (or omitted if not needed)
- [ ] Subject is descriptive and concise (<72 chars)
- [ ] Subject uses imperative mood ("add" not "added")
- [ ] Subject doesn't end with period
- [ ] Body explains why (if needed)
- [ ] Breaking changes documented (if any)
- [ ] Issues referenced (if applicable)
- [ ] Tests updated
- [ ] No secrets in files
- [ ] Code linted and formatted

---

## Squashing Commits

### When to Squash

**Before merging PR:**
- Multiple "WIP" commits
- Multiple "fix typo" commits
- Commits that fix previous commits in same PR

### When NOT to Squash

- Commits already pushed to shared branch
- Commits with different types (feat + fix)
- Commits from different authors

---

## Reverting Commits

```bash
# Revert a single commit
git revert abc123

# Message format:
revert: feat(auth): add MFA support

This reverts commit abc123.

Reason: Implementation caused login issues on Safari.
Will be reimplemented with proper browser testing.
```

---

## Skill Collaboration

- **`linear-workflow`** — branch naming and commit format conventions are shared
- **`changelog-standards`** — commit types map to CHANGELOG sections
- **`security-standards`** — pre-commit security checklist
