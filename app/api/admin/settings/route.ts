import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requireAdmin(); if (guard) return guard
  const settings = await prisma.restaurantSettings.findUnique({ where: { id: 1 } })
  const hours = await prisma.openingHour.findMany({ orderBy: { dayOfWeek: 'asc' } })
  return NextResponse.json({ settings, hours })
}

export async function PATCH(req: Request) {
  const guard = await requireAdmin(); if (guard) return guard
  try {
    const body = await req.json().catch(() => ({}))
    const settings = body?.settings
    const hours = body?.hours

    if (settings) {
      await prisma.restaurantSettings.upsert({
        where: { id: 1 },
        update: {
          slotIntervalMin: Number(settings.slotIntervalMin ?? 15),
          bookingDurationMin: Number(settings.bookingDurationMin ?? 60),
          inclusive: Boolean(settings.inclusive),
          restaurantName: String(settings.restaurantName ?? 'Uzbek Corner London'),
          address: String(settings.address ?? ''),
          phone: String(settings.phone ?? ''),
          email: String(settings.email ?? ''),
          instagramUrl: settings.instagramUrl ? String(settings.instagramUrl) : null,
          facebookUrl: settings.facebookUrl ? String(settings.facebookUrl) : null,
          tiktokUrl: settings.tiktokUrl ? String(settings.tiktokUrl) : null,
          googleBusinessUrl: settings.googleBusinessUrl ? String(settings.googleBusinessUrl) : null,
        },
        create: {
          id: 1,
          slotIntervalMin: Number(settings.slotIntervalMin ?? 15),
          bookingDurationMin: Number(settings.bookingDurationMin ?? 60),
          inclusive: Boolean(settings.inclusive),
          restaurantName: String(settings.restaurantName ?? 'Uzbek Corner London'),
          address: String(settings.address ?? ''),
          phone: String(settings.phone ?? ''),
          email: String(settings.email ?? ''),
          instagramUrl: settings.instagramUrl ? String(settings.instagramUrl) : null,
          facebookUrl: settings.facebookUrl ? String(settings.facebookUrl) : null,
          tiktokUrl: settings.tiktokUrl ? String(settings.tiktokUrl) : null,
          googleBusinessUrl: settings.googleBusinessUrl ? String(settings.googleBusinessUrl) : null,
        },
      })
    }

    if (Array.isArray(hours)) {
      for (const h of hours) {
        const dow = Number(h?.dayOfWeek)
        if (dow < 0 || dow > 6) continue
        await prisma.openingHour.upsert({
          where: { dayOfWeek: dow },
          update: {
            openTime: String(h?.openTime ?? '12:30'),
            closeTime: String(h?.closeTime ?? '21:30'),
            closed: Boolean(h?.closed),
          },
          create: {
            dayOfWeek: dow,
            openTime: String(h?.openTime ?? '12:30'),
            closeTime: String(h?.closeTime ?? '21:30'),
            closed: Boolean(h?.closed),
          },
        })
      }
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
