import { describe, expect, it } from 'vitest'
import type { BusinessHours } from '@/config/business'
import { openStatus, shopClock } from './hours'

const WEEK: BusinessHours[] = [
  { day: 0, open: '00:00', close: '00:00', closed: true },
  { day: 1, open: '08:00', close: '18:00' },
  { day: 2, open: '08:00', close: '18:00' },
  { day: 3, open: '08:00', close: '18:00' },
  { day: 4, open: '08:00', close: '18:00' },
  { day: 5, open: '08:00', close: '17:00' },
  { day: 6, open: '09:00', close: '14:00' },
]

const at = (day: number, hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return { day, minutes: h * 60 + m }
}

describe('shopClock', () => {
  it('reads the time where the shop is, not where the visitor is', () => {
    // 15:30 UTC on a Wednesday is 11:30 in Ohio and 08:30 in California.
    const instant = new Date('2026-09-09T15:30:00Z')
    expect(shopClock(instant, 'America/New_York')).toEqual({ day: 3, minutes: 11 * 60 + 30 })
    expect(shopClock(instant, 'America/Los_Angeles')).toEqual({ day: 3, minutes: 8 * 60 + 30 })
  })

  it('rolls the day over at the shop’s midnight', () => {
    // 02:00 UTC Thursday is still Wednesday evening in Ohio.
    expect(shopClock(new Date('2026-09-10T02:00:00Z'), 'America/New_York')).toEqual({
      day: 3,
      minutes: 22 * 60,
    })
  })
})

describe('openStatus', () => {
  it('says when it closes while open', () => {
    expect(openStatus(WEEK, at(2, '10:15'))).toEqual({ open: true, label: 'Open until 6 PM' })
  })

  it('is closed at the closing minute, not after it', () => {
    expect(openStatus(WEEK, at(2, '18:00'))).toEqual({
      open: false,
      label: 'Closed. Opens 8 AM tomorrow',
    })
  })

  it('says it opens later today before opening', () => {
    expect(openStatus(WEEK, at(6, '07:45'))).toEqual({
      open: false,
      label: 'Closed. Opens 9 AM today',
    })
  })

  it('skips a closed day and names the next open one', () => {
    // Saturday evening, closed Sunday: next open is Monday.
    expect(openStatus(WEEK, at(6, '15:00'))).toEqual({
      open: false,
      label: 'Closed. Opens 8 AM Monday',
    })
  })

  it('says nothing rather than guessing when there are no hours', () => {
    expect(openStatus([], at(2, '10:00'))).toBeNull()
    expect(openStatus(WEEK.map((h) => ({ ...h, closed: true })), at(2, '10:00'))).toBeNull()
  })
})
