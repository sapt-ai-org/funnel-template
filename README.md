# Sapt Funnel Template

Cloudflare-first funnel template that works with only a Sapt project ID and API key.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sapt-ai-org/funnel-template)

## Human Summary

This repo gives you a working funnel that:

- Serves a polished landing page and lead form from Cloudflare Workers.
- Creates leads in Sapt CRM as `funnel_lead` records.
- Links leads to the Sapt Person spine by email/phone.
- Writes a Sapt memory entry with qualitative context.
- Loads Sapt analytics tracking automatically.
- Tracks custom funnel events.
- Requires no database, no KV, and no backend service besides Sapt.

## What You Need

1. A Sapt account.
2. A Sapt project ID.
3. A Sapt API key with write access to that project.

## Deploy

Click the Cloudflare deploy button, then enter these bindings:

```txt
SAPT_API_KEY=sapt_...
SAPT_PROJECT_ID=your-project-id
```

Cloudflare uses the defaults in `wrangler.jsonc`:

```txt
SAPT_ENDPOINT=https://api.sapt.ai
SAPT_INGEST_SCRIPT_URL=https://ingest.sapt.ai/v1/track.js
```

After deploy, open the site and click **Run setup** in the bottom-right setup banner. That creates or updates the `funnel_lead` CRM object type in Sapt.

## Local Development

```bash
pnpm install
cp .dev.vars.example .dev.vars
pnpm build
pnpm dev
```

Then open the local Worker URL from Wrangler.

Useful commands:

```bash
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm check
pnpm production:test
pnpm smoke:test
pnpm deploy
```

## Production Test

Run the full local production validation before deploying:

```bash
pnpm production:test
```

This runs typecheck, lint, tests, a production Vite build, and a Wrangler deploy dry-run.

If you want to test against real Sapt before deploying:

1. Copy `.dev.vars.example` to `.dev.vars`.
2. Add a real `SAPT_API_KEY` and `SAPT_PROJECT_ID`.
3. Run `pnpm build`.
4. Run `pnpm dev`.
5. Open the local Wrangler URL.
6. Click **Run setup**.
7. Submit a test lead.
8. Confirm the CRM record and memory entry exist in Sapt.

You can also run the automated smoke test against a local or deployed URL:

```bash
FUNNEL_TEST_BASE_URL=http://localhost:8787 pnpm smoke:test
```

For a deployed Worker:

```bash
FUNNEL_TEST_BASE_URL=https://your-worker.example.workers.dev pnpm smoke:test
```

The smoke test creates a real test lead in Sapt with an `@example.com` email so you can verify CRM, memory, and setup behavior end-to-end.

## Human Customization Map

Most edits happen in four files:

- `src/config/funnel.ts`: copy, offer, form questions, thank-you page.
- `src/config/crm.ts`: CRM fields written to Sapt.
- `src/config/analytics.ts`: custom analytics event names.
- `src/styles.css`: visual design.

## AI Prompt: Customize This Funnel

Use this with Claude, ChatGPT, Cursor, or OpenCode:

```txt
You are editing a Cloudflare + React Sapt funnel template.

Goal: customize the funnel for [BUSINESS NAME].

Rules:
- Keep Sapt integration intact.
- Keep required env vars as SAPT_API_KEY and SAPT_PROJECT_ID.
- Edit copy and questions in src/config/funnel.ts.
- If adding form fields, update src/config/crm.ts and src/lib/funnel/normalize.ts.
- Track important user actions with src/config/analytics.ts events.
- Do not expose SAPT_API_KEY to browser code.
- Run pnpm typecheck and pnpm build after changes.

Business details:
[PASTE BUSINESS, OFFER, AUDIENCE, CTA, FORM FIELDS, STYLE REFERENCES]
```

## Architecture

```txt
Cloudflare Worker
├── /api/public/config       Browser runtime config and funnel copy
├── /api/health              Checks Sapt API key and project config
├── /api/setup               Creates/updates Sapt CRM object type
├── /api/lead                Creates CRM record + memory entry
└── /api/connect-session     Optional OAuth integration connect-session helper

Browser
├── Loads Sapt track.js
├── Tracks custom funnel events
├── Calls window.sapt.identify before submit
└── Sends visitorId to /api/lead for attribution stitching
```

## Sapt Writes

On form submission, `/api/lead` writes:

1. A `funnel_lead` CRM object record.
2. A Sapt memory entry at `funnels/leads/{recordId}`.

The CRM record includes:

- `name`
- `email`
- `phone`
- `company`
- `offer`
- `message`
- `visitorId`
- `landingPage`
- `referrer`
- UTM fields
- custom answers

## Analytics Events

Default custom events:

- `funnel_viewed`
- `funnel_cta_clicked`
- `funnel_form_started`
- `funnel_lead_submitted`
- `funnel_lead_created`
- `funnel_conversion_completed`

## Security Notes

- `SAPT_API_KEY` is only used in Worker code.
- Browser code only receives `SAPT_PROJECT_ID` and the public ingest script URL.
- The form includes a honeypot field.
- For high-volume public traffic, add Turnstile and Sapt moderation config.

## Next Best Improvements

- Add Cloudflare Turnstile.
- Add optional Meta/Google connect step after lead submit.
- Add A/B variants through `src/config/funnel.ts`.
- Add a booking calendar step using Sapt calendar endpoints.
