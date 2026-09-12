import { business, shopOwner } from '@/config/business'
import type { LandingSpec } from '@/config/funnel'
import { portraitPhoto } from '@/lib/images'
import { Armchair, Bus, CarFront, Check, Coffee, KeyRound, ShieldCheck, Truck, type LucideIcon } from 'lucide-react'
import { Photo } from '../Photo'
import { SectionTitle } from '../primitives'

/**
 * The people. An independent shop's advantage over a chain is a named person
 * who stands behind the work, so this leads with the owner's portrait (or,
 * failing that, the team, then the floor; see PHOTO_PLAN) with their name on
 * it like the patch on a work shirt.
 *
 * The photo runs to the edge of the screen and takes the section's full
 * height, so the section reads as a place rather than a photo in a margin.
 * The amenities sit here too: loaner, shuttle and night drop decide which of
 * three shops gets the call more often than anything about the mechanics.
 *
 * They are a list, not tiles. A box around each one, with a tinted square
 * around each icon inside it, was three frames drawn around a single word, and
 * an odd count left the last one stretched across both columns looking broken.
 */
export function Shop({ shop }: Pick<LandingSpec, 'shop'>) {
  const portrait = portraitPhoto()
  const owner = portrait?.id === 'owner' ? shopOwner() : null

  const text = (
    <>
      <SectionTitle id="shop">{shop.title}</SectionTitle>
      <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-text-muted">{shop.body}</p>
      {business.yearEstablished ? (
        <p className="mt-4 font-semibold">
          Serving {business.address.city} since {business.yearEstablished}.
        </p>
      ) : null}

      {business.amenities.length ? (
        <>
          <h3 className="mt-10 text-lg font-semibold">{shop.amenitiesTitle}</h3>
          <ul className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {business.amenities.map((a) => {
              const Icon = amenityIcon(a)
              return (
                <li key={a} className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-text-muted" strokeWidth={2} aria-hidden />
                  <span className="leading-snug font-semibold">{a}</span>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}
    </>
  )

  if (!portrait) {
    return (
      <section id="shop" aria-labelledby="shop-title" className="bg-surface py-16 text-text sm:py-24">
        <div className="mx-auto w-full max-w-[74rem] px-5 sm:px-8">
          <div className="max-w-[48rem]">{text}</div>
        </div>
      </section>
    )
  }

  return (
    <section id="shop" aria-labelledby="shop-title" className="bg-surface text-text">
      <div className="grid lg:grid-cols-2">
        <figure className="relative min-h-[26rem] sm:min-h-[34rem] lg:min-h-full">
          <Photo photo={portrait} fill focus="top" className="absolute inset-0 rounded-none" sizes="(min-width: 1024px) 50vw, 100vw" />
          {owner ? (
            <figcaption className="absolute bottom-0 left-0 max-w-[calc(100%-2.5rem)] border-t-4 border-t-primary bg-ink px-5 py-4 text-white sm:px-6">
              <span className="block font-display text-2xl leading-none font-bold uppercase tracking-[0.02em]">{owner.name}</span>
              <span className="mt-1.5 block text-[15px] text-white/75">{owner.role}</span>
            </figcaption>
          ) : null}
        </figure>

        {/* The text keeps to the site's column on the right, whatever the screen width. */}
        <div className="px-5 py-16 sm:px-8 sm:py-24 lg:pr-[max(2rem,calc((100vw-74rem)/2+2rem))] lg:pl-16">{text}</div>
      </div>
    </section>
  )
}

/** A picture for each amenity, by what it says. Anything unrecognised gets a tick. */
const AMENITY_ICONS: [RegExp, LucideIcon][] = [
  [/loaner|rental|courtesy car/i, CarFront],
  [/shuttle|ride/i, Bus],
  [/night|drop|after.?hours|key/i, KeyRound],
  [/wi-?fi|coffee|snack/i, Coffee],
  [/wait|lounge|seating/i, Armchair],
  [/tow/i, Truck],
  [/warrant/i, ShieldCheck],
]

function amenityIcon(amenity: string): LucideIcon {
  return AMENITY_ICONS.find(([pattern]) => pattern.test(amenity))?.[1] ?? Check
}
