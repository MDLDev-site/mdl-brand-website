---
name: changelog-standards
description: CHANGELOG.md update guidelines following Keep a Changelog format. Auto-triggers when updating changelogs, releasing versions, or documenting changes.
allowed-tools: Bash, Read, Edit, Write, Grep, Glob
---

# CHANGELOG Update Guidelines

**Purpose:** Standards for maintaining CHANGELOG.md across all MDL projects

## When to Update CHANGELOG.md

### DO Update For:
- **New Features**: New components, modules, or user-facing functionality
- **Breaking Changes**: API changes, component prop changes, removed features
- **Bug Fixes**: User-visible bug fixes or critical internal fixes
- **UI/UX Changes**: Design updates, layout changes, accessibility improvements
- **Security Fixes**: Security vulnerabilities, authentication changes
- **Performance Improvements**: Measurable performance gains users will notice
- **Deprecations**: Features marked for removal

### DON'T Update For:
- Code refactoring (unless it improves performance)
- Test additions or updates
- Internal documentation changes
- Development tooling changes (eslint, prettier, etc.)
- Code formatting or style changes
- Minor typo fixes in code comments

## Format Guidelines

### Structure

Follow the [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

## [Unreleased]

### Added
- New feature description in present tense
- Another new feature with context

### Changed
- Modified existing feature with explanation
- Updated component with migration notes if breaking

### Fixed
- Bug fix description with issue reference if available

### Deprecated
- Feature marked for removal with timeline

### Removed
- Removed feature with migration path

### Security
- Security fix description (avoid technical details of vulnerability)
```

## Writing Style

### 1. Use Present Tense
- **DO:** "Add user authentication flow"
- **DON'T:** "Added user authentication flow"

### 2. Be Specific but Concise
- **DO:** "Add email verification with countdown timer (120s production, 5s development)"
- **DON'T:** "Update auth stuff"

### 3. Provide Context
- Include **why** the change matters, not just **what** changed
- **DO:** "Migrate from legacy components to custom components to reduce bundle size by 30%"
- **DON'T:** "Replace legacy components"

### 4. Group Related Changes
- Combine logically related changes under one entry
- Use sub-bullets for details when appropriate

### 5. Include Migration Notes for Breaking Changes
```markdown
### Changed
- **BREAKING**: API response format updated for channel endpoints
  - Migration: Update response parsing to use new field names
  - Before: `response.channelData` → After: `response.channel`
```

## Categories Explained

### Added
New features, components, functionality, or capabilities that didn't exist before.

### Changed
Modifications to existing functionality. Mark as **BREAKING** if it requires code changes.

### Fixed
Bug fixes that resolve incorrect behavior or errors.

### Deprecated
Features still present but marked for future removal. Include timeline and alternative.

### Removed
Features that have been deleted. Provide migration path if applicable.

### Security
Security-related improvements or fixes. Be careful not to expose vulnerability details.

## Technical Details to Include

### For New Features
- Feature name and key functionality
- Use cases or examples
- Integration with existing features

### For Bug Fixes
- Symptom description
- Impact (who was affected)
- Issue/DEV reference if available

### For Performance Improvements
- Metrics (load time, bundle size, memory usage)
- Before/after comparison
- Conditions where improvement applies

### For Breaking Changes
- Clear **BREAKING** label
- What changed and why
- Migration instructions with code examples
- Deprecation timeline if applicable

## Analysis Process

When asked to update CHANGELOG.md:

1. **Analyse git diff** to understand changed files
2. **Categorise changes** into appropriate sections
3. **Check for breaking changes** in API, props, or exports
4. **Identify user impact** to determine if changelog-worthy
5. **Group related changes** logically
6. **Write entries** following style guidelines
7. **Add to [Unreleased]** section at top
8. **Review for clarity** and completeness

## Version Management

### [Unreleased] Section
- All entries go here initially
- Accumulate until next release
- Keep organised by category

### Release Process
When releasing version X.Y.Z:
1. Rename `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD`
2. Add new empty `[Unreleased]` section above
3. Update version in package.json
4. Tag release in git

## Commit Message Integration

Parse commit messages for context:
- `feat:` → Added section
- `fix:` → Fixed section
- `refactor:` → Usually skip, unless user-facing
- `BREAKING CHANGE:` → Changed section with **BREAKING** label
- `perf:` → Changed section if measurable improvement
- `security:` → Security section

## Quality Checklist

Before finalising CHANGELOG entry:
- [ ] Entry is in correct category
- [ ] Uses present tense
- [ ] Provides user-facing context
- [ ] Includes migration notes if breaking
- [ ] Groups related changes
- [ ] Clear and concise language
- [ ] No sensitive security details
- [ ] Follows project's existing style

## Skill Collaboration

- **`git-workflow`** — commit types map to CHANGELOG sections
- **`technical-writer`** — for writing style and clarity
