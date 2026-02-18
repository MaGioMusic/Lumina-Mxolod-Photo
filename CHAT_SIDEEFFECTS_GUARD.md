# CHAT_SIDEEFFECTS_GUARD

This document defines what chat/tool side-effects are allowed to mutate `/properties` UI state.

## Gate contract

- **Primary gate:** `NEXT_PUBLIC_AI_TOOL_SIDEEFFECTS=1`
  - `1` => chat/tool side-effects may mutate `/properties` state.
  - anything else => side-effects are blocked.
- **Debug hook (safe, off by default):** `NEXT_PUBLIC_CHAT_SIDEEFFECTS_DEBUG=1`
  - Emits sanitized allow/block traces to the browser console.
  - Redacts sensitive keys (`token`, `secret`, `password`, `authorization`, `cookie`, `email`, `phone`).

## Side-effect matrix

| Source | Side-effect | Mutates `/properties` state | Allowed when gate=1 | Blocked when gate!=1 |
| --- | --- | --- | --- | --- |
| `usePropertySearch.search_properties` | Navigate to `/properties` with query params | Yes (URL + listing context) | Yes | Yes |
| `usePropertySearch.set_filters` | Dispatch `lumina:filters:set` | Yes (filters) | Yes | Yes |
| `usePropertySearch.set_filters` | Navigate to `/properties` | Yes (URL + listing context) | Yes | Yes |
| `usePropertySearch.set_view` | Dispatch `lumina:view:set` | Yes (grid/map view) | Yes | Yes |
| `usePropertySearch.set_view` | Navigate to `/properties` | Yes (route/view context) | Yes | Yes |
| `usePropertySearch.open_page` | Navigate/open tab | Yes (route) | Yes | Yes |
| `usePropertySearch.navigate_to_property` | Navigate to details page | Yes (route/details) | Yes | Yes |
| `usePropertySearch.open_first_property` | Navigate to selected result | Yes (route/details) | Yes | Yes |
| `usePropertySearch.open_nth_result` | Navigate to selected result | Yes (route/details) | Yes | Yes |
| `usePropertySearch.open_property_detail` | Navigate to details page | Yes (route/details) | Yes | Yes |
| `usePropertySearch.get_nearby_places` | Dispatch `lumina:places:result` | Yes (map markers/focus) | Yes | Yes |
| `AIChatComponent` nearby fallback | Dispatch `lumina:places:result` | Yes (map markers/focus) | Yes | Yes |
| `AIChatComponent` keyword fallback nav (`NEXT_PUBLIC_AI_FALLBACK_NAV=1`) | `router.push('/properties')` | Yes (route) | Yes (and fallback flag on) | Yes |
| `ProSidebarPropertiesPage` URL AI bootstrap | Apply URL filters into React state | Yes (filters/search) | Yes (one-shot per signature) | Yes |
| `PropertiesGrid` listener | Consume `lumina:filters:set` | Yes (injected filters) | Yes | Yes (listener not attached) |
| `PropertiesGoogleMap` listener | Consume `lumina:places:result` | Yes (AI places overlay) | Yes | Yes (listener not attached) |

## Allowed flows

1. Explicit user interactions (header toggle, sidebar filter changes, pagination, map clicks) are always allowed.
2. Chat/tool mutations are allowed only when `NEXT_PUBLIC_AI_TOOL_SIDEEFFECTS=1`.
3. URL-to-filter hydration for AI-driven params is applied once per unique param signature to avoid repeated overrides.

## Blocked flows

1. Tool-driven navigation/event dispatch when `NEXT_PUBLIC_AI_TOOL_SIDEEFFECTS!=1`.
2. Nearby places event injection from chat fallback when gate is off.
3. AI-driven view override events when gate is off (`lumina:view:set` listener disabled).
4. Stale filter query params are stripped when gate is off, preventing filter resurrection.

