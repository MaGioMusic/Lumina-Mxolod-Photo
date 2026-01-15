# PROJECT RULES (Lumina Estate Specific)
*Apply only to this project - Copy this to Cursor Settings → Project Rules*

## Architecture & File Structure:
```
1. Component naming: PascalCase (e.g., PropertyCard, AgentDashboard)
2. File naming: camelCase with descriptive names (e.g., propertyCard.tsx)
3. Folder naming: lowercase with hyphens (e.g., property-details)
4. Function naming: camelCase describing the action (e.g., fetchProperties)
5. Constants: UPPER_SNAKE_CASE (e.g., MAX_PROPERTY_IMAGES)

Directory Structure:
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components  
├── contexts/         # React Context providers (use sparingly)
├── lib/             # Utility functions and configurations
├── hooks/           # Custom React hooks
└── types/           # TypeScript type definitions
```

## Technology Stack Guidelines:
```
1. Framework: Next.js 15.3.4 with App Router exclusively
2. Styling: Tailwind CSS v4 with custom configuration
3. Animations: Framer Motion (primary) + GSAP (complex animations)
4. Icons: Phosphor Icons (primary), React Icons (supplementary), Lucide (minimal)
5. Maps: Google Maps API (primary), Leaflet (fallback)
6. Forms: React Hook Form with Zod validation
7. State Management: React Context (global) + useState/useReducer (local)
```

## Component Development Standards:
```
1. Create TypeScript interfaces for all component props
2. Use default exports for pages, named exports for components
3. Implement proper loading states with skeleton screens
4. Add error boundaries around potentially failing components  
5. Use React.Suspense for lazy-loaded components
6. Implement proper cleanup in useEffect hooks
```

## Lumina Estate Specific Features:
```
1. Multi-language support: Georgian (primary) + English (secondary) + Russian (tertiary)
2. Theme support: Light mode (default) + Dark mode (coming soon)
3. Real estate specific: Property listings, agent profiles, investor dashboard
4. AI Integration: Chat functionality, property recommendations
5. Map Integration: Interactive property locations with Google Maps
6. Responsive Design: Desktop, tablet, mobile optimization
```

## Design System Standards:
```
Color Palette:
- Primary: Lumina Gold (#D4AF37, #B8860B)
- Secondary: Deep Blue (#1E3A8A, #3B82F6)  
- Neutral: Gray Scale (#F8FAFC to #0F172A)
- Success: Green (#10B981, #059669)
- Warning: Amber (#F59E0B, #D97706)
- Error: Red (#EF4444, #DC2626)

Typography:
- Font Family: Inter (primary), Georgia (serif fallback)
- Language Support: Latin, Georgian, Cyrillic (Russian)
- Font Loading: Preload fonts with language-specific subsets

Spacing System:
- Base Unit: 4px (0.25rem)
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px
```

## Responsive Design Standards:
```
Breakpoints:
- Mobile: 320px - 768px (primary focus)
- Tablet: 768px - 1024px (secondary)
- Desktop: 1024px+ (tertiary)

Design Philosophy: Mobile-first with progressive enhancement
Component Responsiveness:
- All components must work perfectly on mobile first
- Use Tailwind responsive prefixes: sm:, md:, lg:, xl:
- Test on actual devices, not just browser dev tools
- Implement touch-friendly interfaces (44px minimum touch targets)
```

## Multilingual Support:
```
Implementation Strategy:
1. Use next-intl for internationalization
2. Support languages: Georgian (ka), English (en), Russian (ru)
3. Currency formatting for Georgian Lari (GEL), USD, EUR, RUB
4. SEO-friendly URLs with language prefixes (/ka/, /en/, /ru/)
5. Fallback hierarchy: Georgian → English → Russian

Language-Specific Features:
Georgian (ka): Primary interface, GEL currency, Georgian terminology
English (en): International audience, USD/EUR, global terminology  
Russian (ru): CIS market expansion, RUB currency, regional terms
```

## Performance & Testing:
```
Bundle Optimization:
- Dynamic imports for route-based code splitting
- React.lazy() for component-level code splitting  
- Next.js Image component for automatic optimization
- Tree-shake unused dependencies and code

Testing Requirements:
- Unit Tests: Custom hooks, utility functions (Jest)
- Component Tests: User interactions (React Testing Library)
- E2E Tests: Critical user journeys (Playwright)
- Coverage: Components ≥80%, Hooks ≥95%, Utils ≥100%
```

## Security Implementation:
```
Input Validation:
- All user inputs validated with Zod schemas
- DOMPurify sanitization for rich text content
- File upload restrictions and validation
- XSS protection headers configured

Authentication & Authorization:
- Secure session management
- JWT token expiration handling
- Role-based access control (RBAC)
- Password strength requirements
```

