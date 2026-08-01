# Client Onboarding — Stand up a high-converting funnel in ~20 minutes

This template is a **perspective.co-style lead funnel**: one question per screen, big
tappable buttons, minimal words. The entire funnel is one file — `src/config/funnel.ts`.
Sapt stays connected for leads, analytics, and optional published CMS sections, while the
deployed site's source of truth remains code.

**The whole job, start to finish:**

- [ ] 1. Grab the business's assets (logo, colors, fonts) → `public/`
- [ ] 2. Write the offer(s) — one sentence, clear CTA, low risk, compliant
- [ ] 3. Seed the client's Sapt memory (`brand`, `icp`, `offer`)
- [ ] 4. Configure the funnel — edit `src/config/funnel.ts`
- [ ] 5. Brand the look — colors + fonts
- [ ] 6. Connect Sapt — one env var + one MCP call to create the lead type
- [ ] 7. Preview and hand off

> Each step below is designed to be a single Claude prompt or a single file edit.
> The fastest path is to let Claude (with the Sapt MCP connected) do 1, 2, 3, and 6.

---

## 1. Get the business's assets

**Goal:** logo, color palette, and fonts, pulled straight from their existing site.

**Fastest way — ask Claude:**

> "Scrape `https://THEIR-SITE.com` and build a brand kit: download the logo, favicon,
> and hero images; extract the color palette (ignore framework defaults like Bootstrap);
> pull the fonts from `@font-face`. Put everything in a `brand/` folder with a `BRAND.md`
> summary (colors as hex with roles, font names, logo notes)."

What you're collecting:

| Asset | Where it goes | Notes |
|---|---|---|
| Logo (SVG or PNG) | `public/logo.svg` | If the logo is a PNG wrapped in an SVG, extract the PNG. |
| Favicon | `public/favicon.ico` / `public/icon.png` | |
| Brand colors | Step 5 (`src/config/funnel.ts`) + Sapt branding | Grab primary + accent + neutrals. |
| Fonts | Step 5 | Note the display + body families. |
| Hero image (optional) | `public/` | Only if you use imagery in the funnel. |

**Extraction tips** (how Claude does it): fetch the homepage HTML and the theme CSS,
count hex colors by frequency and drop the framework defaults (Bootstrap blues, greys),
read `@font-face` for the real font files, and take the header logo. Keep the
highest-signal 4–6 colors.

---

## 2. Build strong offers

A good offer is **one striking sentence + a clear CTA + low risk**. For most local
service businesses the strongest low-risk CTA is a **free consultation** (no price
anchoring, no commitment).

**The formula:**

```
[Positive outcome in the customer's words] + [what it is] — [clear CTA], [risk reversal].
```

**Examples (an independent med spa):**

- *"Rediscover thicker, fuller-looking hair using your body's own platelet-rich plasma —
  book a free, no-obligation consultation."*
- *"Reveal smoother, more radiant skin with a gentle Moxi laser treatment — claim your
  complimentary skin consultation."*

**⚠️ Compliance (health / med-spa / cosmetic / weight / supplements).** Meta will reject
non-compliant ads and can restrict the account. Every funnel MUST:

- Target **18+** (set on the ad set **and** state it in the funnel's `legal` line).
- Use **positive framing** — never attack someone's appearance.
- Never promise guaranteed outcomes or timeframes without an "individual results vary" qualifier.
- **Never** use these words anywhere in the funnel or ads:
  `guaranteed`, `permanent`, `cure`, `reverse`, `miracle`, `instant`, `eliminate`.

> The funnel has an automatic guard: `pnpm test` fails if any banned word appears in the
> active funnel copy (see `src/config/funnel.test.ts`). Write freely, then run the test.

---

## 3. Add the client to Sapt memory

Seed three memory entries so every downstream tool (ads, content, this funnel) shares the
same brief. **Ask Claude (Sapt MCP connected, correct project active):**

> "In the Sapt project for THIS CLIENT, save these memories, scoped only to what we're
> advertising: `brand` (business, locations, voice, visual identity, compliance guardrails),
> `icp` (who we target — geo, age 18+, motivations, objections), and `offer` (the offers
> from step 2 with CTAs and the mandatory Meta setup)."

Reserved keys Sapt treats as project foundation:

| Key | What to write |
|---|---|
| `brand` | Name, locations, contact, voice/tone, colors + fonts, compliance guardrails. |
| `icp` | Geo radius, age (18+), the 1–2 target segments, their motivations + objections. |
| `offer` | The offers from step 2 — one sentence each, CTA, risk reversal, Meta setup rules. |

Keep every entry **scoped to the services you're running ads on**. Anything outside that is
wasted space.

---

## 4. Configure the funnel

Open **`src/config/funnel.ts`** — this is the only file you edit to change the live site. It
contains one `landingSpec` object:

```ts
export const landingSpec: LandingSpec = {
  template: 'aurora',
  brandName: 'Client Name',
  theme: {
    primary: '#1F5A45',
    accent: '#D97941',
    bodyFontFamily: "'DM Sans', sans-serif",
    displayFontFamily: "'Cormorant Garamond', serif",
    // ...background, surface, text, border, and optional Google Fonts URL
  },
  // ...SEO, hero, benefits, reviews, FAQ, and final CTA
  funnel: {
    steps: [
      { kind: 'choice', id: 'treatment', question: 'What are you interested in?', options: [
        { id: 'prp', emoji: '💧', label: 'Thicker, fuller-looking hair', sublabel: 'PRP hair restoration' },
      ]},
      { kind: 'contact', id: 'contact', question: 'Where should we send details?',
        fields: [
          { id: 'name', label: 'Full name', placeholder: 'Your name' },
          { id: 'phone', label: 'Phone', placeholder: 'Phone number' },
          { id: 'email', label: 'Email', placeholder: 'you@email.com' },
        ],
        submitLabel: 'Book my free consultation' },
    ],
    // ...legal, success state, and reusable UI labels
  },
}
```

Rules of thumb for high conversion:

- **3–4 steps max** before the contact ask. Every extra step loses people.
- **One idea per screen.** Short question, 2–4 options.
- Lead with the **easiest, most engaging** question (what they want), not qualifying friction.
- The contact step is the ask — put the value (free consult) right in the button label.

Run `pnpm test` after editing — it verifies the copy is compliant and the flow ends in a
contact step.

---

## 5. Brand the look

Colors and fonts live beside the copy in **`src/config/funnel.ts`**:

```ts
theme: {
  primary: '#1F5A45',
  accent: '#D97941',
  background: '#F6F1E8',
  surface: '#FFFDF8',
  text: '#17221D',
  textMuted: '#66736C',
  border: '#D9DED7',
  bodyFontFamily: "'DM Sans', sans-serif",
  displayFontFamily: "'Cormorant Garamond', serif",
  fontStylesheetUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap',
}
```

The template derives the lighter and darker interaction shades from `primary` and `accent`.
Set all neutral tokens deliberately for either a light or dark design; no component edits are
needed.

---

## 6. Connect Sapt

Two things wire the funnel to the client's Sapt workspace:

**a) Project ID** — set in `.env.local` (local) or as a repo/deploy variable:

```
NEXT_PUBLIC_SAPT_PROJECT_ID=<the client's Sapt project UUID>
```

**b) The lead object type** — open **Project Settings → Funnel** and select **Prepare funnel**.
Sapt creates the publicly-ingestable `booking` CRM type and the starter `funnel/home` CMS item
idempotently, so it is safe to run again. Add an optional `record.created` workflow afterward if
the team should be notified when a lead arrives.

Leads then flow: funnel → `/api/book` → Sapt CRM record → email notification. Attribution
(UTM + click IDs) and analytics ride along automatically via `src/components/Analytics.tsx`.

---

## 7. Preview and hand off

```bash
pnpm install
pnpm dev            # http://localhost:2001/book  — walk the funnel
pnpm typecheck && pnpm lint && pnpm test
```

Submit a test lead and confirm the record shows up in the client's Sapt CRM.

From the Sapt dashboard, open **Project Settings → Funnel**, prepare the project's CMS and CRM,
copy the Project ID, and choose **Deploy to Cloudflare**. Cloudflare will copy this public
repository into your GitHub account and deploy it to your own Workers account.

---

### The 6 things that actually move conversion

1. **Message match** — the funnel's first screen echoes the ad's promise.
2. **Fewest steps** — 3–4 questions, then the ask.
3. **Big, obvious buttons** — one tap, auto-advance, no hunting.
4. **Value at the ask** — "Book my free consultation," not "Submit."
5. **Low risk** — free / no-obligation beats any discount for high-ticket services.
6. **Trust + compliance** — the 18+/results-vary line isn't just legal, it builds trust.
