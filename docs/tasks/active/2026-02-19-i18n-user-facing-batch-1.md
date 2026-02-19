# Task: i18n cleanup for public property flows (batch 1)

Date: 2026-02-19
Status: In progress

## Scope for batch 1

1. Properties filters sidebar (`/properties`):
   - Remove hardcoded user-facing literals from filter labels, chips, tooltips, and aria labels.
   - Route all visible labels through translation keys (`ka/en/ru`).

2. Applied filter chips (`/properties`):
   - Localize chip labels and screen-reader messages.
   - Localize property-type and amenity value labels shown inside chips.

3. Properties map controls (`/properties` map mode):
   - Localize Google Maps missing-key fallback message.
   - Localize map type toggle labels (standard/satellite).

4. Properties grid/card text fallbacks:
   - Localize empty-state and fetch-error messages.
   - Remove remaining hardcoded English fallback literals in card/title/aria text.

## Out of scope

- Deep content localization for mock listing seed data (titles/addresses already mixed-localized).
- Dashboard/private property management flows.
