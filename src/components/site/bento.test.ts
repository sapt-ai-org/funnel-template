import { describe, expect, it } from 'vitest'
import { bentoLayout, BENTO_MAX } from './bento'

/** Replays CSS grid auto-placement (row flow) to check a layout tiles exactly. */
function place(spans: { c: number; r: number }[], cols: number) {
  const filled: boolean[][] = []
  const cell = (r: number, c: number) => (filled[r] ??= Array(cols).fill(false))[c]
  const fill = (r: number, c: number) => ((filled[r] ??= Array(cols).fill(false))[c] = true)
  let row = 0
  let col = 0
  for (const s of spans) {
    for (;;) {
      if (col + s.c > cols) {
        row++
        col = 0
        continue
      }
      let fits = true
      for (let dr = 0; dr < s.r; dr++) for (let dc = 0; dc < s.c; dc++) if (cell(row + dr, col + dc)) fits = false
      if (fits) break
      col++
    }
    for (let dr = 0; dr < s.r; dr++) for (let dc = 0; dc < s.c; dc++) fill(row + dr, col + dc)
    col += s.c
  }
  return filled
}

const spansOf = (classes: string[], prefix: '' | 'lg:') =>
  classes.map((cls) => {
    const tokens = cls.split(' ')
    const pick = (kind: 'col' | 'row') => {
      const hit = tokens.find((t) => t.startsWith(`${prefix}${kind}-span-`) && (prefix || !t.includes(':')))
      return hit ? Number(hit.split('-').pop()) : 1
    }
    return { c: pick('col'), r: pick('row') }
  })

describe('bentoLayout', () => {
  for (let n = 1; n <= BENTO_MAX; n++) {
    it(`tiles ${n} photo${n > 1 ? 's' : ''} with no holes, on a phone and a desktop`, () => {
      const layout = bentoLayout(n)
      expect(layout.tiles).toHaveLength(n)
      for (const [prefix, cols] of [['', 2], ['lg:', 6]] as const) {
        const grid = place(spansOf(layout.tiles, prefix), cols)
        for (const row of grid) expect(row.every(Boolean)).toBe(true)
      }
    })
  }

  it('never crops a photo into a strip: no desktop tile wider than 3 to 1', () => {
    // Desktop cell geometry: 6 columns across ~1120px with 16px gaps, rows as set.
    const colWidth = (1120 - 5 * 16) / 6
    for (let n = 1; n <= BENTO_MAX; n++) {
      const { grid, tiles } = bentoLayout(n)
      const rowRem = Number(grid.match(/lg:auto-rows-\[(\d+)rem\]/)![1])
      for (const { c, r } of spansOf(tiles, 'lg:')) {
        const w = c * colWidth + (c - 1) * 16
        const h = r * rowRem * 16 + (r - 1) * 16
        expect(w / h, `${n} photos: a ${c}x${r} tile`).toBeLessThanOrEqual(3)
      }
    }
  })

  it('gives the first photo the most room', () => {
    const [first] = spansOf(bentoLayout(7).tiles, 'lg:')
    expect(first.c * first.r).toBe(Math.max(...spansOf(bentoLayout(7).tiles, 'lg:').map((s) => s.c * s.r)))
  })

  it('shows at most the photos it has room for', () => {
    expect(bentoLayout(12).tiles).toHaveLength(BENTO_MAX)
    expect(bentoLayout(0).tiles).toHaveLength(0)
  })
})
