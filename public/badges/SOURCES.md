# Program marks

Each file is the program's official mark as published on the program's own
website, trimmed to the edges of the artwork (the SVG's `viewBox` cropped to
the inked area) and otherwise untouched. No recolouring, no redrawing.

Only a shop that actually belongs to a program may display its mark, and the
badge should link to the shop's listing on the program's site wherever one
exists (`url` on the badge in `business.ts`).

| File | Mark | Source |
|---|---|---|
| `aaa.svg` | AAA (the oval), the mark AAA-approved shops display beside the program name | [aaa.com](https://www.aaa.com/autorepair) (`aaa-logo-color.svg`, the site header logo) |
| `acdelco.svg` | ACDelco | Wikimedia Commons `ACDelco_logo.svg`, traced from ACDelco's own PDF and checked against its Professional Service Center handbook |
| `ase.svg` | ASE (the gear) | [ASE toolkit](https://ase.com/about/toolkit/) (`ASE-logo-color.pdf`, converted to SVG) |
| `bbb.svg` | BBB Accredited Business (current seal) | [bbb.org](https://www.bbb.org/) (`Accredited_Business_Seal_NoRating_RGB.svg`) |
| `bfgoodrich.svg` | BFGoodrich Tires | [bfgoodrichtires.com](https://www.bfgoodrichtires.com/) (`sprite-logos.svg`, symbol `logo-brand-color`, the site header logo) |
| `bosch.svg` | Bosch Car Service | [boschcarservice.com](https://www.boschcarservice.com/xc/en/) (`bosch-service-logo.svg`) |
| `bridgestone.svg` | Bridgestone (the B mark and wordmark) | [bridgestone.com](https://www.bridgestone.com/) (`bridgestone-logo-set-en.svgz`). The file sets the logo above the "Solutions for your journey" tagline as a separate group; only the logo group is kept, unchanged |
| `carfax.svg` | CARFAX | [carfax.com](https://www.carfax.com/) (site header logo) |
| `firestone.svg` | Firestone | [firestonetire.com](https://www.firestonetire.com/) (`firestone-logo.svg`, the site header logo) |
| `goodyear.svg` | Goodyear (wordmark with the Wingfoot) | [goodyear.com](https://www.goodyear.com/en_US) (`primary-dark-brand-logo.svg`, the site header logo) |
| `icar-gold-class.png` | I-CAR Gold Class, Collision Repair | [I-CAR Gold Class marketing kit](https://info.i-car.com/gold-class-marketing-kit) (`Gold-Class-Collision-Repair-Logo.zip`, the PNG, trimmed; the kit's EPS is the vector master) |
| `michelin.svg` | Michelin (Michelin Man and wordmark) | [michelinman.com](https://www.michelinman.com/) (`sprite-logos.svg`, symbol `logo-brand-color`, the site header logo) |
| `napa.svg` | NAPA | [napaonline.com](https://www.napaonline.com/) (`NAPA-RGB-PRIMARY-4C`) |
| `repairpal.svg` | RepairPal Certified | [repairpal.com](https://repairpal.com/auto-repair-near-me) (the badge as embedded on the site) |
| `technet.svg` | TechNet Professional Automotive Service | [technetprofessional.com](https://www.technetprofessional.com/) (site header logo) |

The Google "G" used beside ratings and reviews is inlined in
`GoogleMark` (`src/components/site/primitives.tsx`), from the public-domain
Commons file.

**BBB:** BBB's rules require a website to show the accredited business's own
seal linked to its BBB profile. The site enforces it: the seal renders only on
a badge that has its `url` set to the shop's BBB profile, and shows as text
otherwise.

**Tire brands:** a brand's mark belongs on the site of an authorized dealer
for that brand, which is what the badge says ("Authorized Michelin tire
dealer"). A shop that only fits a brand on request is not a dealer and lists
none. The dealer's own agreement is the authority on how the mark may be used.

**I-CAR Gold Class:** collision repair only, and only while the shop holds
the status. I-CAR's policy requires a shop that no longer qualifies to stop
using the mark.

ASE, CARFAX, NAPA and ACDelco are the parent brands' marks. The
program-specific variants (ASE Certified, ASE Blue Seal of Excellence, CARFAX
Top-Rated Service Center, NAPA AutoCare Center) are sent to member shops in
their kits rather than published; swap in the shop's own copy when it has
one. The same goes for these, which have no published vector and so ship as
text badges or custom badges with the member's own file:

- **ASE Blue Seal of Excellence:** ASE publishes only photographs of the seal;
  the artwork comes with the recognition.
- **ASA (Automotive Service Association) member:** the logo is in the ASA
  Member Portal (Resources) as JPG or PNG, for current members only.
- **Auto Value / Bumper to Bumper Certified Service Center:** the Alliance
  publishes only raster parent logos, not the program mark.
- **Federated Car Care Center:** federatedcc.com carries only JPEGs.
- **Nextdoor Neighborhood Faves:** a winner's badge is dated to its year and
  comes in the winner's kit.

Google Guaranteed no longer exists: Google replaced it with "Google Verified"
in October 2025, shown on Google itself rather than as a file.
