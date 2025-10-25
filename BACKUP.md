# Backup Policy

This repository acts as a backup mirror plus a place to attach full ZIP snapshots.

## Strategy
- Remote mirror: push all branches and tags to `backup` remote
- Full snapshot release: attach a ZIP with everything (except `.git`) as a GitHub Release asset

## Mirror Commands
```bash
# add once
git remote add backup https://github.com/<YOUR_USERNAME>/lumina-estate-site-backup-YYYY-MM-DD.git

# push everything
git push backup --all
git push backup --tags

# or full mirror
git push --mirror backup
```

## Full Snapshot (Windows PowerShell)
```powershell
cd "C:\\Users\\User\\Desktop\\LUMINA MOTIFF 6.26.2025\\lumina-estate"
Compress-Archive -Path * -DestinationPath ..\\lumina-estate-full-snapshot-YYYY-MM-DD.zip -Force -CompressionLevel Optimal -Exclude '.git/*'
```

Optional (GitHub CLI):
```bash
gh release create v-backup-YYYY-MM-DD ..\\lumina-estate-full-snapshot-YYYY-MM-DD.zip --notes "Full snapshot"
```

## Restore
```bash
git clone https://github.com/<YOUR_USERNAME>/lumina-estate-site-backup-YYYY-MM-DD.git
cd lumina-estate-site-backup-YYYY-MM-DD
npm install
npm run dev
```

## Recover Specific Files
```bash
git log -- src/app/properties/components/AIChatComponent.tsx
git restore --source=<COMMIT_SHA> -- src/app/properties/components/AIChatComponent.tsx
```

## Revert a Bad Commit
```bash
git revert <COMMIT_SHA>
```

## Find “Lost” Commits
```bash
git reflog
```
