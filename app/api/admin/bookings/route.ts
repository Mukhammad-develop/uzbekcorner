import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const guard = await requireAdmin(); if (guard) return guard
  const url = new URL(req.url)
  const date = url.searchParams.get('date') || undefined
  const tableId = url.searchParams.get('tableId') || undefined
  const status = url.searchParams.get('status') || undefined
  const where: any = {}
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) where.date = date
  if (tableId) where.tableId = tableId
  if (status) where.status = status
  const bookings = await prisma.booking.findMany({
    where,
    orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
    include: { table: true },
    take: 500,
  })
  return NextResponse.json({ bookings })
}
