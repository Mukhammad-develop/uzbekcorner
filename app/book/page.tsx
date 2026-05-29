import { prisma } from '@/lib/db'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { BookingFlow } from '@/components/site/booking-flow'
import { Breadcrumb } from '@/components/site/breadcrumb'

export const dynamic = 'force-dynamic'

export default async function BookPage() {
  const settingsRow = await prisma.restaurantSettings.findUnique({ where: { id: 1 } })
  const settings = {
    address: settingsRow?.address ?? '2, Central Parade, Streatham High Rd, London SW16 1HT, United Kingdom',
    phone: settingsRow?.phone ?? '+442034902186',
    email: settingsRow?.email ?? 'hello@uzbekcorner.uk',
    bookingDurationMin: settingsRow?.bookingDurationMin ?? 60,
    instagramUrl: settingsRow?.instagramUrl,
    facebookUrl: settingsRow?.facebookUrl,
    tiktokUrl: settingsRow?.tiktokUrl,
    googleBusinessUrl: settingsRow?.googleBusinessUrl,
  }

  return (
    <>
      <SiteHeader />
      <main className="pt-28 md:pt-32 pb-4">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <Breadcrumb items={[{ label: 'Book a Table', url: '/book' }]} />
        </div>
        <section className="relative py-14 md:py-20 bg-navy text-white overflow-hidden mt-2">
          <div aria-hidden className="absolute inset-0 suzani-bg opacity-60" />
          <div className="relative mx-auto max-w-[1200px] px-5 md:px-8 text-center">
            <div className="eyebrow ornament text-gold">Reservations</div>
            <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight">
              Reserve your <span className="text-gold">table</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-white/75">
              Pick a date, tell us the size of your party, and we’ll show tables and times that are free. Bookings are held for {settings.bookingDurationMin} minutes from your chosen time.
            </p>
          </div>
        </section>

        <BookingFlow />
      </main>
      <SiteFooter
        address={settings.address}
        phone={settings.phone}
        email={settings.email}
        instagramUrl={settings.instagramUrl}
        facebookUrl={settings.facebookUrl}
        tiktokUrl={settings.tiktokUrl}
        googleBusinessUrl={settings.googleBusinessUrl}
      />
    </>
  )
}
