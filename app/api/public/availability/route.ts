import { NextResponse } from 'next/server'
import { getAvailabilityForDate } from '@/lib/availability'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const date = url.searchParams.get('date') ?? ''
    const partySize = parseInt(url.searchParams.get('partySize') ?? '2', 10) || 2
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    const data = await getAvailabilityForDate(date, partySize)
    return NextResponse.json(data)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 })
  }
}
