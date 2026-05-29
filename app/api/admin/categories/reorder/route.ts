import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

// PATCH /api/admin/categories/reorder
// body: { categories: [{ id: string, sortOrder: number }] }
export async function PATCH(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const { categories } = await req.json()
  if (!Array.isArray(categories)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  await Promise.all(
    categories.map(({ id, sortOrder }: { id: string; sortOrder: number }) =>
      prisma.category.update({ where: { id }, data: { sortOrder } })
    )
  )

  return NextResponse.json({ ok: true })
}
