'use client'

import ImageUploader from '@/components/ImageUploader'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Canvas Image Viewer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload your images, preview them on HTML Canvas, and download them to your device.
            Supports JPG, PNG, and WebP formats.
          </p>
        </div>

        {/* Main Content */}
        <ImageUploader />

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-500 pt-8">
          <p>Built with Next.js and HTML5 Canvas</p>
        </div>
      </div>
    </main>
  )
}
