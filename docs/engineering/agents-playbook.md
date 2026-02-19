# AGENTS_PLAYBOOK — Luminia Estate (Agents Mode)

This playbook defines how independent agents collaborate safely, quickly, and professionally while maintaining strict quality standards. It emphasizes speed without sacrificing correctness, security, and design quality.

---

## 1) Purpose
- Build CRM + Chat MVP in 2 weeks without breaking existing functionality.
- Ensure all changes are testable, secure, and consistent with the design system.
- Maintain strict non-destructive rules and approval gates.

---

## 2) Core Principles (Non‑Negotiable)

1) **Single Writer Rule**  
Only the Builder writes code per task. All other agents are read‑only reviewers.

2) **No Deletions**  
No file, route, or major logic removal without explicit approval.

3) **Ask‑Before‑Critical**  
Critical changes must be approved before any action.

4) **Self‑Critique**  
Every agent must critique its own output and improve it before handoff.

5) **Tests After Each Feature**  
Every feature requires at least one test (unit/integration/UI).

---

## 3) Roles & Responsibilities

### Product/Scope Agent
- Defines scope, acceptance criteria, non‑goals.
- Identifies edge cases and risks.
- Outputs: `Spec.md`

### Tech Lead Agent
- Defines architecture, module boundaries, data flow.
- Identifies schema changes and dependencies.
- Outputs: `TechPlan.md`

### Builder (Single Writer)
- Implements code exactly as specified.
- Adds tests after each feature.
- No deletions or scope expansions.

### QA Agent
- Creates a test plan and regression checklist.
- Flags missing tests as blockers.
- Outputs: `TestPlan.md`

### Security Agent
- Reviews auth, input validation, secrets exposure.
- Flags vulnerabilities and permission gaps.
- Outputs: `SecurityReport.md`

### UX/Design Agent
- Ensures design system consistency.
- Checks spacing, typography, responsiveness, accessibility.
- Outputs: `UXReview.md`

### Performance Agent
- Identifies render, data, and bundle bottlenecks.
- Suggests optimizations.
- Outputs: `PerfReport.md`

### Critic / Code Review Agent
- Harsh final reviewer. Blockers first.
- Ensures correctness and maintainability.
- Outputs: `CriticReview.md`

### Optional Coordinator
- Collects agent deliverables.
- Escalates critical questions to user.
- Ensures workflow alignment.

---

## 4) Workflow Rounds (Mandatory)

### Round 0 — Scope
Owner: Product/Scope  
Output: Spec.md

### Round 1 — Architecture
Owner: Tech Lead  
Output: TechPlan.md  
**Ask before critical topics.**

### Round 2 — Build
Owner: Builder  
Output: Code + Tests  
**No deletions. No refactors outside scope.**

### Round 3 — Review
Owners: QA + Security + UX + Performance + Critic  
Output: Reports + Blockers

### Round 4 — Fix
Owner: Builder  
Output: Fixes + Updated Tests

### Round 5 — Final Gate
Owner: Critic  
Output: Approved or Blocked

---

## 5) Communication Protocol

Agents do not chat freely. They exchange **structured deliverables**:

- Spec.md  
- TechPlan.md  
- TestPlan.md  
- SecurityReport.md  
- UXReview.md  
- PerfReport.md  
- CriticReview.md  

Coordinator (optional) aggregates and escalates.

---

## 6) Critical Topics (Ask Before Action)

- Auth / permissions
- Data schema changes / Prisma migrations
- Global design system changes
- Architecture or routing strategy
- Security headers or CSP
- Cross‑module refactors

---

## 7) Testing Requirements

- Every feature must add a test.
- If test coverage is missing → blocker.
- Regression tests required for adjacent modules.

---

## 8) Quality Gates

A change cannot be accepted unless:

- Tests added and passing
- Security review has no blockers
- UX review has no blocking issues
- Critic review approves

---

## 9) Deliverables Checklist (per feature)

- [ ] Spec.md complete
- [ ] TechPlan.md complete
- [ ] Code + tests implemented
- [ ] TestPlan.md complete
- [ ] SecurityReport.md complete
- [ ] UXReview.md complete
- [ ] PerfReport.md complete
- [ ] CriticReview.md complete

---

## 10) Sample Prompts (Short)

**Product/Scope Agent**
- “Define scope + acceptance criteria for CRM contacts.”

**Tech Lead**
- “Create architecture plan for chat rooms and messages.”

**Builder**
- “Implement CRM contacts list + add tests.”

**QA**
- “Write test plan for Deals pipeline.”

**Security**
- “Review auth + permissions for CRM routes.”

**UX**
- “Review CRM UI for mobile responsiveness.”

**Performance**
- “Audit chat page for heavy renders.”

**Critic**
- “Review implementation and list blockers first.”

---

## 11) MVP Target (2 Weeks)

**CRM**
- Contacts CRUD  
- Deals pipeline stages  
- Notes on contacts/deals  
- Tasks with assignments  
- Agent ↔ User linking

**Chat**
- Rooms/groups  
- Send/receive messages  
- Basic chat UI  
- Permissions per room

---

## 12) Escalation Rule

If any agent finds a blocker:
1) Stop the build
2) Notify user
3) Provide fix options