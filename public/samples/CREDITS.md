# Sample photos

Shown only on the untouched template, each tagged "Sample" on the page, so the
design can be judged with real photography. None renders after a shop's first
`pnpm pull-gbp` (see `photo()` in `src/lib/images.ts`), and none is ever sent
to a crawler: they are excluded from the JSON-LD, the sitemap and the share
image.

All are free for commercial use with no attribution required, under the
[Pexels License](https://www.pexels.com/license/) or the
[Unsplash License](https://unsplash.com/license) (verified as regular
Unsplash photos, not Unsplash+). Credited here anyway.

| Slot | Photographer | Source |
|---|---|---|
| storefront | Erik Mclean | [Pexels](https://www.pexels.com/photo/cars-and-garages-23319100/) |
| owner | Jarred Ray | [Unsplash](https://unsplash.com/photos/man-in-gray-button-up-shirt-and-black-pants-standing-near-black-and-red-power-tool-udEWM2jLBVg) |
| interior | Artem Podrez | [Pexels](https://www.pexels.com/photo/a-man-in-blue-coverall-standing-near-a-white-car-8985701/) |
| bay | Artem Podrez | [Pexels](https://www.pexels.com/photo/man-in-blue-coverall-fixing-a-vehicle-8986100/) |
| detail | Sergei Starostin | [Pexels](https://www.pexels.com/photo/mechanic-performing-engine-repair-maintenance-29226627/) |
| gallery1 (diagnostics) | Gustavo Fring | [Pexels](https://www.pexels.com/photo/mechanic-checking-the-engine-of-a-car-6870313/) |
| gallery2 (tires) | Enis Yavuz | [Unsplash](https://unsplash.com/photos/person-holding-black-and-gray-metal-tool-CsYaNzll_rA) |
| gallery3 (brakes) | Gustavo Fring | [Pexels](https://www.pexels.com/photo/a-person-fixing-a-car-6870300/) |

Each is exported at 800 and 1600px wide as WebP (quality 76, metadata
stripped), so a phone downloads the small one.
