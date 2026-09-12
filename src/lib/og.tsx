import { business } from '@/config/business'
import { design } from '@/config/design'
import { bodyFont, displayFont } from '@/config/fonts'
import { ImageResponse } from 'next/og'
import { OG_SIZE, ogAlt } from './seo'

/**
 * The card a link shows when it is shared: in a text, on Facebook, in Slack,
 * on LinkedIn. Drawn from facts and the design tokens, so every page has one
 * the moment the site exists, in the shop's own colours and display face.
 *
 * A PNG at 1200 × 630, the size every network crops cleanly. Not a photo: the
 * shop's photos are WebP, which LinkedIn and some messengers refuse, and a
 * template's sample photos must never be passed off as the shop.
 */

export { OG_SIZE, OG_TYPE } from './seo'
export const OG_ALT = ogAlt()

/** The family name next/font was given in src/config/fonts.ts, e.g. "Barlow Condensed". */
const familyOf = (font: { style: { fontFamily: string } }) => font.style.fontFamily.match(/'([^']+)'/)?.[1] ?? null

/**
 * One weight of a Google font as a TrueType file, which is what the card
 * renderer reads (it cannot read WOFF2). Google serves TrueType to a request
 * with no browser user agent. Null when offline: the card then falls back to
 * the renderer's own face rather than failing the build.
 */
async function googleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}`).then((r) =>
      r.ok ? r.text() : ''
    )
    const url = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/)?.[1]
    return url ? await fetch(url).then((r) => (r.ok ? r.arrayBuffer() : null)) : null
  } catch {
    return null
  }
}

let fonts: Promise<{ name: string; data: ArrayBuffer; weight: 500 | 700; style: 'normal' }[]> | null = null
function loadFonts() {
  fonts ??= (async () => {
    const display = familyOf(displayFont)
    const body = familyOf(bodyFont)
    const [d, b] = await Promise.all([
      display ? googleFont(display, 700) : null,
      body ? googleFont(body, 500) : null,
    ])
    return [
      ...(d ? [{ name: 'Display', data: d, weight: 700 as const, style: 'normal' as const }] : []),
      ...(b ? [{ name: 'Body', data: b, weight: 500 as const, style: 'normal' as const }] : []),
    ]
  })()
  return fonts
}

/** Large for a short name, smaller as it grows, so any service fits in two lines. */
const titleSize = (text: string) => (text.length <= 16 ? 132 : text.length <= 26 ? 108 : text.length <= 40 ? 88 : 72)

export async function ogCard({
  title,
  subtitle,
  kicker = business.name,
}: {
  title: string
  subtitle?: string
  /** The small line above the title: the shop's name, unless the title already is. */
  kicker?: string
}): Promise<ImageResponse> {
  const loaded = await loadFonts()
  const host = new URL(business.siteUrl).hostname.replace(/^www\./, '')
  const { brand, ink } = design.colors

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: ink,
          color: '#FFFFFF',
          borderTop: `16px solid ${brand}`,
          padding: '64px 80px 60px',
          fontFamily: 'Body',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'Display',
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.72)',
          }}
        >
          {kicker}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Display',
              fontSize: titleSize(title),
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: -1,
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div style={{ display: 'flex', marginTop: 28, fontSize: 40, fontWeight: 500, color: 'rgba(255,255,255,0.82)' }}>{subtitle}</div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px solid rgba(255,255,255,0.18)',
            paddingTop: 28,
            fontSize: 34,
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex' }}>{business.phone}</div>
          <div style={{ display: 'flex', color: 'rgba(255,255,255,0.72)' }}>{host}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, ...(loaded.length ? { fonts: loaded } : {}) }
  )
}
