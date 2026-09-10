# Sapt Setup Guide

How this template integrates with Sapt. There is no SDK. Everything is plain REST plus one
script tag, across four touchpoints:

1. **Analytics** (script). Works with just your Project ID.
2. **POST → CRM.** The booking funnel saves a record to a `booking` object type. **You must
   create that type once** or bookings cannot save.
3. **GET → Google Business Profile.** `pnpm pull-gbp` reads the shop's listing through Sapt
   and writes it into `src/config/business.ts`. Operator tool, run once per client, needs a
   server-side API key.
4. **GET → CMS.** Off by default. An optional helper can read explicitly published section
   content using the public Project ID.

---

## ⚡ Fastest path — let an AI agent do it (Sapt MCP)

If you have an AI agent connected to the **Sapt MCP connector**, the whole setup is a few
tool calls. Paste this to the agent:

> Connect to the Sapt MCP. Then:
> 1. Call `whoami` and use `activeProjectId` as my Project ID (call `switchProject` first if
>    it's the wrong workspace). Put it in `.env.local` as `NEXT_PUBLIC_SAPT_PROJECT_ID`.
> 2. Read `sapt.manifest.json` from this repo and create the `booking` CRM type by passing
>    its `objectTypes[0]` straight to `createObjectType`.
> 3. Confirm with `getObjectType` (slug `booking`) that `isPublicIngestable` is `true`.
> 4. Tell me whether the project has a Google Business Profile connected, so I know whether
>    `pnpm pull-gbp` will work yet.

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
| `SAPT_API_KEY` | – | Server-side only. Required by `pnpm pull-gbp`; also enables the optional CMS read |
| `GBP_LOCATION_ID` | – | Which Google location `pull-gbp` reads, when the project has several |

Restart `pnpm dev` after editing `.env.local`.

### Theme & CMS content

`src/config/business.ts` holds the shop's facts and `src/config/funnel.ts` holds its voice
and theme. Between them they are the source of truth for the live site.
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

### The schema lives in `sapt.manifest.json`

`sapt.manifest.json` at the root of this repo is the source of truth for every
structure the site needs. Keeping the definition in one place is the point: an
inline copy in this guide drifts the first time a field is added, and then two
documents disagree about what the CRM looks like.

**Easiest:** in Sapt, open **Project Settings → Funnel** and select
**Prepare project**. It reads the manifest off this repository's default branch
and provisions everything, idempotently, so running it again is safe.

**With an MCP agent:** read `sapt.manifest.json` and pass `objectTypes[0]`
straight to `createObjectType`. Then confirm with `getObjectType` (slug
`booking`) that `isPublicIngestable` is `true`.

Two flags in there matter and are easy to miss:

- `isPublicIngestable: true` is what lets the public funnel write to the type at
  all. Without it every booking POST returns an error.
- `linksToPerson: true` auto-links each booking to a Person by email or phone,
  so a repeat customer is one contact rather than four records.

One shape detail, because it fails loudly: Sapt `select` choices must be stored
as `{ id, slug, label }` objects, not plain strings. Plain strings make the
validator reject every value with "Unknown choice" and the funnel 502s. The app
submits the **slug**.

The pipeline is not one of those. `statuses` is a separate top-level list of
stages, and a record lands on whichever is marked `isInitial` on its own, which
is why neither route sends a `status`. Two of the stages carry a `capiStage`, so
moving a job to Booked or Completed reports a real shop outcome back to the ad
platforms instead of a form fill.

> Already have a type? Flip the flag: `updateObjectType` with
> `{ "slug": "booking", "patch": { "isPublicIngestable": true } }`. Using a
> different slug? Set `SAPT_BOOKING_TYPE_SLUG` in your env to match.

### By hand (dashboard)

1. **CRM → Object Types → New**, slug `booking`.
2. Toggle **Publicly ingestable** on, and **Link to person** for clean joins.
3. Add the fields from the manifest. Unknown keys are accepted and flagged for
   review rather than dropped, so a missing field loses reporting, not the lead.

### The pipeline

The board is the type's `statuses`, not a field:
`new → contacted → booked → in_shop → completed`, plus `lost`.

`source` distinguishes where a record came from:
`booking_funnel`, `feedback`, `phone`, `walk_in`. This matters more than it
looks. The review flow writes `feedback` rows into the same type, and counting
those as leads would flatter every conversion number the shop is shown.

### Automations

Add a workflow that triggers on `record.created` for the `booking` type to text
the shop, email the customer, or start a follow-up. Filter on
`source = booking_funnel` unless you mean to fire on feedback too.

The funnel sends these keys in `data`: `name`, `email`, `phone`, `vehicle`,
`issue`, `timing`, `service`, `preferredDate`, `preferredTime`, `source`,
`answers` (the raw step answers as JSON), `saptVisitorId`, plus any UTM params. `issue`, `timing` and `vehicle` are promoted out of the `answers`
blob deliberately: a shop filters its board by what is wrong with the car and
how soon it needs to be in, and a workflow cannot branch on a field buried in
JSON.

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
