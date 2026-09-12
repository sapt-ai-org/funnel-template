import type { MetadataRoute } from 'next'
import { business } from '@/config/business'

/**
 * Every crawler, every path. A local shop has nothing to hide from search
 * engines or AI assistants and everything to gain: being the page an
 * assistant quotes for "mechanic near me" is the same win as the map pack.
 *
 * The AI crawlers are also named one by one. `*` already lets them in, but
 * some site audits and some bots look for their own name, and a named group
 * leaves no doubt the shop wants them.
 *
 * Nothing is closed here, not even the untouched template: a page kept out of
 * the index is kept out by its noindex tag (the template, /review), and a
 * crawler blocked by robots.txt never sees that tag.
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Amazonbot',
  'meta-externalagent',
  'DuckAssistBot',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }, ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' }))],
    sitemap: `${business.siteUrl.replace(/\/+$/, '')}/sitemap.xml`,
  }
}
