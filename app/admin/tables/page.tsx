import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { TablesManager } from '@/components/admin/tables-manager'

export const dynamic = 'force-dynamic'

export default async function AdminTablesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/admin/login')
  const tables = await prisma.table.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] })
  return <TablesManager initialTables={tables.map((t) => ({ id: t.id, label: t.label, capacity: t.capacity, sortOrder: t.sortOrder, active: t.active }))} />
}
