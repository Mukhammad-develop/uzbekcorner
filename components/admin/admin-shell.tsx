'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import {
  LayoutDashboard, CalendarClock, Armchair, UtensilsCrossed, Settings, Mail, LogOut, Menu, X, Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarClock },
  { href: '/admin/tables', label: 'Tables', icon: Armchair },
  { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/emails', label: 'Notification Emails', icon: Mail },
]

export function AdminShell({
  session,
  children,
}: {
  session: { name: string | null; email: string | null } | null
  children: React.ReactNode
}) {
  const pathname = usePathname() ?? ''
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  // On the login page, render just the children.
  if (pathname.startsWith('/admin/login')) {
    return <>{children}</>
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.replace('/admin/login')
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Top bar (mobile) */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-navy text-white border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gold text-navy font-display text-sm">UC</span>
            <span className="font-display text-[15px] text-gold">Uzbek Admin</span>
          </Link>
          <button onClick={() => setMobileOpen((v) => !v)} className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/10">
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 bg-navy text-white transform transition-transform duration-200 md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}>
        <div className="h-16 px-5 flex items-center gap-3 border-b border-white/10">
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gold text-navy font-display text-sm">UC</span>
          <div className="leading-none">
            <div className="font-display text-gold text-[15px]">Uzbek Admin</div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-white/60 mt-1">Control panel</div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.href : pathname === n.href || pathname.startsWith(n.href + '/')
            const Icon = n.icon
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                  active ? 'bg-white/10 text-gold' : 'text-white/80 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon size={16} />
                <span>{n.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-white/10">
          <div className="px-2 py-2 text-xs text-white/60">
            <div className="truncate">{session?.name ?? 'Admin'}</div>
            <div className="truncate text-white/45">{session?.email ?? ''}</div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-md bg-white/5 hover:bg-white/10 text-white/80 text-xs"
            >
              <Home size={14} /> Website
            </Link>
            <button
              onClick={handleSignOut}
              className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-md bg-gold/90 hover:bg-gold text-navy text-xs font-medium"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="md:pl-64 pt-14 md:pt-0">
        <div className="px-5 md:px-8 py-6 md:py-8 max-w-[1200px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
