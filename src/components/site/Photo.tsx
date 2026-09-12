import type { ResolvedPhoto } from '@/lib/images'
import { cn } from '@/lib/utils'

/**
 * One photo, in a box that owns its shape.
 *
 * The box sets the aspect ratio (the slot's own, unless `className` gives an
 * `aspect-*` or the parent gives a height) so nothing reflows as images
 * arrive, and the photo covers it. Pass `sizes` whenever the photo is not
 * full width, so a phone downloads the small file. `priority` is for the one
 * image a visitor sees first; everything else loads as it nears the screen.
 *
 * Resolve the photo with `photo()` / `firstPhoto()` from `@/lib/images` and
 * render this only when that returns one: a section with no photo should
 * close up, not show an empty frame.
 */
export function Photo({
  photo,
  className,
  sizes = '100vw',
  priority = false,
  fill = false,
  focus = 'center',
}: {
  photo: ResolvedPhoto
  className?: string
  sizes?: string
  priority?: boolean
  /** Take the parent's height (a grid cell) instead of the slot's ratio. */
  fill?: boolean
  /** Where the crop keeps: a portrait keeps the face near the top. */
  focus?: 'center' | 'top'
}) {
  const box = cn('relative isolate overflow-hidden rounded-md bg-border-light', fill && 'h-full', className)
  const ratio = fill || className?.includes('aspect-') ? undefined : { aspectRatio: String(photo.ratio) }

  // Development only (see `photo()`): where the shop's photo will go, and what it should be.
  if (photo.placeholder) {
    return (
      <div role="img" aria-label={`Photo needed: ${photo.brief}`} className={box} style={ratio}>
        <div
          className="absolute inset-0 flex items-center justify-center p-5 text-center"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, var(--border-light) 0 10px, color-mix(in srgb, var(--border) 60%, var(--border-light)) 10px 20px)',
          }}
        >
          <span className="max-w-[26ch] rounded-md bg-surface/85 px-4 py-3">
            <span className="block font-semibold">Photo needed</span>
            <span className="block text-[15px] leading-snug text-text-muted">{photo.brief}</span>
          </span>
        </div>
      </div>
    )
  }

  const width = 1600
  return (
    <div className={box} style={ratio}>
      {/* eslint-disable-next-line @next/next/no-img-element -- Cloudflare serves these as-is; next/image needs a loader this deploy does not have. */}
      <img
        src={photo.src}
        srcSet={photo.srcSet}
        sizes={photo.srcSet ? sizes : undefined}
        alt={photo.alt}
        width={width}
        height={Math.round(width / photo.ratio)}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={cn('absolute inset-0 h-full w-full object-cover', focus === 'top' && 'object-[50%_18%]')}
      />
    </div>
  )
}
