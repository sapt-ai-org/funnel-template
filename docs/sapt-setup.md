# Human Guide: Sapt Setup

## What Setup Does

`POST /api/setup` creates or updates a CRM object type:

```txt
funnel_lead
```

That type is configured with:

- `linksToPerson: true`
- `isPublicIngestable: true`
- flexible schema fields for contact info, UTM data, visitor ID, and answers

## Why It Matters

Leads become structured Sapt records instead of anonymous form emails.

Because `linksToPerson` is enabled, Sapt can attach the submission to the Person spine using email or phone.

## Manual Check

Open:

```txt
/api/health
```

Expected result:

```json
{ "ok": true }
```

Then run setup from the UI or with:

```bash
curl -X POST https://your-worker.example.workers.dev/api/setup
```
