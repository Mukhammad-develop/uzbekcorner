import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

// GET /api/admin/blog — list all posts
export async function GET() {
  const guard = await requireAdmin()
  if (guard) return guard

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ posts })
}

// POST /api/admin/blog — create post
export async function POST(req: Request) {
  const guard = await requireAdmin()
  if (guard) return guard

  const body = await req.json()
  const { slug, title, excerpt, content, imageUrl, published } = body

  if (!slug || !title || !content) {
    return NextResponse.json({ error: 'slug, title and content are required' }, { status: 400 })
  }

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title,
      excerpt: excerpt || null,
      content,
      imageUrl: imageUrl || null,
      published: Boolean(published),
      publishedAt: published ? new Date() : null,
    },
  })
  return NextResponse.json({ post }, { status: 201 })
}
