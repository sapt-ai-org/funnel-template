# Human Guide: Cloudflare Deploy Button HTTP 400

If the Cloudflare deploy button shows `HTTP 400` under **Project name**, the failure is usually happening before your Worker builds. In that case Cloudflare is failing while trying to create or connect a Git repository, not while deploying this template.

## Why This Happens

Common causes:

- The repo name already exists in GitHub.
- Cloudflare's GitHub app is not allowed to create repos in the selected account or org.
- The GitHub org restricts third-party app repo creation.
- Cloudflare is authorized for selected repos only and cannot see the repo you want.
- Cloudflare's deploy-button repo creation path is stale or bugged for the current GitHub session.

The private/public checkbox is usually not the root cause. If both private and public repo creation return `HTTP 400`, assume the GitHub connection/repo-creation step is failing.

## Recommended Fix

Use an existing GitHub repo instead of letting Cloudflare create one.

1. Create the repo directly in GitHub or with GitHub CLI.
2. Push this template to that repo.
3. In Cloudflare, choose **Import existing Git repository** instead of **Create Git repository**.
4. Select the repo.
5. Deploy from `main`.

For this template, the test repo is:

```txt
sapt-ai-org/video-test-funnel
```

## If Cloudflare Cannot See The Repo

Fix GitHub app access:

1. Open GitHub.
2. Go to `sapt-ai-org` organization settings.
3. Open **GitHub Apps** or **Third-party access**.
4. Find the Cloudflare Workers/Pages GitHub app.
5. Click **Configure**.
6. Grant access to the repo, or grant access to all repos.
7. Return to Cloudflare and retry **Import existing Git repository**.

## Manual Wrangler Deploy Fallback

This bypasses Cloudflare's GitHub UI entirely.

```bash
pnpm install
pnpm production:test
wrangler login
wrangler secret put SAPT_API_KEY
wrangler secret put SAPT_PROJECT_ID
pnpm deploy
```

`SAPT_PROJECT_ID` is not sensitive, but setting it as a Worker secret is the simplest manual deploy path because the template expects it as a runtime binding.

## Build Settings If Importing Existing Repo

Use:

```txt
Package manager: pnpm
Build command: pnpm install --frozen-lockfile && pnpm build
Deploy command: pnpm deploy
Production branch: main
Root directory: /
```

Required runtime bindings:

```txt
SAPT_API_KEY=sapt_...
SAPT_PROJECT_ID=your-project-id
```

Defaults already live in `wrangler.jsonc`:

```txt
SAPT_ENDPOINT=https://api.sapt.ai
SAPT_INGEST_SCRIPT_URL=https://ingest.sapt.ai/v1/track.js
```
