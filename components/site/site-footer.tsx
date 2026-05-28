import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'

export function SiteFooter({
  address,
  phone,
  email,
}: {
  address: string
  phone: string
  email: string
}) {
  return (
    <footer className="mt-24 bg-navy" style={{ color: 'rgba(255,255,255,0.85)' }}>
      <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gold text-navy font-display">UC</span>
            <span className="font-display text-lg text-gold tracking-wide">Uzbek Corner London</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Homemade Plov, Somsa, Lagman and Shashlik — an authentic taste of Central Asia on Queensway.
          </p>
        </div>

        <div className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
          <div className="eyebrow text-gold">Visit</div>
          <div className="flex items-start gap-3">
            <MapPin size={16} className="mt-0.5 text-gold shrink-0" />
            <span>{address}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-gold shrink-0" />
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-gold" style={{ color: 'inherit' }}>{phone}</a>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-gold shrink-0" />
            <a href={`mailto:${email}`} className="hover:text-gold" style={{ color: 'inherit' }}>{email}</a>
          </div>
        </div>

        <div className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
          <div className="eyebrow text-gold">Explore</div>
          <div className="flex flex-col gap-2">
            <Link href="/menu" className="hover:text-gold" style={{ color: 'inherit' }}>Menu</Link>
            <Link href="/book" className="hover:text-gold" style={{ color: 'inherit' }}>Book a table</Link>
            <Link href="/#visit" className="hover:text-gold" style={{ color: 'inherit' }}>Opening hours</Link>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-5 text-xs flex flex-col md:flex-row items-center justify-between gap-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
          <span>© 2026 Uzbek Corner London</span>
          <span>Queensway 23-25 · W2 4QJ · United Kingdom</span>
        </div>
      </div>
    </footer>
  )
}
