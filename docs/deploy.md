# Human Guide: Deploy

## No-Code Path

If you do not know how to code, give this repo link to Claude Code, Cursor, ChatGPT, or another coding agent:

```txt
https://github.com/sapt-ai-org/funnel-template
```

Then paste this prompt:

```txt
Please help me deploy this Sapt funnel template to Cloudflare Workers.

I need you to walk me through each step in plain English.

I have or will create:
- A Sapt account
- A Sapt project ID
- A Sapt API key
- A Cloudflare account

Please help me:
1. Clone the repo.
2. Install pnpm dependencies.
3. Create .dev.vars.
4. Run local tests.
5. Run a real local smoke test.
6. Deploy to Cloudflare Workers.
7. Set Cloudflare Worker secrets.
8. Confirm leads are created in Sapt CRM.
9. Customize the funnel for my business.
```

## Developer Path

Clone and install:

```bash
git clone https://github.com/sapt-ai-org/funnel-template.git
cd funnel-template
pnpm install
```

Create local env:

```bash
cp .dev.vars.example .dev.vars
```

Fill `.dev.vars`:

```txt
SAPT_API_KEY=sapt_...
SAPT_PROJECT_ID=your-project-id
```

Run production validation:

```bash
pnpm production:test
```

Run locally:

```bash
pnpm build
pnpm dev
```

Run the local smoke test in another terminal:

```bash
FUNNEL_TEST_BASE_URL=http://localhost:8787 pnpm smoke:test
```

Deploy:

```bash
wrangler login
wrangler secret put SAPT_API_KEY
wrangler secret put SAPT_PROJECT_ID
pnpm deploy
```

After deploy:

1. Open the deployed URL.
2. Click **Run setup**.
3. Submit a test lead.
4. Confirm the lead appears in Sapt CRM.
5. Confirm the memory entry exists under `funnels/leads/{recordId}`.

## Cloudflare Bindings

Required secrets/vars:

- `SAPT_API_KEY`: secret API key from Sapt.
- `SAPT_PROJECT_ID`: project receiving leads and analytics.

Defaults already in `wrangler.jsonc`:

- `SAPT_ENDPOINT=https://api.sapt.ai`
- `SAPT_INGEST_SCRIPT_URL=https://ingest.sapt.ai/v1/track.js`

## Troubleshooting

- If `/api/health` fails, check the API key.
- If `/api/setup` fails with 403, the key cannot create/update CRM object types in the project.
- If leads submit but analytics are missing, check `SAPT_PROJECT_ID` and script loading in browser devtools.
- If Cloudflare's GitHub UI gets in your way, skip it and deploy with `wrangler` from your terminal.
