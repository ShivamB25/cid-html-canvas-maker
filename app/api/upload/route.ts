import { put } from '@vercel/blob'
import { nanoid } from 'nanoid'
import { storage } from '@/lib/storage'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as Blob
    const mimeType = formData.get('mimeType') as string
    const originalSize = parseInt(formData.get('originalSize') as string)

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Generate unique share ID
    const shareId = nanoid(8) // 8 characters for short, shareable links

    // Get filename from formData or generate one
    const filename = (file as File).name || `image-${shareId}.jpg`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    // Save metadata to in-memory storage
    const image = storage.saveImage({
      id: shareId,
      shareId,
      blobUrl: blob.url,
      filename,
      mimeType,
      fileSize: originalSize,
    })

    return NextResponse.json({
      success: true,
      shareId: image.shareId,
      blobUrl: blob.url,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
