import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requireAdmin(); if (guard) return guard
  const tables = await prisma.table.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] })
  return NextResponse.json({ tables })
}

export async function POST(req: Request) {
  const guard = await requireAdmin(); if (guard) return guard
  try {
    const body = await req.json().catch(() => ({}))
    const label = String(body?.label ?? '').trim()
    const capacity = parseInt(String(body?.capacity ?? '0'), 10)
    const sortOrder = parseInt(String(body?.sortOrder ?? '0'), 10) || 0
    const active = body?.active === undefined ? true : Boolean(body?.active)
    if (!label || !capacity) return NextResponse.json({ error: 'Label and capacity required' }, { status: 400 })
    const t = await prisma.table.create({ data: { label, capacity, sortOrder, active } })
    return NextResponse.json({ ok: true, table: t })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
