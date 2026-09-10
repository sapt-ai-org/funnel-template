'use client'

/**
 * FunnelOverlay — a clean, centered perspective.co-style quiz funnel that takes
 * over the screen when a CTA on the landing page is tapped. Progress bar up top,
 * one question centered with big tappable option cards, single-select
 * auto-advances. Posts the lead to `/api/book` on submit. All copy comes from
 * `landingSpec.funnel`.
 */

import type { ChoiceStep, ContactStep, FunnelFlow } from '@/config/funnel'
import { getVisitorId, identify, readUtmParams, track } from '@/lib/analytics'
import { haptic } from '@/lib/haptics'
import { cn, formatPhone, phoneDigits } from '@/lib/utils'
import confetti from 'canvas-confetti'
import { ArrowLeft, ArrowRight, Check, Loader2, Phone, X } from 'lucide-react'
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

export function FunnelOverlay({ flow, brandName, onClose }: { flow: FunnelFlow; brandName: string; onClose: () => void }) {
  const total = flow.steps.length
  const [index, setIndex] = useState(0) // 0..total-1 = steps; total = success
  const [answers, setAnswers] = useState<Answers>({})
  const [contact, setContact] = useState<Contact>({ name: '', email: '', phone: '', vehicle: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const advancing = useRef(false)

  const onSuccess = index >= total
  const currentStep = index < total ? flow.steps[index] : null

  useEffect(() => {
    track('funnel_view', { funnel: brandName })
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [brandName])

  useEffect(() => {
    if (onSuccess) {
      haptic('success')
      const burst = () => confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 } })
      burst()
      setTimeout(burst, 200)
      setTimeout(burst, 400)
    }
  }, [onSuccess])

  const goNext = () => setIndex((i) => Math.min(i + 1, total))
  const goBack = () => {
    setError(null)
    setIndex((i) => Math.max(i - 1, 0))
  }

  const firstChoiceLead = useMemo(() => {
    const step = flow.steps.find((s): s is ChoiceStep => s.kind === 'choice')
    if (!step) return { service: '', serviceName: '' }
    const picked = answers[step.id]
    const id = Array.isArray(picked) ? picked[0] : picked
    const opt = step.options.find((o) => o.id === id)
    return { service: id ?? '', serviceName: opt?.label ?? '' }
  }, [flow.steps, answers])

  const selectSingle = (step: ChoiceStep, optionId: string) => {
    if (advancing.current) return
    advancing.current = true
    setAnswers((a) => ({ ...a, [step.id]: optionId }))
    haptic('selection')
    track('funnel_step', { step: step.id, value: optionId })
    setTimeout(() => {
      goNext()
      advancing.current = false
    }, 240)
  }

  const toggleMulti = (step: ChoiceStep, optionId: string) => {
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
    (!contactFieldIds.includes('phone') || phoneDigits(contact.phone).length === 10)

  const submit = async () => {
    if (submitting || !contactValid) return
    haptic('light')
    setError(null)
    setSubmitting(true)
    identify({ email: contact.email, name: contact.name, phone: contact.phone })
    track('funnel_submit', { service: firstChoiceLead.serviceName })
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
          answers,
          visitorId: getVisitorId(),
          utm: readUtmParams(),
        }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!res.ok || !data.ok) throw new Error(data.error || flow.ui.genericError)
      track('funnel_confirmed', { service: firstChoiceLead.serviceName })
      goNext()
    } catch (err) {
      setError(err instanceof Error ? err.message : flow.ui.genericError)
    } finally {
      setSubmitting(false)
    }
  }

  const progress = onSuccess ? 1 : total > 0 ? index / total : 0

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-primary-50 text-text">
      {/* progress rail */}
      <div className="absolute left-0 right-0 top-0 z-20 h-1.5 bg-primary-100">
        <div className="h-full bg-primary-500 transition-[width] duration-500 ease-out" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>

      {/* header: back (left) · brand (center) · close (right) */}
      <header className="relative z-10 flex items-center justify-center px-5 pt-6 [padding-top:max(1.5rem,env(safe-area-inset-top))] sm:px-8">
        {index > 0 && !onSuccess && (
          <button
            onClick={goBack}
            className="absolute left-5 inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm text-text-muted transition-colors hover:text-text sm:left-8"
          >
            <ArrowLeft className="h-4 w-4" /> {flow.ui.backLabel}
          </button>
        )}
        <span className="font-display text-lg font-bold tracking-tight">{brandName}</span>
        <button
          onClick={onClose}
          aria-label={flow.ui.closeLabel}
          className="absolute right-5 flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-border hover:text-text sm:right-8"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* centered content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-10">
        <div key={index} className="animate-fadeIn w-full max-w-lg">
          {/* ── Choice ── */}
          {currentStep?.kind === 'choice' &&
            (() => {
              const step = currentStep as ChoiceStep
              const sel = answers[step.id]
              const selectedArr = Array.isArray(sel) ? sel : sel ? [sel] : []
              return (
                <div className="text-center">
                  <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{step.question}</h2>
                  {step.help && <p className="mx-auto mt-3 max-w-md text-text-muted">{step.help}</p>}

                  <div className="mx-auto mt-8 max-w-md space-y-3 text-left">
                    {step.options.map((opt) => {
                      const isSel = selectedArr.includes(opt.id)
                      return (
                        <button
                          key={opt.id}
                          onClick={() => (step.multi ? toggleMulti(step, opt.id) : selectSingle(step, opt.id))}
                          aria-pressed={isSel}
                          className={cn(
                            'group flex w-full items-center gap-4 rounded-2xl border px-4 py-5 text-left transition-all active:scale-[0.99]',
                            isSel
                              ? 'border-primary-500 bg-primary-500 text-white shadow-xl shadow-primary-500/30'
                              : 'border-transparent bg-surface shadow-sm hover:-translate-y-0.5 hover:shadow-lg'
                          )}
                        >
                          {opt.emoji && (
                            <span className={cn('flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl transition-colors', isSel ? 'bg-white/20' : 'bg-primary-50')}>
                              {opt.emoji}
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block text-base font-semibold leading-snug">{opt.label}</span>
                            {opt.sublabel && <span className={cn('block text-sm', isSel ? 'text-white/80' : 'text-text-muted')}>{opt.sublabel}</span>}
                          </span>
                          <span className={cn('flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all', isSel ? 'border-white bg-white text-primary-600' : 'border-border text-transparent group-hover:border-primary-400')}>
                            <Check className="h-4 w-4" />
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {step.multi && (
                    <button onClick={goNext} disabled={selectedArr.length === 0} className="mx-auto mt-6 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-primary-500 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40">
                      {flow.ui.continueLabel} <ArrowRight className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )
            })()}

          {/* ── Contact ── */}
          {contactStep && (
            <div className="mx-auto max-w-md">
              <div className="text-center">
                <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{contactStep.question}</h2>
                {contactStep.help && <p className="mx-auto mt-3 max-w-md text-text-muted">{contactStep.help}</p>}
              </div>
              <div className="mt-8 space-y-4">
                {contactStep.fields.map((field, i) => {
                  const meta = FIELD_BEHAVIOR[field.id]
                  return (
                    <div key={field.id}>
                      <label htmlFor={`f-${field.id}`} className="mb-1.5 block text-sm font-medium">{field.label}</label>
                      <input
                        id={`f-${field.id}`}
                        type={meta.type}
                        inputMode={meta.inputMode as React.HTMLAttributes<HTMLInputElement>['inputMode']}
                        autoComplete={meta.autoComplete}
                        enterKeyHint={i === contactStep.fields.length - 1 ? 'done' : 'next'}
                        value={contact[field.id]}
                        onChange={(e) =>
                          setContact((c) => ({ ...c, [field.id]: field.id === 'phone' ? formatPhone(e.target.value) : e.target.value }))
                        }
                        placeholder={field.placeholder}
                        className="w-full rounded-2xl border border-transparent bg-surface px-4 py-4 shadow-sm outline-none transition-all focus:shadow-md focus:ring-4 focus:ring-primary-500/20"
                      />
                    </div>
                  )
                })}
              </div>
              <button onClick={submit} disabled={submitting || !contactValid} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40">
                {submitting ? (<><Loader2 className="h-5 w-5 animate-spin" /> {flow.ui.submittingLabel}</>) : (<>{contactStep.submitLabel} <ArrowRight className="h-5 w-5" /></>)}
              </button>
              {error && <p className="mt-3 text-center text-sm text-red-600" role="alert">{error}</p>}
              {flow.legal && <p className="mt-4 text-center text-xs text-text-light">{flow.legal}</p>}
            </div>
          )}

          {/* ── Success ── */}
          {onSuccess && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/25">
                <Check className="h-8 w-8" />
              </div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{flow.success.title}</h2>
              <p className="mx-auto mt-3 max-w-md text-text-muted">{flow.success.body}</p>
              {flow.success.phone && (
                <a href={flow.success.phoneHref} className="mt-6 inline-flex items-center gap-1.5 font-medium text-primary-600">
                  <Phone className="h-4 w-4" /> {flow.success.phone}
                </a>
              )}
              <div className="mt-6">
                <button onClick={onClose} className="text-sm text-text-muted underline-offset-4 hover:text-text hover:underline">{flow.ui.backToSiteLabel}</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* footer trust row */}
      {flow.trust && flow.trust.length > 0 && !onSuccess && (
        <footer className="relative z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 pb-8 [padding-bottom:max(2rem,env(safe-area-inset-bottom))] text-xs text-text-light">
          {flow.trust.map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary-500" /> {t}
            </span>
          ))}
        </footer>
      )}
    </div>
  )
}
