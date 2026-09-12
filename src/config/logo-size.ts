/**
 * Optical sizing for a row of logos.
 *
 * Logos of the same height do not look the same size: a long wordmark at 48px
 * tall dwarfs a round seal at 48px. Equal area is the usual correction, but
 * taken strictly it shrinks a wordmark until its small print cannot be read.
 * So height falls with the square root of the aspect a little more gently
 * than equal area would have it: height = base × aspect^−0.4 (equal area is
 * −0.5). A seal stays square, a wordmark runs long and low but stays legible,
 * and the caps stop anything towering or sprawling.
 */
export function logoBox(
  aspect: number,
  { base = 53, falloff = 0.4, maxHeight = 60, maxWidth = 150 }: { base?: number; falloff?: number; maxHeight?: number; maxWidth?: number } = {}
): { width: number; height: number } {
  let height = base * Math.pow(aspect, -falloff)
  let width = height * aspect
  if (height > maxHeight) {
    height = maxHeight
    width = height * aspect
  }
  if (width > maxWidth) {
    width = maxWidth
    height = width / aspect
  }
  return { width: Math.round(width), height: Math.round(height) }
}
