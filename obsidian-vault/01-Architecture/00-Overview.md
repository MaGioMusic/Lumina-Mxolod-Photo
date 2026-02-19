# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Lumina Estate                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 15)                                      │
│  ├── Marketing Pages                                        │
│  │   ├── [[properties]] — Property listings, map view       │
│  │   ├── [[agents]] — Agent profiles                        │
│  │   └── [[contact]] — Contact forms                        │
│  ├── Dashboard                                              │
│  │   ├── [[agent-dashboard]] — Agent tools                  │
│  │   └── [[client-dashboard]] — Client area                 │
│  └── Auth                                                   │
│      ├── [[login-flow]]                                     │
│      └── [[registration]]                                   │
├─────────────────────────────────────────────────────────────┤
│  Backend (Next.js API Routes)                               │
│  ├── [[properties-api]]                                     │
│  ├── [[auth-api]]                                           │
│  └── [[inquiries-api]]                                      │
├─────────────────────────────────────────────────────────────┤
│  Database (Prisma + PostgreSQL)                             │
│  └── [[database-schema]]                                    │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### i18n System
- [[LanguageContext]] — Central translation provider
- [[translations-structure]] — How keys are organized
- [[i18n-audit-2026-02-19]] — Cleanup progress

### Map System
- [[MapView]] — Leaflet-based property map
- [[clustering-logic]] — How properties cluster
- [[GoogleMaps-integration]] — Satellite/Street view

### Auth System
- [[NextAuth-setup]] — Authentication flow
- [[role-based-access]] — Agent vs Client vs Admin
- [[session-management]]

## Data Flow

```
User → [[Header]] → [[PropertyFilter]] → [[MapView]]
                   ↓
              [[PropertyCard]] → [[PropertyDetail]]
```
