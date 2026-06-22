# Human-Labeled AI Editing Guide

This file is intentionally written for humans and AI agents.

## Human Intent

This repo should stay easy to fork, deploy, and prompt into a custom funnel. Do not turn it into a complex SaaS app unless the user asks for that.

## Non-Negotiables

- Keep Cloudflare Workers as the deployment target.
- Keep the app usable with only `SAPT_API_KEY` and `SAPT_PROJECT_ID`.
- Do not add a database unless the user explicitly asks.
- Do not expose `SAPT_API_KEY` to client code.
- Keep Sapt CRM as the source of truth.
- Keep setup idempotent.
- Keep docs human-readable.

## Best Files To Edit

- Copy and funnel structure: `src/config/funnel.ts`
- CRM fields: `src/config/crm.ts`
- Lead payload mapping: `src/lib/funnel/normalize.ts`
- Custom analytics events: `src/config/analytics.ts`
- Visual design: `src/styles.css`
- API behavior: `src/worker/routes/*`

## AI Prompt: Add A New Funnel Field

```txt
Add a new funnel field called [FIELD].

Requirements:
- Add it to the form in src/config/funnel.ts.
- Add a Sapt CRM schema field in src/config/crm.ts if it should be queryable.
- Map it in src/lib/funnel/normalize.ts.
- Include it in memory output if useful.
- Keep existing analytics, setup, and lead submission working.
- Run pnpm typecheck and pnpm build.
```

## AI Prompt: Add A Post-Submit Integration Step

```txt
Add an optional post-submit integration step using /api/connect-session.

Provider: [meta/google/etc]

Requirements:
- Do not block lead creation if the integration step is skipped.
- Track custom events for started, skipped, completed, and failed states.
- Keep provider config in src/config/integrations.ts.
- Do not hard-code provider-specific UI inside generic form components.
```

## AI Prompt: Production Hardening

```txt
Harden this Cloudflare Sapt funnel for production.

Add:
- Cloudflare Turnstile validation.
- Better spam handling.
- Clear error messages.
- Tests for /api/lead and /api/setup.

Do not add a database. Keep Sapt as the source of truth.
```
