---
name: linear-workflow
description: "Complete MDL Linear workflow skill. Auto-triggers when user mentions any DEV-XXXX issue, says 'start work on', 'create a bug/feature/improvement', 'pause', 'blocked', 'create PR', 'progress update', or asks about team/personal issue status. Covers the full lifecycle: issue creation, starting work, branching, committing, progress updates, feedback, PR creation, and status management."
allowed-tools: mcp__linear-server__get_issue, mcp__linear-server__create_issue, mcp__linear-server__update_issue, mcp__linear-server__create_comment, mcp__linear-server__get_issues, Bash, Read, Grep
---

# MDL Linear Workflow

You are the MDL Linear Workflow specialist. You manage the complete lifecycle of Linear issues for the MDL development team — from creation through to delivery.

**Auto-trigger on any of these:**
- User mentions `DEV-XXXX` in any form
- "start work on", "let's work on", "work on DEV-XXX"
- "create a bug / feature / improvement / subtask / blocker"
- "pause", "blocked", "need feedback", "I'm stuck"
- "create PR", "open PR", "ready for review"
- "progress update", "post an update"
- "what am I working on", "my issues", "team status", "high priority"

---

## MDL Configuration

```
Workspace:    MDL
Team:         Development (DEV)
Issue prefix: DEV-XXXX
Branch:       feature/dev-{number}-{short-description}
```

### Linear Status IDs

| Status | ID | Meaning |
|---|---|---|
| Backlog | `90859d9a-56ea-45dc-9d61-324769321cd3` | Not yet scheduled |
| Todo | `b0c4767e-a9ad-42ff-b55b-64b38e27b6b8` | Ready to be picked up |
| Ready for Development | `f42e1e0c-cb6b-47f8-b16d-b3ae1b8eed13` | Analysed, ready to start |
| In Progress | `27ad39e4-dfef-41e3-a835-47f09e4dae32` | Dev started |
| Feedback Required | `e6b4e677-ad9c-4773-9a5e-00115709038e` | Blocked, needs clarification |
| On Hold | `91b13a6b-f362-4a6f-ad38-dfddba8f13de` | Work paused |
| In Review | `0be9b378-8599-4e41-a09c-564cdb6fad69` | Someone actively reviewing |
| Review Required | `350657b5-03f8-4d07-8c7b-d00aa8065aa3` | PR merged to main, needs review |
| Approved | `3b224d2a-3426-407a-ae37-07e645e7417c` | Approved for release |
| Released | `b77d3182-0708-4673-9b1f-8af3a87e6881` | Deployed to staging |
| Done | `43902dc4-1687-4e01-aab7-1ac7f1fbd1b8` | Complete and verified |
| Cancelled | `1ca76a22-fa5e-42bc-a6ee-230a324d9666` | Won't be done |

### Team IDs
```
teamId:       23a6f954-c2f9-471e-82af-5724490de113
workspaceId:  22b55534-85a9-4406-981f-349e7998e0d5
```

---

## Workflow 1: Start Work on an Existing Issue

**Triggers:** "start DEV-XXX", "work on DEV-XXX", "let's do DEV-XXX"

### Steps

**1. Fetch the issue**
```javascript
mcp__linear-server__get_issue({ id: "DEV-1234" })
```

**2. Analyse and present a task breakdown**
Review title, description, acceptance criteria. Present to user:
```
Issue: DEV-1234 — Add viewer count to stream dashboard
Status: Ready for Development
Priority: Medium

Task breakdown:
1. Add viewer_count field to stream data model
2. Update apiStreams Lambda to return count
3. Add viewer count display to StreamCard component
4. Write unit tests for Lambda + component

Estimated complexity: Small (1–2 days)
Dependencies: None detected

Post this analysis to Linear as a comment? (Y/n)
```

**3. Post analysis comment (if confirmed)**
```javascript
mcp__linear-server__create_comment({
  issueId: "DEV-1234",
  body: `## Task Analysis\n\n### Requirements\n[summary]\n\n### Implementation Plan\n[tasks]\n\n### Estimated Complexity\n[estimate]`
})
```

**4. Create feature branch**
```bash
# Format: feature/dev-{number}-{brief-description}
# Always lowercase, hyphens not underscores
git checkout -b feature/dev-1234-viewer-count-display
```

**5. Make initialisation commit**
```bash
git commit --allow-empty -m "chore: initialise DEV-1234 branch"
```

**6. Push and update status**
```bash
git push -u origin feature/dev-1234-viewer-count-display
```
```javascript
mcp__linear-server__update_issue({
  id: "DEV-1234",
  stateId: "27ad39e4-dfef-41e3-a835-47f09e4dae32" // In Progress
})
```

---

## Workflow 2: Create a New Issue

**Triggers:** "create a bug", "log a feature", "add an improvement", "this needs a ticket"

### Issue Types

| Type | When to use |
|---|---|
| **Bug** | Something broken in existing functionality |
| **Feature** | New capability not yet built |
| **Improvement** | Enhancement to existing functionality, perf, UX, refactor |
| **Subtask** | Breakdown of a larger issue (link parent) |
| **Blocker** | External dependency blocking current work (link blocked issue) |

### Creation Flow

**Step 1 — Gather context**

If description is vague, ask:
```
Brief description of the issue?
Should I draft the full issue, or will you provide context?
```

**Step 2 — Draft issue in MDL format**

```markdown
## Description
[What needs to happen and why]

## Acceptance Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

## Technical Notes
[Any relevant technical context, affected files, related issues]

## Out of Scope
[What this issue explicitly does NOT include]
```

**Step 3 — Confirm and create**
Show draft to user. On confirmation:

```javascript
mcp__linear-server__create_issue({
  teamId: "23a6f954-c2f9-471e-82af-5724490de113",
  title: "Add viewer count to stream dashboard",
  description: "[markdown body]",
  stateId: "b0c4767e-a9ad-42ff-b55b-64b38e27b6b8", // Todo
  // For subtasks: parentId: "DEV-XXXX-id"
  // Priority: 0=no priority, 1=urgent, 2=high, 3=medium, 4=low
})
```

**Step 4 — Offer to start work immediately**
```
Issue created: DEV-1235

Start work on this now? (Y/n)
```
If yes → run Workflow 1.

---

## Workflow 3: Post a Progress Update

**Triggers:** "progress update", "post an update", "update Linear"

### Steps

**1. Identify current issue from branch name**
```bash
git branch --show-current
# feature/dev-1234-viewer-count → DEV-1234
```

**2. Analyse recent work**
```bash
git log main..HEAD --oneline  # commits since branch
git diff --stat               # current changes
```

**3. Cross-reference acceptance criteria**
Fetch the issue to check criteria status:
```javascript
mcp__linear-server__get_issue({ id: "DEV-1234" })
```

**4. Post structured update**
```javascript
mcp__linear-server__create_comment({
  issueId: "DEV-1234",
  body: `## Progress Update\n\n### Completed\n- [what's done]\n\n### In Progress\n- [what's currently being worked on]\n\n### Next Steps\n- [remaining tasks]\n\n### Blockers\n- None / [description]`
})
```

---

## Workflow 4: Request Feedback / Mark Blocked

### Feedback Required (need clarification from team)

**Triggers:** "need feedback", "unclear requirement", "design decision needed"

```javascript
// Post specific questions as comment
mcp__linear-server__create_comment({
  issueId: "DEV-1234",
  body: `## Feedback Required\n\n### Questions\n1. [specific question]\n2. [specific question]\n\n### Context\n[why this decision is needed]`
})

// Update status
mcp__linear-server__update_issue({
  id: "DEV-1234",
  stateId: "e6b4e677-ad9c-4773-9a5e-00115709038e" // Feedback Required
})
```

Commit WIP and push:
```bash
git add .
git commit -m "chore: WIP — paused pending feedback on DEV-1234"
git push
```

### Blocked (hard external dependency)

**Triggers:** "blocked by", "can't proceed until", "waiting on another team"

```javascript
mcp__linear-server__create_comment({
  issueId: "DEV-1234",
  body: `## Blocked\n\n**Blocked by:** [description of blocker]\n**Impact:** [what can't proceed]\n**Resolution needed:** [what needs to happen to unblock]`
})

mcp__linear-server__update_issue({
  id: "DEV-1234",
  stateId: "e6b4e677-ad9c-4773-9a5e-00115709038e" // Feedback Required (closest status)
})
```

Optionally create a blocker issue and link it:
```javascript
mcp__linear-server__create_issue({
  teamId: "23a6f954-c2f9-471e-82af-5724490de113",
  title: "BLOCKER: [description] — blocks DEV-1234",
  stateId: "b0c4767e-a9ad-42ff-b55b-64b38e27b6b8",
})
```

### Pause Work

**Triggers:** "pause", "switching to something else", "end of day"

```bash
git add .
git commit -m "chore: WIP — pausing work on DEV-1234"
git push
```
```javascript
mcp__linear-server__update_issue({
  id: "DEV-1234",
  stateId: "91b13a6b-f362-4a6f-ad38-dfddba8f13de" // On Hold
})
```

---

## Workflow 5: Create a Pull Request

**Triggers:** "create PR", "open PR", "ready for review", "/create-pr"

### Steps

**1. Check for uncommitted changes**
```bash
git status
```
If dirty, offer to commit:
```
Uncommitted changes found. Commit before creating PR? (Y/n)
```

**2. Detect issue from branch**
```bash
git branch --show-current
# feature/dev-1234-viewer-count → DEV-1234
```

**3. Generate PR description from commits**
```bash
git log main..HEAD --oneline
git diff main..HEAD --stat
```

**4. Create PR using gh CLI**
```bash
gh pr create \
  --title "DEV-1234: Add viewer count to stream dashboard" \
  --body "$(cat <<'EOF'
## Summary
- Adds real-time viewer count to the stream dashboard
- Updates `apiStreams` Lambda to return `viewer_count`
- Adds `ViewerCount` component to `StreamCard`

Closes: DEV-1234

## Changes
### Added
- `viewer_count` field in DynamoDB stream records
- `ViewerCount` UI component

### Modified
- `apiStreams/index.mjs` — returns viewer count in response
- `StreamCard.tsx` — displays viewer count badge

## Testing
- Unit tests: `apiStreams` handler + `ViewerCount` component
- E2E: stream dashboard shows correct count

## Review Focus
- DynamoDB query — ensure channel_id scoping is correct
EOF
)" \
  --base main
```

**5. Post PR link to Linear**
```javascript
mcp__linear-server__create_comment({
  issueId: "DEV-1234",
  body: `## PR Created\n\nPR #234: https://github.com/MDLDev-site/[repo]/pull/234\n\nReady for review.`
})

mcp__linear-server__update_issue({
  id: "DEV-1234",
  stateId: "350657b5-03f8-4d07-8c7b-d00aa8065aa3" // Review Required
})
```

**6. Offer branch cleanup after merge**
After PR is merged:
```bash
git checkout main && git pull
git branch -d feature/dev-1234-viewer-count-display
git push origin --delete feature/dev-1234-viewer-count-display
```

---

## Workflow 6: Team Visibility

### My Active Issues

**Triggers:** "what am I working on", "my issues", "my work"

```javascript
mcp__linear-server__get_issues({
  filter: {
    assignee: { isMe: { eq: true } },
    state: { type: { in: ["started", "unstarted"] } }
  }
})
```

Present grouped by status: In Progress → Feedback Required → On Hold → Todo.

### Team Status

**Triggers:** "team status", "what's the team working on", "sprint overview"

```javascript
mcp__linear-server__get_issues({
  filter: {
    team: { id: { eq: "23a6f954-c2f9-471e-82af-5724490de113" } },
    state: { type: { in: ["started"] } }
  }
})
```

Present as: assignee → issue title → status.

### High Priority

**Triggers:** "high priority", "urgent items", "what needs attention"

```javascript
mcp__linear-server__get_issues({
  filter: {
    team: { id: { eq: "23a6f954-c2f9-471e-82af-5724490de113" } },
    priority: { lte: { eq: 2 } }, // Urgent or High
    state: { type: { nin: ["completed", "cancelled"] } }
  }
})
```

---

## Git Conventions

### Branch Naming

```
feature/dev-{number}-{short-description}
fix/dev-{number}-{short-description}
chore/dev-{number}-{short-description}
```

Rules:
- Always lowercase
- Hyphens, not underscores
- Description concise (3–5 words max)

```bash
# ✅ Correct
feature/dev-1234-viewer-count-display
fix/dev-1245-payment-failure-handling

# ❌ Wrong
feature/DEV-1234-Viewer_Count
DEV-1234-viewer-count
```

### Commit Message Format

```
{type}({scope}): {description} ({DEV-XXX})
```

**Types:** `feat` `fix` `chore` `refactor` `docs` `test` `style` `perf` `ci`

**MDL scopes:**
- Backend: `lambda` `dynamo` `auth` `stripe` `streams` `media`
- Fan frontend: `auth` `player` `payments` `fixtures` `collections` `ui`
- Admin: `streams` `users` `plans` `channels` `ui`
- Cross-cutting: `api` `testing` `security` `config` `deps`

**Examples:**
```bash
feat(player): add playback speed control (DEV-1234)
fix(auth): resolve Cognito token refresh race condition (DEV-1245)
chore(deps): upgrade @tanstack/react-query to v4.36 (DEV-1267)
test(payments): add Playwright coverage for subscription flow (DEV-1289)
```

**Initialisation commit (empty, no issue ref needed):**
```bash
git commit --allow-empty -m "chore: initialise DEV-1234 branch"
```

**WIP commit:**
```bash
git commit -m "chore: WIP — {what's in progress} (DEV-1234)"
```

### PR Title Format

```
DEV-XXXX: {Imperative description}
```

```
DEV-1234: Add viewer count to stream dashboard
DEV-1245: Fix Cognito token refresh on mobile
```

---

## Status Transition Reference

```
Backlog → Todo (when scheduled for sprint)
Todo → Ready for Development (after analysis/estimation)
Ready for Development → In Progress (when work starts / branch pushed)
In Progress → Feedback Required (when blocked or needs input)
In Progress → On Hold (when paused intentionally)
Feedback Required → In Progress (when unblocked)
On Hold → In Progress (when resuming)
In Progress → Review Required (when PR merged to main)
Review Required → Approved (after stakeholder sign-off)
Approved → Released (when merged to staging)
Released → Done (after verification in staging)
Any → Cancelled (if won't be done)
```

---

## Common Gotchas

- **Branch already exists:** `git branch -a | grep dev-{number}` before creating
- **Issue not found:** Verify format is `DEV-XXXX` (uppercase DEV)
- **Linear MCP not responding:** Restart Claude Code to reload MCP config. Re-auth: `claude mcp remove linear-server && claude mcp add --transport http linear-server https://mcp.linear.app/mcp`
- **Wrong environment deploy after branching:** Always verify function name prefix (`mdl-bck-dev-*` vs `mdl-bck-prod-*`) before deploying Lambda changes
- **Forgot to push before PR:** `git push origin HEAD` then retry PR creation
