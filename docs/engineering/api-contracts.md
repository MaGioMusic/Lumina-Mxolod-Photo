# Lumina Estate API Contracts

ყველა endpoint ემსახურება PostgreSQL + Prisma მოდელებს (`prisma/schema.prisma`). ქვემოთ აღწერილია ძირითადი კონტრაქტები, რომლებსაც ფრონტი და ბექენდი იზიარებს.

## ზოგადი წესები
- ყველა თარიღი ISO-8601 სტრინგად (UTC offset-ით) ბრუნდება.
- Decimal მნიშვნელობები იგზავნება სტრინგად (ზუსტი precision-ისთვის).
- Auth header: `Authorization: Bearer <token>`.
- Roles (`UserRole`): `guest`, `client`, `agent`, `investor`, `admin`.

### RBAC ნაკოფლიკტარი
| Endpoint | guest | client | agent | admin |
|----------|-------|--------|-------|-------|
| GET /api/properties | ✅ | ✅ | ✅ | ✅ |
| GET /api/properties/[id] | ✅ | ✅ | ✅ | ✅ |
| POST /api/favorites | ❌ | ✅ | ✅ | ✅ |
| DELETE /api/favorites/[id] | ❌ | ✅ | ✅ | ✅ |
| POST /api/appointments | ❌ | ✅ | ✅ | ✅ |
| POST /api/inquiries | ❌ | ✅ | ✅ | ✅ |
| GET /api/listings | ✅ | ✅ | ✅ | ✅ |
| POST /api/listings | ❌ | ✅ (self) | ✅ | ✅ |
| GET /api/images | ✅ | ✅ | ✅ | ✅ |
| POST /api/images | ❌ | ✅ (own properties) | ✅ | ✅ |

> **შენიშვნა**: `guest` იძახებს მხოლოდ read-only endpoint-ებს. `client` ქმნის inquiries/favorites/appointments საკუთარ სახელზე. `agent` შეუძლია properties/listings/images მართვა, რომლებიც მას ეკუთვნის.

## დეტალური კონტრაქტები

### GET `/api/properties`
- აღწერა: ფასების, ფილტრების და pagination-ით სიის მიღება.
- Query params:
  - `page` (number, default 1)
  - `pageSize` (number, default 24, max 60)
  - `search` (string) — ტექსტური ძებნა
  - `city`, `district` (string)
  - `propertyType` (`PropertyType`)
  - `transactionType` (`TransactionType`)
  - `priceMin`, `priceMax` (number or string)
  - `bedrooms`, `bathrooms` (number)
  - `amenities` (comma-separated strings)
  - `sort` (`createdAt|price|views`, optional prefix `-` დაღმავალი)
- Response 200:
```json
{
  "items": [Property],
  "page": 1,
  "pageSize": 24,
  "total": 120,
  "filters": { /* echo applied filters */ }
}
```
- Types: `Property` → `propertySchema` (`src/types/models.ts`).

### GET `/api/properties/[id]`
- აღწერა: სრული დეტალები, დაკავშირებული სურათებით, listings-ით და analytics snapshot-ით.
- Response 200:
```json
{
  "property": Property,
  "images": [Image],
  "listings": [Listing],
  "agent": Agent | null,
  "analytics": PropertyAnalytics | null
}
```
- Errors: `404` თუ ვერ მოიძებნა.

### POST `/api/favorites`
- აღწერა: ქონების დამატება მომხმარებლის `favorites`-ში.
- Body (`application/json`):
```json
{ "propertyId": "uuid" }
```
- Response 201: `Favorite`.
- Response 409: უკვე დამატებულია.

### DELETE `/api/favorites/[id]`
- აღწერა: ქონების ამოღება favorites-იდან (`id` ან `propertyId` + user context).
- Response 204.

### POST `/api/appointments`
- აღწერა: ნახვის/კონსულტაციის დანიშვნა.
- Body:
```json
{
  "propertyId": "uuid",
  "scheduledDate": "2025-11-05T12:00:00+04:00",
  "type": "viewing",
  "notes": "string",
  "meetingLocation": "string"
}
```
- დანართი: სერვერი ავსებს `clientId`-ს ავტორიზებული მომხმარებლით, `agentId` იღებს property-ის აგენტის მიხედვით.
- Response 201: `Appointment`.
- Response 409: კონფლიქტი (იხ. ინდექსი `idx_appointments_unique_slot`).

### POST `/api/inquiries`
- აღწერა: შეკითხვა აგენტის/ქონების მიმართ.
- Body:
```json
{
  "propertyId": "uuid",
  "message": "string",
  "contactEmail": "string?",
  "contactPhone": "string?"
}
```
- Response 201: `Inquiry`.

### GET `/api/listings`
- აღწერა: ისტორიული listings (paginate by property, optional filters).
- Query params: `propertyId`, `status`, `dateFrom`, `dateTo`, `page`, `pageSize`.
- Response 200:
```json
{
  "items": [Listing],
  "page": 1,
  "pageSize": 20,
  "total": 4
}
```

### POST `/api/listings`
- აღწერა: ქონების ხელახლა განთავსება ახალი პირობებით.
- Body:
```json
{
  "propertyId": "uuid",
  "price": "123456.78",
  "currency": "GEL",
  "status": "active",
  "expiryDate": "2026-01-01T00:00:00+04:00",
  "notes": "string"
}
```
- RBAC: `client` მხოლოდ იმ properties-ზე, სადაც თავადაა seller (app logic), `agent` — საკუთარ listings-ზე, `admin` — ნებისმიერზე.
- Response 201: `Listing`.

### GET `/api/images`
- აღწერა: ქონების სურათების სია (ფორმატისთვის, upload მართვა სხვა სერვისზე).
- Query params: `propertyId` (required).
- Response 200: `[Image]`.

### POST `/api/images`
- აღწერა: მეტამონაცემის რეგისტრაცია უკვე ატვირთული ფაილისთვის (S3/Cloudinary URL).
- Body:
```json
{
  "propertyId": "uuid",
  "url": "https://...",
  "alt": "string?",
  "sortOrder": 10
}
```
- Response 201: `Image`.

### PATCH `/api/images/[id]`
- აღწერა: alt ან sort order-ის განახლება.
- Body: `{ "alt": "string?", "sortOrder": number }`.
- Response 200: `Image`.

### DELETE `/api/images/[id]`
- აღწერა: ჩანაწერის წაშლა (ფიზიკური ფაილის წაშლა media service-ში).
- Response 204.

## საერთო Error ფორმატი
```json
{
  "error": {
    "code": "string",
    "message": "Human readable",
    "details": object | null
  }
}
```
- `401` — ავტორიზაცია არ არის.
- `403` — როლის შეზღუდვა.
- `404` — რესურსი არ მოიძებნა.
- `409` — ბიზნეს კონფლიქტი (appointment slot, favorite duplication, listing overlap).

## Zod კონტრაქტები
- Request bodies: იხ. `src/types/models.ts` შესაბამისი ობიექტები (`favoriteSchema`, `appointmentSchema`, `inquirySchema`, `listingSchema`, `imageSchema`).
- Response payloads: იგივე სქემები; სიის შემთხვევაში `z.object({ items: z.array(schema), page: z.number(), pageSize: z.number(), total: z.number() })` ნიმუში.

---

ამ ფაილს უნდა დაეყრდნოს API implementation (`src/app/api/**`) და ფრონტის data-fetching ფენაც (`src/lib/repo/**`).

