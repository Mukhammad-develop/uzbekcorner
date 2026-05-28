import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { CalendarClock, Armchair, UtensilsCrossed, Mail, Settings as SettingsIcon } from 'lucide-react'
import { todayISO, formatNiceDate } from '@/lib/time-utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/admin/login')

  const today = todayISO()
  const [todayBookings, upcoming, tables, items, emails] = await Promise.all([
    prisma.booking.count({ where: { date: today, status: 'CONFIRMED' } }),
    prisma.booking.findMany({
      where: { date: { gte: today }, status: 'CONFIRMED' },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      include: { table: true },
      take: 8,
    }),
    prisma.table.count({ where: { active: true } }),
    prisma.menuItem.count({ where: { available: true } }),
    prisma.notificationEmail.count(),
  ])

  const stats = [
    { label: "Today's bookings", value: todayBookings, href: `/admin/bookings?date=${today}`, icon: CalendarClock },
    { label: 'Active tables', value: tables, href: '/admin/tables', icon: Armchair },
    { label: 'Available dishes', value: items, href: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Notification recipients', value: emails, href: '/admin/emails', icon: Mail },
  ]

  return (
    <div className="space-y-8">
      <div>
        <div className="eyebrow text-navy/60">Welcome back</div>
        <h1 className="mt-2 font-display text-3xl md:text-4xl tracking-tight text-navy">Uzbek Corner — control panel</h1>
        <p className="mt-2 text-navy/65 text-sm">Review today’s bookings, manage tables and the menu, and configure reservations.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-lg bg-white p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all"
            >
              <div className="flex items-center justify-between">
                <Icon size={16} className="text-[color:hsl(var(--accent))]" />
                <span className="text-[10px] uppercase tracking-[0.22em] text-navy/50 group-hover:text-navy">View</span>
              </div>
              <div className="mt-5 font-display text-3xl text-navy">{s.value}</div>
              <div className="mt-1 text-xs text-navy/55">{s.label}</div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg bg-white p-6 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-navy">Upcoming bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-[color:hsl(var(--accent))] hover:underline">All bookings →</Link>
          </div>
          <div className="mt-4 divide-y divide-border">
            {upcoming.length === 0 && (
              <div className="py-10 text-center text-navy/55 text-sm">No upcoming bookings yet.</div>
            )}
            {upcoming.map((b) => (
              <div key={b.id} className="py-3 flex items-center gap-4 text-sm">
                <div className="font-mono text-navy/80 min-w-[72px]">{b.startTime}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-navy font-medium truncate">{b.customerName} · {b.partySize} guests</div>
                  <div className="text-navy/55 text-xs truncate">{formatNiceDate(b.date)} · {b.table.label}</div>
                </div>
                <div className="text-xs text-navy/55 hidden sm:block">{b.phone}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-navy text-white p-6 shadow-[var(--shadow-md)] relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 suzani-bg opacity-40" />
          <div className="relative">
            <div className="eyebrow text-gold">Quick actions</div>
            <h3 className="mt-2 font-display text-xl">Manage reservations</h3>
            <div className="mt-5 flex flex-col gap-2">
              <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white/10 hover:bg-white/20 text-sm">
                <SettingsIcon size={14} /> Hours, slot interval & duration
              </Link>
              <Link href="/admin/tables" className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white/10 hover:bg-white/20 text-sm">
                <Armchair size={14} /> Tables & capacity
              </Link>
              <Link href="/admin/menu" className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white/10 hover:bg-white/20 text-sm">
                <UtensilsCrossed size={14} /> Menu categories & items
              </Link>
              <Link href="/admin/emails" className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-gold text-navy font-medium text-sm hover:shadow-md">
                <Mail size={14} /> Notification emails
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
