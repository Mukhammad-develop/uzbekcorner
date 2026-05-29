import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BlogManager } from '@/components/admin/blog-manager'

export const dynamic = 'force-dynamic'

export default async function AdminBlogPage() {
  try {
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
  } catch (error: any) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-red-700 space-y-4">
        <h2 className="font-bold text-xl">Diagnostic: Server Exception Caught</h2>
        <p className="text-sm">Please copy and share the error details below:</p>
        <pre className="p-4 bg-white border border-red-200 rounded text-xs overflow-auto max-w-full font-mono select-all">
          {error?.stack || error?.message || String(error)}
        </pre>
      </div>
    )
  }
}
