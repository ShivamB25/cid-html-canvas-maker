import { notFound } from 'next/navigation'
import { storage } from '@/lib/storage'
import ImageViewer from './ImageViewer'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ imageId: string }>
}

export default async function SharedImagePage({ params }: PageProps) {
  const { imageId } = await params

  // Fetch image from in-memory storage
  const image = storage.getImage(imageId)

  if (!image) {
    notFound()
  }

  // Increment view count
  storage.incrementViews(imageId)

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Upload New Image
          </Link>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Views: {image.views + 1}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Shared Image</h1>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Filename: {image.filename}</p>
              <p>Uploaded: {new Date(image.uploadedAt).toLocaleDateString()}</p>
              <p>Size: {(image.fileSize / 1024).toFixed(2)} KB</p>
            </div>
          </div>

          <ImageViewer imageUrl={image.blobUrl} filename={image.filename} />

          <div className="flex gap-3 justify-center pt-4">
            <a
              href={image.blobUrl}
              download={image.filename}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download Image
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
