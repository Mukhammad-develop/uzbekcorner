import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ---- Admin Users ----
  const hashedPw = await bcrypt.hash('password', 10)
  const testPw = await bcrypt.hash('johndoe123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@uzbekcorner.co.uk' },
    update: { password: hashedPw, name: 'Uzbek Corner Admin', role: 'ADMIN' },
    create: {
      email: 'admin@uzbekcorner.co.uk',
      password: hashedPw,
      name: 'Uzbek Corner Admin',
      role: 'ADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: { password: testPw, name: 'John Doe', role: 'ADMIN' },
    create: { email: 'john@doe.com', password: testPw, name: 'John Doe', role: 'ADMIN' },
  })

  // ---- Settings (singleton) ----
  await prisma.restaurantSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      slotIntervalMin: 15,
      bookingDurationMin: 60,
      inclusive: true,
      restaurantName: 'Uzbek Corner London',
      address: 'Queensway 23-25, W2 4QJ, London, United Kingdom',
      phone: '+44 20 7000 0000',
      email: 'hello@uzbekcorner.co.uk',
    },
  })

  // ---- Opening Hours ----
  // Original site: Sun 12:30-22:00, Mon/Tue 12:30-21:30, Wed closed, Thu/Fri/Sat 12:30-21:30
  const hours: { dayOfWeek: number; openTime: string; closeTime: string; closed: boolean }[] = [
    { dayOfWeek: 0, openTime: '12:30', closeTime: '22:00', closed: false }, // Sun
    { dayOfWeek: 1, openTime: '12:30', closeTime: '21:30', closed: false }, // Mon
    { dayOfWeek: 2, openTime: '12:30', closeTime: '21:30', closed: false }, // Tue
    { dayOfWeek: 3, openTime: '12:30', closeTime: '21:30', closed: true  }, // Wed
    { dayOfWeek: 4, openTime: '12:30', closeTime: '21:30', closed: false }, // Thu
    { dayOfWeek: 5, openTime: '12:30', closeTime: '21:30', closed: false }, // Fri
    { dayOfWeek: 6, openTime: '12:30', closeTime: '21:30', closed: false }, // Sat
  ]
  for (const h of hours) {
    await prisma.openingHour.upsert({
      where: { dayOfWeek: h.dayOfWeek },
      update: { openTime: h.openTime, closeTime: h.closeTime, closed: h.closed },
      create: h,
    })
  }

  // ---- Tables ----
  const tables = [
    { label: 'T1 — Window (2)', capacity: 2, sortOrder: 1 },
    { label: 'T2 — Window (2)', capacity: 2, sortOrder: 2 },
    { label: 'T3 — Corner (4)', capacity: 4, sortOrder: 3 },
    { label: 'T4 — Centre (4)', capacity: 4, sortOrder: 4 },
    { label: 'T5 — Booth (4)', capacity: 4, sortOrder: 5 },
    { label: 'T6 — Family (6)', capacity: 6, sortOrder: 6 },
    { label: 'T7 — Back Room (8)', capacity: 8, sortOrder: 7 },
  ]
  for (const t of tables) {
    const existing = await prisma.table.findFirst({ where: { label: t.label } })
    if (!existing) await prisma.table.create({ data: t })
  }

  // ---- Notification Emails ----
  await prisma.notificationEmail.upsert({
    where: { email: 'admin@uzbekcorner.co.uk' },
    update: {},
    create: { email: 'admin@uzbekcorner.co.uk' },
  })

  // ---- Menu ----
  const categories = [
    { name: 'Starters', description: 'Warm welcomes from Central Asia', sortOrder: 1 },
    { name: 'Soups', description: 'Bowls to warm the soul', sortOrder: 2 },
    { name: 'Main Courses', description: 'Signatures from the tandoor and hearth', sortOrder: 3 },
    { name: 'Grill', description: 'Shashlik, skewered over open charcoal', sortOrder: 4 },
    { name: 'Salads & Sides', description: 'Fresh, bright, simply dressed', sortOrder: 5 },
    { name: 'Desserts & Tea', description: 'Finish with sweet honey notes', sortOrder: 6 },
  ]
  const categoryMap: Record<string, string> = {}
  for (const c of categories) {
    const existing = await prisma.category.findFirst({ where: { name: c.name } })
    const row = existing
      ? await prisma.category.update({ where: { id: existing.id }, data: c })
      : await prisma.category.create({ data: c })
    categoryMap[c.name] = row.id
  }

  const items: { name: string; description: string; price: number; imageUrl: string; category: string; sortOrder: number }[] = [
    { name: 'Somsa', description: 'Flaky pastry filled with lamb, onions & herbs, baked in the tandoor.', price: 4.50, imageUrl: 'https://thefoodhog.com/wp-content/uploads/2021/01/uzbek-samsa.jpg', category: 'Starters', sortOrder: 1 },
    { name: 'Achichuk Salad', description: 'Ripe tomato, cucumber, red onion, coriander — a Central Asian classic.', price: 5.50, imageUrl: 'https://uzbekparty.com/wp-content/uploads/2024/02/ACHICHUK-SALAD-1.jpg', category: 'Starters', sortOrder: 2 },
    { name: 'Non (Tandoor Bread)', description: 'Traditional round Uzbek bread, stamped and baked fresh.', price: 3.50, imageUrl: 'https://tasteofartisan.com/wp-content/uploads/2021/06/Uzbek-bread-obi-non-lepeshka-in-the-oven-crispy.jpg', category: 'Starters', sortOrder: 3 },
    { name: 'Borsch', description: 'Hearty beetroot & beef broth, smetana and dill.', price: 6.90, imageUrl: 'https://media.houseandgarden.co.uk/photos/6189406cd9ae96d083cd0d7a/1:1/w_1500,h_1500,c_limit/20180621_saltandtime_day4_borsch_040.jpg', category: 'Soups', sortOrder: 1 },
    { name: 'Lagman', description: 'Hand-pulled noodles with slow-cooked lamb, peppers and garlic broth.', price: 11.50, imageUrl: 'https://www.allrecipes.com/thmb/kACQLfnolBRCJulZAdKOlRiJhpQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Lagman-Uzbek-Noodle-Soup-07-2000-0ee85d31c9824951a37340832d25dafe.jpg', category: 'Soups', sortOrder: 2 },
    { name: 'Plov', description: 'Our signature — rice, lamb, carrots, garlic and sultanas slow-cooked in the kazan.', price: 13.90, imageUrl: 'https://www.allrecipes.com/thmb/m6YXFp58z7PofDxNbHx_QEsni0E=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/4580553-2998dabe4f724ab79011677bad29a5c7.jpg', category: 'Main Courses', sortOrder: 1 },
    { name: 'Manti', description: 'Hand-folded lamb dumplings, steamed and served with smetana.', price: 12.50, imageUrl: 'https://cannedexperience.com/wp-content/uploads/2025/01/manti-served-in-a-black-bowl1-scaled-1920x1920.jpeg', category: 'Main Courses', sortOrder: 2 },
    { name: 'Shashlik — Lamb', description: 'Skewered lamb shoulder, charcoal-grilled with cumin & onion.', price: 13.50, imageUrl: 'https://petersfoodadventures.com/wp-content/uploads/2017/02/shashlik-recipes.jpg', category: 'Grill', sortOrder: 1 },
    { name: 'Shashlik — Chicken', description: 'Marinated chicken thigh skewers, smoky and tender.', price: 11.90, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=1200&q=80', category: 'Grill', sortOrder: 2 },
    { name: 'Shashlik Platter', description: 'A generous mixed platter of lamb, chicken and kofta over charcoal.', price: 24.00, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80', category: 'Grill', sortOrder: 3 },
    { name: 'Uzbek Piala Tea', description: 'Green or black leaf tea served in the traditional piala bowl.', price: 2.90, imageUrl: 'https://i.etsystatic.com/62796786/r/il/eddaca/7906206501/il_fullxfull.7906206501_2a5a.jpg', category: 'Desserts & Tea', sortOrder: 1 },
    { name: 'Chak-Chak', description: 'Fried dough pieces bound in honey — sweet, sticky and golden.', price: 5.50, imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=1200&q=80', category: 'Desserts & Tea', sortOrder: 2 },
  ]
  for (const it of items) {
    const cid = categoryMap[it.category]
    if (!cid) continue
    const existing = await prisma.menuItem.findFirst({ where: { name: it.name } })
    const data = {
      categoryId: cid,
      name: it.name,
      description: it.description,
      price: it.price,
      imageUrl: it.imageUrl,
      sortOrder: it.sortOrder,
      available: true,
    }
    if (existing) await prisma.menuItem.update({ where: { id: existing.id }, data })
    else await prisma.menuItem.create({ data })
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
