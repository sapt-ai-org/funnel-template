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

- **Every page a shop needs.** The home page; a Services page and one page per
  service; a blog of real job stories; and a plain-language Privacy Policy and
  Terms, which carriers and ad platforms check before they approve a shop's
  texting and ads. Every page ends with what the shop fixes, so none is a dead end.
- **A service page built to book that service.** The service's photo behind a
  booking form that already knows the service, so it skips "what is the car
  doing?" and the shop's board gets the service by name. Then what the job
  involves, when to book it, the service's own questions and recent jobs.
  Common services have that copy written in `src/config/services.ts` until the
  shop publishes its own.
- **Content the shop edits in Sapt.** Services, FAQs, specials and posts are
  published from Sapt and reach the site on the next visit, with no deploy.
  Until something is published, every page shows the code defaults.
- **Every page is served from cache.** Pages are built once and stored in R2;
  a visitor never waits on Sapt. When an editor publishes, Sapt calls
  `/api/revalidate` and the pages that use that content are rebuilt. See
  [Caching](#caching).
- **A page built around the questions a driver asks, in order.** Can I book it
  now, who vouches for you, how will it go, do you fix mine, can I trust you,
  where and when. The first screen is the booking form itself.
- **Everything factual comes off the Google listing.** `pnpm pull-gbp` writes the
  shop's name, address, phone, hours, services, rating, review link, recent
  reviews and photos, so the site and the listing cannot disagree.
- **Third-party trust, verifiable.** A catalog of the programs shops belong to
  (ASE, AAA, BBB, NAPA AutoCare, CARFAX and more) with their official marks,
  each linking to the program's own listing for the shop.
- **Photos shown well.** A bento gallery that composes itself for however many
  photos a shop has, with full-size viewing, and a photo plan that gives every
  position a fallback so a thin profile still looks finished. A live site never
  shows a placeholder.
- **Real reviews, moving.** The shop's own recent Google reviews in a two-row
  marquee that pauses on hover and stands still for anyone who asks for less
  motion.
- **An SEO foundation that is hard to get wrong.** One linked JSON-LD graph
  (`AutoRepair`, `WebSite`, `WebPage`, `FAQPage`, and `Service`, `BlogPosting` and breadcrumbs on their own pages) built only from substantiated
  facts, share images, a sitemap with image entries, and a guard that keeps
  any site still carrying the demo name out of every index.
- **Open to every crawler, AI included.** `robots.txt` allows everything and
  names the AI crawlers outright. `/llms.txt` is the index an assistant reads
  first (facts, hours, every service, every question) and `/llms-full.txt` is
  the whole site in one file. Both are built from the same content as the
  pages and rebuild when it changes.
- **A review flow** that sends a customer to the shop's own Google review form
  and routes service problems to the owner.
- **Sapt analytics** for page views, bookings by the section that produced
  them, and attribution. First-party, on from the first deploy.
- **Meta Pixel ready.** Set `NEXT_PUBLIC_META_PIXEL_ID` and every page sends
  a PageView and every booking one Lead, counted once alongside Sapt's
  server-side copy. Nothing from Meta loads until the id is set.
- **A header that gets anywhere.** A services dropdown on a computer, a full
  menu with call and book under the thumb on a phone, and the hours, address
  and number in a strip above.

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
| `src/config/funnel.ts` | The voice. Every sentence a visitor reads, one key per section, plus the booking questions. |
| `src/lib/images.ts` | The photographs. One named slot per position, each with a brief. |
| `src/config/design.ts` | The look. Brand colour, neutrals, corner radius, background texture, footer wordmark and flag. |
| `src/config/fonts.ts` | The two typefaces. Swap a name in the import and the call; any Google font, self-hosted. |

The page itself is `src/app/page.tsx`: one line per section, in running order.
The sections live in `src/components/site/sections`, built from the handful of
parts in `src/components/site/primitives.tsx` (`Section`, `Container`,
`SectionHeader`, `Split`, the buttons). Every section renders nothing when it
has nothing to say, so removing one is deleting its line, and a custom section
is either a `features` block in `funnel.ts` or a new file in `sections`.

Restyling is two files and no CSS. `design.ts` holds the colours (one brand
hex, from which the site generates its light-to-dark ramp), the corner radius
in pixels (0 is square; the small and large radii scale from it), the motif and
the footer switches; `fonts.ts` holds the typefaces. `layout.tsx` writes them
onto `<html>` and every component reads them through Tailwind's tokens, so one
edit changes the whole site. A client's brand colour lands on the buttons and
nowhere else, so rebranding never needs a redesign.

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
| `NEXT_PUBLIC_META_PIXEL_ID` | No | The shop's Meta Pixel; its Lead dedupes against Sapt's server-side copy |
| `SAPT_BOOKING_TYPE_SLUG` | No | CRM type used for leads; defaults to `booking` |
| `SAPT_API_KEY` | No | Server-side only. Required by `pnpm pull-gbp` |
| `GBP_LOCATION_ID` | No | Which Google location `pull-gbp` reads, when the project has several |
| `APP_KEY` | No | Worker secret. Verifies Sapt's content webhook so edits show at once |

The deployed site needs no secret to work: content is compiled from
`business.ts` and `funnel.ts`, CMS content comes from Sapt's public read, and
lead capture uses the publicly-ingestable CRM type Sapt creates. `APP_KEY` only
makes edits instant (see [Caching](#caching)). `SAPT_API_KEY` is a build-time
and operator tool, never shipped to the browser.

## Caching

Nothing is read from Sapt per visitor. `open-next.config.ts` and the bindings
in `wrangler.jsonc` set up three pieces, all created by the Deploy Button:

- **Pages in R2.** Every page is built once (at deploy, or on its first visit)
  and served from the `NEXT_INC_CACHE_R2_BUCKET` bucket.
- **Reads in R2.** Each CMS type is one request to Sapt, cached with the tag
  `cms:<type>` (`src/lib/cms.ts`). A failed refresh keeps the last good copy.
- **Rebuilds.** When an editor publishes, Sapt POSTs to `/api/revalidate`,
  which clears that type's tag; the next visit to any page that used it gets a
  rebuilt page. Without that call, pages rebuild on their `revalidate` timer
  (five minutes) in a Durable Object queue, and an edit shows within about ten.

For the instant path, set the `APP_KEY` secret (`pnpm wrangler secret put
APP_KEY`, the value Sapt signs with) and add the site's root URL, with no
trailing slash, to **Project Settings → General → Quick links** in Sapt. Sapt
calls `<that URL>/api/revalidate` for every link in that list.

`WORKER_SELF_REFERENCE` in `wrangler.jsonc` must name the Worker itself. Rename
the two together; `init-project` writes both from the project slug.

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
