import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createS3Client, getBucketConfig } from './aws-config'

export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  isPublic = false,
) {
  const { bucketName, folderPrefix } = getBucketConfig()
  const client = createS3Client()
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const cloud_storage_path = isPublic
    ? `${folderPrefix}public/uploads/${Date.now()}-${safeName}`
    : `${folderPrefix}uploads/${Date.now()}-${safeName}`

  const cmd = new PutObjectCommand({
    Bucket: bucketName,
    Key: cloud_storage_path,
    ContentType: contentType,
  })
  const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 3600 })
  return { uploadUrl, cloud_storage_path }
}

export async function getFileUrl(cloud_storage_path: string, isPublic: boolean): Promise<string> {
  const { bucketName } = getBucketConfig()
  const region = process.env.AWS_REGION ?? 'us-west-2'
  if (isPublic) {
    return `https://${bucketName}.s3.${region}.amazonaws.com/${cloud_storage_path}`
  }
  const client = createS3Client()
  const cmd = new GetObjectCommand({ Bucket: bucketName, Key: cloud_storage_path })
  return await getSignedUrl(client, cmd, { expiresIn: 3600 })
}

export async function deleteFile(cloud_storage_path: string) {
  const { bucketName } = getBucketConfig()
  const client = createS3Client()
  await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: cloud_storage_path }))
}
