import { describe, expect, it } from 'vitest'
import { galleryPhotos, heroPhoto, portraitPhoto, storefrontPhoto } from './images'

describe('the photo plan', () => {
  it('puts a photo behind the hero, and never a placeholder', () => {
    const hero = heroPhoto()
    expect(hero).not.toBeNull()
    expect(hero?.placeholder).toBe(false)
  })

  it('uses every photo once across the whole page', () => {
    const ids = [heroPhoto(), storefrontPhoto(), portraitPhoto(), ...galleryPhotos(7)]
      .filter((p) => p && !p.placeholder)
      .map((p) => p!.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
