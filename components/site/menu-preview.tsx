'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

type Item = {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
}

type Category = {
  id: string
  name: string
}

export function MenuPreview({ items, categories }: { items: Item[]; categories: Category[] }) {
  const safeItems = (items ?? []).slice(0, 6)
  return (
    <section id="menu-preview" className="py-24 md:py-32 bg-muted/40">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="eyebrow text-navy/60 ornament">From the kitchen</div>
            <h2 className="mt-3 font-display text-4xl md:text-5xl tracking-tight text-navy">
              Dishes our <span className="text-[color:hsl(var(--accent))]">guests</span> return for
            </h2>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 self-start md:self-auto px-5 py-2.5 rounded-full bg-navy text-gold text-sm hover:bg-navy/90 shadow-md hover:shadow-lg transition-all"
          >
            See full menu
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Category Deep Links for Premium SEO */}
        {categories && categories.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <span className="text-xs uppercase tracking-[0.18em] font-medium text-navy/55 mr-2">Jump to category:</span>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/menu#cat-${c.id}`}
                className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white border border-navy/10 text-navy hover:bg-gold hover:border-gold hover:text-navy transition-all duration-300 shadow-[var(--shadow-xs)] hover:-translate-y-0.5 hover:shadow-sm"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeItems.map((it, idx) => (
            <motion.div
              key={it?.id ?? idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: (idx % 3) * 0.08 }}
              className="group rounded-lg overflow-hidden bg-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] transition-shadow"
            >
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                {it?.imageUrl ? (
                  <Image
                    src={it.imageUrl}
                    alt={it?.name ?? 'Dish'}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-navy/5" />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl text-navy">{it?.name ?? ''}</h3>
                  <span className="font-mono text-sm text-[color:hsl(var(--accent))]">£{(it?.price ?? 0).toFixed(2)}</span>
                </div>
                {it?.description && (
                  <p className="mt-2 text-sm text-navy/65 leading-relaxed line-clamp-3">{it.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {safeItems.length === 0 && (
          <div className="mt-12 text-center text-navy/60">Menu coming soon.</div>
        )}
      </div>
    </section>
  )
}
