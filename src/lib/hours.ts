import { dayName, formatTime, type BusinessHours } from '@/config/business'

/**
 * "Are they open right now?"
 *
 * The most-asked question on any shop's page, and the easiest to get wrong:
 * it has to be answered on the shop's clock. A visitor two time zones away, or
 * a crawler in a data centre, reading its own clock would be told the shop is
 * open when it is not.
 */

export interface ShopClock {
  /** 0 = Sunday, matching `BusinessHours.day`. */
  day: number
  /** Minutes since the shop's midnight. */
  minutes: number
}

export interface OpenStatus {
  open: boolean
  label: string
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** The weekday and time of day at the shop for a given instant. */
export function shopClock(instant: Date, timeZone: string): ShopClock {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    // h23, not hour12:false, which renders midnight as "24" in some engines.
    hourCycle: 'h23',
  }).formatToParts(instant)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  return {
    day: WEEKDAYS.indexOf(part('weekday')),
    minutes: Number(part('hour')) * 60 + Number(part('minute')),
  }
}

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/**
 * Open now and until when, or closed and when it next opens. `null` when the
 * hours cannot answer the question, so the page says nothing instead of
 * something wrong.
 */
export function openStatus(hours: BusinessHours[], clock: ShopClock): OpenStatus | null {
  const today = hours.find((h) => h.day === clock.day)
  if (today && !today.closed) {
    if (clock.minutes >= minutesOf(today.open) && clock.minutes < minutesOf(today.close)) {
      return { open: true, label: `Open until ${formatTime(today.close)}` }
    }
    if (clock.minutes < minutesOf(today.open)) {
      return { open: false, label: `Closed. Opens ${formatTime(today.open)} today` }
    }
  }

  for (let ahead = 1; ahead <= 7; ahead++) {
    const day = (clock.day + ahead) % 7
    const next = hours.find((h) => h.day === day)
    if (next && !next.closed) {
      const when = ahead === 1 ? 'tomorrow' : dayName(day)
      return { open: false, label: `Closed. Opens ${formatTime(next.open)} ${when}` }
    }
  }

  return null
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * The week as a few lines ("Mon–Thu 8 AM–6 PM"), for places where seven rows
 * is too many: consecutive days with the same hours fold into one run,
 * Monday first, Sunday last. Two days read as a pair, three or more as a
 * range, and a week that never changes as "Every day".
 */
export function summarizeHours(hours: BusinessHours[]): { days: string; hours: string }[] {
  const week = [...hours].sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7))
  const label = (h: BusinessHours) =>
    h.closed ? 'Closed' : `${formatTime(h.open)}–${formatTime(h.close)}`

  const runs: { first: BusinessHours; last: BusinessHours; count: number; hours: string }[] = []
  for (const h of week) {
    const prev = runs[runs.length - 1]
    const consecutive = prev && (prev.last.day + 1) % 7 === h.day
    if (prev && consecutive && prev.hours === label(h)) {
      prev.last = h
      prev.count++
    } else {
      runs.push({ first: h, last: h, count: 1, hours: label(h) })
    }
  }

  if (runs.length === 1 && runs[0].count === 7) return [{ days: 'Every day', hours: runs[0].hours }]
  return runs.map((r) => ({
    days:
      r.count === 1
        ? SHORT_DAYS[r.first.day]
        : r.count === 2
          ? `${SHORT_DAYS[r.first.day]}, ${SHORT_DAYS[r.last.day]}`
          : `${SHORT_DAYS[r.first.day]}–${SHORT_DAYS[r.last.day]}`,
    hours: r.hours,
  }))
}
