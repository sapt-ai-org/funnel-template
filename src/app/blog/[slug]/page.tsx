import { ArticleBody, Breadcrumbs, Container, Photo, Section, SiteShell, pageTitleClass } from '@/components/site'
import { business } from '@/config/business'
import { landingSpec as spec } from '@/config/funnel'
import { getArticle, getArticles, getServices, postEyebrow } from '@/lib/cms'
import { articlePageData } from '@/lib/schema'
import { fitTitle, joinFit, pageMetadata, town } from '@/lib/seo'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Built once and served from the cache; rebuilt when Sapt reports an edit (see
// src/lib/cms.ts). 300 is CMS_REVALIDATE_SECONDS: Next only reads a literal here.
export const revalidate = 300

/** Every post is built with the site. One published later is built on its first visit. */
export async function generateStaticParams() {
  return (await getArticles()).map((a) => ({ slug: a.slug }))
}
export const dynamicParams = true

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getArticle((await params).slug)
  if (!post) return {}
  // The body's first paragraph stands in when the post has no excerpt, so no post goes without a snippet.
  const firstParagraph = post.sections.find((s) => s.type === 'paragraph')
  return pageMetadata({
    title: post.seoTitle ?? fitTitle(post.title),
    description:
      post.seoDescription ??
      joinFit(post.excerpt ?? (firstParagraph?.type === 'paragraph' ? firstParagraph.text : post.title), `${business.name}, ${town()}.`),
    path: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.publishedAt,
  })
}

/** One post: usually a job story, a real car and what the shop found. */
export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const [post, services] = await Promise.all([getArticle(slug), getServices()])
  if (!post) notFound()
  const service = post.service ? services.find((s) => s.slug === post.service) : undefined
  const eyebrow = postEyebrow(post)

  return (
    <SiteShell jsonLd={articlePageData(post)}>
      <Section tone="paper" className="pt-8 sm:pt-12">
        <Container className="max-w-[48rem]">
          <article>
            <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/blog', label: spec.blog.title }, { label: post.title }]} />
            {eyebrow ? (
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.06em] text-text-muted">{eyebrow}</p>
            ) : null}
            <h1 className={cn(pageTitleClass, eyebrow ? 'mt-3' : 'mt-6')}>{post.title}</h1>
            {post.vehicle ? <p className="mt-4 text-lg text-text-muted">{post.vehicle}</p> : null}
            {post.photo ? (
              <Photo photo={post.photo} className="mt-8 aspect-[16/9]" priority sizes="(min-width: 768px) 720px, 100vw" />
            ) : null}
            <ArticleBody sections={post.sections} className="mt-10" />
            {service ? (
              <p className="mt-12 border-t border-border pt-6 text-lg">
                <Link href={`/services/${service.slug}`} className="font-semibold underline-offset-4 hover:text-primary hover:underline">
                  {service.name}
                </Link>
                {service.summary ? <span className="text-text-muted">: {service.summary}</span> : null}
              </p>
            ) : null}
          </article>
        </Container>
      </Section>
    </SiteShell>
  )
}
