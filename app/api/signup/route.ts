import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email ?? '').trim().toLowerCase()
    const password = String(body?.password ?? '')
    const name = body?.name ? String(body.name) : null
    if (!email || !password) return NextResponse.json({ error: 'Email and password required.' }, { status: 400 })
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Account already exists.' }, { status: 400 })
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { email, password: hashed, name, role: 'ADMIN' } })
    return NextResponse.json({ ok: true, id: user.id, email: user.email })
  } catch (err) {
    console.error('signup error', err)
    return NextResponse.json({ error: 'Signup failed.' }, { status: 500 })
  }
}
