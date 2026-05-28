import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { generatePresignedUploadUrl } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const guard = await requireAdmin(); if (guard) return guard
  try {
    const body = await req.json().catch(() => ({}))
    const fileName = String(body?.fileName ?? '').trim()
    const contentType = String(body?.contentType ?? 'image/jpeg')
    if (!fileName) return NextResponse.json({ error: 'fileName required' }, { status: 400 })
    const { uploadUrl, cloud_storage_path } = await generatePresignedUploadUrl(fileName, contentType, true)
    const region = process.env.AWS_REGION ?? 'us-west-2'
    const bucket = process.env.AWS_BUCKET_NAME ?? ''
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${cloud_storage_path}`
    return NextResponse.json({ uploadUrl, cloud_storage_path, publicUrl })
  } catch (err) {
    console.error('upload-url', err)
    return NextResponse.json({ error: 'Failed to sign upload URL' }, { status: 500 })
  }
}
