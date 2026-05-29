import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    // 1. Check x-api-key matches .env
    const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')
    const expectedKey = process.env.BLOG_API_KEY

    if (!expectedKey || apiKey !== expectedKey) {
      return NextResponse.json({ error: 'wrong API key' }, { status: 401 })
    }

    // Parse form data natively
    const formData = await req.formData().catch(() => null)
    if (!formData) {
      return NextResponse.json({ error: 'not an image or too big' }, { status: 400 })
    }

    const file = formData.get('file') as File | null
    const slugInput = formData.get('slug') as string | null
    const slug = slugInput ? slugInput.trim() : 'blog-upload'

    if (!file) {
      return NextResponse.json({ error: 'not an image or too big' }, { status: 400 })
    }

    // 2. Check file is image (JPG, PNG, WebP only)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'not an image or too big' }, { status: 400 })
    }

    // 3. Check file size under 2MB
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'not an image or too big' }, { status: 400 })
    }

    // 4. Generate filename: {slug}-{timestamp}.jpg
    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'upload'
    const timestamp = Date.now()
    const filename = `${cleanSlug}-${timestamp}.jpg`

    // 5. Save to /public/images/blog/
    const publicDir = path.resolve(process.cwd(), 'public/images/blog')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    const filePath = path.join(publicDir, filename)
    
    // Read array buffer and write locally
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(filePath, buffer)

    // 6. Return JSON: {"url": "/images/blog/filename.jpg"}
    return NextResponse.json({ url: `/images/blog/${filename}` }, { status: 200 })
  } catch (err) {
    console.error('Image upload error:', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
