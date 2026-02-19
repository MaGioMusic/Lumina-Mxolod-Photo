# Task: Auth & Lead Flow i18n (Phase 4)

## Scope
Auth components and lead capture forms

## Files to Check
- `src/components/LoginModal.tsx`
- `src/components/PropertySubmitModal.tsx` 
- `src/app/(marketing)/contact/page.tsx`
- Lead inquiry forms

## Target Strings (Expected)
1. Login modal: "Sign In", "Email", "Password", "Forgot password?"
2. Register: "Create account", "Full name", "Phone"
3. Property submit: "Upload Property", "Property details", "Submit"
4. Contact: "Send message", "Your name", "Your email"

## Implementation
- Find all hardcoded strings
- Add to LanguageContext.tsx (ka/en/ru)
- Replace with t() calls
- Build check
- Commit & PR

## DoD
- [ ] All auth strings → i18n keys
- [ ] All lead flow strings → i18n keys
- [ ] Build passes
- [ ] PR created with @cursor review
