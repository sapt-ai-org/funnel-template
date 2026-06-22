import { useMemo, useState } from 'react'
import type { FunnelConfig } from '../../config/funnel'
import { analyticsEvents } from '../../config/analytics'
import { emailDomain } from '../../lib/analytics/events'
import { getVisitorId, identify, track } from '../../lib/analytics/tracker'
import { extractUtm } from '../../lib/funnel/normalize'
import { Alert } from '../ui/alert'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

export function LeadForm({ config, onSuccess }: { config: FunnelConfig; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '', website: '' })
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const utm = useMemo(() => extractUtm(new URLSearchParams(window.location.search)), [])

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    identify({ email: form.email, phone: form.phone })
    track(analyticsEvents.leadSubmitted, {
      email_domain: emailDomain(form.email),
      offer: config.offer.name,
      has_phone: Boolean(form.phone),
      has_company: Boolean(form.company),
    })

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          answers,
          visitorId: getVisitorId(),
          landingPage: window.location.href,
          referrer: document.referrer,
          utm,
        }),
      })
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; recordId?: string; event?: string; error?: { message?: string } }
        | null
      if (!res.ok || !body?.ok) throw new Error(body?.error?.message ?? 'Could not submit lead')

      track(body.event ?? analyticsEvents.conversionCompleted, { record_id: body.recordId })
      track(analyticsEvents.conversionCompleted, { record_id: body.recordId })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="form-shell">
      <form className="lead-form" onSubmit={submit}>
        <div>
          <p className="eyebrow">{config.offer.name}</p>
          <h1>{config.form.title}</h1>
          <p className="subheadline">{config.form.description}</p>
        </div>

        <div className="field-grid">
          <label>
            Name
            <Input value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </label>
          <label>
            Email
            <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </label>
          <label>
            Phone
            <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </label>
          <label>
            Company
            <Input value={form.company} onChange={(e) => update('company', e.target.value)} />
          </label>
        </div>

        {config.form.questions.map((question) => (
          <label key={question.id}>
            {question.label}
            {question.helper && <span className="field-helper">{question.helper}</span>}
            {question.type === 'textarea' ? (
              <Textarea
                value={answers[question.id] ?? ''}
                onFocus={() => track(analyticsEvents.formStarted, { field: question.id })}
                onChange={(e) => setAnswers((current) => ({ ...current, [question.id]: e.target.value }))}
                placeholder={question.placeholder}
                required={question.required}
              />
            ) : question.type === 'select' ? (
              <select
                value={answers[question.id] ?? ''}
                onFocus={() => track(analyticsEvents.formStarted, { field: question.id })}
                onChange={(e) => setAnswers((current) => ({ ...current, [question.id]: e.target.value }))}
                required={question.required}
              >
                <option value="">Select one...</option>
                {question.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={answers[question.id] ?? ''}
                onFocus={() => track(analyticsEvents.formStarted, { field: question.id })}
                onChange={(e) => setAnswers((current) => ({ ...current, [question.id]: e.target.value }))}
                placeholder={question.placeholder}
                required={question.required}
              />
            )}
          </label>
        ))}

        <label>
          Anything else we should know?
          <Textarea value={form.message} onChange={(e) => update('message', e.target.value)} />
        </label>

        <input
          className="honeypot"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => update('website', e.target.value)}
          aria-hidden="true"
        />

        {error && <Alert>{error}</Alert>}

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : config.form.submitLabel}
        </Button>
      </form>
    </main>
  )
}
