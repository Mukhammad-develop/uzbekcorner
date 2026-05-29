import Link from 'next/link'
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react'

export function SiteFooter({
  address,
  phone,
  email,
  instagramUrl,
  facebookUrl,
  tiktokUrl,
  googleBusinessUrl,
}: {
  address: string
  phone: string
  email: string
  instagramUrl?: string | null
  facebookUrl?: string | null
  tiktokUrl?: string | null
  googleBusinessUrl?: string | null
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
            Homemade Plov, Somsa, Lagman and Shashlik — an authentic taste of Central Asia in Streatham.
          </p>

          {(instagramUrl || facebookUrl || tiktokUrl || googleBusinessUrl) && (
            <div className="mt-6 flex items-center gap-4">
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors text-white/70" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors text-white/70" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
              )}
              {tiktokUrl && (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors text-white/70" aria-label="TikTok">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.74 4.05 1.11.97 2.61 1.48 4.07 1.51v3.91c-1.39-.08-2.78-.56-3.89-1.42-.64-.5-1.16-1.14-1.54-1.87v7.65c-.07 2.45-1.12 4.88-3.04 6.42-1.92 1.63-4.66 2.37-7.12 1.83-2.61-.51-4.96-2.22-6.12-4.63C-.86 14.18-.7 10.6 1.7 8.04c1.8-1.98 4.62-2.9 7.24-2.3v4.06c-1.38-.45-3 .02-3.86 1.16-.92 1.16-.92 2.97.02 4.13.92 1.2 2.68 1.63 4.02.99 1.11-.47 1.77-1.63 1.77-2.82V.02h1.67z" />
                  </svg>
                </a>
              )}
              {googleBusinessUrl && (
                <a href={googleBusinessUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors text-white/70" aria-label="Google Business">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.437-2.883-6.437-6.437 0-3.555 2.882-6.437 6.437-6.437 1.587 0 3.03.58 4.15 1.528l3.078-3.078C18.995 2.09 15.842 1 12.24 1 5.92 1 1 5.92 1 12s4.92 11 11.24 11c6.58 0 11.24-4.62 11.24-11.24 0-.75-.08-1.48-.24-2.185l-11 0z" />
                  </svg>
                </a>
              )}
            </div>
          )}
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
          <span>2, Central Parade, Streatham High Rd · SW16 1HT · United Kingdom</span>
        </div>
      </div>
    </footer>
  )
}
