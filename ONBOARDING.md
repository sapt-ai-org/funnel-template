# Client onboarding

Stand up a shop's site in about twenty minutes.

Most of the work is already done by the time you start, because the shop already
wrote its own facts on Google. This is a site for an independent auto repair
shop: one page that answers who they are, what they fix, when they are open and
how to book, plus a booking funnel and a review flow.

**The whole job:**

- [ ] 1. Connect the shop's Google Business Profile in Sapt
- [ ] 2. Run `pnpm pull-gbp`
- [ ] 3. Answer the handful of things Google does not know
- [ ] 4. Fill the photo slots
- [ ] 5. Set the voice and the offer in `src/config/funnel.ts`
- [ ] 6. Decide the review routing
- [ ] 7. Check it and hand it off

Five files hold everything a visitor sees:

| File | What it owns |
|---|---|
| `src/config/business.ts` | The facts. Name, address, phone, hours, services, rating, review link, warranty, amenities, service areas, social profiles. |
| `src/config/funnel.ts` | The voice. The headline, the repair promise, reviews, FAQ, the booking questions, every label. |
| `src/lib/images.ts` | The photographs. One named slot per position, each with a written brief. |
| `src/config/design.ts` | The look. Brand colour and neutrals, corner radius, background texture, the footer wordmark and flag. |
| `src/config/fonts.ts` | The two typefaces, body and display. Any Google font, self-hosted. |

Nothing else needs editing to stand up a client. `init-project` stamps the
brand colour and fonts from the project's Sapt branding; change them afterwards
in those two files, never in CSS.

---

## 1. Connect the Google Business Profile

In Sapt, open the client's project, go to **Integrations**, and connect **Google
Business Profile**. Then sync locations. The shop's owner has to authorize it,
which is usually the longest part of the whole job, so start here.

This is worth doing even if you were going to type the address by hand. It is
what makes the site and the Maps listing agree, and it is the difference
between one review link that works and a hand-built one that does not.

---

## 2. Pull the business

```bash
cp .env.local.example .env.local
# NEXT_PUBLIC_SAPT_PROJECT_ID=<the client's Sapt project UUID>
# SAPT_API_KEY=<a server-side Sapt API key>
pnpm pull-gbp --dry-run   # see what it would write
pnpm pull-gbp             # write it
```

> **Do the CRM type while you are in Sapt.** The booking form cannot save
> anything until the client's project has the `appointment_request` object type.
> In Sapt, open **Project Settings → Funnel** and select **Prepare project**: it
> reads `sapt.manifest.json` off this repo and provisions the type, idempotently,
> so running it twice is safe. Skip it and everything looks fine right up until
> the test booking in step 7 fails. Details and the by-hand version are in
> SAPT_SETUP_GUIDE.md, section 4.

It fills every field marked `@gbp` in `business.ts`: name, category,
description, phone, address, hours, services, rating and review count, the
Google review link, the Maps link, the Place ID. It downloads the profile's
photos into `public/photos/` and assigns them to image slots.

Fields marked `@manual` are read back out of the file and written through
unchanged, so you can run it again after a shop updates its hours without
losing anything you typed.

It refuses to write inside the public template repository, because a real Place
ID or review link committed there would be a client identifier in a public repo.
Run it in the client's own repository.

---

## 3. Answer what Google does not know

Open `business.ts` and fill the `@manual` fields. Ask the owner:

| Field | Ask |
|---|---|
| `email` | Which inbox should leads reach? |
| `siteUrl` | What domain is this going live on? |
| `timeZone` | Which time zone are the hours in? An IANA name such as `America/Chicago`. "Open now" is wrong for every visitor without it. |
| `yearEstablished` | What year did the shop open? "Family owned since 1979" outperforms any adjective. |
| `warranty` | Months and miles. This is the one claim a customer cannot get from the dealer for less. |
| `amenities` | Loaner, shuttle, night drop, wifi. These decide which of three shops gets the call. |
| `badges` | Which programs is the shop in? ASE, AAA, BBB, NAPA AutoCare, CARFAX and the rest of the catalog in `src/config/trust.ts`, plus ownership (family, veteran, woman owned) and any local award as `custom`. The official marks ship in `public/badges/` (sources in `public/badges/SOURCES.md`). For each, get the link to the shop's listing on the program's site (`url`) so a customer can check it; BBB requires it, and the BBB seal will not show without it. If the shop has the program-specific version of a mark in its member kit (ASE Certified, NAPA AutoCare, CARFAX Top-Rated), use that instead. |
| `specials` | Any live coupon, with its terms. Leave the array empty rather than inventing one. |
| `serviceAreas` | The surrounding towns they actually serve. This is how a shop shows up for a neighbouring town it has no address in. |
| `social` | Which profiles does the shop actually post on? Paste each full URL into `social` (below the pull markers, so a pull never touches it). Instagram, Facebook, YouTube and TikTok are ready to fill; LinkedIn, X and Yelp are commented lines to uncomment. Each filled one becomes an icon in the footer and tells Google the profile is the same business. Leave dead or empty profiles out. |

Leave a field alone rather than guessing. An empty `specials` array renders no
offer block at all, which is correct. An invented discount is a problem the shop
finds out about from a customer.

---

## 4. Fill the photo slots

A local service site lives or dies on photographs. Stock photography of a
generic garage reads as a template instantly, and every competitor's template
uses the same three shots.

`pull-gbp` fills what the Google profile has and writes each photo's alt text
from what Google says it shows ("The team at Torres' Auto"). Read the last line
of its output: it names every slot still waiting. Send that list to the owner,
drop the files in `public/photos/`, and set `src` and `alt` on the slot in
`src/lib/images.ts`.

Where each photo goes is decided in one place, `PHOTO_PLAN` at the bottom of
`src/lib/images.ts`:

| Position | Takes the first of | Also used for |
|---|---|---|
| Beside the hours and directions | `storefront`, `exterior` | The share image and the schema |
| The shop section | `owner`, `team`, `interior` | |
| The gallery bento | `bay`, `detail`, `gallery1`, `team`, `interior`, `gallery2`, `gallery3`, `gallery4`, `exterior` | Up to seven, strongest first |

A photo is only ever used once, and a position with no photo simply closes
up. A live site never shows a placeholder. In `pnpm dev`, every missing photo
shows as a labelled "Photo needed" box exactly where it will go, so you can
see the gaps while you work. The untouched template shows sample photos,
tagged "Sample", which stop rendering at the first `pull-gbp`.

The gallery lays itself out for however many photos there are, one to seven,
and the first tile is the largest. Put the strongest shot in `bay`.

The `owner` slot is never filled automatically: Google has no category for
it, and guessing wrong puts a stranger's face on the about section. Ask for
one. Set `owner` in `business.ts` (name and role) and the portrait gets a
caption; an independent shop's best advantage over a chain is a named person.

---

## 5. Set the voice and the offer

`src/config/funnel.ts` is the voice: one key per section of the page (the
headline, the repair promise, services, reviews, the shop, FAQ, the closing
ask) and the booking flow itself. The facts already came from Google, so this
file is where the shop sounds like itself. Never put a phone number, town or
rating in it; those come from `business.ts` and stay in sync with the listing.

The repair promise is the page's centrepiece, drawn as a torn-off repair order.
Make its three steps true for this shop. If they text estimates rather than
call, say so.

To add a section the shop wants to be known for (fleet accounts, hybrid and
EV, diesel), add a block to `features` in `funnel.ts`: a title, a paragraph,
a few points and a photo. It renders after the services with no code. For
anything that shape cannot hold, add a file to `src/components/site/sections`
built from `primitives.tsx`, and a line for it in `src/app/page.tsx`.

The funnel asks what is wrong with the vehicle, when they need it, and then who
they are. Three screens, then the ask.

Rules of thumb:

- Three or four steps before the contact ask. Every extra step loses people.
- One idea per screen. Short question, two to four options.
- Lead with the easiest question, not qualifying friction.
- Put what happens in the button. "Request my appointment", never "Submit".
- Reviews are never typed. `pull-gbp` quotes the shop's own recent four and
  five star Google reviews; until it runs, the page shows cards tagged
  "Sample", which disappear on the first pull.

`pnpm test` fails if any banned word appears in visitor-facing copy. The list is
in `funnel.ts` with the reasoning above it: superlatives nobody can
substantiate, bare guarantees, manufactured urgency. Write freely, then run it.

---

## 6. Decide the review routing

`business.ts` ends with `reviewGate`. Read the comment above it before you touch
it. It is one number:

```ts
minStarsToGoogle: 1   // every customer reaches Google. Compliant.
minStarsToGoogle: 4   // 1 to 3 stars are intercepted.
minStarsToGoogle: 5   // only 5 stars reach Google.
```

Sending only happy customers to Google is review gating. Google's
prohibited-content policy names it and they disable the review function on
listings that do it. The internal feedback form is worth keeping at any
threshold: it is the service recovery channel, and offering it alongside a
Google link rather than instead of one is the compliant shape.

This is the operator's call, not a default to leave unread.

---

## 7. Check it and hand it off

```bash
pnpm install
pnpm dev                    # walk the page, then /book, then /review
pnpm typecheck && pnpm lint && pnpm test
```

Then:

- Submit a test booking and confirm the record lands in the client's Sapt CRM.
- Open `/review`, click through both branches, and confirm five stars reaches
  the shop's own Google link.
- View source and check the JSON-LD block: the address, phone and hours in it
  must match the Maps listing exactly. A mismatch is treated as a signal that
  one of the two is wrong.
- Read `/llms.txt`. That is what an answer engine quotes back about this shop.
- Open `/services` and two service pages. A service's questions appear only
  once their answers are published in Sapt (Content > FAQs); until then the
  page simply skips that section.
- Read `/privacy` and `/terms` with the owner. They are built from
  `business.ts`, and carriers read them when the shop's texting is registered,
  so the email and address in `business.ts` must be real before launch.
- The booking form ships with the A2P consent tick switched on
  (`SMS_CONSENT_CHECKBOX` in `src/config/legal.ts`). Leave it on to register the
  shop's texting: that box, with the shop's name beside it, is what a carrier's
  reviewer screenshots, and the form will not submit without it. Once the
  campaign is approved, set it to `false` and the tick becomes a single line
  under the button. The privacy page and the terms reword themselves to match,
  and `pnpm test` fails if any required clause goes missing.
- `/blog` stays a 404 until the first job story is published in Sapt.
- The site refuses to be indexed while it still carries the demo name (every
  page is `noindex` and `robots.txt` disallows everything). After `pull-gbp`,
  confirm `/robots.txt` allows crawling and lists the sitemap.

From the Sapt dashboard, open **Project Settings → Funnel**, prepare the
project, copy the Project ID, and choose **Continue to Cloudflare**. Cloudflare
copies this repository into your GitHub account and deploys it to your own
Workers account.

---

### What actually moves the needle on a shop site

1. **The phone number is reachable in one tap** from anywhere on the page.
2. **Hours are correct and match Google.** The most common reason someone calls
   the next shop is that they could not tell whether this one was open.
3. **Real photographs of this shop.** Not a stock garage.
4. **The warranty, stated in months and miles**, above the fold.
5. **A booking flow short enough to finish in a parking lot**, on a phone, with
   one bar of signal.
6. **Reviews from Google**, quoted, with the reviewer's own words.
