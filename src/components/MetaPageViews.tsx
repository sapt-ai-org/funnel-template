'use client'

import { metaTrack } from '@/lib/meta-pixel'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * A PageView for each page reached inside the site. The first one is sent by
 * the base code in MetaPixel.tsx, so this skips the page it mounted on.
 */
export function MetaPageViews() {
  const pathname = usePathname()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    metaTrack('PageView')
  }, [pathname])
  return null
}
