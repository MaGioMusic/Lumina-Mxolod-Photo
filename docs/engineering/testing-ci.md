# Lumina Estate — ტესტები და CI პაიფლაინი

ამ დოკუმენტი აღწერს როგორ უნდა დავფაროთ ტესტები (unit → integration → E2E) და რა უნდა მუშაობდეს CI-ში თითო Pull Request-ზე.

## 1. სექციის სტრუქტურა

- **Unit Tests** – სუფთა utility-ები (`src/lib/**`), Hook-ები (`src/hooks/**`)
  - Framework: Vitest + Testing Library React Hooks
  - Command: `npm run test:unit`
- **Integration Tests** – Next.js API Route ჰენდლერები (`src/app/api/**`) Prisma-ს against in-memory PostgreSQL (Supabase Test DB ან Docker Postgres)
  - Framework: Vitest (node env) / Supertest
  - Command: `npm run test:integration`
- **E2E/Acceptance Tests** – კრიტიკული ფლოუები (ძიება → ქონების ნახვა → favorite → inquiry → appointment)
  - Framework: Playwright
  - Command: `npm run test:e2e`

> **შენიშვნა:** Unit/Integration სექციებისთვის აუცილებელია `DATABASE_URL_TEST` გარემოს ცვლადი. Playwright იყენებს seed მონაცემებს (`prisma/seed.ts`).

## 2. npm Scripts

`package.json`-ში დავამატეთ სკრიპტი `ci:verify`, რომელიც lint-ს და ERD აუდიტს ერთიანად ამოწმებს:

```json
{
  "scripts": {
    "ci:verify": "npm run lint && npm run erd:check"
  }
}
```

სამომავლოდ დამატდება:

```json
{
  "scripts": {
    "test:unit": "vitest run --config vitest.unit.config.ts",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test"
  }
}
```

## 3. GitHub Actions პაიფლაინი

| ნაბიჯი | აღწერა |
|--------|--------|
| `lint` | `npm run lint` – ESLint + TypeScript checks |
| `erd`  | `npm run erd:check` – ERD აუდიტი/SQL რეკომენდაციები |
| `unit` | `npm run test:unit` |
| `integration` | `npm run test:integration` (Postgres service) |
| `playwright` | `npm run test:e2e` (headed=false) |

Workflow skeleton (`.github/workflows/ci.yml`):

```yaml
name: CI

on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: lumina_test
          POSTGRES_USER: lumina
          POSTGRES_PASSWORD: password
        ports: ['5432:5432']
        options: >-
          --health-cmd "pg_isready -U lumina" --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run ci:verify
      - run: npx prisma migrate deploy
      - run: npm run test:unit
      - run: npm run test:integration
      - uses: microsoft/playwright-github-action@v1
      - run: npm run test:e2e
```

## 4. Seed და Fixtures

- `prisma/seed.ts` – random მაგრამ deterministic მონაცემები properties/listings/favorites.
- Playwright tests load fixtures (`tests/e2e/fixtures/**`).
- Integration tests იყენებს transactional reset-ს (`experimental_prisma_transaction()` ან `testcontainers-postgres`).

## 5. რეპორტინგი

- Coverage: `npm run test:unit -- --coverage` – მიზანი ≥80% utilities/hooks-ზე.
- Playwright artefacts (`playwright-report/`, `test-results/`) იტვირთება workflow artefacts-ად.
- `ERD_AUDIT.md` ცალკე artefact-ად ინახება ყოველი CI გასვლისას (auditing progress-trail).

---

ეს კონვენცია უზრუნველყოფს, რომ თითო ცვლილება პროდაქშენამდე გადის lint → audit → tests → e2e სრულ მარშრუტს.

