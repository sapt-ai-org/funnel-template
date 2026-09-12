'use client'

/**
 * The booking questions, one per screen, ending in the contact step. Posts
 * the lead to `/api/book`. All copy comes from `landingSpec.funnel`; the
 * shop's name and number come from business.ts through props.
 *
 * One form, two homes, so they can never drift apart:
 *  - `inline`  sits in the hero card, where the first question is on screen
 *              from the first paint. Answering it is the booking starting,
 *              with no click to find the form first.
 *  - `screen`  fills the takeover that every other book button opens.
 *
 * Started on a service's own page, it knows the service (`service`): the
 * question that service answers is skipped, the service names the form, and
 * the booking reaches the shop saying what it is for.
 */

import { buttonClass, iconCell, iconLabel, withIconCell } from '@/components/site/button'
import { stepsFor, type BookingService, type ChoiceStep, type ContactStep, type FunnelFlow } from '@/config/funnel'
import { SMS_CONSENT_CHECKBOX, smsConsentLabel } from '@/config/legal'
import { getVisitorId, identify, readUtmParams, track } from '@/lib/analytics'
import { haptic } from '@/lib/haptics'
import { metaTrackOnce, mintEventId } from '@/lib/meta-pixel'
import { formatPhone, phoneDigits } from '@/lib/utils'
import clsx from 'clsx'
import {
  ArrowLeft,
  AudioWaveform,
  CalendarDays,
  Check,
  CircleHelp,
  Clock,
  Disc3,
  KeyRound,
  Loader2,
  Phone,
  TriangleAlert,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

type Answers = Record<string, string | string[]>
type Contact = { name: string; email: string; phone: string; vehicle: string }

const FIELD_BEHAVIOR = {
  name: { type: 'text', inputMode: 'text', autoComplete: 'name' },
  email: { type: 'email', inputMode: 'email', autoComplete: 'email' },
  phone: { type: 'tel', inputMode: 'tel', autoComplete: 'tel' },
  // No autoComplete: a browser has nothing sensible to offer for "2015
  // Silverado", and a wrong autofill here is worse than an empty box.
  vehicle: { type: 'text', inputMode: 'text', autoComplete: 'off' },
} as const

/**
 * A picture for each answer, keyed by the option ids in funnel.ts (which are
 * also the CRM's choice ids, so they stay stable). The icon finds the answer
 * faster than reading six labels. An option without one shows its label only.
 */
const OPTION_ICONS: Partial<Record<string, LucideIcon>> = {
  warning_light: TriangleAlert,
  brakes: Disc3,
  noise: AudioWaveform,
  wont_start: KeyRound,
  maintenance: Wrench,
  other: CircleHelp,
  not_sure: CircleHelp,
  today: Zap,
  this_week: CalendarDays,
  flexible: Clock,
}

const VARIANT = {
  inline: {
    question: 'text-[2rem] sm:text-[2.25rem]',
    // White card: answers sit on the paper tone so they read as buttons.
    // Tighter on a small phone, where the card is only ~300px inside.
    option: 'min-h-14 gap-3 bg-bg px-3.5 py-3 sm:gap-4 sm:px-4',
    chip: 'bg-bg',
    chipLabel: 'text-[15px] sm:text-[17px]',
    optionLabel: 'text-[16px] sm:text-[17px]',
    optionSub: 'text-[14px] sm:text-[15px]',
    field: 'bg-bg',
  },
  screen: {
    question: 'text-[2.5rem] sm:text-5xl',
    option: 'min-h-16 gap-4 bg-surface px-5 py-3.5',
    chip: 'bg-surface',
    chipLabel: 'text-[17px] sm:text-lg',
    optionLabel: 'text-lg',
    optionSub: 'text-[15px]',
    field: 'bg-surface',
  },
} as const

export function BookingForm({
  flow,
  shopName,
  phone,
  phoneHref,
  variant,
  source,
  label,
  onClose,
  reserve = false,
  service = null,
}: {
  flow: FunnelFlow
  shopName: string
  phone: string
  phoneHref: string
  variant: keyof typeof VARIANT
  /** Where this form lives on the page, for analytics. */
  source: string
  /** Names the form before the first answer, where Back will later sit. */
  label?: string
  /** The takeover's close. Inline has nowhere to go back to. */
  onClose?: () => void
  /** Render every state, none live, only to take the tallest one's height. */
  reserve?: boolean
  /** The service whose page this booking started on, if any. */
  service?: BookingService | null
}) {
  const steps = useMemo(() => stepsFor(flow, service), [flow, service])
  const total = steps.length
  const [index, setIndex] = useState(0) // 0..total-1 = steps; total = success
  const [answers, setAnswers] = useState<Answers>({})
  const [contact, setContact] = useState<Contact>({ name: '', email: '', phone: '', vehicle: '' })
  // Unticked to start, always. A box that arrives already ticked is not consent,
  // and a carrier's reviewer will reject the campaign for it.
  const [consented, setConsented] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const advancing = useRef(false)
  const leadEventId = useRef<string | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const detailsInput = useRef<HTMLInputElement>(null)
  const moved = useRef(false)
  // The takeover was opened on purpose, so it counts as viewed at once. The
  // inline form is on every page load, so it counts from the first answer.
  const viewed = useRef(false)
  const v = VARIANT[variant]

  const currentStep = index < total ? steps[index] : null

  const markViewed = () => {
    if (viewed.current) return
    viewed.current = true
    track('funnel_view', { funnel: shopName, source })
  }

  useEffect(() => {
    if (variant === 'screen') markViewed()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on open
  }, [])

  // After a step changes, put focus on its question so a screen reader or a
  // keyboard carries on from there. Not on first render: that would steal
  // focus from the page.
  useEffect(() => {
    if (!moved.current) return
    heading.current?.focus({ preventScroll: variant === 'inline' })
    if (index >= total) haptic('success')
  }, [index, total, variant])

  const go = (next: number) => {
    moved.current = true
    setError(null)
    setIndex(Math.max(0, Math.min(next, total)))
  }

  // What the booking is for: the service page it started on, or else the
  // first question's answer. Either way the CRM's `service` field gets a name.
  const firstChoiceLead = useMemo(() => {
    if (service) return { service: service.slug, serviceName: service.name }
    const step = steps.find((s): s is ChoiceStep => s.kind === 'choice')
    if (!step) return { service: '', serviceName: '' }
    const picked = answers[step.id]
    const id = Array.isArray(picked) ? picked[0] : picked
    const opt = step.options.find((o) => o.id === id)
    return { service: id ?? '', serviceName: opt?.label ?? '' }
  }, [service, steps, answers])

  const detailsKey = (step: ChoiceStep) => `${step.id}_details`

  const selectSingle = (step: ChoiceStep, optionId: string) => {
    if (advancing.current) return
    markViewed()
    haptic('selection')
    track('funnel_step', { step: step.id, value: optionId, source })
    const option = step.options.find((o) => o.id === optionId)

    // An option with a text box ("Other") waits for the box and Continue.
    if (option?.input) {
      setAnswers((a) => ({ ...a, [step.id]: optionId }))
      requestAnimationFrame(() => detailsInput.current?.focus({ preventScroll: variant === 'inline' }))
      return
    }

    // Anything else moves straight on, and drops a note typed under another
    // option so it cannot travel with the wrong answer.
    advancing.current = true
    setAnswers((a) => {
      const next: Answers = { ...a, [step.id]: optionId }
      delete next[detailsKey(step)]
      return next
    })
    // Long enough to see the tick land, short enough not to feel like waiting.
    setTimeout(() => {
      go(index + 1)
      advancing.current = false
    }, 220)
  }

  const toggleMulti = (step: ChoiceStep, optionId: string) => {
    markViewed()
    haptic('selection')
    setAnswers((a) => {
      const cur = Array.isArray(a[step.id]) ? (a[step.id] as string[]) : []
      const next = cur.includes(optionId) ? cur.filter((x) => x !== optionId) : [...cur, optionId]
      return { ...a, [step.id]: next }
    })
  }

  const contactStep = currentStep?.kind === 'contact' ? (currentStep as ContactStep) : null
  const contactFieldIds = contactStep?.fields.map((field) => field.id) ?? []
  const contactValid =
    (!contactFieldIds.includes('email') || /.+@.+\..+/.test(contact.email.trim())) &&
    (!contactFieldIds.includes('name') || !!contact.name.trim()) &&
    (!contactFieldIds.includes('phone') || phoneDigits(contact.phone).length === 10) &&
    // The tick counts as part of being valid, so the button stays disabled
    // without it and `submit` cannot be reached around it.
    (!SMS_CONSENT_CHECKBOX || consented)

  const submit = async () => {
    if (submitting || !contactValid) return
    haptic('light')
    setError(null)
    setSubmitting(true)
    identify({ email: contact.email, name: contact.name, phone: contact.phone })
    track('funnel_submit', { service: firstChoiceLead.serviceName, source })
    // One id for this booking, kept across a retry so a second try is the same Lead.
    leadEventId.current ??= mintEventId()
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          vehicle: contact.vehicle,
          service: firstChoiceLead.service,
          serviceName: firstChoiceLead.serviceName,
          // The skipped question still gets its answer when the service implies
          // one, so the shop's board sorts a brake job with the brake jobs.
          answers: service?.issue && !answers.issue ? { ...answers, issue: service.issue } : answers,
          visitorId: getVisitorId(),
          utm: readUtmParams(),
          leadEventId: leadEventId.current,
        }),
      })
      const data = (await res.json()) as { ok: boolean; error?: unknown; held?: boolean; conversionEventId?: string | null }
      // Only ever show a sentence; anything else falls back to the form's own.
      if (!res.ok || !data.ok) throw new Error(typeof data.error === 'string' ? data.error : flow.ui.genericError)
      track('funnel_confirmed', { service: firstChoiceLead.serviceName, source })
      // Meta's Lead, with Sapt's id so its server copy and this one count once;
      // none when Sapt held the booking back. See src/lib/meta-pixel.ts.
      if (!data.held && data.conversionEventId) {
        metaTrackOnce(`lead:${data.conversionEventId}`, 'Lead', { content_name: firstChoiceLead.serviceName }, data.conversionEventId)
      }
      go(total)
    } catch (err) {
      setError(err instanceof Error ? err.message : flow.ui.genericError)
    } finally {
      setSubmitting(false)
    }
  }

  const questionClass = clsx('font-display font-bold leading-[0.95] text-balance outline-none', v.question)

  /**
   * One state of the form: step `i`'s header and question, or the success
   * screen when `i` is past the last step. The live one is interactive; in
   * `reserve` mode none is, and they only hold their height (see below).
   */
  const renderPanel = (i: number, live: boolean) => {
    const stepAt = i < total ? steps[i] : null
    const isSuccess = i >= total
    const contactAt = stepAt?.kind === 'contact' ? (stepAt as ContactStep) : null
    return (
      <>
        {!isSuccess ? (
          <>
            <div className="flex h-8 items-center justify-between gap-4 text-[15px]">
              {i > 0 ? (
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  className="-ml-1.5 inline-flex h-8 items-center gap-1.5 rounded-md px-1.5 font-medium text-text-muted hover:text-text"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden /> {flow.ui.backLabel}
                </button>
              ) : (
                <span className="min-w-0 truncate font-semibold">{service?.name ?? label}</span>
              )}
              <span className="shrink-0 font-medium text-text-muted tabular-nums">
                Step {i + 1} of {total}
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden bg-border-light" aria-hidden>
              <div
                className="h-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${Math.round(((i + 1) / total) * 100)}%` }}
              />
            </div>
          </>
        ) : null}

        <div key={index} className={clsx(live && 'animate-step-in', isSuccess ? '' : 'mt-6')}>
          {stepAt?.kind === 'choice' &&
            (() => {
              const step = stepAt as ChoiceStep
              const sel = answers[step.id]
              const selected = Array.isArray(sel) ? sel : sel ? [sel] : []
              return (
                <>
                  <h2 ref={live ? heading : undefined} tabIndex={-1} className={questionClass}>
                    {step.question}
                  </h2>
                  {step.help ? <p className="mt-2.5 text-text-muted">{step.help}</p> : null}

                  {/* Short answers are chips in a grid, one tap each; answers
                      with a sub-label need a full row to be read. */}
                  {(() => {
                    const chips = step.options.every((o) => !o.sublabel)
                    return (
                      <div
                        role={step.multi ? 'group' : 'radiogroup'}
                        aria-label={step.question}
                        className={clsx(
                          'mt-6 grid gap-2.5 sm:gap-3',
                          chips && (step.options.length <= 3 ? 'grid-cols-3' : 'grid-cols-2')
                        )}
                      >
                        {step.options.map((opt) => {
                          const isSel = selected.includes(opt.id)
                          const choose = () => (step.multi ? toggleMulti(step, opt.id) : selectSingle(step, opt.id))
                          const Icon = OPTION_ICONS[opt.id]
                          return chips ? (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={choose}
                              role={step.multi ? 'checkbox' : 'radio'}
                              aria-checked={isSel}
                              className={clsx(
                                'group relative flex rounded-md border-[1.5px] bg-surface text-left font-semibold leading-tight shadow-[0_1px_2px_rgb(0_0_0/0.06)] transition-[border-color,box-shadow,translate,scale] duration-150 active:scale-[0.98]',
                                Icon
                                  ? 'min-h-[5.75rem] flex-col items-start justify-between gap-3 p-3.5 sm:p-4'
                                  : 'min-h-13 items-center px-3.5 py-3 sm:px-4',
                                v.chipLabel,
                                isSel
                                  ? 'border-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]'
                                  : 'border-border hover:-translate-y-0.5 hover:border-text hover:shadow-[0_12px_28px_-14px_rgb(0_0_0/0.4)]'
                              )}
                            >
                              {Icon ? (
                                <span
                                  aria-hidden
                                  className={clsx(
                                    'flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-150',
                                    isSel
                                      ? 'bg-primary text-white'
                                      : 'bg-primary-50 text-primary group-hover:bg-primary group-hover:text-white'
                                  )}
                                >
                                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                                </span>
                              ) : null}
                              <span>{opt.label}</span>
                              {isSel ? (
                                <span
                                  aria-hidden
                                  className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"
                                >
                                  <Check className="h-3 w-3" strokeWidth={3} />
                                </span>
                              ) : null}
                            </button>
                          ) : (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={choose}
                              role={step.multi ? 'checkbox' : 'radio'}
                              aria-checked={isSel}
                              className={clsx(
                                'flex w-full items-center rounded-md border-[1.5px] text-left transition-colors duration-150',
                                v.option,
                                isSel ? 'border-text' : 'border-transparent hover:border-border'
                              )}
                            >
                              <span className="min-w-0 flex-1">
                                <span className={clsx('block font-semibold leading-snug', v.optionLabel)}>{opt.label}</span>
                                <span className={clsx('block leading-snug text-text-muted', v.optionSub)}>{opt.sublabel}</span>
                              </span>
                              <span
                                aria-hidden
                                className={clsx(
                                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors',
                                  isSel ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-transparent'
                                )}
                              >
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )
                  })()}

                  {(() => {
                    // "Other": say it in their own words, or just carry on.
                    const open = step.options.find((o) => o.input && selected.includes(o.id))
                    if (!open?.input) return null
                    const id = live ? `${source}-${detailsKey(step)}` : undefined
                    return (
                      <form
                        className="mt-5 animate-step-in"
                        onSubmit={(e) => {
                          e.preventDefault()
                          go(index + 1)
                        }}
                      >
                        <label htmlFor={id} className="mb-1.5 block font-semibold">
                          {open.input.label}
                        </label>
                        <input
                          ref={live ? detailsInput : undefined}
                          id={id}
                          type="text"
                          enterKeyHint="next"
                          maxLength={500}
                          value={typeof answers[detailsKey(step)] === 'string' ? (answers[detailsKey(step)] as string) : ''}
                          onChange={(e) => setAnswers((a) => ({ ...a, [detailsKey(step)]: e.target.value }))}
                          placeholder={open.input.placeholder}
                          className={clsx(
                            'h-13 w-full rounded-md border-[1.5px] border-border px-4 text-[17px] outline-none transition-colors placeholder:text-text-light focus:border-text focus-visible:outline-none',
                            v.field
                          )}
                        />
                        <button type="submit" className={clsx(buttonClass({ block: true }), 'mt-3')}>
                          {flow.ui.continueLabel}
                        </button>
                      </form>
                    )
                  })()}

                  {step.multi ? (
                    <button
                      type="button"
                      onClick={() => go(index + 1)}
                      disabled={selected.length === 0}
                      className={clsx(buttonClass({ block: true }), 'mt-5')}
                    >
                      {flow.ui.continueLabel}
                    </button>
                  ) : null}
                </>
              )
            })()}

          {contactAt ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void submit()
              }}
            >
              <h2 ref={live ? heading : undefined} tabIndex={-1} className={questionClass}>
                {contactAt.question}
              </h2>
              {contactAt.help ? <p className="mt-2.5 text-text-muted">{contactAt.help}</p> : null}
              <div className="mt-6 grid gap-3.5">
                {contactAt.fields.map((field, i) => {
                  const meta = FIELD_BEHAVIOR[field.id]
                  const id = live ? `${source}-${field.id}` : undefined
                  return (
                    <div key={field.id}>
                      <label htmlFor={id} className="mb-1.5 block font-semibold">
                        {field.label}
                      </label>
                      <input
                        id={id}
                        type={meta.type}
                        inputMode={meta.inputMode as React.HTMLAttributes<HTMLInputElement>['inputMode']}
                        autoComplete={meta.autoComplete}
                        enterKeyHint={i === contactAt.fields.length - 1 ? 'done' : 'next'}
                        value={contact[field.id]}
                        onChange={(e) =>
                          setContact((c) => ({
                            ...c,
                            [field.id]: field.id === 'phone' ? formatPhone(e.target.value) : e.target.value,
                          }))
                        }
                        placeholder={field.placeholder}
                        className={clsx(
                          'h-13 w-full rounded-md border-[1.5px] border-border px-4 text-[17px] outline-none transition-colors placeholder:text-text-light focus:border-text focus-visible:outline-none',
                          v.field
                        )}
                      />
                    </div>
                  )
                })}
              </div>
              {/* The A2P tick: unticked, required, and with the shop's own name
                  beside it. This is the box a carrier's reviewer screenshots
                  when the shop registers its texting. It disappears, and the
                  same words become one line under the button, once the campaign
                  is approved and SMS_CONSENT_CHECKBOX is switched off. */}
              {SMS_CONSENT_CHECKBOX ? (
                <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-snug text-text-muted">
                  <input
                    type="checkbox"
                    checked={live ? consented : false}
                    onChange={(e) => {
                      if (live) setConsented(e.target.checked)
                    }}
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary"
                  />
                  <span>{smsConsentLabel()}</span>
                </label>
              ) : null}
              <button
                type="submit"
                disabled={submitting || !contactValid}
                className={clsx(buttonClass({ block: true }), SMS_CONSENT_CHECKBOX ? 'mt-4' : 'mt-6')}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> {flow.ui.submittingLabel}
                  </>
                ) : (
                  contactAt.submitLabel
                )}
              </button>
              {error ? (
                <p className="mt-3 font-medium text-primary-700" role="alert">
                  {error}
                </p>
              ) : null}
              {/* Both links stay in either mode: a carrier checks the form
                  reaches both policies before approving the shop's texting. The
                  sentence in front of them belongs to implied mode alone — when
                  the tick is above the button it already carries those words,
                  and printing them twice reads as a mistake. */}
              <p className="mt-4 text-sm leading-snug text-text-light">
                {!SMS_CONSENT_CHECKBOX && flow.legal ? `${flow.legal} ` : null}
                See our{' '}
                <a href="/privacy" target="_blank" rel="noopener" className="underline underline-offset-2">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/terms" target="_blank" rel="noopener" className="underline underline-offset-2">
                  Terms
                </a>
                .
              </p>
            </form>
          ) : null}

          {isSuccess ? (
            <div role="status">
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-open text-white">
                <Check className="h-6 w-6" strokeWidth={3} aria-hidden />
              </span>
              <h2 ref={live ? heading : undefined} tabIndex={-1} className={clsx(questionClass, 'mt-5')}>
                {flow.success.title}
              </h2>
              <p className="mt-3 max-w-[40ch] text-lg text-text-muted">{flow.success.body}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href={phoneHref} className={clsx(buttonClass({ variant: 'outline' }), withIconCell)}>
                  <span className={iconCell}>
                    <Phone className="h-[1em] w-[1em]" strokeWidth={2.25} aria-hidden />
                  </span>
                  <span className={clsx(iconLabel, 'tabular-nums')}>Call {phone}</span>
                </a>
                {onClose ? (
                  <button type="button" onClick={onClose} className={buttonClass({ variant: 'outline' })}>
                    {flow.ui.backToSiteLabel}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </>
    )
  }

  // `reserve` renders every state stacked in one grid cell, none of them live,
  // only to take the height of the tallest. The hero puts an invisible copy
  // behind the real form so it keeps one height as someone moves through the
  // steps (see Hero.tsx).
  if (reserve) {
    return (
      <div className="grid">
        {Array.from({ length: total + 1 }, (_, i) => (
          <div key={i} className="[grid-area:1/1]">
            {renderPanel(i, false)}
          </div>
        ))}
      </div>
    )
  }

  return <div>{renderPanel(index, true)}</div>
}
