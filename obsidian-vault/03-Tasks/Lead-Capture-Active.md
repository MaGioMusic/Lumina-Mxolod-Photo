# Lead Capture — Implementation Started

> Critical feature for launch
> [[Lead-Capture-Implementation|← Design]] | [[User-Journey-Mapping|Journey]]

## 🎯 Goal
Enable users to submit inquiries and agents to receive/manage leads

## 📊 Current Status
**Started:** 2026-02-20 15:42  
**Phase:** Implementation  
**ETA:** 2 hours

## ✅ Prerequisites Check
- ✅ Database: `inquiries` table exists (using existing, no migration needed)
- ✅ i18n: Nearly complete (95%)
- 🟡 API: POST endpoint exists ✅, need GET for admin
- ⏳ Frontend: Need to update forms
- ⏳ Email: Need notification system

## 🚀 Implementation Plan

### Phase 1: API Endpoints (30 min)
- [x] `POST /api/inquiries` — Create inquiry ✅ Already exists
- [x] `GET /api/inquiries` — List (placeholder added) ✅
- [x] Validation and error handling ✅ Build passes

### Phase 2: Frontend Forms (30 min) — 🟡 IN PROGRESS
- [ ] Update contact page form — checking current implementation
- [ ] Add inquiry button to property detail page
- [ ] Create inquiry modal/component
- [ ] i18n all strings

**Status:** Starting frontend implementation
**Started:** 2026-02-20 15:54

### Phase 3: Email Notifications (30 min)
- [ ] Agent notification on new inquiry
- [ ] Auto-response to user
- [ ] Email templates

### Phase 4: Admin Dashboard (30 min)
- [ ] Lead inbox UI
- [ ] Status management
- [ ] Assignment to agents

---

## 📝 Notes
- Using existing `inquiries` table (avoids migration issues)
- PropertySubmitModal PR (#29) waiting for merge — not blocking
- Cursor PR #21 has i18n conflicts — will resolve later

---

*Started: 2026-02-20 15:42*
