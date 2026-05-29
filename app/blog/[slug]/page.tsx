import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { CalendarDays, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, published: true },
  })
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt ?? post.content.slice(0, 155),
    alternates: { canonical: `https://uzbekcorner.uk/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} | Uzbek Corner London`,
      description: post.excerpt ?? post.content.slice(0, 155),
      url: `https://uzbekcorner.uk/blog/${post.slug}`,
      type: 'article',
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
      images: post.imageUrl
        ? [{ url: post.imageUrl, width: 1200, height: 630, alt: post.title }]
        : [{ url: '/og-image.png', width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt ?? post.content.slice(0, 155),
      images: [post.imageUrl ?? '/og-image.png'],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug, published: true },
  })
  if (!post) notFound()

  const settings = await prisma.restaurantSettings.findUnique({ where: { id: 1 } })

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero image */}
        {post.imageUrl && (
          <div className="relative w-full aspect-[21/9] max-h-[480px] bg-navy/10 overflow-hidden">
            <Image src={post.imageUrl} alt={post.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        <article className="mx-auto max-w-[760px] px-5 md:px-8 py-14 md:py-20">
          {/* Back link */}
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-navy/60 hover:text-navy mb-10 group">
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> All posts
          </Link>

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-navy/50 mb-4">
            <CalendarDays size={13} />
            <time dateTime={(post.publishedAt ?? post.createdAt).toISOString()}>
              {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl text-navy tracking-tight leading-tight">{post.title}</h1>
          {post.excerpt && <p className="mt-5 text-lg text-navy/65 leading-relaxed border-l-4 border-gold pl-4">{post.excerpt}</p>}

          {/* Content */}
          <div
            className="mt-10 prose prose-lg prose-navy max-w-none
              prose-headings:font-display prose-headings:text-navy
              prose-p:text-navy/75 prose-p:leading-relaxed
              prose-a:text-[color:hsl(var(--accent))] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-navy
              prose-img:rounded-xl prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* CTA */}
        <section className="bg-navy py-16 text-center">
          <div className="mx-auto max-w-[600px] px-5">
            <p className="font-display text-3xl text-white">Come taste it yourself.</p>
            <p className="mt-3 text-white/70">Book a table at Uzbek Corner London in Streatham.</p>
            <Link href="/book" className="mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gold text-navy font-medium hover:-translate-y-0.5 transition-transform">
              Reserve a table
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter
        address={settings?.address ?? '2, Central Parade, Streatham High Rd, London SW16 1HT, United Kingdom'}
        phone={settings?.phone ?? '+442034902186'}
        email={settings?.email ?? 'hello@uzbekcorner.uk'}
      />
    </>
  )
}
