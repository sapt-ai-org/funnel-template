'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

/**
 * One line of text sized to fill its container's width exactly: any length,
 * any typeface, any screen. The font size is the container's width divided by
 * the text's width in ems, as `calc(100cqi / n)`, so once `n` is known the
 * browser keeps it fitted through every resize with no JavaScript.
 *
 * The server can only estimate `n` from the character count. In the browser
 * the text is measured once the typeface has loaded and the estimate is
 * replaced by the real figure, which only nudges the size of the last thing
 * on the page.
 */
export function FitText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [ems, setEms] = useState<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const size = parseFloat(getComputedStyle(el).fontSize)
      const width = el.getBoundingClientRect().width
      if (size > 0 && width > 0) setEms(width / size)
    }
    measure()
    const fonts = document.fonts
    void fonts?.ready.then(measure)
    fonts?.addEventListener('loadingdone', measure)
    return () => fonts?.removeEventListener('loadingdone', measure)
  }, [text])

  // A hair under the full width, so rounding never tips the last letter over the edge.
  const n = (ems ?? estimateEms(text)) * 1.005

  return (
    <div className="[container-type:inline-size]">
      <span
        ref={ref}
        className={cn('inline-block whitespace-nowrap', className)}
        style={{ fontSize: `calc(100cqi / ${n.toFixed(4)})` }}
      >
        {text}
      </span>
    </div>
  )
}

/**
 * The text's width in ems before it can be measured, set a few percent wide so
 * the first paint is never too big: capitals in a condensed bold face run just
 * under half an em (M and W more), spaces and punctuation a fifth.
 */
export function estimateEms(text: string): number {
  let ems = 0
  for (const ch of text.toUpperCase()) ems += /[\s.,'’-]/.test(ch) ? 0.2 : /[MW]/.test(ch) ? 0.62 : 0.46
  return Math.max(ems, 1)
}
