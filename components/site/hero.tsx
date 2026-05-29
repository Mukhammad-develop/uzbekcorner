'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { CalendarCheck, UtensilsCrossed } from 'lucide-react'

const HERO_URL =
  'https://www.allrecipes.com/thmb/m6YXFp58z7PofDxNbHx_QEsni0E=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/4580553-2998dabe4f724ab79011677bad29a5c7.jpg'

export function Hero() {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollY } = useScroll()
  // Gentle parallax on the background image only.
  const y = useTransform(scrollY, [0, 600], [0, 120])
  const overlayOpacity = useTransform(scrollY, [0, 300], [0.55, 0.75])

  return (
    <section
      ref={ref}
      className="relative overflow-hidden min-h-[86vh] flex items-center justify-center text-white"
    >
      {/* Parallax image */}
      <motion.div
        aria-hidden
        style={{ y, backgroundImage: `url('${HERO_URL}')` }}
        className="absolute inset-0 -top-10 -bottom-10 bg-cover bg-center will-change-transform"
      />
      {/* Dark gradient */}
      <motion.div
        aria-hidden
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/55 to-navy"
      />
      {/* Subtle pattern */}
      <div aria-hidden className="absolute inset-0 suzani-bg opacity-60" />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 md:px-8 py-28 md:py-40 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="eyebrow text-gold ornament flex items-center justify-center text-white/80"
        >
          Uzbek Corner London
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl tracking-tight mt-6 leading-[1.02]"
        >
          A <span className="text-gold">homemade</span> Uzbek table
          <br className="hidden md:block" /> in the heart of Streatham.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-6 max-w-2xl mx-auto text-white/80 text-lg leading-relaxed"
        >
          Plov simmered in the kazan, somsa straight from the tandoor, and bowls of lagman shared across the table. A warm Central-Asian welcome, minutes from Kensington Gardens.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gold text-navy font-medium shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all"
          >
            <CalendarCheck size={18} />
            Book a table
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 border border-white/20 transition-all"
          >
            <UtensilsCrossed size={18} />
            Explore the menu
          </Link>
        </motion.div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-[0.22em] text-white/65">
          <span>Halal options</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>Vegetarian</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>Groups 4 – 14</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>Streatham SW16</span>
        </div>
      </div>
    </section>
  )
}
