/**
 * The photo bento: which cell each photo gets, for however many a shop has.
 *
 * A real shop has anywhere from one photo to dozens, so the grid is composed
 * for each count from one to seven rather than stretched from a single
 * pattern. Every layout tiles its grid exactly, with no holes (the tests
 * replay the browser's placement to prove it), and the first photo always
 * gets the most room, so put the strongest one first.
 *
 * Phone: 2 columns. Desktop: 6 columns. Spans only, never fixed positions:
 * CSS grid places the tiles in order, which is what keeps it composable.
 * Class strings are written out whole so Tailwind can see them.
 */

export const BENTO_MAX = 7

const LAYOUTS: Record<number, { phone: string[]; desktop: string[]; rows: string }> = {
  1: {
    phone: ['col-span-2 row-span-2'],
    desktop: ['lg:col-span-6 lg:row-span-2'],
    rows: 'lg:auto-rows-[15rem]',
  },
  2: {
    phone: ['col-span-2 row-span-2', 'col-span-2 row-span-2'],
    desktop: ['lg:col-span-3 lg:row-span-2', 'lg:col-span-3 lg:row-span-2'],
    rows: 'lg:auto-rows-[14rem]',
  },
  3: {
    phone: ['col-span-2 row-span-2', 'col-span-1', 'col-span-1'],
    desktop: ['lg:col-span-4 lg:row-span-2', 'lg:col-span-2', 'lg:col-span-2'],
    rows: 'lg:auto-rows-[14rem]',
  },
  4: {
    // A brick: wide then narrow, narrow then wide. Tall rows keep the wide
    // tiles from turning into strips.
    phone: ['col-span-2 row-span-2', 'col-span-1', 'col-span-1', 'col-span-2'],
    desktop: ['lg:col-span-4', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-4'],
    rows: 'lg:auto-rows-[18rem]',
  },
  5: {
    phone: ['col-span-2 row-span-2', 'col-span-1', 'col-span-1', 'col-span-1', 'col-span-1'],
    desktop: ['lg:col-span-4 lg:row-span-2', 'lg:col-span-2', 'lg:col-span-2', 'lg:col-span-3', 'lg:col-span-3'],
    rows: 'lg:auto-rows-[14rem]',
  },
  6: {
    // The lead photo with two beside it, then three squares.
    phone: ['col-span-2 row-span-2', 'col-span-1', 'col-span-1', 'col-span-1 row-span-2', 'col-span-1', 'col-span-1'],
    desktop: [
      'lg:col-span-4 lg:row-span-2',
      'lg:col-span-2',
      'lg:col-span-2',
      'lg:col-span-2 lg:row-span-2',
      'lg:col-span-2 lg:row-span-2',
      'lg:col-span-2 lg:row-span-2',
    ],
    rows: 'lg:auto-rows-[12rem]',
  },
  7: {
    // The lead photo with two beside it; then a square, a stacked pair, and
    // a square. No tile is ever wider than about two to one.
    phone: [
      'col-span-2 row-span-2',
      'col-span-1',
      'col-span-1',
      'col-span-1 row-span-2',
      'col-span-1',
      'col-span-1',
      'col-span-2',
    ],
    desktop: [
      'lg:col-span-4 lg:row-span-2',
      'lg:col-span-2',
      'lg:col-span-2',
      'lg:col-span-2 lg:row-span-2',
      'lg:col-span-2',
      'lg:col-span-2 lg:row-span-2',
      'lg:col-span-2',
    ],
    rows: 'lg:auto-rows-[12rem]',
  },
}

/** Grid classes for the container, and one class string per tile, in order. */
export function bentoLayout(count: number): { grid: string; tiles: string[] } {
  const n = Math.min(Math.max(count, 0), BENTO_MAX)
  if (n === 0) return { grid: '', tiles: [] }
  const l = LAYOUTS[n]
  return {
    // No gaps: the photos meet edge to edge, one continuous wall.
    grid: `grid grid-cols-2 auto-rows-[9.5rem] gap-0 sm:auto-rows-[13rem] lg:grid-cols-6 ${l.rows}`,
    tiles: l.phone.map((p, i) => `${p} ${l.desktop[i]}`),
  }
}
