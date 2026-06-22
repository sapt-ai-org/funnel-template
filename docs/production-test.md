# Human Guide: Production Test

Use this before pushing, deploying, or handing the repo to someone else.

## Automated Production Test

```bash
pnpm production:test
```

This runs:

- TypeScript check
- ESLint
- Vitest unit tests
- Production frontend build
- Wrangler deploy dry-run

## Real Sapt End-To-End Test

This verifies the actual product path with your Sapt project.

1. Create local secrets:

```bash
cp .dev.vars.example .dev.vars
```

2. Fill in:

```txt
SAPT_API_KEY=sapt_...
SAPT_PROJECT_ID=your-project-id
```

3. Build and run locally through Wrangler:

```bash
pnpm build
pnpm dev
```

4. Open the local URL Wrangler prints.

5. Click **Run setup** in the setup banner.

6. Submit a real test lead.

7. Confirm in Sapt:

- A `funnel_lead` CRM record exists.
- The record has the submitted email, name, UTM fields, and `visitorId` when available.
- A memory entry exists under `funnels/leads/{recordId}`.
- Analytics events appear after ingest processing.

## Automated Smoke Test

After `pnpm dev` is running locally in another terminal:

```bash
FUNNEL_TEST_BASE_URL=http://localhost:8787 pnpm smoke:test
```

Against a deployed Worker:

```bash
FUNNEL_TEST_BASE_URL=https://your-worker.example.workers.dev pnpm smoke:test
```

The smoke test calls:

- `GET /api/health`
- `POST /api/setup`
- `POST /api/lead`

It creates a real Sapt CRM lead using a `sapt-funnel-smoke+...@example.com` email. Delete that test record in Sapt when done.

## Deploy Test

When automated and local Sapt tests pass:

```bash
pnpm deploy
```

Then repeat the Real Sapt End-To-End Test on the deployed URL.

## AI Prompt: Debug Production Test Failure

```txt
I am testing this Cloudflare Sapt funnel template for production and something failed.

Failure:
[PASTE ERROR]

Context:
- Command run: [COMMAND]
- Local or deployed URL: [URL]
- Did /api/health pass? [YES/NO]
- Did /api/setup pass? [YES/NO]
- Did /api/lead return ok? [YES/NO]

Please diagnose the root cause without changing the Sapt API contract or exposing SAPT_API_KEY to browser code.
```
