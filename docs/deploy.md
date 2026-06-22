# Human Guide: Deploy

## Fast Path

1. Click the Cloudflare deploy button in `README.md`.
2. Paste `SAPT_API_KEY`.
3. Paste `SAPT_PROJECT_ID`.
4. Deploy.
5. Open the site.
6. Click **Run setup**.
7. Submit a test lead.
8. Confirm the lead appears in Sapt CRM.

## Local Path

```bash
pnpm install
cp .dev.vars.example .dev.vars
pnpm build
pnpm dev
```

## Production Test Before Deploy

```bash
pnpm production:test
```

This runs the complete local verification suite and `wrangler deploy --dry-run`.

For an end-to-end Sapt test before deploying:

1. Put real Sapt credentials in `.dev.vars`.
2. Run `pnpm build`.
3. Run `pnpm dev`.
4. Open the Wrangler local URL.
5. Click **Run setup**.
6. Submit a test lead.
7. Check Sapt CRM for a `funnel_lead` record.
8. Check Sapt memory for `funnels/leads/{recordId}`.

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
