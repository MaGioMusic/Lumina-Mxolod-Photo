# Integrations & API Calls

Format: Feature → UI location → API/service → input → output → storage → permissions → error handling.

## Google Maps (JS + Places + Geocoding)

- Feature: Property map rendering + POI lookup for nearby metro/schools/markets.
- UI location:
  - Map + markers: `src/app/(marketing)/properties/components/PropertiesGoogleMap.tsx`
  - Map container + bounds: `src/app/(marketing)/properties/components/PropertyDetailsMap.tsx`
  - Single property map: `src/app/(marketing)/properties/components/SinglePropertyGoogleMap.tsx`
  - Location picker UI: `src/app/(marketing)/properties/components/LocationPicker.tsx`
  - API loader: `src/lib/googleMaps.ts`
- API/service:
  - Google Maps JavaScript API via `@googlemaps/js-api-loader` (`src/lib/googleMaps.ts`)
  - Google Geocoding API + Places Nearby Search (`src/app/api/places/route.ts`)
- Input:
  - Client: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAP_ID` (`src/app/(marketing)/properties/components/PropertiesGoogleMap.tsx`)
  - Server: `GOOGLE_MAPS_API_KEY` or `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (`src/app/api/places/route.ts`)
  - Request body: `{ address, radius_m, types }` (`src/app/api/places/route.ts`)
- Output:
  - Map tiles + markers; `categories[]` results with `name`, `location`, `distance_m`, `rating` (`src/app/api/places/route.ts`)
- Storage: none (in-memory only).
- Permissions: no auth on `/api/places` (public route).
- Error handling:
  - `missing_api_key`, `missing_address`, `missing_radius`, `geocode_failed`, `server_error` (`src/app/api/places/route.ts`)
  - Loader warns if key missing in dev (`src/lib/googleMaps.ts`)

## AI Nearby Places (client tool → API)

- Feature: AI tool calls that fetch nearby POIs and push results to map.
- UI location: `src/app/(marketing)/properties/components/AIChatComponent.tsx`
- API/service: `/api/places` (Google Places/Geocoding)
- Input: tool args `{ address, radius_m, types }` (`src/hooks/ai/usePropertySearch.ts`)
- Output: `lumina:places:result` event consumed by map renderer (`src/app/(marketing)/properties/components/PropertiesGoogleMap.tsx`)
- Storage: none.
- Permissions: none; tool runs client-side.
- Error handling:
  - Returns `{ ok: false, error }` on missing data or request failure (`src/hooks/ai/usePropertySearch.ts`)

## Vertex AI (Gemini Text)

- Feature: Server-side text generation via Vertex `generateContent`.
- UI location: unknown (no `/api/gemini-text` caller found in `src/`).
- API/service: Google Vertex AI `generateContent` (`src/app/api/gemini-text/route.ts`)
- Input:
  - Env: `GCP_PROJECT_ID`, `GCP_REGION`, `GEMINI_TEXT_MODEL` / `GEMINI_MODEL`
  - Body: `{ text }`
- Output: `{ text }` response.
- Storage: none.
- Permissions: guarded by `ensureRealtimeAccess` + rate limit (`src/app/api/gemini-text/route.ts`).
- Error handling: `CONFIG_MISSING`, `BAD_REQUEST`, `VERTEX_ERROR`, `EMPTY_RESPONSE`, `GEMINI_TEXT_FAILED`.

## Vertex AI (Gemini Live token)

- Feature: Mint short‑lived token for Gemini Live WebSocket sessions.
- UI location: `src/hooks/ai/useGeminiLiveSession.ts` (via `getVertexToken`)
- API/service: `/api/vertex-token` (`src/app/api/vertex-token/route.ts`)
- Input:
  - Env: `GCP_PROJECT_ID`, `GCP_REGION`, `GEMINI_LIVE_MODEL`
  - Request: `GET` (no body)
- Output: `{ accessToken, expiresAt, projectId, region, model }`
- Storage: in‑memory cache on server (`cachedToken`, `mintInFlight`).
- Permissions: guarded by `ensureRealtimeAccess` + rate limit.
- Error handling: `CONFIG_MISSING`, `TOKEN_ISSUE_FAILED` (`src/app/api/vertex-token/route.ts`).

## OpenAI Realtime (Voice)

- Feature: Realtime voice session (WebRTC).
- UI location: `src/hooks/ai/useRealtimeVoiceSession.ts`
- API/service:
  - `/api/realtime/token` (session creation) (`src/app/api/realtime/token/route.ts`)
  - `/api/realtime/sdp` (SDP proxy) (`src/app/api/realtime/sdp/route.ts`)
  - Upstream: `https://api.openai.com/v1/realtime/sessions` + `/v1/realtime` SDP exchange
- Input:
  - Env: `OPENAI_API_KEY`, `VOICE_MODEL`, `VOICE_TTS_VOICE`, `VOICE_TEMPERATURE`, `VOICE_TOOL_CHOICE`, `VOICE_TRANSCRIPTION_LANG`, `VOICE_TRANSCRIPTION_MODEL`, `VOICE_VAD_*`, `VOICE_SYSTEM_INSTRUCTIONS`, `VOICE_STRICT_GUARDRAIL`, `DEFAULT_VOICE_LANG`
  - Query params: `lang`, `model`, `prompt`, `version` (`src/app/api/realtime/token/route.ts`)
  - Headers: `x-model`, `x-ephemeral-token` (`src/app/api/realtime/sdp/route.ts`)
- Output:
  - Token JSON to client; SDP answer for WebRTC
- Storage: none (ephemeral tokens).
- Permissions: guarded by `ensureRealtimeAccess` + rate limit.
- Error handling: detailed JSON errors with dev‑only diagnostics in token + SDP proxy routes.

## Supabase (AI chat history)

- Feature: AI chat history persistence and summary.
- UI location: `src/app/(marketing)/properties/components/AIChatComponent.tsx`
- API/service: `/api/chat/history`, `/api/chat/message` (`src/app/api/chat/*`)
- Input:
  - Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CHAT_RETENTION_DAYS`
  - Cookies: `lumina_ai_visitor_id`, `lumina_ai_conversation_id`
- Output: conversation summary + messages or message insert metadata.
- Storage: Supabase tables `ai_conversations`, `ai_messages` (inferred from queries).
- Permissions: no explicit auth; visitor isolation via cookies; server‑side admin key.
- Error handling: `SUPABASE_NOT_CONFIGURED`, `DB_WRITE_FAILED`, `DB_READ_FAILED`, `FORBIDDEN`.

## Prisma/Postgres (core data)

- Feature: Listings, images, favorites, inquiries, appointments, properties.
- UI location: various API routes under `src/app/api/*`:
  - `/api/listings` (`src/app/api/listings/route.ts`)
  - `/api/images` + `/api/images/[id]`
  - `/api/favorites` + `/api/favorites/[id]`
  - `/api/appointments`
  - `/api/inquiries`
  - `/api/properties/[id]` (uses repo + mock fallback)
- API/service: Prisma ORM on PostgreSQL (`src/lib/prisma.ts`, `prisma/schema.prisma`)
- Input: `DATABASE_URL`, `DIRECT_URL` (from `prisma/schema.prisma`)
- Output: JSON responses from API routes.
- Storage: Postgres tables defined in `prisma/schema.prisma` (exact tables depend on repo implementation).
- Permissions: `requireUser` in API routes enforces roles; `resolveActorContext` for agent/admin actions.
- Error handling: shared `errorResponse` wrapper (`src/app/api/utils.ts`).

## Profile API (optional external)

- Feature: User profile data fetch.
- UI location: `/profile` page (`src/app/(dashboard)/profile/page.tsx`)
- API/service: `NEXT_PUBLIC_PROFILE_API_URL` (external, unknown service).
- Input: `NEXT_PUBLIC_PROFILE_API_URL`, `NEXT_PUBLIC_SITE_URL`, `locale` query param.
- Output: `UserProfile` JSON; falls back to mock if unavailable.
- Storage: none (in‑memory).
- Permissions: unknown (external).
- Error handling: logs warnings and falls back to mock (`src/lib/profile.ts`).

## MCP Mock API

- Feature: Mock tools for property search, mortgage calc, market insights.
- UI location: MCP client (`src/lib/mcpClient.ts`) and `/api/mcp` mock handler.
- API/service: `/api/mcp` (mock, no external service).
- Input: `{ tool, params }` (`src/app/api/mcp/route.ts`)
- Output: mock results for tools.
- Storage: none (in-memory mock data).
- Permissions: none.
- Error handling: 400 on unknown tool; 500 on exceptions.

## Dicebear Avatars

- Feature: Agent avatar generation.
- UI location: `src/app/(dashboard)/agents/page.tsx`
- API/service: `https://api.dicebear.com/9.x/initials/svg`
- Input: `name` (query string `seed=...`).
- Output: SVG avatar.
- Storage: none.
- Permissions: public.
- Error handling: none (client-side fallback not implemented).
