import clsx from 'clsx'

/**
 * Button styles, on their own so browser-side components (the booking form,
 * the review page, the pinned bar) can use them without pulling
 * tailwind-merge into the page. Nothing here conflicts with itself, so clsx is
 * enough; callers that need to override a class merge on the server, in
 * ButtonLink.
 *
 * The look is shop signage: the condensed display face in capitals with a
 * little tracking, square to the design's corner setting, and on solid
 * buttons a darker base that sinks when pressed, like a key.
 */

const VARIANTS = {
  /** The one brand-coloured thing on the page. Booking only. */
  primary:
    'bg-primary text-white shadow-[inset_0_-3px_0_rgb(0_0_0/0.22)] hover:bg-primary-600 active:translate-y-px active:shadow-none',
  /** Secondary action on a light ground: calling, directions. */
  outline: 'border-[1.5px] border-text text-text hover:bg-text hover:text-white',
  /** Secondary action on the ink ground. */
  inverse: 'border-[1.5px] border-white/45 text-white hover:border-white hover:bg-white hover:text-ink',
} as const

const SIZES = {
  md: 'h-11 px-5 text-[16px]',
  lg: 'h-14 px-7 text-[19px]',
} as const

export type ButtonVariant = keyof typeof VARIANTS
export type ButtonSize = keyof typeof SIZES

/** Classes for anything that should look like a button, link or <button>. */
export function buttonClass({
  variant = 'primary',
  size = 'lg',
  block = false,
}: { variant?: ButtonVariant; size?: ButtonSize; block?: boolean } = {}) {
  return clsx(
    'inline-flex select-none items-center justify-center gap-3 rounded-md font-display font-semibold uppercase leading-none tracking-[0.05em] whitespace-nowrap',
    'transition-[background-color,color,border-color,transform,box-shadow] duration-150',
    'disabled:cursor-not-allowed disabled:opacity-40',
    VARIANTS[variant],
    SIZES[size],
    block && 'w-full'
  )
}

/**
 * A button's icon in its own boxed cell at the left edge, ruled off from the
 * label, like a labelled switch. Add `withIconCell` to the button, put the
 * cell first and the label in `iconLabel`: the cell sits flush left and the
 * label centres in what is left, at any width.
 */
export const withIconCell = 'justify-start pl-0'
export const iconCell = 'flex self-stretch items-center justify-center border-r border-current/25 px-3.5'
export const iconLabel = 'flex-1 text-center'
