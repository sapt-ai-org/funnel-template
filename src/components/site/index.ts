/**
 * The shop site, as parts.
 *
 * Two rules keep these interchangeable across every client:
 *
 *  - Facts come from `@/config/business` (imported directly), voice comes in
 *    as props from `landingSpec`. A section never hardcodes a shop's name,
 *    number or town, and never writes marketing copy of its own.
 *  - Sections are server components. The client code is `booking.tsx` (the
 *    book buttons and the takeover they open), `HeroBooking.tsx` (the same
 *    form inline in a hero card; HeroParts.tsx frames it), `hours.tsx` (anything that depends on the
 *    time), `LogoLoop.tsx` (React Bits' endless logo row, behind the trust
 *    strip) and the pinned phone bar. A new section should stay on the server.
 *
 * Order and inclusion live in `src/app/page.tsx`. To drop a section, delete
 * its line there; to add one, build it from `primitives.tsx`.
 */

export { BookButton, BookingProvider } from './booking'
export { HoursList, OpenStatus } from './hours'
export { bentoLayout } from './bento'
export { HeroBooking } from './HeroBooking'
export { Lightbox } from './Lightbox'
export { LogoLoop, type LogoItem } from './LogoLoop'
export { ArticleBody } from './ArticleBody'
export { Breadcrumbs } from './Breadcrumbs'
export { LinkCard } from './LinkCard'
export { LegalLinks } from './LegalLinks'
export { LegalPage } from './LegalPage'
export { PageHead, pageTitleClass } from './PageHead'
export { Photo } from './Photo'
export { SiteShell } from './SiteShell'
export { TrustLoop } from './TrustLoop'
export {
  ButtonLink,
  CallButton,
  Container,
  GoogleMark,
  Section,
  SectionHeader,
  SectionTitle,
  Split,
  Stars,
  alternate,
  buttonClass,
} from './primitives'
export { BookingSlot, HeroBackdrop, HeroFacts } from './HeroParts'

export { Faq, FaqList, FaqSection } from './sections/Faq'
export { Feature } from './sections/Feature'
export { FinalCta } from './sections/FinalCta'
export { Gallery } from './sections/Gallery'
export { Hero } from './sections/Hero'
export { MobileActionBar } from './sections/MobileActionBar'
export { RepairOrder } from './sections/RepairOrder'
export { Reviews } from './sections/Reviews'
export { Services } from './sections/Services'
export { ServiceDetail } from './sections/ServiceDetail'
export { ServiceHero } from './sections/ServiceHero'
export { Shop } from './sections/Shop'
export { SiteFooter } from './sections/SiteFooter'
export { SiteHeader } from './sections/SiteHeader'
export { Specials } from './sections/Specials'
export { TrustBar } from './sections/TrustBar'
export { Visit } from './sections/Visit'
