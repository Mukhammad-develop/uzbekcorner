import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/public/blog — list published posts
export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { id: true, slug: true, title: true, excerpt: true, imageUrl: true, publishedAt: true, createdAt: true },
    orderBy: { publishedAt: 'desc' },
  })
  return NextResponse.json({ posts })
}

// POST /api/public/blog — auto-poster creates a post with API key
export async function POST(req: Request) {
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')
  const expectedKey = process.env.BLOG_API_KEY

  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { slug, title, excerpt, content, imageUrl, published } = body

  if (!slug || !title || !content) {
    return NextResponse.json({ error: 'slug, title and content are required' }, { status: 400 })
  }

  // Upsert by slug so re-posting same slug updates the post
  const post = await prisma.blogPost.upsert({
    where: { slug },
    create: {
      slug,
      title,
      excerpt: excerpt || null,
      content,
      imageUrl: imageUrl || null,
      published: published !== false,
      publishedAt: published !== false ? new Date() : null,
    },
    update: {
      title,
      excerpt: excerpt || null,
      content,
      imageUrl: imageUrl || null,
      published: published !== false,
      publishedAt: published !== false ? new Date() : null,
    },
  })
  return NextResponse.json({ post }, { status: 201 })
}
