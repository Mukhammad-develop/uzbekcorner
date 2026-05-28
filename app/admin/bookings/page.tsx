import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { BookingsManager } from '@/components/admin/bookings-manager'

export const dynamic = 'force-dynamic'

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/admin/login')
  const tables = await prisma.table.findMany({ orderBy: [{ sortOrder: 'asc' }] })
  return <BookingsManager tables={tables.map((t) => ({ id: t.id, label: t.label }))} />
}
