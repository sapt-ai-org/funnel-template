# Sapt Setup Guide

How this template integrates with Sapt. There are exactly **three** touchpoints — nothing
else — and no SDK; everything is plain REST plus one script tag:

1. **Analytics** (script) — works with just your Project ID.
2. **POST → CRM** — the booking funnel saves a record to a `booking` object type. **You must
   create that type once** (one MCP call) or bookings can't save.
3. **GET → CMS** — off by default; an optional helper can read explicitly published section
   content using the public Project ID.

---

## ⚡ Fastest path — let an AI agent do it (Sapt MCP)

If you have an AI agent connected to the **Sapt MCP connector**, the entire setup is three
tool calls. Paste this to the agent:

> Connect to the Sapt MCP. Then:
> 1. Call `whoami` and use `activeProjectId` as my Project ID (call `switchProject` first if
>    it's the wrong workspace). Put it in `.env.local` as `NEXT_PUBLIC_SAPT_PROJECT_ID`.
> 2. Create the `booking` CRM type — call `createObjectType` with the exact arguments in
>    section 4 of `SAPT_SETUP_GUIDE.md`.
> 3. Confirm with `getObjectType` (slug `booking`) that `isPublicIngestable` is `true`.

That's the whole thing. Everything else below is the manual/reference version.

## Table of contents

1. [Get your Project ID](#1-get-your-project-id)
2. [Configure the template](#2-configure-the-template)
3. [How each feature is wired](#3-how-each-feature-is-wired)
4. [Optional: booking type + automations](#4-optional-booking-type--automations)
5. [Optional: CMS-driven content](#5-optional-cms-driven-content)
6. [Deploy](#6-deploy)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Get your Project ID

**With the Sapt MCP (agent):** call `whoami` → use `activeProjectId`. Done.

**By hand:**
1. Log in to the [Sapt dashboard](https://dashboard.sapt.ai).
2. Open (or create) the project for this client.
3. Copy the **Project ID** (a UUID).

The Project ID powers analytics and the booking funnel UI immediately. To save bookings to
the CRM you also create the `booking` type once (section 4).

## 2. Configure the template

```bash
cp .env.local.example .env.local
```

Set the values you need:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SAPT_PROJECT_ID` | ✅ | Analytics + booking funnel (POST → CRM) |
| `NEXT_PUBLIC_SAPT_BASE_URL` | – | API base (default `https://api.sapt.ai`) |
| `NEXT_PUBLIC_SAPT_INGEST_URL` | – | Analytics ingest (default `https://ingest.sapt.ai`) |
| `SAPT_BOOKING_TYPE_SLUG` | – | CRM type slug for bookings (default `booking`) |

Restart `pnpm dev` after editing `.env.local`.

### Theme & CMS content

`src/config/funnel.ts` is the single source of truth for the live funnel, including its theme.
`useCmsContent` in `src/config/site-config.ts` stays `false` unless a developer deliberately uses
the optional section resolver described in section 5.

## 3. How each feature is wired

### Analytics (Project ID only)
`src/components/Analytics.tsx` injects `https://ingest.sapt.ai/v1/track.js` with your Project
ID. It auto-tracks pageviews, clicks, scroll depth, form submits, and UTM/click-IDs. The
funnel also fires custom events via `src/lib/analytics.ts`:

`funnel_view → booking_service_selected → booking_date_selected → booking_time_selected →
booking_details_completed → booking_submit → booking_confirmed`. Visitor identity is sent
with `identify()` on submit.

### POST → CRM (Project ID only)
The booking funnel POSTs to one route handler, which calls one public Sapt endpoint
**server-side** (`src/lib/sapt-server.ts` → `ingestObject`):

| Route handler | Calls | Result |
| --- | --- | --- |
| `POST /api/book` | `POST /public/projects/{id}/objects/{bookingTypeSlug}` | Saves a `booking` record (idempotent on `externalId`) |

This needs the `booking` type to exist with `isPublicIngestable: true` (section 4). Until then
the call returns an error and the funnel surfaces it — so set the type up first.

## 4. Create the booking type (required for bookings)

The booking funnel saves each booking as a **`booking`** CRM record. Create that type once,
with `isPublicIngestable: true` so the public funnel can write to it. Until it exists, the
booking POST returns an error. (Analytics and the funnel UI work without it.)

### Set it up with one MCP call (recommended)

Call `createObjectType` once with **exactly** these arguments. `isPublicIngestable: true` is
what lets the public funnel write to it; `linksToPerson: true` auto-links each booking to a
Person spine by email/phone.

```json
{
  "slug": "booking",
  "name": "Booking",
  "icon": "Calendar",
  "color": "#3B82F6",
  "description": "Booking requests captured by the landing-page funnel.",
  "isPublicIngestable": true,
  "linksToPerson": true,
  "schema": {
    "name":          { "label": "Name",           "schema": { "type": "string",  "options": {} } },
    "email":         { "label": "Email",          "schema": { "type": "string",  "options": { "format": "email" } } },
    "phone":         { "label": "Phone",          "schema": { "type": "string",  "options": {} } },
    "service":       { "label": "Service",        "schema": { "type": "string",  "options": {} } },
    "preferredDate": { "label": "Preferred Date", "schema": { "type": "string",  "options": {} } },
    "preferredTime": { "label": "Preferred Time", "schema": { "type": "string",  "options": {} } },
    "source":        { "label": "Source",         "schema": { "type": "string",  "options": {} } },
    "status":        { "label": "Status",         "schema": { "type": "select",  "options": {
      // IMPORTANT: Sapt select choices MUST be objects, not plain strings.
      // Plain strings make the validator reject every value ("Unknown choice")
      // and the form 502s. The app submits the LABEL, so set slug = label.
      "choices": [
        { "id": "new000001", "slug": "new", "label": "new" },
        { "id": "confirm01", "slug": "confirmed", "label": "confirmed" },
        { "id": "complete1", "slug": "completed", "label": "completed" },
        { "id": "cancel001", "slug": "cancelled", "label": "cancelled" }
      ]
    } } }
  }
}
```

Then verify with `getObjectType` (slug `booking`) that `isPublicIngestable` is `true`.

> Already have a type? Just flip the flag: `updateObjectType` with
> `{ "slug": "booking", "patch": { "isPublicIngestable": true } }`. Using a different slug?
> Set `SAPT_BOOKING_TYPE_SLUG` in your env to match.

### By hand (dashboard)

1. **CRM → Object Types → New**, slug `booking`.
2. Toggle **Publicly ingestable** on (and **Link to person** for clean CRM joins).
3. Add the fields above (all optional — unknown keys are accepted and flagged for review).

### Automations

Add a workflow that triggers on `record.created` for the `booking` type to send a
confirmation email, notify your team, etc. The funnel sends these keys in `data`: `name`,
`email`, `phone`, `service`, `preferredDate`, `preferredTime`, `status`, `source`, plus any
UTM params.

## 5. Optional: CMS-driven content

By default, all live funnel content lives in `src/config/funnel.ts`. If a future section genuinely
needs runtime-managed content, read an explicitly published CMS item from a **server component**:

```tsx
import { cmsGetBySlug } from '@/lib/sapt-server'

// Fetch one published item by slug (returns null when missing or unpublished)
const hero = await cmsGetBySlug('section', 'hero')
```

`cmsGetBySlug` exposes no drafts and requires no secret. `resolveContent` in `src/lib/content.ts`
can layer a published record over code defaults, gated by `useCmsContent`. This is intentionally an
extension point—the main funnel does not silently hand ownership to CMS content.

## 6. Deploy

The easiest route is **Project Settings → Funnel → Deploy to Cloudflare**. Cloudflare copies the
public template into your GitHub account, asks for `NEXT_PUBLIC_SAPT_PROJECT_ID`, configures
Workers Builds, and deploys into your Cloudflare account.

For a manual deployment:

```bash
pnpm deploy
```

- Set `NEXT_PUBLIC_SAPT_PROJECT_ID` in the build environment.
- Attach a custom domain in the Cloudflare dashboard or with a `routes` entry in `wrangler.jsonc`.

## 7. Troubleshooting

**Nothing is tracked / no leads appear**
- Confirm `NEXT_PUBLIC_SAPT_PROJECT_ID` is set and you restarted the dev server. It's inlined
  at build time, so production needs it set in the build environment.

**Bookings fail / "Unknown choice" error**
- The `booking` type must exist with `isPublicIngestable: true` (section 4). If you see
  "Unknown choice", the `status` SELECT field's choices aren't stored as `{id,slug,label}`
  objects with a `new` slug. Check the server logs for `[/api/book] CRM record failed`.

**CMS content is empty**
- Confirm the item is `published`, the Project ID is correct, and `useCmsContent` was deliberately
  enabled for the section using it.

---

- [Sapt docs](https://docs.sapt.ai) · [Dashboard](https://dashboard.sapt.ai) · support@sapt.ai
