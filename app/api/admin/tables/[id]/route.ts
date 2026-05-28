import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(); if (guard) return guard
  try {
    const body = await req.json().catch(() => ({}))
    const data: any = {}
    if (body?.label !== undefined) data.label = String(body.label)
    if (body?.capacity !== undefined) data.capacity = parseInt(String(body.capacity), 10)
    if (body?.sortOrder !== undefined) data.sortOrder = parseInt(String(body.sortOrder), 10) || 0
    if (body?.active !== undefined) data.active = Boolean(body.active)
    const t = await prisma.table.update({ where: { id: params.id }, data })
    return NextResponse.json({ ok: true, table: t })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(); if (guard) return guard
  try {
    await prisma.table.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
