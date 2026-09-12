import { Container, LinkCard, PageHead, Section, SiteShell } from '@/components/site'
import { business } from '@/config/business'
import { landingSpec as spec } from '@/config/funnel'
import { getArticles, postEyebrow } from '@/lib/cms'
import { collectionPageData } from '@/lib/schema'
import { fitTitle, joinFit, pageMetadata, town } from '@/lib/seo'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Built once and served from the cache; rebuilt when Sapt reports an edit (see
// src/lib/cms.ts). 300 is CMS_REVALIDATE_SECONDS: Next only reads a literal here.
export const revalidate = 300

export const metadata: Metadata = pageMetadata({
  title: fitTitle(spec.blog.title),
  description: joinFit(spec.blog.intro, `${business.name}, ${town()}.`),
  path: '/blog',
})

/** The shop's posts, newest first. */
export default async function BlogPage() {
  const posts = await getArticles()
  // No posts, no blog: an empty index is a thin page a crawler holds against the site.
  if (posts.length === 0) notFound()

  // The page's list in the markup too, so a crawler reads it as the index it is.
  const list = posts.map((p) => ({ name: p.title, path: `/blog/${p.slug}` }))
  const jsonLd = collectionPageData('/blog', spec.blog.title, list)
  return (
    <SiteShell jsonLd={jsonLd}>
      <Section tone="paper" className="pt-8 sm:pt-12">
        <Container>
          <PageHead crumbs={[{ href: '/', label: 'Home' }, { label: spec.blog.title }]} title={spec.blog.title} intro={spec.blog.intro} />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <LinkCard
                  href={`/blog/${post.slug}`}
                  photo={post.photo}
                  eyebrow={postEyebrow(post)}
                  title={post.title}
                  body={post.excerpt}
                  headingLevel={2}
                />
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </SiteShell>
  )
}
