import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requireAdmin(); if (guard) return guard
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { items: { orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] } },
  })
  return NextResponse.json({ categories })
}

export async function POST(req: Request) {
  const guard = await requireAdmin(); if (guard) return guard
  try {
    const body = await req.json().catch(() => ({}))
    const name = String(body?.name ?? '').trim()
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const cat = await prisma.category.create({
      data: {
        name,
        description: body?.description ? String(body.description) : null,
        sortOrder: parseInt(String(body?.sortOrder ?? '0'), 10) || 0,
        active: body?.active === undefined ? true : Boolean(body.active),
      },
    })
    return NextResponse.json({ ok: true, category: cat })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
