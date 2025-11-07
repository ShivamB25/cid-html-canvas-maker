'use client'

import { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import CanvasDisplay from './CanvasDisplay'

export default function ImageUploader() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setImageFile(file)
      const url = URL.createObjectURL(file)
      setImageUrl(url)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    multiple: false
  })

  const handleDownload = () => {
    if (!canvasRef.current || !imageFile) return

    // Convert canvas to blob and download
    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return

        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = imageFile.name || 'canvas-image.jpg'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      },
      imageFile.type,
      0.95
    )
  }

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }
    setImageFile(null)
    setImageUrl(null)
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {!imageUrl ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-all duration-200 ease-in-out
            ${isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-600 dark:text-gray-400">
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop your image here' : 'Drag & drop an image here'}
              </p>
              <p className="text-sm mt-2">or click to select a file</p>
              <p className="text-xs mt-2 text-gray-500">
                Supports JPG, PNG, and WebP
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <CanvasDisplay imageUrl={imageUrl} canvasRef={canvasRef} />

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Choose Different Image
            </button>
            <button
              onClick={handleDownload}
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
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
