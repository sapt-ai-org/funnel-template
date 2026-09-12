import Script from 'next/script'
import { getPixelId } from '@/lib/meta-pixel'
import { MetaPageViews } from './MetaPageViews'

/**
 * The Meta Pixel base code and the first PageView. Renders nothing until
 * `NEXT_PUBLIC_META_PIXEL_ID` is set, so a fresh clone sends nothing to
 * anyone's pixel.
 *
 * `afterInteractive`, like <Analytics />: the pixel is not needed to paint
 * the page, and in the critical path it would cost the hero its load time to
 * buy nothing. No <noscript> beacon: it costs an image request on every load
 * to catch the few visitors with JavaScript off, and the booking form needs
 * JavaScript anyway.
 *
 * Moving between pages inside the site does not reload, so MetaPageViews
 * sends each later PageView. The Lead is sent by the booking form (see
 * src/lib/meta-pixel.ts for why it carries Sapt's event id).
 */
export function MetaPixel() {
  const pixelId = getPixelId()
  if (!pixelId) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(pixelId)});
fbq('track', 'PageView');`}
      </Script>
      <MetaPageViews />
    </>
  )
}
