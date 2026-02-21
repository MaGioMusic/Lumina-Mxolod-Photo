# Admin Panel Integration Plan

> Integrating admin panel from Motiff Edition to current Lumina
> Source: Luminia-Estate-Motiff-Edition-Private

## 📁 Structure to Migrate

### 1. Admin Pages
- `src/app/admin/layout.tsx` — Admin layout with sidebar
- `src/app/admin/dashboard/page.tsx` — Main dashboard
- `src/app/admin/users/page.tsx` — User management
- `src/app/admin/properties/page.tsx` — Property management
- `src/app/admin/settings/page.tsx` — Site settings

### 2. Admin Components
- `src/components/admin/Sidebar.tsx` — Navigation sidebar
- `src/components/admin/StatCard.tsx` — Statistics cards
- `src/components/admin/DataTable.tsx` — Reusable table
- `src/components/admin/Chart.tsx` — Charts/graphs

### 3. Adaptations Needed
- ✅ Add i18n support (t() for all strings)
- ✅ Connect to current auth system
- ✅ Use existing API endpoints
- ✅ Match current design system (colors, fonts)

## 🎯 Integration Steps

1. Create admin folder structure
2. Copy and adapt layout
3. Copy and adapt pages
4. Copy components
5. Add i18n keys
6. Connect to API
7. Test and verify

## ⏱️ ETA: 2-3 hours

---

*Plan created: 2026-02-20 21:10*  
*Status: Starting integration*
