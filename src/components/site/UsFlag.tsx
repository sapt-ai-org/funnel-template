/**
 * The US flag, drawn to the official proportions (Executive Order 10834): a
 * 1.9 : 1 fly, thirteen stripes, a canton seven stripes deep and 0.76 of the
 * hoist wide, holding fifty stars in nine staggered rows. The viewBox is the
 * hoist at 130 units, one stripe per 10, so every figure below is exact.
 * Switched on and off with `design.flag`.
 */

const HOIST = 130
const FLY = HOIST * 1.9
const STRIPE = HOIST / 13
const CANTON = { width: HOIST * 0.76, height: STRIPE * 7 }
/** Star spacing across (G) and down (F), and the star's radius (K / 2). */
const G = CANTON.width / 12
const F = CANTON.height / 10
const STAR_RADIUS = (HOIST * 0.0616) / 2

/** A five-pointed star of radius 1, point up: outer and inner vertices alternating. */
const UNIT_STAR = [
  [0, -1], [0.2245, -0.309], [0.951, -0.309], [0.363, 0.118], [0.588, 0.809],
  [0, 0.382], [-0.588, 0.809], [-0.363, 0.118], [-0.951, -0.309], [-0.2245, -0.309],
]
const STAR_PATH = `M${UNIT_STAR.map(([x, y]) => `${(x * STAR_RADIUS).toFixed(2)} ${(y * STAR_RADIUS).toFixed(2)}`).join('L')}Z`

/** Nine rows: six stars on the odd rows, five on the even, offset half a step. */
const STARS = Array.from({ length: 9 }, (_, row) => {
  const odd = row % 2 === 0
  return Array.from({ length: odd ? 6 : 5 }, (_, i) => ({ x: G * (odd ? 2 * i + 1 : 2 * i + 2), y: F * (row + 1) }))
}).flat()

const RED_STRIPES = Array.from({ length: 7 }, (_, i) => `M0 ${i * 2 * STRIPE}h${FLY}v${STRIPE}H0z`).join('')

export function UsFlag({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${FLY} ${HOIST}`} role="img" aria-label="United States flag" className={className}>
      <defs>
        <path id="us-flag-star" d={STAR_PATH} fill="#FFFFFF" />
      </defs>
      <rect width={FLY} height={HOIST} fill="#FFFFFF" />
      <path d={RED_STRIPES} fill="#B22234" />
      <rect width={CANTON.width} height={CANTON.height} fill="#3C3B6E" />
      {STARS.map((s) => (
        <use key={`${s.x}-${s.y}`} href="#us-flag-star" x={s.x.toFixed(2)} y={s.y.toFixed(2)} />
      ))}
    </svg>
  )
}
