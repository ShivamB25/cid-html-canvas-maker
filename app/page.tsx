'use client'

import { useState } from 'react'
import ImageUploader from '@/components/ImageUploader'
import ShareLink from '@/components/ShareLink'

export default function Home() {
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  const handleUploadSuccess = (url: string) => {
    setShareUrl(url)
  }

  const handleReset = () => {
    setShareUrl(null)
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Canvas Image Uploader
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload your images, preview them on HTML Canvas, and get a shareable link instantly.
            Supports JPG, PNG, and WebP formats.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {shareUrl ? (
            <div className="space-y-6">
              <ShareLink url={shareUrl} />
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Upload Another Image
                </button>
              </div>
            </div>
          ) : (
            <ImageUploader onUploadSuccess={handleUploadSuccess} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-500 pt-8">
          <p>Built with Next.js, Vercel Blob Storage, and PostgreSQL</p>
        </div>
      </div>
    </main>
  )
}
