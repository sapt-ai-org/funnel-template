# Sapt Funnel Template

A site for an independent auto repair shop, built with Next.js and deployed to
Cloudflare Workers, wired to [Sapt](https://sapt.ai) for leads, analytics, and
the shop's Google Business Profile.

One page that answers the questions a customer with a broken car actually asks,
a booking funnel, and a review flow. There is one template. A shop and a clinic
differ by content, not layout, so carrying two layouts only meant every change
had to be made twice.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sapt-ai-org/funnel-template)

## Before you deploy

1. In Sapt, open **Project Settings → Funnel**.
2. Select **Prepare project** to create the `booking` CRM type and seed branding.
3. Copy the Project ID shown on that page.
4. Select **Continue to Cloudflare** and paste the Project ID when Cloudflare
   asks for `NEXT_PUBLIC_SAPT_PROJECT_ID`.

Cloudflare copies this repository into your GitHub account, configures Workers
Builds, and deploys the site to your Cloudflare account. The Project ID is a
public identifier. Do not paste a Sapt API key, GitHub token, or Cloudflare
token into source files, AI prompts, or any `NEXT_PUBLIC_*` value.

The template declares the standard `build` and `deploy` scripts Cloudflare's
Deploy Button reads. It also includes a Wrangler build hook, so Cloudflare's
fallback `npx wrangler deploy` command still generates the OpenNext Worker
before publishing it.

## What you get

- A landing page built around what a shop is actually asked: what they fix, what
  it costs, when they are open, and how fast they can take the car.
- Deep Google Business Profile integration. `pnpm pull-gbp` writes the shop's
  name, address, phone, hours, services, rating, review link and photos straight
  off the listing, so the site and the listing cannot disagree.
- Named image slots with written briefs. An unfilled slot renders a labelled
  placeholder at the right aspect ratio instead of a stock photo.
- SEO and AIO foundations: `AutoRepair` JSON-LD built only from substantiated
  facts, a sitemap, robots, and an `llms.txt` written for answer engines.
- A review flow that sends a happy customer to the shop's own Google review form
  and routes everyone else to an internal feedback form the owner sees.
- A full-screen booking funnel with mobile haptics, writing to the Sapt CRM.
- Sapt analytics for page views, CTA interactions, funnel steps, and attribution.

## Local development

```bash
pnpm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_SAPT_PROJECT_ID in .env.local
pnpm dev
```

Open [http://localhost:2001](http://localhost:2001). The booking funnel is at
`/book` and the review flow is at `/review`.

## Customize for a client

Three files hold everything a visitor sees:

| File | What it owns |
|---|---|
| `src/config/business.ts` | The facts. Fields marked `@gbp` are generated; fields marked `@manual` are answered by a person. |
| `src/config/funnel.ts` | The voice. Landing copy, funnel questions, every label. |
| `src/lib/images.ts` | The photographs. One named slot per position, each with a brief. |

Start by pulling the business off Google:

```bash
pnpm pull-gbp --dry-run   # see what it would write
pnpm pull-gbp             # write it
```

Then work through [`ONBOARDING.md`](./ONBOARDING.md), which is the end-to-end
job in seven steps. [`SAPT_SETUP_GUIDE.md`](./SAPT_SETUP_GUIDE.md) covers the
Sapt integration contract.

For a vibe-coded setup, **Project Settings → Funnel** in Sapt has a
**Copy customization prompt** button that hands your coding agent the whole
sequence with the project's own ID already in it.

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SAPT_PROJECT_ID` | Yes | Public project identifier for analytics and lead capture |
| `NEXT_PUBLIC_SAPT_BASE_URL` | No | Sapt API base; defaults to `https://api.sapt.ai` |
| `NEXT_PUBLIC_SAPT_INGEST_URL` | No | Analytics ingest base; defaults to `https://ingest.sapt.ai` |
| `SAPT_BOOKING_TYPE_SLUG` | No | CRM type used for leads; defaults to `booking` |
| `SAPT_API_KEY` | No | Server-side only. Required by `pnpm pull-gbp`; also enables the optional CMS read |
| `GBP_LOCATION_ID` | No | Which Google location `pull-gbp` reads, when the project has several |

The deployed site needs no secret: content is compiled from `business.ts` and
`funnel.ts`, and lead capture uses the publicly-ingestable CRM type Sapt
creates. `SAPT_API_KEY` is a build-time and operator tool, never shipped to the
browser.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start Next.js locally on port 2001 |
| `pnpm build` | Build the Next.js application |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run the template, funnel, and script tests |
| `pnpm pull-gbp` | Write the business and its photos from the Google Business Profile |
| `pnpm init-project` | Stamp a Worker name and client branding into a fresh checkout |
| `pnpm preview` | Build and preview in the Cloudflare Workers runtime |
| `pnpm deploy` | Build with OpenNext and deploy to Cloudflare Workers |

## Security model

- The repository contains placeholders only. It carries no Sapt, GitHub, or
  Cloudflare credentials, and no client's Google identifiers: `pnpm pull-gbp`
  refuses to write when the origin is this template repository, and
  `src/config/placeholder.test.ts` fails the build if a real Place ID, review
  link, or address ever lands here.
- Lead submission uses the project's public ID and a CRM type explicitly marked
  publicly ingestable.
- Optional CMS access runs server-side and can read only explicitly published
  content.
- `.env*`, `.dev.vars*`, npm credentials, build output, and Wrangler state are
  ignored by Git.
- Cloudflare owns GitHub authorization and deployment credentials during the
  Deploy flow; this repository does not receive or store them.

## License

MIT, see [`LICENSE`](./LICENSE).
