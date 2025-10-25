# Security Guidelines

- Do NOT commit secrets in `.env*`. Use `.env.example` + GitHub Secrets.
- Keep `main` protected (require PR + review, optional status checks).
- Prefer HTTPS with PAT/credential manager; restrict token scopes to least privilege.
- Review third-party dependencies periodically; run `npm audit` and code scans.
- Sanitize inputs (DOMPurify), validate with Zod, enforce CSP headers.
