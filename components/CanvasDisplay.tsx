'use client'

import { useEffect, useRef, RefObject } from 'react'

interface CanvasDisplayProps {
  imageUrl: string
  canvasRef: RefObject<HTMLCanvasElement | null>
  className?: string
}

export default function CanvasDisplay({ imageUrl, canvasRef, className = '' }: CanvasDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous' // Handle CORS if needed

    img.onload = () => {
      // Calculate canvas dimensions to fit the image while maintaining aspect ratio
      const maxWidth = containerRef.current?.clientWidth || 800
      const maxHeight = 600

      let width = img.width
      let height = img.height

      // Scale down if image is larger than max dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Clear canvas and draw image
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
    }

    img.onerror = () => {
      console.error('Failed to load image')
    }

    img.src = imageUrl

    return () => {
      // Cleanup: revoke object URL if it exists
      if (imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl, canvasRef])

  return (
    <div ref={containerRef} className={`flex justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
      />
    </div>
  )
}
