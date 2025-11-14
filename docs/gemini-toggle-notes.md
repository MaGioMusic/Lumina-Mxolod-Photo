## Gemini Voice Toggle Audit (2025-11-14)

### 1. Current References

| Area | File(s) | Notes |
| --- | --- | --- |
| Hook implementation | `src/experimental/gemini/useGeminiVoice.ts` | Fetches env vars `NEXT_PUBLIC_GEMINI_LIVE_MODEL`, `NEXT_PUBLIC_GEMINI_PROXY_WS`, `NEXT_PUBLIC_GEMINI_API_KEY`, prompts user for key, manages WebSocket/audio worklet. |
| UI entry point | `src/app/properties/components/AIChatComponent.tsx` | Imports `useGeminiVoice`; uses query param `?gemini=1` to enable; toggles fallback + microphone controls. |
| UI subcomponent | `src/app/properties/components/chatWindow.tsx` | Displays `GeminiVoiceButton`, handles Gemini start/stop buttons, fallback label, and `AIVoiceInput` gating logic. |
| Gemini UI control | `src/app/properties/components/GeminiVoiceButton.tsx` | Standalone button that can talk to Gemini (text mode); stores API key in sessionStorage. |
| Dev proxy | `live-proxy.js` | Uses `GEMINI_LIVE_PROXY_PORT`, `GEMINI_LIVE_MODEL`, `GEMINI_API_KEY`. |
| Experimental backups | `backup/experimental-20251022/**` | Historical copies of Gemini voice/generation routes. Not loaded in production but worth keeping in mind when reorganizing. |

### 2. Proposed Flag Strategy

- **Single build-time flag**: `NEXT_PUBLIC_ENABLE_GEMINI`  
  - `false` (default) → entire Gemini bundle is tree-shaken out; `AIChatComponent` skips lazy import and runs OpenAI-only.  
  - `true` → client dynamically imports the Gemini module (hook + UI) and exposes the toggle in dev environments.
- **Optional runtime override**: keep `?gemini=1` query param for engineers, but guard it behind the build flag (even if query is set, nothing loads when the flag is false).
- **Environment clean-up**: retain the following env vars only inside the experimental module, so production `.env` needs just `NEXT_PUBLIC_ENABLE_GEMINI=false`:
  - `NEXT_PUBLIC_GEMINI_LIVE_MODEL`
  - `NEXT_PUBLIC_GEMINI_PROXY_WS`
  - `NEXT_PUBLIC_GEMINI_API_KEY`
  - `GEMINI_LIVE_PROXY_PORT`, `GEMINI_API_KEY` (for `live-proxy.js`, optional during dev).

### 3. Next Actions

1. Move the hook + button into `src/experimental/gemini/` and re-export from there.
2. Update `AIChatComponent` to check `process.env.NEXT_PUBLIC_ENABLE_GEMINI === '1'` (or similar) before even attempting to import the module.
3. Provide a tiny “Gemini disabled” stub so types remain satisfied when the flag is off.
4. Document the flag usage in `docs/ai-chat-hook-audit.md` and `.env.example` after code changes.


