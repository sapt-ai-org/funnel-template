/**
 * ════════════════════════════════════════════════════════════════════════════
 *  THE TYPE — the site's two typefaces.
 * ────────────────────────────────────────────────────────────────────────────
 *  body     paragraphs, answers, form fields
 *  display  headlines, buttons and the footer wordmark, set in capitals
 *
 *  To change one, swap its name in the import and in its call below. Any
 *  family on fonts.google.com works; spaces become underscores ("Open Sans"
 *  is Open_Sans). A variable font needs no `weight` line. The files are
 *  downloaded at build and served from this site with a size-matched
 *  fallback, so a font costs no request to Google and nothing moves on load.
 *  `init-project` writes this file from the client's Sapt branding.
 * ════════════════════════════════════════════════════════════════════════════
 */

import { Barlow, Barlow_Condensed } from 'next/font/google'

export const bodyFont = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

export const displayFont = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-heading',
  display: 'swap',
})
