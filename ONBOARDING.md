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

Three files hold everything a visitor sees:

| File | What it owns |
|---|---|
| `src/config/business.ts` | The facts. Name, address, phone, hours, services, rating, review link, warranty, amenities, service areas. |
| `src/config/funnel.ts` | The voice. Headlines, benefits, reviews, FAQ, the funnel's questions, every label. |
| `src/lib/images.ts` | The photographs. One named slot per position, each with a written brief. |

Nothing else needs editing to stand up a client.

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
| `yearEstablished` | What year did the shop open? "Family owned since 1979" outperforms any adjective. |
| `warranty` | Months and miles. This is the one claim a customer cannot get from the dealer for less. |
| `amenities` | Loaner, shuttle, night drop, wifi. These decide which of three shops gets the call. |
| `certifications` | ASE, NAPA AutoCare, AAA, BBB. Third-party trust, not our words. |
| `specials` | Any live coupon, with its terms. Leave the array empty rather than inventing one. |
| `serviceAreas` | The surrounding towns they actually serve. This is how a shop shows up for a neighbouring town it has no address in. |

Leave a field alone rather than guessing. An empty `specials` array renders no
offer block at all, which is correct. An invented discount is a problem the shop
finds out about from a customer.

---

## 4. Fill the photo slots

A local service site lives or dies on photographs. Stock photography of a
generic garage reads as a template instantly, and every competitor's template
uses the same three shots.

`pull-gbp` fills what the Google profile has. Whatever is left renders a hatched
placeholder carrying its own brief, so the page still lays out correctly and it
is obvious to everyone, the client included, exactly which photo is missing.

Run `pnpm pull-gbp` and read the last line: it names every slot still waiting.
Send that list to the owner. Drop the files in `public/photos/` and set `src`
and `alt` on the slot in `src/lib/images.ts`.

The `owner` slot is never filled automatically. Google has no category for "the
owner, head and shoulders", and guessing wrong puts a stranger's face on the
about section.

---

## 5. Set the voice and the offer

`src/config/funnel.ts` is the voice: hero, benefits, proof, FAQ, final CTA, and
the booking funnel itself. The facts already came from Google, so this file is
where the shop sounds like itself.

The funnel asks what is wrong with the vehicle, when they need it, and then who
they are. Three screens, then the ask.

Rules of thumb:

- Three or four steps before the contact ask. Every extra step loses people.
- One idea per screen. Short question, two to four options.
- Lead with the easiest question, not qualifying friction.
- Put what happens in the button. "Request my appointment", never "Submit".
- The reviews are real reviews. Paste them from Google or leave the placeholder
  visible so nobody mistakes an invention for a customer.

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
