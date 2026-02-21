# Obsidian Workflow Improvements

> Ideas for using Obsidian more effectively with Lumina development
> Created: 2026-02-21

## Current Setup Analysis

### What's Working Well ✅
- Daily logs in `05-Meetings/Daily/`
- Quick-Context for status at-a-glance
- Component documentation in `01-Architecture/Components/`
- Task tracking with `03-Tasks/`

### Pain Points 🤔
- Manual updates to multiple files
- No automated PR/issue linking
- Component templates are ad-hoc
- Decision history scattered

---

## 🎯 Proposed Improvements

### 1. Automated Daily Log Creation

**Current:** Manually create daily log file  
**Proposed:** Template + automation

**Implementation:**
```markdown
---
creation_date: {{date:YYYY-MM-DD}}
tags: daily-log
---

# Daily Log — {{date:YYYY-MM-DD}}

## 🎯 Goals (Set in morning)
- [ ] Goal 1
- [ ] Goal 2

## ✅ Achievements

## 📝 Notes

## 🎯 Tomorrow
```

**Automation:**
- Use Obsidian Templater plugin
- Auto-insert date, branch name, PR links

---

### 2. Task Management with Dataview

**Current:** Static task lists  
**Proposed:** Dynamic task queries

**Implementation:**
```markdown
## Open Tasks
```dataview
TASK
FROM #task
WHERE !completed
SORT priority ASC
```

## Today's Tasks
```dataview
TASK
WHERE created = {{date:YYYY-MM-DD}}
```
```

**Benefits:**
- Auto-update task status
- Filter by priority, date, project
- See all open tasks in one view

---

### 3. PR/Issue Linking System

**Current:** Manual PR numbers in text  
**Proposed:** Structured frontmatter + links

**Implementation:**
```markdown
---
pr_number: 31
pr_branch: oraculus/p1-propertysubmit-i18n
pr_status: merged
issues_closed:
  - "admin login fix"
  - "lint warnings"
cursor_review: approved
---

# PR #31 — Admin/Inquiries Stabilization

[[github.com/MaGioMusic/Lumina-Mxolod-Photo/pull/31]]
```

**Query all merged PRs:**
```dataview
TABLE pr_status, cursor_review
FROM "05-Meetings/Daily"
WHERE pr_number
SORT file.name DESC
```

---

### 4. Component Documentation Templates

**Current:** Free-form component docs  
**Proposed:** Standardized template

**Template:** `99-Templates/Component.md`
```markdown
---
component_name: {{component}}
status: draft|ready|deprecated
created: {{date:YYYY-MM-DD}}
location: src/components/{{component}}/
---

# {{component}}

## Overview
What does this component do?

## Props
| Prop | Type | Required | Default |
|------|------|----------|---------|

## Usage
```tsx
// Example code
```

## Testing Checklist
- [ ] Test 1
- [ ] Test 2

## i18n Keys
- `keyName` — description

## Related
- [[ComponentName]]
```

---

### 5. Decision Log Integration

**Current:** Decisions in various files  
**Proposed:** Centralized with context

**Implementation:**
```markdown
# Decision Log

## 2026-02-21: Undo System Architecture
**Context:** Needed undo for PhotoPipeline bulk actions  
**Decision:** Use actionHistory state with previousState snapshots  
**Alternatives considered:**
- Redux undo/redo (too heavy)
- Command pattern (overkill)
**Consequences:** 10-action limit, memory efficient ✅

## 2026-02-20: i18n Approach
**Context:** Mixed hardcoded strings in admin dashboard  
**Decision:** Wrap with t() + fallbacks  
**Alternatives:**
- JSON files (Cursor's approach — conflict)
**Consequences:** Gradual migration possible ✅
```

---

### 6. Automated Context Updates

**Current:** Manually update Quick-Context.md  
**Proposed:** Scripted or templated updates

**Idea:** After each commit:
```bash
# Auto-update Quick-Context with:
# - Latest commit message
# - Current branch
# - Build status
# - Open PRs count
```

**Could use:**
- Obsidian Git plugin (auto-commit notes)
- Git hooks
- GitHub Actions for sync

---

### 7. Meeting Notes Structure

**Current:** Ad-hoc meeting notes  
**Proposed:** Consistent structure

**Template:**
```markdown
# Meeting — {{date}}

## Attendees
- @gio
- @oraculus

## Agenda
1. Topic 1
2. Topic 2

## Decisions
- Decision 1 → [[Decision-Log#2026-02-21]]

## Action Items
- [ ] @gio: Task 1
- [ ] @oraculus: Task 2

## Next Meeting
{{date+7d}}
```

---

### 8. Knowledge Graph Visualization

**Current:** MOC.md exists but underutilized  
**Proposed:** Active linking + graph view

**Actions:**
- Link every component to related components
- Use tags: `#component`, `#api`, `#ui`, `#bug`
- Create MOC pages for each category
- Use graph view to find orphaned notes

---

## 🛠️ Tools to Add

### Recommended Obsidian Plugins
1. **Templater** — Automated templates
2. **Dataview** — Dynamic queries
3. **Git** — Version control for notes
4. **Kanban** — Task boards
5. **Tag Wrangler** — Tag management
6. **Graph Analysis** — Find orphaned notes

### External Integrations
1. **GitHub → Obsidian**
   - PR templates include obsidian link
   - GitHub Actions update vault

2. **Linear/Jira → Obsidian**
   - Sync issues to tasks
   - Link commits to decisions

---

## 📋 Implementation Priority

### Phase 1: Templates (Easy win)
- [ ] Create Component template
- [ ] Create Daily Log template
- [ ] Create Meeting template
- [ ] Install Templater plugin

### Phase 2: Task System
- [ ] Add #task tags to existing tasks
- [ ] Create Task Dashboard with Dataview
- [ ] Install Dataview plugin

### Phase 3: Automation
- [ ] Git hooks for context updates
- [ ] Auto-create daily logs
- [ ] PR linking system

---

## 💡 Quick Wins (Do Today)

1. **Install Templater plugin**
2. **Create 3 templates:**
   - Component
   - Daily Log
   - Meeting
3. **Add #task to all open items**
4. **Link related components** (at least 5 links)

---

## Current Vault Health

### Stats
- Total notes: ~40
- Components documented: 5
- Daily logs: 3
- Tasks tracked: ~15

### Goals
- [ ] 100% component coverage
- [ ] Every PR has decision log entry
- [ ] Zero orphaned notes
- [ ] Automated daily context

---

*Ideas collected: 2026-02-21  
*Next review: After Phase 1 implementation*
