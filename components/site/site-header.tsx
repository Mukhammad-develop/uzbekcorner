'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/menu', label: 'Menu' },
  { href: '/blog', label: 'Blog' },
  { href: '/book', label: 'Book a table' },
  { href: '/#visit', label: 'Visit' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled((window?.scrollY ?? 0) > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'backdrop-blur-md bg-background/85 shadow-[0_2px_12px_rgba(19,29,87,0.08)]'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8 flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-navy text-gold font-display text-lg shadow-md group-hover:scale-105 transition-transform">
            UC
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[17px] text-navy tracking-wide">Uzbek Corner</span>
            <span className="eyebrow text-[10px] mt-1">London · SW16</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => {
            const active = l.href === pathname || (l.href !== '/' && pathname?.startsWith(l.href))
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'px-4 py-2 rounded-full text-sm transition-colors',
                  active
                    ? 'bg-navy text-gold'
                    : 'text-navy/80 hover:bg-navy/5 hover:text-navy',
                )}
              >
                {l.label}
              </Link>
            )
          })}
          <Link
            href="/book"
            className="ml-2 px-5 py-2 rounded-full bg-gold text-navy font-medium text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Reserve
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full bg-navy/5 text-navy"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto max-w-[1200px] px-5 py-4 flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-[15px] text-navy hover:bg-navy/5"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setMobileOpen(false)}
              className="mt-2 px-5 py-3 rounded-full bg-gold text-navy font-medium text-center"
            >
              Reserve
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
