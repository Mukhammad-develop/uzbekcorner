import { prisma } from '@/lib/db'
import { blockedSlotsForBooking, generateSlots, getDayOfWeek } from '@/lib/time-utils'

export type TableAvailability = {
  tableId: string
  label: string
  capacity: number
  slots: { time: string; available: boolean }[]
}

/**
 * Compute availability for a date across all active tables that can seat `partySize`.
 * Honors opening hours for that weekday, slot interval, booking duration, and inclusive toggle.
 */
export async function getAvailabilityForDate(dateStr: string, partySize: number): Promise<{
  closed: boolean
  openTime: string
  closeTime: string
  allSlots: string[]
  tables: TableAvailability[]
}> {
  const settings = await prisma.restaurantSettings.findUnique({ where: { id: 1 } })
  const slotInterval = settings?.slotIntervalMin ?? 15
  const duration = settings?.bookingDurationMin ?? 60
  const inclusive = settings?.inclusive ?? true

  const dow = getDayOfWeek(dateStr)
  const oh = await prisma.openingHour.findUnique({ where: { dayOfWeek: dow } })
  if (!oh || oh.closed) {
    return { closed: true, openTime: oh?.openTime ?? '12:30', closeTime: oh?.closeTime ?? '21:30', allSlots: [], tables: [] }
  }

  const allSlots = generateSlots(oh.openTime, oh.closeTime, slotInterval, duration)
  const tables = await prisma.table.findMany({
    where: { active: true, capacity: { gte: Math.max(1, partySize) } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })

  const bookings = await prisma.booking.findMany({
    where: {
      date: dateStr,
      status: 'CONFIRMED',
      tableId: { in: tables.map((t) => t.id) },
    },
  })

  const result: TableAvailability[] = tables.map((t) => {
    const blocked = new Set<string>()
    for (const b of bookings.filter((x) => x.tableId === t.id)) {
      const dur = b.durationMin ?? duration
      const setForB = blockedSlotsForBooking(allSlots, b.startTime, dur, inclusive)
      for (const s of setForB) blocked.add(s)
    }
    return {
      tableId: t.id,
      label: t.label,
      capacity: t.capacity,
      slots: allSlots.map((s) => ({ time: s, available: !blocked.has(s) })),
    }
  })

  return { closed: false, openTime: oh.openTime, closeTime: oh.closeTime, allSlots, tables: result }
}
