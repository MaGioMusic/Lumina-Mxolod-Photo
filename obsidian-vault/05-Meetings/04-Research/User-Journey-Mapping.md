# User Journey Mapping — Lumina Estate

> Complete user flows and gap analysis
> [[MOC-Completion-Guide|← Back]] | [[Quick-Context|Status]]

## 👤 Persona 1: Property Seeker (Buyer/Renter)

### Journey Stages

#### 1. Discovery 🔍
**Actions:**
- Enters site via Google/search/social
- Sees homepage with featured properties
- Uses search/filter to narrow down

**Current State:**
- ✅ Homepage exists
- ✅ Search with filters
- ✅ Map view
- ✅ Property listings

**Gaps:**
- ❌ No personalized recommendations
- ❌ No saved searches
- ❌ No alerts for new properties

---

#### 2. Exploration 🏠
**Actions:**
- Clicks property card
- Views property details (photos, price, features)
- Checks location on map
- Compares multiple properties

**Current State:**
- ✅ Property detail page
- ✅ Photo gallery
- ✅ Map integration
- ✅ Compare feature (basic)

**Gaps:**
- ❌ No virtual tour
- ❌ No video support
- ❌ No neighborhood info
- ❌ No similar properties

---

#### 3. Engagement 💬
**Actions:**
- Contacts agent
- Schedules viewing
- Requests more info
- Saves to favorites

**Current State:**
- ✅ Contact form (i18n needed)
- ✅ Agent chat (exists?)
- ✅ Favorites (exists?)

**Gaps:**
- ❌ Booking calendar unclear
- ❌ Lead capture form incomplete
- ❌ Auto-response emails missing
- ❌ CRM integration missing

---

#### 4. Transaction 💰
**Actions:**
- Makes offer
- Negotiates price
- Signs agreement
- Pays deposit

**Current State:**
- ❌ No offer system
- ❌ No negotiation flow
- ❌ No document signing
- ❌ No payment integration

**Gaps:**
- 🚨 CRITICAL: Payment system
- 🚨 CRITICAL: Document management
- 🚨 CRITICAL: Booking/deposit system

---

## 👤 Persona 2: Property Owner (Seller/Landlord)

### Journey Stages

#### 1. Onboarding 📝
**Actions:**
- Registers account
- Chooses to list property
- Fills property details

**Current State:**
- ✅ Registration (SignUpModal)
- ✅ Login (LoginModal)
- ⏳ PropertySubmitModal (i18n in progress)

**Gaps:**
- ❌ No agent verification
- ❌ No package/plan selection
- ❌ No onboarding tutorial

---

#### 2. Listing Creation 📸
**Actions:**
- Adds property details
- Uploads photos
- Sets price
- Publishes listing

**Current State:**
- ⏳ PropertySubmitModal (nearly done)
- ✅ Photo upload
- ✅ Basic form validation

**Gaps:**
- ❌ No AI photo enhancement
- ❌ No auto-description generation
- ❌ No pricing suggestions
- ❌ No featured/promoted options

---

#### 3. Management 📊
**Actions:**
- Views inquiries
- Responds to leads
- Updates listing
- Tracks performance

**Current State:**
- ✅ Dashboard exists
- ✅ Agent dashboard
- ❌ Lead management unclear

**Gaps:**
- ❌ No unified inbox
- ❌ No analytics for owner
- ❌ No performance metrics
- ❌ No automatic reposting

---

#### 4. Transaction Completion ✅
**Actions:**
- Accepts offer
- Signs contract
- Receives payment
- Closes listing

**Current State:**
- ❌ No offer management
- ❌ No contract signing
- ❌ No payment processing

**Gaps:**
- 🚨 CRITICAL: Same as Persona 1

---

## 📊 Gap Analysis Summary

### 🔥 Critical Gaps (Block Launch)

| Feature | Persona | Impact |
|---------|---------|--------|
| Payment integration | Both | Cannot complete transaction |
| Lead capture | Both | Cannot get customers |
| Email notifications | Both | No communication |
| Document signing | Both | Legal requirement |
| Booking system | Seeker | Cannot schedule viewings |

### ⚡ High Priority (High Value)

| Feature | Persona | Value |
|---------|---------|-------|
| CRM integration | Owner | Manage leads |
| Auto-responses | Both | Instant engagement |
| Analytics dashboard | Owner | Track performance |
| Mobile app | Both | On-the-go access |

### 📋 Medium Priority (Nice to Have)

| Feature | Persona | Value |
|---------|---------|-------|
| Virtual tours | Seeker | Better experience |
| AI recommendations | Seeker | Personalization |
| Video support | Both | Rich media |
| Social sharing | Both | Viral growth |

---

## 🎯 Next Actions Based on Journeys

### Immediate (This Week)
1. **Complete PropertySubmitModal i18n** — Owner onboarding
2. **Lead capture flow** — Critical for both personas
3. **Email notifications** — Communication gap

### This Month
4. **Payment integration** — Transaction completion
5. **Booking calendar** — Scheduling viewings
6. **CRM dashboard** — Lead management

### Next Quarter
7. **Mobile app/PWA** — Mobile experience
8. **Analytics** — Performance tracking
9. **AI features** — Personalization

---

*Created: 2026-02-20*  
*Based on: User journey mapping session*
