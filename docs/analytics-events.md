# Human Guide: Analytics Events

The template loads Sapt analytics from:

```txt
SAPT_INGEST_SCRIPT_URL=https://ingest.sapt.ai/v1/track.js
```

The script receives:

```txt
data-project=SAPT_PROJECT_ID
```

## Browser API

Use:

```ts
window.sapt?.track('event_name', { property: 'value' })
window.sapt?.identify({ email: 'person@example.com' })
window.sapt?.getVisitorId()
```

The template wraps this in:

```txt
src/lib/analytics/tracker.ts
```

## Default Events

- `funnel_viewed`
- `funnel_cta_clicked`
- `funnel_form_started`
- `funnel_lead_submitted`
- `funnel_lead_created`
- `funnel_conversion_completed`

## Attribution Stitching

Before submit, the form calls:

```ts
identify({ email, phone })
const visitorId = getVisitorId()
```

Then `/api/lead` stores `visitorId` on the Sapt CRM record. This lets Sapt connect anonymous page behavior to the known person after conversion.
