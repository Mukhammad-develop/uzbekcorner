import { prisma } from '@/lib/db'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { Hero } from '@/components/site/hero'
import { About } from '@/components/site/about'
import { MenuPreview } from '@/components/site/menu-preview'
import { VisitSection } from '@/components/site/visit-section'
import { CtaBand } from '@/components/site/cta-band'
import { Testimonials } from '@/components/site/testimonials'

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
    address: settingsRow?.address ?? '2, Central Parade, Streatham High Rd, London SW16 1HT, United Kingdom',
    phone: settingsRow?.phone ?? '+442034902186',
    email: settingsRow?.email ?? 'hello@uzbekcorner.uk',
    instagramUrl: settingsRow?.instagramUrl,
    facebookUrl: settingsRow?.facebookUrl,
    tiktokUrl: settingsRow?.tiktokUrl,
    googleBusinessUrl: settingsRow?.googleBusinessUrl,
  }

  const socialLinks = [
    settings.instagramUrl,
    settings.facebookUrl,
    settings.tiktokUrl,
    settings.googleBusinessUrl,
  ].filter(Boolean) as string[]

  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': 'https://uzbekcorner.uk',
    name: settings.restaurantName,
    image: 'https://uzbekcorner.uk/og-image.png',
    url: 'https://uzbekcorner.uk',
    telephone: settings.phone,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
      addressLocality: 'London',
      postalCode: 'SW16 1HT',
      addressCountry: 'GB',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 51.4301,
      longitude: -0.1329,
    },
    openingHoursSpecification: hours.map((h) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: days[h.dayOfWeek],
        opens: h.closed ? '00:00' : h.openTime,
        closes: h.closed ? '00:00' : h.closeTime,
      }
    }),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '182',
      bestRating: '5',
      worstRating: '1',
    },
    sameAs: socialLinks,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
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
        <Testimonials />
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
