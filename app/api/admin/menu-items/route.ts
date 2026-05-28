import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const guard = await requireAdmin(); if (guard) return guard
  try {
    const body = await req.json().catch(() => ({}))
    const categoryId = String(body?.categoryId ?? '').trim()
    const name = String(body?.name ?? '').trim()
    const price = parseFloat(String(body?.price ?? '0'))
    if (!categoryId || !name) return NextResponse.json({ error: 'Category and name required' }, { status: 400 })
    const item = await prisma.menuItem.create({
      data: {
        categoryId,
        name,
        price: isNaN(price) ? 0 : price,
        description: body?.description ? String(body.description) : null,
        imageUrl: body?.imageUrl ? String(body.imageUrl) : null,
        imageKey: body?.imageKey ? String(body.imageKey) : null,
        sortOrder: parseInt(String(body?.sortOrder ?? '0'), 10) || 0,
        available: body?.available === undefined ? true : Boolean(body.available),
      },
    })
    return NextResponse.json({ ok: true, item })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
