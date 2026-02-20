# Lead Capture Flow Implementation

> Critical feature for both property seekers and owners
> [[User-Journey-Mapping|← Journey Map]] | [[Next-Steps|Plan]]

## 🎯 Goal
Enable users to submit inquiries and agents to receive/manage leads

## 📋 Components Needed

### 1. Database Schema (Prisma)
```prisma
model Lead {
  id          String   @id @default(cuid())
  name        String
  email       String
  phone       String?
  message     String
  propertyId  String?  // Optional: if about specific property
  agentId     String?  // Assigned agent
  status      LeadStatus @default(NEW)
  source      String   // 'contact_page', 'property_detail', etc.
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum LeadStatus {
  NEW
  CONTACTED
  VIEWING_SCHEDULED
  NEGOTIATING
  CLOSED_WON
  CLOSED_LOST
}
```

### 2. API Endpoints
- `POST /api/leads` — Create lead
- `GET /api/leads` — List leads (admin only)
- `PATCH /api/leads/[id]` — Update status
- `DELETE /api/leads/[id]` — Delete lead

### 3. Email Notifications
- Instant email to agent when lead arrives
- Auto-response to user confirming receipt
- Follow-up reminders

### 4. Admin Dashboard
- Lead inbox
- Status management
- Assignment to agents
- Analytics

## 🚀 Implementation Steps

### Phase 1: Database (15 min)
1. Add Lead model to schema.prisma
2. Run migration
3. Generate Prisma client

### Phase 2: API (30 min)
1. Create POST endpoint
2. Add validation
3. Add email trigger

### Phase 3: Frontend (30 min)
1. Update contact form
2. Add to property detail page
3. i18n all strings

### Phase 4: Admin (45 min)
1. Dashboard UI
2. Lead list
3. Status updates

**Total: ~2 hours**

## 🎯 Success Criteria
- [ ] User can submit inquiry
- [ ] Agent receives email notification
- [ ] Lead appears in admin dashboard
- [ ] Agent can update status
- [ ] All i18n (ka/en/ru)

---
*Started: 2026-02-20*
