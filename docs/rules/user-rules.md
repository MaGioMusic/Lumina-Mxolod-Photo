# USER RULES (Global Settings)
*Apply to all projects - Copy this to Cursor Settings → User Rules*

## Development Workflow Standards:
```
1. Always use TypeScript strict mode for type safety
2. Prefer functional components with React hooks over class components
3. Use Tailwind CSS exclusively for styling (no inline styles or CSS modules)
4. Implement comprehensive error boundaries for all components
5. Follow Next.js App Router conventions strictly
6. Use proper TypeScript interfaces for all props and data structures
```

## UI/UX Best Practices:
```
1. Implement mobile-first responsive design approach
2. Add loading states for all asynchronous operations
3. Use Framer Motion for smooth page transitions and animations
4. Include ARIA labels and accessibility attributes for screen readers
5. Optimize all images using Next.js Image component with proper sizing
6. Ensure color contrast ratios meet WCAG 2.1 AA standards
```

## Security & Performance Standards:
```
1. Sanitize all user inputs with DOMPurify to prevent XSS attacks
2. Use Zod schemas for runtime data validation and type checking
3. Implement Content Security Policy (CSP) headers
4. Use React.memo for expensive components to prevent unnecessary re-renders
5. Implement lazy loading for components and images when appropriate
6. Tree-shake unused code and optimize bundle size
```

## Code Quality Standards:
```
1. Use descriptive variable and function names (avoid abbreviations)
2. Keep functions under 50 lines and components under 200 lines
3. Extract complex logic into custom hooks
4. Use proper error handling with try-catch blocks
5. Add JSDoc comments for complex functions and interfaces
6. Follow consistent import ordering: React → Third-party → Local imports
```

## Automated Quality Assurance:
```
After every significant code change, automatically execute:

1. SECURITY SCAN (Semgrep MCP)
   - Check: XSS vulnerabilities, SQL injection, CSRF protection
   - Validate: Input sanitization, authentication flows
   - Report: Security score with specific fix recommendations

2. DOCUMENTATION COMPLIANCE (Context7 MCP)  
   - Check: Code documentation completeness
   - Validate: TypeScript types accuracy, JSDoc comments
   - Report: Documentation coverage and quality metrics

3. DESIGN SYSTEM COMPLIANCE (Motiff MCP)
   - Check: Component adherence to design system
   - Validate: Spacing, typography, color palette consistency  
   - Report: Design compliance score with visual diff

4. BEST PRACTICES RESEARCH (Brave Search MCP)
   - Check: Latest React/Next.js best practices
   - Validate: Performance optimization techniques
   - Report: Industry standard compliance recommendations
```

## Quality Gates & Scoring:
```
MINIMUM THRESHOLDS:
- Security Score: ≥ 90/100 (Required for deployment)
- Design Compliance: ≥ 85/100 (Required for review)
- Documentation: ≥ 80/100 (Required for team handoff)
- Performance: ≥ 90/100 (Required for production)

AUTOMATED ACTIONS:
- Score < Threshold → Block deployment + Generate fix suggestions
- Score ≥ Threshold → Approve + Generate improvement recommendations
- Critical Issues → Immediate notification + Auto-rollback option
```

