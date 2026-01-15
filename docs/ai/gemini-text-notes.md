# Gemini Text (Vertex AI) — Setup Notes

ეს დოკუმენტი აღწერს **ტექსტური Gemini პასუხების** კონფიგურაციას Lumina-ში.

## 1) რას იყენებს ეს ნაწილი?
- UI: `src/app/(marketing)/properties/components/AIChatComponent.tsx`
- API route: `POST /api/gemini-text` → `src/app/api/gemini-text/route.ts`
- Vertex endpoint: `...:generateContent` (სტანდარტული ტექსტური API)

## 2) მნიშვნელოვანი განსხვავება Voice (Live) vs Text
- **Voice (Live API)** იყენებს `GEMINI_LIVE_MODEL=gemini-live-*` ტიპის მოდელებს (Realtime).
- **Text (generateContent API)** **ვერ** იყენებს `gemini-live-*` მოდელებს.
  - ტექსტისთვის საჭიროა ცალკე მოდელი, მაგ: `gemini-2.0-flash` ან `gemini-1.5-flash`.

ამიტომ გვაქვს ცალკე env:
- `GEMINI_LIVE_MODEL` — მხოლოდ voice/realtime
- `GEMINI_TEXT_MODEL` — მხოლოდ text/generateContent

## 3) აუცილებელი ENV ცვლადები
`.env.local`-ში (Dev) ან Production Secrets-ში:

### Vertex/GCP
- `GCP_PROJECT_ID` — შენი Google Cloud Project ID
- `GCP_REGION` — default: `us-central1`
- `GOOGLE_APPLICATION_CREDENTIALS` — service account JSON-ის სრული path (local dev-ში)

### Model selection
- `GEMINI_LIVE_MODEL=gemini-live-2.5-flash-native-audio` (voice)
- `GEMINI_TEXT_MODEL=gemini-2.0-flash` (text)

## 4) Access / Security (dev vs prod)
`/api/gemini-text` იყენებს `ensureRealtimeAccess` (იგივე guard, რაც `/api/vertex-token`).

- **Development**: default-ად მუშაობს dev fallback-ით (სატესტოდ მარტივად).
- **Production**: საჭიროა
  - `LUMINA_REALTIME_PRESHARED_SECRET` env
  - და request header: `x-lumina-internal-secret: <secret>`

## 5) სწრაფი ტესტი
Dev-ში (browser-იდან UI-ით):
1) `npm run dev`
2) გახსენი `/properties`
3) ჩატში დაწერე ტექსტი და “Send”
4) Network-ში უნდა ნახო: `POST /api/gemini-text` → `200`

თუ მიიღე `502` და `... is not supported in the generateContent API`, ნიშნავს რომ `GEMINI_TEXT_MODEL` შემთხვევით Live მოდელზეა დაყენებული.

