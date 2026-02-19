# 📚 Lumina Obsidian Vault

> Knowledge base for Lumina Estate development

## 🚀 Quick Start

1. **Open in Obsidian:**
   - Open Obsidian → "Open folder as vault"
   - Select: `D:\Lumina Oraculus\Lumina-Version-1\obsidian-vault`

2. **Start Here:**
   - Open [[00-Knowledge-Hub]] — Main dashboard
   - Or [[00-Index]] — Full index

3. **Explore:**
   - Use **Graph View** (Ctrl/Cmd+G) to see connections
   - Use **Quick Switcher** (Ctrl/Cmd+O) to find notes
   - Follow links between notes

## 📁 Folder Structure

```
obsidian-vault/
├── 00-Knowledge-Hub.md      ← Start here
├── 00-Index.md              ← Full vault index
├── MOC.md                   ← Map of Content
├── 01-Architecture/         ← System design
│   ├── Components/          ← React components
│   └── i18n.md              ← Translation system
├── 02-Decisions/            ← ADRs
├── 03-Tasks/                ← Active tasks
├── 04-Research/             ← Investigations
├── 05-Meetings/             ← Meeting notes
│   └── Daily/               ← Daily logs
└── 99-Templates/            ← Note templates
```

## 🔗 Key Concepts

### Wiki Links
Use `[[Note Name]]` to link between notes:
- [[i18n]] — Translation system
- [[MapView]] — Property map component
- [[2026-02-19-i18n-batch-1]] — Completed task

### Tags
- `#i18n` — Internationalization work
- `#component` — UI components
- `#completed` — Finished tasks
- `#in-progress` — Active work

### Graph View
Press **Ctrl/Cmd+G** to see:
- Notes as nodes
- Links as connections
- Orphaned notes (unconnected)
- Hub notes (many connections)

## 🎯 Use Cases

### Find Component Info
1. Open [[00-Knowledge-Hub]]
2. Click [[01-Architecture]]
3. Browse Components folder
4. Or search: `[[MobileFilterDrawer]]`

### Track i18n Progress
1. Open [[i18n]]
2. Check status table
3. Click any component for details

### Review Decisions
1. Open [[02-Decisions]]
2. Read [[Decision-001-kimi-for-i18n]]
3. See rationale and consequences

### Daily Updates
1. Check [[05-Meetings]]
2. Open today's date
3. See what autonomous agent did

## 🤖 Autonomous Agent

This vault is maintained by an autonomous AI agent:
- Updates notes after each PR
- Logs daily progress
- Creates new docs automatically
- Links related concepts

**Agent Mode:** Self-operating (reports only critical issues)

## 📝 Templates

Use templates for consistency:
- `99-Templates/Task-Template.md` — New tasks
- `99-Templates/PR-Template.md` — PR documentation

## 🏷️ Tag Index

| Tag | Count | Description |
|-----|-------|-------------|
| #i18n | 4+ | Translation work |
| #component | 3+ | UI components |
| #completed | 3+ | Finished work |
| #map | 2+ | Map components |

---
*Vault created: 2026-02-19*
*Maintained by: Autonomous Agent*
