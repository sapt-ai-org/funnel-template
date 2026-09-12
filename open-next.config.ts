import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue'
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache'
import { softTagFilter, withFilter } from '@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter'

/**
 * How the site is cached on Cloudflare. The bindings each part needs are in
 * wrangler.jsonc, and `scripts/init-project.ts` writes the same set.
 *
 * - incrementalCache: every built page and every Sapt read lives in R2
 *   (NEXT_INC_CACHE_R2_BUCKET). A visitor gets the stored page; nothing asks
 *   Sapt on their behalf.
 * - queue: a page older than its `revalidate` is still served at once, and a
 *   Durable Object (NEXT_CACHE_DO_QUEUE) rebuilds it in the background, once,
 *   however many visitors arrive while it works.
 * - tagCache: where /api/revalidate records that a `cms:<type>` tag changed,
 *   so every page built from that type is rebuilt on its next visit. Without
 *   one, OpenNext drops `revalidateTag` silently and an edit waits for the
 *   timer. A Durable Object (NEXT_TAG_CACHE_DO_SHARDED) needs nothing
 *   provisioned. The site never calls `revalidatePath`, so Next's implicit
 *   path tags are filtered out and each page view checks one shard.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
  tagCache: withFilter({
    tagCache: doShardedTagCache({ baseShardSize: 1 }),
    filterFn: softTagFilter,
  }),
})
