# Sapt Funnel Template

A polished, mobile-first landing page and lead funnel for [Sapt](https://sapt.ai), built with
Next.js and deployed to Cloudflare Workers. This public starter is the same application used by
Sapt's internal client funnel template, without the private deployment orchestrator or credentials.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sapt-ai-org/funnel-template)

## Before you deploy

1. In Sapt, open **Project Settings → Funnel**.
2. Select **Prepare project** to create the `booking` CRM type and starter CMS content.
3. Copy the Project ID shown on that page.
4. Select **Continue to Cloudflare** and paste the Project ID when Cloudflare asks for
   `NEXT_PUBLIC_SAPT_PROJECT_ID`.

Cloudflare copies this repository into your GitHub account, configures Workers Builds, and deploys
the site to your Cloudflare account. The Project ID is a public identifier. Do not paste a Sapt API
key, GitHub token, or Cloudflare token into source files, AI prompts, or any `NEXT_PUBLIC_*` value.

The template declares the standard `build` and `deploy` scripts Cloudflare's Deploy Button reads.
It also includes a Wrangler build hook, so Cloudflare's fallback `npx wrangler deploy` command still
generates the OpenNext Worker before publishing it.

## What you get

- A responsive landing page with hero, benefits, testimonials, FAQ, and conversion sections.
- A full-screen, multi-step lead funnel with mobile haptics and progress state.
- Aurora and Mono visual templates, plus local preview routes for comparing them.
- Sapt CRM lead capture through the public `booking` ingestion endpoint.
- Sapt analytics for page views, CTA interactions, funnel steps, and attribution parameters.
- An optional authenticated CMS read path for teams that want runtime-managed copy.

## Local development

```bash
pnpm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_SAPT_PROJECT_ID in .env.local
pnpm dev
```

Open [http://localhost:2001](http://localhost:2001). Template previews are available at
`/preview/aurora` and `/preview/mono`.

## Customize the funnel

The visitor-facing content and funnel flow live in `src/config/funnel.ts`. Brand colors and fonts
live in `src/app/globals.css`. Change the active template import in `src/app/page.tsx`, or run the
initializer to select and prune a template:

```bash
PROJECT_SLUG=my-funnel TEMPLATE_ID=aurora pnpm init-project
```

See [`ONBOARDING.md`](./ONBOARDING.md) for the end-to-end customization workflow and
[`SAPT_SETUP_GUIDE.md`](./SAPT_SETUP_GUIDE.md) for the Sapt integration contract.

## Configuration

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SAPT_PROJECT_ID` | Yes | Public project identifier for analytics and lead capture |
| `NEXT_PUBLIC_SAPT_BASE_URL` | No | Sapt API base; defaults to `https://api.sapt.ai` |
| `NEXT_PUBLIC_SAPT_INGEST_URL` | No | Analytics ingest base; defaults to `https://ingest.sapt.ai` |
| `SAPT_BOOKING_TYPE_SLUG` | No | CRM type used for leads; defaults to `booking` |
| `SAPT_API_KEY` | No | Server-only secret for optional authenticated CMS reads |

`SAPT_API_KEY` must never be committed or exposed through a `NEXT_PUBLIC_*` variable. The default
funnel does not need it: content is compiled from `src/config/funnel.ts`, and lead capture uses the
publicly-ingestable CRM type created by Sapt.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start Next.js locally on port 2001 |
| `pnpm build` | Build the Next.js application |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run template and funnel tests |
| `pnpm preview` | Build and preview in the Cloudflare Workers runtime |
| `pnpm deploy` | Build with OpenNext and deploy to Cloudflare Workers |

## Security model

- The repository contains placeholders only. It does not contain Sapt, GitHub, or Cloudflare
  credentials.
- Lead submission uses the project's public ID and a CRM type explicitly marked publicly
  ingestable.
- Optional CMS access runs server-side and requires a separately configured Worker secret.
- `.env*`, `.dev.vars*`, npm credentials, build output, and Wrangler state are ignored by Git.
- Cloudflare owns GitHub authorization and deployment credentials during the Deploy flow; this
  repository does not receive or store them.

## License

MIT — see [`LICENSE`](./LICENSE).
