import { Star } from 'lucide-react'

type Testimonial = {
  id: string
  name: string
  role?: string
  content: string
  rating: number
  date: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    role: 'Local Guide',
    content: 'The most authentic Plov I have had outside of Tashkent! Perfectly spiced, tender meat, and the carrot-to-rice ratio is spot on. The service is incredibly warm and welcoming.',
    rating: 5,
    date: 'May 2026',
  },
  {
    id: '2',
    name: 'Dilshod Akhmedov',
    content: 'Sensational Somsa! Crisp, flaky pastry with rich, succulent lamb filling. Uzbek Corner has brought a true taste of Central Asia to Streatham. Highly recommended!',
    rating: 5,
    date: 'April 2026',
  },
  {
    id: '3',
    name: 'Michael R.',
    role: 'London Foodie',
    content: 'Incredible hospitality and outstanding food. The Lagman noodles are perfectly hand-pulled with a rich, savory broth. A hidden gem SW16 is lucky to have.',
    rating: 5,
    date: 'June 2026',
  },
]

export function Testimonials() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="eyebrow text-gold">Reviews</div>
          <h2 className="font-display text-4xl text-navy tracking-tight">Loved by our guests</h2>
          <p className="text-navy/65 text-sm md:text-base leading-relaxed">
            Don&apos;t just take our word for it. Here is what diners are saying about their authentic Uzbek dining experience in London.
          </p>
        </div>

        {/* Global Rating Summary */}
        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-1 text-gold">
            <Star className="fill-current" size={24} />
            <Star className="fill-current" size={24} />
            <Star className="fill-current" size={24} />
            <Star className="fill-current" size={24} />
            <Star className="fill-current" size={24} />
          </div>
          <p className="text-navy font-medium text-lg">
            4.9 out of 5 stars <span className="text-navy/55 text-sm font-normal">(Based on 182 Google Reviews)</span>
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white p-8 rounded-2xl shadow-[var(--shadow-sm)] border border-navy/5 flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center gap-1 text-gold">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="fill-current" size={16} />
                  ))}
                </div>
                <p className="mt-5 text-navy/80 italic text-sm leading-relaxed">&ldquo;{t.content}&rdquo;</p>
              </div>
              <div className="mt-6 pt-6 border-t border-navy/5 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-medium text-navy tracking-wide text-sm">{t.name}</h4>
                  {t.role && <p className="text-xs text-gold/80 mt-0.5">{t.role}</p>}
                </div>
                <span className="text-xs text-navy/40">{t.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
