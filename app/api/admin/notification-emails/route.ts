import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requireAdmin(); if (guard) return guard
  const emails = await prisma.notificationEmail.findMany({ orderBy: { createdAt: 'asc' } })
  return NextResponse.json({ emails })
}

export async function POST(req: Request) {
  const guard = await requireAdmin(); if (guard) return guard
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email ?? '').trim().toLowerCase()
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    const existing = await prisma.notificationEmail.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Already added' }, { status: 400 })
    const row = await prisma.notificationEmail.create({ data: { email } })
    return NextResponse.json({ ok: true, email: row })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Create failed' }, { status: 500 })
  }
}
