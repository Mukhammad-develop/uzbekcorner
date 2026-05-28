import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAvailabilityForDate } from '@/lib/availability'
import { sendBookingNotification } from '@/lib/notify'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const date = String(body?.date ?? '').trim()
    const tableId = String(body?.tableId ?? '').trim()
    const startTime = String(body?.startTime ?? '').trim()
    const partySize = parseInt(String(body?.partySize ?? '0'), 10)
    const customerName = String(body?.customerName ?? '').trim()
    const phone = String(body?.phone ?? '').trim()
    const email = String(body?.email ?? '').trim()
    const notes = body?.notes ? String(body.notes).trim() : null

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    if (!/^\d{2}:\d{2}$/.test(startTime)) return NextResponse.json({ error: 'Invalid time' }, { status: 400 })
    if (!tableId) return NextResponse.json({ error: 'Table is required' }, { status: 400 })
    if (!partySize || partySize < 1) return NextResponse.json({ error: 'Party size must be >= 1' }, { status: 400 })
    if (!customerName || !phone || !email) return NextResponse.json({ error: 'Name, phone and email are required' }, { status: 400 })

    // Re-validate availability server-side to prevent double-booking.
    const availability = await getAvailabilityForDate(date, partySize)
    if (availability.closed) return NextResponse.json({ error: 'We are closed on this date.' }, { status: 400 })
    const table = availability.tables.find((t) => t.tableId === tableId)
    if (!table) return NextResponse.json({ error: 'Table unavailable for this party size.' }, { status: 400 })
    const slot = table.slots.find((s) => s.time === startTime)
    if (!slot || !slot.available) return NextResponse.json({ error: 'This slot is no longer available. Please pick another.' }, { status: 409 })

    const settings = await prisma.restaurantSettings.findUnique({ where: { id: 1 } })
    const duration = settings?.bookingDurationMin ?? 60

    const booking = await prisma.booking.create({
      data: {
        tableId,
        date,
        startTime,
        durationMin: duration,
        partySize,
        customerName,
        phone,
        email,
        notes,
        status: 'CONFIRMED',
      },
      include: { table: true },
    })

    // Fire notification (don't block on failure)
    sendBookingNotification({
      customerName,
      phone,
      email,
      date,
      time: startTime,
      partySize,
      tableLabel: booking.table.label,
      notes,
    }).catch((e) => console.warn('notify failed', e))

    return NextResponse.json({ ok: true, booking: { id: booking.id, date, startTime, table: booking.table.label } })
  } catch (err) {
    console.error('booking error', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
