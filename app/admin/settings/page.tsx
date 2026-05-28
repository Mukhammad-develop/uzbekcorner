import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { SettingsForm } from '@/components/admin/settings-form'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/admin/login')
  const settings = await prisma.restaurantSettings.findUnique({ where: { id: 1 } })
  const hours = await prisma.openingHour.findMany({ orderBy: { dayOfWeek: 'asc' } })
  return <SettingsForm
    initialSettings={settings ? {
      slotIntervalMin: settings.slotIntervalMin,
      bookingDurationMin: settings.bookingDurationMin,
      inclusive: settings.inclusive,
      restaurantName: settings.restaurantName,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
    } : null}
    initialHours={hours.map((h) => ({ dayOfWeek: h.dayOfWeek, openTime: h.openTime, closeTime: h.closeTime, closed: h.closed }))}
  />
}
