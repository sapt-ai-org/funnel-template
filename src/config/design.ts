/**
 * ════════════════════════════════════════════════════════════════════════════
 *  THE LOOK — every visual choice a shop makes, in one place.
 * ────────────────────────────────────────────────────────────────────────────
 *  Colours, corner radius, the background texture and the footer extras live
 *  here. The two typefaces live in src/config/fonts.ts (a font has to be
 *  imported by name, so it cannot be a string in this file).
 *
 *  Nothing here needs CSS edits. layout.tsx writes these values onto <html> as
 *  CSS variables, and every component reads them through Tailwind's tokens
 *  (bg-primary, text-text-muted, rounded-md…), so one change here recolours or
 *  re-rounds the whole site. `init-project` stamps `brand`, `ink` and `paper`
 *  from the client's Sapt branding when a client repo is generated.
 * ════════════════════════════════════════════════════════════════════════════
 */

export type Motif = 'none' | 'grid' | 'tread' | 'checker'

export interface Design {
  colors: {
    /**
     * The shop's colour, spent on actions only: book and call buttons, focus
     * rings, the selected answer. A light-to-dark ramp (primary-50…900) is
     * generated from it for tints and hover states. Pick one that holds white
     * text: the buttons put white on it.
     */
    brand: string
    /** Body text, and the dark bands (the footer, the photo hero). */
    ink: string
    /** The page's ground. */
    paper: string
    /** Cards, fields and the booking card. */
    surface: string
    /** Secondary text: intros, captions, labels. */
    muted: string
    /** The quietest text: placeholders, fine print. */
    faint: string
    /** Borders and dividers. */
    line: string
    /** Hairlines inside a surface, the progress track. */
    lineFaint: string
    /** "Open now". */
    open: string
  }
  /**
   * The corner radius in pixels, for cards, buttons, fields and photos. 0 is
   * square: precise and industrial, the default. 4–8 reads friendlier. Small
   * parts (chips, tags) get a fraction of it and large ones a multiple, so
   * the whole site stays in proportion. Round dots stay round at any value.
   */
  radius: number
  /**
   * The texture behind the hero and in the footer:
   *   none     plain
   *   grid     a faint blueprint grid, technical
   *   tread    a tire-tread pattern
   *   checker  a racing-flag checker, the loudest
   */
  motif: Motif
  /** The shop's name set huge across the foot of the page, always on one line. */
  footerWordmark: boolean
  /** A small US flag beside the copyright line, at the foot of every page. */
  flag: boolean
}

export const design: Design = {
  colors: {
    brand: '#C8102E',
    ink: '#17202B',
    paper: '#F3F4F5',
    surface: '#FFFFFF',
    muted: '#4A5563',
    faint: '#626D79',
    line: '#D7DCE1',
    lineFaint: '#E6E9EC',
    open: '#1E7F4F',
  },
  radius: 0,
  motif: 'none',
  footerWordmark: false,
  flag: false,
}
