import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BlogManager } from '@/components/admin/blog-manager'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <BlogManager
      initialPosts={posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        imageUrl: p.imageUrl,
        published: p.published,
        publishedAt: p.publishedAt?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
      }))}
    />
  )
}
