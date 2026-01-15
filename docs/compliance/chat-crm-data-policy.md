# Chat + CRM Data Policy (Lumina Estate)

> Status: **Draft (MVP → EU/US ready)**
>
> Last updated: 2026-01-12
>
> Audience: Product, Engineering, Sales (agents), Legal/Privacy review

## 0) TL;DR
- **We store** user chat + a structured “lead snapshot” in Supabase to preserve context across refresh and to help sales agents.
- **We keep it** for **30 days** since last activity (auto-delete).
- **We minimize**: store **summary + last N messages** for AI context; store **structured fields** for CRM (not the whole chat duplicated everywhere).
- **We protect access**: end users see only their conversation; agents see only assigned/org-scoped leads; admins audited.
- **Users can delete** their chat history and request export.

## 1) Scope (what this covers)
This policy applies to:
- **Chat messages** (text input from users and assistant outputs)
- **Voice transcripts** (if voice mode is enabled)
- **CRM lead data** derived from chat (structured fields + events)
- **AI summaries / recommendations** created for internal use

Out of scope:
- Property catalog public content (listings, images) except when referenced in a conversation.

## 2) Data categories & examples
### 2.1 Non‑PII (generally safe, still “personal data” in context)
Examples:
- District/location preference: “საბურთალო”, “ვაკე”
- Budget range: “$800–$1000”
- Property requirements: “2 bedrooms, balcony”
- Timeframe: “next month”

### 2.2 PII (personally identifiable information)
We may process/store PII **only if the user provides it** (or it is required for service fulfillment).
Examples:
- Phone number
- Email
- Name (if user shares)

### 2.3 Sensitive / restricted data (do not collect)
We do **not** request or intentionally store:
- Government IDs / personal numbers
- Payment card details
- Health data
- Exact home address unless explicitly required for a scheduled viewing (and even then, store minimally)

If a user shares restricted data in free text, we should redact it where feasible and avoid copying it into CRM fields.

## 3) Purpose of processing (why we store it)
### 3.1 Service delivery (primary)
- Preserve chat context so the user does not repeat themselves after refresh/navigation.
- Provide accurate recommendations and property search assistance.

### 3.2 Sales assistance (internal CRM)
- Notify/enable human sales agents to follow up with correct context (requirements, budget, preferred areas).
- Create internal “lead snapshot” so agents can act faster.

### 3.3 Product improvement (optional)
- Aggregate, de‑identified insights (e.g., most requested districts) may be used for product decisions.
- No “raw chat text” is required for this; prefer aggregated metrics.

## 4) Lawful basis & consent (practical guidance)
We operate with a “minimum necessary” approach:
- **Chat support** is treated as **service delivery** (core function).
- **Sales follow‑up** can be treated as **legitimate interest** (with opt‑out), depending on jurisdiction and final legal review.
- **Analytics/marketing tracking** (e.g., GA4) should be consent‑gated for EU readiness.

> Note: This document is not legal advice; it describes the product/engineering intent and required controls.

## 5) Retention / TTL (how long we keep data)
### 5.1 Default retention (MVP)
- **Chat + CRM data**: **30 days since last activity**, then auto-delete.

### 5.2 Exceptions (only if needed)
- If a lead becomes an active “deal” (signed contract / ongoing case), retention may follow business/legal requirements, but must be explicitly documented.

### 5.3 Implementation rule
- Every conversation/lead must have `expires_at` and an automated cleanup job.

## 6) Access control (who can see what)
### 6.1 End users
- Can access only **their** conversation (by authenticated user id or stable visitor id).

### 6.2 Sales agents
- Can access leads assigned to them (or within their organization scope).
- Do not have access to unrelated users’ conversations.

### 6.3 Admins / Support
- Limited access for operations, with audit logging (“who viewed what and when”).

### 6.4 Service role
- Background jobs only (cleanup, summary generation, event processing).

## 7) Minimization strategy (how we keep it small + useful)
### 7.1 Conversation storage
- Store all messages for up to 30 days, but **AI context** uses:
  - **Rolling summary** (short text)
  - **Last N messages** (e.g., last 20–50)

### 7.2 CRM storage
CRM should store:
- **Structured fields** (budget/location/type/rooms/timeframe/contact)
- **Events** (timeline of meaningful changes)

CRM should NOT store:
- Full chat duplicated into multiple places.

## 8) CRM field definition (MVP)
### 8.1 Lead snapshot (example fields)
- `intent`: rent | buy | invest | unknown
- `location_preferences`: list of districts/cities
- `budget_min`, `budget_max`, `currency`
- `property_type`: apartment/house/etc
- `bedrooms_min`, `bathrooms_min`
- `move_in_timeframe` (free text or enum)
- `contact_phone`, `contact_email` (optional)
- `language`: ka/en/ru
- `priority`: low/medium/high (derived)
- `status`: new | contacted | qualified | closed | archived

### 8.2 Lead events (examples)
- `requirement_updated` (e.g., budget changed)
- `contact_shared` (phone/email)
- `appointment_requested`
- `property_shortlist_created`

## 9) User rights: delete / export / opt‑out
### 9.1 Delete
- Provide a user action: **“Delete my chat history”**
- Deletion removes conversation + related CRM snapshot/events unless a legal exception applies (must be documented).

### 9.2 Export
- Provide support/admin workflow to export user conversation and lead snapshot on request.

### 9.3 Opt‑out
- For sales follow-up messaging or analytics, provide an opt‑out path where required.

## 10) Security controls (engineering requirements)
Minimum requirements:
- **No raw PII in production logs**
- **CSP + security headers** (start in report-only; enforce before EU launch)
- **Session security**: avoid storing sensitive user identity in `localStorage`
- **Rate limiting** on AI/token endpoints
- **Input sanitization** for any user-generated HTML rendering (chat is plain text, keep it that way)

## 11) Vendors (Supabase + Vertex AI)
### 11.1 Supabase
- Stores: chat/CRM tables, access policies, retention job state.
- Choose region appropriate for target market (EU/US expansion).

### 11.2 Vertex AI (Gemini)
- Receives: minimized prompt context (rolling summary + last N messages) when needed.
- Avoid sending restricted data (IDs, payment info).
- Regional + contract/DPA considerations before EU expansion.

## 12) Implementation mapping (proposed tables)
Suggested tables (names can change, but responsibilities should match):
- `ai_conversations` (id, user_id/visitor_id, summary, expires_at, timestamps)
- `ai_messages` (conversation_id, role, content, created_at, metadata)
- `crm_leads` (conversation_id, snapshot fields, status, expires_at)
- `crm_events` (conversation_id, type, payload, created_at)

## 13) Change log
- 2026-01-12: Initial draft for MVP chat history + CRM-on-Supabase approach.

