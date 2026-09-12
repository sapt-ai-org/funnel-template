/**
 * Init Project Script
 *
 * Run by the orchestrator inside a checkout of this repo, immediately before it
 * is pushed to the client's new repository. It does three things:
 *
 *   1. Stamps `wrangler.jsonc` with a project-specific Worker name (and, when
 *      given, a custom route).
 *   2. Removes the handful of files that exist only to guard the template
 *      itself and have no business in a client repo.
 *   3. Stamps the client's real colors (src/config/design.ts), fonts
 *      (src/config/fonts.ts), logo, and brand name into the checkout,
 *      replacing the template's placeholder defaults.
 *
 * There is one template. The multi-template gallery and its TEMPLATE_ID
 * selection were removed: a shop site and a clinic site differ by content and
 * branding, not by layout, and carrying two layouts meant every change had to
 * be made and reviewed twice.
 *
 * Environment variables:
 * - PROJECT_SLUG   Kebab-case identifier → Worker name "{slug}-landing"
 * - ROUTE_PATTERN  (optional) custom domain route, e.g. "site.example.com/*"
 * - ROUTE_ZONE_ID  (optional) Cloudflare zone id for the route
 * - PROJECT_NAME   (optional) client brand name, stamped into `funnel.ts`
 * - BRANDING_JSON  (optional) JSON `BrandingPayload` (colors/fonts/logo) from
 *                  the provisioning workflow. Empty or unparseable means:
 *                  change nothing and keep the template's defaults — a
 *                  branding problem must never fail provisioning.
 */

import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'
import { isHex } from '../src/lib/color'

const DESIGN_CONFIG_PATH = 'src/config/design.ts'
const FONTS_CONFIG_PATH = 'src/config/fonts.ts'
const FUNNEL_CONFIG_PATH = 'src/config/funnel.ts'
const PUBLIC_DIR = 'public'

/** Exists only to guard the template itself; no business in a client repo. */
const TEMPLATE_ONLY_PATHS = [
  // A real client's real phone number is not a leak; this guard is template-only.
  'src/config/placeholder.test.ts',
]

/**
 * The Worker config for one client: the template's wrangler.jsonc with the
 * client's names. The cache bindings are the ones open-next.config.ts reads,
 * and WORKER_SELF_REFERENCE must name the Worker itself, so both come from
 * the one `workerName`.
 */
export function wranglerConfig(
  workerName: string,
  route?: { pattern: string; zoneId: string }
): Record<string, unknown> {
  return {
    $schema: 'node_modules/wrangler/config-schema.json',
    name: workerName,
    main: '.open-next/worker.js',
    compatibility_date: '2026-08-01',
    compatibility_flags: ['nodejs_compat', 'global_fetch_strictly_public'],
    build: { command: 'pnpm exec opennextjs-cloudflare build' },
    assets: { directory: '.open-next/assets', binding: 'ASSETS' },
    observability: { enabled: true },
    services: [{ binding: 'WORKER_SELF_REFERENCE', service: workerName }],
    // R2 names stop at 63 characters, six fewer than a Worker name leaves room for.
    r2_buckets: [{ binding: 'NEXT_INC_CACHE_R2_BUCKET', bucket_name: `${workerName.slice(0, 57).replace(/-+$/, '')}-cache` }],
    durable_objects: {
      bindings: [
        { name: 'NEXT_CACHE_DO_QUEUE', class_name: 'DOQueueHandler' },
        { name: 'NEXT_TAG_CACHE_DO_SHARDED', class_name: 'DOShardedTagCache' },
      ],
    },
    migrations: [{ tag: 'v1', new_sqlite_classes: ['DOQueueHandler', 'DOShardedTagCache'] }],
    ...(route ? { routes: [{ pattern: route.pattern, zone_id: route.zoneId }] } : {}),
  }
}

function writeWrangler(root: string, projectSlug: string): void {
  const routePattern = process.env.ROUTE_PATTERN
  const routeZoneId = process.env.ROUTE_ZONE_ID
  const workerName = `${projectSlug}-landing`
  const config = wranglerConfig(
    workerName,
    routePattern && routeZoneId ? { pattern: routePattern, zoneId: routeZoneId } : undefined
  )

  fs.writeFileSync(path.join(root, 'wrangler.jsonc'), JSON.stringify(config, null, 2))
  console.log(`Generated wrangler.jsonc for "${workerName}"`)
}

/* ════════════════════════════════════════════════════════════════════════════
   BRANDING — stamps client colors, fonts, logo, and brand name over the
   template's placeholder defaults. Best-effort: anything that goes wrong here
   is logged and skipped, never thrown past `applyBranding`.
   ════════════════════════════════════════════════════════════════════════════ */

interface BrandingColor {
  hex: string
  purpose?: 'primary' | 'secondary' | 'accent' | 'background' | 'text' | 'other'
}

interface BrandingFont {
  name: string
  type: string
  source: string
  googleFontFamily?: string
  weights?: number[]
}

interface BrandingPayload {
  colors: BrandingColor[]
  fonts: BrandingFont[]
  logo?: { url: string; alt?: string }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Rewrites a single- or double-quoted string property (`key: "…",` or
 * `key: '…',`) in place, preserving whichever quote style was already used
 * and escaping that quote character (and backslashes) in the new value.
 */
export function setSpecString(source: string, key: string, value: string): string {
  const pattern = new RegExp(`(\\b${escapeRegExp(key)}:\\s*)(['"])((?:\\\\.|(?!\\2).)*)\\2`)
  const match = source.match(pattern)
  if (!match) {
    throw new Error(`Spec property "${key}" not found`)
  }
  const quote = match[2]
  const escaped = value.replace(new RegExp(`[\\\\${quote}]`, 'g'), (c) => `\\${c}`)
  return source.replace(pattern, `$1${quote}${escaped}${quote}`)
}

const LOGO_NULL_LINE = /logo: null,/
const LOGO_SET_LINE = /logo: \{ src: '(?:\\.|[^'\\])*', alt: '(?:\\.|[^'\\])*' \},/

/** Rewrites the `logo: null,` line in the spec to a populated logo, or back to `null`. */
export function setSpecLogo(source: string, logo: { src: string; alt: string } | null): string {
  const escape = (v: string) => v.replace(/['\\]/g, (c) => `\\${c}`)
  const replacement = logo
    ? `logo: { src: '${escape(logo.src)}', alt: '${escape(logo.alt)}' },`
    : 'logo: null,'

  if (LOGO_NULL_LINE.test(source)) {
    return source.replace(LOGO_NULL_LINE, replacement)
  }
  if (LOGO_SET_LINE.test(source)) {
    return source.replace(LOGO_SET_LINE, replacement)
  }
  throw new Error('No `logo:` line found in spec source')
}

/** Best-effort parse of `BRANDING_JSON`. Empty or unparseable → null (change nothing). */
function parseBranding(json: string): BrandingPayload | null {
  if (!json.trim()) return null
  try {
    const parsed: unknown = JSON.parse(json)
    if (!parsed || typeof parsed !== 'object') return null
    const p = parsed as Partial<BrandingPayload>
    return {
      colors: Array.isArray(p.colors) ? p.colors : [],
      fonts: Array.isArray(p.fonts) ? p.fonts : [],
      logo: p.logo,
    }
  } catch (err) {
    console.warn(
      `init-project: BRANDING_JSON is not valid JSON, skipping branding (${(err as Error).message})`
    )
    return null
  }
}

/**
 * The client's colours, into src/config/design.ts: the primary colour becomes
 * `brand` (the site generates its light-to-dark ramp from it), the background
 * `paper` and the text colour `ink`. The secondary colour has nowhere to go:
 * the site spends colour on actions only. A value that is not a six-digit hex
 * is skipped and the template's colour kept.
 */
export function applyColors(designSource: string, colors: BrandingColor[]): string {
  const pick = (purpose: BrandingColor['purpose']) => colors.find((c) => c.purpose === purpose)?.hex
  let result = designSource
  for (const [key, hex] of [
    ['brand', pick('primary')],
    ['paper', pick('background')],
    ['ink', pick('text')],
  ] as const) {
    if (!hex) continue
    if (!isHex(hex)) {
      console.warn(`init-project: "${hex}" is not a hex colour, keeping the template's ${key}`)
      continue
    }
    result = setSpecString(result, key, `#${hex.trim().replace(/^#/, '').toUpperCase()}`)
  }
  return result
}

/** One face as src/config/fonts.ts loads it: a Google family, and its weights (null for a variable font). */
export interface FontFace {
  family: string
  weights: string[] | null
}

/** The template's faces, as src/config/fonts.ts ships. */
export const DEFAULT_FONTS: { body: FontFace; display: FontFace } = {
  body: { family: 'Barlow', weights: ['400', '500', '600'] },
  display: { family: 'Barlow Condensed', weights: ['600', '700'] },
}

/** The weights each face is set in across the site. */
const ROLE_WEIGHTS = { body: [400, 500, 600], display: [600, 700] }

type FontCatalog = Record<string, { weights: string[]; subsets: string[] }>

/**
 * next/font's own list of Google families. It fails the build on a family it
 * does not know, so a brand font is only written when it is in here.
 */
export function loadFontCatalog(root: string): FontCatalog | null {
  try {
    return createRequire(path.join(root, 'package.json'))(
      'next/dist/compiled/@next/font/dist/google/font-data.json'
    ) as FontCatalog
  } catch {
    return null
  }
}

/** `family` in the weights `role` needs (the nearest it has), or null when next/font cannot load it. */
export function resolveFont(family: string, role: keyof typeof ROLE_WEIGHTS, catalog: FontCatalog): FontFace | null {
  const entry = catalog[family]
  if (!entry || !entry.subsets.includes('latin')) return null
  if (entry.weights.includes('variable')) return { family, weights: null }
  const available = entry.weights.map(Number).filter((w) => Number.isFinite(w))
  if (!available.length) return null
  const nearest = (want: number) => available.reduce((a, b) => (Math.abs(b - want) < Math.abs(a - want) ? b : a))
  return { family, weights: [...new Set(ROLE_WEIGHTS[role].map(nearest))].sort((a, b) => a - b).map(String) }
}

/** A family's export name in next/font/google: "Barlow Condensed" is Barlow_Condensed. */
const fontExport = (family: string) => family.trim().replace(/[^A-Za-z0-9]+/g, '_')

/** The body of src/config/fonts.ts for two faces: everything from the import down. */
function fontsModuleBody(body: FontFace, display: FontFace): string {
  const call = (name: string, face: FontFace, variable: string) =>
    [
      `export const ${name} = ${fontExport(face.family)}({`,
      `  subsets: ['latin'],`,
      ...(face.weights ? [`  weight: [${face.weights.map((w) => `'${w}'`).join(', ')}],`] : []),
      `  variable: '${variable}',`,
      `  display: 'swap',`,
      `})`,
    ].join('\n')
  const imports = [...new Set([fontExport(body.family), fontExport(display.family)])].join(', ')
  return [
    `import { ${imports} } from 'next/font/google'`,
    call('bodyFont', body, '--font-body'),
    call('displayFont', display, '--font-heading'),
  ].join('\n\n') + '\n'
}

/**
 * The client's fonts, into src/config/fonts.ts: the primary font becomes the
 * body face and the secondary one (or the primary again) the display face.
 * Self-hosted by next/font like the template's own, so a brand font costs no
 * request to Google. A family next/font cannot load keeps the template's
 * face for that role. The file's header comment is kept as it is.
 */
export function applyFonts(fontsSource: string, fonts: BrandingFont[], catalog: FontCatalog | null): string {
  const primary = fonts.find((f) => f.type === 'primary')
  const secondary = fonts.find((f) => f.type === 'secondary') ?? primary
  const face = (font: BrandingFont | undefined, role: keyof typeof ROLE_WEIGHTS): FontFace | null => {
    const family = (font?.googleFontFamily || font?.name || '').trim()
    if (!family) return null
    const resolved = catalog ? resolveFont(family, role, catalog) : null
    if (!resolved) console.warn(`init-project: next/font cannot load "${family}", keeping the template's ${role} face`)
    return resolved
  }
  const body = face(primary, 'body')
  const display = face(secondary, 'display')
  if (!body && !display) return fontsSource

  const start = fontsSource.indexOf("import {")
  if (start === -1) throw new Error('No font import found in fonts.ts')
  return fontsSource.slice(0, start) + fontsModuleBody(body ?? DEFAULT_FONTS.body, display ?? DEFAULT_FONTS.display)
}

const LOGO_EXTENSIONS = ['svg', 'png', 'jpg', 'webp'] as const

function inferLogoExtension(url: string, contentType: string | null): string | null {
  try {
    const urlExt = path.extname(new URL(url).pathname).replace(/^\./, '').toLowerCase()
    const normalized = urlExt === 'jpeg' ? 'jpg' : urlExt
    if ((LOGO_EXTENSIONS as readonly string[]).includes(normalized)) return normalized
  } catch {
    // fall through to content-type sniffing
  }
  if (contentType) {
    if (contentType.includes('svg')) return 'svg'
    if (contentType.includes('png')) return 'png'
    if (contentType.includes('webp')) return 'webp'
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg'
  }
  return null
}

/** Downloads the branding logo into `public/logo.<ext>`. Returns null on any failure — never throws. */
async function downloadLogo(root: string, url: string): Promise<{ src: string } | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`init-project: logo fetch failed (${response.status}) for ${url}`)
      return null
    }
    const contentType = response.headers.get('content-type')
    const ext = inferLogoExtension(url, contentType)
    if (!ext) {
      console.warn(`init-project: could not determine an image extension for logo ${url}`)
      return null
    }
    const publicDir = path.join(root, PUBLIC_DIR)
    fs.mkdirSync(publicDir, { recursive: true })
    const buffer = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(path.join(publicDir, `logo.${ext}`), buffer)
    return { src: `/logo.${ext}` }
  } catch (err) {
    console.warn(`init-project: logo download threw, leaving logo null (${(err as Error).message})`)
    return null
  }
}

async function applyBranding(root: string, branding: BrandingPayload): Promise<void> {
  const designPath = path.join(root, DESIGN_CONFIG_PATH)
  fs.writeFileSync(designPath, applyColors(fs.readFileSync(designPath, 'utf8'), branding.colors))

  const fontsPath = path.join(root, FONTS_CONFIG_PATH)
  fs.writeFileSync(fontsPath, applyFonts(fs.readFileSync(fontsPath, 'utf8'), branding.fonts, loadFontCatalog(root)))

  const funnelPath = path.join(root, FUNNEL_CONFIG_PATH)
  let funnel = fs.readFileSync(funnelPath, 'utf8')

  const projectName = process.env.PROJECT_NAME

  if (branding.logo?.url) {
    const logo = await downloadLogo(root, branding.logo.url)
    if (logo) {
      const alt = branding.logo.alt || projectName || 'Logo'
      funnel = setSpecLogo(funnel, { src: logo.src, alt })
    } else {
      console.warn(`init-project: logo unavailable, leaving logo: null`)
    }
  }

  if (projectName) {
    funnel = setSpecString(funnel, 'brandName', projectName)
  }

  fs.writeFileSync(funnelPath, funnel)
  console.log('init-project: applied branding')
}

// Guard so importing this module from a test does not run the script.
if (process.env.VITEST === 'true') {
  console.log('init-project: skipped (VITEST=true — module imported by a test)')
} else {
  const root = process.cwd()

  writeWrangler(root, process.env.PROJECT_SLUG || 'sapt')

  for (const rel of TEMPLATE_ONLY_PATHS) {
    fs.rmSync(path.join(root, rel), { recursive: true, force: true })
  }
  console.log(`Removed ${TEMPLATE_ONLY_PATHS.length} template-only path(s)`)

  // Branding is best-effort: a bad or missing payload must never fail
  // provisioning — the site must still ship with the template's defaults.
  const branding = parseBranding(process.env.BRANDING_JSON || '')
  if (branding) {
    try {
      await applyBranding(root, branding)
    } catch (err) {
      console.warn(`init-project: branding failed, keeping template defaults (${(err as Error).message})`)
    }
  } else {
    console.log('init-project: no branding provided, keeping template defaults')
  }
}
