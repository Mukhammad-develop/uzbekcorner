// Utilities for generating booking time slots and computing availability.

export function toMinutes(hhmm: string): number {
  if (!hhmm) return 0
  const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10))
  return (h ?? 0) * 60 + (m ?? 0)
}

export function toHHMM(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Generate all bookable start-times (HH:mm) between openTime and closeTime at `intervalMin` steps.
 * A slot is bookable if `slotStart + durationMin <= closeTime` (so the booking ends before/at closing).
 */
export function generateSlots(
  openTime: string,
  closeTime: string,
  intervalMin: number,
  durationMin: number,
): string[] {
  const open = toMinutes(openTime)
  const close = toMinutes(closeTime)
  const out: string[] = []
  if (!intervalMin || intervalMin <= 0) return out
  for (let t = open; t + durationMin <= close; t += intervalMin) {
    out.push(toHHMM(t))
  }
  return out
}

/**
 * Compute the set of slot start-times (HH:mm) that are blocked by a single booking.
 * - inclusive = true:  blocks slots where slotMinutes in [bookingStart, bookingStart + duration]  (end INCLUDED)
 * - inclusive = false: blocks slots where slotMinutes in [bookingStart, bookingStart + duration)  (end EXCLUDED)
 *
 * Slot minutes are determined by the caller (they should use the same intervalMin used to generate slots).
 */
export function blockedSlotsForBooking(
  allSlots: string[],
  bookingStart: string,
  durationMin: number,
  inclusive: boolean,
): Set<string> {
  const s = toMinutes(bookingStart)
  const e = s + durationMin
  const blocked = new Set<string>()
  for (const slot of allSlots) {
    const t = toMinutes(slot)
    if (inclusive) {
      if (t >= s && t <= e) blocked.add(slot)
    } else {
      if (t >= s && t < e) blocked.add(slot)
    }
  }
  return blocked
}

export function getDayOfWeek(dateStr: string): number {
  // dateStr like 'YYYY-MM-DD'. Return JS getDay (0 = Sun .. 6 = Sat).
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10))
  // Use UTC to avoid local-tz surprises; day-of-week for a date is tz-free.
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1))
  return dt.getUTCDay()
}

export function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatNiceDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map((n) => parseInt(n, 10))
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1))
  return dt.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
