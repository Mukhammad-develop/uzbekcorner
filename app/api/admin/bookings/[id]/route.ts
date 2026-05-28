import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(); if (guard) return guard
  try {
    const body = await req.json().catch(() => ({}))
    const data: any = {}
    if (body?.status) data.status = String(body.status)
    if (body?.notes !== undefined) data.notes = body.notes ? String(body.notes) : null
    const b = await prisma.booking.update({ where: { id: params.id }, data, include: { table: true } })
    return NextResponse.json({ ok: true, booking: b })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(); if (guard) return guard
  try {
    await prisma.booking.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
