import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { NotificationEmails } from '@/components/admin/notification-emails'

export const dynamic = 'force-dynamic'

export default async function AdminEmailsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/admin/login')
  const emails = await prisma.notificationEmail.findMany({ orderBy: { createdAt: 'asc' } })
  return <NotificationEmails initial={emails.map((e) => ({ id: e.id, email: e.email }))} />
}
