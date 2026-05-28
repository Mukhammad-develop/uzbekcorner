import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { MenuManager } from '@/components/admin/menu-manager'

export const dynamic = 'force-dynamic'

export default async function AdminMenuPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/admin/login')

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { items: { orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] } },
  })

  const initial = categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    sortOrder: c.sortOrder,
    active: c.active,
    items: (c.items ?? []).map((i) => ({
      id: i.id,
      categoryId: i.categoryId,
      name: i.name,
      description: i.description,
      price: Number(i.price),
      imageUrl: i.imageUrl,
      imageKey: i.imageKey,
      sortOrder: i.sortOrder,
      available: i.available,
    })),
  }))

  return <MenuManager initialCategories={initial} />
}
