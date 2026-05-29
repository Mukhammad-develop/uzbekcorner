import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

// PATCH /api/admin/blog/[id]
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin()
  if (guard) return guard

  const body = await req.json()
  const { slug, title, excerpt, content, imageUrl, published } = body

  const existing = await prisma.blogPost.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const wasPublished = existing.published
  const nowPublished = published !== undefined ? Boolean(published) : existing.published

  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      ...(slug !== undefined && { slug }),
      ...(title !== undefined && { title }),
      ...(excerpt !== undefined && { excerpt }),
      ...(content !== undefined && { content }),
      ...(imageUrl !== undefined && { imageUrl }),
      published: nowPublished,
      publishedAt: nowPublished && !wasPublished ? new Date() : existing.publishedAt,
    },
  })
  return NextResponse.json({ post })
}

// DELETE /api/admin/blog/[id]
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin()
  if (guard) return guard

  await prisma.blogPost.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
