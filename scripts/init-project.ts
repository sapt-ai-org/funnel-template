/**
 * Init Project Script
 *
 * Run by the orchestrator inside a checkout of this repo, immediately before it
 * is pushed to the client's new repository. It does three things:
 *
 *   1. Stamps `wrangler.jsonc` with a project-specific Worker name (and, when
 *      given, a custom route).
 *   2. Prunes the template library down to the one template that was picked,
 *      and removes everything that only exists to serve the preview gallery.
 *   3. Stamps the client's real colors, fonts, logo, and brand name into the
 *      checkout, replacing the template's placeholder defaults.
 *
 * Environment variables:
 * - PROJECT_SLUG   Kebab-case identifier → Worker name "{slug}-landing"
 * - TEMPLATE_ID    Which template to keep. Defaults to "aurora".
 * - ROUTE_PATTERN  (optional) custom domain route, e.g. "site.example.com/*"
 * - ROUTE_ZONE_ID  (optional) Cloudflare zone id for the route
 * - PROJECT_NAME   (optional) client brand name, stamped into `funnel.ts`
 * - BRANDING_JSON  (optional) JSON `BrandingPayload` (colors/fonts/logo) from
 *                  the provisioning workflow. Empty or unparseable means:
 *                  change nothing and keep the template's defaults — a
 *                  branding problem must never fail provisioning.
 */

import fs from 'fs'
import path from 'path'

const TEMPLATES_DIR = 'src/templates'
const PAGE_PATH = 'src/app/page.tsx'
const GLOBALS_CSS_PATH = 'src/app/globals.css'
const FUNNEL_CONFIG_PATH = 'src/config/funnel.ts'
const PUBLIC_DIR = 'public'

/** Exists only to serve the preview gallery or guard the template itself. */
const GALLERY_ONLY_PATHS = [
  'src/templates/registry.ts',
  'src/app/preview',
  // A real client's real phone number is not a leak; this guard is template-only.
  'src/config/placeholder.test.ts',
]

const LANDING_IMPORT =
  /^(\s*import\s*\{\s*Landing\s*\}\s*from\s*')@\/templates\/[^/]+\/Landing(';?\s*)$/m

/**
 * Repoint `page.tsx`'s Landing import at `templateId`. Throws rather than
 * returning the input unchanged when nothing matches — silently shipping the
 * wrong template is the worst failure available here.
 */
export function rewriteLandingImport(source: string, templateId: string): string {
  if (!LANDING_IMPORT.test(source)) {
    throw new Error(
      `No Landing import found in ${PAGE_PATH}; cannot select template "${templateId}"`
    )
  }
  return source.replace(LANDING_IMPORT, `$1@/templates/${templateId}/Landing$2`)
}

/** Repo-relative paths to delete so only `chosenId` survives. */
export function prunePaths(allTemplateIds: string[], chosenId: string): string[] {
  if (!allTemplateIds.includes(chosenId)) {
    throw new Error(
      `Cannot initialize: unknown template "${chosenId}" (have: ${allTemplateIds.join(', ')})`
    )
  }
  return [
    ...allTemplateIds.filter((id) => id !== chosenId).map((id) => `${TEMPLATES_DIR}/${id}`),
    ...GALLERY_ONLY_PATHS,
  ]
}

function listTemplateIds(root: string): string[] {
  return fs
    .readdirSync(path.join(root, TEMPLATES_DIR), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
}

function writeWrangler(root: string, projectSlug: string): void {
  const routePattern = process.env.ROUTE_PATTERN
  const routeZoneId = process.env.ROUTE_ZONE_ID

  const wranglerConfig: Record<string, unknown> = {
    $schema: 'node_modules/wrangler/config-schema.json',
    name: `${projectSlug}-landing`,
    main: '.open-next/worker.js',
    compatibility_date: '2025-03-01',
    compatibility_flags: ['nodejs_compat', 'global_fetch_strictly_public'],
    assets: { directory: '.open-next/assets', binding: 'ASSETS' },
  }

  if (routePattern && routeZoneId) {
    wranglerConfig.routes = [{ pattern: routePattern, zone_id: routeZoneId }]
  }

  fs.writeFileSync(path.join(root, 'wrangler.jsonc'), JSON.stringify(wranglerConfig, null, 2))
  console.log(`Generated wrangler.jsonc for "${projectSlug}-landing"`)
}

function selectTemplate(root: string, templateId: string): void {
  const toDelete = prunePaths(listTemplateIds(root), templateId) // throws on unknown id

  const pagePath = path.join(root, PAGE_PATH)
  fs.writeFileSync(pagePath, rewriteLandingImport(fs.readFileSync(pagePath, 'utf8'), templateId))

  for (const rel of toDelete) {
    fs.rmSync(path.join(root, rel), { recursive: true, force: true })
  }

  console.log(`Selected template "${templateId}"; removed ${toDelete.length} path(s)`)
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

/** Ratios the ramp is generated with — derived from the original hand-picked ramp. */
const RAMP_MIX: Record<number, { toward: 'white' | 'black'; amount: number } | null> = {
  50: { toward: 'white', amount: 0.92 },
  100: { toward: 'white', amount: 0.85 },
  200: { toward: 'white', amount: 0.7 },
  300: { toward: 'white', amount: 0.5 },
  400: { toward: 'white', amount: 0.25 },
  500: null, // the base hex itself
  600: { toward: 'black', amount: 0.12 },
  700: { toward: 'black', amount: 0.25 },
  800: { toward: 'black', amount: 0.42 },
  900: { toward: 'black', amount: 0.55 },
}

const PRIMARY_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
const ACCENT_STEPS = [50, 100, 200, 300, 400, 500, 600]

function parseHex(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Invalid hex color "${hex}"`)
  }
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  }
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
  const part = (n: number) => clamp(n).toString(16).padStart(2, '0')
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase()
}

/** Mixes `hex` toward white or black by `amount` (0 = unchanged, 1 = fully `toward`). */
export function mixHex(hex: string, toward: 'white' | 'black', amount: number): string {
  const target = toward === 'white' ? 255 : 0
  const { r, g, b } = parseHex(hex)
  const mix = (c: number) => c + (target - c) * amount
  return toHex(mix(r), mix(g), mix(b))
}

/** Builds a shade ramp for `hex` at the requested `steps`, using the shared mix ratios. */
export function buildRamp(hex: string, steps: number[]): Record<number, string> {
  const ramp: Record<number, string> = {}
  for (const step of steps) {
    const rule = RAMP_MIX[step]
    ramp[step] = rule ? mixHex(hex, rule.toward, rule.amount) : hex
  }
  return ramp
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Replaces the value of an existing `--varName: …;` CSS declaration, leaving
 * anything after the semicolon (e.g. a trailing comment) untouched. Throws
 * rather than no-opping when the variable doesn't exist, consistent with
 * `rewriteLandingImport` — silently keeping a stale value is the worst outcome.
 */
export function setCssVar(source: string, varName: string, value: string): string {
  const pattern = new RegExp(`(--${escapeRegExp(varName)}\\s*:\\s*)([^;]+)(;)`)
  if (!pattern.test(source)) {
    throw new Error(`CSS variable "--${varName}" not found`)
  }
  return source.replace(pattern, (_match, prefix: string, _old: string, suffix: string) =>
    `${prefix}${value}${suffix}`
  )
}

function getCssVarValue(source: string, varName: string): string {
  const pattern = new RegExp(`--${escapeRegExp(varName)}\\s*:\\s*([^;]+);`)
  const match = source.match(pattern)
  if (!match) {
    throw new Error(`CSS variable "--${varName}" not found`)
  }
  return match[1].trim()
}

/** Replaces only the leading quoted family name in a font-stack value, keeping the fallback chain. */
function replaceLeadingFontFamily(value: string, family: string): string {
  return value.replace(/^'[^']*'/, `'${family}'`)
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

function applyColors(css: string, colors: BrandingColor[]): string {
  let result = css
  const primary = colors.find((c) => c.purpose === 'primary')
  const accent =
    colors.find((c) => c.purpose === 'accent') ?? colors.find((c) => c.purpose === 'secondary')
  const background = colors.find((c) => c.purpose === 'background')
  const text = colors.find((c) => c.purpose === 'text')

  if (primary) {
    const ramp = buildRamp(primary.hex, PRIMARY_STEPS)
    for (const step of PRIMARY_STEPS) result = setCssVar(result, `color-primary-${step}`, ramp[step])
  }
  if (accent) {
    const ramp = buildRamp(accent.hex, ACCENT_STEPS)
    for (const step of ACCENT_STEPS) result = setCssVar(result, `color-accent-${step}`, ramp[step])
  }
  if (background) result = setCssVar(result, 'bg', background.hex)
  if (text) result = setCssVar(result, 'text', text.hex)

  return result
}

function googleFontImportLine(font: BrandingFont): string {
  const family = (font.googleFontFamily ?? '').trim().replace(/\s+/g, '+')
  const weights = font.weights?.length ? `:wght@${font.weights.join(';')}` : ''
  return `@import url('https://fonts.googleapis.com/css2?family=${family}${weights}&display=swap');`
}

function applyFonts(css: string, fonts: BrandingFont[]): string {
  let result = css
  const primaryFont = fonts.find((f) => f.type === 'primary')
  const displayFont = fonts.find((f) => f.type === 'secondary') ?? primaryFont

  if (primaryFont) {
    const current = getCssVarValue(result, 'font-sans')
    result = setCssVar(result, 'font-sans', replaceLeadingFontFamily(current, primaryFont.name))
  }
  if (displayFont) {
    const current = getCssVarValue(result, 'font-display')
    result = setCssVar(result, 'font-display', replaceLeadingFontFamily(current, displayFont.name))
  }

  const importLines = fonts
    .filter((f) => f.source === 'google' && f.googleFontFamily)
    .map(googleFontImportLine)
  if (importLines.length > 0) {
    result = result.replace(
      "@import 'tailwindcss';",
      `@import 'tailwindcss';\n${importLines.join('\n')}`
    )
  }

  return result
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
  const cssPath = path.join(root, GLOBALS_CSS_PATH)
  let css = fs.readFileSync(cssPath, 'utf8')
  css = applyColors(css, branding.colors)
  css = applyFonts(css, branding.fonts)
  fs.writeFileSync(cssPath, css)

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
  const templateId = process.env.TEMPLATE_ID || 'aurora'

  // Validate BEFORE any write. An unknown template id must fail with the
  // checkout untouched, not with wrangler.jsonc already stamped for a client.
  prunePaths(listTemplateIds(root), templateId)

  writeWrangler(root, process.env.PROJECT_SLUG || 'sapt')
  selectTemplate(root, templateId)

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
