import { describe, expect, it } from 'vitest'
import { logoBox } from './logo-size'

describe('logoBox', () => {
  it('keeps a seal square at the base size', () => {
    expect(logoBox(1)).toEqual({ width: 53, height: 53 })
  })

  it('lets a wordmark run long and low, but never so low its print is unreadable', () => {
    const carfax = logoBox(5.32)
    expect(carfax.height).toBeGreaterThanOrEqual(26)
    expect(carfax.width).toBeGreaterThan(carfax.height * 5)
  })

  it('gives a wordmark a little more presence than strict equal area would', () => {
    const seal = logoBox(1)
    const wordmark = logoBox(3.34)
    const ratio = (wordmark.width * wordmark.height) / (seal.width * seal.height)
    expect(ratio).toBeGreaterThan(1.1)
    expect(ratio).toBeLessThan(1.5)
  })

  it('caps the extremes so a very tall or very long mark cannot dominate the row', () => {
    expect(logoBox(0.5).height).toBe(60)
    expect(logoBox(8).width).toBe(150)
  })
})
