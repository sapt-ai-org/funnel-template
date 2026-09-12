import { ButtonLink, CallButton, Container, LegalLinks } from '@/components/site'
import { business } from '@/config/business'
import type { Metadata } from 'next'

// A 404 answers with its own title and description. Next adds the noindex itself.
export const metadata: Metadata = {
  title: { absolute: `Page not found | ${business.name}` },
  description: `That page is not on the ${business.name} site. Go to the home page, or call ${business.phone}.`,
}

/** An old link or a typo. Send them to the two things they came for. */
export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] items-center bg-bg">
      <Container className="py-20">
        <p className="font-display text-xl font-bold uppercase tracking-[0.02em]">{business.name}</p>
        <h1 className="mt-6 max-w-[14ch] font-display text-[clamp(3rem,11vw,5rem)] font-bold leading-[0.9] text-balance">
          That page is not here.
        </h1>
        <p className="mt-5 max-w-[40ch] text-lg text-text-muted">
          The link may be old. Everything is on the home page, or call the shop and ask.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/">Go to the home page</ButtonLink>
          <CallButton />
        </div>
        <LegalLinks
          className="mt-12 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-muted"
          linkClassName="underline-offset-4 hover:text-text hover:underline"
        />
      </Container>
    </main>
  )
}
