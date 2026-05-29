import Image from 'next/image'
import { prisma } from '@/lib/db'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import Link from 'next/link'
import { CalendarCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const [settingsRow, categories] = await Promise.all([
    prisma.restaurantSettings.findUnique({ where: { id: 1 } }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        items: {
          where: { available: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    }),
  ])
  const settings = {
    address: settingsRow?.address ?? '2, Central Parade, Streatham High Rd, London SW16 1HT, United Kingdom',
    phone: settingsRow?.phone ?? '+442034902186',
    email: settingsRow?.email ?? 'hello@uzbekcorner.co.uk',
  }

  const nonEmpty = categories.filter((c) => (c.items?.length ?? 0) > 0)

  return (
    <>
      <SiteHeader />
      <main className="pt-28 md:pt-32">
        {/* Page header */}
        <section className="relative py-16 md:py-24 bg-navy text-white overflow-hidden">
          <div aria-hidden className="absolute inset-0 suzani-bg opacity-60" />
          <div className="relative mx-auto max-w-[1200px] px-5 md:px-8 text-center">
            <div className="eyebrow ornament text-gold">The menu</div>
            <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight">
              Dishes of <span className="text-gold">Uzbekistan</span>
            </h1>
            <p className="mt-5 max-w-2xl mx-auto text-white/75">
              Homemade Central-Asian cooking. Prices in GBP £. Vegetarian and halal-friendly options available — please ask your server.
            </p>
          </div>
        </section>

        {/* Sticky category pills */}
        {nonEmpty.length > 0 && (
          <div className="sticky top-16 md:top-20 z-20 bg-background/85 backdrop-blur border-b border-border">
            <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-3 flex gap-2 overflow-x-auto scrollbar-none">
              {nonEmpty.map((c) => (
                <a
                  key={c.id}
                  href={`#cat-${c.id}`}
                  className="shrink-0 px-4 py-1.5 text-sm rounded-full bg-muted text-navy/80 hover:bg-navy hover:text-gold transition-colors"
                >
                  {c.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-16 space-y-20">
          {nonEmpty.map((c, ci) => (
            <section key={c.id} id={`cat-${c.id}`} className={`scroll-mt-32 ${ci % 2 === 1 ? '' : ''}`}>
              <div className="text-center mb-10">
                <div className="eyebrow ornament text-navy/60">Course</div>
                <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-navy">{c.name}</h2>
                {c.description && <p className="mt-3 text-navy/65 max-w-xl mx-auto">{c.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {c.items.map((it) => (
                  <div
                    key={it.id}
                    className="group flex gap-4 rounded-lg bg-white p-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
                  >
                    <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 rounded-md overflow-hidden bg-muted">
                      {it.imageUrl ? (
                        <Image
                          src={it.imageUrl}
                          alt={it.name}
                          fill
                          sizes="160px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-navy/5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3">
                        <h3 className="font-display text-xl text-navy truncate">{it.name}</h3>
                        <span className="flex-1 border-b border-dashed border-border mt-2" />
                        <span className="font-mono text-sm text-[color:hsl(var(--accent))]">£{it.price.toFixed(2)}</span>
                      </div>
                      {it.description && (
                        <p className="mt-2 text-sm text-navy/65 leading-relaxed">{it.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {nonEmpty.length === 0 && (
            <div className="text-center text-navy/60 py-20">
              Our menu is being updated. Please check back shortly.
            </div>
          )}
        </div>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            <div className="rounded-lg bg-navy text-white p-10 md:p-14 text-center shadow-[var(--shadow-lg)] relative overflow-hidden">
              <div aria-hidden className="absolute inset-0 suzani-bg opacity-50" />
              <div className="relative">
                <div className="eyebrow text-gold">Ready?</div>
                <h3 className="mt-3 font-display text-3xl md:text-4xl tracking-tight">Book a table for this weekend</h3>
                <Link
                  href="/book"
                  className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gold text-navy font-medium shadow-md hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                >
                  <CalendarCheck size={18} /> Reserve now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter address={settings.address} phone={settings.phone} email={settings.email} />
    </>
  )
}
