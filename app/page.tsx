import { prisma } from '@/lib/db'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { Hero } from '@/components/site/hero'
import { About } from '@/components/site/about'
import { MenuPreview } from '@/components/site/menu-preview'
import { VisitSection } from '@/components/site/visit-section'
import { CtaBand } from '@/components/site/cta-band'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [settingsRow, hours, items] = await Promise.all([
    prisma.restaurantSettings.findUnique({ where: { id: 1 } }),
    prisma.openingHour.findMany({ orderBy: { dayOfWeek: 'asc' } }),
    prisma.menuItem.findMany({
      where: { available: true, category: { active: true } },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }, { name: 'asc' }],
      take: 6,
    }),
  ])

  const settings = {
    restaurantName: settingsRow?.restaurantName ?? 'Uzbek Corner London',
    address: settingsRow?.address ?? 'Streatham High Rd, SW16, London, United Kingdom',
    phone: settingsRow?.phone ?? '+44 20 0000 0000',
    email: settingsRow?.email ?? 'hello@uzbekcorner.co.uk',
  }

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <About />
        <MenuPreview
          items={items.map((i) => ({
            id: i.id,
            name: i.name,
            description: i.description,
            price: i.price,
            imageUrl: i.imageUrl,
          }))}
        />
        <CtaBand />
        <VisitSection
          hours={hours.map((h) => ({
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            closed: h.closed,
          }))}
          address={settings.address}
          phone={settings.phone}
          email={settings.email}
        />
      </main>
      <SiteFooter address={settings.address} phone={settings.phone} email={settings.email} />
    </>
  )
}
