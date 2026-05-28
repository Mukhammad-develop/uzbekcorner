import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await prisma.restaurantSettings.findUnique({ where: { id: 1 } })
    const hours = await prisma.openingHour.findMany({ orderBy: { dayOfWeek: 'asc' } })
    return NextResponse.json({
      settings: settings ?? null,
      hours,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ settings: null, hours: [] }, { status: 500 })
  }
}
