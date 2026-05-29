import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

// PATCH /api/admin/menu-items/reorder
// body: { items: [{ id: string, sortOrder: number }] }
export async function PATCH(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const { items } = await req.json()
  if (!Array.isArray(items)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  await Promise.all(
    items.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
      prisma.menuItem.update({ where: { id }, data: { sortOrder } })
    )
  )

  return NextResponse.json({ ok: true })
}
