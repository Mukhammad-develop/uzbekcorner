import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { CalendarDays } from 'lucide-react'

import { Breadcrumb } from '@/components/site/breadcrumb'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Stories, recipes and news from Uzbek Corner London — your home for authentic Central Asian cuisine in Streatham.',
  alternates: { canonical: 'https://uzbekcorner.uk/blog' },
  openGraph: {
    title: 'Blog | Uzbek Corner London',
    description: 'Stories, recipes and news from Uzbek Corner London.',
    url: 'https://uzbekcorner.uk/blog',
  },
}

export default async function BlogPage() {
  const [posts, settings] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      select: { slug: true, title: true, excerpt: true, imageUrl: true, publishedAt: true, createdAt: true },
    }),
    prisma.restaurantSettings.findUnique({ where: { id: 1 } }),
  ])

  return (
    <>
      <SiteHeader />
      <main className="pt-28 md:pt-32">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <Breadcrumb items={[{ label: 'Blog', url: '/blog' }]} />
        </div>
        {/* Hero */}
        <section className="py-20 md:py-28 bg-[hsl(var(--bg))] mt-2">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8 text-center">
            <div className="eyebrow ornament text-navy/60">Our journal</div>
            <h1 className="mt-4 font-display text-5xl md:text-6xl tracking-tight text-navy leading-tight">
              Stories from the <span className="text-[color:hsl(var(--accent))]">kitchen</span>
            </h1>
            <p className="mt-5 text-navy/65 max-w-xl mx-auto leading-relaxed">
              Recipes, food culture and news from Uzbek Corner London — your home for authentic Central Asian cuisine in Streatham.
            </p>
          </div>
        </section>

        {/* Posts grid */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-[1200px] px-5 md:px-8">
            {posts.length === 0 ? (
              <div className="text-center py-24 text-navy/50">
                <p className="text-lg">No posts yet — check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col rounded-2xl bg-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow overflow-hidden">
                    <div className="relative aspect-[16/9] bg-navy/5 overflow-hidden">
                      {post.imageUrl ? (
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-navy/10 flex items-center justify-center">
                          <span className="font-display text-4xl text-navy/20">UC</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center gap-2 text-xs text-navy/50 mb-3">
                        <CalendarDays size={13} />
                        <time dateTime={(post.publishedAt ?? post.createdAt).toISOString()}>
                          {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </time>
                      </div>
                      <h2 className="font-display text-xl text-navy leading-snug group-hover:text-[color:hsl(var(--accent))] transition-colors">{post.title}</h2>
                      {post.excerpt && <p className="mt-3 text-sm text-navy/65 leading-relaxed line-clamp-3">{post.excerpt}</p>}
                      <span className="mt-auto pt-5 text-sm text-[color:hsl(var(--accent))] font-medium">Read more →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter
        address={settings?.address ?? '2, Central Parade, Streatham High Rd, London SW16 1HT, United Kingdom'}
        phone={settings?.phone ?? '+442034902186'}
        email={settings?.email ?? 'hello@uzbekcorner.uk'}
        instagramUrl={settings?.instagramUrl}
        facebookUrl={settings?.facebookUrl}
        tiktokUrl={settings?.tiktokUrl}
        googleBusinessUrl={settings?.googleBusinessUrl}
      />
    </>
  )
}
