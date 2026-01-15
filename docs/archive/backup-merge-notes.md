# Backup merge notes (read-only sources; no deletions)

This project has historical/experimental copies under:
- `backup-temp/` (workspace root)
- `lumina-estate/backup/**`

Per safety policy, these are treated as **read-only**. The canonical app is `lumina-estate/`.

## Duplicates observed (examples)
- `AIChatComponent.tsx` exists in canonical and also in backups.
- `FiltersSidebar.tsx` exists in canonical and also in backups.
- `PropertiesGrid.tsx` exists in canonical and also in backups.

## What we merged (selectively)
- **Token fetching logic**: Canonical code had multiple places calling `/api/vertex-token` directly.
  - Added a single client helper: `src/lib/vertexTokenClient.ts`
  - Updated canonical consumers (chat + voice) to use it.
  - This reduces duplication and prevents unnecessary token request spikes.

## What we did NOT merge (and why)
- Large experimental backup components were not copied wholesale to avoid regressions.
- Any future backup-to-canonical merge should be done in small, audited chunks with
  `npm run lint` + `npm run build` after each change.

