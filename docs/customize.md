# Human Guide: Customize

## Edit Copy And Questions

Start here:

```txt
src/config/funnel.ts
```

Change:

- brand name
- logo URL
- hero headline
- offer bullets
- form title
- questions
- thank-you page

## Add A Form Question

1. Add a question in `src/config/funnel.ts`.
2. If it should become a top-level CRM field, add it to `src/config/crm.ts`.
3. Map it in `src/lib/funnel/normalize.ts`.
4. Update `docs/analytics-events.md` if it should be tracked.

## Change The Design

Edit:

```txt
src/styles.css
```

The current visual language is deliberately distinctive: large editorial typography, dark CTA, soft teal attribution card, and rounded conversion panels.

## AI Prompt: Restyle The Funnel

```txt
Restyle this Sapt funnel template for [BRAND].

Keep all API behavior unchanged. Only edit React components, src/config/funnel.ts, and src/styles.css unless a new form field requires CRM changes.

Design direction:
[PASTE COLORS, REFERENCES, TONE, AUDIENCE]

After editing, run pnpm typecheck and pnpm build.
```
