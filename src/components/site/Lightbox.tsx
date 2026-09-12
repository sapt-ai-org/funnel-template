'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface LightboxPhoto {
  src: string
  srcSet?: string
  alt: string
}

/**
 * Full-size viewing for a grid of photos that is rendered on the server.
 *
 * The grid stays server markup; this listens for clicks on any element inside
 * `#{gridId}` carrying `data-photo="<index>"` and opens that photo in a native
 * modal <dialog>, which brings focus trapping, Escape to close and the
 * backdrop for free. Arrow keys and the on-screen arrows step through; a tap
 * outside the photo closes it.
 */
export function Lightbox({ photos, gridId }: { photos: LightboxPhoto[]; gridId: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [index, setIndex] = useState(0)
  // The full-size image is only put on the page once someone opens the
  // viewer; a closed <dialog> would otherwise download it on every visit.
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback((i: number) => {
    setIndex(i)
    setIsOpen(true)
    dialog.current?.showModal()
    document.documentElement.style.overflow = 'hidden'
  }, [])

  const step = useCallback((by: number) => setIndex((i) => (i + by + photos.length) % photos.length), [photos.length])

  useEffect(() => {
    const grid = document.getElementById(gridId)
    if (!grid) return
    const onClick = (e: MouseEvent) => {
      const tile = (e.target as HTMLElement).closest<HTMLElement>('[data-photo]')
      if (tile) open(Number(tile.dataset.photo))
    }
    grid.addEventListener('click', onClick)
    return () => grid.removeEventListener('click', onClick)
  }, [gridId, open])

  const current = photos[index]
  if (!current) return null

  return (
    <dialog
      ref={dialog}
      aria-label="Photos"
      onClose={() => {
        document.documentElement.style.overflow = ''
        setIsOpen(false)
      }}
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') step(1)
        if (e.key === 'ArrowLeft') step(-1)
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-[rgb(12_17_23/0.92)] open:flex open:items-center open:justify-center"
    >
      {isOpen ? (
        <figure className="pointer-events-none flex max-h-full flex-col items-center px-4 py-16 sm:px-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.src}
            src={current.src}
            srcSet={current.srcSet}
            sizes="92vw"
            alt={current.alt}
            className="pointer-events-auto max-h-[78dvh] w-auto max-w-full rounded-md object-contain"
          />
          <figcaption className="mt-4 text-center text-[15px] text-white/75">
            {current.alt}
            <span className="ml-3 tabular-nums text-white/50">
              {index + 1} / {photos.length}
            </span>
          </figcaption>
        </figure>
      ) : null}

      <button
        type="button"
        onClick={() => dialog.current?.close()}
        aria-label="Close photos"
        className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20"
      >
        <X className="h-5 w-5" aria-hidden />
      </button>
      {photos.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous photo"
            className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next photo"
            className="absolute right-4 bottom-4 flex h-12 w-12 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2"
          >
            <ChevronRight className="h-6 w-6" aria-hidden />
          </button>
        </>
      ) : null}
    </dialog>
  )
}
