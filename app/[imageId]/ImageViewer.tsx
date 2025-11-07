'use client'

import { useRef } from 'react'
import CanvasDisplay from '@/components/CanvasDisplay'

interface ImageViewerProps {
  imageUrl: string
  filename: string
}

export default function ImageViewer({ imageUrl, filename }: ImageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  return (
    <div className="space-y-4">
      <CanvasDisplay imageUrl={imageUrl} canvasRef={canvasRef} />
    </div>
  )
}
