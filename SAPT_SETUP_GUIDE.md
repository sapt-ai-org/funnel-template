# Sapt Setup Guide

How this template integrates with Sapt. There is no SDK. Everything is plain REST plus one
script tag, across four touchpoints:

1. **Analytics** (script). Works with just your Project ID.
2. **POST → CRM.** The booking funnel saves a record to a `booking` object type. **You must
   create that type once** or bookings cannot save.
3. **GET → Google Business Profile.** `pnpm pull-gbp` reads the shop's listing through Sapt
   and writes it into `src/config/business.ts`. Operator tool, run once per client, needs a
   server-side API key.
4. **GET → CMS.** Services, FAQs, specials and posts, read from published content with the
   public Project ID, cached, and refreshed by Sapt's webhook when they change (section 5).

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
5. [CMS content: services, FAQs, specials, blog](#5-cms-content-services-faqs-specials-blog)
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
| `NEXT_PUBLIC_META_PIXEL_ID` | – | The shop's Meta Pixel. Unset, no Meta code loads (section 3) |
| `SAPT_BOOKING_TYPE_SLUG` | – | CRM type slug for bookings (default `booking`) |
| `SAPT_API_KEY` | – | Server-side only. Required by `pnpm pull-gbp` |
| `GBP_LOCATION_ID` | – | Which Google location `pull-gbp` reads, when the project has several |
| `APP_KEY` | – | Worker secret. Verifies Sapt's content webhook (section 5) |

Restart `pnpm dev` after editing `.env.local`.

### Theme & CMS content

`src/config/business.ts` holds the shop's facts and `src/config/funnel.ts` holds its voice.
Between them they are the source of truth for the live site. Colour and corner radius are
in `src/config/design.ts` and the typefaces in `src/config/fonts.ts`; `init-project` stamps
the brand colour and fonts into both from the project's branding.
Services, FAQs, specials and blog posts come from the project's Sapt CMS once published (section 5);
until then the site shows these code defaults.

## 3. How each feature is wired

### Analytics (Project ID only)
`src/components/Analytics.tsx` injects `https://ingest.sapt.ai/v1/track.js` with your Project
ID. It auto-tracks pageviews, clicks, scroll depth, form submits, and UTM/click-IDs. The
booking form also fires its own events via `src/lib/analytics.ts`, each with the `source`
that says which button or form it came from (`hero_form`, `service_form:<slug>`, `header`,
`sticky`, `menu` and so on):

`funnel_open → funnel_view → funnel_step (one per answer) → funnel_submit → funnel_confirmed`.
Visitor identity is sent with `identify()` on submit.

### Meta Pixel (optional)
Set `NEXT_PUBLIC_META_PIXEL_ID` to the shop's pixel id and redeploy. Every page then sends a
`PageView` (including moves between pages inside the site), and each booking sends one
`Lead`. Sapt also reports each booking to Meta from its server (the Conversions API), which
catches visitors whose browsers block the Pixel. Meta counts the two as one only when they
share an event id, so the form mints one per booking, `/api/book` hands it to Sapt as
`tracking.lead.eventId`, and the Pixel fires with the `conversionEventId` Sapt returns. A
booking Sapt holds back (spam, or a contact marked not qualified) sends no Lead from either
side, and review feedback is never a Lead. Connect the same pixel in Sapt's Meta conversions
setup so the server half is sent. The details are in `src/lib/meta-pixel.ts`.

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

## 5. CMS content: services, FAQs, specials, blog

The parts a shop edits over time live in Sapt (Content), and a published change reaches the site
with no deploy. `src/lib/cms.ts` reads them, and every read falls back to the code defaults when
nothing is published, so a fresh clone still renders a complete site.

| Sapt content type | Where it shows | Until something is published |
|---|---|---|
| `service` (summary, description, image) | The home services list, `/services`, `/services/<slug>`, and the list closing every other page | `business.services`, from Google, with each service's summary, what the shop does and when to book it from `src/config/services.ts` |
| `faq` (question, answer, service) | That service's page when `service` is its slug; the home FAQ when `service` is empty | Home: `faq.items` in `funnel.ts`. A service page: that service's questions in `src/config/services.ts` |
| `special` (title, detail, terms, ends) | The home page, until the day after `ends` | `business.specials` |
| `article` (a Job story or a Guide) | `/blog`, `/blog/<slug>`, and a service's Recent jobs | No blog: `/blog` is a 404 |

Only published items leave Sapt, through one public read that needs no secret:
`GET /public/projects/<id>/cms/content/<type>`, every published item of a type (up to 100) in
the order the editor set. A post's own page is found in that list, so a made-up slug costs no
request. An FAQ without an answer is never shown, so a service page only carries questions the
shop has answered. The sitemap, `llms.txt` and each page's JSON-LD are built from the same reads,
and a stock photo (Unsplash, Pexels) renders on the page but is never presented to a crawler as
the shop.

**When an edit shows.** Pages are served from cache and each read is cached (see the README's
Caching section), so a visitor never waits on Sapt. To make a published edit show on the next
visit:

1. Set the Worker secret `APP_KEY` to the value Sapt signs its webhooks with:
   `pnpm wrangler secret put APP_KEY`. For `pnpm dev`, put it in `.env.local`.
2. In Sapt, add the site's root URL, with no trailing slash, under **Project Settings → General →
   Quick links**. Sapt POSTs to `<that URL>/api/revalidate` whenever content changes.

Without these, pages rebuild on a five-minute timer and an edit shows within about ten minutes.

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
- Confirm the item is `published` and the Project ID is correct. An FAQ also needs an answer.

**An edit takes minutes to show**
- The webhook is not reaching the site, so pages wait for their timer. Check that the site's URL is
  in the project's Quick links (section 5) and that `APP_KEY` is set. The Worker's logs show
  `[/api/revalidate] … cleared cms:<type>` for each call that worked; a 401 means `APP_KEY` does
  not match Sapt's, a 503 means it is not set.

---

- [Sapt docs](https://docs.sapt.ai) · [Dashboard](https://dashboard.sapt.ai) · support@sapt.ai
