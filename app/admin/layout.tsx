import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Admin · Uzbek Corner London' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  return (
    <AdminShell session={session ? { name: session.user?.name ?? null, email: session.user?.email ?? null } : null}>
      {children}
    </AdminShell>
  )
}
