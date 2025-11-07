'use client'

import { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import CanvasDisplay from './CanvasDisplay'

interface ImageUploaderProps {
  onUploadSuccess?: (shareUrl: string) => void
}

export default function ImageUploader({ onUploadSuccess }: ImageUploaderProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setError(null)
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

  const handleUpload = async () => {
    if (!canvasRef.current || !imageFile) return

    setIsUploading(true)
    setError(null)

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current?.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to convert canvas to blob'))
          },
          imageFile.type,
          0.95
        )
      })

      // Create FormData and send to API
      const formData = new FormData()
      formData.append('file', blob, imageFile.name)
      formData.append('mimeType', imageFile.type)
      formData.append('originalSize', imageFile.size.toString())

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      const shareUrl = `${window.location.origin}/${data.shareId}`

      onUploadSuccess?.(shareUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    setImageFile(null)
    setImageUrl(null)
    setError(null)
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }
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

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              disabled={isUploading}
            >
              Choose Different Image
            </button>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? 'Uploading...' : 'Upload & Share'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
