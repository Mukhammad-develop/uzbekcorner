import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        items: {
          where: { available: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    })
    return NextResponse.json({ categories })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ categories: [] }, { status: 500 })
  }
}
