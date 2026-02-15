# Lumina Oraculus — Execution Plan (Draft v1)

## 1) Mission (clear target)
Build **Lumina Estate** as an AI-native PropTech platform (marketplace + agent CRM + automation + concierge), then harden it to launch quality.

## 2) What we already know
- Core vision/architecture is documented in `Lumine Estate Project (Context).docx`.
- Current codebase: Next.js 15 + Supabase + Prisma + n8n-related flows.
- Current repo state has mixed in-progress changes; needs stabilization before major feature push.

## 3) Key problems to solve now
1. **Page consistency / information architecture drift**
   - Some pages are polished, some are incomplete or inconsistent.
2. **User binding/auth issues**
   - Identity/session/account linkage flows need clear definition and enforcement.
3. **Flow quality / UX friction**
   - Search → details → favorite/save → contact/lead paths need audit and simplification.
4. **Technical hygiene**
   - Warning debt (hooks/deps), uncontrolled in-progress changes, missing acceptance checks.

## 4) Deep-research findings (external)
### A) Required pages for this product type
Minimum high-value pages for real-estate platform:
- Home/Landing
- Listings + advanced Search/Filters
- Property Details
- Agent profiles
- Contact / lead capture
- Testimonials/reviews
- Blog/Resources (SEO)
- Buyer/Seller resource pages
Reference summary: EuroDNS, RealGeeks, Zillow, NAR, etc.

### B) Common UX failures (we should proactively avoid)
- Overlong onboarding forms
- Hidden or weak CTAs
- Non-persistent saved searches/favorites
- Mobile friction (tiny controls, slow pages)
- Poor confirmation states after form actions
Reference summary: Sierra, IDXBroker, Homeflow, TypeNorth.

### C) CRM/lead routing best practices
- Routing by geography + expertise + source + score + availability
- Clear statuses: New → Contacted → Qualified → Negotiation → Closed
- Automated follow-ups + response-time SLAs
Reference summary: iHomeFinder, Pipedrive, Sierra, Nimble.

### D) AI concierge implementation requirements
- Strong conversation design + human handoff
- Tight integrations (calendar/CRM/knowledge base)
- Privacy/compliance-first behavior
- Analytics loop for continuous tuning
Reference summary: LeapingAI, Eastern Peak, Master of Code.

## 5) Phased execution
## Phase 0 — Stabilize (now)
- Lock baseline branch + snapshot
- Classify current modified/untracked files
- Run lint/build sanity + define “red” issues
- Produce defect list (P0/P1/P2)

## Phase 1 — IA + page map freeze
- Finalize canonical sitemap
- Define each page goal + primary CTA + data dependencies
- Mark pages as: Keep / Refactor / Merge / Remove

## Phase 2 — User/Auth binding hardening
- Define actor model: guest/buyer/seller/agent/admin
- Define account linking/session rules
- Implement robust auth and permission checks
- Add flow tests for signup/login/profile/favorites/contact

## Phase 3 — Core user flows
- Search → Results → Details → Favorite/Save
- Contact agent → Lead creation → Agent assignment
- Agent dashboard: lead lifecycle + activity tracking

## Phase 4 — Concierge + automation quality
- AI concierge UX pass (prompting, handoff, edge cases)
- n8n workflows verification (listing pipeline, lead workflows)
- Observability and failure handling

## Phase 5 — Launch readiness
- Performance budget + security checks
- Production env checklist
- Final QA matrix and rollout plan

## 6) What is missing from you (inputs we need)
1. **Final priority order** for business goals (conversion vs speed vs AI wow)
2. **Canonical page list** (what must exist on v1 launch)
3. **Auth truth table** (who can do what exactly)
4. **Design direction pack** (your sketches/references)
5. **MCP access details** (if we need direct DB/automation inspection)

## 7) Collaboration protocol (proposed)
- You provide files/sketches/context in batches.
- I convert each batch into:
  1) decisions
  2) tasks
  3) acceptance criteria
- We keep this file as the live source-of-truth and update per phase.

## 8) Optional skills note (security-first)
Because recent reports show malicious ecosystem packages around skill marketplaces, **we will not install any external skill blindly**. If we evaluate ClawHub skills, we’ll require:
- strong reputation/history,
- clear source/review,
- minimal permissions,
- manual approval before install.

---
Last update: 2026-02-13
