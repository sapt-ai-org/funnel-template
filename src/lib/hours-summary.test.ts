import { describe, expect, it } from 'vitest'
import type { BusinessHours } from '@/config/business'
import { summarizeHours } from './hours'

const day = (d: number, open: string, close: string, closed = false): BusinessHours => ({
  day: d as BusinessHours['day'],
  open,
  close,
  closed,
})

describe('summarizeHours', () => {
  it('folds a week into runs of days that keep the same hours, Monday first', () => {
    const week = [
      day(0, '00:00', '00:00', true),
      day(1, '08:00', '18:00'),
      day(2, '08:00', '18:00'),
      day(3, '08:00', '18:00'),
      day(4, '08:00', '18:00'),
      day(5, '08:00', '17:00'),
      day(6, '09:00', '14:00'),
    ]
    expect(summarizeHours(week)).toEqual([
      { days: 'Mon–Thu', hours: '8 AM–6 PM' },
      { days: 'Fri', hours: '8 AM–5 PM' },
      { days: 'Sat', hours: '9 AM–2 PM' },
      { days: 'Sun', hours: 'Closed' },
    ])
  })

  it('writes two days as a pair, not a range', () => {
    const week = [day(1, '08:00', '17:00'), day(2, '08:00', '17:00'), day(3, '09:00', '17:00')]
    expect(summarizeHours(week)[0]).toEqual({ days: 'Mon, Tue', hours: '8 AM–5 PM' })
  })

  it('says every day when the hours never change', () => {
    const week = [0, 1, 2, 3, 4, 5, 6].map((d) => day(d, '07:30', '19:00'))
    expect(summarizeHours(week)).toEqual([{ days: 'Every day', hours: '7:30 AM–7 PM' }])
  })
})
