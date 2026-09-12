/**
 * Third-party trust: the programs a shop can say it belongs to.
 *
 * A badge is only worth anything because someone other than the shop vouches
 * for it, so every entry here is a real program with a real standard, and
 * each badge on the site can link to the program's own listing for the shop,
 * where a customer can check it. That link is the difference between a claim
 * and proof: set `url` whenever the program has a public listing.
 *
 * The shop lists the programs it is actually in, in `business.badges`. The
 * wording below is the default; a badge can override it with its own
 * `detail`, but never with anything the program itself would not stand
 * behind (no "#1", no "best").
 *
 * LOGOS. The programs' official marks ship in `public/badges/`, downloaded
 * from each program's own website (sources in public/badges/SOURCES.md) and
 * trimmed to the artwork, nothing else changed: most programs forbid
 * recolouring or redrawing their mark. Only a shop that is actually in a
 * program may show its mark. A newer version from the shop's member kit, or a
 * mark for a custom badge, goes in the same folder with `logo` set on the
 * badge (trim it to the artwork and give its aspect ratio).
 */

export type BadgeKind = 'certification' | 'membership' | 'award' | 'ownership'

export interface BadgeLogo {
  /** A file in public/, e.g. '/badges/ase.svg'. Trimmed to the mark, no margin. */
  src: string
  /** width / height of the trimmed mark, for optical sizing (see logo-size.ts). */
  aspect: number
}

export interface TrustProgram {
  label: string
  /** One plain line on what it means for the customer. */
  detail: string
  kind: BadgeKind
  /** The program's official mark, shipped with the template. */
  logo?: BadgeLogo
  /**
   * The program only allows its mark on a website when it links to the
   * shop's listing (BBB's seal must be clickable through to the profile).
   */
  logoNeedsListing?: boolean
}

export const TRUST_PROGRAMS = {
  // Technician and shop certification
  ase: {
    label: 'ASE Certified',
    detail: 'Technicians tested and certified by ASE',
    kind: 'certification',
    logo: { src: '/badges/ase.svg', aspect: 1 },
  },
  ase_blue_seal: {
    label: 'ASE Blue Seal',
    detail: 'Certified technicians across every service we offer',
    kind: 'award',
  },
  // Collision shops only: I-CAR's training standard for body and paint work.
  icar_gold_class: {
    label: 'I-CAR Gold Class',
    detail: 'Collision technicians trained to I-CAR’s Gold Class standard',
    kind: 'certification',
    logo: { src: '/badges/icar-gold-class.png', aspect: 1.085 },
  },
  // Programs that inspect the shop and stand behind the work
  aaa: {
    label: 'AAA Approved Auto Repair',
    detail: 'Inspected and approved by AAA',
    kind: 'membership',
    logo: { src: '/badges/aaa.svg', aspect: 1.6573 },
  },
  bbb: {
    label: 'BBB Accredited',
    detail: 'Meets the Better Business Bureau’s standards for trust',
    kind: 'membership',
    logo: { src: '/badges/bbb.svg', aspect: 2.6089 },
    // BBB's rules: on a website, the seal must link to the business's own
    // BBB profile. Without `url` the badge shows as text, not the seal.
    logoNeedsListing: true,
  },
  napa: {
    label: 'NAPA AutoCare Center',
    detail: 'Nationwide warranty through NAPA',
    kind: 'membership',
    logo: { src: '/badges/napa.svg', aspect: 1.1318 },
  },
  technet: {
    label: 'TechNet Professional',
    detail: 'Nationwide warranty through TechNet',
    kind: 'membership',
    logo: { src: '/badges/technet.svg', aspect: 3.3413 },
  },
  acdelco: {
    label: 'ACDelco Service Center',
    detail: 'An ACDelco Professional Service Center',
    kind: 'membership',
    logo: { src: '/badges/acdelco.svg', aspect: 5.1536 },
  },
  bosch: {
    label: 'Bosch Car Service',
    detail: 'Part of the Bosch Car Service network',
    kind: 'membership',
    logo: { src: '/badges/bosch.svg', aspect: 1 },
  },
  repairpal: {
    label: 'RepairPal Certified',
    detail: 'Certified by RepairPal for fair pricing and quality',
    kind: 'membership',
    logo: { src: '/badges/repairpal.svg', aspect: 1.1177 },
  },
  carfax: {
    label: 'CARFAX Top-Rated',
    detail: 'Top-rated by CARFAX customers',
    kind: 'award',
    logo: { src: '/badges/carfax.svg', aspect: 5.3191 },
  },
  // Tire brands the shop is an authorized dealer for. Only a dealer may show
  // the brand's mark; a shop that fits other tires on request lists none.
  michelin: {
    label: 'Michelin dealer',
    detail: 'Authorized Michelin tire dealer',
    kind: 'membership',
    logo: { src: '/badges/michelin.svg', aspect: 5.0709 },
  },
  goodyear: {
    label: 'Goodyear dealer',
    detail: 'Authorized Goodyear tire dealer',
    kind: 'membership',
    logo: { src: '/badges/goodyear.svg', aspect: 5.868 },
  },
  bfgoodrich: {
    label: 'BFGoodrich dealer',
    detail: 'Authorized BFGoodrich tire dealer',
    kind: 'membership',
    logo: { src: '/badges/bfgoodrich.svg', aspect: 6.5113 },
  },
  bridgestone: {
    label: 'Bridgestone dealer',
    detail: 'Authorized Bridgestone tire dealer',
    kind: 'membership',
    logo: { src: '/badges/bridgestone.svg', aspect: 8.045 },
  },
  firestone: {
    label: 'Firestone dealer',
    detail: 'Authorized Firestone tire dealer',
    kind: 'membership',
    logo: { src: '/badges/firestone.svg', aspect: 6.6041 },
  },
  // Who owns it: often the deciding detail for a local customer
  family_owned: {
    label: 'Family owned',
    detail: 'Owned and run by a local family',
    kind: 'ownership',
  },
  veteran_owned: {
    label: 'Veteran owned',
    detail: 'Owned and operated by a U.S. veteran',
    kind: 'ownership',
  },
  woman_owned: {
    label: 'Woman owned',
    detail: 'Owned and operated by a woman',
    kind: 'ownership',
  },
} as const satisfies Record<string, TrustProgram>

export type ProgramId = keyof typeof TRUST_PROGRAMS

export interface Badge {
  /** A program from the catalog above, or 'custom' with its own label. */
  program: ProgramId | 'custom'
  /** Required for 'custom' (a local award, a chamber membership); overrides the catalog otherwise. */
  label?: string
  detail?: string
  /** The program's public listing for this shop: BBB profile, AAA locator, CARFAX page. */
  url?: string
  /**
   * Replaces the catalog's mark, e.g. a newer version from the member kit or
   * the mark for a custom badge. Trim it to the artwork and give its aspect.
   */
  logo?: BadgeLogo
}

/**
 * A badge with the catalog's defaults filled in, ready to render. A mark the
 * program only allows when linked (`logoNeedsListing`) is dropped when the
 * badge has no `url`, except on the untouched template, which shows the full
 * set so the design can be judged.
 */
export function resolveBadge(badge: Badge, { template = false }: { template?: boolean } = {}): TrustProgram & Pick<Badge, 'url'> {
  const base: TrustProgram =
    badge.program === 'custom'
      ? { label: badge.label ?? '', detail: badge.detail ?? '', kind: 'award' }
      : TRUST_PROGRAMS[badge.program]
  return {
    label: badge.label ?? base.label,
    detail: badge.detail ?? base.detail,
    kind: base.kind,
    url: badge.url,
    logo: base.logoNeedsListing && !badge.url && !template ? badge.logo : (badge.logo ?? base.logo),
  }
}
