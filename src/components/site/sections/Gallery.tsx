import { business } from '@/config/business'
import type { LandingSpec } from '@/config/funnel'
import { galleryPhotos } from '@/lib/images'
import { bentoLayout, BENTO_MAX } from '../bento'
import { Lightbox } from '../Lightbox'
import { Photo } from '../Photo'
import { Container, Section, SectionHeader } from '../primitives'

/**
 * The shop, in photographs: a bento of the bays, the tools and the people,
 * composed for however many photos the shop has (see bento.ts), each opening
 * full size on a tap. Real photos only on a live site: with none, the
 * section is not there at all.
 *
 * `sizes` follows the bento: the first tile is about two thirds of the
 * container on a desktop, the rest a third; on a phone, full or half width.
 */
export function Gallery({ gallery }: Pick<LandingSpec, 'gallery'>) {
  const shots = galleryPhotos(BENTO_MAX)
  if (shots.length === 0) return null
  const layout = bentoLayout(shots.length)
  // Only real photos open full size; a development placeholder has nothing to show.
  const viewable = shots.filter((p) => !p.placeholder)

  return (
    <Section id="gallery" tone="paper">
      <Container>
        <SectionHeader
          id="gallery"
          title={gallery.title}
          intro={gallery.intro}
          aside={
            business.mapsUrl ? (
              <a href={business.mapsUrl} target="_blank" rel="noreferrer" className="font-semibold hover:underline">
                More photos on Google Maps
              </a>
            ) : null
          }
        />

        <ul id="gallery-grid" className={`mt-10 sm:mt-12 ${layout.grid}`}>
          {shots.map((p, i) => (
            <li key={p.id} className={layout.tiles[i]}>
              {p.placeholder ? (
                <Photo photo={p} fill className="rounded-none" />
              ) : (
                <button
                  type="button"
                  data-photo={viewable.indexOf(p)}
                  aria-label={`View full size: ${p.alt}`}
                  className="group block h-full w-full cursor-zoom-in overflow-hidden"
                >
                  <Photo
                    photo={p}
                    fill
                    sizes={i === 0 ? '(min-width: 1024px) 740px, 100vw' : '(min-width: 1024px) 370px, 50vw'}
                    className="rounded-none transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </button>
              )}
            </li>
          ))}
        </ul>
      </Container>
      {viewable.length ? (
        <Lightbox gridId="gallery-grid" photos={viewable.map(({ src, srcSet, alt }) => ({ src, srcSet, alt }))} />
      ) : null}
    </Section>
  )
}
