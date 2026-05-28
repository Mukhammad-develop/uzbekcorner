import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(); if (guard) return guard
  try {
    const body = await req.json().catch(() => ({}))
    const data: any = {}
    if (body?.categoryId !== undefined) data.categoryId = String(body.categoryId)
    if (body?.name !== undefined) data.name = String(body.name)
    if (body?.description !== undefined) data.description = body.description ? String(body.description) : null
    if (body?.price !== undefined) {
      const p = parseFloat(String(body.price)); if (!isNaN(p)) data.price = p
    }
    if (body?.imageUrl !== undefined) data.imageUrl = body.imageUrl ? String(body.imageUrl) : null
    if (body?.imageKey !== undefined) data.imageKey = body.imageKey ? String(body.imageKey) : null
    if (body?.sortOrder !== undefined) data.sortOrder = parseInt(String(body.sortOrder), 10) || 0
    if (body?.available !== undefined) data.available = Boolean(body.available)
    const item = await prisma.menuItem.update({ where: { id: params.id }, data })
    return NextResponse.json({ ok: true, item })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(); if (guard) return guard
  try {
    await prisma.menuItem.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
